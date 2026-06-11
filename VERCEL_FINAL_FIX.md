# الحل النهائي لمشكلة CSS/JS على Vercel

## سبب الخطأ الحالي
الروابط مثل `/css/styles.css` و `/js/script.js` ترجع من Vercel `404 text/plain`، لذلك المتصفح يقول MIME type text/plain. هذا معناه أن الملفات غير موجودة في نسخة النشر الحالية أو أن Vercel لا يقرأ جذر المشروع الصحيح.

اختبار مؤكد:
- `/` يعمل ويرجع HTML.
- `/pages/blog.html` يعمل.
- `/api/health` لا يعمل.
- `/css/styles.css` و `/js/script.js` لا يعملان.

إذن المشكلة ليست في كود الصفحة؛ المشكلة في إعداد النشر/المسارات.

## ما تم إصلاحه في هذه النسخة
1. `vercel.json` أصبح يمرر كل الطلبات إلى `api/index.js`.
2. `api/index.js` أصبح يخدم ملفات `public/css` و `public/js` بنفسه بالـ MIME الصحيح:
   - CSS: `text/css; charset=utf-8`
   - JS: `application/javascript; charset=utf-8`
3. تمت إضافة `includeFiles: public/**` حتى تدخل ملفات CSS/JS داخل دالة Vercel.
4. تمت إضافة نسخة احتياطية من مجلدي `css` و `js` في جذر المشروع أيضًا.

## ارفع إزاي؟
ارفع مجلد المشروع كله كما هو من الجذر الذي يحتوي على:

```txt
api/index.js
public/index.html
public/css/styles.css
public/js/script.js
package.json
vercel.json
```

لا تجعل Root Directory هو `public`.

## إعدادات Vercel المطلوبة
من Project Settings:
- Framework Preset: Other
- Root Directory: جذر المشروع الذي يحتوي على `package.json` و `vercel.json`
- Build Command: اتركه فارغ
- Output Directory: اتركه فارغ
- Install Command: `npm install`

## بعد النشر اختبر هذه الروابط
```txt
https://mahmoudelshora.vercel.app/api/health
https://mahmoudelshora.vercel.app/css/styles.css
https://mahmoudelshora.vercel.app/css/mobile-responsive.css
https://mahmoudelshora.vercel.app/js/script.js
https://mahmoudelshora.vercel.app/js/admin-overlay.js
```

النتيجة الصحيحة:
- CSS يرجع `200` و `text/css`.
- JS يرجع `200` و `application/javascript`.
- API health يرجع JSON.

## مهم جدًا
بعد رفع الملفات على GitHub افتح الريبو وتأكد يدويًا أن هذه الملفات ظاهرة:
- `public/css/styles.css`
- `public/css/mobile-responsive.css`
- `public/js/script.js`
- `public/js/admin-overlay.js`
- `api/index.js`
- `vercel.json`
