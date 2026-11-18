import fs from 'node:fs';

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const SHARDS = [
  ['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'],
  ['4', '5'], ['5', '6'], ['6', '7'], ['7', '8'],
  ['8', '9'], ['9', 'a'], ['a', 'b'], ['b', 'c'],
  ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'g'],
  ['g', null]
];

let totalGrammar = 0;
let totalJson = 0;

console.log('=== EXECUTANDO LIMPEZA EM 17 FATIAS DE CHAVE PRIMÁRIA (questions_direto) ===\n');

for (const [minId, maxId] of SHARDS) {
  const t0 = Date.now();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_stage2_cleanup_shard`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_id_min: minId, p_id_max: maxId })
  });
  if (!res.ok) {
    console.error(`❌ Erro no shard [${minId}..${maxId ?? '∞'}]: HTTP ${res.status}`, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  totalGrammar += data.grammar_updated || 0;
  totalJson += data.json_updated || 0;
  console.log(
    `✓ Shard [${minId}..${maxId ?? '∞'}] concluído em ${elapsed}s -> gramática: ${data.grammar_updated}, json: ${data.json_updated}`
  );
}

console.log(`\n🎉 CONCLUÍDO! Total atualizado em questions_direto -> gramática: ${totalGrammar}, json: ${totalJson}`);
