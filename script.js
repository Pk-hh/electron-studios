/* ============================================================
   ELECTRON STUDIOS — JavaScript
   ============================================================ */

// ── Preloader ──
const preloader = document.getElementById('preloader');
const fill = document.getElementById('preloaderFill');
let progress = 0;
const interval = setInterval(() => {
  progress += Math.random() * 15;
  if (progress >= 100) {
    progress = 100;
    clearInterval(interval);
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 400);
  }
  fill.style.width = progress + '%';
  const texts = ['Loading assets...', 'Compiling circuits...', 'Booting systems...', 'Almost ready...'];
  document.querySelector('.preloader-text').textContent = progress < 30 ? texts[0] : progress < 60 ? texts[1] : progress < 90 ? texts[2] : texts[3];
}, 80);

document.body.style.overflow = 'hidden';

// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followX = 0, followY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateCursor() {
  followX += (mouseX - followX) * 0.12;
  followY += (mouseY - followY) * 0.12;
  follower.style.left = followX + 'px';
  follower.style.top = followY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .service-card, .portfolio-item, .filter-btn, .tech-pill').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    cursor.style.background = '#FF8C38';
    follower.style.width = '50px';
    follower.style.height = '50px';
    follower.style.borderColor = 'rgba(255,107,0,0.45)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    cursor.style.background = '#FF6B00';
    follower.style.width = '32px';
    follower.style.height = '32px';
    follower.style.borderColor = 'rgba(255,107,0,0.45)';
  });
});

// ── Navbar ──
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  highlightActiveSection();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  links.forEach(l => {
    l.classList.remove('active');
    if (l.getAttribute('href') === '#' + current) l.classList.add('active');
  });
}

// ── Particle Canvas ──
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.6 + 0.2;
    this.color = Math.random() > 0.5 ? '255,107,0' : '255,140,56';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.strokeStyle = `rgba(255,107,0,${0.15 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ── Scroll Reveal ──
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ── Counter Animation ──
function animateCounter(el, target) {
  let current = 0;
  const step = target / 50;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 40);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.target);
      animateCounter(e.target, target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ── Portfolio Filter ──
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    portfolioItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
        item.style.animation = 'fadeUp 0.5s ease forwards';
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ── Contact Form ──
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formSubmit = document.getElementById('formSubmit');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = formSubmit;
  const originalText = btn.querySelector('span').textContent;
  
  // Get form values
  const formData = {
    name: document.getElementById('nameInput').value,
    email: document.getElementById('emailInput').value,
    phone: document.getElementById('phoneInput').value,
    service: document.getElementById('serviceSelect').value,
    budget: document.getElementById('budgetSelect').value,
    message: document.getElementById('messageInput').value
  };

  btn.querySelector('span').textContent = 'Sending...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  try {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    const baseUrl = isLocalDev && window.location.port !== '5000' ? 'http://localhost:5000' : '';
    const response = await fetch(baseUrl + '/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Backend response:', result.message);
      formSuccess.classList.add('show');
      contactForm.reset();
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    } else {
      console.error('Submission failed:', result.error);
      alert('Error: ' + result.error);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    // If backend isn't running on the same port, fallback or better error message
    alert('Something went wrong. Is the backend running?');
  } finally {
    btn.querySelector('span').textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
});

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Service card tilt + spotlight effect ──
document.querySelectorAll('.service-card').forEach(card => {
  // Add spotlight element
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  card.appendChild(spotlight);

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = -((y - cy) / cy) * 7;
    const rotateY = ((x - cx) / cx) * 7;
    card.style.transform = `translateY(-8px) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.transition = 'transform 0.12s ease';
    // Update spotlight position via CSS custom properties
    card.style.setProperty('--mx', (x / rect.width * 100) + '%');
    card.style.setProperty('--my', (y / rect.height * 100) + '%');
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
  });
});

// ── Portfolio hover parallax ──
document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    item.querySelector('.portfolio-img').style.transform = `translateY(-4px) scale(1.02) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    item.querySelector('.portfolio-img').style.transition = 'transform 0.1s ease';
  });
  item.addEventListener('mouseleave', () => {
    item.querySelector('.portfolio-img').style.transform = '';
    item.querySelector('.portfolio-img').style.transition = 'transform 0.4s ease';
  });
});

// ── Orb parallax on mouse move ──
document.addEventListener('mousemove', (e) => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  const orb1 = document.querySelector('.orb1');
  const orb2 = document.querySelector('.orb2');
  if (orb1) { orb1.style.transform = `translate(${x * 30}px, ${y * 30}px)`; }
  if (orb2) { orb2.style.transform = `translate(${-x * 20}px, ${-y * 20}px)`; }
});

console.log('%c⚡ Electron Studios', 'font-size:24px; font-weight:bold; color:#FF6B00;');
console.log('%cBuilding the digital future — one project at a time.', 'font-size:14px; color:#FF8C38;');

// ── Scroll Progress Bar ──
const scrollProgressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgressBar) scrollProgressBar.style.width = pct + '%';
}, { passive: true });

// ── Dark Mode Toggle ──
const darkToggle = document.getElementById('darkModeToggle');
const savedMode = localStorage.getItem('electronDarkMode');
if (savedMode === 'dark') document.body.classList.add('dark-mode');

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('electronDarkMode', isDark ? 'dark' : 'light');
  });
}

// ── FAQ Accordion ──
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    // Toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ── Skill Bars Animation ──
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target.dataset.width;
      entry.target.style.width = target + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
skillFills.forEach(el => skillObserver.observe(el));

// ── Back To Top ──
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }
}, { passive: true });
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
