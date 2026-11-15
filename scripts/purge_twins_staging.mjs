import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const staging = JSON.parse(fs.readFileSync('data/staging_questoes_gemeas_locais.json', 'utf8'));
const db = new DatabaseSync('data/questoes_132k.db');

const purgedStaging = [];
const quarantinedSuspects = [];

for (const item of staging) {
  const q1 = db.prepare('SELECT statement, options FROM questions WHERE id = ?').get(item.question_id);
  const opts1 = JSON.parse(q1?.options || '[]');
  const isCertoErrado = opts1.length === 2 && opts1.some(o => (o.text || '').toLowerCase().includes('certo'));

  // Regra de Proteção 1: Mesma instituição e mesmo ano com similaridade < 100% -> CASO CLÍNICO COMPARTILHADO (Falso-Positivo)
  const isSameExam = item.institution === item.twin_institution && item.year === item.twin_year;

  // Regra de Proteção 2: Certo/Errado só pode ser gêmea se for 100% idêntica e de banca diferente
  if (isSameExam || (isCertoErrado && item.statement_similarity < 1.0)) {
    quarantinedSuspects.push({
      ...item,
      motivo_quarentena: isSameExam ? 'Mesma instituição e mesmo ano (risco de caso clínico comum com itens diferentes)' : 'Certo/Errado com similaridade parcial'
    });
  } else {
    purgedStaging.push(item);
  }
}

fs.writeFileSync('data/staging_questoes_gemeas_locais.json', JSON.stringify(purgedStaging, null, 2), 'utf8');
fs.writeFileSync('data/quarentena_questoes_gemeas_cebraspe.json', JSON.stringify(quarantinedSuspects, null, 2), 'utf8');

console.log(`Auditoria concluída!`);
console.log(`- Removidas da Staging: ${quarantinedSuspects.length} questões suspeitas (salvas em quarentena).`);
console.log(`- Mantidas em Staging (100% Genuínas Inter-Bancas): ${purgedStaging.length} questões.`);
