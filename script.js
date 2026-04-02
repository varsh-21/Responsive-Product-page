/* ============================================================
   SCRIPT.JS — Mangalam Pipes
   1. Image Carousel & Zoom
   2. Sticky Product Bar & Mobile Nav
   3. FAQ Accordion
   4. Process Stepper
   5. Modals (Catalogue + Callback)
   6. Scroll Reveal
============================================================ */


/* ─────────────────────────────────────────────────────────
   1. IMAGE CAROUSEL & ZOOM
───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const images = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900',
    'https://picsum.photos/seed/hdpe4/800/600',
    'https://picsum.photos/seed/hdpe1/800/600',
    'https://picsum.photos/seed/hdpe3/800/600',
    'https://images.unsplash.com/photo-1581092160607-a783255640a6?w=900',
    'https://picsum.photos/seed/hdpe2/800/600'
  ];

  const mainImg     = document.getElementById('mainImg');
  const zoomImg     = document.getElementById('zoomImg');
  const zoomLens    = document.getElementById('zoomLens');
  const zoomPreview = document.getElementById('zoomPreview');
  const mainWrap    = document.getElementById('mainWrap');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const thumbStrip  = document.getElementById('thumbStrip');
  const imgCounter  = document.getElementById('imgCounter');
  const zoomHint    = document.getElementById('zoomHint');

  if (!mainImg) return;

  let current   = 0;
  let isZooming = false;

  function setImage(idx) {
    current = (idx + images.length) % images.length;
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = images[current];
      zoomImg.src = images[current];
      mainImg.style.opacity = '1';
    }, 140);
    imgCounter.textContent = `${current + 1} / ${images.length}`;
    thumbStrip.querySelectorAll('.thumb-btn').forEach((b, i) => {
      b.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => setImage(current - 1));
  nextBtn.addEventListener('click', () => setImage(current + 1));

  thumbStrip.addEventListener('click', (e) => {
    const b = e.target.closest('.thumb-btn');
    if (b) setImage(Number(b.dataset.index));
  });

  thumbStrip.querySelectorAll('.thumb-btn').forEach((b, i) => {
    b.addEventListener('mouseenter', () => { mainImg.style.opacity = '0.72'; mainImg.src = images[i]; });
    b.addEventListener('mouseleave', () => { mainImg.style.opacity = '1';    mainImg.src = images[current]; });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  setImage(current - 1);
    if (e.key === 'ArrowRight') setImage(current + 1);
  });

  let touchStartX = 0;
  mainWrap.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  mainWrap.addEventListener('touchend',   (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) dx < 0 ? setImage(current + 1) : setImage(current - 1);
  }, { passive: true });

  /* Zoom */
  /* ── Zoom ── */
const LENS_W    = 80;    // must match CSS width
const LENS_H    = 80;    // must match CSS height
const PREVIEW_W = 200;   // must match CSS width
const PREVIEW_H = 200;   // must match CSS height
const PANEL_GAP = 20;    // space between image edge and preview panel

const ZOOM_X = PREVIEW_W / LENS_W;   // = 4 — how much bigger preview is vs lens
const ZOOM_Y = PREVIEW_H / LENS_H;   // = 4

const isHoverDevice = () => window.matchMedia('(hover: hover)').matches;

mainWrap.addEventListener('mouseenter', () => {
  if (!isHoverDevice()) return;
  isZooming = true;
  zoomImg.src = images[current];
  zoomLens.style.opacity = '1';
  zoomPreview.classList.add('visible');
  zoomHint.classList.add('hidden');
});

mainWrap.addEventListener('mouseleave', () => {
  isZooming = false;
  zoomLens.style.opacity = '0';
  zoomPreview.classList.remove('visible');
});

mainWrap.addEventListener('mousemove', (e) => {
  if (!isHoverDevice() || !isZooming) return;

  const rect = mainWrap.getBoundingClientRect();

  // ── Step 1: cursor position relative to image ──
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  // ── Step 2: lens top-left (clamped so lens never leaves image) ──
  const lensLeft = Math.max(0, Math.min(cx - LENS_W / 2, rect.width  - LENS_W));
  const lensTop  = Math.max(0, Math.min(cy - LENS_H / 2, rect.height - LENS_H));

  // ── Step 3: place lens ──
  zoomLens.style.left = lensLeft + 'px';
  zoomLens.style.top  = lensTop  + 'px';

  // ── Step 4: scale preview image to ZOOM_X × display size ──
  //    This makes each pixel of the lens area = 1 pixel in the preview
  const scaledW = rect.width  * ZOOM_X;
  const scaledH = rect.height * ZOOM_Y;
  zoomImg.style.width  = scaledW + 'px';
  zoomImg.style.height = scaledH + 'px';

  // ── Step 5: shift preview image so lens area is at top-left of preview ──
  //    lensLeft on the display image = lensLeft * ZOOM_X on the scaled image
  //    Negate it to shift that region into view
  zoomImg.style.left = -(lensLeft * ZOOM_X) + 'px';
  zoomImg.style.top  = -(lensTop  * ZOOM_Y) + 'px';

  // ── Step 6: position preview panel beside the image ──
  let panelX = rect.right + PANEL_GAP;
  let panelY = e.clientY - PREVIEW_H / 2;

  // flip to left side if overflows right viewport edge
  if (panelX + PREVIEW_W > window.innerWidth - PANEL_GAP) {
    panelX = rect.left - PREVIEW_W - PANEL_GAP;
  }
  // clamp vertically inside viewport
  panelY = Math.max(PANEL_GAP, Math.min(panelY, window.innerHeight - PREVIEW_H - PANEL_GAP));

  zoomPreview.style.left = panelX + 'px';
  zoomPreview.style.top  = panelY + 'px';
});

// sync preview src when carousel changes
new MutationObserver(() => {
  if (isZooming) zoomImg.src = images[current];
}).observe(mainImg, { attributes: true, attributeFilter: ['src'] });
  setImage(0);
}());


/* ─────────────────────────────────────────────────────────
   2. STICKY PRODUCT BAR & MOBILE NAV
   Desktop: slides to translateY(header-h) below the nav
   Mobile:  slides to translateY(0) — takes the top spot,
            main header slides off-screen upward
───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const stickyBar  = document.getElementById('stickyHeader');
  const mainHeader = document.getElementById('header');
  const heroEl     = document.getElementById('hero');
  const navToggle  = document.getElementById('navToggle');
  const navList    = document.getElementById('navList');

  if (!stickyBar) return;

  const isMobile = () => window.innerWidth <= 799;

  let threshold = 0;
  let ticking   = false;

  /* Calculate the scroll position at which #hero bottom exits viewport */
  function updateThreshold() {
    if (!heroEl) { threshold = 300; return; }
    threshold = window.scrollY + heroEl.getBoundingClientRect().bottom;
  }

  updateThreshold();
  window.addEventListener('resize', updateThreshold, { passive: true });
  window.addEventListener('load',   updateThreshold);

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const visible = window.scrollY >= threshold;

      /* Show / hide sticky bar */
      stickyBar.classList.toggle('visible', visible);
      stickyBar.setAttribute('aria-hidden', String(!visible));

      /* Mobile: slide main header off-screen when sticky bar is showing */
      if (mainHeader) {
        if (isMobile()) mainHeader.classList.toggle('sticky-active', visible);
        else            mainHeader.classList.remove('sticky-active');
      }

      ticking = false;
    });
    ticking = true;
  });

  /* Hamburger toggle */
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navList.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}());


/* ─────────────────────────────────────────────────────────
   3. FAQ ACCORDION
───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item    = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}());

/* ─────────────────────────────────────────────────────────
   Versitile application
───────────────────────────────────────────────────────── */
const track = document.getElementById('appTrack');
const prevBtn = document.getElementById('appPrev');
const nextBtn = document.getElementById('appNext');

const totalCards = 4; // original cards only
let currentIndex = 0;
let autoPlay;

function getCardsPerView() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 4;
}

function goToIndex(index) {
  const cardsPerView = getCardsPerView();
  const cardWidth = track.children[0].offsetWidth + 20; // width + gap

  // Seamless loop reset
  if (index >= totalCards) {
    index = 0;
    track.style.transition = 'none';
    track.style.transform = `translateX(0)`;
    setTimeout(() => {
      track.style.transition = '0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 50);
    currentIndex = 0;
    return;
  }
  if (index < 0) index = totalCards - cardsPerView;

  currentIndex = index;
  track.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
}

nextBtn.addEventListener('click', () => {
  goToIndex(currentIndex + 1);
  resetAutoPlay();
});

prevBtn.addEventListener('click', () => {
  goToIndex(currentIndex - 1);
  resetAutoPlay();
});

function startAutoPlay() {
  autoPlay = setInterval(() => goToIndex(currentIndex + 1), 3000);
}

function resetAutoPlay() {
  clearInterval(autoPlay);
  startAutoPlay();
}

// Pause on hover
track.addEventListener('mouseenter', () => clearInterval(autoPlay));
track.addEventListener('mouseleave', startAutoPlay);

// Start
startAutoPlay();

/* ─────────────────────────────────────────────────────────
   4. PROCESS STEPPER
───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const steps = [
    { title: 'High-Grade Raw Material Selection', desc: 'PE100 grade virgin resin inspected for optimal molecular weight distribution and contamination-free quality.', bullets: ['PE100 grade virgin resin', 'Molecular weight verification', 'Contamination-free'], image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80' },
    { title: 'Precision Barrel Extrusion',         desc: 'State-of-the-art extruders with precise temperature zoning ensure uniform melt flow and consistent pipe properties.', bullets: ['Multi-zone temperature control', 'Uniform melt pressure', 'Screw design optimization'], image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800' },
    { title: 'Controlled Water Cooling',           desc: 'Calibrated spray cooling solidifies pipe uniformly, eliminating residual stress for long-term stability.', bullets: ['Precision spray cooling', 'Stress-free crystallization', 'Uniform cooling rates'], image: 'https://picsum.photos/seed/cooling1/800/500' },
    { title: 'Vacuum Sizing & Calibration',        desc: 'Vacuum tanks lock in precise outer diameter and wall thickness throughout the entire pipe length.', bullets: ['Vacuum tank technology', 'Precise OD control', 'Wall thickness uniformity'], image: 'https://picsum.photos/seed/sizing1/800/500' },
    { title: 'Multi-Stage Quality Control',        desc: 'Wall thickness gauging, hydrostatic testing, and dimensional verification at every production stage.', bullets: ['Wall thickness gauging', 'Hydrostatic testing', 'Dimensional verification'], image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
    { title: 'Permanent Inkjet Marking',           desc: 'Full specification marking: size, pressure class, SDR, standards, production date, and batch code.', bullets: ['Complete spec marking', 'Batch traceability', 'Standards compliance'], image: 'https://picsum.photos/seed/marking1/800/500' },
    { title: 'Precision Cut-to-Length',            desc: 'Automated planetary saws deliver burr-free cuts to exact specified lengths.', bullets: ['Planetary saw technology', 'Burr-free cutting', 'Exact length precision'], image: 'https://picsum.photos/seed/cutting1/800/500' },
    { title: 'UV-Protected Packaging',             desc: 'UV-stabilised bundling with full quality certificates and traceability documentation.', bullets: ['UV protective wrap', 'Quality certificates', 'Traceability docs'], image: 'https://picsum.photos/seed/packaging1/800/500' }
  ];

  const textEl   = document.getElementById('processText');
  const imgEl    = document.getElementById('processImg');
  const leftBtn  = document.getElementById('mediaLeft');
  const rightBtn = document.getElementById('mediaRight');
  const counter  = document.getElementById('mediaCounter');
  const tabs     = document.querySelectorAll('.proc-tab');

  if (!textEl) return;

  let activeStep = 0;

  function renderText(i) {
    const s = steps[i];
    textEl.innerHTML = `
      <div class="proc-step-badge">Step ${i + 1} / ${steps.length}</div>
      <div class="proc-step-title">${s.title}</div>
      <p   class="proc-step-desc">${s.desc}</p>
      <ul  class="proc-bullets">
        ${s.bullets.map((b) => `
          <li>
            <span class="proc-bullet-icon">
              <svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2">
                <polyline points="2 6 5 9 10 3"/>
              </svg>
            </span>
            ${b}
          </li>`).join('')}
      </ul>`;
  }

  function renderImg(i) {
    imgEl.style.opacity = '0';
    setTimeout(() => { imgEl.src = steps[i].image; imgEl.style.opacity = '1'; }, 200);
  }

  function goToStep(i) {
    activeStep = Math.max(0, Math.min(i, steps.length - 1));
    tabs.forEach((t, j) => {
      t.classList.toggle('active', j === activeStep);
      t.setAttribute('aria-selected', String(j === activeStep));
    });
    renderText(activeStep);
    renderImg(activeStep);
    counter.textContent = `${activeStep + 1} / ${steps.length}`;
    leftBtn.disabled    = activeStep === 0;
    rightBtn.disabled   = activeStep === steps.length - 1;
    tabs[activeStep].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => goToStep(i)));
  leftBtn.addEventListener('click',  () => goToStep(activeStep - 1));
  rightBtn.addEventListener('click', () => goToStep(activeStep + 1));

  document.addEventListener('keydown', (e) => {
    if (!document.activeElement.closest('#process')) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goToStep(activeStep - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToStep(activeStep + 1); }
  });

  goToStep(0);
});


/* ─────────────────────────────────────────────────────────
   5. MODALS
───────────────────────────────────────────────────────── */

/* Open / close helpers */
function openCatalogueModal() {
  const m = document.getElementById('catalogueModal');
  m.classList.add('active');
  m.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('email').focus(), 200);
}
function closeCatalogueModal() {
  const m = document.getElementById('catalogueModal');
  m.classList.remove('active');
  m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function openCallbackModal() {
  const m = document.getElementById('callbackModal');
  m.classList.add('active');
  m.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('fullName').focus(), 200);
}
function closeCallbackModal() {
  const m = document.getElementById('callbackModal');
  m.classList.remove('active');
  m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* Validation helpers */
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function isValidPhone(v) { return v.replace(/\D/g, '').length === 10; }

function showError(el, id)  { el.classList.add('invalid'); el.classList.remove('valid'); document.getElementById(id).classList.add('visible'); }
function clearError(el, id) { el.classList.remove('invalid'); el.classList.add('valid'); document.getElementById(id).classList.remove('visible'); }
function resetField(el, id) { el.classList.remove('valid', 'invalid'); document.getElementById(id).classList.remove('visible'); }

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ── Catalogue ── */
  const cForm   = document.getElementById('catalogueForm');
  const cSubmit = document.getElementById('catalogueSubmit');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');

  function valCatalogue() {
    cSubmit.disabled = !(isValidEmail(emailEl.value) && (phoneEl.value === '' || isValidPhone(phoneEl.value)));
  }

  emailEl.addEventListener('input', () => {
    if (!emailEl.value.trim()) resetField(emailEl, 'emailError');
    else if (isValidEmail(emailEl.value)) clearError(emailEl, 'emailError');
    else showError(emailEl, 'emailError');
    valCatalogue();
  });

  phoneEl.addEventListener('input', () => {
    if (!phoneEl.value) resetField(phoneEl, 'phoneError');
    else if (isValidPhone(phoneEl.value)) clearError(phoneEl, 'phoneError');
    else showError(phoneEl, 'phoneError');
    valCatalogue();
  });

  cForm.addEventListener('submit', (e) => {
    e.preventDefault();
    cSubmit.textContent = 'Sending\u2026';
    cSubmit.disabled    = true;
    setTimeout(() => {
      alert('Brochure sent to your email!');
      closeCatalogueModal();
      cForm.reset();
      [emailEl, phoneEl].forEach((el) => el.classList.remove('valid', 'invalid'));
      cForm.querySelectorAll('.field-error').forEach((el) => el.classList.remove('visible'));
      cSubmit.textContent = 'Download Brochure';
      cSubmit.disabled    = true;
    }, 800);
  });

  document.getElementById('catalogueClose').addEventListener('click', closeCatalogueModal);
  document.getElementById('catalogueModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('catalogueModal')) closeCatalogueModal();
  });

  /* ── Callback ── */
  const cbForm   = document.getElementById('callbackForm');
  const cbSubmit = document.getElementById('callbackSubmit');
  const nameEl   = document.getElementById('fullName');
  const cbEmail  = document.getElementById('callbackEmail');
  const cbPhone  = document.getElementById('phoneNumber');

  function valCallback() {
    cbSubmit.disabled = !(nameEl.value.trim().length >= 2 && isValidEmail(cbEmail.value) && isValidPhone(cbPhone.value));
  }

  nameEl.addEventListener('input', () => {
    if (!nameEl.value.trim()) resetField(nameEl, 'nameError');
    else if (nameEl.value.trim().length >= 2) clearError(nameEl, 'nameError');
    else showError(nameEl, 'nameError');
    valCallback();
  });

  cbEmail.addEventListener('input', () => {
    if (!cbEmail.value.trim()) resetField(cbEmail, 'callbackEmailError');
    else if (isValidEmail(cbEmail.value)) clearError(cbEmail, 'callbackEmailError');
    else showError(cbEmail, 'callbackEmailError');
    valCallback();
  });

  cbPhone.addEventListener('input', () => {
    if (!cbPhone.value) resetField(cbPhone, 'callbackPhoneError');
    else if (isValidPhone(cbPhone.value)) clearError(cbPhone, 'callbackPhoneError');
    else showError(cbPhone, 'callbackPhoneError');
    valCallback();
  });

  cbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    cbSubmit.textContent = 'Submitting\u2026';
    cbSubmit.disabled    = true;
    setTimeout(() => {
      alert('Request sent! We will call you within 2 hours.');
      closeCallbackModal();
      cbForm.reset();
      [nameEl, cbEmail, cbPhone].forEach((el) => el.classList.remove('valid', 'invalid'));
      cbForm.querySelectorAll('.field-error').forEach((el) => el.classList.remove('visible'));
      cbSubmit.textContent = 'Submit Form';
      cbSubmit.disabled    = true;
    }, 800);
  });

  document.getElementById('callbackClose').addEventListener('click', closeCallbackModal);
  document.getElementById('callbackModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('callbackModal')) closeCallbackModal();
  });

  /* ESC closes both */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCatalogueModal(); closeCallbackModal(); }
  });
});


/* ─────────────────────────────────────────────────────────
   6. SCROLL REVEAL
───────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('visible'), idx * 60);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
}());