import fs from 'fs';
import path from 'path';

const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const verifiedPath = path.resolve('data/verified_clean_from_catalog.json');

const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const currentCatalog = catalogData.catalog || [];

const verifiedClean = JSON.parse(fs.readFileSync(verifiedPath, 'utf8'));
const cleanIdSet = new Set(verifiedClean.map(v => v.id));

console.log(`Current catalog: ${currentCatalog.length}`);
console.log(`Pruning ${cleanIdSet.size} verified clean items...`);

const newCatalog = currentCatalog.filter(item => !cleanIdSet.has(item.id));
catalogData.catalog = newCatalog;
catalogData.total_items = newCatalog.length;
catalogData.updated_at = new Date().toISOString();

fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2), 'utf8');
console.log(`Pruned successfully! New catalog count: ${newCatalog.length}`);

// Trigger dashboard reload
try {
  const res = await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
  const data = await res.json();
  console.log('Dashboard reload response:', data);
} catch (e) {
  console.log('Dashboard reload failed:', e.message);
}
