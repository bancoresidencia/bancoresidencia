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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// Check rplus extra:
// Which IDs in Supabase questions_rplus are NOT in SSOT R+?
// We can fetch all IDs from questions_rplus in Supabase
const resRplus = await fetch(`${url}/rest/v1/questions_rplus?select=id&limit=50000`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
const rplusIds = await resRplus.json();
console.log('Total IDs fetched from questions_rplus in Supabase:', rplusIds.length);

// Check how many of these IDs are NOT in SSOT R+ payload
const rplusInSSOT = new Set();
const ssotRplusRows = db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'R+'").all();
for (const r of ssotRplusRows) {
  let id = r.id;
  if (id.startsWith('questions_expansion_r_plus_')) id = id.slice(27);
  else if (id.startsWith('questions_')) id = id.slice(10);
  rplusInSSOT.add(id);
}

const extraInRplus = rplusIds.filter(q => !rplusInSSOT.has(q.id));
console.log('Extra in questions_rplus:', extraInRplus.length);
if (extraInRplus.length > 0) {
  console.log('Sample extra IDs in R+:', extraInRplus.slice(0, 5));
  // Check what modalidade they have in SSOT
  const sample = extraInRplus[0].id;
  const m = db.prepare("SELECT id, modalidade FROM questions_curated_staging WHERE id LIKE ?").get('%' + sample);
  console.log('Sample in SSOT:', m);
}

