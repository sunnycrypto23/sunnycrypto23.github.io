// ===== Course Page Logic =====
document.addEventListener('DOMContentLoaded', function() {
  // 1. Get the course code from the URL (e.g., ?code=csc104)
  const urlParams = new URLSearchParams(window.location.search);
  const courseCode = urlParams.get('code');

  if (!courseCode) {
    document.getElementById('course-title-display').textContent = 'Course not found.';
    return;
  }

  // 2. Fetch the JSON data
  fetch('data/courses.json')
    .then(response => response.json())
    .then(data => {
      // Find the matching course (case-insensitive)
      const course = data.courses.find(c => c.code.toLowerCase().replace(/\s+/g, '') === courseCode.toLowerCase().replace(/\s+/g, ''));

      if (!course) {
        document.getElementById('course-title-display').textContent = 'Course not found.';
        document.getElementById('module-list-container').innerHTML = '';
        return;
      }

      // 3. Populate the page with course data
      document.getElementById('course-code-display').textContent = course.code;
      document.title = `${course.code} — Sunday.Michael`;
      document.getElementById('course-title-display').textContent = `${course.code}: ${course.name}`;
      document.getElementById('course-desc-display').textContent = course.description;
      document.getElementById('course-progress-pct').textContent = `${course.progress}%`;
      document.getElementById('course-progress-bar').style.width = `${course.progress}%`;

      // 4. Build the Module List
      const moduleContainer = document.getElementById('module-list-container');
      moduleContainer.innerHTML = ''; // Clear loading text

      if (course.modules && course.modules.length > 0) {
        const list = document.createElement('div');
        list.className = 'module-list';

        course.modules.forEach((module, index) => {
          const row = document.createElement('a');
          row.className = `module-row ${module.status === 'current' ? 'active' : ''}`;
          // Link to the future lecture page
          row.href = `lecture.html?code=${courseCode.toLowerCase().replace(/\s+/g, '')}&module=${module.id}`;

          // Determine icon based on status
          let iconHtml = '';
          if (module.status === 'complete') {
            iconHtml = '<span class="material-symbols-outlined" style="font-size:16px;">check</span>';
          } else if (module.status === 'current') {
            iconHtml = '<span class="material-symbols-outlined" style="font-size:16px;">play_arrow</span>';
          } else {
            iconHtml = '<span class="material-symbols-outlined" style="font-size:16px;">circle</span>';
          }

          row.innerHTML = `
            <div class="module-left">
              <div class="module-icon ${module.status}">${iconHtml}</div>
              <span class="module-title">Module ${index + 1}: ${module.title}</span>
            </div>
            <span class="material-symbols-outlined module-arrow">chevron_right</span>
          `;
          list.appendChild(row);
        });

        moduleContainer.appendChild(list);
      } else {
        moduleContainer.innerHTML = '<p style="color: var(--text-muted);">No modules added yet.</p>';
      }
    })
    .catch(error => {
      console.error('Error loading course data:', error);
      document.getElementById('module-list-container').innerHTML = '<p style="color: var(--text-muted);">Error loading course data.</p>';
    });
});
