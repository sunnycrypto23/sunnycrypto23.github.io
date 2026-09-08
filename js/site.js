// ===== 1. LOADER: Failsafe hide =====
window.addEventListener('load', function() {
  setTimeout(function() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hide');
    }
  }, 700);
});

// ===== 2. THEME TOGGLE: Safe execution =====
(function() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (icon) {
      icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    localStorage.setItem('sm-theme', theme);
  }
  
  const saved = localStorage.getItem('sm-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      const current = root.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
})();

// ===== 3. COURSE FILTER: Safe execution =====
(function() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.course-card');
  
  if (buttons.length > 0 && cards.length > 0) {
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        cards.forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  }
})();

// ===== 4. MOBILE MENU TOGGLE =====
(function() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
      // Toggle aria-expanded for accessibility
      const isExpanded = mobileNav.classList.contains('is-open');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });
  }
})();
