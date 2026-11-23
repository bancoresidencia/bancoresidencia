import fs from 'fs';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || cat;

// Group by banca and year
const groups = {};
for (const item of list) {
  const key = `${item.banca} (${item.year})`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(item);
}

const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
console.log('Top Exam Clusters in Remaining Watermarked Questions:');
sorted.slice(0, 20).forEach(([k, items]) => {
  console.log(`  ${k.padEnd(45)}: ${items.length} questions`);
});
