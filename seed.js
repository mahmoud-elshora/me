'use strict';
/* SEED — Perfect Claude v16
   يرفع البيانات الأولية لـ MongoDB Atlas مع إنشاء فهارس page_extras.
   Usage:  MONGODB_URI="..." node seed.js
*/
try { require('dotenv').config(); } catch (e) {}

var MongoClient = require('mongodb').MongoClient;

var MONGODB_URI = process.env.MONGODB_URI;
var DB_NAME     = process.env.DB_NAME || 'wa3yna';

if (!MONGODB_URI) {
  console.error('ERROR: ضع MONGODB_URI في متغيرات البيئة أولاً');
  process.exit(1);
}

var client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(function () {
  var db = client.db(DB_NAME);
  console.log('[seed] متصل بـ MongoDB Atlas: ' + DB_NAME);

  /* ===== blog ===== */
  return db.collection('blog').deleteMany({}).then(function () {
    return db.collection('blog').insertMany([
      {
        id: 'b1',
        title: 'بصوتنا نقرر — كيف أثّرت في مجتمعي وأنا في السادسة عشرة؟',
        excerpt: 'قصة إطلاق مبادرة وعينا وكيف بدأ التغيير من قرار واحد.',
        content: '<p>كثيراً ما يُقال إن التغيير يحتاج إلى موارد ضخمة ومناصب رفيعة. لكنني أثبتُ لنفسي أن التغيير الحقيقي يبدأ من قرار صادق أن تُحدث فارقاً.</p><h2>كيف بدأت؟</h2><p>عندما كنت أميناً لاتحاد طلاب إدارة سيدي سالم، لاحظتُ أن الطلاب يمتلكون طاقة هائلة بلا هدف.</p><p><strong>بصوتنا نقرر. بأيدينا نغير.</strong></p>',
        icon: 'fas fa-bullhorn',
        published: true, date: '2026-04-10'
      },
      {
        id: 'b2',
        title: 'كيف صنعت مولداً كهربائياً في غرفتي؟',
        excerpt: 'رحلة اختراعي العلمي الأول — بين الفشل والمحاولة والنجاح.',
        content: '<p>كان الأمر بسيطاً: كنت أدرس الفيزياء وانبهرت بمبدأ الحثّ الكهرومغناطيسي.</p><h2>التحديات</h2><p>فشلت في المحاولات الأولى، لكن كل فشل علّمني شيئاً جديداً.</p><h2>النجاح</h2><p>في المحاولة الخامسة، أضاء مصباح LED صغير بالكهرباء التي ولّدتها بنفسي!</p>',
        icon: 'fas fa-bolt',
        published: true, date: '2026-04-05'
      },
      {
        id: 'b3',
        title: 'يوم فزت بالمركز الأول جمهورياً',
        excerpt: 'ذكريات يوم لا يُنسى في مسابقة دوري المكاتب التنفيذية.',
        content: '<p>كانت المنافسة شديدة من طلاب مميزين من كل محافظات مصر. لكن الاستعداد الجيد والثقة بالنفس كانا سلاحي الأقوى.</p>',
        icon: 'fas fa-trophy',
        published: true, date: '2026-03-28'
      }
    ]);
  }).then(function () {
    console.log('[seed] blog: 3 مقالات');

    /* ===== community ===== */
    return db.collection('community').deleteMany({}).then(function () {
      return db.collection('community').insertMany([
        {
          id: 'c1',
          title: 'تجربتي مع التطوع في المدرسة',
          author: 'أحمد محمد',
          excerpt: 'كيف غيّر التطوع نظرتي للحياة والمجتمع.',
          content: '<p>بدأت رحلتي مع التطوع بمشاركة بسيطة في فعالية مدرسية، لكنها غيّرت حياتي كلياً.</p>',
          icon: 'fas fa-hands-helping',
          type: 'guest', published: true, date: '2026-04-19'
        }
      ]);
    });
  }).then(function () {
    console.log('[seed] community: 1 مقال');

    /* ===== testimonials ===== */
    return db.collection('testimonials').deleteMany({}).then(function () {
      return db.collection('testimonials').insertMany([
        { id: 't1', name: 'الأستاذة أميرة', role: 'مشرفة اتحاد الطلاب', message: 'محمود طالب استثنائي بكل معنى الكلمة. يتميز بإحساسه المرهف بالمسؤولية.', approved: true, date: new Date().toISOString() },
        { id: 't2', name: 'عمر',           role: 'زميل في الاتحاد',     message: 'شرف لي أن أكون زميلاً لمحمود. إنسان يعمل بجدية واجتهاد.',         approved: true, date: new Date().toISOString() }
      ]);
    });
  }).then(function () {
    console.log('[seed] testimonials: 2 شهادة');

    /* ===== contacts (ضمان وجود) ===== */
    return db.collection('contacts').createIndex({ date: -1 }).catch(function () {});
  }).then(function () {
    /* ===== page_extras (مجموعة جديدة في v16) ===== */
    return db.collection('page_extras').createIndex({ page: 1, order: 1 }).catch(function () {});
  }).then(function () {
    console.log('[seed] page_extras: جاهزة (فارغة — أضف من لوحة الأدمن)');
    console.log('\nSeed اكتمل بنجاح ✓');
    return client.close();
  }).then(function () { process.exit(0); });
}).catch(function (err) {
  console.error('[seed] خطأ:', err.message);
  client.close().catch(function(){});
  process.exit(1);
});
