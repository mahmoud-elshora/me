'use strict';

const express        = require('express');
const cors           = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

/* ── MongoDB ── */
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME     = 'wa3yna';
let db, client;

async function getDB() {
  if (db) return db;
  if (!client) {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  }
  db = client.db(DB_NAME);
  return db;
}

/* ── Middleware ── */
app.use(cors({ origin: '*' }));
app.use(express.json());

/* ── Util ── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/* ================================================================
   BLOG & COMMUNITY
================================================================ */

app.get('/api/posts', async (req, res) => {
  try {
    const db   = await getDB();
    const coll = req.query.type === 'admin' ? 'blog' : 'community';
    const posts = await db.collection(coll)
      .find({})
      .sort({ date: -1 })
      .toArray();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

app.get('/api/post-details/:id', async (req, res) => {
  try {
    const db = await getDB();
    const id = req.params.id;
    let post = await db.collection('blog').findOne({ id });
    if (!post) post = await db.collection('community').findOne({ id });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching post' });
  }
});

app.post('/api/community-submit', async (req, res) => {
  try {
    const db      = await getDB();
    const newPost = {
      id:        generateId(),
      title:     req.body.title   || '',
      author:    req.body.author  || 'guest',
      excerpt:   req.body.excerpt || '',
      content:   req.body.content || '',
      icon:      req.body.icon || "fas fa-user-edit",
      type:      'guest',
      published: false,
      date:      new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };
    await db.collection('community').insertOne(newPost);
    res.json({ ok: true, id: newPost.id });
  } catch (err) {
    res.status(500).json({ error: 'Submit failed' });
  }
});

/* ================================================================
   TESTIMONIALS
================================================================ */

app.get('/api/testimonials', async (req, res) => {
  try {
    const db   = await getDB();
    const data = await db.collection('testimonials')
      .find({ approved: true })
      .toArray();
    res.json(data);
  } catch {
    res.status(500).json([]);
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const db = await getDB();
    await db.collection('testimonials').insertOne({
      id: generateId(),
      ...req.body,
      approved: false,
      date:     new Date().toISOString(),
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

/* ================================================================
   CONTACT
================================================================ */

app.post('/api/contact', async (req, res) => {
  try {
    const db = await getDB();
    await db.collection('contacts').insertOne({
      id:   generateId(),
      ...req.body,
      date: new Date().toISOString(),
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

/* ================================================================
   ADMIN AUTH
================================================================ */

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function verifyAdmin(req, res, next) {
  if (req.headers['authorization'] === 'admin-token') return next();
  res.status(403).json({ message: 'Unauthorized' });
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: 'admin-token' });
  }
  res.status(401).json({ success: false });
});

/* ================================================================
   BLOG ADMIN
================================================================ */

app.post('/api/blog', verifyAdmin, async (req, res) => {
  try {
    const db   = await getDB();
const post = {
  id:        generateId(),
  title:     req.body.title,
  excerpt:   req.body.excerpt,
  content:   req.body.content,
  icon:      req.body.icon || "fas fa-pen-fancy",
  published: true,
  date:      new Date().toISOString().split('T')[0],
};
    await db.collection('blog').insertOne(post);
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

/* ================================================================
   COMMUNITY ADMIN
================================================================ */

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

/* ================================================================
   CONTACTS ADMIN
================================================================ */

app.get('/api/contacts', verifyAdmin, async (req, res) => {
  try {
    const db   = await getDB();
    const data = await db.collection('contacts').find().toArray();
    res.json(data);
  } catch {
    res.status(500).json([]);
  }
});

/* ── Export for Vercel Serverless ── */
module.exports = app;
