// JAJANADZE FLIX - Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentUser: null,
    currentFilter: 'all',
    searchQuery: '',
    visibleVideosCount: 8,
    activeVideo: null,
    timerSecondsLeft: 120, // 2 minutes countdown
    timerInterval: null,
    generatedOtp: null,
    userLikes: JSON.parse(localStorage.getItem('jajanadze_likes') || '{}'),
    customComments: JSON.parse(localStorage.getItem('jajanadze_comments') || '{}')
  };

  // DOM Elements
  const introOverlay = document.getElementById('introOverlay');
  const introStartScreen = document.getElementById('introStartScreen');
  const introStage = document.getElementById('introStage');
  const btnEnterFlix = document.getElementById('btnEnterFlix');
  const btnSkipIntro = document.getElementById('btnSkipIntro');

  const authOverlay = document.getElementById('authOverlay');
  const authForm = document.getElementById('authForm');
  const mathAnswerInput = document.getElementById('mathAnswerInput');
  const btnVerifyAnswer = document.getElementById('btnVerifyAnswer');
  const mathErrorMsg = document.getElementById('mathErrorMsg');

  const videoGrid = document.getElementById('videoGrid');
  const filterChips = document.querySelectorAll('.filter-chip');
  const searchInput = document.getElementById('searchInput');
  const btnLoadMore = document.getElementById('btnLoadMore');

  const playerModal = document.getElementById('playerModal');
  const playerIframe = document.getElementById('playerIframe');
  const playerTitle = document.getElementById('playerTitle');
  const playerViews = document.getElementById('playerViews');
  const playerCategory = document.getElementById('playerCategory');
  const playerYear = document.getElementById('playerYear');
  const playerDesc = document.getElementById('playerDesc');
  const btnClosePlayer = document.getElementById('btnClosePlayer');
  const btnLikeVideo = document.getElementById('btnLikeVideo');
  const likeCountSpan = document.getElementById('likeCount');
  const btnOpenYoutube = document.getElementById('btnOpenYoutube');
  const commentsList = document.getElementById('commentsList');
  const commentInput = document.getElementById('commentInput');
  const btnSendComment = document.getElementById('btnSendComment');

  const timerPill = document.getElementById('timerPill');
  const timerText = document.getElementById('timerText');
  const announcementToast = document.getElementById('announcementToast');

  const bottomMusicBar = document.getElementById('bottomMusicBar');
  const btnMusicPlay = document.getElementById('btnMusicPlay');
  const btnMusicMute = document.getElementById('btnMusicMute');
  const volumeSlider = document.getElementById('volumeSlider');
  const userProfileBadge = document.getElementById('userProfileBadge');
  const currentUserName = document.getElementById('currentUserName');

  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const heroInfoBtn = document.getElementById('heroInfoBtn');

  // ==========================================================
  // 1. INTRO & ENTRANCE ANIMATION SEQUENCE
  // ==========================================================
  btnEnterFlix.addEventListener('click', () => {
    startCinematicIntro();
  });

  btnSkipIntro.addEventListener('click', () => {
    endCinematicIntro();
  });

  function startCinematicIntro() {
    jajanadzeAudio.initContext();
    introStartScreen.style.display = 'none';
    introStage.style.display = 'flex';

    // Play iconic Netflix "TA-DUM" boom!
    jajanadzeAudio.playTadum();

    // Voice proclamation: "დიდება ცირეკლიძე ჯაჯანაძეს ინგლისურის მცოდნეს"
    setTimeout(() => {
      jajanadzeAudio.speak("დიდება ცირეკლიძე ჯაჯანაძეს ინგლისურის მცოდნეს");
    }, 600);

    // End intro sequence after 4.5 seconds
    setTimeout(() => {
      endCinematicIntro();
    }, 4500);
  }

  function endCinematicIntro() {
    introOverlay.classList.add('hidden');
    checkUserAuth();
  }

  // ==========================================================
  // 2. MATH VERIFICATION (1+1)
  // ==========================================================
  function checkUserAuth() {
    const isVerified = sessionStorage.getItem('jajanadze_math_verified');
    if (isVerified) {
      state.currentUser = { name: 'მაყურებელი' };
      updateUserUI();
      initPlatformExperience();
      return;
    }
    // Show 1+1 question
    authOverlay.classList.remove('hidden');
    if (mathAnswerInput) {
      setTimeout(() => mathAnswerInput.focus(), 150);
    }
  }

  function updateUserUI() {
    if (state.currentUser) {
      currentUserName.textContent = state.currentUser.name || 'მომხმარებელი';
    }
  }

  function verifyMathAnswer() {
    if (!mathAnswerInput) return;
    const val = mathAnswerInput.value.trim().toLowerCase();

    // Check if answer is 2 or ორი or two
    if (val === '2' || val === 'ორი' || val === 'two') {
      jajanadzeAudio.playClick();
      sessionStorage.setItem('jajanadze_math_verified', 'true');
      state.currentUser = { name: 'მაყურებელი' };
      localStorage.setItem('jajanadze_user', JSON.stringify(state.currentUser));

      updateUserUI();
      authOverlay.classList.add('hidden');
      if (mathErrorMsg) mathErrorMsg.style.display = 'none';

      // Welcome speech
      jajanadzeAudio.speak("მოგესალმებით ჯაჯანაძე ფლიქსზე!");

      initPlatformExperience();
    } else {
      if (mathErrorMsg) mathErrorMsg.style.display = 'block';
      mathAnswerInput.style.borderColor = '#e50914';
      mathAnswerInput.focus();
      mathAnswerInput.select();
    }
  }

  if (btnVerifyAnswer) {
    btnVerifyAnswer.addEventListener('click', () => {
      verifyMathAnswer();
    });
  }

  if (mathAnswerInput) {
    mathAnswerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyMathAnswer();
      }
    });

    mathAnswerInput.addEventListener('input', () => {
      if (mathErrorMsg) mathErrorMsg.style.display = 'none';
      mathAnswerInput.style.borderColor = '#444444';
    });
  }

  // User Profile click: allows Logout or Reset
  userProfileBadge.addEventListener('click', () => {
    if (confirm("გსურთ საიტის თავიდან დაწყება?")) {
      sessionStorage.removeItem('jajanadze_math_verified');
      localStorage.removeItem('jajanadze_user');
      location.reload();
    }
  });

  // ==========================================================
  // 3. 2-MINUTE SPOKEN ANNOUNCEMENT ("დათოა სულელი ტვინიკოსი")
  // ==========================================================
  function startTwoMinuteTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);

    state.timerSecondsLeft = 120;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.timerSecondsLeft--;

      if (state.timerSecondsLeft <= 0) {
        triggerDatoAnnouncement();
        state.timerSecondsLeft = 120; // reset to 2 minutes
      }

      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timerSecondsLeft / 60);
    const secs = state.timerSecondsLeft % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    timerText.textContent = `დათო: ${formatted}`;
  }

  function triggerDatoAnnouncement() {
    // 1. Spoken by Web Speech API
    jajanadzeAudio.speak("დათოა სულელი ტვინიკოსი");

    // 2. Visible animated banner
    announcementToast.classList.add('visible');
    setTimeout(() => {
      announcementToast.classList.remove('visible');
    }, 6000);
  }

  // Instant Test Click on Timer Pill
  timerPill.addEventListener('click', () => {
    triggerDatoAnnouncement();
  });

  // ==========================================================
  // 4. VIDEO CATALOG RENDERING & INFINITE SCROLL
  // ==========================================================
  function renderVideos() {
    let list = JAJANADZE_VIDEOS;

    // Filter by Category
    if (state.currentFilter !== 'all') {
      list = list.filter(v => v.category === state.currentFilter);
    }

    // Search Query Filter
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.description.toLowerCase().includes(q) ||
        v.categoryName.toLowerCase().includes(q)
      );
    }

    const toShow = list.slice(0, state.visibleVideosCount);
    videoGrid.innerHTML = '';

    if (toShow.length === 0) {
      videoGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">
          <i class="fa-solid fa-film" style="font-size: 3rem; margin-bottom: 15px; color: var(--netflix-red);"></i>
          <h3>ვიდეოები ვერ მოიძებნა</h3>
          <p>სცადეთ სხვა საძიებო სიტყვა ან კატეგორია.</p>
        </div>
      `;
      btnLoadMore.style.display = 'none';
      return;
    }

    toShow.forEach(video => {
      const isLiked = state.userLikes[video.id];
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${video.thumbnail}" class="card-thumb" alt="${video.title}" loading="lazy">
          <span class="card-overlay-badge">${video.badge || video.categoryName}</span>
          <span class="card-duration">${video.duration}</span>
          <div class="card-play-hover">
            <div class="play-circle-btn">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
        </div>
        <div class="card-info">
          <div class="card-meta-row">
            <span class="card-rating"><i class="fa-solid fa-star"></i> ${video.rating} Match</span>
            <span class="card-year">${video.year}</span>
          </div>
          <h4 class="card-title" title="${video.title}">${video.title}</h4>
          <div class="card-footer">
            <span><i class="fa-regular fa-eye"></i> ${video.views}</span>
            <span>${video.tag}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openVideoPlayer(video);
      });

      videoGrid.appendChild(card);
    });

    if (state.visibleVideosCount >= list.length) {
      btnLoadMore.style.display = 'none';
    } else {
      btnLoadMore.style.display = 'inline-block';
    }
  }

  // Category Filter Chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      jajanadzeAudio.playClick();
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentFilter = chip.dataset.category;
      state.visibleVideosCount = 8;
      renderVideos();
    });
  });

  // Header Navigation Links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      jajanadzeAudio.playClick();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const cat = link.dataset.category;
      state.currentFilter = cat;

      // Sync filter chip UI
      filterChips.forEach(c => {
        if (c.dataset.category === cat) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      state.visibleVideosCount = 8;
      renderVideos();

      // Smooth scroll to video section
      document.querySelector('.content-area').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Search Input with YouTube URL Auto-Detection
  searchInput.addEventListener('input', (e) => {
    const rawVal = e.target.value.trim();

    // Check if user pasted a direct YouTube link
    const ytMatch = rawVal.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const customVideo = {
        id: "custom_" + Date.now(),
        title: "პირდაპირი ვიდეო: " + rawVal,
        category: "special",
        categoryName: "YouTube ვიდეო",
        duration: "Direct",
        year: "2024",
        views: "1+",
        rating: "10.0",
        tag: "📺 პირდაპირი",
        youtubeId: ytMatch[1],
        searchQuery: rawVal,
        description: "მომხმარებლის მიერ ჩასმული ვიდეო YouTube-დან.",
        thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
        badge: "Direct Play"
      };
      openVideoPlayer(customVideo);
      searchInput.value = '';
      return;
    }

    state.searchQuery = rawVal;
    state.visibleVideosCount = 8;
    renderVideos();
  });

  // Load More Button
  btnLoadMore.addEventListener('click', () => {
    jajanadzeAudio.playClick();
    state.visibleVideosCount += 4;
    renderVideos();
  });

  // Infinite Scroll Listener
  window.addEventListener('scroll', () => {
    // Scrolled header background
    if (window.scrollY > 40) {
      document.querySelector('.site-header').classList.add('scrolled');
    } else {
      document.querySelector('.site-header').classList.remove('scrolled');
    }

    // Trigger load more near bottom
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 400) {
      let filteredCount = JAJANADZE_VIDEOS.length;
      if (state.visibleVideosCount < filteredCount) {
        state.visibleVideosCount += 4;
        renderVideos();
      }
    }
  });

  // ==========================================================
  // 5. IN-SITE VIDEO PLAYER MODAL & COMMENTS
  // ==========================================================
  function openVideoPlayer(video) {
    jajanadzeAudio.playClick();
    state.activeVideo = video;

    playerTitle.textContent = video.title;
    playerViews.textContent = `${video.views} ნახვა`;
    playerCategory.textContent = video.categoryName;
    playerYear.textContent = video.year;
    playerDesc.textContent = video.description;

    // Direct YouTube embed
    playerIframe.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`;

    // Watch directly on YouTube button
    btnOpenYoutube.onclick = () => {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery || video.title)}`, '_blank');
    };

    // Update Likes UI
    updateLikeButtonUI(video.id);

    // Render Comments
    renderComments(video.id);

    playerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // prevent bg scroll
  }

  function closeVideoPlayer() {
    playerModal.classList.add('hidden');
    playerIframe.src = '';
    document.body.style.overflow = 'auto';
  }

  btnClosePlayer.addEventListener('click', closeVideoPlayer);
  playerModal.addEventListener('click', (e) => {
    if (e.target === playerModal) closeVideoPlayer();
  });

  // Like Toggle
  btnLikeVideo.addEventListener('click', () => {
    if (!state.activeVideo) return;
    const vidId = state.activeVideo.id;
    state.userLikes[vidId] = !state.userLikes[vidId];
    localStorage.setItem('jajanadze_likes', JSON.stringify(state.userLikes));
    updateLikeButtonUI(vidId);
    jajanadzeAudio.playClick();
  });

  function updateLikeButtonUI(vidId) {
    const isLiked = state.userLikes[vidId];
    if (isLiked) {
      btnLikeVideo.classList.add('active');
      btnLikeVideo.innerHTML = `<i class="fa-solid fa-heart" style="color: #ff334b;"></i> მოწონებულია`;
    } else {
      btnLikeVideo.classList.remove('active');
      btnLikeVideo.innerHTML = `<i class="fa-regular fa-heart"></i> მოწონება`;
    }
  }

  // Comments Section
  function renderComments(vidId) {
    const videoCustomComments = state.customComments[vidId] || [];
    const allComments = [...videoCustomComments, ...JAJANADZE_COMMENTS];

    commentsList.innerHTML = '';
    allComments.forEach(c => {
      const el = document.createElement('div');
      el.className = 'comment-item';
      el.innerHTML = `
        <div class="comment-author-row">
          <span class="comment-author"><i class="fa-solid fa-user-circle"></i> ${c.user}</span>
          <span class="comment-time">${c.time}</span>
        </div>
        <p class="comment-text">${c.text}</p>
      `;
      commentsList.appendChild(el);
    });
  }

  btnSendComment.addEventListener('click', () => {
    const text = commentInput.value.trim();
    if (!text || !state.activeVideo) return;

    const vidId = state.activeVideo.id;
    if (!state.customComments[vidId]) state.customComments[vidId] = [];

    const newComment = {
      user: state.currentUser ? state.currentUser.name : 'მაყურებელი',
      text: text,
      time: 'ახლახან',
      likes: 1
    };

    state.customComments[vidId].unshift(newComment);
    localStorage.setItem('jajanadze_comments', JSON.stringify(state.customComments));

    commentInput.value = '';
    renderComments(vidId);
    jajanadzeAudio.playClick();
  });

  // ==========================================================
  // 6. HERO BANNER ACTIONS
  // ==========================================================
  heroPlayBtn.addEventListener('click', () => {
    // Open the featured video (video #1)
    if (JAJANADZE_VIDEOS.length > 0) {
      openVideoPlayer(JAJANADZE_VIDEOS[0]);
    }
  });

  heroInfoBtn.addEventListener('click', () => {
    if (JAJANADZE_VIDEOS.length > 0) {
      openVideoPlayer(JAJANADZE_VIDEOS[0]);
    }
  });

  // ==========================================================
  // 7. BACKGROUND THEME MUSIC & AUDIO CONTROLS
  // ==========================================================
  btnMusicPlay.addEventListener('click', () => {
    const isPlaying = jajanadzeAudio.toggleMusic();
    if (isPlaying) {
      btnMusicPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
      bottomMusicBar.classList.add('playing');
    } else {
      btnMusicPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
      bottomMusicBar.classList.remove('playing');
    }
  });

  btnMusicMute.addEventListener('click', () => {
    const isMuted = jajanadzeAudio.toggleMute();
    btnMusicMute.innerHTML = isMuted 
      ? '<i class="fa-solid fa-volume-xmark"></i>' 
      : '<i class="fa-solid fa-volume-high"></i>';
  });

  volumeSlider.addEventListener('input', (e) => {
    jajanadzeAudio.setVolume(e.target.value);
  });

  // ==========================================================
  // 8. PLATFORM INITIALIZATION
  // ==========================================================
  function initPlatformExperience() {
    renderVideos();
    startTwoMinuteTimer();

    // Start background synth music groove
    setTimeout(() => {
      jajanadzeAudio.startMusic();
      btnMusicPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
      bottomMusicBar.classList.add('playing');
    }, 800);
  }

  // Pre-render video grid so it's ready behind overlays
  renderVideos();
});
