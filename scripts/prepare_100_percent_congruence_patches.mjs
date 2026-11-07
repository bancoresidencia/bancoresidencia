import fs from 'fs';
import path from 'path';

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
  console.error('❌ Credenciais Supabase ausentes em .env.local');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('🚀 EXECUTANDO SINCRONIZAÇÃO DEFINITIVA PARA 100% DE CONGRUÊNCIA');
console.log('='.repeat(80));

// 1. CARREGAR BANCO LOCAL
const LOCAL_FILES = [
  { spec: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' },
  { spec: 'Pediatria', path: 'data/pediatria_final_questions.json' },
  { spec: 'Medicina Preventiva', path: 'data/medicina_preventiva_final_questions.json' },
  { spec: 'Cirurgia', path: 'data/cirurgia_final_questions.json' },
  { spec: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
  { spec: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
  { spec: 'Urologia', path: 'data/urologia_final_questions.json' }
];

const localMap = new Map();
for (const lf of LOCAL_FILES) {
  if (!fs.existsSync(lf.path)) continue;
  const arr = JSON.parse(fs.readFileSync(lf.path, 'utf8'));
  for (const q of arr) {
    if (!q.id) continue;
    if (!localMap.has(q.id)) {
      const ans = (q.correct_answer || q.correctAnswer || '').trim();
      const isAnul = Boolean(q.is_anulada || q.isAnulada || ans === 'ANULADA');
      const isDisc = q.type === 'Discursiva';

      localMap.set(q.id, {
        raw: q,
        id: q.id,
        specialty: lf.spec,
        correct_answer: isDisc ? null : (ans || ''),
        is_anulada: isAnul,
        type: isDisc ? 'Discursiva' : (q.type || 'Múltipla escolha')
      });
    }
  }
}
console.log(`1. Banco Local carregado: ${localMap.size.toLocaleString('pt-BR')} questões.`);

// 2. BAIXAR SUPABASE VIA KEYSET PAGINATION
console.log('2. Baixando estado do Supabase...');
const supaMap = new Map();
let lastId = '00000000-0000-0000-0000-000000000000';
const PAGE_SIZE = 1000;

while (true) {
  const url = `${SUPABASE_URL}/rest/v1/questions?select=id,correct_answer,is_anulada,type&id=gt.${lastId}&order=id.asc&limit=${PAGE_SIZE}`;
  const res = await fetch(url, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  if (!res.ok) break;
  const rows = await res.json();
  if (!rows || rows.length === 0) break;

  for (const r of rows) {
    supaMap.set(r.id, {
      id: r.id,
      correct_answer: r.correct_answer,
      is_anulada: Boolean(r.is_anulada),
      type: r.type || 'Múltipla escolha'
    });
  }

  lastId = rows[rows.length - 1].id;
  if (rows.length < PAGE_SIZE) break;
}
console.log(`   Supabase carregado: ${supaMap.size.toLocaleString('pt-BR')} questões.`);

// 3. INSERIR QUESTÕES FALTANTES (SEM has_gabarito)
const missingInSupa = [];
for (const [id, loc] of localMap.entries()) {
  if (!supaMap.has(id)) {
    const q = loc.raw;
    missingInSupa.push({
      id: q.id,
      code: q.code || `Q-${q.id.slice(0, 8)}`,
      institution: q.institution || q.banca || 'Banca Oficial',
      banca: q.banca || q.institution || 'Banca Oficial',
      year: q.year || 2024,
      tipo_prova: q.tipo_prova || q.tipoProva || 'Prova 1',
      modalidade: q.modalidade || 'Residência Médica',
      especialidade: q.especialidade || q.specialty || 'Ginecologia',
      tema: q.tema || '',
      foco: q.foco || '',
      subfoco: q.subfoco || '',
      difficulty: q.difficulty || 'Médio',
      type: q.type || 'Múltipla escolha',
      is_anulada: Boolean(q.is_anulada || q.isAnulada),
      statement: q.statement || '',
      options: q.options || [],
      correct_answer: (q.correct_answer || q.correctAnswer || '').trim(),
      commentary: q.commentary || ''
    });
  }
}
console.log(`\n3. Questões a inserir no Supabase: ${missingInSupa.length}`);

if (missingInSupa.length > 0) {
  console.log(`   Inserindo ${missingInSupa.length} questões no Supabase...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(missingInSupa)
  });

  if (res.ok) {
    console.log(`   ✅ ${missingInSupa.length} questões inseridas com sucesso!`);
    for (const m of missingInSupa) {
      supaMap.set(m.id, {
        id: m.id,
        correct_answer: m.correct_answer,
        is_anulada: m.is_anulada,
        type: m.type
      });
    }
  } else {
    const errText = await res.text();
    console.error('   ❌ Erro ao inserir:', res.status, errText);
  }
}

// 4. IDENTIFICAR TODOS OS PATCHES NECESSÁRIOS
const patches = [];
for (const [id, loc] of localMap.entries()) {
  const sup = supaMap.get(id);
  if (!sup) continue;

  const ansMismatch = loc.correct_answer !== sup.correct_answer;
  const anulMismatch = loc.is_anulada !== sup.is_anulada;
  const typeMismatch = loc.type !== sup.type;

  if (ansMismatch || anulMismatch || typeMismatch) {
    patches.push({
      id,
      correct_answer: loc.correct_answer,
      is_anulada: loc.is_anulada,
      type: loc.type
    });
  }
}

console.log(`\n4. Patches necessários para 100% de congruência: ${patches.length.toLocaleString('pt-BR')}`);

// 5. EXECUTAR OS PATCHES EM PARALELO (POOL CONCORRENTE DE 32 WORKERS)
if (patches.length > 0) {
  console.log('\n5. Executando PATCHes no Supabase...');
  const CONCURRENCY = 32;
  let currentIdx = 0;
  let successCount = 0;
  let errorCount = 0;
  const t0 = Date.now();

  async function worker() {
    while (currentIdx < patches.length) {
      const idx = currentIdx++;
      const p = patches[idx];

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${p.id}`, {
            method: 'PATCH',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              correct_answer: p.correct_answer,
              is_anulada: p.is_anulada,
              type: p.type
            })
          });

          if (res.ok) {
            successCount++;
            break;
          } else {
            if (attempt === 3) errorCount++;
          }
        } catch (e) {
          if (attempt === 3) errorCount++;
        }
      }

      if (idx % 500 === 0 || idx === patches.length - 1) {
        const pct = ((idx + 1) / patches.length * 100).toFixed(1);
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        process.stdout.write(`   [${pct}%] ${idx + 1}/${patches.length} | Sucesso: ${successCount} | Erros: ${errorCount} (${elapsed}s)...\r`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  const totalElapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n\n✅ Sincronização concluída em ${totalElapsed}s!`);
  console.log(`   • Sucessos: ${successCount.toLocaleString('pt-BR')}`);
  console.log(`   • Erros: ${errorCount}`);
}

console.log('\n='.repeat(80));
console.log('SINCRONIZAÇÃO CONCLUÍDA');
console.log('='.repeat(80));
