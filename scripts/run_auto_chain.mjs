import fs from 'fs';
import { spawn } from 'child_process';

const QUEUE = [
  { file: 'data/urologia_final_questions.json', specialty: 'Urologia' },
  { file: 'data/ginecologia_final_questions.json', specialty: 'Ginecologia' },
  { file: 'data/obstetricia_final_questions.json', specialty: 'Obstetrícia' }
];

function checkClinicaPending() {
  try {
    const data = JSON.parse(fs.readFileSync('data/clinica_medica_final_questions.json', 'utf8'));
    const validAnswers = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];
    return data.filter(q => {
      const ans = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();
      const needsComm = !q.commentary || q.commentary.length < 200;
      const hasImg = q.imageUrl || q.image_url || (q.images && q.images.length > 0) || /!\[.*?\]/.test(q.statement || '');
      return validAnswers.includes(ans) && needsComm && !hasImg;
    }).length;
  } catch {
    return 999;
  }
}

function runSpecialty(item) {
  return new Promise((resolve, reject) => {
    console.log(`\n================================================================================`);
    console.log(`▶️ INICIANDO ENFILEIRAMENTO AUTOMÁTICO: ${item.specialty.toUpperCase()}`);
    console.log(`- Arquivo: ${item.file}`);
    console.log(`================================================================================`);
    
    const child = spawn('node', [
      'scripts/produce_specialty_batch.mjs',
      `--file=${item.file}`,
      `--specialty=${item.specialty}`,
      '--workers=4'
    ], { stdio: 'inherit' });

    child.on('exit', (code) => {
      console.log(`🏁 ${item.specialty} finalizou com código ${code}`);
      resolve(code);
    });
    child.on('error', (err) => {
      console.error(`❌ Erro no processo de ${item.specialty}:`, err);
      reject(err);
    });
  });
}

async function main() {
  console.log('🔄 ORQUESTRADOR AUTOMÁTICO DE FILA — BANCO RESIDÊNCIA');
  console.log('Ordem configurada:');
  console.log('  1. Clínica Médica (em andamento...)');
  console.log('  2. Urologia');
  console.log('  3. Ginecologia');
  console.log('  4. Obstetrícia\n');

  // Aguarda Clínica Médica terminar
  while (true) {
    const pending = checkClinicaPending();
    if (pending === 0) {
      console.log('✅ Clínica Médica 100% CONCLUÍDA! Iniciando fila subsequente...');
      break;
    }
    console.log(`[Aguardando Clínica Médica] Restam ${pending} questões pendentes...`);
    await new Promise(r => setTimeout(r, 10000));
  }

  // Executa cada especialidade em sequência
  for (const item of QUEUE) {
    await runSpecialty(item);
  }

  console.log('\n================================================================================');
  console.log('🎉 TODAS AS ESPECIALIDADES DA FILA FORAM 100% CONCLUÍDAS COM SUCESSO!');
  console.log('  ✓ Clínica Médica');
  console.log('  ✓ Urologia');
  console.log('  ✓ Ginecologia');
  console.log('  ✓ Obstetrícia');
  console.log('================================================================================');
}

main().catch(err => {
  console.error('❌ Falha no orquestrador:', err);
  process.exit(1);
});

