# حل رفع الموقع على Vercel — نسخة مصححة

## سبب المشكلة

المشكلة لم تكن أن ملفات CSS/JS غير موجودة؛ الملفات موجودة داخل:

- `public/css/styles.css`
- `public/css/mobile-responsive.css`
- `public/js/script.js`
- `public/js/admin-overlay.js`

السبب الأساسي كان في `vercel.json`: كان يستخدم نظام `builds/routes` القديم ويوجه الملفات إلى `/public/css/...` و`/public/js/...`. في Vercel مجلد `public` يتم نشر محتواه مباشرة على جذر الموقع، يعني الملف يصبح:

- `/css/styles.css` وليس `/public/css/styles.css`
- `/js/script.js` وليس `/public/js/script.js`

لذلك صفحات HTML كانت تظهر، لكن ملفات التنسيق والسكريبت كانت ترجع 404.

## ما الذي تم إصلاحه؟

تم استبدال `vercel.json` بنسخة حديثة تعتمد على:

- `public/` كجذر للملفات الثابتة تلقائياً.
- `api/index.js` كـ Serverless Function تلقائياً.
- `rewrites` فقط للروابط النظيفة مثل `/blog`, `/admin`, `/contact`.
- بدون `builds` وبدون توجيه خاطئ إلى `/public/...`.

## طريقة الرفع الصحيحة على Vercel

ارفع فولدر المشروع بالكامل كما هو، وليس محتويات `public` فقط. لازم Vercel يرى الملفات بهذا الشكل في جذر المشروع:

```txt
api/index.js
public/index.html
public/css/styles.css
public/css/mobile-responsive.css
public/js/script.js
public/js/admin-overlay.js
package.json
vercel.json
```

## إعدادات Vercel المقترحة

في Project Settings على Vercel:

- Framework Preset: `Other`
- Build Command: اتركه فاضي أو `None`
- Output Directory: اتركه فاضي
- Install Command: `npm install`
- Root Directory: جذر المشروع الذي يحتوي على `vercel.json` و`package.json`

## متغيرات البيئة المطلوبة

لا ترفع ملف `.env` على GitHub أو Vercel. أضف القيم من Vercel Dashboard → Settings → Environment Variables:

```txt
MONGODB_URI=...
DB_NAME=perfect_claude
JWT_SECRET=...
ADMIN_USER=...
ADMIN_PASS=...
NODE_ENV=production
```

## اختبار بعد الرفع

بعد النشر افتح هذه الروابط، كل واحد لازم يرجع ملف وليس 404:

```txt
https://your-domain.vercel.app/css/styles.css
https://your-domain.vercel.app/css/mobile-responsive.css
https://your-domain.vercel.app/js/script.js
https://your-domain.vercel.app/js/admin-overlay.js
https://your-domain.vercel.app/api/health
https://your-domain.vercel.app/blog
https://your-domain.vercel.app/admin
```

لو `/api/health` اشتغل وملفات `/css` و`/js` اشتغلت، يبقى الرفع سليم.
