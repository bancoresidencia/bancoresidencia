import fs from 'node:fs';

const p = 'data/backups/supabase_backup_2026-11-13T02-27-33-296Z/tables/view_questions_acesso_direto.json';
const stat = fs.statSync(p);
console.log(`Size: ${(stat.size / (1024*1024)).toFixed(2)} MB`);

// Count "id": in the file
const stream = fs.createReadStream(p, { encoding: 'utf8' });
let count = 0;
stream.on('data', chunk => {
  const matches = chunk.match(/"id":/g);
  if (matches) count += matches.length;
});
stream.on('end', () => {
  console.log(`Total "id": occurrences: ${count}`);
});

