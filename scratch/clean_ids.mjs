import fs from 'fs';

const raw = fs.readFileSync('data/ginecologia_all_ids.json', 'utf8');
let parsed = JSON.parse(raw);
if (typeof parsed === 'string') {
  parsed = JSON.parse(parsed);
}

console.log('Total Count in payload:', parsed.totalCount);
console.log('Questions array length:', parsed.questions?.length);

const unique = new Map();
parsed.questions.forEach(q => {
  if (q && q.id) unique.set(q.id, q);
});

console.log('Unique questions:', unique.size);

fs.writeFileSync('data/ginecologia_ids_list.json', JSON.stringify({
  total: unique.size,
  ids: Array.from(unique.keys()),
  questionsMeta: Array.from(unique.values())
}, null, 2));

console.log('Saved data/ginecologia_ids_list.json successfully!');
