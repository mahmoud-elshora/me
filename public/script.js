/* ============================================
   MAHMOUD ELSHORA PORTFOLIO - SCRIPT.JS
   v17 — إصلاح عداد الزوار + توافقية الجوال
   ============================================ */

   'use strict';

   /* ── STATE ── */
   var currentLang  = 'ar';
   var currentTheme = 'dark';
   var mouseX = 0, mouseY = 0;
   var cursorDotX = 0, cursorDotY = 0;
   var cursorOutlineX = 0, cursorOutlineY = 0;
   
   /* ── DOM READY ── */
   document.addEventListener('DOMContentLoaded', function () {
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
     initVisitors();      /* عداد الزوار — مرة واحدة فقط */
     initVisitorToggle(); /* أزرار إظهار/إخفاء العداد */
   });
   
   /* ════════════════════════════════
      LOADER
   ════════════════════════════════ */
   function initLoader() {
     var loader = document.getElementById('loader');
     if (!loader) return;
     setTimeout(function () { loader.classList.add('hidden'); }, 1800);
   }
   
   /* ════════════════════════════════
      PARTICLES
   ════════════════════════════════ */
   function initParticles() {
     var canvas = document.getElementById('particles-canvas');
     if (!canvas) return;
     var ctx = canvas.getContext('2d');
   
     function resize() {
       canvas.width  = window.innerWidth;
       canvas.height = window.innerHeight;
     }
     resize();
     window.addEventListener('resize', resize, { passive: true });
   
     var COUNT  = window.innerWidth < 600 ? 40 : 80; /* أقل جسيمات على الجوال */
     var COLORS = ['rgba(0,229,255,', 'rgba(0,230,118,', 'rgba(213,0,249,', 'rgba(41,121,255,'];
   
     function Particle() { this.reset(); }
     Particle.prototype.reset = function () {
       this.x      = Math.random() * canvas.width;
       this.y      = Math.random() * canvas.height;
       this.size   = Math.random() * 1.5 + 0.3;
       this.speedX = (Math.random() - 0.5) * 0.4;
       this.speedY = (Math.random() - 0.5) * 0.4;
       this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
       this.alpha  = Math.random() * 0.5 + 0.1;
       this.life   = 0;
       this.maxLife= Math.random() * 300 + 200;
     };
     Particle.prototype.update = function () {
       this.x += this.speedX;
       this.y += this.speedY;
       this.life++;
       if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life > this.maxLife) {
         this.reset();
       }
     };
     Particle.prototype.draw = function () {
       ctx.beginPath();
       ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
       ctx.fillStyle = this.color + this.alpha + ')';
       ctx.fill();
     };
   
     var particles = [];
     for (var i = 0; i < COUNT; i++) particles.push(new Particle());
   
     function drawConnections() {
       /* تعطيل الاتصالات على الجوال لتحسين الأداء */
       if (window.innerWidth < 600) return;
       for (var a = 0; a < particles.length; a++) {
         for (var b = a + 1; b < particles.length; b++) {
           var dx = particles[a].x - particles[b].x;
           var dy = particles[a].y - particles[b].y;
           var dist = Math.sqrt(dx * dx + dy * dy);
           if (dist < 120) {
             ctx.beginPath();
             ctx.moveTo(particles[a].x, particles[a].y);
             ctx.lineTo(particles[b].x, particles[b].y);
             ctx.strokeStyle = 'rgba(0,229,255,' + ((1 - dist / 120) * 0.06) + ')';
             ctx.lineWidth = 0.5;
             ctx.stroke();
           }
         }
       }
     }
   
     function animate() {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       particles.forEach(function (p) { p.update(); p.draw(); });
       drawConnections();
       requestAnimationFrame(animate);
     }
     animate();
   }
   
   /* ════════════════════════════════
      CUSTOM CURSOR (desktop فقط)
   ════════════════════════════════ */
   function initCursor() {
     var dot     = document.querySelector('.cursor-dot');
     var outline = document.querySelector('.cursor-outline');
     if (!dot || !outline) return;
   
     /* إخفاء على اللمس */
     if (window.matchMedia('(pointer: coarse)').matches) {
       dot.style.display = 'none';
       outline.style.display = 'none';
       return;
     }
   
     document.addEventListener('mousemove', function (e) {
       mouseX = e.clientX;
       mouseY = e.clientY;
     }, { passive: true });
   
     function animateCursor() {
       cursorDotX     += (mouseX - cursorDotX) * 0.8;
       cursorDotY     += (mouseY - cursorDotY) * 0.8;
       cursorOutlineX += (mouseX - cursorOutlineX) * 0.15;
       cursorOutlineY += (mouseY - cursorOutlineY) * 0.15;
   
       dot.style.left     = (cursorDotX - 4) + 'px';
       dot.style.top      = (cursorDotY - 4) + 'px';
       outline.style.left = (cursorOutlineX - 18) + 'px';
       outline.style.top  = (cursorOutlineY - 18) + 'px';
       requestAnimationFrame(animateCursor);
     }
     animateCursor();
   
     document.querySelectorAll('a, button, .glass-card').forEach(function (el) {
       el.addEventListener('mouseenter', function () {
         dot.style.transform    = 'scale(2)';
         outline.style.width    = '56px';
         outline.style.height   = '56px';
         outline.style.borderColor = 'rgba(0,230,118,0.5)';
       });
       el.addEventListener('mouseleave', function () {
         dot.style.transform    = 'scale(1)';
         outline.style.width    = '36px';
         outline.style.height   = '36px';
         outline.style.borderColor = 'rgba(0,229,255,0.4)';
       });
     });
   }
   
   /* ════════════════════════════════
      HEADER SCROLL
   ════════════════════════════════ */
   function initHeader() {
     var header = document.getElementById('header');
     if (!header) return;
     window.addEventListener('scroll', function () {
       header.classList.toggle('scrolled', window.scrollY > 50);
     }, { passive: true });
   }
   
   /* ════════════════════════════════
      HAMBURGER
   ════════════════════════════════ */
   function initHamburger() {
     var hamburger = document.getElementById('hamburger');
     var navLinks  = document.getElementById('navLinks');
     if (!hamburger || !navLinks) return;
   
     hamburger.addEventListener('click', function () {
       hamburger.classList.toggle('open');
       navLinks.classList.toggle('open');
       /* منع scroll الخلفية عند فتح القائمة */
       document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
     });
   
     navLinks.querySelectorAll('.nav-link').forEach(function (link) {
       link.addEventListener('click', function () {
         hamburger.classList.remove('open');
         navLinks.classList.remove('open');
         document.body.style.overflow = '';
       });
     });
   }
   
   /* ════════════════════════════════
      THEME TOGGLE
   ════════════════════════════════ */
   function initThemeToggle() {
     var toggle = document.getElementById('themeToggle');
     var icon   = document.getElementById('themeIcon');
     if (!toggle) return;
   
     var saved = localStorage.getItem('theme') || 'dark';
     currentTheme = saved;
     document.documentElement.setAttribute('data-theme', currentTheme);
     updateThemeIcon();
   
     toggle.addEventListener('click', function () {
       currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
       document.documentElement.setAttribute('data-theme', currentTheme);
       localStorage.setItem('theme', currentTheme);
       updateThemeIcon();
     });
   
     function updateThemeIcon() {
       if (!icon) return;
       icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
     }
   }
   
   /* ════════════════════════════════
      LANGUAGE TOGGLE
   ════════════════════════════════ */
   function initLangToggle() {
     var toggle   = document.getElementById('langToggle');
     var langText = document.getElementById('langText');
     if (!toggle) return;
   
     toggle.addEventListener('click', function () {
       currentLang = currentLang === 'ar' ? 'en' : 'ar';
       if (langText) langText.textContent = currentLang === 'ar' ? 'EN' : 'ع';
       applyLanguage();
     });
   }
   
   function applyLanguage() {
     var isEn = currentLang === 'en';
     document.body.setAttribute('data-lang', currentLang);
     document.body.style.direction = isEn ? 'ltr' : 'rtl';
     document.documentElement.lang = currentLang;
   
     document.querySelectorAll('[data-lang-ar]').forEach(function (el) {
       var ar = el.getAttribute('data-lang-ar');
       var en = el.getAttribute('data-lang-en') || ar;
       if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
         el.placeholder = isEn ? en : ar;
       } else {
         el.textContent = isEn ? en : ar;
       }
     });
   
     document.querySelectorAll('.nav-link').forEach(function (link) {
       var ar = link.getAttribute('data-ar');
       var en = link.getAttribute('data-en');
       if (ar && en) link.textContent = isEn ? en : ar;
     });
   
     document.title = isEn
       ? 'Mahmoud Elshora | With Our Voice We Decide'
       : 'محمود الشوري | بصوتنا نقرر - بأيدينا نغير';
   }
   
   /* ════════════════════════════════
      SCROLL REVEAL
   ════════════════════════════════ */
   function initScrollReveal() {
     var revealEls = document.querySelectorAll(
       '.glass-card, .feature-card, .activity-card, .project-card, .timeline-item, .vm-card, .role-card, .section-header'
     );
     revealEls.forEach(function (el) { el.classList.add('reveal'); });
   
     var observer = new IntersectionObserver(function (entries) {
       entries.forEach(function (entry) {
         if (!entry.isIntersecting) return;
         var delay = parseInt(entry.target.getAttribute('data-delay') || 0);
         setTimeout(function () { entry.target.classList.add('visible'); }, delay);
       });
     }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
   
     revealEls.forEach(function (el) { observer.observe(el); });
   }
   
   /* ════════════════════════════════
      COUNTERS
   ════════════════════════════════ */
   function initCounters() {
     var counters = document.querySelectorAll('[data-count]');
     var observer = new IntersectionObserver(function (entries) {
       entries.forEach(function (entry) {
         if (!entry.isIntersecting) return;
         var target = parseInt(entry.target.getAttribute('data-count'));
         animateCounter(entry.target, target);
         observer.unobserve(entry.target);
       });
     }, { threshold: 0.5 });
     counters.forEach(function (el) { observer.observe(el); });
   }
   
   function animateCounter(el, target) {
     var duration = 1500;
     var start    = Date.now();
     function update() {
       var elapsed  = Date.now() - start;
       var progress = Math.min(elapsed / duration, 1);
       var eased    = 1 - Math.pow(1 - progress, 3);
       el.textContent = Math.round(eased * target);
       if (progress < 1) requestAnimationFrame(update);
       else el.textContent = target;
     }
     update();
   }
   
   /* ════════════════════════════════
      NAV ACTIVE STATE
   ════════════════════════════════ */
   function initNavActiveState() {
     if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') return;
   
     var sections = document.querySelectorAll('section[id]');
     var navLinks = document.querySelectorAll('.nav-link');
   
     var observer = new IntersectionObserver(function (entries) {
       entries.forEach(function (entry) {
         if (!entry.isIntersecting) return;
         var id = entry.target.id;
         navLinks.forEach(function (link) {
           link.classList.remove('active');
           if (link.getAttribute('href') === '#' + id) link.classList.add('active');
         });
       });
     }, { threshold: 0.4 });
   
     sections.forEach(function (section) { observer.observe(section); });
   }
   
   /* ════════════════════════════════
      SMOOTH SCROLL
   ════════════════════════════════ */
   function initSmoothScroll() {
     document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
       anchor.addEventListener('click', function (e) {
         var target = document.querySelector(this.getAttribute('href'));
         if (!target) return;
         e.preventDefault();
         target.scrollIntoView({ behavior: 'smooth', block: 'start' });
       });
     });
   }
   
   /* ════════════════════════════════
      VISITORS — مرة واحدة فقط عند تحميل الصفحة
      لا polling — البيانات ثابتة حتى يُعيد المستخدم تحميل الصفحة
   ════════════════════════════════ */
   function initVisitors() {
     var todayEl = document.getElementById('today');
     var totalEl = document.getElementById('total');
      var heroTodayEl = document.getElementById('heroToday');
      var heroTotalEl = document.getElementById('heroTotal');
      // إن لم توجد أي كتلة عرض للزوار، اخرج
      if (!todayEl && !totalEl && !heroTodayEl && !heroTotalEl) return;
   
     /* طلب واحد فقط */
     fetch('/api/visitors')
       .then(function (r) { return r.json(); })
       .then(function (data) {
          var today = data.today || 0;
          var total = data.total || 0;
          if (todayEl)     animateNumber(todayEl, today);
          if (totalEl)     animateNumber(totalEl, total);
          if (heroTodayEl) animateNumber(heroTodayEl, today);
          if (heroTotalEl) animateNumber(heroTotalEl, total);
       })
       .catch(function () {
          if (todayEl)     todayEl.textContent = '—';
          if (totalEl)     totalEl.textContent = '—';
          if (heroTodayEl) heroTodayEl.textContent = '—';
          if (heroTotalEl) heroTotalEl.textContent = '—';
       });
   }
   
   function animateNumber(element, newValue) {
     var start    = 0;
     var duration = 800;
     var startTime = Date.now();
   
     function step() {
       var elapsed  = Date.now() - startTime;
       var progress = Math.min(elapsed / duration, 1);
       var eased    = 1 - Math.pow(1 - progress, 3);
       element.textContent = Math.round(eased * newValue);
       if (progress < 1) requestAnimationFrame(step);
       else element.textContent = newValue;
     }
     step();
   }
   
   /* ════════════════════════════════
      VISITOR CARD TOGGLE
      تعريف واحد فقط — لا تكرار
   ════════════════════════════════ */
   function initVisitorToggle() {
     var visitorCard   = document.getElementById('visitorCard');
     var visitorToggle = document.getElementById('visitorToggle');
     var visitorClose  = document.getElementById('visitorClose');
   
     if (!visitorCard || !visitorToggle || !visitorClose) return;
   
     visitorClose.addEventListener('click', function () {
       visitorCard.classList.add('hidden');
       visitorToggle.classList.add('active');
     });
   
     visitorToggle.addEventListener('click', function () {
       visitorCard.classList.remove('hidden');
       visitorToggle.classList.remove('active');
     });
   }
   
   /* ════════════════════════════════
      CONTACT FORM
   ════════════════════════════════ */
   function sendContact() {
     var name  = document.getElementById('contactName')  ? document.getElementById('contactName').value.trim()  : '';
     var email = document.getElementById('contactEmail') ? document.getElementById('contactEmail').value.trim() : '';
     var msg   = document.getElementById('contactMsg')   ? document.getElementById('contactMsg').value.trim()   : '';
   
     if (!name || !email || !msg) {
       showToast('⚠️ يرجى ملء جميع الحقول');
       return;
     }
   
     var subject = currentLang === 'ar'
       ? 'رسالة من ' + name + ' عبر موقع وعينا'
       : 'Message from ' + name + ' via Wa3yna Website';
   
     var body = currentLang === 'ar'
       ? 'الاسم: ' + name + '\nالبريد: ' + email + '\n\nالرسالة:\n' + msg
       : 'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + msg;
   
     window.location.href = 'mailto:1mahmoudelshora1@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
     showToast('✅ جاري فتح تطبيق البريد...');
   
     if (document.getElementById('contactName'))  document.getElementById('contactName').value  = '';
     if (document.getElementById('contactEmail')) document.getElementById('contactEmail').value = '';
     if (document.getElementById('contactMsg'))   document.getElementById('contactMsg').value   = '';
   }
   
   /* ════════════════════════════════
      TOAST
   ════════════════════════════════ */
   function showToast(message) {
     var toast = document.getElementById('toast');
     if (!toast) return;
     toast.textContent = message;
     toast.classList.add('show');
     setTimeout(function () { toast.classList.remove('show'); }, 3000);
   }
   
   /* ════════════════════════════════
      GLITCH EFFECT
   ════════════════════════════════ */
   (function () {
     var name = document.querySelector('.hero-name-ar');
     if (!name) return;
     var glitching = false;
     var chars = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
   
     setInterval(function () {
       if (glitching) return;
       glitching = true;
       var original = name.textContent;
       var count    = 0;
   
       var interval = setInterval(function () {
         if (count > 6) {
           name.textContent = original;
           clearInterval(interval);
           glitching = false;
           return;
         }
         var pos = Math.floor(Math.random() * original.length);
         var arr = original.split('');
         arr[pos] = chars[Math.floor(Math.random() * chars.length)];
         name.textContent = arr.join('');
         count++;
       }, 60);
     }, 5000);
   })();
   
   /* ════════════════════════════════
      PAGE LOAD — إظهار عداد الزوار
   ════════════════════════════════ */
   window.addEventListener('load', function () {
     setTimeout(function () {
       document.body.classList.add('loaded');
     }, 1900);
   });