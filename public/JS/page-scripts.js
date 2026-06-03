/* ================================================================
   PAGE-SCRIPTS.JS
   One file, each page's logic wrapped in its own init function.
   Each page calls only its own init via data-page attribute.
   ================================================================ */

'use strict';

/* ──────────────────────────────────────────────
   INITIATIVE PAGE
   ────────────────────────────────────────────── */
function initInitiativePage() {
  // Animate rings
  document.querySelectorAll('.init-ring').forEach((r, i) => {
    r.style.animationDuration = (6 + i * 4) + 's';
  });

  // Count up numbers in logo area
  const counts = document.querySelectorAll('.init-count[data-count]');
  counts.forEach(el => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        animCount(el, +el.dataset.count, el.dataset.suffix || '');
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  // Pillar hover glow
  document.querySelectorAll('.pillar-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    });
  });
}

/* ──────────────────────────────────────────────
   ACTIVITIES PAGE
   ────────────────────────────────────────────── */
function initActivitiesPage() {
  const cards = document.querySelectorAll('.act-card');
  const btns  = document.querySelectorAll('.act-filter-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? 'grid' : 'none';
        if (show) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity .4s ease, transform .4s ease';
            card.style.opacity = '1';
            card.style.transform = 'none';
          });
        }
      });
    });
  });

  // Stagger initial animation
  cards.forEach((c, i) => {
    c.style.transitionDelay = (i * 60) + 'ms';
  });
}

/* ──────────────────────────────────────────────
   PROJECTS PAGE
   ────────────────────────────────────────────── */
function initProjectsPage() {
  // Copy link buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy)
        .then(() => showToast('✅ تم نسخ الرابط!'))
        .catch(() => showToast('⚠️ لم يتمكن من النسخ'));
    });
  });

  // External link tracking (for analytics hook)
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    a.addEventListener('click', () => {
      console.log('[Analytics] External click:', a.href);
    });
  });
}

/* ──────────────────────────────────────────────
   CV PAGE
   ────────────────────────────────────────────── */
function initCvPage() {
  // Print CV
  window.printCV = function() {
    window.print();
  };

  // Download trigger (email)
  window.requestCv = function() {
    const sub  = encodeURIComponent('طلب السيرة الذاتية الكاملة');
    const body = encodeURIComponent('مرحباً محمود،\nأرجو إرسال السيرة الذاتية الكاملة.\nشكراً.');
    window.location.href = `contact.html`;
  };

  // Highlight current year in timeline
  const now = new Date().getFullYear().toString();
  document.querySelectorAll('.cv-item-date').forEach(el => {
    if (el.textContent.includes(now)) {
      el.style.color = 'var(--neon-cyan)';
      el.style.fontWeight = '700';
    }
  });
}

/* ──────────────────────────────────────────────
   SKILLS PAGE
   ────────────────────────────────────────────── */
function initSkillsPage() {
  // Stagger star animation
  document.querySelectorAll('.stars-row').forEach(row => {
    const stars = row.querySelectorAll('.star');
    stars.forEach((s, i) => {
      setTimeout(() => s.classList.add('on'), 300 + i * 100);
    });
  });

  // Category filter
  const catBtns = document.querySelectorAll('[data-skill-cat]');
  const sections = document.querySelectorAll('[data-category]');

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.skillCat;
      sections.forEach(s => {
        s.style.display = cat === 'all' || s.dataset.category === cat ? 'block' : 'none';
      });
    });
  });
}

/* ──────────────────────────────────────────────
   NUMBERS PAGE
   ────────────────────────────────────────────── */
function initNumbersPage() {
  // Animate chart bars
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.width = (e.target.dataset.w || '0') + '%';
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.chart-bar-fill[data-w]').forEach(el => io.observe(el));

  // Milestone entrance stagger
  document.querySelectorAll('.milestone-item').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        setTimeout(() => {
          item.style.transition = 'opacity .6s ease, transform .6s ease';
          item.style.opacity = '1';
          item.style.transform = 'none';
        }, i * 120);
        io2.unobserve(item);
      });
    }, { threshold: 0.2 });
    io2.observe(item);
  });
}

/* ──────────────────────────────────────────────
   STATS PAGE
   ────────────────────────────────────────────── */
function initStatsPage() {
  // Donut chart animation
  document.querySelectorAll('.donut-circle[data-pct]').forEach(el => {
    const pct = parseFloat(el.dataset.pct);
    const color = el.dataset.color || '#7c4dff';
    const deg = (pct / 100) * 360;
    el.style.background = `conic-gradient(${color} ${deg}deg, var(--bg-card) 0)`;
  });

  // Tab switching for different chart views
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tabTarget;
      document.querySelectorAll('[data-tab-target]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('[data-tab]').forEach(panel => {
        panel.style.display = panel.dataset.tab === target ? 'block' : 'none';
      });
      btn.classList.add('active');
    });
  });
}

/* ──────────────────────────────────────────────
   BLOG PAGE
   ────────────────────────────────────────────── */
function initBlogPage() {
  // Category filter
  document.querySelectorAll('[data-blog-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-blog-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.blogCat;
      document.querySelectorAll('.blog-card[data-cat]').forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? 'flex' : 'none';
        if (show) animateIn(card);
      });
    });
  });

  // Search
  const searchInput = document.getElementById('blogSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.blog-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }

  // Reading time estimator
  document.querySelectorAll('.blog-card').forEach(card => {
    const words = card.querySelector('p')?.textContent?.split(/\s+/).length || 0;
    const mins  = Math.max(1, Math.ceil(words / 180));
    const rtEl  = card.querySelector('[data-reading-time]');
    if (rtEl) rtEl.textContent = mins + ' دقيقة قراءة';
  });
}

/* ──────────────────────────────────────────────
   BLOG POST PAGE
   ────────────────────────────────────────────── */
function initBlogPostPage() {
  // Reading progress bar
  const bar = document.getElementById('readProgress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const total  = document.body.scrollHeight - innerHeight;
      const pct    = total > 0 ? (scrollY / total) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  // Copy share link
  window.copyPostLink = function() {
    navigator.clipboard.writeText(location.href)
      .then(() => showToast('✅ تم نسخ الرابط!'))
      .catch(() => showToast('⚠️ لم يتمكن من النسخ'));
  };

  // Comment form → backend
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(commentForm));
      const btn  = commentForm.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'جاري الإرسال...';
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          showToast('✅ تم إرسال تعليقك بنجاح!');
          commentForm.reset();
        } else {
          showToast('⚠️ حدث خطأ، حاول لاحقاً');
        }
      } catch {
        showToast('⚠️ لا يوجد اتصال بالخادم');
      } finally {
        btn.disabled = false; btn.textContent = 'إرسال التعليق';
      }
    });
  }
}

/* ──────────────────────────────────────────────
   TESTIMONIALS PAGE
   ────────────────────────────────────────────── */
function initTestimonialsPage() {
  const form = document.getElementById('testimonialForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name:    document.getElementById('tName')?.value.trim(),
      role:    document.getElementById('tRole')?.value.trim(),
      message: document.getElementById('tMsg')?.value.trim(),
    };
    if (!data.name || !data.message) { showToast('⚠️ يرجى ملء الاسم والشهادة'); return; }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('✅ شكراً! تم استلام شهادتك.');
        form.reset();
        appendTestimonial(data);
      } else {
        // Fallback: open mailto
        fallbackMailto(data);
      }
    } catch {
      fallbackMailto(data);
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الشهادة';
    }
  });

  function fallbackMailto(data) {
    const sub  = encodeURIComponent(`شهادة من ${data.name}`);
    const body = encodeURIComponent(`الاسم: ${data.name}\nالصفة: ${data.role}\n\nالشهادة:\n${data.message}`);
    window.location.href = `contact.html`;
    showToast('✅ جاري فتح البريد...');
  }

  function appendTestimonial(data) {
    const grid = document.querySelector('.test-grid');
    if (!grid) return;
    const card = document.createElement('div');
    card.className = 'test-card reveal';
    card.innerHTML = `
      <div class="test-stars">★★★★★</div>
      <p class="test-text">"${escapeHtml(data.message)}"</p>
      <div class="test-author">
        <div class="test-avatar" style="background:linear-gradient(135deg,var(--neon-cyan),var(--neon-green));color:#030a14;">${data.name.charAt(0)}</div>
        <div><span class="test-name">${escapeHtml(data.name)}</span><span class="test-role">${escapeHtml(data.role || '')}</span></div>
      </div>`;
    grid.prepend(card);
    setTimeout(() => card.classList.add('in'), 100);
  }
}

/* ──────────────────────────────────────────────
   CONTACT PAGE
   ────────────────────────────────────────────── */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name:    document.getElementById('cName')?.value.trim(),
      email:   document.getElementById('cEmail')?.value.trim(),
      phone:   document.getElementById('cPhone')?.value.trim(),
      subject: document.getElementById('cSubject')?.value,
      message: document.getElementById('cMsg')?.value.trim(),
    };
    if (!data.name || !data.email || !data.message) { showToast('⚠️ يرجى ملء الحقول المطلوبة'); return; }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('✅ تم إرسال رسالتك بنجاح! سنرد قريباً.');
        form.reset();
      } else {
        fallbackContactMailto(data);
      }
    } catch {
      fallbackContactMailto(data);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الرسالة';
    }
  });

  function fallbackContactMailto(data) {
    const sub  = encodeURIComponent(data.subject || 'رسالة عامة');
    const body = encodeURIComponent(`الاسم: ${data.name}\nالبريد: ${data.email}\nالهاتف: ${data.phone||'لم يُذكر'}\n\nالرسالة:\n${data.message}`);
    window.location.href = `contact.html`;
    showToast('✅ جاري فتح البريد الإلكتروني...');
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function animCount(el, target, suffix = '') {
  const dur = 1500; const start = Date.now();
  (function tick() {
    const p = Math.min((Date.now() - start) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })();
}

function animateIn(el) {
  el.style.opacity = '0'; el.style.transform = 'translateY(16px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    el.style.opacity = '1'; el.style.transform = 'none';
  });
}

function escapeHtml(str = '') {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ──────────────────────────────────────────────
   AUTO-DISPATCH based on data-page attribute
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  const MAP = {
    'initiative':   initInitiativePage,
    'activities':   initActivitiesPage,
    'projects':     initProjectsPage,
    'cv':           initCvPage,
    'skills':       initSkillsPage,
    'numbers':      initNumbersPage,
    'stats':        initStatsPage,
    'blog':         initBlogPage,
    'blog-post':    initBlogPostPage,
    'testimonials': initTestimonialsPage,
    'contact':      initContactPage,
  };
  MAP[page]?.();
});
