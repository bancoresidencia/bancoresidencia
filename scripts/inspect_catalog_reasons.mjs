import fs from 'fs';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];

console.log(`Total items in medq_watermark_catalog: ${cat.length}`);
console.log('Sample entries (first 5):');
console.log(JSON.stringify(cat.slice(0, 5), null, 2));

// Reasons breakdown
const reasons = {};
for (const item of cat) {
  const r = item.reason ? item.reason.split('(')[0].trim() : 'Sem razão';
  reasons[r] = (reasons[r] || 0) + 1;
}

console.log('\nBreakdown of watermark detection reasons:');
console.log(JSON.stringify(reasons, null, 2));
