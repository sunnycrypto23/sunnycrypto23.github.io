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
      document.getElementById('lecture-body').innerHTML = module.content;

      // Render Video if available
      if (module.video_url) {
        const videoSection = document.getElementById('video-section');
        const videoContainer = document.getElementById('video-container');
        videoContainer.innerHTML = `<iframe src="${module.video_url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        videoSection.style.display = 'block';
      }

      // Render Flashcards if available
      if (module.flashcards && module.flashcards.length > 0) {
        const flashcardsSection = document.getElementById('flashcards-section');
        const flashcardsContainer = document.getElementById('flashcards-container');
        
        flashcardsContainer.innerHTML = module.flashcards.map((card, index) => `
          <div class="flashcard" onclick="this.classList.toggle('flipped')">
            <div class="flashcard-inner">
              <div class="flashcard-front">
                <div class="flashcard-term">Term ${index + 1}</div>
                <div class="flashcard-content">${card.term}</div>
                <div class="flashcard-hint">Click to flip</div>
              </div>
              <div class="flashcard-back">
                <div class="flashcard-content">${card.definition}</div>
              </div>
            </div>
          </div>
        `).join('');
        
        flashcardsSection.style.display = 'block';
      }

      // Render Feynman Prompt if available
      if (module.feynman_prompt) {
        const feynmanSection = document.getElementById('feynman-section');
        document.getElementById('feynman-prompt').textContent = module.feynman_prompt;
        feynmanSection.style.display = 'block';
      }

      // Render Micro Quiz if available
      if (module.micro_quiz && module.micro_quiz.length > 0) {
        const quizSection = document.getElementById('quiz-section');
        const quizContainer = document.getElementById('quiz-container');
        
        quizContainer.innerHTML = module.micro_quiz.map((q, qIndex) => `
          <div class="quiz-item" data-index="${qIndex}">
            <div class="quiz-question">Q${qIndex + 1}: ${q.question}</div>
            <div class="quiz-options">
              ${q.options.map((opt, optIndex) => `
                <div class="quiz-option" data-index="${optIndex}" onclick="selectQuizOption(${qIndex}, ${optIndex})">
                  ${String.fromCharCode(65 + optIndex)}. ${opt}
                </div>
              `).join('')}
            </div>
            <div class="quiz-explanation" id="explanation-${qIndex}">
              <strong>Explanation:</strong> ${q.explanation}
            </div>
          </div>
        `).join('');
        
        quizSection.style.display = 'block';
      }

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
        nextBtn.style.visibility = 'hidden';
      }
    })
    .catch(error => {
      console.error('Error loading lecture data:', error);
      document.getElementById('lecture-body').innerHTML = '<p style="color: var(--text-muted);">Error loading content.</p>';
    });
});

// Global function for quiz option selection
window.selectQuizOption = function(questionIndex, selectedIndex) {
  const quizItem = document.querySelector(`.quiz-item[data-index="${questionIndex}"]`);
  const options = quizItem.querySelectorAll('.quiz-option');
  const explanation = document.getElementById(`explanation-${questionIndex}`);
  
  // Find the correct answer from the JSON
  fetch('data/courses.json')
    .then(res => res.json())
    .then(data => {
      const urlParams = new URLSearchParams(window.location.search);
      const courseCode = urlParams.get('code');
      const moduleId = parseInt(urlParams.get('module'));
      
      const course = data.courses.find(c => c.code.toLowerCase().replace(/\s+/g, '') === courseCode.toLowerCase().replace(/\s+/g, ''));
      const module = course.modules.find(m => m.id === moduleId);
      const question = module.micro_quiz[questionIndex];
      
      // Disable all options
      options.forEach(opt => opt.classList.add('disabled'));
      
      // Mark correct/incorrect
      options.forEach((opt, idx) => {
        if (idx === question.correct) {
          opt.classList.add('correct');
        } else if (idx === selectedIndex && idx !== question.correct) {
          opt.classList.add('incorrect');
        }
      });
      
      // Show explanation
      explanation.classList.add('visible');
    });
};
