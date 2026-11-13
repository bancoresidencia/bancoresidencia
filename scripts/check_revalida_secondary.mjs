import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
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

// Check which of these are secondary merged IDs in SSOT (is_primary = 0)
const mergedSecondary = db.prepare('SELECT clean_id FROM ssot_id_mapping WHERE is_primary = 0').all().map(r => r.clean_id);
const secondarySet = new Set(mergedSecondary);

const revalidaSecondary = ids.filter(id => secondarySet.has(id));
console.log('Revalida IDs that are duplicate/secondary in SSOT:', revalidaSecondary.length, revalidaSecondary);

