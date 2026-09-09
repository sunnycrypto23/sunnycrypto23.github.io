document.addEventListener('DOMContentLoaded', function() {
  const homeGrid = document.getElementById('home-course-grid');
  if (!homeGrid) return; // Only run this on the homepage

  fetch('data/courses.json')
    .then(response => response.json())
    .then(data => {
      // Grab the first 3 courses from the JSON (your "latest" or most important)
      const featuredCourses = data.courses.slice(0, 3);
      
      homeGrid.innerHTML = featuredCourses.map(course => {
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
                <span class="task"><span class="material-symbols-outlined" style="font-size:16px;color:var(--sage);">assignment</span>${course.modules.length} Modules</span>
                <a class="notes-link" href="course.html?code=${codeSlug}">Continue <span class="material-symbols-outlined" style="font-size:14px;">chevron_right</span></a>
              </div>
            </div>
          </div>
        `;
      }).join('');
    })
    .catch(error => {
      console.error('Error loading home courses:', error);
      homeGrid.innerHTML = '<p style="color:var(--text-muted);">Loading courses...</p>';
    });
});
