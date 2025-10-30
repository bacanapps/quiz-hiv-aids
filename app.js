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
      className: btnClass,
      onClick: () => toggleAudio(src),
      'aria-label': ariaLabel || 'Audiodescrição'
    }, React.createElement('span', { className: 'icon' }, playing ? '⏸️' : '🎵'), React.createElement('span', null, playing ? 'Pausar' : 'Audiodescrição'));
  }

  function toggleAudio(src) {
    console.log('Toggle audio called with src:', src);

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

    // If toggling a different audio, stop the current and start new
    if (currentSound) {
      console.log('Stopping previous audio');
      currentSound.stop();
      currentSound.unload();
      currentSound = null;
      currentAudioSrc = null;
      notifyAudioStateChange();
    }

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
  function Home({ onNavigate }) {
    return React.createElement('div', { className: 'min-h-screen fade-in flex flex-col' },
      // Hero section
      React.createElement('div', { className: 'relative overflow-hidden flex-1' },
        React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-emerald-600/20' }),
        React.createElement('div', { className: 'relative px-6 py-16 text-center' },
          React.createElement('h1', {
            className: 'text-4xl md:text-6xl font-bold mb-6 text-gradient'
          }, 'Quiz da Prevenção de HIV e Aids'),
          React.createElement('p', {
            className: 'text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed'
          }, 'Desafie seus conhecimentos, desvende mitos e aprenda sobre HIV e aids de forma interativa'),
          // Feature tags
          React.createElement('div', {
            className: 'flex flex-col sm:flex-row gap-4 justify-center items-center'
          },
            React.createElement('div', { className: 'flex items-center gap-2 text-sm text-gray-400' },
              React.createElement('div', { className: 'w-2 h-2 bg-green-500 rounded-full animate-pulse' }),
              'Informações atualizadas'
            ),
            React.createElement('div', { className: 'flex items-center gap-2 text-sm text-gray-400' },
              React.createElement('div', { className: 'w-2 h-2 bg-blue-500 rounded-full animate-pulse' }),
              'Audiodescrição inclusa'
            ),
            React.createElement('div', { className: 'flex items-center gap-2 text-sm text-gray-400' },
              React.createElement('div', { className: 'w-2 h-2 bg-purple-500 rounded-full animate-pulse' }),
              'Quiz interativo'
            )
          )
        )
      ),
      // Cards section
      React.createElement('div', { className: 'py-8 px-4 md:px-8 glass-effect' },
        React.createElement('div', { className: 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8' },
          // Apresentação card
          React.createElement('div', {
            className: 'p-6 rounded-xl card-hover glass-effect flex flex-col justify-between border border-gray-700',
            onClick: () => onNavigate('presentation')
          },
            React.createElement('div', null,
              React.createElement('div', {
                className: 'w-12 h-12 mb-4 rounded-lg gradient-primary flex items-center justify-center'
              },
                React.createElement('span', { className: 'text-white text-xl font-semibold' }, 'i')
              ),
              React.createElement('h3', { className: 'text-2xl font-semibold mb-2' }, 'Apresentação'),
              React.createElement('p', { className: 'text-gray-400 mb-4' }, 'Conheça os objetivos do quiz e por que ele é importante na prevenção ao HIV e à aids.')
            ),
            React.createElement('button', {
              className: 'button-modern gradient-primary text-white px-4 py-2 rounded-lg mt-auto',
              onClick: (e) => { e.stopPropagation(); onNavigate('presentation'); }
            }, 'Explorar')
          ),
          // Jogar card
          React.createElement('div', {
            className: 'p-6 rounded-xl card-hover glass-effect flex flex-col justify-between border border-gray-700',
            onClick: () => onNavigate('quiz')
          },
            React.createElement('div', null,
              React.createElement('div', {
                className: 'w-12 h-12 mb-4 rounded-lg gradient-secondary flex items-center justify-center'
              },
                React.createElement('span', { className: 'text-white text-xl font-semibold' }, '?')
              ),
              React.createElement('h3', { className: 'text-2xl font-semibold mb-2' }, 'Jogar'),
              React.createElement('p', { className: 'text-gray-400 mb-4' }, 'Responda perguntas aleatórias e receba feedback imediato.')
            ),
            React.createElement('button', {
              className: 'button-modern gradient-secondary text-white px-4 py-2 rounded-lg mt-auto',
              onClick: (e) => { e.stopPropagation(); onNavigate('quiz'); }
            }, 'Começar')
          )
        )
      )
    );
  }

  // Presentation page component
  function PresentationPage({ presentation, onBack }) {
    if (!presentation) {
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
        React.createElement('p', null, 'Carregando...')
      );
    }
    return React.createElement('div', { className: 'min-h-screen fade-in flex flex-col' },
      // Hero image at top
      React.createElement('div', {
        className: 'w-full h-64 md:h-80 relative overflow-hidden'
      },
        React.createElement('img', {
          src: presentation.heroImage,
          alt: 'Imagem de capa',
          className: 'w-full h-full object-cover'
        }),
        React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent' })
      ),
      React.createElement('div', { className: 'p-6 md:p-10 max-w-3xl mx-auto glass-effect rounded-xl -mt-12 md:-mt-20 relative z-10' },
        React.createElement('h2', { className: 'text-3xl font-bold mb-4 text-gradient' }, presentation.title),
        React.createElement('div', {
          className: 'prose prose-invert text-gray-300 mb-6',
          dangerouslySetInnerHTML: { __html: presentation.introHtml }
        }),
        presentation.audioDescription && presentation.audioDescription.src ? React.createElement(AudioButton, {
          src: presentation.audioDescription.src,
          ariaLabel: 'Audiodescrição',
          className: 'button-modern gradient-accent text-white px-4 py-2 rounded-lg mb-4'
        }) : null,
        React.createElement('button', {
          className: 'button-modern bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded-lg',
          onClick: onBack
        }, 'Voltar')
      )
    );
  }

  // Quiz page component
  function QuizPage({ questions, onComplete }) {
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
          React.createElement('h2', { className: 'text-2xl font-semibold flex-1' }, current.prompt),
          React.createElement(AudioButton, {
            src: `assets/audio/${current.id}.mp3`,
            ariaLabel: 'Ouvir a pergunta',
            className: 'button-modern gradient-accent text-white px-4 py-2 rounded-lg whitespace-nowrap'
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
      )
    );
  }

  // Result page component
  function ResultPage({ score, onRestart }) {
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

    return React.createElement('div', { className: 'min-h-screen fade-in flex flex-col items-center justify-center text-center px-6', style: { position: 'relative' } },
      confetti,
      React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold mb-4 text-gradient' }, 'Você concluiu o quiz!'),
      React.createElement('div', { className: 'text-2xl font-bold mb-4 text-green-500' }, 
        `Pontuação: ${score}/5 (${percentage}%)`
      ),
      React.createElement('p', { className: 'text-lg text-gray-300 mb-8' }, message),
      React.createElement('p', { className: 'text-base text-gray-400 mb-8' }, 
        'Obrigado por participar. Esperamos que você tenha aprendido algo novo!'
      ),
      React.createElement('button', {
        className: 'button-modern gradient-secondary text-white px-6 py-3 rounded-lg',
        onClick: onRestart
      }, 'Tentar Novamente')
    );
  }

  function App() {
    const { presentation, questions } = useFetchData();
    const [page, setPage] = React.useState('home');
    const [finalScore, setFinalScore] = React.useState(0);

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
      setFinalScore(score);
      setPage('result');
    }

    function handleRestart() {
      setFinalScore(0);
      setPage('home');
    }

    let content = null;
    if (page === 'home') {
      content = React.createElement(Home, { onNavigate: setPage });
    } else if (page === 'presentation') {
      content = React.createElement(PresentationPage, {
        presentation,
        onBack: () => setPage('home')
      });
    } else if (page === 'quiz') {
      content = React.createElement(QuizPage, {
        questions,
        onComplete: handleQuizComplete
      });
    } else if (page === 'result') {
      content = React.createElement(ResultPage, {
        score: finalScore,
        onRestart: handleRestart
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