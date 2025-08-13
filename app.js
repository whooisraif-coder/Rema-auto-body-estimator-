const PRICING = {
  laborRate: 95,                 // $ per hour (adjust as needed)
  partReplaceFee: 120,           // per part to replace
  paint: {
    none: 0,
    basic: 180,
    pearl: 280,
    metallic: 240
  },
  paintAreaMultiplier: {
    panel: 1.0,
    bumper: 1.2,
    hood: 1.4,
    full: 0   // special case: flat price below
  },
  fullPaintBasic: 3000,          // full car basic paint
  extras: {
    none: 0,
    wrap: 200,
    carbon: 350
  }
};

const $ = (id) => document.getElementById(id);
const currency = (n) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

function calc() {
  const hours = Number($('laborHours').value || 0);
  const parts = Number($('partsCount').value || 0);
  const paintType = $('paintType').value;
  const paintArea = $('paintArea').value;
  const extras = $('extras').value;

  let breakdown = [];
  let total = 0;

  // labor
  const labor = hours * PRICING.laborRate;
  if (labor) breakdown.push(`Labor (${hours}h @ ${currency(PRICING.laborRate)}/h): ${currency(labor)}`);
  total += labor;

  // parts
  const partsCost = parts * PRICING.partReplaceFee;
  if (partsCost) breakdown.push(`Parts replacement (${parts} @ ${currency(PRICING.partReplaceFee)}): ${currency(partsCost)}`);
  total += partsCost;

  // paint
  let paintCost = 0;
  if (paintArea === 'full') {
    paintCost = PRICING.fullPaintBasic; // using basic full-paint price
    if (paintType !== 'basic') {
      // surcharge for fancier coatings on full
      const adj = paintType === 'pearl' ? 600 : (paintType === 'metallic' ? 400 : 0);
      paintCost += adj;
    }
    breakdown.push(`Full car paint (${paintType}): ${currency(paintCost)}`);
  } else {
    const base = PRICING.paint[paintType] || 0;
    const mult = PRICING.paintAreaMultiplier[paintArea] || 1;
    paintCost = base * mult;
    if (paintCost) breakdown.push(`Paint (${paintType}, ${paintArea}): ${currency(paintCost)}`);
  }
  total += paintCost;

  // extras
  const extraCost = PRICING.extras[extras] || 0;
  if (extraCost) breakdown.push(`Extra (${extras}): ${currency(extraCost)}`);
  total += extraCost;

  $('breakdown').innerHTML = breakdown.length ? `<ul>${breakdown.map(x => `<li>${x}</li>`).join('')}</ul>` : '<em>No line items yet.</em>';
  $('total').textContent = currency(total);
  $('result').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  $('year').textContent = new Date().getFullYear();
  $('calc').addEventListener('click', calc);
});
