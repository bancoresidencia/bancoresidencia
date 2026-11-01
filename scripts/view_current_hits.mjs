import fs from 'fs';
if (fs.existsSync('scripts/medevo_supabase_text_hits.json')) {
  const hits = JSON.parse(fs.readFileSync('scripts/medevo_supabase_text_hits.json', 'utf8'));
  console.log('Total hits recorded in JSON so far:', hits.length);
  hits.forEach((h, i) => {
    console.log(`[${i+1}] ${h.code || h.id} (${h.banca} ${h.year}):`);
    h.hits.forEach(sub => console.log(`    ${sub.field}: ${sub.snippet}`));
  });
} else {
  console.log('Hits file not yet created.');
}
