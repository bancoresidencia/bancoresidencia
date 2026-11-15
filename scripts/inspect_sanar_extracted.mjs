import fs from 'fs';

const d = JSON.parse(fs.readFileSync('data/sanar_extracted_data.json', 'utf8'));
console.log('Institution:', d.institution);
console.log('Year:', d.year);
console.log('Alternatives:');
for (const alt of d.alternatives || []) {
  console.log(`  Index ${alt.index} (${String.fromCharCode(65 + alt.index)}): [correct: ${alt.correct}] ${alt.text}`);
}
console.log('Comment text:', d.comment_text ? d.comment_text.slice(0, 150) : null);
