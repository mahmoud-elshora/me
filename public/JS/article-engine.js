/**
 * ════════════════════════════════════════════════════════════════════
 * 📰  article-engine.js  –  wa3-article  (v2)
 * ════════════════════════════════════════════════════════════════════
 * ضعه في  /js/article-engine.js
 * ثم أضف في نهاية <body> داخل blog-post.html (بعد سكريبت loadFullPost):
 *     <script src="../js/article-engine.js" defer></script>
 *
 * الوظائف:
 *  1. يبني فهرس المحتويات تلقائياً من عناوين h2
 *  2. زر طي/فتح الفهرس
 *  3. أزرار نسخ مقاطع الكود
 *  4. ينتظر حقن المحتوى الديناميكي قبل التنفيذ
 * ════════════════════════════════════════════════════════════════════
 */
(function () {
  "use strict";

  /**
   * تهيئة كل مكونات wa3-article داخل العنصر المُمرَّر
   * @param {HTMLElement} root
   */
  function initArticle(root) {
    if (!root || root.dataset.wa3Init === "1") return;
    root.dataset.wa3Init = "1";

    /* ── 1) بناء فهرس المحتويات من h2 ── */
    var tocList = root.querySelector("#wa3Toc .wa3-toc-list");
    var tocBox = root.querySelector("#wa3Toc");
    var headings = Array.from(root.querySelectorAll("h2"));

    if (tocList && headings.length) {
      // مسح أي عناصر سابقة (حماية من التشغيل المزدوج)
      tocList.innerHTML = "";
      headings.forEach(function (h, i) {
        var id = "wa3-h-" + (i + 1);
        h.id = id;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + id;
        a.textContent = h.textContent.trim();
        li.appendChild(a);
        tocList.appendChild(li);
      });
    } else if (tocBox) {
      tocBox.style.display = "none";
    }

    /* ── 2) زر طي/فتح الفهرس ── */
    var tocToggle = root.querySelector(".wa3-toc-toggle");
    if (tocBox && tocToggle) {
      tocToggle.addEventListener("click", function () {
        var collapsed = tocBox.classList.toggle("is-collapsed");
        tocToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        tocToggle.innerHTML = collapsed
          ? '<i class="fas fa-chevron-down"></i>'
          : '<i class="fas fa-chevron-up"></i>';
      });
    }

    /* ── 3) أزرار نسخ الكود ── */
    root.querySelectorAll(".wa3-code-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pre =
          btn.closest(".wa3-code") &&
          btn.closest(".wa3-code").querySelector("pre");
        var text = pre ? pre.innerText || pre.textContent : "";
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(text)
            .then(function () {
              flashBtn(btn);
            })
            .catch(function () {
              fallbackCopy(text, btn);
            });
        } else {
          fallbackCopy(text, btn);
        }
      });
    });
  }

  function flashBtn(btn) {
    var original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
    setTimeout(function () {
      btn.innerHTML = original;
    }, 1600);
  }

  function fallbackCopy(text, btn) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flashBtn(btn);
    } catch (e) {
      /* تجاهل */
    }
  }

  /**
   * ينتظر ظهور .wa3-article في الـ DOM ثم يهيئها.
   * يُعيد المحاولة كل 200ms لمدة أقصاها 5 ثوانٍ
   * (لأن المحتوى يُحقن ديناميكياً من API).
   */
  function waitAndInit() {
    var tries = 0;
    var max = 25; // 25 × 200ms = 5 ثوانٍ

    var interval = setInterval(function () {
      tries++;
      var root = document.querySelector(".wa3-article");
      if (root) {
        clearInterval(interval);
        initArticle(root);
        return;
      }
      if (tries >= max) {
        clearInterval(interval);
      }
    }, 200);
  }

  // ابدأ بعد تحميل DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitAndInit);
  } else {
    waitAndInit();
  }
})();
