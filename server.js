// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');

// Serve static files from root if index.html is there; otherwise from /public
const STATIC_DIR = fs.existsSync(path.join(ROOT, 'index.html')) ? ROOT : PUBLIC;

app.use(express.static(STATIC_DIR));

// health check
app.get('/health', (_, res) => res.json({ ok: true }));

// fallback to index.html for any route
app.get('*', (_, res) => {
  const indexPath = path.join(STATIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).send('index.html not found');
});

app.listen(PORT, () => {
  console.log(`Rema Auto Body estimator running on port ${PORT}`);
});
