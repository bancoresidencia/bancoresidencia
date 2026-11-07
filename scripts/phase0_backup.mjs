import fs from 'fs';
import path from 'path';

const backupDir = 'data/backups/pre_discursivas_sync_20261106';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const filesToBackup = [
  'cirurgia_final_questions.json',
  'clinica_medica_final_questions.json',
  'ginecologia_final_questions.json',
  'medicina_preventiva_final_questions.json',
  'nefrologia_final_questions.json',
  'obstetricia_final_questions.json',
  'pediatria_final_questions.json',
  'urologia_final_questions.json',
  'quarentena_questions.json',
  'exam_to_question_ids.json',
  'pending_supabase_gabarito_sync.json'
];

console.log('='.repeat(70));
console.log('🛡️ EXECUTANDO FASE 0: BACKUP DE SEGURANÇA IMUTÁVEL');
console.log('='.repeat(70));

for (const f of filesToBackup) {
  const src = path.join('data', f);
  if (fs.existsSync(src)) {
    const dest = path.join(backupDir, f);
    fs.copyFileSync(src, dest);
    const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Backup realizado: ${f.padEnd(42)} (${sizeMb} MB)`);
  } else {
    console.log(`⚠️ Arquivo não encontrado para backup: ${f}`);
  }
}
console.log('='.repeat(70));
console.log('🚀 FASE 0 CONCLUÍDA COM SUCESSO. Destino:', backupDir);
console.log('='.repeat(70));

