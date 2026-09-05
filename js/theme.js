(function () {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  let toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) {
    const nav = document.querySelector('nav.site-nav');
    if (nav) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'theme-toggle';
      toggleBtn.className = 'theme-toggle';
      toggleBtn.type = 'button';
      nav.appendChild(toggleBtn);
    }
  }
  if (!toggleBtn) return;

  function updateToggleState() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
    toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    toggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  updateToggleState();

  toggleBtn.addEventListener('click', function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    updateToggleState();
  });
});
