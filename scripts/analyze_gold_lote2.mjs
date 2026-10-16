import fs from 'fs';

const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
const lote2Keywords = ['PSU-MG', 'AMP -', 'AMRIGS', 'HCPA', 'UFRGS', 'Einstein', 'HIAE', 'SES-DF', 'UNICAMP', 'SURCE', 'UERJ', 'SES-GO', 'UEL', 'UFRJ'];
const counts = {};
const details = {};

for (const q of gold) {
  for (const kw of lote2Keywords) {
    if (q.institution && q.institution.includes(kw)) {
      counts[q.institution] = (counts[q.institution] || 0) + 1;
      if (!details[q.institution]) details[q.institution] = { years: {}, specs: {} };
      details[q.institution].years[q.year] = (details[q.institution].years[q.year] || 0) + 1;
      details[q.institution].specs[q.specialty || 'outros'] = (details[q.institution].specs[q.specialty || 'outros'] || 0) + 1;
      break;
    }
  }
}

console.log('=== LOTE 2 EM ALL_HOMOLOGATED_QUESTIONS_GOLD.JSON ===');
for (const [k, v] of Object.entries(counts).sort((a,b) => b[1] - a[1])) {
  console.log(`\n${k} -> Total: ${v}`);
  console.log('  Anos:', JSON.stringify(details[k].years));
  console.log('  Especialidades:', JSON.stringify(details[k].specs));
}
