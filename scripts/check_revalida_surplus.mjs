import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

function cleanPrefix(id) {
  if (!id) return '';
  if (id.startsWith('questions_expansion_revalida_')) return id.slice(29);
  if (id.startsWith('questions_')) return id.slice(10);
  return id;
}

// Fetch all IDs in questions_revalida
const ids = [];
let lastId = null;
while (true) {
  let url = `${SUPABASE_URL}/rest/v1/questions_revalida?select=id&limit=1000&order=id.asc`;
  if (lastId) url += `&id=gt.${encodeURIComponent(lastId)}`;
  const res = await fetch(url, { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } });
  const rows = await res.json();
  if (!rows || rows.length === 0) break;
  for (const r of rows) {
    ids.push(r.id);
    lastId = r.id;
  }
}

console.log('Total live in questions_revalida:', ids.length);
// Check which ones are in SSOT Revalida
const validRevalidaSSOT = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'Revalida'").all().map(r => cleanPrefix(r.id)));
console.log('Valid SSOT Revalida:', validRevalidaSSOT.size);

// Check which ones are in other SSOT modalities (e.g. Direto or R+)
const inDireto = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'").all().map(r => cleanPrefix(r.id)));
const inRplus = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'R+'").all().map(r => cleanPrefix(r.id)));

const revalidaInDireto = ids.filter(id => inDireto.has(id));
const revalidaInRplus = ids.filter(id => inRplus.has(id));
console.log('Revalida IDs that are actually Acesso Direto in SSOT:', revalidaInDireto.length);
console.log('Revalida IDs that are actually R+ in SSOT:', revalidaInRplus.length);

