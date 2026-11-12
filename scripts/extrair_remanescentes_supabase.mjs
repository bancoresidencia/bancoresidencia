import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const OUTPUT_FILE  = path.resolve('data/quarentena_remanescentes_4552.jsonl');

console.log('🔄 Baixando todas as 4.552 questões pendentes do Supabase...');

let offset = 0;
const limit = 500;
let totalSaved = 0;

if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
}

while (true) {
  const url = `${SUPABASE_URL}/rest/v1/questions_expansion_direto?subfoco=eq.Geral&select=id,code,especialidade,tema,foco,statement,options,correct_answer,commentary&offset=${offset}&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });

  if (!res.ok) {
    console.error(`❌ Erro HTTP ${res.status} ao buscar lote`);
    break;
  }

  const rows = await res.json();
  if (!rows || rows.length === 0) break;

  const lines = rows.map(r => JSON.stringify(r)).join('\n') + '\n';
  fs.appendFileSync(OUTPUT_FILE, lines, 'utf8');
  totalSaved += rows.length;
  console.log(`  📦 Baixadas: ${totalSaved} questões...`);

  if (rows.length < limit) break;
  offset += limit;
}

console.log(`✅ Concluído! ${totalSaved} questões salvas em: ${OUTPUT_FILE}`);

