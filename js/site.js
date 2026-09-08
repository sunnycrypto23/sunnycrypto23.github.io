// ===== Loader: hide once page has loaded =====
window.addEventListener('load', function(){
  setTimeout(function(){
    document.getElementById('loader').classList.add('hide');
  }, 700);
});

// ===== Theme toggle: switchable light/dark, persisted =====
(function(){
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    localStorage.setItem('sm-theme', theme);
  }

  const saved = localStorage.getItem('sm-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  toggleBtn.addEventListener('click', function(){
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();

// ===== Course filter =====
(function(){
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.course-card');
  buttons.forEach(btn=>{
    btn.addEventListener('click', function(){
      buttons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card=>{
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });
})();
