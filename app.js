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

  // ====== APP VERSION ======
  // Update this manually when deploying to reflect last GitHub update
  const APP_VERSION = '11/12/2025, 11:11';
  const getAppVersion = () => {
    return `(v. ${APP_VERSION})`;
  };

  // ====== Analytics Tracker ======
  // Utility class for tracking user interactions with Google Analytics
  const AnalyticsTracker = {
    // Track page navigation
    trackPageView(pageName, pageTitle) {
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
          page_title: pageTitle || pageName,
          page_location: window.location.href,
          page_path: window.location.pathname + window.location.hash,
          page_name: pageName
        });
        console.log('Analytics: Page view tracked -', pageName);
      }
    },

    // Track when a quiz question is viewed
    trackQuestionView(questionId, questionNumber, questionText) {
      if (typeof gtag === 'function') {
        gtag('event', 'view_question', {
          question_id: questionId,
          question_number: questionNumber,
          question_text: questionText,
          event_category: 'Quiz',
          event_label: `Question ${questionNumber}: ${questionId}`
        });
        console.log('Analytics: Question view tracked -', questionId);
      }
    },

    // Track when a user selects an answer option
    trackAnswerSelection(questionId, questionNumber, selectedOption, isCorrect) {
      if (typeof gtag === 'function') {
        gtag('event', 'select_answer', {
          question_id: questionId,
          question_number: questionNumber,
          selected_option: selectedOption,
          is_correct: isCorrect,
          event_category: 'Quiz',
          event_label: `Q${questionNumber} - Option ${selectedOption} (${isCorrect ? 'Correct' : 'Incorrect'})`
        });
        console.log('Analytics: Answer selection tracked -', questionId, 'Option:', selectedOption, 'Correct:', isCorrect);
      }
    },

    // Track quiz completion with results
    trackQuizCompletion(score, totalQuestions, percentage) {
      if (typeof gtag === 'function') {
        gtag('event', 'complete_quiz', {
          score: score,
          total_questions: totalQuestions,
          percentage: percentage,
          event_category: 'Quiz',
          event_label: `Score: ${score}/${totalQuestions} (${percentage}%)`,
          value: score
        });
        console.log('Analytics: Quiz completion tracked -', score, '/', totalQuestions);
      }
    },

    // Track audio playback
    trackAudioPlay(audioType, contentId) {
      if (typeof gtag === 'function') {
        gtag('event', 'play_audio', {
          audio_type: audioType,
          content_id: contentId,
          event_category: 'Audio',
          event_label: `${audioType}: ${contentId}`
        });
        console.log('Analytics: Audio play tracked -', audioType, contentId);
      }
    },

    // Track theme toggle
    trackThemeToggle(newTheme) {
      if (typeof gtag === 'function') {
        gtag('event', 'toggle_theme', {
          theme: newTheme,
          event_category: 'Settings',
          event_label: `Theme changed to ${newTheme}`
        });
        console.log('Analytics: Theme toggle tracked -', newTheme);
      }
    },

    // Track language toggle
    trackLanguageToggle(newLanguage) {
      if (typeof gtag === 'function') {
        gtag('event', 'language_toggle', {
          language: newLanguage,
          event_category: 'Settings',
          event_label: `Language changed to ${newLanguage}`
        });
        console.log('Analytics: Language toggle tracked -', newLanguage);
      }
    }
  };

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

    // Determine audio type and content ID from the src
    let audioType = 'unknown';
    let contentId = src;
    if (src.includes('presentation')) {
      audioType = 'presentation';
      contentId = 'presentation';
    } else if (src.match(/q\d+\.mp3/)) {
      audioType = 'question';
      const match = src.match(/q(\d+)\.mp3/);
      contentId = match ? `q${match[1]}` : src;
    }

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
        // Track audio play
        AnalyticsTracker.trackAudioPlay(audioType, contentId);
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

  /* --------------- Translations --------------- */
  const TRANSLATIONS = {
    'pt-br': {
      nav: {
        home: 'Home',
        apresentacao: 'Apresentação',
        quiz: 'Quiz',
        voltar: 'Voltar'
      },
      home: {
        heroTitle: 'QUIZ',
        heroDesc: 'Teste seus conhecimentos no contexto de HIV e aids.',
        cardApresentacao: {
          title: 'Apresentação',
          button: 'Explorar'
        },
        cardQuiz: {
          title: 'Quiz',
          button: 'Explorar'
        }
      },
      apresentacao: {
        title: 'Apresentação',
        subtitle: 'Quiz Educativo HIV/AIDS',
        loading: 'Carregando…',
        audioBtnPlay: '▶️ Audiodescrição',
        audioBtnPause: '⏸️ Pausar'
      },
      quiz: {
        questionLabel: 'Pergunta',
        scoreLabel: 'Pontuação',
        confirmBtn: 'Confirmar',
        nextBtn: 'Próxima',
        finishBtn: 'Finalizar',
        loading: 'Carregando…',
        listenQuestion: 'Ouvir a pergunta'
      },
      result: {
        title: 'Você concluiu o quiz!',
        scoreLabel: 'Pontuação',
        message100: 'Excelente! Você acertou todas as questões!',
        message80: 'Muito bom! Você tem um ótimo conhecimento sobre o tema!',
        message60: 'Bom trabalho! Você está no caminho certo!',
        messageDefault: 'Continue aprendendo! Cada nova informação faz a diferença.',
        thanks: 'Obrigado por participar. Esperamos que você tenha aprendido algo novo!',
        restartBtn: 'Tentar Novamente'
      },
      common: {
        themeToggleAria: 'Alternar tema visual',
        languageToggleAria: 'Alternar idioma',
        languageLabel: 'Português',
        footer: '© 2025 Dezembro Vermelho • Ministério da Saúde'
      }
    },
    'en': {
      nav: {
        home: 'Home',
        apresentacao: 'Introduction',
        quiz: 'Quiz',
        voltar: 'Back'
      },
      home: {
        heroTitle: 'HIV AND AIDS PREVENTION QUIZ',
        heroDesc: 'Test your knowledge about HIV and AIDS.',
        cardApresentacao: {
          title: 'Introduction',
          button: 'Explore'
        },
        cardQuiz: {
          title: 'Quiz',
          button: 'Explore'
        }
      },
      apresentacao: {
        title: 'Presentation',
        subtitle: 'HIV/AIDS Educational Quiz',
        loading: 'Loading…',
        audioBtnPlay: '▶️ Audio Description',
        audioBtnPause: '⏸️ Pause'
      },
      quiz: {
        questionLabel: 'Question',
        scoreLabel: 'Score',
        confirmBtn: 'Confirm',
        nextBtn: 'Next',
        finishBtn: 'Finish',
        loading: 'Loading…',
        listenQuestion: 'Listen to question'
      },
      result: {
        title: 'You completed the quiz!',
        scoreLabel: 'Score',
        message100: 'Excellent! You got all the questions right!',
        message80: 'Very good! You have great knowledge about the subject!',
        message60: 'Good job! You are on the right track!',
        messageDefault: 'Keep learning! Every new piece of information makes a difference.',
        thanks: 'Thank you for participating. We hope you learned something new!',
        restartBtn: 'Try Again'
      },
      common: {
        themeToggleAria: 'Toggle visual theme',
        languageToggleAria: 'Toggle language',
        languageLabel: 'English',
        footer: '© 2025 Red December • Ministry of Health'
      }
    }
  };

  /**
   * Translation helper function
   * @param {string} language - The current language ('en' or 'pt-br')
   * @param {string} key - The translation key path (e.g., 'home.heroTitle')
   * @returns {string} The translated string
   */
  function t(language, key) {
    const keys = key.split('.');
    let value = TRANSLATIONS[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to Portuguese if key not found
        value = TRANSLATIONS['pt-br'];
        for (const k2 of keys) {
          if (value && typeof value === 'object') {
            value = value[k2];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    return value || key;
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
  function Home({ onNavigate, theme, toggleTheme, language, toggleLanguage }) {
    return React.createElement('div', { className: 'page fade-in' },
      // Theme toggle button (fixed position)
      React.createElement('button', {
        className: 'theme-toggle-btn',
        onClick: toggleTheme,
        'aria-label': t(language, 'common.themeToggleAria')
      }, theme === 'light' ? '🌙' : '☀️'),

      // Language toggle button (fixed position)
      React.createElement('button', {
        className: 'language-toggle-btn',
        onClick: toggleLanguage,
        'aria-label': t(language, 'common.languageToggleAria')
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN'),

      // Hero section with gradient glass card
      React.createElement('section', { className: 'hero hero-gradient glass-card' },
        React.createElement('div', { className: 'hero-header' },
          React.createElement('div', { className: 'hero-content' },
            React.createElement('h1', { className: 'hero-title' }, t(language, 'home.heroTitle')),
            React.createElement('p', { className: 'hero-lede' }, t(language, 'home.heroDesc'))
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
            React.createElement('h2', { className: 'choice-title' }, t(language, 'home.cardApresentacao.title')),
            React.createElement('p', { className: 'choice-desc' }, ''),
            React.createElement('div', { className: 'actions' },
              React.createElement('button', { className: 'btn btn-primary' }, t(language, 'home.cardApresentacao.button'))
            )
          ),

          // Card 2: Quiz
          React.createElement('article', {
            className: 'choice-card glass-card card-hover',
            onClick: () => onNavigate('quiz')
          },
            React.createElement('div', { className: 'choice-icon' }, '📊'),
            React.createElement('h2', { className: 'choice-title' }, t(language, 'home.cardQuiz.title')),
            React.createElement('p', { className: 'choice-desc' }, ''),
            React.createElement('div', { className: 'actions' },
              React.createElement('button', { className: 'btn btn-green' }, t(language, 'home.cardQuiz.button'))
            )
          )
        )
      ),

      React.createElement('div', { className: 'app-footer-line' },
        React.createElement('span', null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
        React.createElement('button', {
          className: 'footer-lang-toggle',
          onClick: toggleLanguage,
          'aria-label': t(language, 'common.languageToggleAria'),
          style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      )
    );
  }

  // Presentation page component
  function PresentationPage({ presentation, onBack, theme, toggleTheme, language, toggleLanguage }) {
    if (!presentation) {
      return React.createElement('div', { className: 'page fade-in' },
        React.createElement('p', null, t(language, 'apresentacao.loading'))
      );
    }

    const audioSrc = presentation.audioDescription && presentation.audioDescription.src;
    const isPlaying = useAudioState(audioSrc);

    // Hide audio button when English selected (audio only available in Portuguese)
    const showAudioButton = language === 'pt-br';

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
        }, `← ${t(language, 'nav.voltar')}`),
        React.createElement('div', { className: 'page-header-content' },
          React.createElement('h1', { className: 'page-title' }, t(language, 'apresentacao.title')),
          React.createElement('p', { className: 'page-subtle' }, t(language, 'apresentacao.subtitle'))
        ),
        React.createElement('button', {
          className: 'theme-toggle-btn',
          onClick: toggleTheme,
          'aria-label': t(language, 'common.themeToggleAria')
        }, theme === 'light' ? '🌙' : '☀️'),
        React.createElement('button', {
          className: 'language-toggle-btn',
          onClick: toggleLanguage,
          'aria-label': t(language, 'common.languageToggleAria')
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      ),

      // Presentation card
      React.createElement('div', { className: 'presentation-card' },
        React.createElement('div', { className: 'presentation-heroimg-wrapper' },
          React.createElement('img', {
            src: presentation.heroImage,
            alt: t(language, 'apresentacao.subtitle')
          })
        ),
        React.createElement('div', {
          className: 'presentation-textblock',
          dangerouslySetInnerHTML: { __html: presentation.introHtml }
        }),
        showAudioButton && audioSrc &&
          React.createElement('div', { className: 'audio-row' },
            React.createElement('button', {
              className: 'audio-btn',
              type: 'button',
              'aria-pressed': isPlaying ? 'true' : 'false',
              onClick: () => toggleAudio(audioSrc)
            }, isPlaying ? t(language, 'apresentacao.audioBtnPause') : t(language, 'apresentacao.audioBtnPlay'))
          )
      ),

      React.createElement('div', { className: 'app-footer-line' },
        React.createElement('span', null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
        React.createElement('button', {
          className: 'footer-lang-toggle',
          onClick: toggleLanguage,
          'aria-label': t(language, 'common.languageToggleAria'),
          style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      )
    );
  }

  // Quiz page component
  function QuizPage({ questions, onComplete, theme, toggleTheme, language, toggleLanguage }) {
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

    // Track question view when question changes
    React.useEffect(() => {
      if (selected.length > 0 && selected[currentIndex]) {
        const current = selected[currentIndex];
        AnalyticsTracker.trackQuestionView(
          current.id,
          currentIndex + 1,
          current.prompt
        );
      }
    }, [currentIndex, selected]);

    if (!questions || questions.length === 0) {
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
        React.createElement('p', null, t(language, 'quiz.loading'))
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
      const isCorrect = selectedOption === current.correctIndex;

      // Track answer selection
      AnalyticsTracker.trackAnswerSelection(
        current.id,
        currentIndex + 1,
        current.choices[selectedOption],
        isCorrect
      );

      if (isCorrect) {
        setScore(score + 1);
      }
    }

    function handleNext() {
      // Stop any currently playing or paused audio before moving to next question
      if (currentSound) {
        console.log('Stopping audio before moving to next question');
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

    // Hide audio button when English selected (audio only available in Portuguese)
    const showAudioButton = language === 'pt-br';

    return React.createElement('div', { className: 'min-h-screen fade-in flex flex-col items-center justify-start p-6 md:p-10' },
      React.createElement('div', { className: 'w-full max-w-3xl glass-effect rounded-xl p-6 md:p-8' },
        React.createElement('div', { className: 'mb-4 flex justify-between items-center' },
          React.createElement('div', { className: 'text-gray-400 text-sm' }, `${t(language, 'quiz.questionLabel')} ${currentIndex + 1}/5`),
          React.createElement('div', { className: 'text-gray-400 text-sm' }, `${t(language, 'quiz.scoreLabel')}: ${score}/${currentIndex + (answered ? 1 : 0)}`)
        ),
        React.createElement('div', { className: 'flex items-start justify-between gap-4 mb-6' },
          React.createElement('h2', { className: 'text-2xl font-semibold flex-1 quiz-question-text' }, current.prompt),
          showAudioButton && React.createElement(AudioButton, {
            src: `assets/audio/${current.id}.mp3`,
            ariaLabel: t(language, 'quiz.listenQuestion'),
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
          }, t(language, 'quiz.confirmBtn')),
          answered && React.createElement('button', {
            className: 'button-modern gradient-accent text-white px-4 py-2 rounded-lg',
            onClick: handleNext
          }, currentIndex < selected.length - 1 ? t(language, 'quiz.nextBtn') : t(language, 'quiz.finishBtn'))
        )
      ),
      React.createElement('button', {
        className: 'theme-toggle-btn',
        onClick: toggleTheme,
        'aria-label': t(language, 'common.themeToggleAria')
      }, theme === 'light' ? '🌙' : '☀️'),

      React.createElement('button', {
        className: 'language-toggle-btn',
        onClick: toggleLanguage,
        'aria-label': t(language, 'common.languageToggleAria')
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN'),

      React.createElement('div', { className: 'app-footer-line' },
        React.createElement('span', null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
        React.createElement('button', {
          className: 'footer-lang-toggle',
          onClick: toggleLanguage,
          'aria-label': t(language, 'common.languageToggleAria'),
          style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      )
    );
  }

  // Result page component
  function ResultPage({ score, onRestart, theme, toggleTheme, language, toggleLanguage }) {
    const percentage = (score / 5) * 100;
    let message;
    if (percentage === 100) {
      message = t(language, 'result.message100');
    } else if (percentage >= 80) {
      message = t(language, 'result.message80');
    } else if (percentage >= 60) {
      message = t(language, 'result.message60');
    } else {
      message = t(language, 'result.messageDefault');
    }

    // Play celebratory sound for perfect score
    React.useEffect(() => {
      if (score === 5) {
        // Stop any currently playing audio first
        if (currentSound) {
          currentSound.stop();
          currentSound.unload();
          currentSound = null;
          currentAudioSrc = null;
          notifyAudioStateChange();
        }

        // Play celebration fanfare sound
        const celebrationSound = new Howl({
          src: ['assets/audio/success-fanfare-trumpets-6185.mp3'],
          volume: 0.5,
          onload: () => {
            console.log('Celebration fanfare loaded successfully');
          },
          onloaderror: (id, error) => {
            console.log('Celebration sound file not found:', error);
          },
          onplayerror: (id, error) => {
            console.log('Error playing celebration sound:', error);
          }
        });
        celebrationSound.play();

        // Cleanup
        return () => {
          if (celebrationSound) {
            celebrationSound.stop();
            celebrationSound.unload();
          }
        };
      }
    }, [score]);

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
        React.createElement('h2', { className: 'text-3xl md:text-4xl font-bold mb-4 quiz-result-title' }, t(language, 'result.title')),
        React.createElement('div', { className: 'text-2xl font-bold mb-4 text-green-500' },
          `${t(language, 'result.scoreLabel')}: ${score}/5 (${percentage}%)`
        ),
        React.createElement('p', { className: 'text-lg mb-8 quiz-result-message' }, message),
        React.createElement('p', { className: 'text-base mb-8 quiz-result-thanks' },
          t(language, 'result.thanks')
        ),
        React.createElement('button', {
          className: 'button-modern gradient-secondary text-white px-6 py-3 rounded-lg',
          onClick: onRestart
        }, t(language, 'result.restartBtn'))
      ),
      React.createElement('button', {
        className: 'theme-toggle-btn',
        onClick: toggleTheme,
        'aria-label': t(language, 'common.themeToggleAria')
      }, theme === 'light' ? '🌙' : '☀️'),

      React.createElement('button', {
        className: 'language-toggle-btn',
        onClick: toggleLanguage,
        'aria-label': t(language, 'common.languageToggleAria')
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN'),

      React.createElement('div', { className: 'app-footer-line' },
        React.createElement('span', null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
        React.createElement('button', {
          className: 'footer-lang-toggle',
          onClick: toggleLanguage,
          'aria-label': t(language, 'common.languageToggleAria'),
          style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      )
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

        // Track theme toggle
        AnalyticsTracker.trackThemeToggle(next);

        return next;
      });
    }, []);

    React.useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return { theme, toggleTheme };
  }

  /* --------------- Language Management --------------- */
  function useLanguage() {
    const [language, setLanguage] = React.useState(() => {
      // 1. Check URL parameter first (?lang=en)
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam === 'en' || langParam === 'pt-br' || langParam === 'pt') {
        return langParam === 'en' ? 'en' : 'pt-br';
      }

      // 2. Check localStorage
      const saved = localStorage.getItem('quiz-hiv-aids-language');
      if (saved === 'en' || saved === 'pt-br') {
        return saved;
      }

      // 3. Browser language detection (default)
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang && browserLang.toLowerCase().startsWith('en')) {
        return 'en';
      }

      // 4. Default to Portuguese
      return 'pt-br';
    });

    const toggleLanguage = React.useCallback(() => {
      setLanguage(current => {
        const next = current === 'en' ? 'pt-br' : 'en';
        localStorage.setItem('quiz-hiv-aids-language', next);
        document.documentElement.setAttribute('lang', next);

        // Update URL parameter
        const url = new URL(window.location);
        url.searchParams.set('lang', next);
        window.history.pushState({}, '', url);

        // Track language change
        AnalyticsTracker.trackLanguageToggle(next);

        return next;
      });
    }, []);

    // Apply language on mount
    React.useEffect(() => {
      document.documentElement.setAttribute('lang', language);
    }, [language]);

    return { language, toggleLanguage };
  }

  function App() {
    const { presentation, questions } = useFetchData();
    const [page, setPage] = React.useState(() => {
      // Initialize page based on hash
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'apresentacao' || hash === 'apresentação') return 'presentation';
      return 'home';
    });
    const [finalScore, setFinalScore] = React.useState(0);
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage } = useLanguage();

    // Listen to hash changes
    React.useEffect(() => {
      function handleHashChange() {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (hash === 'apresentacao' || hash === 'apresentação') {
          setPage('presentation');
        } else if (hash === '' || hash === 'home') {
          setPage('home');
        }
      }

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Hidden reset for staff: 5 taps on top-left corner resets to home
    const [tapCount, setTapCount] = React.useState(0);
    React.useEffect(() => {
      if (tapCount >= 5) {
        setPage('home');
        window.location.hash = '';
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

      // Track quiz completion
      const totalQuestions = 5;
      const percentage = (score / totalQuestions) * 100;
      AnalyticsTracker.trackQuizCompletion(score, totalQuestions, percentage);

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

      // Track page navigation
      const pageNames = {
        'home': 'Home',
        'presentation': 'Apresentação',
        'quiz': 'Quiz',
        'result': 'Resultado'
      };
      if (pageNames[newPage]) {
        AnalyticsTracker.trackPageView(newPage, pageNames[newPage]);
      }

      // Update hash based on page
      if (newPage === 'presentation') {
        window.location.hash = 'apresentacao';
      } else if (newPage === 'home') {
        window.location.hash = '';
      }
    }

    let content = null;
    if (page === 'home') {
      content = React.createElement(Home, { onNavigate: handleNavigate, theme, toggleTheme, language, toggleLanguage });
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
          window.location.hash = '';
        },
        theme, toggleTheme, language, toggleLanguage
      });
    } else if (page === 'quiz') {
      content = React.createElement(QuizPage, {
        questions,
        onComplete: handleQuizComplete,
        theme, toggleTheme, language, toggleLanguage
      });
    } else if (page === 'result') {
      content = React.createElement(ResultPage, {
        score: finalScore,
        onRestart: handleRestart,
        theme, toggleTheme, language, toggleLanguage
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