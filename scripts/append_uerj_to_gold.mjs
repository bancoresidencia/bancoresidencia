import fs from 'fs';

const goldPath = 'data/all_homologated_questions_gold.json';
const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
const existingGoldIds = new Set(gold.map(q => q.id));

const files = [
  'data/ginecologia_final_questions.json',
  'data/urologia_final_questions.json'
];

let added = 0;
for (const f of files) {
  const list = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const q of list) {
    if (q.provenance === 'oficial_uerj_cepuerj') {
      if (!existingGoldIds.has(q.id)) {
        gold.push({
          id: q.id,
          code: q.code,
          institution: q.institution,
          year: q.year,
          correct_answer: q.correct_answer,
          is_anulada: q.is_anulada,
          commentary: q.commentary,
          provenance: q.provenance,
          official_book: q.official_book,
          is_official: true
        });
        existingGoldIds.add(q.id);
        added++;
      }
    }
  }
}

fs.writeFileSync(goldPath, JSON.stringify(gold, null, 2), 'utf8');
console.log(`✨ Adicionadas ${added} questões homologadas da UERJ ao Manifesto de Ouro!`);
console.log(`📊 Total no Manifesto de Ouro: ${gold.length} questões.`);
