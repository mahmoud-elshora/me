'use strict';
/* Perfect Claude v16 — Local dev server (Node 13.14.0)
   For Vercel deployment, api/index.js is used as a serverless function. */
require('dotenv').config && (function () { try { require('dotenv').config(); } catch (e) {} })();
var path = require('path');
var express = require('express');
var api = require('./api/index');

var app = express();
var PORT = process.env.PORT || 3000;

/* mount API (api/index.js exports an Express app — mount its router) */
app.use('/', api);

/* static files (after API so /api/* hits API) */
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

/* fallback */
app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, function () {
  console.log('====================================================');
  console.log(' Perfect Claude v16 — http://localhost:' + PORT);
  console.log('====================================================');
});
