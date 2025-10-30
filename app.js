// app.js
// simple hash router + quiz logic + view rendering with styling

let allQuestions = [];
let selectedQuestions = [];
let currentIndex = 0;
let score = 0;
let currentAudio = null; // Track currently playing audio
let selectedAnswer = null; // Track selected answer for current question
let presentationData = null; // Cache presentation content

function stopCurrentAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

// --- load questions.json once ---
async function loadQuestions() {
  if (allQuestions.length > 0) return;
  const res = await fetch('./questions.json', { cache: 'no-cache' });
  allQuestions = await res.json();
}

// --- load presentation.json once ---
async function loadPresentation() {
  if (presentationData) return;
  const res = await fetch('./data/presentation.json', { cache: 'no-cache' });
  presentationData = await res.json();
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- ROUTER ---
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

// route table
function handleRoute() {
  const hash = location.hash.replace('#', '').replace('/', '');
  // home ('', undefined) -> renderHome
  // intro -> renderIntro
  // play  -> renderPlay
  // quiz  -> renderQuiz
  // result -> renderResult
  if (hash === '' || hash === undefined) {
    renderHome();
  } else if (hash === 'intro') {
    renderIntro();
  } else if (hash === 'play') {
    renderPlay();
  } else if (hash === 'quiz') {
    renderQuiz();
  } else if (hash === 'result') {
    renderResult();
  } else {
    renderHome();
  }
}

// helpers
function go(path) {
  location.hash = path;
}

// =====================
// VIEW: HOME (/#/)
// =====================
function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-shell">
      <main class="main-content">
        <header class="hero-block">
          <h1 class="hero-title">Quiz da Prevenção de HIV e Aids</h1>
          <div class="hero-desc">
            Desafie seus conhecimentos, desvende mitos e aprenda sobre HIV e aids de forma interativa
          </div>
          <div class="hero-badges">
            <div><span class="badge-dot dot-green"></span>Informações atualizadas</div>
            <div><span class="badge-dot dot-blue"></span>Audiodescrição inclusa</div>
            <div><span class="badge-dot dot-purple"></span>Quiz interativo</div>
          </div>
        </header>

        <section class="home-cards-grid">
          <div class="home-card">
            <div class="home-card-header">
              <div class="home-card-icon">i</div>
              <div>
                <h2 class="home-card-title">Apresentação</h2>
              </div>
            </div>
            <div class="home-card-body">
              Conheça os objetivos do quiz e por que ele é importante na prevenção ao HIV e à aids.
            </div>
            <div class="home-card-footer">
              <button class="btn btn-blue" onclick="go('/intro')">Explorar</button>
            </div>
          </div>

          <div class="home-card">
            <div class="home-card-header">
              <div class="home-card-icon green">?</div>
              <div>
                <h2 class="home-card-title">Jogar</h2>
              </div>
            </div>
            <div class="home-card-body">
              Responda perguntas aleatórias e receba feedback imediato.
            </div>
            <div class="home-card-footer">
              <button class="btn btn-green" onclick="startQuiz()">Começar</button>
            </div>
          </div>
        </section>

        <footer class="footer-text">
          Informações baseadas em evidências científicas • Ministério da Saúde • OPAS
        </footer>
      </main>
    </div>
  `;
}

function resolvePresentationAudioSrc(audioDescription) {
  const defaultSrc = './audio/presentation.mp3';
  if (!audioDescription || !audioDescription.src) {
    return defaultSrc;
  }
  let src = audioDescription.src.trim();
  if (src === '') return defaultSrc;
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  // Rewrite common asset directory prefix to local audio folder
  if (src.startsWith('assets/audio/')) {
    src = `audio/${src.split('/').pop()}`;
  }
  if (src.startsWith('/')) {
    return `.${src}`;
  }
  if (!src.startsWith('./') && !src.startsWith('../')) {
    return `./${src}`;
  }
  return src;
}

// =====================
// VIEW: INTRO (/#/intro)
// =====================
async function renderIntro() {
  await loadPresentation();
  const presentation = presentationData || {};
  const { title, introHtml, audioDescription, heroImage } = presentation;
  const audioSrcRaw = resolvePresentationAudioSrc(audioDescription);
  const audioSrcEscaped = audioSrcRaw.replace(/'/g, "\\'");
  const introHtmlBlock = introHtml || '';
  const heroImageHTML = heroImage ? `<img src="${heroImage}" alt="Imagem de apresentação" class="intro-cover-img" loading="lazy">` : '';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-shell intro-page">
      <main class="main-content">
        <section class="intro-cover">
          ${heroImageHTML}
          <div class="intro-cover-overlay"></div>
          <div class="intro-card glass-effect">
            <span class="intro-tag">Apresentação</span>
            <h1 class="intro-card-title">${escapeHTML(title || 'Quiz da Prevenção de HIV e Aids')}</h1>
            <div class="intro-card-body">
              ${introHtmlBlock}
            </div>
            <div class="intro-card-actions">
              <button class="intro-audio-control" onclick="playAudioFor('${audioSrcEscaped}')" aria-label="Ouvir audiodescrição da apresentação">
                <span class="intro-audio-icon">🎧</span>
                <span>Audiodescrição</span>
              </button>
              <div class="intro-card-actions-right">
                <button class="intro-primary-btn" onclick="startQuiz()">Começar Quiz</button>
                <button class="intro-secondary-btn" onclick="go('/')">Voltar</button>
              </div>
            </div>
          </div>
        </section>

        <footer class="footer-text intro-footer">
          Informações baseadas em evidências científicas • Ministério da Saúde • OPAS
        </footer>
      </main>
    </div>
  `;
}

// =====================
// VIEW: PLAY (/#/play)
// basically a lobby that leads into /quiz
// =====================
function renderPlay() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-shell">
      <main class="main-content">
        <header class="hero-block" style="margin-bottom:2rem;">
          <h1 class="hero-title" style="margin-bottom:1rem;">Jogar</h1>
          <div class="hero-desc" style="max-width:900px;margin:0 auto;">
            Aqui você vai responder perguntas rápidas e ver a resposta correta em destaque.<br>
            (Em breve: lógica completa do quiz, áudio e feedback imediato).
          </div>
        </header>

        <div style="text-align:left; max-width:1100px; margin:0 auto; display:flex; flex-wrap:wrap; gap:.75rem;">
          <button class="btn btn-green" onclick="startQuiz()">Começar agora</button>
          <button class="btn btn-blue" onclick="go('/')">Voltar</button>
        </div>

        <footer class="footer-text">
          Informações baseadas em evidências científicas • Ministério da Saúde • OPAS
        </footer>
      </main>
    </div>
  `;
}

// =====================
// QUIZ STATE MANAGEMENT
// =====================
async function startQuiz() {
  await loadQuestions();
  // Select 5 random questions
  selectedQuestions = shuffleArray(allQuestions).slice(0, 5);
  currentIndex = 0;
  score = 0;
  selectedAnswer = null;
  stopCurrentAudio();
  go('/quiz');
}

// move next
function nextQuestion() {
  // Don't advance if no answer selected
  if (selectedAnswer === null) {
    alert('Por favor, selecione uma resposta antes de continuar.');
    return;
  }
  
  // Record the answer
  const q = selectedQuestions[currentIndex];
  const isCorrect = selectedAnswer === q.correctIndex;
  if (isCorrect) score++;
  
  // Reset selection for next question
  selectedAnswer = null;
  stopCurrentAudio();
  
  currentIndex++;
  if (currentIndex >= selectedQuestions.length) {
    // Show results page
    go('/result');
    return;
  }
  renderQuiz();
}

// handle answer
function chooseAnswer(idx) {
  selectedAnswer = idx;
  renderQuiz();
}

// play audio description - use the audio property from the question
function playAudioFor(audioFile) {
  if (!audioFile) return;
  const src = audioFile.includes('/') ? audioFile : `./audio/${audioFile}`;

  // Stop any currently playing audio
  stopCurrentAudio();
  
  // Create and play new audio
  currentAudio = new Audio(src);
  currentAudio.play().catch(() => {});
  
  // Clear reference when audio ends
  currentAudio.addEventListener('ended', () => {
    currentAudio = null;
  });
}

// =====================
// VIEW: QUIZ (/#/quiz)
// =====================
async function renderQuiz() {
  await loadQuestions();
  const app = document.getElementById('app');

  // guard - make sure we have selected questions
  if (!selectedQuestions || selectedQuestions.length === 0) {
    startQuiz();
    return;
  }

  if (currentIndex < 0 || currentIndex >= selectedQuestions.length) {
    startQuiz();
    return;
  }

  const q = selectedQuestions[currentIndex];
  const questionNumber = currentIndex + 1;
  const totalQuestions = selectedQuestions.length;

  // build answer buttons
  let choicesHTML = q.choices.map((choiceText, i) => {
    const isSelected = selectedAnswer === i;
    const selectedClass = isSelected ? ' selected' : '';
    const ariaPressed = isSelected ? 'true' : 'false';
    
    return `
      <button
        class="quiz-choice-btn${selectedClass}"
        onclick="chooseAnswer(${i})"
        aria-pressed="${ariaPressed}"
        aria-label="Opção ${String.fromCharCode(97+i)}) ${escapeHTML(choiceText)}"
      >
        ${String.fromCharCode(97+i)}) ${escapeHTML(choiceText)}
      </button>
    `;
  }).join('');

  const nextDisabled = selectedAnswer === null;
  const nextDisabledAttr = nextDisabled ? 'disabled aria-disabled="true"' : '';

  app.innerHTML = `
    <div class="page-shell">
      <main class="main-content">

        <div class="quiz-wrapper">
          <div class="quiz-header-row">
            <div class="quiz-header-left">
              Pergunta ${questionNumber}/${totalQuestions}
            </div>
            <div class="quiz-header-right">
              <div>Pontuação: ${score}/${questionNumber-1 < 0 ? 0 : questionNumber-1}</div>
              <button class="quiz-audio-btn" onclick="playAudioFor('${q.audio}')">
                <span>🎵</span>
                <span>Audiodescrição</span>
              </button>
            </div>
          </div>

          <div class="quiz-question">
            ${escapeHTML(q.prompt)}
          </div>

          <div class="quiz-choices">
            ${choicesHTML}
          </div>

          <div class="quiz-nav-row">
            <button class="btn btn-blue" onclick="go('/')">Sair</button>
            <button class="btn btn-green" onclick="nextQuestion()" ${nextDisabledAttr}>Próxima</button>
          </div>
        </div>

        <footer class="footer-text">
          Informações baseadas em evidências científicas • Ministério da Saúde • OPAS
        </footer>
      </main>
    </div>
  `;
}

// =====================
// VIEW: RESULT (/#/result)
// =====================
function renderResult() {
  const app = document.getElementById('app');
  const percentage = (score / 5) * 100;
  
  let message;
  if (percentage === 100) {
    message = 'Excelente! Você acertou todas as questões!';
  } else if (percentage >= 80) {
    message = 'Muito bom! Você tem um ótimo conhecimento sobre o tema!';
  } else if (percentage >= 60) {
    message = 'Bom trabalho! Você está no caminho certo!';
  } else {
    message = 'Continue aprendendo! Cada nova informação faz a diferença.';
  }

  app.innerHTML = `
    <div class="page-shell">
      <main class="main-content" style="display:flex; align-items:center; justify-content:center; text-align:center; min-height:80vh;">
        <div class="glass-effect" style="max-width:600px; padding:3rem 2rem; border-radius:1rem;">
          <h2 class="hero-title" style="font-size:2.5rem; margin-bottom:1.5rem;">
            Você concluiu o quiz!
          </h2>
          <div style="font-size:2rem; font-weight:bold; color:#10b981; margin-bottom:1.5rem;">
            Pontuação: ${score}/5 (${percentage}%)
          </div>
          <p style="font-size:1.25rem; color:var(--text-primary); margin-bottom:1.5rem;">
            ${message}
          </p>
          <p style="font-size:1rem; color:var(--text-dim); margin-bottom:2rem;">
            Obrigado por participar. Esperamos que você tenha aprendido algo novo!
          </p>
          <button class="btn btn-green" onclick="startQuiz()" style="font-size:1.1rem; padding:0.8rem 2rem;">
            Tentar Novamente
          </button>
        </div>
      </main>
    </div>
    ${score === 5 ? '<canvas id="confetti-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999;"></canvas>' : ''}
  `;

  // Trigger confetti animation if perfect score
  if (score === 5) {
    setTimeout(() => {
      createConfetti();
    }, 300);
  }
}

// Simple confetti animation
function createConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = [];
  const confettiCount = 300;
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti.forEach((c, i) => {
      ctx.beginPath();
      ctx.lineWidth = c.r / 2;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 5);
      ctx.stroke();
    });

    update();
  }

  function update() {
    confetti.forEach((c, i) => {
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(c.d);
      c.tilt = Math.sin(c.tiltAngle - i / 3) * 15;

      if (c.y > canvas.height) {
        confetti[i] = {
          x: Math.random() * canvas.width,
          y: -10,
          r: c.r,
          d: c.d,
          color: c.color,
          tilt: c.tilt,
          tiltAngle: c.tiltAngle,
          tiltAngleIncremental: c.tiltAngleIncremental
        };
      }
    });
  }

  let animationId;
  function animate() {
    draw();
    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Stop after 5 seconds
  setTimeout(() => {
    cancelAnimationFrame(animationId);
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }, 5000);
}

// small XSS-safe helper
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, s => (
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
  ));
}
