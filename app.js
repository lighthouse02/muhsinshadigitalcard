/* ============================================
   MUHSIN & SYAQIELA — WEDDING DIGITAL CARD
   JavaScript — app.js
   ============================================ */

(function () {
  'use strict';

  /* =============================================
     0. STICKY NAVIGATION
  ============================================= */
  const siteNav     = document.getElementById('site-nav');
  const navHamburger = document.getElementById('nav-hamburger');
  const navLinks    = document.getElementById('nav-links');
  const hero        = document.getElementById('hero');

  // Reveal / hide navbar based on hero visibility
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        siteNav.classList.remove('nav-visible');
      } else {
        siteNav.classList.add('nav-visible');
      }
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);

  // Hamburger toggle
  navHamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('nav-open');
    navHamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-open');
      navHamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Scroll-spy: highlight the link for the section currently in view
  const navSections = ['itinerary','gallery','rsvp','location','gift'];
  const sectionEls  = navSections.map(id => document.getElementById(id)).filter(Boolean);

  const spyObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.querySelectorAll('a').forEach(a => a.classList.remove('nav-active'));
          const active = navLinks.querySelector(`a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('nav-active');
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  sectionEls.forEach(el => spyObserver.observe(el));

  /* =============================================
     1. MUSIC PLAYER — YouTube IFrame API
        Song: https://www.youtube.com/watch?v=1-wpZS9AePY
  ============================================= */
  const musicBtn      = document.getElementById('music-btn');
  const musicIcon     = document.getElementById('music-icon');
  const musicCurrent  = document.getElementById('music-current');
  const musicDuration = document.getElementById('music-duration');
  const musicFill     = document.getElementById('music-progress-fill');
  const musicBar      = document.getElementById('music-progress-bar');
  const musicTitle    = document.getElementById('music-song-title');
  let musicOn    = false;
  let ytPlayer   = null;
  let ytReady    = false;
  let progressInt = null;

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) return '--:--';
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, '0');
    return `${m}:${s}`;
  }

  function startProgress() {
    clearInterval(progressInt);
    progressInt = setInterval(() => {
      if (!ytReady || !ytPlayer.getCurrentTime) return;
      const cur = ytPlayer.getCurrentTime();
      const dur = ytPlayer.getDuration();
      if (musicCurrent) musicCurrent.textContent = fmtTime(cur);
      if (musicDuration) musicDuration.textContent = fmtTime(dur);
      if (musicFill && dur > 0) musicFill.style.width = `${(cur / dur) * 100}%`;
    }, 500);
  }

  function stopProgress() { clearInterval(progressInt); }

  // Seek on progress bar click
  musicBar && musicBar.addEventListener('click', (e) => {
    if (!ytReady || !musicOn) return;
    const rect  = musicBar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const dur   = ytPlayer.getDuration();
    if (dur > 0) ytPlayer.seekTo(ratio * dur, true);
  });

  // YouTube IFrame API calls this globally when the script has loaded
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('yt-player', {
      videoId: '1-wpZS9AePY',
      playerVars: {
        autoplay:        1,
        mute:            1,
        loop:            1,
        playlist:        '1-wpZS9AePY', // required for loop to work
        controls:        0,
        disablekb:       1,
        fs:              0,
        iv_load_policy:  3,
        modestbranding:  1,
        rel:             0,
        origin:          window.location.origin, // fixes postMessage cross-origin error
      },
      events: {
        onReady: function (event) {
          ytReady = true;
          // Start playing muted (browsers allow muted autoplay)
          event.target.playVideo();
          musicOn = true;
          startProgress();
          if (musicIcon) musicIcon.className = 'fas fa-pause';
          const mpArt = document.getElementById('mp-art');
          if (mpArt) mpArt.classList.add('playing');
          musicBtn.setAttribute('aria-label', 'Pause background music');

          // Unmute on first user gesture anywhere on the page.
          // capture:true fires BEFORE button click handlers, so unmute
          // happens regardless of which element the user interacts with first.
          let unmuted = false;
          function unmuteOnInteraction() {
            if (unmuted) return;
            unmuted = true;
            if (ytReady) {
              ytPlayer.unMute();
              ytPlayer.setVolume(100);
            }
            document.removeEventListener('click',    unmuteOnInteraction, true);
            document.removeEventListener('touchend', unmuteOnInteraction, true);
            document.removeEventListener('keydown',  unmuteOnInteraction, true);
          }
          document.addEventListener('click',    unmuteOnInteraction, { capture: true });
          document.addEventListener('touchend', unmuteOnInteraction, { capture: true });
          document.addEventListener('keydown',  unmuteOnInteraction, { capture: true });

          try {
            const data  = event.target.getVideoData();
            const title = data && data.title;
            if (title && musicTitle) {
              // Split "Title - Artist" if separator present
              const sep = title.indexOf(' - ');
              if (sep > -1) {
                musicTitle.textContent = title.slice(0, sep);
                const artistEl = document.querySelector('.mp-artist');
                if (artistEl) artistEl.textContent = title.slice(sep + 3);
              } else {
                musicTitle.textContent = title;
              }
              // Marquee if title overflows its container
              requestAnimationFrame(() => {
                const wrap = musicTitle.parentElement;
                if (wrap && musicTitle.scrollWidth > wrap.clientWidth + 2) {
                  const overflow = -(musicTitle.scrollWidth - wrap.clientWidth + 16);
                  musicTitle.style.setProperty('--mp-overflow', `${overflow}px`);
                  musicTitle.classList.add('marquee');
                }
              });
            }
          } catch (_) { /* title stays hardcoded fallback */ }
        },
        onError: function () {
          const mp = document.getElementById('music-player');
          if (mp) mp.style.display = 'none';
        },
        onStateChange: function (event) {
          // YT.PlayerState.ENDED = 0 — requeue for loop safety
          if (event.data === 0 && ytReady) ytPlayer.playVideo();
        },
      },
    });
  };

  // Hide player if YouTube fails to load within 10 seconds
  setTimeout(function () {
    if (!ytReady) {
      const mp = document.getElementById('music-player');
      if (mp) mp.style.display = 'none';
    }
  }, 10000);

  musicBtn.addEventListener('click', () => {
    const mpArt = document.getElementById('mp-art');
    if (musicOn) {
      if (ytReady) ytPlayer.pauseVideo();
      stopProgress();
      if (musicIcon) musicIcon.className = 'fas fa-play';
      if (mpArt) mpArt.classList.remove('playing');
      musicBtn.setAttribute('aria-label', 'Play background music');
    } else {
      if (ytReady) { ytPlayer.unMute(); ytPlayer.setVolume(100); ytPlayer.playVideo(); }
      startProgress();
      if (musicIcon) musicIcon.className = 'fas fa-pause';
      if (mpArt) mpArt.classList.add('playing');
      musicBtn.setAttribute('aria-label', 'Pause background music');
    }
    musicOn = !musicOn;
  });

  /* =============================================
     2. FALLING PETALS
  ============================================= */
  const petalsContainer = document.getElementById('petals');
  const NUM_PETALS = 18;
  const PETAL_COLORS = [
    'radial-gradient(circle at 40% 40%, #f9e4c8, #e8b86d)',
    'radial-gradient(circle at 40% 40%, #fce9d0, #d4975a)',
    'radial-gradient(circle at 40% 40%, #fff0da, #c8a96e)',
  ];

  for (let i = 0; i < NUM_PETALS; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size  = 8 + Math.random() * 10;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]};
      animation-duration: ${5 + Math.random() * 8}s;
      animation-delay: ${Math.random() * 6}s;
      opacity: ${0.4 + Math.random() * 0.5};
    `;
    petalsContainer.appendChild(p);
  }

  // Pause petal animation when the tab is not visible (saves battery/CPU)
  document.addEventListener('visibilitychange', function () {
    const hero = document.getElementById('hero');
    if (!hero) return;
    if (document.hidden) {
      hero.classList.add('paused');
    } else {
      hero.classList.remove('paused');
    }
  });

  /* =============================================
     3. COUNTDOWN TIMER
  ============================================= */
  const WEDDING_DATE = new Date('2026-05-30T11:00:00');

  function updateCountdown() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      document.getElementById('countdown').innerHTML =
        '<div style="text-align:center;padding:1rem 0;">' +
        '<span style="color:var(--gold-light);font-family:var(--font-script);font-size:2rem;font-style:italic;display:block;margin-bottom:.75rem;">Hari Yang Dinanti Telah Tiba! 🤍</span>' +
        '<span style="color:rgba(255,255,255,.85);font-family:var(--font-serif);font-style:italic;font-size:1.1rem;display:block;">Alhamdulillah — terima kasih kerana hadir menyempurnakan majlis kami.</span>' +
        '<span style="color:rgba(255,255,255,.6);font-family:var(--font-sans);font-size:.88rem;display:block;margin-top:.6rem;">Muhsin &amp; Syaqiela &middot; 30 May 2026</span>' +
        '</div>';
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    document.getElementById('days').textContent    = String(days).padStart(2, '0');
    document.getElementById('hours').textContent   = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =============================================
     4. ADD TO CALENDAR BUTTONS
  ============================================= */
  (function setupCalendarLinks() {
    // Google Calendar URL — 11:00 AM–4:00 PM MYT (UTC+8) = 03:00–08:00 UTC
    const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=Muhsin+%26+Syaqiela+%E2%80%94+Majlis+Kesyukuran+Perkahwinan' +
      '&dates=20260530T030000Z%2F20260530T080000Z' +
      '&details=Anda+dijemput+hadir+ke+Majlis+Kesyukuran+Perkahwinan+Muhammad+Muhsin+bin+Haji+Shukri+%26+Syaqiela+Amirah+Syafiqah.' +
      '&location=Pekarangan+Masjid+Bandar+Baru+Senawang%2C+70450+Seremban%2C+Negeri+Sembilan';
    document.getElementById('cal-google').href = gcal;

    // ICS content
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Muhsin & Syaqiela Wedding//EN',
      'BEGIN:VEVENT',
      'DTSTART:20260530T110000',
      'DTEND:20260530T160000',
      'SUMMARY:Muhsin & Syaqiela — Majlis Kesyukuran Perkahwinan',
      'DESCRIPTION:Anda dijemput hadir ke Majlis Kesyukuran Perkahwinan Muhammad Muhsin bin Haji Shukri & Syaqiela Amirah Syafiqah. Jamuan: 11.00 pagi - 4.00 petang.',
      'LOCATION:Pekarangan Masjid Bandar Baru Senawang\, 70450 Seremban\, Negeri Sembilan',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const icsBlob = new Blob([ics], { type: 'text/calendar' });
    const icsUrl  = URL.createObjectURL(icsBlob);
    document.getElementById('cal-apple').href = icsUrl;
    document.getElementById('cal-ics').href   = icsUrl;
  })();

  /* =============================================
     5. GALLERY LIGHTBOX
  ============================================= */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  let   currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const src = galleryItems[index].dataset.src;
    lightboxImg.src = src;
    lightboxImg.alt = galleryItems[index].querySelector('img').alt;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].dataset.src;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].dataset.src;
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-prev').addEventListener('click', prevImage);
  document.querySelector('.lightbox-next').addEventListener('click', nextImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevImage();
    if (e.key === 'ArrowRight')  nextImage();
  });

  /* =============================================
     6. ENGAGE TABS (RSVP · Message · Wishes)
  ============================================= */
  const engageTabs   = document.querySelectorAll('.engage-tab');
  const engagePanels = document.querySelectorAll('.engage-panel');

  engageTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      engageTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      engagePanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(tab.dataset.tab).classList.add('active');
      // Re-initialise signature canvas if switching to message panel
      if (tab.dataset.tab === 'msg-panel') resizeCanvas();
    });
  });

  /* =============================================
     7. RSVP BUTTONS (Ya / Tidak)
  ============================================= */
  const rsvpYesBtn = document.getElementById('rsvp-yes');
  const rsvpNoBtn  = document.getElementById('rsvp-no');

  // ── RSVP counts ──
  function loadRsvpCounts() {
    fetch('/.netlify/functions/rsvp?counts=1')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        document.getElementById('rsvp-count-hadir').textContent    = data.hadir;
        document.getElementById('rsvp-count-takhadir').textContent = data.takHadir;
      })
      .catch(() => {});
  }
  loadRsvpCounts();

  function submitRsvp(attending) {
    const btn = attending === 'yes' ? rsvpYesBtn : rsvpNoBtn;
    rsvpYesBtn.disabled = true;
    rsvpNoBtn.disabled  = true;
    btn.textContent = 'Menghantar…';

    fetch('/.netlify/functions/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attending })
    }).catch(() => {});

    setTimeout(() => {
      document.getElementById('rsvp-success').classList.remove('hidden');
      document.getElementById('rsvp-success-msg').textContent = attending === 'yes'
        ? 'Terima kasih! Kami menantikan kehadiran anda.'
        : 'Terima kasih atas maklum balas anda.';
      rsvpYesBtn.disabled = false;
      rsvpNoBtn.disabled  = false;
      rsvpYesBtn.innerHTML = '<i class="fas fa-heart"></i> Ya';
      rsvpNoBtn.innerHTML  = '<i class="fas fa-times-circle"></i> Tidak';
      loadRsvpCounts();
    }, 800);
  }

  rsvpYesBtn.addEventListener('click', () => submitRsvp('yes'));
  rsvpNoBtn.addEventListener('click',  () => submitRsvp('no'));

  /* =============================================
     7. SIGNATURE PAD + PRIVATE MESSAGE
  ============================================= */
  const canvas     = document.getElementById('signature-canvas');
  const sigPad     = new SignaturePad(canvas, {
    backgroundColor: 'rgb(250,250,250)',
    penColor:        'rgb(139,115,85)',
    minWidth:        1.2,
    maxWidth:        2.5,
  });

  // Resize canvas properly
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const data  = sigPad.toData();
    canvas.width  = canvas.offsetWidth  * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    sigPad.clear();
    sigPad.fromData(data);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  document.getElementById('sig-clear').addEventListener('click', () => sigPad.clear());
  canvas.addEventListener('pointerdown', () => clearInlineError('sig-error'));

  const msgForm = document.getElementById('message-form');
  msgForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('msg-name').value.trim();
    const text = document.getElementById('msg-text').value.trim();

    // Hide any previous success
    document.getElementById('msg-success').classList.add('hidden');

    if (!name) { flashError('msg-name', 'Sila masukkan nama tuan/puan'); return; }
    if (!text) { flashError('msg-text', 'Sila coretkan perutusan'); return; }
    if (sigPad.isEmpty()) {
      showInlineError('sig-error', 'Sila tandatangan sebelum menghantar');
      return;
    }
    clearInlineError('sig-error');

    // In a real implementation, you'd POST name, text, and sigPad.toDataURL() to your backend
    const successEl = document.getElementById('msg-success');
    const msgBtn = msgForm.querySelector('.btn-primary');
    msgBtn.disabled = true;
    msgBtn.textContent = 'Menghantar…';

    setTimeout(() => {
      // Persist private message to localStorage
      const MSG_KEY  = 'muhsin_syaqiela_messages';
      const msgList  = (() => { try { return JSON.parse(localStorage.getItem(MSG_KEY)) || []; } catch { return []; } })();
      const sigData  = sigPad.toDataURL();
      msgList.push({ name, text, sig: sigData, time: Date.now() });
      try { localStorage.setItem(MSG_KEY, JSON.stringify(msgList)); } catch { /* quota */ }

      // Sync to Neon
      fetch('/.netlify/functions/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text, sig: sigData })
      }).catch(() => {});

      successEl.classList.remove('hidden');
      msgForm.reset();
      sigPad.clear();
      msgBtn.disabled = false;
      msgBtn.textContent = 'Hantar Perutusan Peribadi';
    }, 1000);
  });

  /* =============================================
     8. DIGITAL GUESTBOOK
        Types: wish · doa · voice note · photo memory
        Persisted in localStorage (max 30 entries)
  ============================================= */
  const wishesForm    = document.getElementById('wishes-form');
  const wishesWall    = document.getElementById('wishes-wall');
  const gbTypeBtns    = document.querySelectorAll('.gb-type-btn');
  const gbSubmitLabel = document.getElementById('gb-submit-label');
  let currentGbType   = 'wish';

  const GB_LABELS = {
    wish: 'Hantar Doa Restu', photo: 'Hantar Kenangan Bergambar',
  };

  // ── Type tab switching ──
  gbTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      currentGbType = type;
      gbTypeBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.gb-type-field').forEach(f => { f.hidden = true; });
      const activeField = document.getElementById('gb-field-' + type);
      if (activeField) activeField.hidden = false;
      if (gbSubmitLabel) gbSubmitLabel.textContent = GB_LABELS[type] || 'Post';
    });
  });

  // ── Photo upload ──
  let photoDataUrl = null;
  const photoInput      = document.getElementById('photo-input');
  const photoDropZone   = document.getElementById('photo-drop-zone');
  const photoPreviewDiv = document.getElementById('photo-preview');
  const photoPreviewImg = document.getElementById('photo-preview-img');
  const photoChangeBtn  = document.getElementById('photo-change-btn');

  photoInput && photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Gambar mesti kurang daripada 5 MB. Sila pilih gambar yang lebih kecil.');
      photoInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      photoDataUrl = e.target.result;
      if (photoPreviewImg) photoPreviewImg.src = photoDataUrl;
      if (photoDropZone)   photoDropZone.classList.add('hidden');
      if (photoPreviewDiv) photoPreviewDiv.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  photoChangeBtn && photoChangeBtn.addEventListener('click', () => {
    photoDataUrl = null;
    if (photoInput)      photoInput.value = '';
    if (photoPreviewDiv) photoPreviewDiv.classList.add('hidden');
    if (photoDropZone)   photoDropZone.classList.remove('hidden');
  });

  // ── localStorage helpers ──
  const GB_KEY = 'muhsin_syaqiela_guestbook';
  const GB_MAX = 30;
  function gbLoad() { try { return JSON.parse(localStorage.getItem(GB_KEY)) || []; } catch { return []; } }
  function gbSave(entries) { try { localStorage.setItem(GB_KEY, JSON.stringify(entries.slice(-GB_MAX))); } catch { /* quota */ } }
  function gbRelTime(ts) {
    if (!ts) return 'Baru sahaja';
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60)    return 'Baru sahaja';
    if (d < 3600)  return `${Math.floor(d / 60)} minit lalu`;
    if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
    return new Date(ts).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
  }

  // ── Build a wish card DOM element from an entry object ──
  function buildWishCard(entry) {
    const card    = document.createElement('div');
    const initial = escapeHtml((entry.name || '?').charAt(0).toUpperCase());
    const timeNode = `<span class="wish-time">${gbRelTime(entry.time)}</span>`;

    if (entry.type === 'photo') {
      card.className = 'wish-card wish-card-photo';
      card.innerHTML =
        `<img src="${entry.photoDataUrl}" alt="Photo by ${escapeHtml(entry.name)}" class="wish-photo-img" loading="lazy" />` +
        `<div class="wish-body">` +
          `<div class="wish-meta-row">` +
            `<div class="wish-avatar wish-avatar-sm">${initial}</div>` +
            `<strong>${escapeHtml(entry.name)}</strong>` +
            `<span class="wish-badge wish-badge-photo"><i class="fas fa-camera"></i> Photo</span>` +
          `</div>` +
          (entry.caption ? `<p class="wish-caption">${escapeHtml(entry.caption)}</p>` : '') +
          timeNode +
        `</div>`;
    } else if (entry.type === 'doa') {
      card.className = 'wish-card wish-card-doa';
      card.innerHTML =
        `<div class="wish-avatar wish-avatar-doa">🤲</div>` +
        `<div class="wish-body">` +
          `<div class="wish-meta-row">` +
            `<strong>${escapeHtml(entry.name)}</strong>` +
            `<span class="wish-badge wish-badge-doa">Doa</span>` +
          `</div>` +
          `<p>${escapeHtml(entry.text)}</p>` +
          timeNode +
        `</div>`;
    } else {
      card.className = 'wish-card';
      card.innerHTML =
        `<div class="wish-avatar">${initial}</div>` +
        `<div class="wish-body">` +
          `<strong>${escapeHtml(entry.name)}</strong>` +
          `<p>${escapeHtml(entry.text)}</p>` +
          timeNode +
        `</div>`;
    }
    return card;
  }

  // ── Load persisted entries on page load (replaces sample cards) ──
  (function () {
    if (!wishesWall) return;
    const saved = gbLoad();
    if (!saved.length) return;
    wishesWall.innerHTML = '';
    saved.slice().reverse().forEach(entry => {
      try { wishesWall.appendChild(buildWishCard(entry)); } catch (_) { /* skip corrupt */ }
    });
  })();

  // ── Form submit ──
  wishesForm.addEventListener('submit', e => {
    e.preventDefault();
    const nameInput = document.getElementById('wish-name');
    const name = sanitize(nameInput.value.trim());
    if (!name) { flashError('wish-name', 'Sila masukkan nama tuan/puan'); return; }

    const entry = { type: currentGbType, name, time: Date.now() };

    if (currentGbType === 'wish') {
      const t = document.getElementById('wish-text');
      const text = sanitize(t.value.trim());
      if (!text) { flashError('wish-text', 'Sila coretkan doa restu'); return; }
      entry.text = text; t.value = '';

    } else if (currentGbType === 'photo') {
      if (!photoDataUrl) {
        if (photoDropZone) { photoDropZone.style.outline = '2px solid #e53935'; setTimeout(() => { photoDropZone.style.outline = ''; }, 2000); }
        return;
      }
      entry.photoDataUrl = photoDataUrl;
      const cap = sanitize((document.getElementById('photo-caption').value || '').trim());
      if (cap) entry.caption = cap;
      photoDataUrl = null;
      if (photoInput) photoInput.value = '';
      const capField = document.getElementById('photo-caption');
      if (capField) capField.value = '';
      if (photoPreviewDiv) photoPreviewDiv.classList.add('hidden');
      if (photoDropZone)   photoDropZone.classList.remove('hidden');
    }

    const saved = gbLoad(); saved.push(entry); gbSave(saved);

    // Sync to Neon
    fetch('/.netlify/functions/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {});

    // Show loading state on button
    const gbBtn = document.getElementById('gb-submit-btn');
    const gbSuccessEl = document.getElementById('wishes-success');
    if (gbBtn) { gbBtn.disabled = true; if (gbSubmitLabel) gbSubmitLabel.textContent = 'Menghantar…'; }
    if (gbSuccessEl) gbSuccessEl.classList.add('hidden');

    setTimeout(() => {
      const card = buildWishCard(entry);
      if (wishesWall) {
        wishesWall.insertBefore(card, wishesWall.firstChild);
        wishesWall.scrollTop = 0;
      }
      if (gbSuccessEl) gbSuccessEl.classList.remove('hidden');
      if (gbBtn) { gbBtn.disabled = false; if (gbSubmitLabel) gbSubmitLabel.textContent = GB_LABELS[currentGbType] || 'Hantar Doa & Ucapan'; }
      nameInput.value = '';
    }, 700);
  });

  /* =============================================
     9. COPY ACCOUNT NUMBER
  ============================================= */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = 'var(--gold)';
        btn.style.color = 'white';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    });
  });

  /* =============================================
     10. SCROLL REVEAL
  ============================================= */
  const revealEls = document.querySelectorAll(
    '#countdown-section, #itinerary .itinerary-simple, .gallery-item, ' +
    '#rsvp .engage-tabs, #rsvp .panel-card, ' +
    '#location .location-card, #gift .gift-card'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

  /* =============================================
     11. SMOOTH NAV (hash links)
  ============================================= */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =============================================
     HELPERS
  ============================================= */
  function flashError(inputId, msg) {
    const el = document.getElementById(inputId);
    if (!el) return;
    // derive companion error span: rsvp-name → name-error, rsvp-phone → phone-error
    const errId = inputId.replace('rsvp-', '') + '-error';
    const errEl = document.getElementById(errId);
    const orig = el.placeholder;
    el.style.borderColor = '#e53935';
    el.placeholder = msg;
    el.setAttribute('aria-invalid', 'true');
    if (errEl) { errEl.textContent = msg; errEl.classList.remove('hidden'); }
    el.focus();
    setTimeout(() => {
      el.style.borderColor = '';
      el.placeholder = orig;
      el.removeAttribute('aria-invalid');
      if (errEl) errEl.classList.add('hidden');
    }, 2500);
  }

  function showInlineError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function clearInlineError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  // Sanitize text to prevent XSS when building DOM via innerHTML
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Extra: strip any HTML tags from input
  function sanitize(str) {
    return str.replace(/<[^>]*>/g, '');
  }

  /* =============================================
     SHARE INVITATION — Modal + IG Card
  ============================================= */
  const shareBtn        = document.getElementById('share-btn');
  const shareModal      = document.getElementById('share-modal');
  const shareModalClose = document.getElementById('share-modal-close');
  const shareBackdrop   = document.getElementById('share-modal-backdrop');
  const shareSaveBtn    = document.getElementById('share-save-btn');
  const shareWaBtn      = document.getElementById('share-wa-btn');
  const shareTgBtn      = document.getElementById('share-tg-btn');
  const shareToast      = document.getElementById('share-toast');
  let toastTimer = null;

  const SHARE_URL = window.location.href.split('#')[0];
  const SHARE_CAPTION =
`Assalamualaikum warahmatullahi wabarakatuh,

Dengan penuh rasa syukur dan kegembiraan, kami menjemput Tuan/Puan sekeluarga hadir ke Majlis Kesyukuran Perkahwinan anak lelaki kami:

💍 Muhammad Muhsin bin Haji Shukri
dengan pilihan hatinya,
Syaqiela Amirah Syafiqah binti Syaiful Azlan

📅 Sabtu, 30 Mei 2026
🍽️ Jamuan: 11.00 pagi – 4.00 petang
📍 Pekarangan Masjid Bandar Baru Senawang, 70450 Seremban, Negeri Sembilan

Kehadiran Tuan/Puan amat kami hargai dan menjadi rahmat kepada majlis kami.

🔗 ${SHARE_URL}

Wassalamualaikum w.b.t.`;

  function showToast(msg) {
    if (!shareToast) return;
    shareToast.textContent = msg;
    shareToast.classList.add('toast-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => shareToast.classList.remove('toast-visible'), 3200);
  }

  function openShareModal() {
    if (!shareModal) return;
    shareModal.classList.add('open');
    shareModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeShareModal() {
    if (!shareModal) return;
    shareModal.classList.remove('open');
    shareModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (shareBtn)        shareBtn.addEventListener('click', openShareModal);
  if (shareModalClose) shareModalClose.addEventListener('click', closeShareModal);
  if (shareBackdrop)   shareBackdrop.addEventListener('click', closeShareModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && shareModal && shareModal.classList.contains('open')) closeShareModal();
  });

  async function renderPage(id) {
    const el = document.getElementById(id);
    if (typeof html2canvas === 'undefined' || !el) return null;
    // Render directly — element is visible inside the open modal
    const w = el.offsetWidth || 580;
    const h = el.offsetHeight;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fef9ee',
      logging: false,
      width: w,
      height: h,
      scrollX: 0,
      scrollY: 0
    });
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    return { blob, dataUrl, w: canvas.width, h: canvas.height };
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'jemputan-muhsin-syaqiela.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function buildPdfBlob() {
    const p1 = await renderPage('share-pdf-p1');
    const p2 = await renderPage('share-pdf-p2');
    if (!p1 || !p2) return null;
    if (typeof window.jspdf === 'undefined') return null;
    const { jsPDF } = window.jspdf;
    const mmW = 210;
    const h1mm = (p1.h / p1.w) * mmW;
    const h2mm = (p2.h / p2.w) * mmW;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [mmW, h1mm] });
    pdf.addImage(p1.dataUrl, 'PNG', 0, 0, mmW, h1mm);
    pdf.addPage([mmW, h2mm]);
    pdf.addImage(p2.dataUrl, 'PNG', 0, 0, mmW, h2mm);
    const blob = pdf.output('blob');
    return blob;
  }

  async function buildAndSavePdf() {
    const blob = await buildPdfBlob();
    if (!blob) {
      // jsPDF unavailable — fallback to two PNGs
      const p1 = await renderPage('share-pdf-p1');
      const p2 = await renderPage('share-pdf-p2');
      if (p1) triggerDownload(p1.blob, 'jemputan-p1.png');
      if (p2) triggerDownload(p2.blob, 'jemputan-p2.png');
      return 'png';
    }
    triggerDownload(blob, 'jemputan-muhsin-syaqiela.pdf');
    return 'pdf';
  }

  function setActLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    const icon  = btn.querySelector('i');
    const label = btn.querySelector('span');
    if (loading) {
      if (icon)  { icon.dataset.orig = icon.className; icon.className = 'fas fa-spinner fa-spin'; }
      if (label) { label.dataset.orig = label.textContent; label.textContent = '…'; }
    } else {
      if (icon  && icon.dataset.orig)  { icon.className = icon.dataset.orig;  delete icon.dataset.orig; }
      if (label && label.dataset.orig) { label.textContent = label.dataset.orig; delete label.dataset.orig; }
    }
  }

  // Download / Save as PDF
  if (shareSaveBtn) {
    shareSaveBtn.addEventListener('click', async () => {
      setActLoading(shareSaveBtn, true);
      const result = await buildAndSavePdf();
      setActLoading(shareSaveBtn, false);
      if (!result) { showToast('⚠ Gagal menjana PDF.'); return; }
      showToast(result === 'pdf' ? '✓ PDF telah disimpan!' : '✓ 2 imej telah disimpan!');
    });
  }

  // WhatsApp shortcut
  if (shareWaBtn) {
    shareWaBtn.addEventListener('click', async () => {
      setActLoading(shareWaBtn, true);
      const blob = await buildPdfBlob();
      setActLoading(shareWaBtn, false);
      if (!blob) { showToast('⚠ Gagal menjana PDF.'); return; }
      const file = new File([blob], 'jemputan-muhsin-syaqiela.pdf', { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ title: 'Jemputan Muhsin & Syaqiela', text: SHARE_CAPTION, files: [file] }); return; }
        catch (err) { if (err.name === 'AbortError') return; }
      }
      // Fallback: download PDF then open WhatsApp
      triggerDownload(blob, 'jemputan-muhsin-syaqiela.pdf');
      window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_CAPTION)}`, '_blank', 'noopener');
      showToast('✓ PDF telah disimpan. Sila lampirkan dalam WhatsApp.');
    });
  }

  // Telegram shortcut
  if (shareTgBtn) {
    shareTgBtn.addEventListener('click', async () => {
      setActLoading(shareTgBtn, true);
      const blob = await buildPdfBlob();
      setActLoading(shareTgBtn, false);
      if (!blob) { showToast('⚠ Gagal menjana PDF.'); return; }
      const file = new File([blob], 'jemputan-muhsin-syaqiela.pdf', { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ title: 'Warkah Jemputan Muhsin & Syaqiela', text: SHARE_CAPTION, files: [file] }); return; }
        catch (err) { if (err.name === 'AbortError') return; }
      }
      // Fallback: download PDF then open Telegram
      triggerDownload(blob, 'jemputan-muhsin-syaqiela.pdf');
      window.open(`https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(SHARE_CAPTION)}`, '_blank', 'noopener');
      showToast('✓ PDF telah disimpan. Sila lampirkan dalam Telegram.');
    });
  }

})();
