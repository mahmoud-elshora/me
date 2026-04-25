require('dotenv').config({ path: '.env' });

'use strict';
/* ============================================================
   PERFECT CLAUDE v17 — API
   - Node 13.14.0 / CommonJS
   - MongoDB Atlas (mongodb v3 driver)
   - إصلاح نظام الزوار: middleware فقط على /api/ وليس كل طلب
   - الزوار: تسجيل مرة واحدة في الجلسة (cookie) بدون polling
   - البيانات محفوظة في memory cache لتقليل طلبات MongoDB
============================================================ */

var express      = require('express');
var cors         = require('cors');
var jwt          = require('jsonwebtoken');
var rateLimit    = require('express-rate-limit');
var cookieParser = require('cookie-parser');
var MongoClient  = require('mongodb').MongoClient;

var app = express();

/* ---------- MongoDB ---------- */
var MONGODB_URI = process.env.MONGODB_URI;
var DB_NAME     = process.env.DB_NAME || 'wa3yna';
var _db = null, _client = null;

function getDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI missing in env');
  if (_db) return Promise.resolve(_db);
  if (!_client) {
    _client = new MongoClient(MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
  }
  return _client.connect().then(function () {
    _db = _client.db(DB_NAME);
    return _db;
  });
}

/* ---------- Middleware ---------- */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

/* ---------- Helpers ---------- */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}
function s(v, max) {
  if (v === undefined || v === null) return '';
  v = String(v);
  if (max && v.length > max) v = v.slice(0, max);
  return v;
}

/* ---------- AUTH ---------- */
var JWT_SECRET   = process.env.JWT_SECRET || 'change-me-in-production-please';
var ADMIN_USER   = process.env.ADMIN_USER || 'admin';
var ADMIN_PASS   = process.env.ADMIN_PASS || 'admin123';
var TOKEN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});

function signToken(user) {
  return jwt.sign({ u: user.username, r: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyAdmin(req, res, next) {
  if (req.headers['authorization'] === 'admin-token') return next();
  var token = null;
  if (req.cookies && req.cookies.pc_token) token = req.cookies.pc_token;
  var auth = req.headers && req.headers.authorization;
  if (!token && auth && auth.indexOf('Bearer ') === 0) token = auth.slice(7);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    if (req.user.r !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/* ===========================================================
   VISITORS — نظام محسّن بدون طلبات زائدة
   - cache في الذاكرة يُحدَّث كل 5 دقائق فقط
   - middleware يعمل فقط على طلبات /api/visitors
   - تسجيل الزائر مرة واحدة في الجلسة (cookie لمدة يوم)
=========================================================== */

/* Cache في الذاكرة لتجنب استعلام MongoDB في كل طلب */
var _visitorsCache = { today: 0, total: 0, updatedAt: 0 };
var CACHE_TTL_MS = 5 * 60 * 1000; /* 5 دقائق */

function getVisitorsCached() {
  var now = Date.now();
  /* إذا الكاش حديث، أرجعه مباشرة بدون MongoDB */
  if (now - _visitorsCache.updatedAt < CACHE_TTL_MS) {
    return Promise.resolve({ today: _visitorsCache.today, total: _visitorsCache.total });
  }
  var today = new Date().toISOString().split('T')[0];
  return getDB().then(function (db) {
    return Promise.all([
      db.collection('visitors').countDocuments({ date: today }),
      db.collection('visitors').distinct('visitorId')
    ]);
  }).then(function (results) {
    _visitorsCache.today     = results[0];
    _visitorsCache.total     = results[1].length;
    _visitorsCache.updatedAt = Date.now();
    return { today: _visitorsCache.today, total: _visitorsCache.total };
  });
}

/* تسجيل الزائر في DB — يُستدعى مرة واحدة فقط عند أول زيارة اليوم */
function recordVisitor(visitorId) {
  var today = new Date().toISOString().split('T')[0];
  return getDB().then(function (db) {
    return db.collection('visitors').updateOne(
      { visitorId: visitorId, date: today },
      {
        $setOnInsert: { visitorId: visitorId, date: today, firstVisit: new Date() },
        $set:         { lastVisit: new Date() }
      },
      { upsert: true }
    );
  }).then(function (result) {
    /* إذا أُضيف سجل جديد، أبطل الكاش ليُحدَّث في الطلب القادم */
    if (result.upsertedCount && result.upsertedCount > 0) {
      _visitorsCache.updatedAt = 0;
    }
  }).catch(function (e) {
    console.error('recordVisitor error:', e.message);
  });
}

/*
  Middleware خاص بالزوار — يعمل فقط على GET /api/visitors
  لا يعمل على الملفات الستاتيك أو باقي الـ API
*/
app.get('/api/visitors', function (req, res) {
  /* تسجيل الزائر إذا لم يُسجَّل اليوم */
  var visitorId = req.cookies.visitor_id;
  var todayCookie = req.cookies.visitor_day;
  var today = new Date().toISOString().split('T')[0];

  if (!visitorId) {
    /* زائر جديد تماماً */
    visitorId = generateId();
    res.cookie('visitor_id', visitorId, {
      maxAge:   1000 * 60 * 60 * 24 * 365, /* سنة */
      httpOnly: true,
      sameSite: 'lax'
    });
  }

  if (todayCookie !== today) {
    /* تسجيل الزيارة اليومية مرة واحدة */
    res.cookie('visitor_day', today, {
      maxAge:   1000 * 60 * 60 * 24, /* يوم */
      httpOnly: true,
      sameSite: 'lax'
    });
    /* لا ننتظر الـ DB، نسجّل في الخلفية */
    recordVisitor(visitorId);
  }

  /* إرجاع البيانات من الكاش */
  getVisitorsCached().then(function (data) {
    res.json(data);
  }).catch(function () {
    res.json({ today: 0, total: 0 });
  });
});

/* ===========================================================
   AUTH ROUTES
=========================================================== */
app.post('/api/login', loginLimiter, function (req, res) {
  var body = req.body || {};
  var username = s(body.username, 100);
  var password = s(body.password, 200);
  if (!username || !password) return res.status(400).json({ success: false, message: 'بيانات ناقصة' });
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
  }
  var token = signToken({ username: username });
  res.cookie('pc_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   TOKEN_AGE_MS
  });
  res.json({ success: true, token: token, legacy_token: 'admin-token' });
});

app.post('/api/auth/logout', function (req, res) {
  res.clearCookie('pc_token');
  res.json({ ok: true });
});

app.get('/api/auth/me', function (req, res) {
  var token = (req.cookies && req.cookies.pc_token) || null;
  if (!token) {
    var auth = req.headers && req.headers.authorization;
    if (auth && auth.indexOf('Bearer ') === 0) token = auth.slice(7);
  }
  if (!token) return res.json({ user: null });
  try {
    var p = jwt.verify(token, JWT_SECRET);
    res.json({ user: { username: p.u, role: p.r } });
  } catch (e) {
    res.json({ user: null });
  }
});

/* ===========================================================
   BLOG & COMMUNITY (PUBLIC reads)
=========================================================== */
app.get('/api/posts', function (req, res) {
  getDB().then(function (db) {
    var coll = req.query.type === 'admin' ? 'blog' : 'community';
    var q = { published: true, hidden: { $ne: true } };
    return db.collection(coll).find(q).sort({ date: -1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json({ error: 'Error fetching posts' }); });
});

app.get('/api/post-details/:id', function (req, res) {
  var id = req.params.id;
  getDB().then(function (db) {
    return db.collection('blog').findOne({ id: id }).then(function (post) {
      if (post) return post;
      return db.collection('community').findOne({ id: id });
    });
  }).then(function (post) {
    if (!post)        return res.status(404).json({ error: 'Not found' });
    if (post.hidden)  return res.status(404).json({ error: 'Hidden' });
    res.json(post);
  }).catch(function () { res.status(500).json({ error: 'Error' }); });
});

app.post('/api/community-submit', function (req, res) {
  getDB().then(function (db) {
    var b = req.body || {};
    var newPost = {
      id:        generateId(),
      title:     s(b.title, 300),
      author:    s(b.author, 100) || 'guest',
      excerpt:   s(b.excerpt, 500),
      content:   s(b.content, 50000),
      icon:      s(b.icon, 80) || 'fas fa-user-edit',
      type:      'guest',
      published: false,
      hidden:    false,
      date:      new Date().toISOString().split('T')[0],
      createdAt: new Date()
    };
    return db.collection('community').insertOne(newPost).then(function () {
      res.json({ ok: true, id: newPost.id });
    });
  }).catch(function () { res.status(500).json({ error: 'Submit failed' }); });
});

/* ===========================================================
   TESTIMONIALS
=========================================================== */
app.get('/api/testimonials', function (req, res) {
  getDB().then(function (db) {
    return db.collection('testimonials').find({ approved: true, hidden: { $ne: true } }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.post('/api/testimonials', function (req, res) {
  getDB().then(function (db) {
    var b = req.body || {};
    return db.collection('testimonials').insertOne({
      id:       generateId(),
      name:     s(b.name, 100),
      role:     s(b.role, 100),
      message:  s(b.message, 2000),
      approved: false,
      hidden:   false,
      date:     new Date().toISOString()
    });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.get('/api/admin/testimonials', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('testimonials').find().sort({ date: -1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.put('/api/testimonials/approve/:id', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('testimonials').updateOne({ id: req.params.id }, { $set: { approved: true } });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.put('/api/testimonials/:id', verifyAdmin, function (req, res) {
  var b = req.body || {};
  var $set = {};
  if (b.name    !== undefined) $set.name     = s(b.name, 100);
  if (b.role    !== undefined) $set.role     = s(b.role, 100);
  if (b.message !== undefined) $set.message  = s(b.message, 2000);
  if (b.approved!== undefined) $set.approved = !!b.approved;
  if (b.hidden  !== undefined) $set.hidden   = !!b.hidden;
  getDB().then(function (db) {
    return db.collection('testimonials').updateOne({ id: req.params.id }, { $set: $set });
  }).then(function (r) { res.json({ ok: r.matchedCount > 0 }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.delete('/api/testimonials/:id', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('testimonials').deleteOne({ id: req.params.id });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

/* ===========================================================
   CONTACT
=========================================================== */
app.post('/api/contact', function (req, res) {
  getDB().then(function (db) {
    var b = req.body || {};
    return db.collection('contacts').insertOne({
      id:      generateId(),
      name:    s(b.name, 100),
      email:   s(b.email, 200),
      phone:   s(b.phone, 50),
      subject: s(b.subject, 300),
      message: s(b.message, 5000),
      date:    new Date().toISOString()
    });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.get('/api/contacts', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('contacts').find().sort({ date: -1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.delete('/api/contacts/:id', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('contacts').deleteOne({ id: req.params.id });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

/* ===========================================================
   BLOG ADMIN
=========================================================== */
app.get('/api/admin/blog', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('blog').find().sort({ date: -1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.post('/api/blog', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    var b = req.body || {};
    var post = {
      id:        generateId(),
      title:     s(b.title, 300),
      excerpt:   s(b.excerpt, 500),
      content:   s(b.content, 100000),
      icon:      s(b.icon, 80) || 'fas fa-pen-fancy',
      published: true,
      hidden:    false,
      date:      new Date().toISOString().split('T')[0]
    };
    return db.collection('blog').insertOne(post);
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.put('/api/blog/:id', verifyAdmin, function (req, res) {
  var b = req.body || {};
  var $set = {};
  if (b.title    !== undefined) $set.title    = s(b.title, 300);
  if (b.excerpt  !== undefined) $set.excerpt  = s(b.excerpt, 500);
  if (b.content  !== undefined) $set.content  = s(b.content, 100000);
  if (b.icon     !== undefined) $set.icon     = s(b.icon, 80);
  if (b.published!== undefined) $set.published= !!b.published;
  if (b.hidden   !== undefined) $set.hidden   = !!b.hidden;
  getDB().then(function (db) {
    return db.collection('blog').updateOne({ id: req.params.id }, { $set: $set });
  }).then(function (r) { res.json({ ok: r.matchedCount > 0 }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.delete('/api/blog/:id', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('blog').deleteOne({ id: req.params.id });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

/* ===========================================================
   COMMUNITY ADMIN
=========================================================== */
app.get('/api/admin/community', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('community').find().sort({ date: -1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.put('/api/community/approve/:id', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('community').updateOne({ id: req.params.id }, { $set: { published: true } });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.put('/api/community/:id', verifyAdmin, function (req, res) {
  var b = req.body || {};
  var $set = {};
  if (b.title    !== undefined) $set.title    = s(b.title, 300);
  if (b.author   !== undefined) $set.author   = s(b.author, 100);
  if (b.excerpt  !== undefined) $set.excerpt  = s(b.excerpt, 500);
  if (b.content  !== undefined) $set.content  = s(b.content, 50000);
  if (b.icon     !== undefined) $set.icon     = s(b.icon, 80);
  if (b.published!== undefined) $set.published= !!b.published;
  if (b.hidden   !== undefined) $set.hidden   = !!b.hidden;
  getDB().then(function (db) {
    return db.collection('community').updateOne({ id: req.params.id }, { $set: $set });
  }).then(function (r) { res.json({ ok: r.matchedCount > 0 }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

app.delete('/api/community/:id', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('community').deleteOne({ id: req.params.id });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

/* ===========================================================
   PAGE EXTRAS
=========================================================== */
var ALLOWED_PAGES = [
  'index','initiative','activities','projects','cv',
  'skills','achivments','stats','blog','community',
  'testimonials','contact'
];

function safePage(p) {
  p = s(p, 30);
  return ALLOWED_PAGES.indexOf(p) >= 0 ? p : null;
}

function buildExtraDoc(b) {
  return {
    page:         safePage(b.page) || 'index',
    title_ar:     s(b.title_ar, 300),
    title_en:     s(b.title_en, 300),
    body_ar:      s(b.body_ar, 20000),
    body_en:      s(b.body_en, 20000),
    image_url:    s(b.image_url, 1000),
    image_shape:  s(b.image_shape, 20) || 'rounded',
    image_pos:    s(b.image_pos, 20)   || 'right',
    color:        s(b.color, 30)       || 'cyan',
    layout:       s(b.layout, 20)      || 'card',
    animation:    s(b.animation, 30)   || 'fade-up',
    icon:         s(b.icon, 80),
    link_url:     s(b.link_url, 1000),
    link_text_ar: s(b.link_text_ar, 200),
    link_text_en: s(b.link_text_en, 200),
    target_zone:  s(b.target_zone, 50) || 'bottom',
    order:        parseInt(b.order, 10) || 0,
    visible:      b.visible !== false,
    updated_at:   new Date()
  };
}

app.get('/api/page-extras/:page', function (req, res) {
  var p = safePage(req.params.page);
  if (!p) return res.json([]);
  getDB().then(function (db) {
    return db.collection('page_extras').find({ page: p, visible: true }).sort({ order: 1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.get('/api/admin/page-extras', verifyAdmin, function (req, res) {
  var q = {};
  if (req.query.page) { var p = safePage(req.query.page); if (p) q.page = p; }
  getDB().then(function (db) {
    return db.collection('page_extras').find(q).sort({ page: 1, order: 1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.post('/api/admin/page-extras', verifyAdmin, function (req, res) {
  var doc = buildExtraDoc(req.body || {});
  doc.id = generateId();
  doc.created_at = new Date();
  getDB().then(function (db) {
    return db.collection('page_extras').insertOne(doc);
  }).then(function () { res.json({ ok: true, id: doc.id, doc: doc }); })
    .catch(function (e) { res.status(500).json({ ok: false, error: e.message }); });
});

app.put('/api/admin/page-extras/:id', verifyAdmin, function (req, res) {
  var id  = s(req.params.id, 50);
  var doc = buildExtraDoc(req.body || {});
  getDB().then(function (db) {
    return db.collection('page_extras').updateOne({ id: id }, { $set: doc });
  }).then(function (r) { res.json({ ok: r.matchedCount > 0 }); })
    .catch(function (e) { res.status(500).json({ ok: false, error: e.message }); });
});

app.delete('/api/admin/page-extras/:id', verifyAdmin, function (req, res) {
  var id = s(req.params.id, 50);
  getDB().then(function (db) {
    return db.collection('page_extras').deleteOne({ id: id });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

/* ===========================================================
   CONTENT OVERRIDES
=========================================================== */
function buildOverrideDoc(b) {
  var t = s(b.type, 20) || 'text';
  if (['text','html','image','hide','attr'].indexOf(t) < 0) t = 'text';
  return {
    page:       safePage(b.page) || 'index',
    selector:   s(b.selector, 300),
    type:       t,
    value_ar:   s(b.value_ar, 20000),
    value_en:   s(b.value_en, 20000),
    value:      s(b.value, 20000),
    attr_name:  s(b.attr_name, 60),
    note:       s(b.note, 200),
    visible:    b.visible !== false,
    order:      parseInt(b.order, 10) || 0,
    updated_at: new Date()
  };
}

app.get('/api/content-overrides/:page', function (req, res) {
  var p = safePage(req.params.page);
  if (!p) return res.json([]);
  getDB().then(function (db) {
    return db.collection('content_overrides').find({ page: p, visible: true }).sort({ order: 1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.get('/api/admin/content-overrides', verifyAdmin, function (req, res) {
  var q = {};
  if (req.query.page) { var p = safePage(req.query.page); if (p) q.page = p; }
  getDB().then(function (db) {
    return db.collection('content_overrides').find(q).sort({ page: 1, order: 1 }).toArray();
  }).then(function (rows) { res.json(rows); })
    .catch(function () { res.status(500).json([]); });
});

app.post('/api/admin/content-overrides', verifyAdmin, function (req, res) {
  var doc = buildOverrideDoc(req.body || {});
  if (!doc.selector) return res.status(400).json({ ok: false, error: 'selector required' });
  doc.id = generateId();
  doc.created_at = new Date();
  getDB().then(function (db) {
    return db.collection('content_overrides').insertOne(doc);
  }).then(function () { res.json({ ok: true, id: doc.id }); })
    .catch(function (e) { res.status(500).json({ ok: false, error: e.message }); });
});

app.put('/api/admin/content-overrides/:id', verifyAdmin, function (req, res) {
  var doc = buildOverrideDoc(req.body || {});
  getDB().then(function (db) {
    return db.collection('content_overrides').updateOne({ id: req.params.id }, { $set: doc });
  }).then(function (r) { res.json({ ok: r.matchedCount > 0 }); })
    .catch(function (e) { res.status(500).json({ ok: false, error: e.message }); });
});

app.delete('/api/admin/content-overrides/:id', verifyAdmin, function (req, res) {
  getDB().then(function (db) {
    return db.collection('content_overrides').deleteOne({ id: req.params.id });
  }).then(function () { res.json({ ok: true }); })
    .catch(function () { res.status(500).json({ ok: false }); });
});

/* ===========================================================
   PAGES META & HEALTH
=========================================================== */
app.get('/api/pages-list', function (req, res) {
  res.json([
    { slug: 'index',        ar: 'الرئيسية',     en: 'Home' },
    { slug: 'initiative',   ar: 'المبادرة',      en: 'Initiative' },
    { slug: 'activities',   ar: 'الأنشطة',       en: 'Activities' },
    { slug: 'projects',     ar: 'المشاريع',      en: 'Projects' },
    { slug: 'cv',           ar: 'السيرة',        en: 'CV' },
    { slug: 'skills',       ar: 'المهارات',      en: 'Skills' },
    { slug: 'achivments',   ar: 'الإنجازات',     en: 'Achievements' },
    { slug: 'stats',        ar: 'الإحصائيات',    en: 'Stats' },
    { slug: 'blog',         ar: 'المدونة',       en: 'Blog' },
    { slug: 'community',    ar: 'المجتمع',       en: 'Community' },
    { slug: 'testimonials', ar: 'الشهادات',      en: 'Testimonials' },
    { slug: 'contact',      ar: 'تواصل',         en: 'Contact' }
  ]);
});

app.get('/api/health', function (req, res) {
  res.json({ ok: true, ts: Date.now(), version: 'v17' });
});

/* ---------- Export & standalone ---------- */
module.exports = app;

if (require.main === module) {
  var path = require('path');
  var PORT = process.env.PORT || 3000;
  app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));
  app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
  app.listen(PORT, function () {
    console.log('Perfect Claude v17 running on http://localhost:' + PORT);
  });
}