import fs from 'node:fs';

const p = 'data/backups/supabase_backup_2026-11-13T02-27-33-296Z/tables/view_questions_acesso_direto.json';
console.log('Reading first 100KB of backup to test JSON structure...');
const fd = fs.openSync(p, 'r');
const buf = Buffer.alloc(100000);
fs.readSync(fd, buf, 0, 100000, 0);
fs.closeSync(fd);

const text = buf.toString('utf8');
const firstObjEnd = text.indexOf('},');
if (firstObjEnd !== -1) {
  const jsonStr = text.slice(text.indexOf('{'), firstObjEnd + 1);
  const obj = JSON.parse(jsonStr);
  console.log('Sample parsed from view_questions_acesso_direto.json:');
  console.log('ID:', obj.id);
  console.log('Has commentary:', Boolean(obj.commentary));
  console.log('Commentary len:', obj.commentary ? obj.commentary.length : 0);
  console.log('Commentary start:', obj.commentary ? obj.commentary.slice(0, 150) : null);
}

