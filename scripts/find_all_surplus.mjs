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
  if (id.startsWith('questions_expansion_titulo_especialista_')) return id.slice(40);
  if (id.startsWith('questions_expansion_revalida_')) return id.slice(29);
  if (id.startsWith('questions_expansion_direto_')) return id.slice(27);
  if (id.startsWith('questions_expansion_r_plus_')) return id.slice(27);
  if (id.startsWith('questions_')) return id.slice(10);
  return id;
}

// Build sets of valid IDs from SSOT
const validDireto = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'").all().map(r => cleanPrefix(r.id)));
const validRplus = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'R+'").all().map(r => cleanPrefix(r.id)));
const validTitulo = new Set(db.prepare("SELECT id FROM questions_curated_staging WHERE modalidade = 'Título de Especialista'").all().map(r => cleanPrefix(r.id)));

console.log('SSOT Valid Direto count:', validDireto.size);
console.log('SSOT Valid Rplus count:', validRplus.size);
console.log('SSOT Valid Titulo count:', validTitulo.size);

// Function to fetch all IDs from a Supabase table with pagination
async function fetchAllIds(table) {
  const ids = [];
  let lastId = null;
  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1000&order=id.asc`;
    if (lastId) url += `&id=gt.${encodeURIComponent(lastId)}`;
    const res = await fetch(url, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    const rows = await res.json();
    if (!rows || rows.length === 0) break;
    for (const r of rows) {
      ids.push(r.id);
      lastId = r.id;
    }
  }
  return ids;
}

async function checkTable(table, validSet, expectedCount) {
  console.log(`\nAnalyzing ${table}...`);
  const liveIds = await fetchAllIds(table);
  console.log(`Live count in ${table}:`, liveIds.length);
  const surplus = liveIds.filter(id => !validSet.has(id));
  console.log(`Surplus (not in valid set):`, surplus.length);
  return surplus;
}

const surplusRplus = await checkTable('questions_rplus', validRplus, 45413);
const surplusDireto = await checkTable('questions_direto', validDireto, 206599);

console.log('\nSurplus in R+ summary: total', surplusRplus.length);
console.log('Surplus in Direto summary: total', surplusDireto.length);

