import fs from 'fs';

const list = JSON.parse(fs.readFileSync('data/watermarked_questions_list.json', 'utf8'));

console.log(`Inspecting first 10 watermarked questions:`);
for (let i = 0; i < 10; i++) {
  const q = list[i];
  console.log(`\n[${i + 1}] ID: ${q.id} | ${q.institution} (${q.year})`);
  console.log(`Statement snippet: ${q.statement ? q.statement.substring(0, 160).replace(/\n/g, ' ') : ''}...`);
  console.log(`Images: ${JSON.stringify(q.images)}`);
}
