document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseCode = urlParams.get('code');
  const moduleId = parseInt(urlParams.get('module'));

  if (!courseCode || !moduleId) {
    document.getElementById('lecture-title').textContent = 'Module not found.';
    return;
  }

  fetch('data/courses.json')
    .then(response => response.json())
    .then(data => {
      const course = data.courses.find(c => c.code.toLowerCase().replace(/\s+/g, '') === courseCode.toLowerCase().replace(/\s+/g, ''));

      if (!course) {
        document.getElementById('lecture-title').textContent = 'Course not found.';
        return;
      }

      const module = course.modules.find(m => m.id === moduleId);

      if (!module) {
        document.getElementById('lecture-title').textContent = 'Module not found.';
        return;
      }

      // Populate Page
      document.title = `${course.code}: ${module.title} — Sunday.Michael`;
      document.getElementById('breadcrumb-course').textContent = course.code;
      document.getElementById('breadcrumb-course').href = `course.html?code=${courseCode}`;
      document.getElementById('breadcrumb-module').textContent = `Module ${module.id}`;
      
      const badge = document.getElementById('lecture-badge');
      badge.textContent = course.code;
      badge.className = `subject-badge ${course.category}`;
      
      document.getElementById('lecture-title').textContent = `Module ${module.id}: ${module.title}`;
      document.getElementById('lecture-course-name').textContent = course.name;
      document.getElementById('lecture-body').innerHTML = `<p>${module.content}</p>`;

      // Handle Previous/Next Buttons
      const prevBtn = document.getElementById('prev-module-btn');
      const nextBtn = document.getElementById('next-module-btn');

      if (moduleId > 1) {
        prevBtn.href = `lecture.html?code=${courseCode}&module=${moduleId - 1}`;
        prevBtn.style.visibility = 'visible';
      }

      if (moduleId < course.modules.length) {
        nextBtn.href = `lecture.html?code=${courseCode}&module=${moduleId + 1}`;
        nextBtn.style.visibility = 'visible';
      } else {
        nextBtn.style.visibility = 'hidden'; // Last module
      }
    })
    .catch(error => {
      console.error('Error loading lecture data:', error);
      document.getElementById('lecture-body').innerHTML = '<p style="color: var(--text-muted);">Error loading content.</p>';
    });
});
