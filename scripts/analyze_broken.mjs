import fs from 'fs';

const questions = JSON.parse(fs.readFileSync('data/broken_questions_list.json', 'utf8'));

console.log(`Total questions: ${questions.length}`);

// Group by path pattern
const pathPrefixes = {};
const falsePositiveCandidates = [];

for (const q of questions) {
  const imgs = q.images || [];
  for (const img of imgs) {
    const prefix = img.split('/').slice(0, 4).join('/');
    pathPrefixes[prefix] = (pathPrefixes[prefix] || 0) + 1;
  }

  // Check if statement mentions image or [IMAGEM
  const stmt = q.statement || '';
  const mentionsImg = /imagem|figura|foto|radiografia|tomografia|ultrassom|tc|ecg|eletrocardiograma|gráfico|quadro|tabela|abaixo|a seguir/i.test(stmt);
  const hasTag = stmt.includes('[IMAGEM');

  if (!mentionsImg && !hasTag) {
    falsePositiveCandidates.push({
      id: q.id,
      institution: q.institution,
      year: q.year,
      stmt: stmt.substring(0, 150),
      images: q.images
    });
  }
}

console.log('\n--- Path prefixes of broken images ---');
console.log(JSON.stringify(pathPrefixes, null, 2));

console.log(`\nPotential false positives (statement doesn't mention visual terms or [IMAGEM): ${falsePositiveCandidates.length}`);
if (falsePositiveCandidates.length > 0) {
  console.log(JSON.stringify(falsePositiveCandidates.slice(0, 10), null, 2));
}

// Let's also look at the first 10 questions in detail
console.log('\n--- First 10 broken questions detailed ---');
for (let i = 0; i < Math.min(10, questions.length); i++) {
  const q = questions[i];
  console.log(`\n[${i+1}] ID: ${q.id} | ${q.institution || q.banca} (${q.year})`);
  console.log(`Statement: ${q.statement.substring(0, 160)}...`);
  console.log(`Images field: ${JSON.stringify(q.images)}`);
  console.log(`Broken reason: ${q.broken_reason}`);
}
