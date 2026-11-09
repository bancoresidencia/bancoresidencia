const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('data/questoes_132k.db', { readOnly: true });

// Read hierarchyCounts.ts content
const hcContent = fs.readFileSync('src/data/hierarchyCounts.ts', 'utf8');
const startIdx = hcContent.indexOf('{');
const endIdx = hcContent.indexOf('const normalizeStr');
const jsonStr = hcContent.slice(startIdx, hcContent.lastIndexOf('};', endIdx) + 1);
const hc = eval('(' + jsonStr + ')');

console.log('--- Checking Especialidades ---');
for (const [esp, expectedCount] of Object.entries(hc.especialidades)) {
  if (['Cirurgia Geral', 'Ginecologia e Obstetrícia', 'Medicina Preventiva'].includes(esp)) continue;
  const realCount = db.prepare(`SELECT count(*) as c FROM questions WHERE especialidade = ?`).get(esp).c;
  console.log(`${esp}: HC = ${expectedCount}, DB = ${realCount}, Diff = ${realCount - expectedCount}`);
}

console.log('\n--- Checking Sample Temas ---');
const sampleTemas = Object.entries(hc.temas).slice(0, 5);
for (const [tema, expectedCount] of sampleTemas) {
  const realCount = db.prepare(`SELECT count(*) as c FROM questions WHERE COALESCE(novo_tema, tema) = ?`).get(tema).c;
  console.log(`${tema}: HC = ${expectedCount}, DB = ${realCount}, Diff = ${realCount - expectedCount}`);
}

console.log('\n--- Checking Sample Focos ---');
const sampleFocos = Object.entries(hc.focos).slice(0, 5);
for (const [foco, expectedCount] of sampleFocos) {
  const realCount = db.prepare(`SELECT count(*) as c FROM questions WHERE COALESCE(novo_foco, foco) = ?`).get(foco).c;
  console.log(`${foco}: HC = ${expectedCount}, DB = ${realCount}, Diff = ${realCount - expectedCount}`);
}

console.log('\n--- Checking Sample Subfocos ---');
const sampleSubfocos = Object.entries(hc.subfocos).slice(0, 5);
for (const [subfoco, expectedCount] of sampleSubfocos) {
  const realCount = db.prepare(`SELECT count(*) as c FROM questions WHERE COALESCE(novo_subfoco, subfoco) = ?`).get(subfoco).c;
  console.log(`${subfoco}: HC = ${expectedCount}, DB = ${realCount}, Diff = ${realCount - expectedCount}`);
}

// Check coverage in DB: how many temas/focos/subfocos have count > 0 in DB
const totalQuestions = db.prepare(`SELECT count(*) as c FROM questions`).get().c;
console.log('\nTotal questions in DB:', totalQuestions);
const totalHCEsp = hc.especialidades['Clínica Médica'] + hc.especialidades['Cirurgia'] + hc.especialidades['Pediatria'] + hc.especialidades['Ginecologia'] + hc.especialidades['Obstetrícia'] + hc.especialidades['Medicina Preventiva e Social'];
console.log('Total across individual specialties in HC:', totalHCEsp);

