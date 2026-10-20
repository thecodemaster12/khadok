// Converts GADM level-2 GeoJSON (64 districts) into src/districts.json with SVG paths.
// Usage: node scripts/build-map.mjs path/to/gadm41_BGD_2.json
import fs from 'node:fs';
const g = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const fix = { "Cox'SBazar": "Cox's Bazar", Brahamanbaria: 'Brahmanbaria', Nawabganj: 'Chapai Nawabganj', Bogra: 'Bogura', Jessore: 'Jashore', Barisal: 'Barishal', Chittagong: 'Chattogram', Comilla: 'Cumilla', Maulvibazar: 'Moulvibazar', Netrakona: 'Netrokona' };
const W = 800, k = Math.cos(23.7 * Math.PI / 180);
const polys = f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
for (const f of g.features) for (const p of polys(f)) for (const [x, y] of p[0]) { x0 = Math.min(x0, x * k); x1 = Math.max(x1, x * k); y0 = Math.min(y0, -y); y1 = Math.max(y1, -y); }
const s = W / (x1 - x0), H = Math.ceil((y1 - y0) * s);
const pt = ([x, y]) => [((x * k - x0) * s).toFixed(1), ((-y - y0) * s).toFixed(1)];
const out = g.features.map(f => {
  const name = fix[f.properties.NAME_2] || f.properties.NAME_2;
  let d = '';
  for (const p of polys(f)) for (const ring of p) {
    // drop near-duplicate points (< 0.6px apart) to shrink output; skip specks
    const pts = []; for (const c of ring) { const q = pt(c), l = pts.at(-1); if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 0.6) pts.push(q); }
    if (pts.length > 3) d += 'M' + pts.map(q => q.join(',')).join('L') + 'Z';
  }
  return { id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, division: fix[f.properties.NAME_1] || f.properties.NAME_1, d };
});
fs.writeFileSync('src/districts.json', JSON.stringify({ viewBox: `0 0 ${W} ${H}`, districts: out }));
console.log(out.length, 'districts, viewBox', W, H, (fs.statSync('src/districts.json').size / 1024).toFixed(0) + 'KB');
