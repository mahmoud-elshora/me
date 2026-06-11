/* ════════════════════════════════════════════════════════════════════
   📰 Article System – Mahmoud El-Shouri Blog (v2)
   ضع هذا الملف في: js/article.js
   واربطه مرة واحدة في blog-post.html قبل </body> بـ defer

   مزايا:
   • Idempotent: يشتغل سواء المحتوى موجود وقت تحميل الصفحة
     أو متحقن لاحقاً عبر innerHTML (يستخدم MutationObserver).
   • Null-safe: ما يكسرش لو عنصر مش موجود.
   • مفيش تكرار: data-wa3-init يمنع التهيئة مرتين.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function initArticle(root) {
    if (!root || root.dataset.wa3Init === "1") return;
    root.dataset.wa3Init = "1";

    /* 1) فهرس تلقائي من عناوين h2 */
    var toc = root.querySelector("#wa3Toc .wa3-toc-list");
    var headings = root.querySelectorAll("h2");
    var tocBox = root.querySelector("#wa3Toc");

    if (toc && headings.length) {
      toc.innerHTML = ""; // safety: امسح أي عناصر قديمة
      headings.forEach(function (h, i) {
        var id = h.id || "wa3-h-" + (i + 1);
        h.id = id;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + id;
        a.textContent = (h.textContent || "").trim();
        li.appendChild(a);
        toc.appendChild(li);
      });
    } else if (tocBox) {
      tocBox.style.display = "none";
    }

    /* 2) زر طي/فتح الفهرس */
    var tocToggle = root.querySelector(".wa3-toc-toggle");
    if (tocBox && tocToggle) {
      tocToggle.addEventListener("click", function () {
        tocBox.classList.toggle("is-collapsed");
        var open = !tocBox.classList.contains("is-collapsed");
        tocToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    /* 3) أزرار نسخ الكود + Toast */
    root.querySelectorAll(".wa3-code-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pre =
          btn.closest(".wa3-code") &&
          btn.closest(".wa3-code").querySelector("pre");
        var text = pre ? pre.innerText : "";
        if (!text) return;
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          showToast("النسخ غير مدعوم في المتصفح");
          return;
        }
        navigator.clipboard
          .writeText(text)
          .then(function () {
            var old = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
            showToast("تم نسخ الكود ✔");
            setTimeout(function () {
              btn.innerHTML = old;
            }, 1600);
          })
          .catch(function () {
            showToast("تعذّر النسخ");
          });
      });
    });

    /* 4) Smooth scroll لأي رابط داخلي #... */
    root.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", "#" + id);
        }
      });
    });
  }

  /* Toast واحد على مستوى الصفحة */
  var toastEl = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "wa3-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1800);
  }

  function scan() {
    document.querySelectorAll(".wa3-article").forEach(initArticle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  /* لو المحتوى متحقن لاحقاً (admin innerHTML) */
  var target = document.querySelector(".post-body") || document.body;
  if (window.MutationObserver && target) {
    new MutationObserver(scan).observe(target, {
      childList: true,
      subtree: true,
    });
  }
})();
