import fs from 'fs';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || cat;

const usp2026 = list.filter(i => i.banca === 'USP/HCFMUSP' && i.year === 2026);
console.log(`USP/HCFMUSP (2026) remaining watermarked: ${usp2026.length}`);

usp2026.forEach((item, idx) => {
  const stmt = (item.statement_snippet || item.statement || '').replace(/\s+/g, ' ');
  console.log(`[${idx+1}] ID: ${item.id}`);
  console.log(`     Stmt: ${stmt.substring(0, 110)}`);
  console.log(`     Image: ${item.image_url}`);
});
