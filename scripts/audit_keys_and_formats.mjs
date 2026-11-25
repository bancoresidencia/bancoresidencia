import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const rawKeyNames = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY') && !k.includes('PAID') && !k.includes('DEMAND') && !k.includes('BILLING'))
  .filter(k => {
    const val = env[k];
    return val && !val.endsWith('Ukug') && !val.endsWith('rO9A') && !val.endsWith('Myxw');
  });

console.log('=== 1. STATUS DETALHADO DAS 9 CHAVES ATIVAS (QUOTA DIARIA vs MINUTO) ===');
for (const kName of rawKeyNames) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' + env[kName], {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Oi' }] }] })
  });
  const j = await res.json();
  const details = JSON.stringify(j?.error?.details || j?.error?.message || j);
  console.log(`${kName}: HTTP ${res.status} -> ${details.slice(0, 280)}`);
}

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
console.log('\n=== 2. COMPARATIVO DE FORMATO DOS COMENTARIOS OURO vs LEGADO ===');
const ouroRow = db.prepare(`
  SELECT id, code, commentary, options 
  FROM questions_curated_staging 
  WHERE tema LIKE '%Perioperat%' AND commentary LIKE '%Take-Home%' 
  LIMIT 1
`).get();
console.log('Ouro Sample:', ouroRow.code);
console.log('Commentary len:', ouroRow.commentary?.length, '| Starts with:', ouroRow.commentary?.slice(0, 120).replace(/\n/g, ' '));
const opts = JSON.parse(ouroRow.options || '[]');
console.log('Options have explanation?', opts.some(o => o.explanation && o.explanation.length > 5));

console.log('\n=== 3. CONTAGEM GLOBAL DE PADRAO OURO EM TODAS AS ESPECIALIDADES (EXCLUINDO REVALIDA) ===');
const stats = db.prepare(`
  SELECT 
    modalidade,
    COUNT(*) as total,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as com_take_home,
    SUM(CASE WHEN commentary LIKE '%Alternativa%' AND commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as llm_sem_take_home,
    SUM(CASE WHEN commentary LIKE '{"_id"%' THEN 1 ELSE 0 END) as json_bruto_legado,
    SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 AND commentary NOT LIKE '%Take-Home%' AND commentary NOT LIKE '%Alternativa%' AND commentary NOT LIKE '{"_id"%' THEN 1 ELSE 0 END) as texto_legado_banca_ou_antigo,
    SUM(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 50 THEN 1 ELSE 0 END) as vazio
  FROM questions_curated_staging
  GROUP BY modalidade
`).all();
console.table(stats);
