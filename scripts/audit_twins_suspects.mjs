import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const staging = JSON.parse(fs.readFileSync('data/staging_questoes_gemeas_locais.json', 'utf8'));
const db = new DatabaseSync('data/questoes_132k.db');

console.log(`Auditoria das ${staging.length} questões em staging...`);

let mesmoAnoMesmaInst = 0;
let bancasDiferentes = 0;
let certoErradoCount = 0;
let multiplaEscolhaCount = 0;

const suspeitas = [];
const genuinas = [];

for (const item of staging) {
  const q1 = db.prepare('SELECT statement, options FROM questions WHERE id = ?').get(item.question_id);
  const q2 = db.prepare('SELECT statement, options FROM questions WHERE id = ?').get(item.twin_source_id);

  const opts1 = JSON.parse(q1?.options || '[]');
  const isCertoErrado = opts1.length === 2 && opts1.some(o => (o.text || '').toLowerCase().includes('certo'));

  if (item.institution === item.twin_institution && item.year === item.twin_year) {
    mesmoAnoMesmaInst++;
    if (isCertoErrado) certoErradoCount++;
    suspeitas.push({
      code: item.code,
      twin_code: item.twin_source_code,
      inst: item.institution,
      year: item.year,
      sim: item.statement_similarity,
      isCertoErrado
    });
  } else {
    bancasDiferentes++;
    if (!isCertoErrado) multiplaEscolhaCount++;
    genuinas.push({
      code: item.code,
      twin_code: item.twin_source_code,
      inst: item.institution,
      twin_inst: item.twin_institution,
      year: item.year,
      twin_year: item.twin_year,
      sim: item.statement_similarity,
      correct_answer: item.correct_answer,
      isCertoErrado
    });
  }
}

console.log('\n--- RESULTADOS DA AUDITORIA ---');
console.log(`Mesma Instituição e Mesmo Ano: ${mesmoAnoMesmaInst} (sendo Certo/Errado: ${certoErradoCount})`);
console.log(`Bancas Diferentes (Gêmeas Inter-Bancas Reais): ${bancasDiferentes} (sendo Múltipla Escolha: ${multiplaEscolhaCount})`);

console.log('\nExemplos de Suspeitas (Mesmo caso clínico Cebraspe):');
suspeitas.slice(0, 5).forEach(s => console.log(` - ${s.code} vs ${s.twin_code} (${s.inst}) | Sim: ${s.sim} | CE: ${s.isCertoErrado}`));

console.log('\nExemplos de Gêmeas Genuínas (Inter-Bancas):');
genuinas.slice(0, 5).forEach(g => console.log(` - ${g.code} (${g.inst} ${g.year}) vs ${g.twin_code} (${g.twin_inst} ${g.twin_year}) | Ans: [${g.correct_answer}] | Sim: ${g.sim}`));
