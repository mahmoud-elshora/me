'use strict';
/**
 * SEED.JS — يرفع البيانات الأولية لـ MongoDB Atlas
 * شغّله مرة واحدة بعد ما تربط قاعدة البيانات:
 *   MONGODB_URI="your_uri" node backend/seed.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME     = 'wa3yna';

if (!MONGODB_URI) {
  console.error('❌ ضع MONGODB_URI في متغيرات البيئة أولاً');
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('✅ متصل بـ MongoDB Atlas');

    /* ── مسح القديم وإدراج الجديد ── */

    // blog
    await db.collection('blog').deleteMany({});
    await db.collection('blog').insertMany([
      {
        id:        'b1',
        title:     'بصوتنا نقرر — كيف أثّرت في مجتمعي وأنا في السادسة عشرة؟',
        excerpt:   'قصة إطلاق مبادرة وعينا وكيف بدأ التغيير من قرار واحد.',
        content:   '<p>كثيراً ما يُقال إن التغيير يحتاج إلى موارد ضخمة ومناصب رفيعة. لكنني أثبتُ لنفسي أن التغيير الحقيقي يبدأ من قرار صادق أن تُحدث فارقاً.</p><h2>كيف بدأت؟</h2><p>عندما كنت أميناً لاتحاد طلاب إدارة سيدي سالم، لاحظتُ أن الطلاب يمتلكون طاقة هائلة بلا هدف.</p><p><strong>بصوتنا نقرر. بأيدينا نغير.</strong></p>',
        published: true,
        date:      '2026-04-10',
      },
      {
        id:        'b2',
        title:     'كيف صنعت مولداً كهربائياً في غرفتي؟',
        excerpt:   'رحلة اختراعي العلمي الأول — بين الفشل والمحاولة والنجاح.',
        content:   '<p>كان الأمر بسيطاً: كنت أدرس الفيزياء وانبهرت بمبدأ الحثّ الكهرومغناطيسي.</p><h2>التحديات</h2><p>فشلت في المحاولات الأولى، لكن كل فشل علّمني شيئاً جديداً.</p><h2>النجاح</h2><p>في المحاولة الخامسة، أضاء مصباح LED صغير بالكهرباء التي ولّدتها بنفسي!</p>',
        published: true,
        date:      '2026-04-05',
      },
      {
        id:        'b3',
        title:     'يوم فزت بالمركز الأول جمهورياً',
        excerpt:   'ذكريات يوم لا يُنسى في مسابقة دوري المكاتب التنفيذية.',
        content:   '<p>كانت المنافسة شديدة من طلاب مميزين من كل محافظات مصر. لكن الاستعداد الجيد والثقة بالنفس كانا سلاحي الأقوى.</p>',
        published: true,
        date:      '2026-03-28',
      },
    ]);
    console.log('✅ blog: 3 مقالات');

    // community
    await db.collection('community').deleteMany({});
    await db.collection('community').insertMany([
      {
        id:        'c1',
        title:     'تجربتي مع التطوع في المدرسة',
        author:    'أحمد محمد',
        excerpt:   'كيف غيّر التطوع نظرتي للحياة والمجتمع.',
        content:   '<p>بدأت رحلتي مع التطوع بمشاركة بسيطة في فعالية مدرسية، لكنها غيّرت حياتي كلياً.</p>',
        type:      'guest',
        published: true,
        date:      '2026-04-19',
      },
    ]);
    console.log('✅ community: 1 مقال');

    // testimonials
    await db.collection('testimonials').deleteMany({});
    await db.collection('testimonials').insertMany([
      { id: 't1', name: 'الأستاذة أميرة', role: 'مشرفة اتحاد الطلاب', message: 'محمود طالب استثنائي بكل معنى الكلمة. يتميز بإحساسه المرهف بالمسؤولية.', approved: true },
      { id: 't2', name: 'عمر',            role: 'زميل في الاتحاد',     message: 'شرف لي أن أكون زميلاً لمحمود. إنسان يعمل بجدية واجتهاد.', approved: true },
    ]);
    console.log('✅ testimonials: 2 شهادة');

    // contacts (فارغة)
    await db.collection('contacts').deleteMany({});
    console.log('✅ contacts: مسحت');

    console.log('\n🎉 Seed اكتمل! قاعدة البيانات جاهزة.');
  } catch (err) {
    console.error('❌ خطأ في الـ seed:', err.message);
  } finally {
    await client.close();
  }
}

seed();
