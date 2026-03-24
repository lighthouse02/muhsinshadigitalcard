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
        Song: https://www.youtube.com/watch?v=4ptRrq6qA8A
  ============================================= */
  const musicBtn = document.getElementById('music-btn');
  let musicOn    = false;
  let ytPlayer   = null;
  let ytReady    = false;

  // YouTube IFrame API calls this globally when the script has loaded
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('yt-player', {
      videoId: '4ptRrq6qA8A',
      playerVars: {
        autoplay:        0,
        loop:            1,
        playlist:        '4ptRrq6qA8A', // required for loop to work
        controls:        0,
        disablekb:       1,
        fs:              0,
        iv_load_policy:  3,
        modestbranding:  1,
        rel:             0,
        origin:          window.location.origin, // fixes postMessage cross-origin error
      },
      events: {
        onReady: function () { ytReady = true; },
        onError: function () { musicBtn.style.display = 'none'; },
      },
    });
  };

  // Hide music button if YouTube fails to load within 10 seconds
  setTimeout(function () {
    if (!ytReady) musicBtn.style.display = 'none';
  }, 10000);

  musicBtn.addEventListener('click', () => {
    if (musicOn) {
      if (ytReady) ytPlayer.pauseVideo();
      musicBtn.innerHTML = '<i class="fas fa-music"></i>';
      musicBtn.style.background = 'linear-gradient(135deg, #aaa, #777)';
    } else {
      if (ytReady) ytPlayer.playVideo();
      musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
      musicBtn.style.background = '';
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
  const WEDDING_DATE = new Date('2026-04-12T10:00:00');

  function updateCountdown() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      document.getElementById('countdown').innerHTML =
        '<div style="text-align:center;padding:1rem 0;">' +
        '<span style="color:var(--gold-light);font-family:var(--font-script);font-size:2rem;font-style:italic;display:block;margin-bottom:.75rem;">Hari Yang Dinanti Telah Tiba! 🤍</span>' +
        '<span style="color:rgba(255,255,255,.85);font-family:var(--font-serif);font-style:italic;font-size:1.1rem;display:block;">Alhamdulillah — terima kasih kerana hadir menyempurnakan majlis kami.</span>' +
        '<span style="color:rgba(255,255,255,.6);font-family:var(--font-sans);font-size:.88rem;display:block;margin-top:.6rem;">Muhsin &amp; Syaqiela &middot; 12 April 2026</span>' +
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
      '&dates=20260412T020000Z%2F20260412T090000Z' +
      '&details=You+are+invited+to+the+wedding+of+Muhsin+%26+Syaqiela.' +
      '&location=Dewan+Delima%2C+Kajang';
    document.getElementById('cal-google').href = gcal;

    // ICS content
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Muhsin & Syaqiela Wedding//EN',
      'BEGIN:VEVENT',
      'DTSTART:20260412T100000',
      'DTEND:20260412T150000',
      'SUMMARY:Muhsin & Syaqiela Wedding',
      'DESCRIPTION:You are invited to the wedding of Muhsin & Syaqiela.',
      'LOCATION:Dewan Delima\, Kajang',
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

    const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');
    const name       = document.getElementById('rsvp-name').value.trim();
    const phone      = document.getElementById('rsvp-phone').value.trim();

    if (!attendance)                   { showInlineError('attendance-error', 'Please select your attendance'); return; }
    clearInlineError('attendance-error');
    if (!name)                         { flashError('rsvp-name',  'Please enter your name'); return; }
    if (!isValidMalaysianPhone(phone)) { flashError('rsvp-phone', 'Please enter a valid phone number'); return; }

    const rsvpBtn = rsvpForm.querySelector('.btn-primary');
    rsvpBtn.disabled = true;
    rsvpBtn.textContent = 'Sending…';

    setTimeout(() => {
      document.getElementById('rsvp-success').classList.remove('hidden');
      rsvpForm.reset();
      guestsGroup.style.display  = 'none';
      rsvpBtn.disabled = false;
      rsvpBtn.textContent = 'Send RSVP';
    }, 1000);
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
     8. WISHES WALL
  ============================================= */
  const wishesForm = document.getElementById('wishes-form');
  const wishesWall = document.getElementById('wishes-wall');

  wishesForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('wish-name');
    const textInput = document.getElementById('wish-text');
    const name = sanitize(nameInput.value.trim());
    const text = sanitize(textInput.value.trim());

    if (!name) { flashError('wish-name', 'Please enter your name'); return; }
    if (!text) { flashError('wish-text', 'Please enter your wish'); return; }

    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <div class="wish-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</div>
      <div class="wish-body">
        <strong>${escapeHtml(name)}</strong>
        <p>${escapeHtml(text)}</p>
        <span class="wish-time">Just now</span>
      </div>
    `;

    wishesWall.insertBefore(card, wishesWall.firstChild);
    nameInput.value = '';
    textInput.value = '';
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

})();
