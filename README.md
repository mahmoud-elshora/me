# Perfect Claude — v23

موقع وعينا (HTML/css/js كلاسيكي) + خادم Node 13.14.0 + MongoDB Atlas.
هذا الإصدار يحتفظ بكل ميزات v23 ويضيف:

## الجديد في v23

1. **تعديل المحتوى الأصلي للصفحات (Content Overrides)**

   - من تبويب "محتوى الصفحات" داخل لوحة التحكم.
   - تعديل أي نص/HTML/صورة موجودة في صفحات الموقع الستاتيك بدون لمس الكود.
   - أنواع التعديل: `text`, `html`, `image`, `hide`, `attr`.
   - يدعم العربي والإنجليزي معاً (يعرض حسب لغة الصفحة).
   - يمكن تعطيل/تفعيل أي تعديل أو حذفه.

2. **تحكم كامل في المدونة، المجتمع، الشهادات**
   - زر **تعديل** يفتح نافذة لتعديل العنوان/المحتوى/الصورة/الكاتب.
   - زر **إخفاء/إظهار** (بدون حذف).
   - زر **نشر/إلغاء نشر** للمدونة.
   - زر **اعتماد** لمنشورات المجتمع والشهادات بانتظار الاعتماد.
   - زر **حذف نهائي**.

## التشغيل

```bash
npm install
cp .env.example .env   # ضع MONGODB_URI و JWT_SECRET و ADMIN_USER/PASS
npm run seed           # مرة واحدة
npm start              # http://localhost:3000
```

## المتطلبات

- Node.js **13.14.0** (Commonjs فقط).
- MongoDB Atlas — متغير `MONGODB_URI` في `.env`.

## مثال على Override

- الصفحة: `index`
- النوع: `text`
- المحدد: `#about h2`
- القيمة (عربي): "من نحن — نسخة جديدة"
- النتيجة: يُستبدل عنوان قسم "من نحن" فوراً لكل الزوار.

## الصفحات المدعومة

index, initiative, activities, projects, cv, skills, achivments, stats, blog, community, testimonials, contact.

<!-- @ the  body of the website -->

perfect-claude-v23/
│
├── 📂 api/                          # المجلد الخاص بالـ Backend والأقسام الخلفية
│   └── index.js                    # ملف الـ API الرئيسي والمتحكم بالطلبات
│
├── 📂 public/                       # الملفات العامة المتاحة للمتصفح (Front-end)
│   │
│   ├── 📄 index.html                # الواجهة الرئيسية للموقع
│   ├── 📄 favicon.ico               # أيقونة الموقع المصغرة
│   ├── 📄 robots.txt                # ملف توجيه عناكب البحث (SEO)
│   ├── 📄 sitemap.xml               # الخريطة الأوتوماتيكية لمحركات البحث
│   ├── 📄 google54e680f4ea799425.html # ملف إثبات الملكية لـ Google Search Console
│   │
│   ├── 📂 pages/                    # جميع الصفحات الفرعية للموقع
│   │   ├── achivments.html
│   │   ├── activities.html
│   │   ├── admin.html
│   │   ├── blog.html
│   │   ├── blog-post.html
│   │   ├── community.html
│   │   ├── community-post.html
│   │   ├── contact.html
│   │   ├── cv.html
│   │   ├── initiative.html
│   │   ├── login.html
│   │   ├── projects.html
│   │   ├── skills.html
│   │   ├── stats.html
│   │   └── testimonials.html
│   │
│   ├── 📂 css/                      # ملفات التنسيق والتصميم الاستجابي (9 Items)
│   │   ├── article-styles.css       # ✨ الجديد: تنسيقات مخصصة للمقالات والنصوص الطويلة
│   │   ├── main.css                 # التنسيق الرئيسي للموقع
│   │   ├── styles.css               # ملف الستستايل الشامل وتنسيقات الألوان
│   │   ├── mobile-responsive.css    # تعديلات الشاشات الصغيرة والموبايل
│   │   ├── page-common.css          # التنسيقات المشتركة بين الصفحات
│   │   ├── pages.css                # تنسيقات خاصة بالصفحات الداخلية
│   │   ├── initiative.css           # تنسيق صفحة المبادرة
│   │   ├── activities.css           # تنسيق قسم الأنشطة
│   │   └── projects.css             # تنسيق معرض المشاريع
│   │
│   ├── 📂 js/                       # ملفات التفاعل والمنطق البرمجي (5 Items)
│   │   ├── article-engine.js        # ✨ الجديد: محرك معالجة ورندرة المقالات ديناميكياً
│   │   ├── script.js                # السكربت الرئيسي للموقع
│   │   ├── components.js            # العناصر المشتركة (مثل الـ Navbar والـ Footer)
│   │   ├── page-scripts.js          # سكربتات خاصة بالصفحات الداخلية
│   │   └── admin-overlay.js         # المنطق البرمجي الخاص بلوحة تحكم الإدارة
│   │
│   ├── 📂 assets/                   # الملفات والموارد المرئية
│   │   ├── 📂 images/               # صور الموقع، الخلفيات، والشعارات
│   │   └── 📂 other/                # ملفات أخرى أو مستندات مرفقة
│   │
│   └── 📂 test/                     # القوالب التجريبية والتطويرية (5 Items)
│       ├── article-template-v2.html # ✨ الجديد: النسخة المطورة من قالب المقالات
│       ├── post-vacation.html       # ✨ الجديد: صفحة تجريبية لمنشور الإجازة/التوقف
│       └── trust-self.html
│
├── 📄 .env                          # ملف متغيرات البيئة السرية
├── 📄 .gitignore                    # الملفات المستثناة من الرفع على Git
├── 📄 package.json                  # ملف الاعتمادات ووصف المشروع وبيانات التشغيل
├── 📄 package-lock.json             # قفل نسخ الحزم البرمجية المستقرة
├── 📄 README.md                     # التوثيق والشرح الرئيسي للمشروع
├── 📄 seed.js                       # ملف تغذية قاعدة البيانات بالبيانات الأولية
├── 📄 server.js                     # ملف تشغيل السيرفر المحلي والربط
├── 📄 .vercelignore                 # الملفات المستثناة من الرفع علي vercel 
└── 📄 vercel.json                   # إعدادات الرفع والاستضافة على منصة Vercel