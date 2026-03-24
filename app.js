/* ============================================
   MUHSIN & SHA — WEDDING DIGITAL CARD
   JavaScript — app.js
   ============================================ */

(function () {
  'use strict';

  /* =============================================
     1. MUSIC PLAYER
  ============================================= */
  const musicBtn  = document.getElementById('music-btn');
  const bgMusic   = document.getElementById('bg-music');
  let   musicOn   = false;

  musicBtn.addEventListener('click', () => {
    if (musicOn) {
      bgMusic.pause();
      musicBtn.innerHTML = '<i class="fas fa-music"></i>';
      musicBtn.style.background = 'linear-gradient(135deg, #aaa, #777)';
    } else {
      bgMusic.play().catch(() => {});
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

  /* =============================================
     3. COUNTDOWN TIMER
  ============================================= */
  const WEDDING_DATE = new Date('2026-04-12T10:00:00');

  function updateCountdown() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      document.getElementById('countdown').innerHTML =
        '<span style="color:var(--gold-light);font-family:var(--font-script);font-size:2rem;">The day has arrived! 🤍</span>';
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
     4. CALENDAR WIDGET
  ============================================= */
  const WEDDING_MONTH = 3; // April (0-indexed)
  const WEDDING_YEAR  = 2026;
  const WEDDING_DAY   = 12;

  let calYear  = WEDDING_YEAR;
  let calMonth = WEDDING_MONTH;

  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  function renderCalendar() {
    const grid       = document.getElementById('cal-grid');
    const labelEl    = document.getElementById('cal-month-year');
    const firstDay   = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth= new Date(calYear, calMonth + 1, 0).getDate();
    const today      = new Date();

    labelEl.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;
    grid.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = d;

      const isToday    = (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear());
      const isWedding  = (d === WEDDING_DAY && calMonth === WEDDING_MONTH && calYear === WEDDING_YEAR);

      if (isWedding)  cell.classList.add('wedding-day');
      else if (isToday) cell.classList.add('today');

      if (isWedding) cell.title = '💛 Our Wedding Day!';
      grid.appendChild(cell);
    }
  }

  document.getElementById('cal-prev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  renderCalendar();

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
     6. RSVP FORM
  ============================================= */
  const rsvpForm     = document.getElementById('rsvp-form');
  const guestsGroup  = document.getElementById('guests-group');
  const attendanceRadios = rsvpForm.querySelectorAll('input[name="attendance"]');

  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      guestsGroup.style.display = radio.value === 'no' ? 'none' : '';
    });
  });

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name       = document.getElementById('rsvp-name').value.trim();
    const email      = document.getElementById('rsvp-email').value.trim();
    const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');

    // Basic validation
    if (!name) { flashError('rsvp-name', 'Please enter your name'); return; }
    if (!isValidEmail(email)) { flashError('rsvp-email', 'Please enter a valid email'); return; }
    if (!attendance) { alert('Please select your attendance.'); return; }

    // Simulate submission
    const successEl = document.getElementById('rsvp-success');
    rsvpForm.querySelector('.btn-primary').disabled = true;
    rsvpForm.querySelector('.btn-primary').textContent = 'Sending...';

    setTimeout(() => {
      successEl.classList.remove('hidden');
      rsvpForm.reset();
      rsvpForm.querySelector('.btn-primary').disabled = false;
      rsvpForm.querySelector('.btn-primary').textContent = 'Send RSVP';
      guestsGroup.style.display = '';
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

  const msgForm = document.getElementById('message-form');
  msgForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('msg-name').value.trim();
    const text = document.getElementById('msg-text').value.trim();

    if (!name) { flashError('msg-name', 'Please enter your name'); return; }
    if (!text) { flashError('msg-text', 'Please write a message'); return; }
    if (sigPad.isEmpty()) {
      alert('Please add your signature before sending.');
      return;
    }

    // In a real implementation, you'd POST name, text, and sigPad.toDataURL() to your backend
    const successEl = document.getElementById('msg-success');
    msgForm.querySelector('.btn-primary').disabled = true;
    msgForm.querySelector('.btn-primary').textContent = 'Sending...';

    setTimeout(() => {
      successEl.classList.remove('hidden');
      msgForm.reset();
      sigPad.clear();
      msgForm.querySelector('.btn-primary').disabled = false;
      msgForm.querySelector('.btn-primary').textContent = 'Send Private Message';
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

    if (!name || !text) {
      alert('Please fill in both your name and your wish.');
      return;
    }

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
    '#story .story-card, #countdown-section, #calendar-section .calendar-widget, ' +
    '#itinerary .itinerary-item, #dresscode .dress-swatches, .gallery-item, ' +
    '#rsvp .rsvp-form, #message-section .message-form, #wishes .wish-card, ' +
    '#location .location-card, #weather-widget, #gift .gift-card'
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
     12. WEATHER FORECAST WIDGET
     API: Open-Meteo (free, no key required)
     Venue: Kajang, Selangor (2.9836, 101.7884)
     Date: 2026-04-12
  ============================================= */
  (function initWeather() {
    const LAT  = 2.9836;
    const LON  = 101.7884;
    const DATE = '2026-04-12';
    const API  = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
                 `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
                 `precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
                 `&timezone=Asia%2FKuala_Lumpur&start_date=${DATE}&end_date=${DATE}`;

    /* WMO Weather Interpretation Codes — labels & emoji */
    const WMO = {
      0:  { label: 'Clear Sky',           emoji: '☀️'  },
      1:  { label: 'Mainly Clear',        emoji: '🌤️' },
      2:  { label: 'Partly Cloudy',       emoji: '⛅'  },
      3:  { label: 'Overcast',            emoji: '☁️'  },
      45: { label: 'Foggy',               emoji: '🌫️' },
      48: { label: 'Icy Fog',             emoji: '🌫️' },
      51: { label: 'Light Drizzle',       emoji: '🌦️' },
      53: { label: 'Moderate Drizzle',    emoji: '🌦️' },
      55: { label: 'Heavy Drizzle',       emoji: '🌧️' },
      61: { label: 'Light Rain',          emoji: '🌧️' },
      63: { label: 'Moderate Rain',       emoji: '🌧️' },
      65: { label: 'Heavy Rain',          emoji: '🌧️' },
      80: { label: 'Slight Showers',      emoji: '🌦️' },
      81: { label: 'Moderate Showers',    emoji: '🌦️' },
      82: { label: 'Heavy Showers',       emoji: '⛈️'  },
      95: { label: 'Thunderstorm',        emoji: '⛈️'  },
      96: { label: 'Thunderstorm',        emoji: '⛈️'  },
      99: { label: 'Thunderstorm + Hail', emoji: '⛈️'  },
    };

    function wmoLookup(code) {
      return WMO[code] || { label: 'Variable', emoji: '🌡️' };
    }

    function buildHTML(d) {
      const w = wmoLookup(d.weatherCode);
      const avgTemp = Math.round((d.tempMax + d.tempMin) / 2);
      const estimateBadge = d.isEstimate
        ? `<div class="weather-estimate-badge">
             <i class="fas fa-info-circle"></i>
             Typical April climate &mdash; live forecast available ~16 days before the wedding
           </div>`
        : '';
      // All interpolated values are numbers or from our own hardcoded lookup — no XSS risk
      return `${estimateBadge}
        <div class="weather-main">
          <div class="weather-icon-big">${w.emoji}</div>
          <div>
            <div class="weather-temp-range">
              <span class="temp-high">${d.tempMax}&deg;C</span>
              <span class="temp-low">/ ${d.tempMin}&deg;C</span>
            </div>
            <div class="weather-condition">${w.label}</div>
          </div>
        </div>
        <div class="weather-stats">
          <div class="weather-stat">
            <i class="fas fa-umbrella"></i>
            <span class="stat-val">${d.rain}%</span>
            <span class="stat-label">Rain Chance</span>
          </div>
          <div class="weather-stat">
            <i class="fas fa-wind"></i>
            <span class="stat-val">${d.wind} km/h</span>
            <span class="stat-label">Wind</span>
          </div>
          <div class="weather-stat">
            <i class="fas fa-sun"></i>
            <span class="stat-val">${d.uv}</span>
            <span class="stat-label">UV Index</span>
          </div>
          <div class="weather-stat">
            <i class="fas fa-thermometer-half"></i>
            <span class="stat-val">${avgTemp}&deg;C</span>
            <span class="stat-label">Avg Temp</span>
          </div>
        </div>
        <p class="weather-note">
          ${d.isEstimate
            ? 'Based on Kajang\'s historical April climate data'
            : 'Live forecast &mdash; Open-Meteo &middot; Kajang, Selangor'}
        </p>`;
    }

    /* Typical April climate for Kajang/KL when forecast not yet available */
    function showEstimate() {
      const el = document.getElementById('weather-content');
      if (!el) return;
      el.innerHTML = buildHTML({
        weatherCode: 80,  // Slight showers typical for KL April afternoons
        tempMax: 33,
        tempMin: 24,
        rain: 65,
        wind: 15,
        uv: 11,
        isEstimate: true,
      });
    }

    const contentEl = document.getElementById('weather-content');
    if (!contentEl) return;

    fetch(API)
      .then(function (res) {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(function (data) {
        /* Open-Meteo returns empty arrays if date is out of forecast range */
        if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
          showEstimate();
          return;
        }
        contentEl.innerHTML = buildHTML({
          weatherCode: data.daily.weather_code[0],
          tempMax:     Math.round(data.daily.temperature_2m_max[0]),
          tempMin:     Math.round(data.daily.temperature_2m_min[0]),
          rain:        data.daily.precipitation_probability_max[0] != null
                         ? data.daily.precipitation_probability_max[0]
                         : '—',
          wind:        Math.round(data.daily.wind_speed_10m_max[0]),
          uv:          Math.round(data.daily.uv_index_max[0]),
          isEstimate:  false,
        });
      })
      .catch(showEstimate);
  })();

  /* =============================================
     HELPERS
  ============================================= */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function flashError(inputId, msg) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.style.borderColor = '#e53935';
    el.placeholder = msg;
    el.focus();
    setTimeout(() => {
      el.style.borderColor = '';
    }, 2500);
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
