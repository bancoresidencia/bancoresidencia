import fs from 'fs';
import readline from 'readline';

// 1. Carrega credenciais do .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const stagingFile = 'data/staging/expansao_ineditas_consolidadas.jsonl';
if (!fs.existsSync(stagingFile)) {
  console.error(`❌ Arquivo de staging não encontrado: ${stagingFile}`);
  process.exit(1);
}

// Ler as primeiras 5 questões para o teste piloto
const rl = readline.createInterface({
  input: fs.createReadStream(stagingFile),
  crlfDelay: Infinity
});

const pilotBatch = [];
for await (const line of rl) {
  if (line.trim()) {
    const raw = JSON.parse(line);
    const item = {
      id: raw.id,
      code: raw.code,
      institution: raw.institution || 'N/A',
      banca: raw.banca || 'N/A',
      year: parseInt(raw.year, 10) || 2024,
      tipo_prova: raw.tipo_prova || 'Residência Médica',
      modalidade: raw.modalidade || 'Residência Médica',
      especialidade: raw.especialidade || 'Clínica Geral',
      tema: raw.tema || 'Geral',
      foco: raw.foco || 'Geral',
      subfoco: raw.subfoco || 'Geral',
      difficulty: 'Média',
      type: 'Múltipla escolha',
      is_anulada: Boolean(raw.is_anulada),
      statement: raw.statement,
      options: raw.options || [],
      correct_answer: raw.correct_answer,
      commentary: raw.commentary || null,
      images: raw.images || []
    };
    pilotBatch.push(item);
    if (pilotBatch.length >= 5) break;
  }
}

console.log(`Testando inserção piloto de ${pilotBatch.length} questões no Supabase...`);
console.log(`Exemplo de ID: ${pilotBatch[0].id} | Instituição: ${pilotBatch[0].institution}`);

const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=minimal'
  },
  body: JSON.stringify(pilotBatch)
});

console.log(`Resposta HTTP Supabase: ${res.status} ${res.statusText}`);
if (res.ok) {
  console.log('✅ Piloto inserido com sucesso!');
  // Conferir leitura via GET
  const check = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${pilotBatch[0].id}`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const data = await check.json();
  console.log('✅ Registro verificado no Supabase:', data.length > 0 ? data[0].code : 'Não encontrado');
} else {
  const err = await res.text();
  console.error('❌ Erro no insert piloto:', err);
}
