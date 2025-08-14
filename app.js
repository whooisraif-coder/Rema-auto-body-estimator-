// Example inventory (replace with your real data later)
const CARS = [
  { id:1, brand:"Lamborghini", model:"Aventador S", year:2019, miles:12000, price:389000, img:"/cars/lambo-aventador.jpg" },
  { id:2, brand:"Ferrari", model:"488 GTB", year:2018, miles:14500, price:289000, img:"/cars/ferrari-488.jpg" },
  { id:3, brand:"McLaren", model:"720S Performance", year:2020, miles:9000, price:319000, img:"/cars/mclaren-720s.jpg" },
  { id:4, brand:"Porsche", model:"911 GT3", year:2021, miles:8000, price:239000, img:"/cars/porsche-gt3.jpg" },
  { id:5, brand:"Aston Martin", model:"DBS Superleggera", year:2019, miles:16000, price:259000, img:"/cars/aston-dbs.jpg" }
];

// DOM
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const q = document.getElementById('q');
const brand = document.getElementById('brand');
const price = document.getElementById('price');
const yearMin = document.getElementById('yearMin');
const milesMax = document.getElementById('milesMax');
document.getElementById('searchBtn')?.addEventListener('click', render);
document.getElementById('apply')?.addEventListener('click', render);

// Render cards
function render(){
  const term = (q?.value || '').toLowerCase().trim();
  const br = brand?.value || '';
  const p = price?.value || '';
  const yMin = parseInt(yearMin?.value || '0', 10);
  const mMax = parseInt(milesMax?.value || '9999999', 10);

  let list = CARS.filter(c => 
    (!term || `${c.brand} ${c.model}`.toLowerCase().includes(term)) &&
    (!br || c.brand === br) &&
    (c.year >= yMin) &&
    (c.miles <= mMax)
  );

  if (p) {
    if (p === '200') list = list.filter(c => c.price < 200000);
    else if (p === '300') list = list.filter(c => c.price >= 200000 && c.price <= 300000);
    else if (p === '400') list = list.filter(c => c.price > 300000 && c.price <= 400000);
    else if (p === '401') list = list.filter(c => c.price > 400000);
  }

  grid.innerHTML = list.map(c => cardHTML(c)).join('') || `<div class="muted">No results.</div>`;
  count.textContent = `${list.length} result${list.length!==1?'s':''}`;
}

function cardHTML(c){
  // Fallback if image missing
  const img = c.img || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop';
  return `
    <article class="card">
      <img src="${img}" alt="${c.brand} ${c.model}">
      <div class="card-body">
        <div class="price">$${c.price.toLocaleString()}</div>
        <div class="title">${c.year} ${c.brand} ${c.model}</div>
        <div class="specs">${c.miles.toLocaleString()} miles</div>
      </div>
      <div class="cta">
        <a class="btn" href="/estimate.html">Get Repair Estimate</a>
        <a class="btn" href="tel:+10000000000">Call</a>
      </div>
    </article>
  `;
}

// initial load
render();
