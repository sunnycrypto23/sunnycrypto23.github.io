document.addEventListener('DOMContentLoaded', function() {
  const app = document.getElementById('quiz-app');
  const urlParams = new URLSearchParams(window.location.search);
  const courseParam = urlParams.get('course');

  let currentQuiz = null;
  let currentQuestionIndex = 0;
  let score = 0;
  let hasAnswered = false;

  // 1. Fetch Quiz Data
  fetch('data/quizzes.json')
    .then(res => res.json())
    .then(data => {
      if (courseParam) {
        // Find specific course quiz (case-insensitive)
        currentQuiz = data.quizzes.find(q => q.courseCode.toLowerCase().replace(/\s+/g, '') === courseParam.toLowerCase().replace(/\s+/g, ''));
      }
      
      if (currentQuiz) {
        startQuiz();
      } else {
        showQuizHub(data.quizzes);
      }
    })
    .catch(err => {
      app.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Error loading quizzes.</p>';
    });

  // 2. Show Hub if no specific course is requested
  function showQuizHub(quizzes) {
    app.innerHTML = `
      <div class="section-head" style="text-align:center; display:block; margin-bottom:2rem;">
        <div class="breadcrumb" style="justify-content:center; margin-bottom:0.5rem;">
          <span><a href="learn.html" style="color:inherit;">Learn Hub</a></span>
          <span>/</span>
          <span class="current">Quiz Center</span>
        </div>
        <h2 class="section-title">Available Practice Quizzes</h2>
        <p style="color:var(--text-muted); max-width:36rem; margin:0.5rem auto 0;">Select a course below to test your knowledge.</p>
      </div>
      <div class="course-grid">
        ${quizzes.map(q => `
          <div class="course-card">
            <div class="card-top">
              <div class="card-badges">
                <span class="subject-badge gst">${q.courseCode}</span>
              </div>
              <h3 class="course-title">${q.title}</h3>
              <p class="course-desc">${q.description}</p>
            </div>
            <div class="card-bottom">
              <div class="card-meta" style="justify-content:flex-end;">
                <a class="notes-link" href="qa.html?course=${q.courseCode.toLowerCase().replace(/\s+/g, '')}">
                  Start Quiz <span class="material-symbols-outlined" style="font-size:14px;">chevron_right</span>
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3. Start the Quiz
  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
  }

  // 4. Render Current Question
  function renderQuestion() {
    hasAnswered = false;
    const q = currentQuiz.questions[currentQuestionIndex];
    const progress = Math.round(((currentQuestionIndex) / currentQuiz.questions.length) * 100);
    const letters = ['A', 'B', 'C', 'D'];

    app.innerHTML = `
      <div class="quiz-header">
        <div class="breadcrumb" style="margin-bottom:1rem;">
          <span><a href="qa.html" style="color:inherit;">Quiz Hub</a></span>
          <span>/</span>
          <span class="current">${currentQuiz.courseCode}</span>
        </div>
        <div class="quiz-progress-row">
          <span>Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</span>
          <span>Score: ${score}</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width:${progress}%;"></div>
        </div>
      </div>
      
      <h3 style="font-family:'Newsreader',serif; font-size:1.35rem; margin-bottom:1.5rem; line-height:1.4;">${q.question}</h3>
      
      <div class="quiz-options" id="quiz-options">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" data-index="${i}" onclick="selectOption(${i})">
            <span class="option-letter">${letters[i]}</span>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>

      <div class="quiz-explanation" id="quiz-explanation">
        <strong style="color:var(--sage); display:block; margin-bottom:0.5rem;">Explanation:</strong>
        ${q.explanation}
      </div>

      <div class="quiz-actions">
        <button class="btn btn-primary" id="next-btn" onclick="nextQuestion()" style="display:none;">
          ${currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>
        </button>
      </div>
    `;
  }

  // 5. Handle Option Selection (Exposed to global scope for onclick)
  window.selectOption = function(index) {
    if (hasAnswered) return;
    hasAnswered = true;

    const q = currentQuiz.questions[currentQuestionIndex];
    const options = document.querySelectorAll('.quiz-option');
    const explanation = document.getElementById('quiz-explanation');
    const nextBtn = document.getElementById('next-btn');

    options.forEach((opt, i) => {
      opt.classList.add('disabled');
      if (i === q.correct) {
        opt.classList.add('correct');
      } else if (i === index && i !== q.correct) {
        opt.classList.add('incorrect');
      }
    });

    if (index === q.correct) {
      score++;
    }

    explanation.classList.add('visible');
    nextBtn.style.display = 'inline-flex';
  };

  // 6. Handle Next Question or Finish
  window.nextQuestion = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.questions.length) {
      renderQuestion();
    } else {
      showResults();
    }
  };

  // 7. Show Final Results
  function showResults() {
    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    let message = "Keep practicing!";
    if (percentage >= 80) message = "Outstanding work!";
    else if (percentage >= 60) message = "Good job! Review the missed concepts.";

    app.innerHTML = `
      <div class="quiz-results">
        <div class="breadcrumb" style="justify-content:center; margin-bottom:1rem;">
          <span><a href="qa.html" style="color:inherit;">Quiz Hub</a></span>
          <span>/</span>
          <span class="current">Results</span>
        </div>
        <span class="subject-badge gst" style="font-size:14px; padding:0.4rem 0.8rem;">${currentQuiz.courseCode}</span>
        <h2 class="section-title" style="margin-top:1rem;">Quiz Complete!</h2>
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">${message}</p>
        
        <div class="results-score">${score} / ${total}</div>
        <p style="font-family:'Space Mono',monospace; font-size:14px; color:var(--sage); margin-bottom:2rem;">${percentage}% Correct</div>
        
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
          <a href="qa.html?course=${currentQuiz.courseCode.toLowerCase().replace(/\s+/g, '')}" class="btn btn-secondary">
            <span class="material-symbols-outlined" style="font-size:18px;">refresh</span>
            Retry Quiz
          </a>
          <a href="learn.html" class="btn btn-primary">
            <span class="material-symbols-outlined" style="font-size:18px;">arrow_back</span>
            Back to Learn Hub
          </a>
        </div>
      </div>
    `;
  }
});
