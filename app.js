(() => {
  console.log('Modern Quiz PWA loading...');
  
  // Global error handler for promises
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Verify React is available
  if (typeof React === 'undefined') throw new Error('React is not loaded');
  if (typeof ReactDOM === 'undefined') throw new Error('ReactDOM is not loaded');
  console.log('React and ReactDOM verified');

  // Manage a single Howler instance for audio playback and track play state
  let currentSound = null;
  let currentAudioSrc = null;
  
  // Create a custom event for audio state changes
  const audioStateChangeEvent = new Event('audioStateChange');

  // Custom hook for tracking audio play state
  function useAudioState(src) {
    const [playing, setPlaying] = React.useState(false);

    React.useEffect(() => {
      // Function to update playing state
      const updatePlayingState = () => {
        setPlaying(currentSound && currentAudioSrc === src && currentSound.playing());
      };

      // Listen for audio state changes
      window.addEventListener('audioStateChange', updatePlayingState);
      
      // Initial state check
      updatePlayingState();

      // Cleanup
      return () => {
        window.removeEventListener('audioStateChange', updatePlayingState);
      };
    }, [src]);

    return playing;
  }

  // Helper function to notify state changes
  function notifyAudioStateChange() {
    window.dispatchEvent(audioStateChangeEvent);
  }
  // Small presentational AudioButton React component
  function AudioButton({ src, ariaLabel, className }) {
    const playing = useAudioState(src);
    const btnClass = (className || 'btn-audio') + ' flex items-center gap-2';
    return React.createElement('button', {
      type: 'button',
      className: btnClass,
      'aria-pressed': playing ? 'true' : 'false',
      onClick: () => toggleAudio(src),
      'aria-label': ariaLabel || 'Audiodescrição'
    }, React.createElement('span', null, playing ? '⏸️ Pausar' : '▶️ Audiodescrição'));
  }

  function toggleAudio(src) {
    console.log('Toggle audio called with src:', src);

    // If clicking a different audio, always stop the current one first
    if (currentSound && currentAudioSrc !== src) {
      console.log('Stopping different audio before starting new one');
      currentSound.stop();
      currentSound.unload();
      currentSound = null;
      currentAudioSrc = null;
      notifyAudioStateChange();
    }

    // If toggling the same audio that's currently playing, pause it
    if (currentSound && currentAudioSrc === src && currentSound.playing()) {
      console.log('Pausing current audio');
      currentSound.pause();
      notifyAudioStateChange();
      return;
    }

    // If toggling the same audio that's paused, resume it
    if (currentSound && currentAudioSrc === src && !currentSound.playing()) {
      console.log('Resuming current audio');
      currentSound.play();
      notifyAudioStateChange();
      return;
    }

    // Create and play new audio
    console.log('Creating new Howl instance for:', src);
    currentSound = new Howl({
      src: [src],
      onload: () => {
        console.log('Audio loaded successfully:', src);
      },
      onloaderror: (id, error) => {
        console.error('Error loading audio:', error);
      },
      onplay: () => {
        console.log('Audio started playing');
        notifyAudioStateChange();
      },
      onend: () => {
        console.log('Audio playback ended');
        currentSound = null;
        currentAudioSrc = null;
        notifyAudioStateChange();
      },
      onstop: () => {
        console.log('Audio playback stopped');
        currentSound = null;
        currentAudioSrc = null;
        notifyAudioStateChange();
      },
      onpause: () => {
        console.log('Audio playback paused');
        notifyAudioStateChange();
      }
    });
    currentAudioSrc = src;
    currentSound.play();
  }

  // Hook to fetch presentation and questions data
  function useFetchData() {
    const [presentation, setPresentation] = React.useState(null);
    const [questions, setQuestions] = React.useState([]);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      console.log('Fetching data...');
      
      // Helper function to handle fetch errors
      const fetchJson = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      };

      Promise.all([
        fetchJson('data/presentation.json'),
        fetchJson('data/questions.json')
      ]).then(([presentationData, questionsData]) => {
        console.log('Data fetched successfully');
        setPresentation(presentationData);
        setQuestions(questionsData);
      }).catch(err => {
        console.error('Error fetching data:', err);
        setError(err.message);
      });
    }, []);

    if (error) {
      throw new Error(`Failed to load data: ${error}`);
    }
    
    return { presentation, questions };
  }

  // Home component with hero and navigation cards
  function Home({ onNavigate, theme, toggleTheme }) {
    return React.createElement('div', { className: 'page fade-in' },
      // Theme toggle button (fixed position)
      React.createElement('button', {
        className: 'theme-toggle-btn',
        onClick: toggleTheme,
        'aria-label': 'Alternar tema'
      }, theme === 'light' ? '🌙' : '☀️'),

      // Hero section with gradient glass card
      React.createElement('section', { className: 'hero hero-gradient glass-card' },
        React.createElement('div', { className: 'hero-header' },
          React.createElement('div', { className: 'hero-content' },
            React.createElement('h1', { className: 'hero-title' }, 'Quiz Educativo HIV/AIDS'),
            React.createElement('p', { className: 'hero-lede' }, 'Teste seus conhecimentos sobre prevenção e tratamento')
          )
        )
      ),

      // Two-column cards section
      React.createElement('section', { className: 'home-cards' },
        React.createElement('div', { className: 'cards-2col' },
          // Card 1: Apresentação
          React.createElement('article', {
            className: 'choice-card glass-card card-hover',
            onClick: () => onNavigate('presentation')
          },
            React.createElement('div', { className: 'choice-icon' }, '📘'),
            React.createElement('h2', { className: 'choice-title' }, 'Apresentação'),
            React.createElement('p', { className: 'choice-desc' }, 'Conheça os objetivos do quiz e por que ele é importante na prevenção ao HIV e à aids'),
            React.createElement('div', { className: 'actions' },
              React.createElement('button', { className: 'btn btn-primary' }, 'Explorar')
            )
          ),

          // Card 2: Quiz
          React.createElement('article', {
            className: 'choice-card glass-card card-hover',
            onClick: () => onNavigate('quiz')
          },
            React.createElement('div', { className: 'choice-icon' }, '📊'),
            React.createElement('h2', { className: 'choice-title' }, 'Quiz'),
            React.createElement('p', { className: 'choice-desc' }, 'Perguntas essenciais sobre HIV/AIDS'),
            React.createElement('div', { className: 'actions' },
              React.createElement('button', { className: 'btn btn-green' }, 'Explorar')
            )
          )
        )
      )
    );
  }

  // Presentation page component
  function PresentationPage({ presentation, onBack, theme, toggleTheme }) {
    if (!presentation) {
      return React.createElement('div', { className: 'page fade-in' },
        React.createElement('p', null, 'Carregando...')
      );
    }

    const audioSrc = presentation.audioDescription && presentation.audioDescription.src;
    const isPlaying = useAudioState(audioSrc);

    return React.createElement('div', { className: 'page fade-in' },
      // Header
      React.createElement('header', { className: 'page-header' },
        React.createElement('a', {
          href: '#',
          className: 'back-link',
          onClick: (e) => {
            e.preventDefault();
            // Stop any playing audio when navigating back
            if (currentSound && currentSound.playing()) {
              currentSound.stop();
              currentSound.unload();
              currentSound = null;
              currentAudioSrc = null;
              notifyAudioStateChange();
            }
            onBack();
          }
        }, '← Voltar'),
        React.createElement('div', { className: 'page-header-content' },
          React.createElement('h1', { className: 'page-title' }, 'Apresentação'),
          React.createElement('p', { className: 'page-subtle' }, 'Quiz Educativo HIV/AIDS')
        ),
        React.createElement('button', {
          className: 'theme-toggle-btn',
          onClick: toggleTheme,
          'aria-label': 'Alternar tema'
        }, theme === 'light' ? '🌙' : '☀️')
      ),

      // Presentation card
      React.createElement('div', { className: 'presentation-card' },
        React.createElement('div', { className: 'presentation-heroimg-wrapper' },
          React.createElement('img', {
            src: presentation.heroImage,
            alt: 'Quiz Prevenção HIV e Aids'
          })
        ),
        React.createElement('div', {
          className: 'presentation-textblock',
          dangerouslySetInnerHTML: { __html: presentation.introHtml }
        }),
        audioSrc &&
          React.createElement('div', { className: 'audio-row' },
            React.createElement('button', {
              className: 'audio-btn',
              type: 'button',
              'aria-pressed': isPlaying ? 'true' : 'false',
              onClick: () => toggleAudio(audioSrc)
            }, isPlaying ? '⏸️ Pausar' : '▶️ Audiodescrição')
          )
      )
    );
  }

  // Quiz page component
  function QuizPage({ questions, onComplete, theme, toggleTheme }) {
    // Select 5 random questions once when component mounts
    const selected = React.useMemo(() => {
      if (!questions || questions.length === 0) return [];
      const shuffled = [...questions];
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, 5);
    }, [questions]);

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [selectedOption, setSelectedOption] = React.useState(null);
    const [answered, setAnswered] = React.useState(false);
    const [score, setScore] = React.useState(0);

    if (!questions || questions.length === 0) {
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
        React.createElement('p', null, 'Carregando...')
      );
    }

    const current = selected[currentIndex];

    function handleSelect(idx) {
      if (answered) return;
      setSelectedOption(idx);
    }

    function handleConfirm() {
      if (answered) return;
      setAnswered(true);
      if (selectedOption === current.correctIndex) {
        setScore(score + 1);
      }
    }

    function handleNext() {
      // Stop any currently playing audio before moving to next question
      if (currentSound && currentSound.playing()) {
        currentSound.stop();
        currentSound.unload();
        currentSound = null;
        currentAudioSrc = null;
        notifyAudioStateChange();
      }

      if (currentIndex < selected.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setAnswered(false);
      } else {
        onComplete(score);
      }
    }

    // Function to play question audio
    function playQuestionAudio() {
      // Get the question's ID from the current question object
      const questionId = current.id; // This will be 'q1', 'q2', etc.
      // Extract just the number from the ID and use it for the audio file
      const audioSrc = `assets/audio/${questionId}.mp3`;
      console.log('Playing audio for question ID:', questionId);
      console.log('Audio source:', audioSrc);
      toggleAudio(audioSrc);
    }

    return React.createElement('div', { className: 'min-h-screen fade-in flex flex-col items-center justify-start p-6 md:p-10' },
      React.createElement('div', { className: 'w-full max-w-3xl glass-effect rounded-xl p-6 md:p-8' },
        React.createElement('div', { className: 'mb-4 flex justify-between items-center' },
          React.createElement('div', { className: 'text-gray-400 text-sm' }, `Pergunta ${currentIndex + 1}/5`),
          React.createElement('div', { className: 'text-gray-400 text-sm' }, `Pontuação: ${score}/${currentIndex + (answered ? 1 : 0)}`)
        ),
        React.createElement('div', { className: 'flex items-start justify-between gap-4 mb-6' },
          React.createElement('h2', { className: 'text-2xl font-semibold flex-1 quiz-question-text' }, current.prompt),
          React.createElement(AudioButton, {
            src: `assets/audio/${current.id}.mp3`,
            ariaLabel: 'Ouvir a pergunta',
            className: 'audio-btn'
          })
        ),
        React.createElement('div', { className: 'space-y-4' },
          current.choices.map((choice, idx) => {
            // Determine styling based on answer state
            let optionClasses = 'w-full block text-left px-4 py-3 rounded-lg border transition-colors ';
            if (answered) {
              if (idx === current.correctIndex) {
                optionClasses += 'border-green-500 text-green-500 font-semibold';
              } else if (idx === selectedOption && idx !== current.correctIndex) {
                optionClasses += 'border-gray-500 text-gray-300 line-through';
              } else {
                optionClasses += 'border-gray-700 text-gray-500';
              }
            } else {
              optionClasses += 'border-gray-600 hover:bg-gray-700/60 text-gray-200';
              if (idx === selectedOption) {
                optionClasses += ' border-blue-500';
              }
            }
            return React.createElement('button', {
              key: idx,
              className: optionClasses,
              onClick: () => handleSelect(idx),
              disabled: answered
            }, String.fromCharCode(97 + idx) + ') ' + choice);
          })
        ),
        React.createElement('div', { className: 'mt-6 flex justify-end gap-4' },
          !answered && selectedOption !== null && React.createElement('button', {
            className: 'button-modern gradient-primary text-white px-4 py-2 rounded-lg',
            onClick: handleConfirm
          }, 'Confirmar'),
          answered && React.createElement('button', {
            className: 'button-modern gradient-accent text-white px-4 py-2 rounded-lg',
            onClick: handleNext
          }, currentIndex < selected.length - 1 ? 'Próxima' : 'Finalizar')
        )
      ),
      React.createElement('button', {
        className: 'theme-toggle-btn',
        onClick: toggleTheme,
        'aria-label': 'Alternar tema'
      }, theme === 'light' ? '🌙' : '☀️')
    );
  }

  // Result page component
  function ResultPage({ score, onRestart, theme, toggleTheme }) {
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

    // Confetti animation if perfect score
    const confetti = (typeof window !== 'undefined' && window.ReactConfetti && score === 5)
      ? React.createElement(window.ReactConfetti, {
          width: window.innerWidth,
          height: window.innerHeight,
          numberOfPieces: 300,
          recycle: false,
          run: true
        })
      : null;

    return React.createElement('div', { className: 'min-h-screen fade-in flex flex-col items-center justify-center px-6', style: { position: 'relative' } },
      confetti,
      React.createElement('div', { className: 'presentation-card text-center' },
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold mb-4 quiz-result-title' }, 'Você concluiu o quiz!'),
        React.createElement('div', { className: 'text-2xl font-bold mb-4 text-green-500' },
          `Pontuação: ${score}/5 (${percentage}%)`
        ),
        React.createElement('p', { className: 'text-lg mb-8 quiz-result-message' }, message),
        React.createElement('p', { className: 'text-base mb-8 quiz-result-thanks' },
          'Obrigado por participar. Esperamos que você tenha aprendido algo novo!'
        ),
        React.createElement('button', {
          className: 'button-modern gradient-secondary text-white px-6 py-3 rounded-lg',
          onClick: onRestart
        }, 'Tentar Novamente')
      ),
      React.createElement('button', {
        className: 'theme-toggle-btn',
        onClick: toggleTheme,
        'aria-label': 'Alternar tema'
      }, theme === 'light' ? '🌙' : '☀️')
    );
  }

  // Theme hook
  function useTheme() {
    const [theme, setTheme] = React.useState(() => {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const themeParam = urlParams.get('theme');
      if (themeParam === 'light' || themeParam === 'dark') {
        return themeParam;
      }
      // Then check localStorage
      const saved = localStorage.getItem('quiz-hiv-aids-theme');
      return saved === 'dark' ? 'dark' : 'light'; // Default to light
    });

    const toggleTheme = React.useCallback(() => {
      setTheme(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('quiz-hiv-aids-theme', next);
        document.documentElement.setAttribute('data-theme', next);
        // Update URL parameter
        const url = new URL(window.location);
        url.searchParams.set('theme', next);
        window.history.pushState({}, '', url);
        return next;
      });
    }, []);

    React.useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return { theme, toggleTheme };
  }

  function App() {
    const { presentation, questions } = useFetchData();
    const [page, setPage] = React.useState('home');
    const [finalScore, setFinalScore] = React.useState(0);
    const { theme, toggleTheme } = useTheme();

    // Hidden reset for staff: 5 taps on top-left corner resets to home
    const [tapCount, setTapCount] = React.useState(0);
    React.useEffect(() => {
      if (tapCount >= 5) {
        setPage('home');
        setTapCount(0);
      }
    }, [tapCount]);

    function handleCornerTap() {
      setTapCount(prev => prev + 1);
      setTimeout(() => setTapCount(0), 3000); // reset after 3s of inactivity
    }

    function handleQuizComplete(score) {
      // Stop any playing audio when completing quiz
      if (currentSound && currentSound.playing()) {
        currentSound.stop();
        currentSound.unload();
        currentSound = null;
        currentAudioSrc = null;
        notifyAudioStateChange();
      }
      setFinalScore(score);
      setPage('result');
    }

    function handleRestart() {
      // Stop any playing audio when restarting
      if (currentSound && currentSound.playing()) {
        currentSound.stop();
        currentSound.unload();
        currentSound = null;
        currentAudioSrc = null;
        notifyAudioStateChange();
      }
      setFinalScore(0);
      setPage('home');
    }

    // Helper to stop audio before navigation
    function handleNavigate(newPage) {
      // Stop any playing audio when navigating
      if (currentSound && currentSound.playing()) {
        currentSound.stop();
        currentSound.unload();
        currentSound = null;
        currentAudioSrc = null;
        notifyAudioStateChange();
      }
      setPage(newPage);
    }

    let content = null;
    if (page === 'home') {
      content = React.createElement(Home, { onNavigate: handleNavigate, theme, toggleTheme });
    } else if (page === 'presentation') {
      content = React.createElement(PresentationPage, {
        presentation,
        onBack: () => {
          // Stop any playing audio when navigating back
          if (currentSound && currentSound.playing()) {
            currentSound.stop();
            currentSound.unload();
            currentSound = null;
            currentAudioSrc = null;
            notifyAudioStateChange();
          }
          setPage('home');
        },
        theme, toggleTheme
      });
    } else if (page === 'quiz') {
      content = React.createElement(QuizPage, {
        questions,
        onComplete: handleQuizComplete,
        theme, toggleTheme
      });
    } else if (page === 'result') {
      content = React.createElement(ResultPage, {
        score: finalScore,
        onRestart: handleRestart,
        theme, toggleTheme
      });
    } else {
      content = React.createElement('div', null, 'Página não encontrada');
    }

    return React.createElement('div', { className: 'relative' },
      // Invisible corner area for admin reset
      React.createElement('div', {
        style: { position: 'fixed', top: 0, left: 0, width: '40px', height: '40px', zIndex: 50 },
        onClick: handleCornerTap
      }),
      content
    );
  }

  // Mount the app once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderApp);
  } else {
    renderApp();
  }

  function renderApp() {
    console.log('Rendering app...');
    const root = document.getElementById('root');
    if (!root) {
      console.error('Root element not found');
      return;
    }
    
    try {
      console.log('Creating App component');
      const app = React.createElement(App);
      console.log('App element created, attempting to render');
      
      ReactDOM.render(app, root);
      console.log('App rendered successfully');
      
      // Register service worker for offline support
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
          .then(() => console.log('Service worker registered'))
          .catch(err => console.error('Service worker registration failed:', err));
      }
    } catch (error) {
      console.error('Error rendering app:', error);
      root.innerHTML = `
        <div style="color: red; padding: 20px; text-align: center;">
          <h2>Erro ao carregar o aplicativo</h2>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
})();