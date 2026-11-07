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
  console.error('❌ Credenciais do Supabase ausentes em .env.local');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('🔍 AUDITORIA DE CONGRUÊNCIA 100%: SUPABASE vs. ARQUIVOS LOCAIS CANÔNICOS');
console.log('   (Excluídas as bases staged do plano de expansão: QuestMed, Hardwork, etc.)');
console.log('='.repeat(80));

// 1. CARREGAR ARQUIVOS LOCAIS
const LOCAL_FILES = [
  { spec: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' },
  { spec: 'Pediatria', path: 'data/pediatria_final_questions.json' },
  { spec: 'Medicina Preventiva', path: 'data/medicina_preventiva_final_questions.json' },
  { spec: 'Cirurgia', path: 'data/cirurgia_final_questions.json' },
  { spec: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
  { spec: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
  { spec: 'Urologia', path: 'data/urologia_final_questions.json' }
];

console.log('\n[1/3] Carregando acervo local canônico...');
const localMap = new Map();
let totalLocalRows = 0;

for (const lf of LOCAL_FILES) {
  if (!fs.existsSync(lf.path)) {
    console.log(`⚠️ Arquivo não encontrado: ${lf.path}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(lf.path, 'utf8'));
  totalLocalRows += data.length;
  for (const q of data) {
    if (!q.id) continue;
    if (!localMap.has(q.id)) {
      const ans = (q.correct_answer || q.correctAnswer || '').trim();
      const isAnul = Boolean(q.is_anulada || q.isAnulada || ans === 'ANULADA');
      const isDisc = q.type === 'Discursiva';
      // Fórmula oficial do PostgreSQL (Migration 007): (correct_answer != '' OR is_anulada = true)
      const hasGab = Boolean((ans && ans !== '' && ans !== 'SEM_GABARITO') || isAnul);

      localMap.set(q.id, {
        id: q.id,
        specialty: lf.spec,
        correct_answer: ans,
        is_anulada: isAnul,
        type: isDisc ? 'Discursiva' : (q.type || 'Múltipla escolha'),
        has_gabarito: hasGab,
        optionsCount: Array.isArray(q.options) ? q.options.length : 0,
        statementLen: (q.statement || '').length
      });
    }
  }
}

console.log(`   • Total de registros nos arquivos locais: ${totalLocalRows.toLocaleString('pt-BR')}`);
console.log(`   • Total de IDs únicos no banco local: ${localMap.size.toLocaleString('pt-BR')}`);

// 2. BAIXAR METADADOS DE TODAS AS QUESTÕES DO SUPABASE (KEYSET PAGINATION POR PRIMARY KEY)
console.log('\n[2/3] Baixando mapa de questões do Supabase via keyset pagination (id=gt.lastId)...');
const supaMap = new Map();

async function fetchAllFromSupabase() {
  const PAGE_SIZE = 1000;
  let lastId = '00000000-0000-0000-0000-000000000000';
  let totalFetched = 0;
  const t0 = Date.now();

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/questions?select=id,correct_answer,is_anulada,type,has_gabarito,especialidade&id=gt.${lastId}&order=id.asc&limit=${PAGE_SIZE}`;
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });

    if (!res.ok) {
      console.error(`\nErro ao buscar após ${lastId}: ${res.statusText}`);
      break;
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) break;

    for (const r of rows) {
      supaMap.set(r.id, {
        id: r.id,
        specialty: r.especialidade,
        correct_answer: (r.correct_answer || '').trim(),
        is_anulada: Boolean(r.is_anulada),
        type: r.type || 'Múltipla escolha',
        has_gabarito: r.has_gabarito
      });
    }

    totalFetched += rows.length;
    lastId = rows[rows.length - 1].id;

    if (totalFetched % 10000 === 0 || rows.length < PAGE_SIZE) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      process.stdout.write(`   Baixadas: ${totalFetched.toLocaleString('pt-BR')} questões (${elapsed}s)...\r`);
    }

    if (rows.length < PAGE_SIZE) break;
  }
  const totalElapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n   ✅ Concluído! Total Supabase: ${supaMap.size.toLocaleString('pt-BR')} questões em ${totalElapsed}s.`);
}

await fetchAllFromSupabase();

// 3. COMPARAR CONGRUÊNCIA
console.log('\n[3/3] Executando auditoria cruzada de congruência 100%...');

const onlyInLocal = [];
const onlyInSupa = [];

let countCommon = 0;
let answerMatches = 0;
let answerDivergences = [];
let isAnuladaMatches = 0;
let isAnuladaDivergences = [];
let typeMatches = 0;
let typeDivergences = [];
let hasGabaritoMatches = 0;
let hasGabaritoDivergences = [];

// Checar Local vs Supabase
for (const [id, loc] of localMap.entries()) {
  const sup = supaMap.get(id);
  if (!sup) {
    onlyInLocal.push(loc);
  } else {
    countCommon++;

    // 1. Gabarito
    if (loc.correct_answer === sup.correct_answer) {
      answerMatches++;
    } else {
      answerDivergences.push({ id, spec: loc.specialty, locAns: loc.correct_answer, supAns: sup.correct_answer });
    }

    // 2. Anulada
    if (loc.is_anulada === sup.is_anulada) {
      isAnuladaMatches++;
    } else {
      isAnuladaDivergences.push({ id, spec: loc.specialty, locAnul: loc.is_anulada, supAnul: sup.is_anulada });
    }

    // 3. Tipo (Discursiva vs Múltipla escolha)
    if (loc.type === sup.type) {
      typeMatches++;
    } else {
      typeDivergences.push({ id, spec: loc.specialty, locType: loc.type, supType: sup.type });
    }

    // 4. has_gabarito
    if (loc.has_gabarito === sup.has_gabarito) {
      hasGabaritoMatches++;
    } else {
      hasGabaritoDivergences.push({ id, spec: loc.specialty, locHasGab: loc.has_gabarito, supHasGab: sup.has_gabarito });
    }
  }
}

// Checar se há algo no Supabase que não está no local
for (const [id, sup] of supaMap.entries()) {
  if (!localMap.has(id)) {
    onlyInSupa.push(sup);
  }
}

// EXIBIR RELATÓRIO DE CONGRUÊNCIA
console.log('\n' + '='.repeat(80));
console.log('📊 RESULTADOS DA AUDITORIA DE CONGRUÊNCIA');
console.log('='.repeat(80));

console.log(`\n1. Cardinalidade e Cobertura de IDs:`);
console.log(`   • Questões presentes no Supabase: ${supaMap.size.toLocaleString('pt-BR')}`);
console.log(`   • Questões únicas no Banco Local: ${localMap.size.toLocaleString('pt-BR')}`);
console.log(`   • Questões coincidentes em AMBOS:  ${countCommon.toLocaleString('pt-BR')} (${(countCommon / supaMap.size * 100).toFixed(4)}% do Supabase)`);
console.log(`   • Questões exclusivas do Banco Local (não estão no Supabase): ${onlyInLocal.length}`);
console.log(`   • Questões exclusivas do Supabase (não estão no Local): ${onlyInSupa.length}`);

console.log(`\n2. Congruência por Atributo (no universo coincidente de ${countCommon.toLocaleString('pt-BR')} questões):`);

const pAns = (answerMatches / countCommon * 100).toFixed(2);
const pAnul = (isAnuladaMatches / countCommon * 100).toFixed(2);
const pType = (typeMatches / countCommon * 100).toFixed(2);
const pHasGab = (hasGabaritoMatches / countCommon * 100).toFixed(2);

console.log(`   • Gabarito (correct_answer):  ${answerMatches.toLocaleString('pt-BR')} iguais (${pAns}%) | ${answerDivergences.length} divergências`);
console.log(`   • Status Anulada (is_anulada): ${isAnuladaMatches.toLocaleString('pt-BR')} iguais (${pAnul}%) | ${isAnuladaDivergences.length} divergências`);
console.log(`   • Tipo da Questão (type):      ${typeMatches.toLocaleString('pt-BR')} iguais (${pType}%) | ${typeDivergences.length} divergências`);
console.log(`   • Flag has_gabarito:           ${hasGabaritoMatches.toLocaleString('pt-BR')} iguais (${pHasGab}%) | ${hasGabaritoDivergences.length} divergências`);

if (onlyInLocal.length > 0) {
  console.log(`\n3. Detalhe das ${onlyInLocal.length} questões que existem apenas no banco local:`);
  console.table(onlyInLocal.slice(0, 10).map(q => ({
    id: q.id,
    spec: q.specialty,
    ans: q.correct_answer,
    type: q.type,
    options: q.optionsCount
  })));
}

if (answerDivergences.length > 0) {
  console.log(`\n4. Amostra de divergências de gabarito (${answerDivergences.length} casos):`);
  console.table(answerDivergences.slice(0, 10));
}

if (typeDivergences.length > 0) {
  console.log(`\n5. Amostra de divergências de tipo (${typeDivergences.length} casos):`);
  console.table(typeDivergences.slice(0, 10));
}

if (hasGabaritoDivergences.length > 0) {
  console.log(`\n6. Amostra de divergências de has_gabarito (${hasGabaritoDivergences.length} casos):`);
  console.table(hasGabaritoDivergences.slice(0, 10));
}

// Salvar relatório em JSON para auditoria forense
const auditReport = {
  timestamp: new Date().toISOString(),
  supabaseCount: supaMap.size,
  localCount: localMap.size,
  commonCount: countCommon,
  onlyInLocalCount: onlyInLocal.length,
  onlyInLocal,
  onlyInSupaCount: onlyInSupa.length,
  onlyInSupa,
  answerMatches,
  answerDivergencesCount: answerDivergences.length,
  answerDivergences: answerDivergences.slice(0, 50),
  isAnuladaMatches,
  isAnuladaDivergencesCount: isAnuladaDivergences.length,
  typeMatches,
  typeDivergencesCount: typeDivergences.length,
  typeDivergences: typeDivergences.slice(0, 50),
  hasGabaritoMatches,
  hasGabaritoDivergencesCount: hasGabaritoDivergences.length
};

fs.writeFileSync('data/relatorio_congruencia_supabase_local.json', JSON.stringify(auditReport, null, 2), 'utf8');
console.log(`\nRelatório completo salvo em: data/relatorio_congruencia_supabase_local.json`);
