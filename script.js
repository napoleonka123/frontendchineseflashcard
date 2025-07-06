
    // Fetch vocabulary data from server
    async function fetchVocabFromServer() {
  try {
    const response = await fetch('https://chineseflashcard.onrender.com/api/vocab');
    if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('❌ Lỗi khi tải từ vựng:', error);
    return [];
  }
}


     

        // Application state
        let currentVocab = [];
        let currentIndex = 0;
        let history = [];
        let currentUser = null;
        let learnedWords = [];
        let allVocab = [];        // chứa toàn bộ từ từ server
        let quizHistory = []; // Danh sách các từ đã hỏi trong quiz
        let masteredWords = []; // Danh sách các từ đã thuộc (mastered)


        // DOM Elements
        const flashcard = document.getElementById('flashcard');
        const chineseWord = document.getElementById('chineseWord');
        const pinyin = document.getElementById('pinyin');
        const meaning = document.getElementById('meaning');
        const example = document.getElementById('example');
        const exampleMeaning = document.getElementById('exampleMeaning');
        const synonym = document.getElementById('synonym');
        const level = document.getElementById('level');
        const topic = document.getElementById('topic');
        const hskFilter = document.getElementById('hskFilter');
        const topicFilter = document.getElementById('topicFilter');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const speakBtn = document.getElementById('speakBtn');
        const learnedBtn = document.getElementById('learnedBtn');
        const masteredBtn = document.getElementById('masteredBtn');

        const totalWords = document.getElementById('totalWords');
        const learnedCount = document.getElementById('learnedCount');
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeIcon = document.getElementById('darkModeIcon');

        // User management elements
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const myWordsBtn = document.getElementById('myWordsBtn');
        const userGreeting = document.getElementById('userGreeting');
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        const myWordsModal = document.getElementById('myWordsModal');

        // Initialize app
        async function init() {
        allVocab = await fetchVocabFromServer(); //  lấy dữ liệu gốc
        filterVocabulary();                       //  lọc ra currentVocab
        updateDisplay();
        updateStats();
        loadUserData();
        initDarkMode();
}




        // Dark mode functions
        function initDarkMode() {
            const savedTheme = getDarkModeSetting();
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        }

        function toggleDarkMode() {
            if (document.documentElement.classList.contains('dark')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        }

        function enableDarkMode() {
            document.documentElement.classList.add('dark');
            darkModeIcon.textContent = '☀️';
            saveDarkModeSetting('dark');
        }

        function disableDarkMode() {
            document.documentElement.classList.remove('dark');
            darkModeIcon.textContent = '🌙';
            saveDarkModeSetting('light');
        }

        function getDarkModeSetting() {
            // In a real app, this would use localStorage
            return window.darkModeSetting || null;
        }

        function saveDarkModeSetting(theme) {
            // In a real app, this would save to localStorage
            window.darkModeSetting = theme;
        }

        // Filter vocabulary based on selected criteria
function filterVocabulary() {
  const hskLevel = hskFilter.value;
  const selectedTopic = topicFilter.value;

  currentVocab = allVocab.filter(word => {
    const matchHSK = !hskLevel || word.level === hskLevel;
    const matchTopic = !selectedTopic || word.topic === selectedTopic;
    const notMastered = !masteredWords.some(w => w._id === word._id);
    return matchHSK && matchTopic && notMastered;
  });

  if (currentVocab.length === 0) {
    currentVocab = allVocab.filter(
      word => !masteredWords.some(w => w._id === word._id)
    );
  }

  if (currentVocab.length === 0) {
    alert('🎉 Bạn đã mastered hết các từ!');
  }

  currentIndex = 0;
  history = [];
}



        // Update display with current word
        function updateDisplay() {
            if (currentVocab.length === 0) return;

            const word = currentVocab[currentIndex];
            chineseWord.textContent = word.word;
            pinyin.textContent = word.pinyin;
            meaning.textContent = word.meaning;
        // Highlight từ đang học trong ví dụ
        const highlight = `<span class="text-red-400 font-bold">${word.word}</span>`;

        example.innerHTML = word.example.replaceAll(word.word, highlight);
            exampleMeaning.textContent = word.exampleMeaning;
            synonym.textContent = word.synonym;
            level.textContent = word.level;
            topic.textContent = word.topic;

            // Reset card to front
            flashcard.classList.remove('flipped');

            // Update navigation buttons
            prevBtn.disabled = history.length === 0;
        }

        // Update statistics
        function updateStats() {
            totalWords.textContent = currentVocab.length;

            const hskLevel = hskFilter.value;
            const selectedTopic = topicFilter.value;

            // Lọc từ đã học theo bộ lọc hiện tại
            const filteredLearned = learnedWords.filter(word => {
                const matchHSK = !hskLevel || word.level === hskLevel;
                const matchTopic = !selectedTopic || word.topic === selectedTopic;
                return matchHSK && matchTopic;
            });

            learnedCount.textContent = masteredWords.length;
        }



        // Get random word
        function getRandomWord() {
            if (currentVocab.length <= 1) return 0;
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * currentVocab.length);
            } while (newIndex === currentIndex);
            return newIndex;
        }

        // Text-to-speech function
        function speakChinese(text) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'zh-CN';
                utterance.rate = 0.8;
                speechSynthesis.speak(utterance);
            } else {
                alert('Trình duyệt không hỗ trợ text-to-speech');
            }
        }

        // User management functions
        function login(username, password) {
            // Simple mock login
            if (username && password) {
                currentUser = username;
                updateUserInterface();
                loadLearnedWords();
                return true;
            }
            return false;
        }

        function logout() {
  currentUser = null;
  learnedWords = [];
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  updateUserInterface();
  updateStats();
}


        function updateUserInterface() {
            if (currentUser) {
                userGreeting.textContent = `Xin chào, ${currentUser}!`;
                loginBtn.classList.add('hidden');
                registerBtn.classList.add('hidden');
                logoutBtn.classList.remove('hidden');
                myWordsBtn.classList.remove('hidden');
                learnedBtn.classList.remove('hidden');
                    masteredBtn.classList.remove('hidden'); // ✅ THÊM DÒNG NÀY

            } else {
                userGreeting.textContent = 'Chưa đăng nhập';
                loginBtn.classList.remove('hidden');
                registerBtn.classList.remove('hidden');
                logoutBtn.classList.add('hidden');
                myWordsBtn.classList.add('hidden');
                learnedBtn.classList.add('hidden');
                masteredBtn.classList.add('hidden'); // ✅ THÊM DÒNG NÀY
            }
        }

       
        function loadUserData() {
  const savedToken = localStorage.getItem('token');
  const savedUsername = localStorage.getItem('username');

  if (savedToken && savedUsername) {
    currentUser = savedUsername;
    updateUserInterface();
    loadLearnedWords();
    loadMasteredWords();
  }
}


async function loadLearnedWords() {
  learnedWords = [];

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('https://chineseflashcard.onrender.com/api/vocab/learned', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Không tải được từ đã học');
    learnedWords = await res.json();
    updateStats();
  } catch (err) {
    console.error('❌', err);
  }
}
async function loadMasteredWords() {
  masteredWords = [];

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('https://chineseflashcard.onrender.com/api/vocab/mastered', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Không tải được từ mastered');
    masteredWords = await res.json();
    updateStats();

    filterVocabulary();         // ✅ THÊM DÒNG NÀY
    updateDisplay();            // ✅ THÊM DÒNG NÀY
  } catch (err) {
    console.error('❌', err);
  }
}


async function markAsMastered() {
  if (!currentUser || currentVocab.length === 0) return;

  const currentWord = currentVocab[currentIndex];
  const alreadyMastered = masteredWords.some(w => w._id === currentWord._id);
  if (alreadyMastered) return;

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('https://chineseflashcard.onrender.com/api/vocab/mastered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ wordId: currentWord._id })
    });

    if (!res.ok) throw new Error('Lỗi khi lưu từ mastered');
    masteredWords.push(currentWord);

    // Cập nhật UI
    updateStats();
      nextBtn.click(); // chuyển sang từ khác
  } catch (err) {
    alert('❌ ' + err.message);
  }
}





async function markAsLearned() {
  if (!currentUser || currentVocab.length === 0) return;

  const currentWord = currentVocab[currentIndex];
  const isAlreadyLearned = learnedWords.some(w => w._id === currentWord._id);

  if (isAlreadyLearned) return;

  try {
    const token = localStorage.getItem('token');

    const res = await fetch('https://chineseflashcard.onrender.com/api/vocab/learned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ wordId: currentWord._id })
    });

    if (!res.ok) throw new Error('Lỗi khi lưu từ đã học');

    learnedWords.push(currentWord);
    updateStats();

    // Hiệu ứng nút đã học
    learnedBtn.textContent = '✓ Đã thêm!';
    learnedBtn.classList.remove('bg-green-500');
    setTimeout(() => {
      learnedBtn.textContent = 'Đang học';
      learnedBtn.classList.add('bg-green-500');
    }, 500);
  } catch (err) {
    alert('❌ ' + err.message);
  }
}


        function displayMyWords() {
            const myWordsList = document.getElementById('myWordsList');
            myWordsList.innerHTML = '';

            if (learnedWords.length === 0) {
                myWordsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">Chưa có từ nào được học.</p>';
            } else {
                learnedWords.forEach(word => {
                    const wordElement = document.createElement('div');
                    wordElement.className = 'flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg theme-transition';
                    wordElement.innerHTML = `
                        <div>
                            <span class="chinese-font text-lg font-semibold text-gray-900 dark:text-white">${word.word}</span>
                            <span class="text-gray-600 dark:text-gray-300 ml-2">${word.pinyin}</span>
                            <span class="text-gray-800 dark:text-gray-200 ml-2">- ${word.meaning}</span>
                        </div>
                        <span class="text-sm text-gray-500 dark:text-gray-400">${word.level}</span>
                    `;
                    myWordsList.appendChild(wordElement);
                });
            }
        }

 

        // Event Listeners
        flashcard.addEventListener('click', () => {
            flashcard.classList.toggle('flipped');
        });

        function animateFlashcardTransition(callback) {
        flashcard.classList.add('fade-out');

        setTimeout(() => {
            callback(); // cập nhật nội dung thẻ
            flashcard.classList.remove('fade-out');
            flashcard.classList.add('fade-in');

            setTimeout(() => {
            flashcard.classList.remove('fade-in');
            }, 200);
        }, 200);
        }


            nextBtn.addEventListener('click', () => {
            if (currentVocab.length === 0) return;

            const unlearned = currentVocab.filter(word =>
                !learnedWords.some(learned => learned._id === word._id)
            );

            if (unlearned.length === 0) {
                alert('🎉 Bạn đã học hết các từ trong bộ lọc hiện tại!');
                return;
            }

            const randomIndex = Math.floor(Math.random() * unlearned.length);
            const nextWord = unlearned[randomIndex];

            const vocabIndex = currentVocab.findIndex(w => w._id === nextWord._id);
            if (vocabIndex !== -1) {
                history.push(currentIndex);
                currentIndex = vocabIndex;
                animateFlashcardTransition(updateDisplay);
            }
            });



        prevBtn.addEventListener('click', () => {
            if (history.length === 0) return;
            
            currentIndex = history.pop();
            updateDisplay();
        });

        speakBtn.addEventListener('click', () => {
            if (currentVocab.length > 0) {
                speakChinese(currentVocab[currentIndex].word);
            }
        });

        learnedBtn.addEventListener('click', markAsLearned);

        darkModeToggle.addEventListener('click', toggleDarkMode);

        hskFilter.addEventListener('change', () => {
            filterVocabulary();
            updateDisplay();
            updateStats();
        });

        topicFilter.addEventListener('change', () => {
            filterVocabulary();
            updateDisplay();
            updateStats();
        });

        // User interface event listeners
        loginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });

        registerBtn.addEventListener('click', () => {
            registerModal.classList.remove('hidden');
        });

        logoutBtn.addEventListener('click', logout);

        myWordsBtn.addEventListener('click', () => {
            displayMyWords();
            myWordsModal.classList.remove('hidden');
        });

        document.getElementById('confirmLoginBtn').addEventListener('click', async () => {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
    const success = await loginWithAPI(username, password); // ✅ Dùng hàm thật
    if (success) {
        loginModal.classList.add('hidden');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }
        });
// Handle Enter key for login
document.getElementById('loginUsername').addEventListener('keydown', handleLoginEnter);
document.getElementById('loginPassword').addEventListener('keydown', handleLoginEnter);


function handleLoginEnter(e) {
  if (e.key === 'Enter') {
    document.getElementById('confirmLoginBtn').click();
  }
}

// Thêm sự kiện Enter cho modal đăng ký
document.getElementById('registerUsername').addEventListener('keydown', handleRegisterEnter);
document.getElementById('registerPassword').addEventListener('keydown', handleRegisterEnter);
document.getElementById('registerConfirmPassword').addEventListener('keydown', handleRegisterEnter);

function handleRegisterEnter(e) {
  if (e.key === 'Enter') {
    document.getElementById('confirmRegisterBtn').click();
  }
}


        document.getElementById('cancelLoginBtn').addEventListener('click', () => {
            loginModal.classList.add('hidden');
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        });
        // Register modal
        const showRegisterLink = document.getElementById('showRegister');
        
        showRegisterLink.addEventListener('click', (e) => {
        loginModal.classList.add('hidden');
          e.preventDefault(); // Ngăn chuyển trang
          registerModal.classList.remove('hidden');
        });
        
        const showLoginLink = document.getElementById('showLogin');
        showLoginLink.addEventListener('click', (e) => {
            registerModal.classList.add('hidden');
            e.preventDefault(); // Ngăn chuyển trang
            loginModal.classList.remove('hidden');
        });


        document.getElementById('cancelRegisterBtn').addEventListener('click', () => {
        registerModal.classList.add('hidden');
        });

        


        document.getElementById('closeModalBtn').addEventListener('click', () => {
            myWordsModal.classList.add('hidden');
        });

        // Close modals when clicking outside
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.add('hidden');
            }
        });
        registerModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                registerModal.classList.add('hidden');
            }
        });


        myWordsModal.addEventListener('click', (e) => {
            if (e.target === myWordsModal) {
                myWordsModal.classList.add('hidden');
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    prevBtn.click();
                    break;
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    nextBtn.click();
                    break;
                case 'Enter':
                    // ❌ Nếu đang mở modal đăng nhập hoặc đăng ký thì KHÔNG lật
  const isLoginOpen = !loginModal.classList.contains('hidden');
  const isRegisterOpen = !registerModal.classList.contains('hidden');

  if (!isLoginOpen && !isRegisterOpen) {
    flashcard.click();
  }
                    break;
                case 's':
                case 'S':
                    speakBtn.click();
                    break;
            }
        });

        async function loginWithAPI(username, password) {
  try {
    const res = await fetch('https://chineseflashcard.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const msg = await res.json();
      throw new Error(msg.message || 'Đăng nhập thất bại');
    }

    const data = await res.json();

    // ✅ Lưu token vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    currentUser = data.username;
    updateUserInterface();
    loadLearnedWords();
    loadMasteredWords();      


    return true;
  } catch (err) {
    alert('❌ ' + err.message);
    return false;
  }
}

async function registerWithAPI(username, password) {
  try {
    const res = await fetch('https://chineseflashcard.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const msg = await res.json();
      throw new Error(msg.message || 'Đăng ký thất bại');
    }

    alert('✅ Đăng ký thành công! Bạn có thể đăng nhập.');
    return true;
  } catch (err) {
    alert('❌ ' + err.message);
    return false;
  }
}


document.getElementById('confirmRegisterBtn').addEventListener('click', async () => {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  if (!username || !password || !confirmPassword) {
    alert('Vui lòng nhập đầy đủ thông tin!');
    return;
  }

  if (password !== confirmPassword) {
    alert('❌ Mật khẩu không khớp!');
    return;
  }

  const success = await registerWithAPI(username, password);
  if (success) {
    registerModal.classList.add('hidden');
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
  }
});


// Show quiz from learned words
function showQuizFromLearned() {
  if (learnedWords.length === 0 || allVocab.length === 0) {
    alert('❌ Chưa có đủ dữ liệu để làm quiz!');
    return;
  }

  // 1. Lọc HSK nếu có chọn
  const selectedHsk = document.getElementById('quizHskFilter').value;
let filteredLearned = learnedWords.filter(
  w => !masteredWords.some(m => m._id === w._id)
);

  if (selectedHsk) {
    filteredLearned = learnedWords.filter(w => w.level === selectedHsk);
  }

  // 2. Chống lặp từ
  const unaskedWords = filteredLearned.filter(word =>
    !quizHistory.some(prev => prev._id === word._id)
  );

  if (unaskedWords.length === 0) {
    quizHistory = []; // reset lịch sử
    alert('🎉 Bạn đã luyện hết các từ trong HSK này!');
    return;
  }

  const word = unaskedWords[Math.floor(Math.random() * unaskedWords.length)];
  quizHistory.push(word);

  // Hiển thị Quiz như cũ
  const correctMeaning = word.meaning;
  document.getElementById('quizWord').textContent = word.word;
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const nextQuizBtn = document.getElementById('nextQuizBtn');

  quizOptions.innerHTML = '';
  quizFeedback.textContent = '';
  nextQuizBtn.classList.add('hidden');

  const wrongChoices = allVocab
    .filter(w => w.meaning !== correctMeaning)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(w => w.meaning);

  const allChoices = [...wrongChoices, correctMeaning].sort(() => 0.5 - Math.random());

  allChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.className = 'bg-gray-100 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-blue-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition font-medium';
    btn.addEventListener('click', () => {
      if (choice === correctMeaning) {
        quizFeedback.innerHTML = `<span class="text-green-600">✔️ Chính xác!</span>`;
        nextQuizBtn.classList.remove('hidden');
      } else {
        quizFeedback.innerHTML = `<span class="text-red-600">❌ Sai. Đáp án đúng là: <strong>${correctMeaning}</strong></span>`;
      }
    });
    quizOptions.appendChild(btn);
  });
}





document.getElementById('nextQuizBtn').addEventListener('click', () => {
  showQuizFromLearned();
});

const quizSection = document.getElementById('quizSection');
const flashcardSection = document.getElementById('flashcard'); // là thẻ div chứa flashcard
const controlButtons = document.querySelector('.flex.justify-center.items-center.space-x-4.mt-8'); // phần Prev / Next

document.getElementById('flashcardModeBtn').addEventListener('click', () => {
  quizSection.classList.add('hidden');
  flashcardSection.classList.remove('hidden');
  controlButtons?.classList.remove('hidden');
});

document.getElementById('quizModeBtn').addEventListener('click', () => {
  quizSection.classList.remove('hidden');
  flashcardSection.classList.add('hidden');
  controlButtons?.classList.add('hidden');
  showQuizFromLearned();
});

masteredBtn.addEventListener('click', markAsMastered);

        // Initialize the application
        init();