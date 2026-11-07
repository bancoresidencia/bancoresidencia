import fs from 'fs';
import path from 'path';

function safeWriteJson(filePath, data) {
  const tmpPath = `${filePath}.tmp_${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  let success = false;
  for (let i = 0; i < 5; i++) {
    try {
      fs.copyFileSync(tmpPath, filePath);
      fs.unlinkSync(tmpPath);
      success = true;
      break;
    } catch (e) {
      // Sleep 200ms
      const start = Date.now();
      while (Date.now() - start < 200) {}
    }
  }
  if (!success) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}

const files = [
  { key: 'cirurgia', name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json' },
  { key: 'preventiva', name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' },
  { key: 'nefrologia', name: 'Nefrologia', file: 'data/nefrologia_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json' },
  { key: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json' }
];

console.log('='.repeat(80));
console.log('⚡ EXECUTANDO FASE 1: CLASSIFICAÇÃO DETERMINÍSTICA DE DISCURSIVAS LOCAIS');
console.log('='.repeat(80));

const discursivasToSync = [];
const brokenMcqToQuarantine = [];
let totalDiscursivas = 0;
let totalBrokenMcq = 0;

for (const f of files) {
  const qs = JSON.parse(fs.readFileSync(f.file, 'utf8'));
  let fileDiscursivas = 0;
  let fileBroken = 0;

  for (const q of qs) {
    const isZeroOpt = !q.options || (Array.isArray(q.options) && q.options.length === 0);
    if (!isZeroOpt) {
      if (q.type === 'Dissertativa') {
        q.type = 'Discursiva';
      }
      continue;
    }

    const currentAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
    const hasLetter = ['A', 'B', 'C', 'D', 'E'].includes(currentAns);

    if (hasLetter) {
      fileBroken++;
      totalBrokenMcq++;
      q.type = 'Múltipla escolha';
      q.is_anulada = false;
      q.isAnulada = false;

      brokenMcqToQuarantine.push({
        id: q.id,
        code: q.code,
        spec: f.name,
        banca: q.banca,
        year: q.year,
        reason: 'MCQ_MISSING_OPTIONS_REQUIRES_REPAIR',
        correct_answer: currentAns
      });
    } else {
      fileDiscursivas++;
      totalDiscursivas++;

      q.type = 'Discursiva';
      q.options = [];
      q.is_anulada = false;
      q.isAnulada = false;
      q.correct_answer = null;
      q.correctAnswer = '';

      discursivasToSync.push({
        id: q.id,
        code: q.code,
        spec: f.name,
        banca: q.banca,
        year: q.year
      });
    }
  }

  safeWriteJson(f.file, qs);
  console.log(`✅ [${f.name.padEnd(25)}]: ${String(fileDiscursivas).padStart(4)} discursivas padronizadas | ${String(fileBroken).padStart(3)} MCQs quebradas em quarentena`);
}

// Salva arquivos auxiliares
fs.writeFileSync('data/discursivas_to_sync_supabase.json', JSON.stringify(discursivasToSync, null, 2), 'utf8');
fs.writeFileSync('data/broken_mcq_to_quarantine_supabase.json', JSON.stringify(brokenMcqToQuarantine, null, 2), 'utf8');

// Atualiza quarentena
const currentQuar = fs.existsSync('data/quarentena_questions.json') 
  ? JSON.parse(fs.readFileSync('data/quarentena_questions.json', 'utf8')) 
  : [];

const discursivaIdSet = new Set(discursivasToSync.map(d => d.id));
const updatedQuar = currentQuar.filter(item => !discursivaIdSet.has(item.id));

const existingQuarIds = new Set(updatedQuar.map(item => item.id));
for (const b of brokenMcqToQuarantine) {
  if (!existingQuarIds.has(b.id)) {
    updatedQuar.push({
      id: b.id,
      code: b.code,
      spec: b.spec,
      reason: b.reason,
      optionsCount: 0,
      statementSnippet: 'Questão de múltipla escolha com opções ausentes no parsing original'
    });
    existingQuarIds.add(b.id);
  }
}

fs.writeFileSync('data/quarentena_questions.json', JSON.stringify(updatedQuar, null, 2), 'utf8');

console.log('='.repeat(80));
console.log(`📊 RESULTADO FINAL DA FASE 1:`);
console.log(`• Discursivas Legítimas Salvas e Prontas para Sync : ${totalDiscursivas.toLocaleString('pt-BR')}`);
console.log(`• MCQs com Opções Perdidas em Quarentena          : ${totalBrokenMcq.toLocaleString('pt-BR')}`);
console.log(`• Arquivos exportados:`);
console.log(`   └─ data/discursivas_to_sync_supabase.json`);
console.log(`   └─ data/broken_mcq_to_quarantine_supabase.json`);
console.log(`   └─ data/quarentena_questions.json`);
console.log('='.repeat(80));
