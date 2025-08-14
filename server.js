// TOP (ensure these exist)
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve root and /public
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
app.use(express.static(ROOT));
if (fs.existsSync(PUBLIC)) app.use(express.static(PUBLIC));

app.get('/healthz', (_req, res) => res.send('ok'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024, files: 8 } });

// ==== Pricing Config (YOUR rules) ====
const LABOR_RATE = Number(process.env.LABOR_RATE || 95);        // $/hr
const PAINT_PRICE = { none: 0, small: 300, mid: 500, full: 3000 };

// --- STUB: plug real AI vision later ---
async function analyzePhotos(files, damageAreas=[]) {
  const photoSeverity = Math.min(1, (files?.length || 0) * 0.12); // 0..1
  const areaSeverity  = Math.min(1, (damageAreas?.length || 0) * 0.08);
  const severity = Math.min(1, 0.25 + photoSeverity + areaSeverity);
  const extraLaborHours = +(severity * 2).toFixed(2); // up to +2 hrs
  return { severity, extraLaborHours };
}

// --- STUB: vehicle summary (swap with VIN/value APIs later) ---
async function getVehicleSummary({ vin, year, make, model, trim, mileage }) {
  const yr = year || '—', mk = make || '—', md = model || '—', tr = trim || '';
  const mi = mileage ? `${mileage} mi` : '';
  return { summary: `${yr} ${mk} ${md} ${tr}`.replace(/\s+/g,' ').trim(), mileage: mi, marketValue: null };
}

// Range calculator
function estimateRange({ laborHours=0, paintSize='none', dealerPartsTotal=null, extraLaborHours=0 }) {
  const hours = (Number(laborHours) || 0) + (Number(extraLaborHours) || 0);
  const labor = Math.round(hours * LABOR_RATE);
  const paint = PAINT_PRICE[paintSize] ?? 0;

  let parts = 0, partsTBD = true;
  if (dealerPartsTotal !== undefined && dealerPartsTotal !== null && String(dealerPartsTotal).trim() !== '') {
    const v = Number(dealerPartsTotal);
    if (!Number.isNaN(v)) { parts = Math.max(0, Math.round(v)); partsTBD = false; }
  }

  const subtotal = labor + paint + (partsTBD ? 0 : parts);
  const low  = Math.round(subtotal * 0.85);  // −15%
  const high = Math.round(subtotal * 1.15);  // +15%

  const baseConf = partsTBD ? 0.55 : 0.7;
  const confidence = Math.min(0.95, baseConf + Math.min(0.2, (hours/10)));

  return { range: { low, high }, breakdown: { labor, paint, parts }, partsTBD, confidence };
}

// NEW endpoint
app.post('/api/estimate-v2', upload.array('photos'), async (req, res) => {
  try {
    const {
      vin, year, make, model, trim, mileage,
      paintSize = 'none',
      dealerPartsTotal,
      laborHours = 0,
      damageAreas
    } = req.body;

    const areas = (() => { try { return JSON.parse(damageAreas || '[]'); } catch { return []; } })();

    const vehicle = await getVehicleSummary({ vin, year, make, model, trim, mileage });
    const vision  = await analyzePhotos(req.files || [], areas);

    const out = estimateRange({
      laborHours,
      paintSize,
      dealerPartsTotal,
      extraLaborHours: vision.extraLaborHours
    });

    res.json({ ...out, vehicle });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'estimation_failed' });
  }
});

// START
app.listen(PORT, () => console.log('Estimator v2 running on', PORT));
