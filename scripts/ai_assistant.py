"""
AI Code Assistant — runs inside the GitHub Action.

Takes a plain-English instruction, sends the repo context to Gemini,
and applies the returned file changes to disk. The Action's own
create-pull-request step then commits and opens a PR — this script
never pushes or merges anything itself.

SECURITY DESIGN NOTES (read before changing this file):
- BLOCKED_PATH_PREFIXES stops the AI from ever writing to workflow
  files, env files, or anything secret-shaped. This is the main
  defense against the AI (accidentally or via a manipulated prompt)
  granting itself more permissions or exfiltrating secrets.
- The Gemini API key is read from the environment only. It is
  never included in any prompt, file content, or printed output.
- MAX_FILES / MAX_FILE_BYTES caps keep a single run from silently
  rewriting the entire repo or blowing through API costs.
"""

import os
import sys
import json
import re
from pathlib import Path

import google.generativeai as genai

REPO_ROOT = Path(".").resolve()

# Anything matching these prefixes can NEVER be created or modified by
# the AI, no matter what the instruction says.
BLOCKED_PATH_PREFIXES = (
    ".github/workflows/",
    ".github/",
    ".env",
    "secrets",
    ".git/",
)

MAX_FILES_IN_CONTEXT = 40
MAX_FILE_BYTES = 20_000       # skip huge files when building context
MAX_FILES_TO_CHANGE = 8       # refuse a response that touches more than this
MODEL = "gemini-3.6-flash"    # free-tier eligible model


def is_blocked_path(path: str) -> bool:
    normalized = path.replace("\\", "/").lstrip("/")
    if ".." in normalized.split("/"):
        return True  # no path traversal
    return any(normalized.startswith(p) for p in BLOCKED_PATH_PREFIXES)


def collect_repo_context() -> str:
    """Build a lightweight text snapshot of the repo for the model."""
    chunks = []
    count = 0
    for path in sorted(REPO_ROOT.rglob("*")):
        if count >= MAX_FILES_IN_CONTEXT:
            break
        if path.is_dir():
            continue
        rel = str(path.relative_to(REPO_ROOT))
        if is_blocked_path(rel) or "/node_modules/" in f"/{rel}" or rel.startswith("node_modules/"):
            continue
        try:
            if path.stat().st_size > MAX_FILE_BYTES:
                continue
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue  # skip binaries / unreadable files
        chunks.append(f"--- FILE: {rel} ---\n{text}")
        count += 1
    return "\n\n".join(chunks)


def call_gemini(instruction: str, repo_context: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    genai.configure(api_key=api_key)

    system_prompt = (
        "You are a careful software engineer making a small, focused change "
        "to a repository. You will be given the repo's current files and an "
        "instruction. Respond with ONLY a JSON object, no prose, no markdown "
        "fences, in this exact shape:\n"
        '{"summary": "one paragraph describing the change", '
        '"files": [{"path": "relative/path.ext", "content": "full new file content"}]}\n'
        "Rules:\n"
        "- Only include files that actually need to change or be created.\n"
        "- Never touch anything under .github/, .env files, or files with "
        "'secret' in the name — you have no ability to do so regardless.\n"
        "- Prefer the smallest correct change over a rewrite.\n"
        "- If the instruction is unclear or unsafe to act on, return an "
        'empty "files" list and explain why in "summary".'
    )

    model = genai.GenerativeModel(
        model_name=MODEL,
        system_instruction=system_prompt,
        generation_config={"response_mime_type": "application/json"},
    )

    user_message = (
        f"INSTRUCTION:\n{instruction}\n\n"
        f"CURRENT REPO FILES:\n{repo_context}"
    )

    response = model.generate_content(user_message)
    raw_text = response.text or ""

    # Belt-and-suspenders: strip markdown fences even though JSON mode
    # should already prevent them.
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        print("ERROR: model did not return valid JSON:", file=sys.stderr)
        print(raw_text, file=sys.stderr)
        sys.exit(1)


def apply_changes(result: dict) -> None:
    files = result.get("files", [])
    summary = result.get("summary", "")

    if len(files) > MAX_FILES_TO_CHANGE:
        print(
            f"Refusing to apply: model tried to change {len(files)} files "
            f"(limit is {MAX_FILES_TO_CHANGE}).",
            file=sys.stderr,
        )
        sys.exit(1)

    applied = []
    for f in files:
        rel_path = f.get("path", "")
        content = f.get("content", "")
        if not rel_path or is_blocked_path(rel_path):
            print(f"Skipping blocked or invalid path: {rel_path}", file=sys.stderr)
            continue
        full_path = REPO_ROOT / rel_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")
        applied.append(rel_path)

    print(f"Summary: {summary}")
    print(f"Files changed: {applied}")

    if not applied:
        print("No files were changed — nothing to open a PR for.")


def main():
    if len(sys.argv) < 2:
        print("Usage: ai_assistant.py '<instruction>'", file=sys.stderr)
        sys.exit(1)

    instruction = sys.argv[1]
    repo_context = collect_repo_context()
    result = call_gemini(instruction, repo_context)
    apply_changes(result)


if __name__ == "__main__":
    main()
