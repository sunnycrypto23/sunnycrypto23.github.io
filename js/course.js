document.addEventListener('DOMContentLoaded', async function() {
  // 1. Initialize the Progress Tracker
  await ProgressTracker.init();

  const urlParams = new URLSearchParams(window.location.search);
  const courseCode = urlParams.get('code');

  if (!courseCode) {
    document.getElementById('course-title-display').textContent = 'Course not found.';
    return;
  }

  // 2. Fetch Data
  fetch('data/courses.json')
    .then(response => response.json())
    .then(data => {
      const course = data.courses.find(c => c.code.toLowerCase().replace(/\s+/g, '') === courseCode.toLowerCase().replace(/\s+/g, ''));

      if (!course) {
        document.getElementById('course-title-display').textContent = 'Course not found.';
        return;
      }

      // 3. Populate Header
      document.getElementById('course-code-display').textContent = course.code;
      document.title = `${course.code} — Sunday.Michael`;
      document.getElementById('course-title-display').textContent = `${course.code}: ${course.name}`;
      document.getElementById('course-desc-display').textContent = course.description;

      // 4. Render Modules & Update Progress
      renderModules(course);
      updateProgressUI(course.code, course.modules.length);

    })
    .catch(error => {
      console.error('Error loading course data:', error);
    });

  // --- Helper Functions ---

  function renderModules(course) {
    const moduleContainer = document.getElementById('module-list-container');
    moduleContainer.innerHTML = '';
    const codeSlug = course.code.toLowerCase().replace(/\s+/g, '');

    if (course.modules && course.modules.length > 0) {
      const list = document.createElement('div');
      list.className = 'module-list';

      course.modules.forEach((module, index) => {
        const isDone = ProgressTracker.isComplete(codeSlug, module.id);
        
        const row = document.createElement('div');
        row.className = `module-row ${isDone ? 'complete' : ''}`;
        row.style.cursor = 'pointer';

        // Toggle logic on click
        row.addEventListener('click', function() {
          ProgressTracker.toggle(codeSlug, module.id);
          renderModules(course); // Re-render to update UI
          updateProgressUI(course.code, course.modules.length); // Update top bar
        });

        // Icon logic
        let iconHtml = isDone 
          ? '<span class="material-symbols-outlined" style="font-size:16px;">check_circle</span>' 
          : '<span class="material-symbols-outlined" style="font-size:16px;">radio_button_unchecked</span>';

        row.innerHTML = `
          <div class="module-left" style="flex-grow: 1;">
            <div class="module-icon ${isDone ? 'complete' : 'not-started'}">${iconHtml}</div>
            <span class="module-title">Module ${index + 1}: ${module.title}</span>
          </div>
          <a href="lecture.html?code=${codeSlug}&module=${module.id}" class="view-btn" style="margin-left: 1rem; color: var(--sage); font-size: 13px; font-weight: 600; text-decoration: none;">
            View
          </a>
        `;
        list.appendChild(row);
      });

      moduleContainer.appendChild(list);
    } else {
      moduleContainer.innerHTML = '<p style="color: var(--text-muted);">No modules added yet.</p>';
    }
  }

  function updateProgressUI(code, total) {
    const codeSlug = code.toLowerCase().replace(/\s+/g, '');
    const pct = ProgressTracker.getPercentage(codeSlug, total);
    
    document.getElementById('course-progress-pct').textContent = `${pct}%`;
    document.getElementById('course-progress-bar').style.width = `${pct}%`;
  }
});
