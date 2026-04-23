/* ============================================
   MAHMOUD ELSHORA PORTFOLIO - SCRIPT.JS
   Particles, Theme, Language, Animations
   ============================================ */

// ===== STATE =====
let currentLang = 'ar';
let currentTheme = 'dark';
let mouseX = 0, mouseY = 0;
let cursorDotX = 0, cursorDotY = 0;
let cursorOutlineX = 0, cursorOutlineY = 0;

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initParticles();
  initCursor();
  initHeader();
  initHamburger();
  initThemeToggle();
  initLangToggle();
  initScrollReveal();
  initCounters();
  initNavActiveState();
  initSmoothScroll();
});

// ===== LOADER =====
function initLoader() {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 1800);
}

// ===== PARTICLES =====
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const COUNT = 80;

  const COLORS = ['rgba(0,229,255,', 'rgba(0,230,118,', 'rgba(213,0,249,', 'rgba(41,121,255,'];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life > this.maxLife) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${(1 - dist / 120) * 0.06})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ===== CUSTOM CURSOR =====
function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  if (!dot || !outline) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    outline.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorDotX += (mouseX - cursorDotX) * 0.8;
    cursorDotY += (mouseY - cursorDotY) * 0.8;
    cursorOutlineX += (mouseX - cursorOutlineX) * 0.15;
    cursorOutlineY += (mouseY - cursorOutlineY) * 0.15;

    dot.style.left = cursorDotX - 4 + 'px';
    dot.style.top = cursorDotY - 4 + 'px';
    outline.style.left = cursorOutlineX - 18 + 'px';
    outline.style.top = cursorOutlineY - 18 + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .glass-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(2)';
      outline.style.width = '56px';
      outline.style.height = '56px';
      outline.style.borderColor = 'rgba(0,230,118,0.5)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'scale(1)';
      outline.style.width = '36px';
      outline.style.height = '36px';
      outline.style.borderColor = 'rgba(0,229,255,0.4)';
    });
  });
}

// ===== HEADER SCROLL =====
function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
}

// ===== HAMBURGER =====
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

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
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const root = document.documentElement;

  // Try to restore saved preference
  const saved = localStorage.getItem('theme') || 'dark';
  currentTheme = saved;
  root.setAttribute('data-theme', currentTheme);
  updateThemeIcon();

  toggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (currentTheme === 'dark') {
      icon.className = 'fas fa-sun';
      toggle.title = 'الوضع النهاري';
    } else {
      icon.className = 'fas fa-moon';
      toggle.title = 'الوضع الليلي';
    }
  }
}

// ===== LANGUAGE TOGGLE =====
function initLangToggle() {
  const toggle = document.getElementById('langToggle');
  const langText = document.getElementById('langText');

  toggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    langText.textContent = currentLang === 'ar' ? 'EN' : 'ع';
    applyLanguage();
  });
}

function applyLanguage() {
  const body = document.body;
  const isEn = currentLang === 'en';

  body.setAttribute('data-lang', currentLang);
  body.style.direction = isEn ? 'ltr' : 'rtl';
  document.documentElement.lang = currentLang;

  // Update all elements with data-lang attributes
  document.querySelectorAll('[data-lang-ar]').forEach(el => {
    const ar = el.getAttribute('data-lang-ar');
    const en = el.getAttribute('data-lang-en');
    if (el.hasAttribute('placeholder')) {
      el.placeholder = isEn ? (en || ar) : ar;
    } else {
      el.textContent = isEn ? (en || ar) : ar;
    }
  });

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    const ar = link.getAttribute('data-ar');
    const en = link.getAttribute('data-en');
    if (ar && en) link.textContent = isEn ? en : ar;
  });

  // Page title
  document.title = isEn
    ? 'Mahmoud Elshora | With Our Voice We Decide - With Our Hands We Change'
    : 'محمود الشوري | بصوتنا نقرر - بأيدينا نغير';
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.glass-card, .feature-card, .activity-card, .project-card, .timeline-item, .vm-card, .role-card, .section-header'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

// ===== COUNTERS =====
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'));
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el, target) {
  const duration = 1500;
  const start = Date.now();

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  update();
}

// ===== NAV ACTIVE STATE =====
function initNavActiveState() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => observer.observe(section));
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== CONTACT FORM =====
function sendContact() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMsg').value.trim();

  if (!name || !email || !msg) {
    showToast(currentLang === 'ar' ? '⚠️ يرجى ملء جميع الحقول' : '⚠️ Please fill all fields');
    return;
  }

  // Build mailto link
  const subject = currentLang === 'ar'
    ? `رسالة من ${name} عبر موقع وعينا`
    : `Message from ${name} via Wa3yna Website`;

  const body = currentLang === 'ar'
    ? `الاسم: ${name}\nالبريد: ${email}\n\nالرسالة:\n${msg}`
    : `Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`;

  window.location.href = `mailto:1mahmoudelshora1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  showToast(currentLang === 'ar' ? '✅ جاري فتح تطبيق البريد...' : '✅ Opening email app...');

  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value = '';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== GLITCH EFFECT ON HERO NAME =====
(function() {
  const name = document.querySelector('.hero-name-ar');
  if (!name) return;
  let glitching = false;

  setInterval(() => {
    if (glitching) return;
    glitching = true;
    const original = name.textContent;
    const chars = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
    let count = 0;

    const interval = setInterval(() => {
      if (count > 6) {
        name.textContent = original;
        clearInterval(interval);
        glitching = false;
        return;
      }
      const pos = Math.floor(Math.random() * original.length);
      const arr = original.split('');
      arr[pos] = chars[Math.floor(Math.random() * chars.length)];
      name.textContent = arr.join('');
      count++;
    }, 60);
  }, 5000);
})();
