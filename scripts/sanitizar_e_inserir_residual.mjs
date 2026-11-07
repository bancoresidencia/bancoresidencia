import fs from 'fs';
import readline from 'readline';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const stagingFile = 'data/staging/expansao_ineditas_consolidadas.jsonl';

console.log('Sanitizando e inserindo o lote residual (questões 119.000 a 125.988 com remoção de \\u0000)...');

const rl = readline.createInterface({
  input: fs.createReadStream(stagingFile),
  crlfDelay: Infinity
});

let idx = 0;
const residuals = [];

function cleanNullChars(val) {
  if (typeof val === 'string') {
    return val.replace(/\0/g, '').replace(/\\u0000/g, '');
  }
  if (Array.isArray(val)) {
    return val.map(cleanNullChars);
  }
  if (val && typeof val === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = cleanNullChars(v);
    }
    return res;
  }
  return val;
}

for await (const line of rl) {
  if (!line.trim()) continue;
  idx++;
  if (idx < 119000) continue; // foca exclusivamente no trecho que continha null bytes

  const raw = JSON.parse(line);
  const item = {
    id: raw.id,
    code: cleanNullChars(raw.code),
    institution: cleanNullChars(raw.institution || 'N/A'),
    banca: cleanNullChars(raw.banca || 'N/A'),
    year: parseInt(raw.year, 10) || 2024,
    tipo_prova: cleanNullChars(raw.tipo_prova || 'Residência Médica'),
    modalidade: cleanNullChars(raw.modalidade || 'Residência Médica'),
    especialidade: cleanNullChars(raw.especialidade || 'Clínica Geral'),
    tema: cleanNullChars(raw.tema || 'Geral'),
    foco: cleanNullChars(raw.foco || 'Geral'),
    subfoco: cleanNullChars(raw.subfoco || 'Geral'),
    difficulty: 'Média',
    type: 'Múltipla escolha',
    is_anulada: Boolean(raw.is_anulada),
    statement: cleanNullChars(raw.statement),
    options: cleanNullChars(raw.options || []),
    correct_answer: cleanNullChars(raw.correct_answer),
    commentary: cleanNullChars(raw.commentary || null),
    images: cleanNullChars(raw.images || [])
  };
  residuals.push(item);
}

console.log(`Total de questões residuais sanitizadas: ${residuals.length.toLocaleString('pt-BR')}`);

const BATCH_SIZE = 200;
let success = 0;
let errors = 0;

for (let i = 0; i < residuals.length; i += BATCH_SIZE) {
  const batch = residuals.slice(i, i + BATCH_SIZE);
  let ok = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(batch)
      });
      if (res.ok) {
        ok = true;
        success += batch.length;
        break;
      } else {
        const errText = await res.text();
        if (attempt === 3) {
          errors += batch.length;
          console.error(`Falha no batch ${i}: ${res.status} ${errText.slice(0, 100)}`);
        }
        await new Promise(r => setTimeout(r, 400 * attempt));
      }
    } catch (e) {
      if (attempt === 3) {
        errors += batch.length;
        console.error(`Erro de rede batch ${i}: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

console.log('='.repeat(60));
console.log(`✅ Lote residual concluído! Inseridas com sucesso: ${success.toLocaleString('pt-BR')} | Erros: ${errors}`);
console.log('='.repeat(60));

