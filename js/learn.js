document.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('course-grid');
  const searchInput = document.getElementById('course-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let allCourses = [];
  let currentFilter = 'all';

  // 1. Fetch data and render
  fetch('data/courses.json')
    .then(response => response.json())
    .then(data => {
      allCourses = data.courses;
      renderCourses(allCourses);
    })
    .catch(error => {
      console.error('Error loading courses:', error);
      grid.innerHTML = '<p style="color:var(--text-muted);">Error loading course data.</p>';
    });

  // 2. Render function
  function renderCourses(courses) {
    if (courses.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);">No courses found.</p>';
      return;
    }

    grid.innerHTML = courses.map(course => {
      const codeSlug = course.code.toLowerCase().replace(/\s+/g, '');
      const isNotStarted = course.progress === 0;
      
      return `
        <div class="course-card" data-category="${course.category}">
          <div class="card-top">
            <div class="card-badges">
              <span class="subject-badge ${course.category}">${course.code}</span>
              <span class="status-label ${isNotStarted ? 'not-started' : ''}">${course.status}</span>
            </div>
            <h3 class="course-title">${course.name}</h3>
            <p class="course-desc">${course.description}</p>
          </div>
          <div class="card-bottom">
            <div>
              <div class="card-progress-row">
                <span>Progress</span>
                <span class="pct ${isNotStarted ? 'zero' : ''}">${course.progress}%</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${course.progress}%; ${isNotStarted ? 'background:var(--state-neutral-text);' : ''}"></div>
              </div>
            </div>
            <div class="card-meta">
              <span class="task"><span class="material-symbols-outlined" style="font-size:16px;color:var(--sage);">assignment</span>View Modules</span>
              <a class="notes-link" href="course.html?code=${codeSlug}">Notes <span class="material-symbols-outlined" style="font-size:14px;">chevron_right</span></a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Filter logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // 4. Search logic
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  function applyFilters() {
    const term = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = allCourses.filter(course => {
      const matchesFilter = currentFilter === 'all' || course.category === currentFilter;
      const matchesSearch = course.name.toLowerCase().includes(term) || course.code.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
    renderCourses(filtered);
  }
});
