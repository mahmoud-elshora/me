/* ============================================
   SHARED COMPONENTS - components.js
   Navbar, Footer, Theme, Lang for sub-pages
   ============================================ */

const NAVBAR_HTML = `
<header class="header" id="header">
  <nav class="navbar">
    <a href="index.html" class="nav-logo">
      <span class="logo-ar">م.ش</span>
      <span class="logo-divider">|</span>
      <span class="logo-en">M.S</span>
    </a>

    <div class="nav-links" id="navLinks">
    <a href="index.html" class="nav-link active" data-ar="الرئيسية" data-en="Home">الرئيسية</a>
    <a href="initiative.html" class="nav-link" data-ar="المبادرة" data-en="Initiative">المبادرة</a>
    <a href="activities.html" class="nav-link" data-ar="الأنشطة" data-en="Activities">الأنشطة</a>
    <a href="projects.html" class="nav-link" data-ar="المشاريع" data-en="Projects">المشاريع</a>
    <a href="cv.html" class="nav-link" data-ar="CV" data-en="CV">CV</a>
    <a href="skills.html" class="nav-link" data-ar="المهارات" data-en="Skills">المهارات</a>
    <a href="achivments.html" class="nav-link" data-ar="الإنجازات" data-en="Achievements">الإنجازات</a>
    <a href="stats.html" class="nav-link" data-ar="الإحصائيات" data-en="Stats">الإحصائيات</a>
    <a href="blog.html" class="nav-link" data-ar="المدونة" data-en="blog">المدونة</a>
    <a href="community.html" class="nav-link" data-ar="المجتمع" data-en="Community">المجتمع</a>
    <a href="testimonials.html" class="nav-link" data-ar="شهادات" data-en="Testimonials">شهادات</a>
    <a href="contact.html" class="nav-link" data-ar="تواصل" data-en="Contact">تواصل</a>
  </div>
    <div class="nav-controls">
      <button class="theme-toggle" id="themeToggle" title="تبديل الوضع">
        <i class="fas fa-sun" id="themeIcon"></i>
      </button>
      <button class="lang-toggle" id="langToggle">
        <span id="langText">EN</span>
      </button>
      <button class="hamburger" id="hamburger">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</header>`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="footer-content">
    <div class="footer-logo">
      <span class="neon-cyan">م.ش</span>
      <span class="footer-sep">|</span>
      <span class="neon-green">وعينا</span>
    </div>
    <p class="footer-tagline">بصوتنا نقرر • بأيدينا نغير</p>
    <div class="footer-links">
      <a href="contact.html"><i class="fas fa-envelope"></i></a>
      <a href="https://wa.link/hpdmcn" target="_blank"><i class="fab fa-whatsapp"></i></a>
      <a href="https://sites.google.com/view/wa3yna/الصفحة-الرئيسية" target="_blank"><i class="fas fa-globe"></i></a>
    </div>
    <p class="footer-copy">© 2025 محمود أحمد الشوري - جميع الحقوق محفوظة</p>
  </div>
  <div class="footer-glow"></div>
</footer>
<div class="toast" id="toast"></div>`;

const PARTICLES_HTML = `<canvas id="particles-canvas"></canvas>
<div class="cursor-dot"></div>
<div class="cursor-outline"></div>`;

// Inject components
document.addEventListener('DOMContentLoaded', () => {
  // Inject canvas + cursor
  document.body.insertAdjacentHTML('afterbegin', PARTICLES_HTML);
  // Inject navbar at top
  document.body.insertAdjacentHTML('afterbegin', NAVBAR_HTML);
  // Inject footer at end
  document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);

  // Mark active nav link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage ||
        link.getAttribute('href')?.endsWith(currentPage)) {
      link.classList.add('active');
    }
  });

  // Initialize shared scripts
  initLoader2();
  initParticles2();
  initCursor2();
  initHeader2();
  initHamburger2();
  initThemeToggle2();
  initLangToggle2();
  initScrollReveal2();
  initSkillBars();
  initCounters2();
});

function initLoader2() {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 1500);
}

function initHeader2() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initHamburger2() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger) return;
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

let currentLang2 = 'ar';
let currentTheme2 = 'dark';

function initThemeToggle2() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const saved = localStorage.getItem('theme') || 'dark';
  currentTheme2 = saved;
  document.documentElement.setAttribute('data-theme', currentTheme2);
  updateIcon();
  toggle.addEventListener('click', () => {
    currentTheme2 = currentTheme2 === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme2);
    localStorage.setItem('theme', currentTheme2);
    updateIcon();
  });
  function updateIcon() {
    icon.className = currentTheme2 === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function initLangToggle2() {
  const toggle = document.getElementById('langToggle');
  const langText = document.getElementById('langText');
  toggle.addEventListener('click', () => {
    currentLang2 = currentLang2 === 'ar' ? 'en' : 'ar';
    langText.textContent = currentLang2 === 'ar' ? 'EN' : 'ع';
    applyLang2();
  });
}

function applyLang2() {
  const isEn = currentLang2 === 'en';
  document.body.setAttribute('data-lang', currentLang2);
  document.body.style.direction = isEn ? 'ltr' : 'rtl';
  document.documentElement.lang = currentLang2;
  document.querySelectorAll('[data-lang-ar]').forEach(el => {
    const ar = el.getAttribute('data-lang-ar');
    const en = el.getAttribute('data-lang-en') || ar;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = isEn ? en : ar;
    else el.textContent = isEn ? en : ar;
  });
  document.querySelectorAll('.nav-link[data-ar]').forEach(link => {
    const ar = link.getAttribute('data-ar');
    const en = link.getAttribute('data-en') || ar;
    link.textContent = isEn ? en : ar;
  });
}

function initScrollReveal2() {
  document.querySelectorAll('.info-card, .blog-card, .testimonial-card, .project-page-card, .text-section, .cv-section, .big-stat-card, .stat-box, .sub-tl-item, .activity-card-full').forEach(el => {
    el.classList.add('reveal');
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = parseInt(e.target.getAttribute('data-delay') || 0);
        setTimeout(() => e.target.classList.add('visible'), d);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const pct = e.target.getAttribute('data-pct');
        e.target.style.width = pct + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => obs.observe(b));
}

function initCounters2() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const target = parseInt(e.target.getAttribute('data-count'));
          const suffix = e.target.getAttribute('data-suffix') || '';
          let start = Date.now();
          const dur = 1500;
          function tick() {
            const prog = Math.min((Date.now()-start)/dur, 1);
            const eased = 1 - Math.pow(1-prog, 3);
            e.target.textContent = Math.round(eased * target) + suffix;
            if (prog < 1) requestAnimationFrame(tick);
          }
          tick();
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });
}

function initParticles2() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  const COLORS = ['rgba(0,229,255,','rgba(0,230,118,','rgba(213,0,249,'];
  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height;
      this.size = Math.random()*1.5+0.3;
      this.sx = (Math.random()-0.5)*0.4; this.sy = (Math.random()-0.5)*0.4;
      this.color = COLORS[Math.floor(Math.random()*COLORS.length)];
      this.alpha = Math.random()*0.4+0.1;
      this.life = 0; this.maxLife = Math.random()*300+200;
    }
    update() {
      this.x+=this.sx; this.y+=this.sy; this.life++;
      if (this.x<0||this.x>canvas.width||this.y<0||this.y>canvas.height||this.life>this.maxLife) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
      ctx.fillStyle=this.color+this.alpha+')'; ctx.fill();
    }
  }
  for(let i=0;i<60;i++) particles.push(new P());
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{p.update();p.draw();});
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize',()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
}

function initCursor2() {
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (!dot||!outline||window.matchMedia('(pointer:coarse)').matches) return;
  let mx=0,my=0,dx=0,dy=0,ox=0,oy=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  function ani() {
    dx+=(mx-dx)*0.8; dy+=(my-dy)*0.8;
    ox+=(mx-ox)*0.15; oy+=(my-oy)*0.15;
    dot.style.left=dx-4+'px'; dot.style.top=dy-4+'px';
    outline.style.left=ox-18+'px'; outline.style.top=oy-18+'px';
    requestAnimationFrame(ani);
  }
  ani();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}
