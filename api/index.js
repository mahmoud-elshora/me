'use strict';

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();

/* ── ENV ── */
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'wa3yna';
const JWT_SECRET = process.env.JWT_SECRET;

let db, client;

/* ── DB ── */
async function getDB() {
  if (db) return db;

  if (!client) {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
  }

  db = client.db(DB_NAME);
  return db;
}

/* ── Middleware ── */
app.use(cors({ origin: '*' }));
app.use(express.json());

/* ── Utils ── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/* ─────────────────────────────────────────
   AUTH (JWT)
───────────────────────────────────────── */

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

/* LOGIN */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign(
      { role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ token });
  }

  res.status(401).json({ success: false });
});

/* VERIFY ADMIN */
function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(403).json({ message: 'No token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();

  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
}

/* ─────────────────────────────────────────
   POSTS (BLOG + COMMUNITY FIX)
───────────────────────────────────────── */

app.get('/api/posts', async (req, res) => {
  try {
    const db = await getDB();

    const coll = req.query.type === 'admin' ? 'blog' : 'community';

    let filter = {};

    // 👇 أهم سطر لحل مشكلتك
    if (req.query.type !== 'admin') {
      filter.published = true;
    }

    const posts = await db.collection(coll)
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    res.json(posts);

  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

/* ─────────────────────────────────────────
   BLOG (ADMIN)
───────────────────────────────────────── */

app.post('/api/blog', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    const post = {
      id: generateId(),
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      icon: req.body.icon || "fas fa-pen",
      published: true,
      date: new Date().toISOString()
    };

    await db.collection('blog').insertOne(post);

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

app.put('/api/blog/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('blog').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

app.delete('/api/blog/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('blog').deleteOne({ id: req.params.id });

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

/* ─────────────────────────────────────────
   COMMUNITY
───────────────────────────────────────── */

app.post('/api/community-submit', async (req, res) => {
  try {
    const db = await getDB();

    const newPost = {
      id: generateId(),
      title: req.body.title || '',
      author: req.body.author || 'guest',
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      icon: req.body.icon || "fas fa-user",
      published: false,
      date: new Date().toISOString()
    };

    await db.collection('community').insertOne(newPost);

    res.json({ ok: true });

  } catch {
    res.status(500).json({ error: 'Submit failed' });
  }
});

app.put('/api/community/approve/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('community').updateOne(
      { id: req.params.id },
      { $set: { published: true } }
    );

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

app.delete('/api/community/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('community').deleteOne({ id: req.params.id });

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */

app.get('/api/testimonials', async (req, res) => {
  try {
    const db = await getDB();
    const data = await db.collection('testimonials').find().toArray();
    res.json(data);
  } catch {
    res.status(500).json([]);
  }
});

app.put('/api/testimonials/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('testimonials').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

app.delete('/api/testimonials/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('testimonials').deleteOne({ id: req.params.id });

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

/* ─────────────────────────────────────────
   CONTACTS
───────────────────────────────────────── */

app.post('/api/contact', async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('contacts').insertOne({
      id: generateId(),
      ...req.body,
      date: new Date().toISOString()
    });

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

app.get('/api/contacts', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    const data = await db.collection('contacts').find().toArray();

    res.json(data);

  } catch {
    res.status(500).json([]);
  }
});

app.delete('/api/contact/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await getDB();

    await db.collection('contacts').deleteOne({ id: req.params.id });

    res.json({ ok: true });

  } catch {
    res.status(500).json({ ok: false });
  }
});

/* ───────────────────────────────────────── */

module.exports = app;