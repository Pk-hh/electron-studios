/* ============================================================
   ELECTRON STUDIOS — EXTRAS FEATURE SCRIPTS
   Announcement Bar · Cost Estimator · Speed Dial ·
   Portfolio Lightbox · Social Proof Popup
   ============================================================ */

// ══════════════════════════════════════════════════════════════
// ── ANNOUNCEMENT BAR ──
// ══════════════════════════════════════════════════════════════
(function initAnnounceBar() {
  const bar     = document.getElementById('announceBar');
  const closeBtn = document.getElementById('announceClose');
  if (!bar) return;

  const dismissed = sessionStorage.getItem('electronAnnounce');
  if (dismissed) { bar.classList.add('hidden'); return; }

  document.body.classList.add('announce-visible');
  const h = bar.offsetHeight;
  document.documentElement.style.setProperty('--announce-h', h + 'px');

  closeBtn.addEventListener('click', () => {
    bar.classList.add('hidden');
    document.body.classList.remove('announce-visible');
    sessionStorage.setItem('electronAnnounce', 'dismissed');
  });

  // Auto-dismiss after 20s
  setTimeout(() => {
    if (!bar.classList.contains('hidden')) {
      bar.classList.add('hidden');
      document.body.classList.remove('announce-visible');
    }
  }, 20000);
})();

// ══════════════════════════════════════════════════════════════
// ── PROJECT COST ESTIMATOR ──
// ══════════════════════════════════════════════════════════════
(function initEstimator() {
  const steps    = document.querySelectorAll('.est-step');
  const nextBtn  = document.getElementById('estNext');
  const prevBtn  = document.getElementById('estPrev');
  const dots     = document.querySelectorAll('.est-dot');
  const result   = document.getElementById('estimatorResult');
  const stepsWrap = document.querySelector('.estimator-steps');
  const estRange = document.getElementById('estRange');
  const restartBtn = document.getElementById('estRestartBtn');
  if (!nextBtn) return;

  let currentStep = 1;
  const totalSteps = 4;
  const selections = { type: null, complexity: null, timeline: null, addons: [] };

  function showStep(n) {
    steps.forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`.est-step[data-step="${n}"]`);
    if (target) target.classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i < n));
    prevBtn.disabled = (n === 1);
    validateStep(n);
  }

  function validateStep(n) {
    const stepSelections = {
      1: selections.type,
      2: selections.complexity,
      3: selections.timeline,
      4: selections.addons.length > 0,
    };
    nextBtn.disabled = !stepSelections[n];
    if (n === totalSteps) {
      nextBtn.querySelector('span').textContent = 'Calculate';
    } else {
      nextBtn.querySelector('span').textContent = 'Next';
    }
  }

  // Handle option clicks
  document.querySelectorAll('#estType    .est-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#estType .est-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selections.type     = { value: btn.dataset.value, cost: parseInt(btn.dataset.cost) };
      validateStep(1);
    });
  });

  document.querySelectorAll('#estComplexity .est-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#estComplexity .est-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selections.complexity = { value: btn.dataset.value, mult: parseFloat(btn.dataset.mult) };
      validateStep(2);
    });
  });

  document.querySelectorAll('#estTimeline .est-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#estTimeline .est-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selections.timeline = { value: btn.dataset.value, mult: parseFloat(btn.dataset.mult) };
      validateStep(3);
    });
  });

  document.querySelectorAll('#estAddons .est-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      if (val === 'none') {
        document.querySelectorAll('#estAddons .est-opt').forEach(b => b.classList.remove('selected'));
        selections.addons = [{ value: 'none', add: 0 }];
        btn.classList.add('selected');
      } else {
        document.querySelector('#estAddons .est-opt[data-value="none"]')?.classList.remove('selected');
        selections.addons = selections.addons.filter(a => a.value !== 'none');
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
          selections.addons = selections.addons.filter(a => a.value !== val);
        } else {
          btn.classList.add('selected');
          selections.addons.push({ value: val, add: parseInt(btn.dataset.add) });
        }
      }
      validateStep(4);
    });
  });

  function calcEstimate() {
    const base   = selections.type?.cost || 0;
    const cMult  = selections.complexity?.mult || 1;
    const tMult  = selections.timeline?.mult || 1;
    const addons = selections.addons.reduce((s, a) => s + a.add, 0);

    const low  = Math.round((base * cMult * tMult + addons) / 1000) * 1000;
    const high = Math.round(low * 1.4 / 1000) * 1000;

    return { low, high };
  }

  function showResult() {
    stepsWrap.style.display = 'none';
    result.classList.add('show');
    document.querySelector('.est-nav').style.display = 'none';

    const { low, high } = calcEstimate();
    const fmt = (n) => '₹' + n.toLocaleString('en-IN');
    estRange.textContent = `${fmt(low)} – ${fmt(high)}`;

    if (typeof showToast === 'function') {
      showToast('info', 'Estimate Ready! ⚡', `Your project could cost between ${fmt(low)} – ${fmt(high)}`);
    }
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    } else {
      showResult();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  restartBtn?.addEventListener('click', () => {
    currentStep = 1;
    selections.type = null; selections.complexity = null;
    selections.timeline = null; selections.addons = [];
    document.querySelectorAll('.est-opt').forEach(b => b.classList.remove('selected'));
    stepsWrap.style.display = 'block';
    result.classList.remove('show');
    document.querySelector('.est-nav').style.display = 'flex';
    showStep(1);
  });

  showStep(1);
})();

// ══════════════════════════════════════════════════════════════
// ── SPEED DIAL ──
// ══════════════════════════════════════════════════════════════
(function initSpeedDial() {
  const dial    = document.getElementById('speedDial');
  const trigger = document.getElementById('sdTrigger');
  const quoteBtn = document.getElementById('sdQuoteBtn');
  if (!dial || !trigger) return;

  trigger.addEventListener('click', () => dial.classList.toggle('open'));

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dial.contains(e.target)) dial.classList.remove('open');
  });

  // Quick Quote button inside speed dial opens the panel
  quoteBtn?.addEventListener('click', () => {
    dial.classList.remove('open');
    const panel = document.getElementById('quickQuotePanel');
    const overlay = document.getElementById('qqpOverlay');
    if (panel) {
      panel.classList.add('open');
      overlay?.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  });
})();

// ══════════════════════════════════════════════════════════════
// ── PORTFOLIO LIGHTBOX ──
// ══════════════════════════════════════════════════════════════
(function initLightbox() {
  const lightbox = document.getElementById('portfolioLightbox');
  const overlay  = document.getElementById('lightboxOverlay');
  const closeBtn = document.getElementById('lightboxClose');
  const preview  = document.getElementById('lightboxPreview');
  const iconEl   = document.getElementById('lightboxIcon');
  const tagEl    = document.getElementById('lightboxTag');
  const titleEl  = document.getElementById('lightboxTitle');
  const descEl   = document.getElementById('lightboxDesc');
  const techEl   = document.getElementById('lightboxTech');
  if (!lightbox) return;

  // Portfolio data (enriched descriptions)
  const portfolioData = {
    portItem1: {
      title: 'Agency Landing Page',
      tag: 'Web Development',
      desc: 'A premium, animated agency landing page built with HTML, CSS, and lightweight JavaScript. Features glassmorphism UI, smooth scroll animations, mobile-first responsive design, and integrates Formspree for lead capture. Achieved a 98/100 Google Lighthouse performance score.',
      tech: ['HTML/CSS', 'JavaScript', 'GSAP', 'Netlify'],
      icon: '🌐',
      color: 'linear-gradient(135deg, #FF6B00, #FF8C38)'
    },
    portItem2: {
      title: 'Smart Home Controller',
      tag: 'IoT System',
      desc: 'ESP32-based home automation system with real-time MQTT messaging over WiFi. Includes a Flutter mobile app for device control, Firebase Realtime Database for state sync, and voice command support via Google Assistant integration. Deployed in 8 homes across Hyderabad.',
      tech: ['ESP32', 'MQTT', 'Flutter', 'Firebase'],
      icon: '🏠',
      color: 'linear-gradient(135deg, #1A1A1A, #3A3A3A)'
    },
    portItem3: {
      title: 'Attendance Management App',
      tag: 'Mobile App',
      desc: 'Facial recognition attendance system built with Flutter and Google ML Kit. Features a real-time cloud sync dashboard, admin analytics panel, and offline-first architecture with conflict resolution. Deployed for 500+ students across 3 colleges in Hyderabad.',
      tech: ['Flutter', 'Firebase', 'ML Kit', 'Node.js'],
      icon: '📱',
      color: 'linear-gradient(135deg, #FF8C38, #FFBA7A)'
    },
    portItem4: {
      title: 'Custom PCB Motor Driver',
      tag: 'Embedded Electronics',
      desc: '4-channel H-bridge motor driver board in KiCad with dual-layer PCB layout optimized for compact footprint. Features MOSFET-based switching, PWM speed control via microcontroller, thermal protection, and current limiting. Manufactured and tested in under 2 weeks.',
      tech: ['KiCad', 'C++', 'MOSFET', 'PWM'],
      icon: '⚙️',
      color: 'linear-gradient(135deg, #1A1A1A, #333333)'
    },
    portItem5: {
      title: 'E-Commerce Platform',
      tag: 'Web Development',
      desc: 'Full-stack multi-vendor e-commerce platform with Razorpay payment gateway, real-time order tracking, seller dashboard, inventory management, and a customer-facing PWA with offline support. Built for a garments brand in Hyderabad.',
      tech: ['React', 'Node.js', 'MongoDB', 'Razorpay'],
      icon: '🛒',
      color: 'linear-gradient(135deg, #FF6B00, #E55A00)'
    },
    portItem6: {
      title: 'Sensor Node Network',
      tag: 'IoT System',
      desc: 'Industrial IoT sensor network with 12 ESP32 nodes collecting temperature, humidity, and vibration data over MQTT. Includes a Node.js backend with time-series data storage and a React dashboard with live charts and threshold alerts via SMS.',
      tech: ['ESP32', 'MQTT', 'Node.js', 'React'],
      icon: '📡',
      color: 'linear-gradient(135deg, #0A0A0A, #1E1E1E)'
    }
  };

  function openLightbox(id) {
    const data = portfolioData[id];
    if (!data) return;

    preview.style.background = data.color;
    iconEl.textContent = data.icon;
    tagEl.textContent   = data.tag;
    titleEl.textContent = data.title;
    descEl.textContent  = data.desc;
    techEl.innerHTML = data.tech.map(t => `<span>${t}</span>`).join('');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Attach click to all portfolio items
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.style.cursor = 'pointer';
    // Add a subtle "View details" hint
    const hint = document.createElement('div');
    hint.className = 'port-view-hint';
    hint.textContent = '🔍 View Details';
    item.querySelector('.port-overlay')?.appendChild(hint);

    item.addEventListener('click', () => openLightbox(item.id));
  });

  closeBtn?.addEventListener('click', closeLightbox);
  overlay?.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

// ══════════════════════════════════════════════════════════════
// ── SOCIAL PROOF POPUP ──
// ══════════════════════════════════════════════════════════════
(function initSocialProof() {
  const popup   = document.getElementById('socialProofPopup');
  const nameEl  = document.getElementById('sppName');
  const textEl  = document.getElementById('sppText');
  const timeEl  = document.getElementById('sppTime');
  const avatarEl = document.getElementById('sppAvatar');
  const closeBtn = document.getElementById('sppClose');
  if (!popup) return;

  const activities = [
    { name: 'Ravi K.', initials: 'RK', text: 'just requested a quote for a mobile app 📱', time: '2 min ago', color: '#FF6B00' },
    { name: 'Sneha M.', initials: 'SM', text: 'viewed the IoT services page ⚡', time: '5 min ago', color: '#4F46E5' },
    { name: 'Arjun T.', initials: 'AT', text: 'started a chat about PCB design 🔧', time: 'Just now', color: '#059669' },
    { name: 'Priya L.', initials: 'PL', text: 'submitted a contact form for a web project 🌐', time: '8 min ago', color: '#DC2626' },
    { name: 'Mohammed R.', initials: 'MR', text: 'is viewing the pricing page 💰', time: '1 min ago', color: '#D97706' },
    { name: 'Kavya N.', initials: 'KN', text: 'requested the company profile PDF 📄', time: '12 min ago', color: '#7C3AED' },
    { name: 'Suresh P.', initials: 'SP', text: 'booked a discovery call 📞', time: '3 min ago', color: '#0891B2' },
  ];

  let popupIdx = 0;
  let hideTimer;

  function showProof() {
    const item = activities[popupIdx % activities.length];
    nameEl.textContent   = item.name;
    textEl.textContent   = item.text;
    timeEl.textContent   = item.time;
    avatarEl.textContent = item.initials;
    avatarEl.style.background = `linear-gradient(135deg, ${item.color}, ${item.color}88)`;

    popup.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => popup.classList.remove('show'), 5000);
    popupIdx++;
  }

  closeBtn?.addEventListener('click', () => {
    popup.classList.remove('show');
    clearTimeout(hideTimer);
  });

  // Show first after 8s, then every 18-25s
  setTimeout(() => {
    showProof();
    setInterval(showProof, Math.random() * 7000 + 18000);
  }, 8000);
})();

// ══════════════════════════════════════════════════════════════
// ── PORT VIEW HINT CSS (injected dynamically) ──
// ══════════════════════════════════════════════════════════════
(function injectPortHintStyle() {
  const s = document.createElement('style');
  s.textContent = `
    .port-view-hint {
      margin-top: 12px;
      display: inline-block;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 99px;
      padding: 6px 16px;
      font-size: 0.78rem;
      font-weight: 700;
      color: rgba(255,255,255,0.90);
      backdrop-filter: blur(8px);
      transition: all 0.25s ease;
    }
    .portfolio-item:hover .port-view-hint {
      background: rgba(255,107,0,0.30);
      border-color: rgba(255,107,0,0.50);
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(s);
})();

console.log('%c⚡ Extras Pack Loaded', 'font-size:14px; font-weight:bold; color:#FFBA7A;');
console.log('%c  → Announce Bar · Estimator · Speed Dial · Lightbox · Social Proof', 'color:#FF8C38;');
