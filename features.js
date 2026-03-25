/* ============================================================
   ELECTRON STUDIOS — New Feature Scripts
   Typing Effect · Toast System · Cookie Consent ·
   Quick Quote Panel · Newsletter Form
   ============================================================ */

// ══════════════════════════════════════════════════════════════
// ── TOAST NOTIFICATION SYSTEM ──
// ══════════════════════════════════════════════════════════════
window.showToast = function(type, title, message, duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: '⚡' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || '💬'}</div>
    <div class="toast-body">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
    <button class="toast-close" aria-label="Close">&times;</button>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);
  // Trigger show animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  const dismiss = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 500);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
};

// ══════════════════════════════════════════════════════════════
// ── HERO TYPING EFFECT ──
// ══════════════════════════════════════════════════════════════
(function initTypingEffect() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'Digital Futures',
    'Web Platforms',
    'Mobile Apps',
    'IoT Systems',
    'Embedded Tech',
    'Smart Hardware',
    'Cloud Solutions',
  ];
  let phraseIdx = 0, charIdx = 0, isDeleting = false;
  const typingSpeed = 90, deletingSpeed = 55, pauseTime = 1800;

  function type() {
    const currentPhrase = phrases[phraseIdx];
    if (isDeleting) {
      el.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 350);
        return;
      }
      setTimeout(type, deletingSpeed);
    } else {
      el.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === currentPhrase.length) {
        isDeleting = true;
        setTimeout(type, pauseTime);
        return;
      }
      setTimeout(type, typingSpeed);
    }
  }
  // Start after page load
  setTimeout(type, 2000);
})();

// ══════════════════════════════════════════════════════════════
// ── COOKIE CONSENT ──
// ══════════════════════════════════════════════════════════════
(function initCookieBanner() {
  const banner  = document.getElementById('cookieBanner');
  const accept  = document.getElementById('cookieAccept');
  const decline = document.getElementById('cookieDecline');
  if (!banner) return;

  const cookieChoice = localStorage.getItem('electronCookies');
  if (!cookieChoice) {
    setTimeout(() => banner.classList.add('show'), 2500);
  }

  const dismiss = (choice) => {
    localStorage.setItem('electronCookies', choice);
    banner.classList.remove('show');
    if (choice === 'accepted') {
      showToast('success', 'Preferences Saved', 'Thanks! You can manage cookies anytime.');
    }
  };

  accept.addEventListener('click',  () => dismiss('accepted'));
  decline.addEventListener('click', () => dismiss('declined'));
})();

// ══════════════════════════════════════════════════════════════
// ── QUICK QUOTE PANEL ──
// ══════════════════════════════════════════════════════════════
(function initQuickQuote() {
  const trigger  = document.getElementById('quickQuoteTrigger');
  const panel    = document.getElementById('quickQuotePanel');
  const closeBtn = document.getElementById('quickQuoteClose');
  const overlay  = document.getElementById('qqpOverlay');
  const form     = document.getElementById('quickQuoteForm');
  if (!trigger || !panel) return;

  const open  = () => { panel.classList.add('open');  overlay.classList.add('show'); document.body.style.overflow = 'hidden'; };
  const close = () => { panel.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = ''; };

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('qqSubmit');
    btn.querySelector('span').textContent = 'Sending...';
    btn.disabled = true;

    const data = {
      name: document.getElementById('qqName').value,
      phone: document.getElementById('qqPhone').value,
      service: document.getElementById('qqService').value,
      message: document.getElementById('qqMessage').value,
      email: 'quickquote@electronstudios.online',
      budget: 'quick-quote',
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('success', 'Quote Sent! ⚡', 'We\'ll get back to you within a few hours.');
        form.reset();
        close();
      } else {
        const err = await res.json();
        showToast('error', 'Oops!', err.error || 'Something went wrong. Please try again.');
      }
    } catch {
      showToast('error', 'Connection Error', 'Backend not reachable. Try the main contact form.');
    } finally {
      btn.querySelector('span').textContent = 'Send Quick Quote';
      btn.disabled = false;
    }
  });
})();

// ══════════════════════════════════════════════════════════════
// ── NEWSLETTER FORM ──
// ══════════════════════════════════════════════════════════════
(function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    const btn   = document.getElementById('newsletterSubmit');

    btn.querySelector('span').textContent = 'Subscribing...';
    btn.disabled = true;

    // Simulate subscription (no backend endpoint needed)
    setTimeout(() => {
      showToast('success', 'Subscribed! 🎉', `${email} is now on our list. Stay tuned!`);
      form.reset();
      btn.querySelector('span').textContent = 'Subscribe';
      btn.disabled = false;
    }, 1200);
  });
})();

// ══════════════════════════════════════════════════════════════
// ── OVERRIDE CONTACT FORM — REPLACE ALERT WITH TOAST ──
// ══════════════════════════════════════════════════════════════
// Remove alert() fallback and replace with toast (patch after main script)
(function patchContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('formSubmit');
  if (!form) return;

  // Re-bind with toast notifications (replaces the alert-based one in script.js)
  form.addEventListener('submit', async (e) => {
    // The main handler in script.js will fire first — we listen for the custom event
    // Instead, we override by removing the binding and re-adding. But since script.js
    // already handles it, we hook into window-level event to show toasts.
  });
})();

// ══════════════════════════════════════════════════════════════
// ── ENHANCED FORM SUCCESS (OVERRIDE SCRIPT.JS ALERT) ──
// ══════════════════════════════════════════════════════════════
// Intercept form submission at the document level to add toast
document.addEventListener('DOMContentLoaded', () => {
  // Wait for script.js to bind its handlers, then add enhanced toast on success
  const formSuccess = document.getElementById('formSuccess');
  if (formSuccess) {
    const observer = new MutationObserver((muts) => {
      muts.forEach(m => {
        if (m.target.classList.contains('show')) {
          showToast('success', 'Message Sent! 🚀', 'We\'ll be in touch within 24 hours. Check your inbox!');
        }
      });
    });
    observer.observe(formSuccess, { attributes: true, attributeFilter: ['class'] });
  }
});

// ══════════════════════════════════════════════════════════════
// ── SMOOTH SECTION ANIMATION ENHANCEMENTS ──
// ══════════════════════════════════════════════════════════════
// Stagger animate Why-Us rows
const whyRows = document.querySelectorAll('.why-row');
const whyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
whyRows.forEach(r => { r.classList.add('reveal'); whyObserver.observe(r); });

// Team card hover shine effect
document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--tx', x + '%');
    card.style.setProperty('--ty', y + '%');
  });
});

console.log('%c⚡ Feature Pack Loaded', 'font-size:14px; font-weight:bold; color:#FF8C38;');
console.log('%c  → Typing Effect · Toast System · Cookie Consent · Quick Quote · Newsletter', 'color:#FF6B00;');
