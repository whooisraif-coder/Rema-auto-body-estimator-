const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Simple health check
app.get('/health', (_, res) => res.json({ ok: true }));

// Fallback for SPA-style routing
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rema Auto Body estimator running on port ${PORT}`);
});
