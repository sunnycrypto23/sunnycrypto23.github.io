"""Reads the triggering comment from an env var and writes just the
instruction text (with the leading '/ai ' stripped) to /tmp/instruction.txt.
Kept as its own script rather than inline YAML to avoid quoting/indentation
problems when editing the workflow file."""

import os

body = os.environ["COMMENT_BODY"]
instruction = body[4:].strip()  # strip leading "/ai "

with open("/tmp/instruction.txt", "w") as f:
    f.write(instruction)
