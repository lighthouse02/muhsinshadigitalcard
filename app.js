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
        autoplay:        0,
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
      if (ytReady) ytPlayer.playVideo();
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
  const WEDDING_DATE = new Date('2026-05-30T10:00:00');

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
    // Google Calendar URL
    const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=Muhsin+%26+Syaqiela+Wedding' +
      '&dates=20260530T020000Z%2F20260530T090000Z' +
      '&details=You+are+invited+to+the+wedding+of+Muhsin+%26+Syaqiela.' +
      '&location=Masjid+Bandar+Baru+Senawang%2C+Seremban';
    document.getElementById('cal-google').href = gcal;

    // ICS content
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Muhsin & Syaqiela Wedding//EN',
      'BEGIN:VEVENT',
      'DTSTART:20260530T100000',
      'DTEND:20260530T150000',
      'SUMMARY:Muhsin & Syaqiela Wedding',
      'DESCRIPTION:You are invited to the wedding of Muhsin & Syaqiela.',
      'LOCATION:Masjid Bandar Baru Senawang\, Seremban',
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
     7. RSVP FORM
  ============================================= */
  const rsvpForm         = document.getElementById('rsvp-form');
  const guestsGroup      = document.getElementById('guests-group');
  const attendanceRadios = rsvpForm.querySelectorAll('input[name="attendance"]');

  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const attending = radio.value === 'yes';
      guestsGroup.style.display  = attending ? '' : 'none';
      clearInlineError('attendance-error');
    });
  });

  function isValidMalaysianPhone(p) {
    return /^(\+?60|0)[1-9]\d{7,9}$/.test(p.replace(/[\s\-]/g, ''));
  }

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('rsvp-success').classList.add('hidden');

    const attendance   = rsvpForm.querySelector('input[name="attendance"]:checked');
    const salutation   = (document.getElementById('rsvp-salutation').value || '').trim();
    const rawName      = document.getElementById('rsvp-name').value.trim();
    const name         = salutation ? `${salutation} ${rawName}` : rawName;
    const phone        = document.getElementById('rsvp-phone').value.trim();

    if (!attendance)                   { showInlineError('attendance-error', 'Please select your attendance'); return; }
    clearInlineError('attendance-error');
    if (!name)                         { flashError('rsvp-name',  'Please enter your name'); return; }
    if (!isValidMalaysianPhone(phone)) { flashError('rsvp-phone', 'Please enter a valid phone number'); return; }

    const rsvpBtn    = rsvpForm.querySelector('.btn-primary');
    const attendingVal = attendance.value;
    rsvpBtn.disabled = true;
    rsvpBtn.textContent = 'Sending…';

    setTimeout(() => {
      document.getElementById('rsvp-success').classList.remove('hidden');
      document.getElementById('rsvp-success-msg').textContent = attendingVal === 'yes'
        ? 'Thank you! We look forward to celebrating with you.'
        : 'We understand and appreciate you letting us know.';
      const cardSection = document.getElementById('rsvp-card-section');
      if (attendingVal === 'yes') {
        cardSection.classList.remove('hidden');
        document.fonts.ready.then(() => drawAttendanceCard(name));
      } else {
        cardSection.classList.add('hidden');
      }
      rsvpForm.reset();
      guestsGroup.style.display  = 'none';
      rsvpBtn.disabled = false;
      rsvpBtn.textContent = 'Send RSVP';
    }, 1000);
  });

  // Attendance card — download
  document.getElementById('rsvp-card-dl').addEventListener('click', () => {
    const canvas = document.getElementById('rsvp-card-canvas');
    const link   = document.createElement('a');
    link.download = 'muhsin-syaqiela-attendance.png';
    link.href    = canvas.toDataURL('image/png');
    link.click();
  });

  function drawAttendanceCard(guestName) {
    const canvas = document.getElementById('rsvp-card-canvas');
    if (!canvas) return;

    const HERO_IMG_URL = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&fm=webp&q=80';
    const heroImg = new Image();
    heroImg.crossOrigin = 'anonymous';
    heroImg.onload  = () => _renderCard(heroImg, guestName);
    heroImg.onerror = () => _renderCard(null, guestName);   // fallback: dark fill
    heroImg.src = HERO_IMG_URL;
  }

  function _renderCard(heroImg, guestName) {
    const canvas = document.getElementById('rsvp-card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 800, H = 580;
    canvas.width  = W;
    canvas.height = H;

    const gold     = '#C8A96E';
    const ink      = '#2a2018';
    const muted    = '#6b5c48';
    const cream    = '#fdf8ef';
    const heroBg   = '#1e1510';
    const HERO_H   = 185;

    /* ── tiny helpers ─────────────────────────── */
    function diamond(x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = gold; ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.restore();
    }
    function hline(x1, x2, y) {
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    }

    /* ══════════════════════════════════════════
       ZONE 1 — HERO BAND  (Y 0 – 185)
       Hero photo + layered dark + gold overlay
    ════════════════════════════════════════════ */
    // clip to hero band so photo doesn't bleed below
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, HERO_H);
    ctx.clip();

    if (heroImg) {
      // cover-fit the image into the hero band
      const iW = heroImg.naturalWidth  || heroImg.width;
      const iH = heroImg.naturalHeight || heroImg.height;
      const scale = Math.max(W / iW, HERO_H / iH);
      const dw = iW * scale, dh = iH * scale;
      const dx = (W - dw) / 2, dy = (HERO_H - dh) / 2;
      ctx.drawImage(heroImg, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = heroBg;
      ctx.fillRect(0, 0, W, HERO_H);
    }

    // dark layered overlay — same feel as .hero-overlay on the site
    const ov1 = ctx.createLinearGradient(0, 0, 0, HERO_H);
    ov1.addColorStop(0,   'rgba(20,14,8,.72)');
    ov1.addColorStop(0.5, 'rgba(20,14,8,.55)');
    ov1.addColorStop(1,   'rgba(20,14,8,.78)');
    ctx.fillStyle = ov1; ctx.fillRect(0, 0, W, HERO_H);

    // subtle gold edge vignette
    const hg = ctx.createLinearGradient(0, 0, W, HERO_H);
    hg.addColorStop(0,   'rgba(200,169,110,.18)');
    hg.addColorStop(0.5, 'rgba(200,169,110,0)');
    hg.addColorStop(1,   'rgba(200,169,110,.18)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, HERO_H);

    ctx.restore(); // end hero clip

    // "WEDDING INVITATION"
    ctx.fillStyle = gold; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 10px "DM Sans", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('W E D D I N G   I N V I T A T I O N', W/2, 55);

    // Bismillah
    ctx.fillStyle = 'rgba(232,212,168,.72)';
    ctx.font = '14px serif';
    ctx.fillText('\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650', W/2, 77);

    // BIG couple names
    ctx.fillStyle = '#f8edd8';
    ctx.font = 'italic bold 66px "Playfair Display", Georgia, serif';
    ctx.fillText('Muhsin & Syaqiela', W/2, 148);

    // subtitle
    ctx.fillStyle = 'rgba(200,169,110,.82)';
    ctx.font = '300 10.5px "DM Sans", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('T O G E T H E R   W I T H   T H E I R   F A M I L I E S', W/2, 171);

    // hero bottom rule
    ctx.strokeStyle = gold; ctx.lineWidth = 1.5;
    hline(0, W, 185);

    /* ══════════════════════════════════════════
       ZONE 2 — CONFIRMED SECTION  (Y 185 – 375)
       Cream, guest name, blessing
    ════════════════════════════════════════════ */
    ctx.fillStyle = cream;
    ctx.fillRect(0, 185, W, 190);
    const mg = ctx.createLinearGradient(0, 185, 0, 375);
    mg.addColorStop(0, 'rgba(200,169,110,.07)'); mg.addColorStop(1, 'rgba(200,169,110,0)');
    ctx.fillStyle = mg; ctx.fillRect(0, 185, W, 190);

    // "CONFIRMED ATTENDANCE" label
    ctx.fillStyle = muted;
    ctx.font = '400 10px "DM Sans", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('C O N F I R M E D   A T T E N D A N C E', W/2, 241);

    // guest name — auto-shrink so it stays left of the stamp
    const maxNameW = W - 260;
    let fs = 44;
    ctx.font = `600 ${fs}px "Playfair Display", Georgia, serif`;
    while (ctx.measureText(guestName).width > maxNameW && fs > 16) {
      fs -= 2;
      ctx.font = `600 ${fs}px "Playfair Display", Georgia, serif`;
    }
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.fillText(guestName, W/2 - 30, 308);

    // gold underline
    const nw = ctx.measureText(guestName).width;
    ctx.strokeStyle = gold; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(W/2 - 30 - nw/2, 318); ctx.lineTo(W/2 - 30 + nw/2, 318);
    ctx.stroke();

    // blessing
    ctx.fillStyle = muted;
    ctx.font = 'italic 14px "EB Garamond", Georgia, serif';
    ctx.fillText('We are deeply honoured by your presence.', W/2, 353);

    /* ══════════════════════════════════════════
       ZONE 3 — EVENT DETAILS BAND  (Y 375 – 488)
       Three columns: Date | Time | Location
    ════════════════════════════════════════════ */
    ctx.fillStyle = '#f2e6d4';
    ctx.fillRect(0, 375, W, 113);
    ctx.strokeStyle = gold; ctx.lineWidth = 1;
    hline(0, W, 375); hline(0, W, 488);

    // column dividers
    ctx.strokeStyle = 'rgba(200,169,110,.30)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W/3, 388); ctx.lineTo(W/3, 480); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2*W/3, 388); ctx.lineTo(2*W/3, 480); ctx.stroke();

    const details = [
      { x: W/6,      label: 'DATE',     v1: 'Saturday, 30 May 2026', v2: '' },
      { x: W/2,      label: 'TIME',     v1: '10:00 AM',                v2: 'Akad Nikah · Bersanding' },
      { x: 5*W/6,    label: 'LOCATION', v1: 'Masjid Bandar Baru',     v2: 'Senawang, N. Sembilan' },
    ];
    details.forEach(d => {
      ctx.textAlign = 'center';
      ctx.fillStyle = gold;
      ctx.font = '600 9.5px "DM Sans", "Helvetica Neue", Arial, sans-serif';
      ctx.fillText(d.label, d.x, 402);
      ctx.fillStyle = ink;
      ctx.font = '600 14.5px "Playfair Display", Georgia, serif';
      ctx.fillText(d.v1, d.x, 430);
      if (d.v2) {
        ctx.fillStyle = muted;
        ctx.font = '400 12.5px "EB Garamond", Georgia, serif';
        ctx.fillText(d.v2, d.x, 452);
      }
    });

    /* ══════════════════════════════════════════
       ZONE 4 — FOOTER  (Y 488 – 580)
    ════════════════════════════════════════════ */
    ctx.fillStyle = cream;
    ctx.fillRect(0, 488, W, 92);

    ctx.fillStyle = 'rgba(200,169,110,.45)';
    ctx.font = '400 10px "DM Sans", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';

    /* ══════════════════════════════════════════
       BORDERS — drawn over everything
    ════════════════════════════════════════════ */
    ctx.strokeStyle = gold; ctx.lineWidth = 2.5;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    [[28, 28], [W-28, 28], [28, H-28], [W-28, H-28]].forEach(([cx, cy]) => {
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = gold; ctx.fill();
    });

    /* ══════════════════════════════════════════
       CONFIRMED STAMP — top-right of cream zone
       Green seal, rotated -18°
    ════════════════════════════════════════════ */
    const sGreen      = 'rgba(34,139,68,.90)';
    const sGreenDark  = 'rgba(24,100,50,.95)';
    const sGreenFill  = 'rgba(34,139,68,.10)';
    const sGreenMid   = 'rgba(34,139,68,.55)';
    const sx = W - 82, sy = 275, oR = 60, iR = 48, tR = 38;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-18 * Math.PI / 180);

    // soft filled background
    ctx.beginPath(); ctx.arc(0, 0, oR, 0, Math.PI * 2);
    ctx.fillStyle = sGreenFill; ctx.fill();

    // outer ring — thick
    ctx.strokeStyle = sGreen; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, oR, 0, Math.PI * 2); ctx.stroke();

    // inner ring — thin
    ctx.strokeStyle = sGreenMid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, iR, 0, Math.PI * 2); ctx.stroke();

    // small tick dashes on inner ring (12 positions like a clock)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r1 = iR - 2, r2 = iR + 3;
      ctx.strokeStyle = sGreenMid; ctx.lineWidth = i % 3 === 0 ? 1.4 : 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }

    // arc text "CONFIRMED" — top half, letters upright along upper arc
    ctx.fillStyle = sGreenDark;
    ctx.font = 'bold 11px "DM Sans", "Helvetica Neue", Arial, sans-serif';
    const cText = 'CONFIRMED';
    const cAngle = Math.PI * 0.68, cStart = -Math.PI/2 - cAngle/2, cStep = cAngle / (cText.length - 1);
    for (let i = 0; i < cText.length; i++) {
      const a = cStart + i * cStep;
      ctx.save();
      ctx.translate(Math.cos(a) * tR, Math.sin(a) * tR);
      ctx.rotate(a + Math.PI / 2);  // upright: tangent points outward
      ctx.fillText(cText[i], -3.5, 4);
      ctx.restore();
    }

    // star separator dots between CONFIRMED and ATTENDANCE
    const starAngles = [-Math.PI/2 - 0.08, Math.PI/2 + 0.08]; // just past each word end
    starAngles.forEach(a => {
      ctx.fillStyle = sGreen;
      ctx.beginPath(); ctx.arc(Math.cos(a) * tR, Math.sin(a) * tR, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // arc text "ATTENDANCE" — bottom half, letters upright along lower arc
    // For bottom arc: letters must be rotated so baseline faces inward (flip by π)
    const aText = 'ATTENDANCE';
    const aAngle = Math.PI * 0.78;
    // start angle at bottom-left, sweep clockwise to bottom-right
    const aStart = Math.PI/2 + aAngle/2;   // start right-side (index 0 = leftmost letter)
    const aStep  = -aAngle / (aText.length - 1);  // sweep counter-clockwise so text reads left→right along bottom
    for (let i = 0; i < aText.length; i++) {
      const a = aStart + i * aStep;
      ctx.save();
      ctx.translate(Math.cos(a) * tR, Math.sin(a) * tR);
      ctx.rotate(a - Math.PI / 2);  // flip so letters face outward on bottom
      ctx.fillText(aText[i], -3.5, 4);
      ctx.restore();
    }

    // centre checkmark ✓
    ctx.strokeStyle = sGreen; ctx.lineWidth = 3.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-11, 1);
    ctx.lineTo(-3,  9);
    ctx.lineTo(12, -8);
    ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';

    ctx.restore(); // end stamp transform
  }

  /* =============================================
     DEV PREVIEW — Ctrl+Shift+K
     Shows the attendance card with sample data
     without filling the RSVP form.
  ============================================= */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      const successEl = document.getElementById('rsvp-success');
      const cardSection = document.getElementById('rsvp-card-section');
      const msgEl = document.getElementById('rsvp-success-msg');
      // Scroll to RSVP section
      document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Show success block with card
      successEl.classList.remove('hidden');
      cardSection.classList.remove('hidden');
      if (msgEl) msgEl.textContent = '[DEV PREVIEW] Thank you! We look forward to celebrating with you.';
      document.fonts.ready.then(() => drawAttendanceCard('Dr. Ahmad Muadz bin Idris'));
      // Subtle console hint
      console.info('%c[DEV] Attendance card preview — Ctrl+Shift+K', 'color:#C8A96E;font-weight:600');
    }
  });

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

    if (!name) { flashError('msg-name', 'Please enter your name'); return; }
    if (!text) { flashError('msg-text', 'Please write a message'); return; }
    if (sigPad.isEmpty()) {
      showInlineError('sig-error', 'Please add your signature before sending');
      return;
    }
    clearInlineError('sig-error');

    // In a real implementation, you'd POST name, text, and sigPad.toDataURL() to your backend
    const successEl = document.getElementById('msg-success');
    const msgBtn = msgForm.querySelector('.btn-primary');
    msgBtn.disabled = true;
    msgBtn.textContent = 'Sending...';

    setTimeout(() => {
      successEl.classList.remove('hidden');
      msgForm.reset();
      sigPad.clear();
      msgBtn.disabled = false;
      msgBtn.textContent = 'Send Private Message';
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
    wish: 'Post Wish', photo: 'Post Photo Memory',
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
      alert('Photo must be under 5 MB. Please choose a smaller image.');
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
    if (!ts) return 'Just now';
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60)    return 'Just now';
    if (d < 3600)  return `${Math.floor(d / 60)} min ago`;
    if (d < 86400) return `${Math.floor(d / 3600)} hr ago`;
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
    if (!name) { flashError('wish-name', 'Please enter your name'); return; }

    const entry = { type: currentGbType, name, time: Date.now() };

    if (currentGbType === 'wish') {
      const t = document.getElementById('wish-text');
      const text = sanitize(t.value.trim());
      if (!text) { flashError('wish-text', 'Please enter your wish'); return; }
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
    const card = buildWishCard(entry);
    wishesWall.insertBefore(card, wishesWall.firstChild);
    nameInput.value = '';
    wishesWall.scrollTop = 0;
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
     SHARE INVITATION
  ============================================= */
  const shareBtn   = document.getElementById('share-btn');
  const shareToast = document.getElementById('share-toast');
  let toastTimer   = null;

  const SHARE_URL     = window.location.href.split('#')[0];
  const SHARE_CAPTION =
`Assalamualaikum w.b.t.,

Dengan penuh rasa syukur dan kegembiraan, kami menjemput Tuan/Puan sekeluarga hadir ke majlis perkahwinan anakanda kami:

💍 Muhammad Muhsin bin Haji Shukri
    dengan pilihan hatinya
    Syaqiela Amirah Syafiqah binti Syaiful Azlan

📅 Sabtu, 30 Mei 2026
⏰ 10:00 pagi
📍 Masjid Bandar Baru Senawang

Kehadiran Tuan/Puan amat kami sanjungi dan menjadi rahmat kepada majlis kami.

🔗 Jemputan digital: ${SHARE_URL}

Wassalamualaikum w.b.t.`;

  function showToast(msg) {
    if (!shareToast) return;
    shareToast.textContent = msg;
    shareToast.classList.add('toast-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => shareToast.classList.remove('toast-visible'), 3200);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      // 1. Try native Web Share API (mobile-first)
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Muhsin & Syaqiela — Jemputan Majlis Kesyukuran',
            text:  SHARE_CAPTION,
            url:   SHARE_URL
          });
          return;
        } catch (err) {
          // User cancelled — silently ignore
          if (err.name === 'AbortError') return;
        }
      }
      // 2. Fallback: copy full caption + URL to clipboard
      try {
        await navigator.clipboard.writeText(SHARE_CAPTION);
        showToast('✓ Teks jemputan telah disalin!');
      } catch {
        // 3. Last resort: prompt with prefilled text
        const msg = window.prompt('Salin teks jemputan di bawah:', SHARE_CAPTION);
        if (msg !== null) showToast('✓ Terima kasih telah berkongsi!');
      }
    });
  }

})();
