/* ============================================================
   PERFECT CLAUDE v17 — ADMIN OVERLAY
   1) Page Extras (بطاقات/بانرات ديناميكية فوق المحتوى الستاتيك)
   2) Content Overrides (تعديل النصوص/الصور/إخفاء عناصر فعلية)
============================================================ */
(function () {
  'use strict';

  function currentPage() {
    var path = location.pathname.replace(/\/$/, '');
    var file = path.split('/').pop() || 'index';
    file = file.replace(/\.html$/, '');
    if (!file) file = 'index';
    return file;
  }

  function currentLang() {
    return (document.documentElement.lang || 'ar').toLowerCase().indexOf('en') === 0 ? 'en' : 'ar';
  }

  var COLOR_VAR = {
    cyan:'#00f0ff', green:'#00ff88', violet:'#a855f7', orange:'#ff8c00',
    blue:'#3b82f6', pink:'#ec4899', red:'#ef4444', yellow:'#facc15'
  };
  var SHAPE_CSS = {
    rounded: 'border-radius:18px;',
    circle:  'border-radius:50%;aspect-ratio:1/1;object-fit:cover;',
    square:  'border-radius:6px;',
    hex:     'clip-path:polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0% 50%);'
  };

  function injectStyles() {
    if (document.getElementById('pc-extras-styles')) return;
    var css = '' +
      '@keyframes pcFadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}' +
      '@keyframes pcFadeIn{from{opacity:0}to{opacity:1}}' +
      '@keyframes pcZoomIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}' +
      '@keyframes pcSlideR{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}' +
      '@keyframes pcSlideL{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}' +
      '@keyframes pcBounce{0%{opacity:0;transform:scale(.6)}60%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}' +
      '.pc-extras-section{padding:60px 5% 40px;position:relative}' +
      '.pc-extras-grid{display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}' +
      '.pc-extra{position:relative;background:rgba(15,23,42,.55);backdrop-filter:blur(14px);border:1px solid var(--pc-c,#00f0ff);border-radius:20px;padding:28px;color:#fff;overflow:hidden;opacity:0;transform:translateY(0);box-shadow:0 6px 30px rgba(0,0,0,.25)}' +
      '[data-theme="light"] .pc-extra{background:rgba(255,255,255,.85);color:#0f172a;box-shadow:0 6px 30px rgba(0,0,0,.08)}' +
      '.pc-extra.is-in{opacity:1;animation-duration:.7s;animation-timing-function:cubic-bezier(.2,.8,.2,1);animation-fill-mode:both}' +
      '.pc-extra.anim-fade-up.is-in{animation-name:pcFadeUp}' +
      '.pc-extra.anim-fade-in.is-in{animation-name:pcFadeIn}' +
      '.pc-extra.anim-zoom-in.is-in{animation-name:pcZoomIn}' +
      '.pc-extra.anim-slide-right.is-in{animation-name:pcSlideR}' +
      '.pc-extra.anim-slide-left.is-in{animation-name:pcSlideL}' +
      '.pc-extra.anim-bounce.is-in{animation-name:pcBounce}' +
      '.pc-extra.anim-none{opacity:1}' +
      '.pc-extra::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,var(--pc-c,#00f0ff) 0%,transparent 60%);opacity:.08;pointer-events:none}' +
      '.pc-extra h3{font-family:Orbitron,sans-serif;font-size:1.45rem;margin:0 0 14px;color:var(--pc-c,#00f0ff);text-shadow:0 0 18px var(--pc-c,#00f0ff)}' +
      '.pc-extra .pc-body{line-height:1.85;font-size:1rem;opacity:.92}' +
      '.pc-extra .pc-icon{font-size:2.2rem;color:var(--pc-c,#00f0ff);margin-bottom:14px;display:inline-block;filter:drop-shadow(0 0 14px var(--pc-c,#00f0ff))}' +
      '.pc-extra .pc-cta{display:inline-block;margin-top:18px;padding:10px 22px;border-radius:10px;background:var(--pc-c,#00f0ff);color:#000;font-weight:700;text-decoration:none;transition:.3s;box-shadow:0 0 22px var(--pc-c,#00f0ff)}' +
      '.pc-extra .pc-cta:hover{transform:translateY(-3px);filter:brightness(1.15)}' +
      '.pc-extra img.pc-img{width:100%;max-width:260px;display:block}' +
      '.pc-extra.layout-split{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center}' +
      '.pc-extra.layout-split.pos-left{direction:rtl}' +
      '.pc-extra.layout-split.pos-top, .pc-extra.layout-split.pos-bottom{grid-template-columns:1fr}' +
      '.pc-extra.layout-split.pos-bottom .pc-img-wrap{order:2}' +
      '.pc-extra.layout-banner{padding:48px 36px;text-align:center}' +
      '.pc-extra.layout-banner h3{font-size:1.9rem}' +
      '@media(max-width:720px){.pc-extra.layout-split{grid-template-columns:1fr}}';
    var st = document.createElement('style');
    st.id = 'pc-extras-styles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------------- Page Extras ---------------- */
  function buildExtra(e) {
    var lang = currentLang();
    var title = lang === 'en' ? (e.title_en || e.title_ar) : (e.title_ar || e.title_en);
    var body  = lang === 'en' ? (e.body_en  || e.body_ar)  : (e.body_ar  || e.body_en);
    var ltxt  = lang === 'en' ? (e.link_text_en || e.link_text_ar) : (e.link_text_ar || e.link_text_en);

    var color = COLOR_VAR[e.color] || COLOR_VAR.cyan;
    var card = document.createElement('div');
    card.className = 'pc-extra layout-' + (e.layout || 'card') + ' anim-' + (e.animation || 'fade-up') + ' pos-' + (e.image_pos || 'right');
    card.style.setProperty('--pc-c', color);

    var imgHTML = '';
    if (e.image_url) {
      imgHTML = '<div class="pc-img-wrap"><img class="pc-img" src="' + e.image_url + '" alt="" style="' + (SHAPE_CSS[e.image_shape] || SHAPE_CSS.rounded) + '"></div>';
    }
    var iconHTML = e.icon ? '<i class="pc-icon ' + e.icon + '"></i>' : '';
    var titleHTML = title ? '<h3>' + title + '</h3>' : '';
    var bodyHTML = body ? '<div class="pc-body">' + body + '</div>' : '';
    var ctaHTML = (e.link_url && ltxt) ? '<a class="pc-cta" href="' + e.link_url + '">' + ltxt + '</a>' : '';

    var textBlock = '<div class="pc-text">' + iconHTML + titleHTML + bodyHTML + ctaHTML + '</div>';

    if (e.layout === 'split') {
      card.innerHTML = (e.image_pos === 'left' || e.image_pos === 'top')
        ? imgHTML + textBlock
        : textBlock + imgHTML;
    } else if (e.layout === 'banner') {
      card.innerHTML = iconHTML + titleHTML + bodyHTML + (e.image_url ? '<div style="margin-top:20px">' + imgHTML + '</div>' : '') + ctaHTML;
    } else {
      card.innerHTML = imgHTML + textBlock;
    }

    setTimeout(function () { card.classList.add('is-in'); }, 60);
    return card;
  }

  function zoneAnchor(zone) {
    var hero = document.querySelector('.hero, #hero, header.hero, [data-zone="hero"]');
    var footer = document.querySelector('.footer, footer, [data-zone="footer"]');
    var main = document.querySelector('main') || document.body;
    if (zone === 'top') return { parent: main, before: main.firstChild };
    if (zone === 'after-hero' && hero && hero.parentNode) return { parent: hero.parentNode, before: hero.nextSibling };
    if (zone === 'before-footer' && footer && footer.parentNode) return { parent: footer.parentNode, before: footer };
    return { parent: main, before: footer && footer.parentNode === main ? footer : null };
  }

  function renderExtras(rows) {
    if (!rows || !rows.length) return;
    var byZone = {};
    rows.forEach(function (e) {
      var z = e.target_zone || 'bottom';
      (byZone[z] = byZone[z] || []).push(e);
    });
    Object.keys(byZone).forEach(function (zone) {
      var sec = document.createElement('section');
      sec.className = 'pc-extras-section';
      sec.setAttribute('data-pc-zone', zone);
      var grid = document.createElement('div');
      grid.className = 'pc-extras-grid';
      byZone[zone].forEach(function (e) { grid.appendChild(buildExtra(e)); });
      sec.appendChild(grid);
      var a = zoneAnchor(zone);
      if (a.before) a.parent.insertBefore(sec, a.before);
      else a.parent.appendChild(sec);
    });
  }

  /* ---------------- Content Overrides ---------------- */
  function applyOverrides(rows) {
    if (!rows || !rows.length) return;
    var lang = currentLang();
    rows.forEach(function (o) {
      var nodes;
      try { nodes = document.querySelectorAll(o.selector); }
      catch (e) { console.warn('[overrides] selector invalid:', o.selector); return; }
      if (!nodes || !nodes.length) return;
      nodes.forEach(function (n) {
        try {
          if (o.type === 'hide') {
            n.style.display = 'none';
          } else if (o.type === 'image') {
            if (n.tagName === 'IMG') n.src = o.value || o.value_ar || o.value_en;
            else n.style.backgroundImage = 'url("' + (o.value || o.value_ar || o.value_en) + '")';
          } else if (o.type === 'attr') {
            if (o.attr_name) n.setAttribute(o.attr_name, o.value || '');
          } else if (o.type === 'html') {
            var v = lang === 'en' ? (o.value_en || o.value_ar) : (o.value_ar || o.value_en);
            n.innerHTML = v || '';
          } else { /* text */
            var t = lang === 'en' ? (o.value_en || o.value_ar) : (o.value_ar || o.value_en);
            n.textContent = t || '';
          }
        } catch (e) { /* تجاهل */ }
      });
    });
  }

  /* ---------------- Loader ---------------- */
  function load() {
    injectStyles();
    var page = currentPage();
    if (page === 'admin' || page === 'login') return;

    /* Extras */
    fetch('/api/page-extras/' + encodeURIComponent(page), { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(renderExtras).catch(function () {});

    /* Overrides — يطبق عدة مرات لتفادي العناصر التي تركبها سكربتات الموقع لاحقاً */
    var attempts = 0;
    function fetchOverrides() {
      fetch('/api/content-overrides/' + encodeURIComponent(page), { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (rows) {
          window.__pcOverrides = rows;
          applyOverrides(rows);
        }).catch(function () {});
    }
    fetchOverrides();
    /* إعادة تطبيق على عناصر تظهر متأخرة (بعد تحميل المحتوى الديناميكي) */
    var iv = setInterval(function () {
      attempts++;
      if (window.__pcOverrides) applyOverrides(window.__pcOverrides);
      if (attempts >= 6) clearInterval(iv);
    }, 800);

    /* أعِد التطبيق عند تغيير اللغة (إذا الموقع يبدّل dir/lang) */
    var lastLang = currentLang();
    setInterval(function () {
      var l = currentLang();
      if (l !== lastLang) {
        lastLang = l;
        if (window.__pcOverrides) applyOverrides(window.__pcOverrides);
      }
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }

  /* شريط الأدمن العائم */
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.cookie.match(/pc_token=/) && !localStorage.getItem('admin-token')) return;
    var p = currentPage();
    if (p === 'admin' || p === 'login') return;
    var bar = document.createElement('a');
    bar.href = '/admin.html';
    bar.textContent = '⚙ لوحة الأدمن';
    bar.style.cssText = 'position:fixed;bottom:18px;inset-inline-start:18px;z-index:99999;padding:10px 18px;background:#00f0ff;color:#000;border-radius:30px;font-weight:700;text-decoration:none;box-shadow:0 6px 24px rgba(0,240,255,.5);font-family:Cairo,sans-serif;font-size:13px';
    document.body.appendChild(bar);
  });
})();
