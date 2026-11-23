import fs from 'fs';

async function main() {
  const res = await fetch('http://localhost:3336/api/questions?filter=broken_images&limit=500&page=1');
  const data = await res.json();
  console.log('Total broken returned:', data.total);
  console.log('Questions length:', data.questions.length);

  fs.writeFileSync('data/broken_questions_list.json', JSON.stringify(data.questions, null, 2), 'utf8');

  // Summary by banca & year
  const counts = {};
  for (const q of data.questions) {
    const k = `${q.institution || q.banca || 'SEM_BANCA'} ${q.year || 'SEM_ANO'}`;
    counts[k] = (counts[k] || 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  console.log('\nTop 25 bancas/anos com imagem quebrada:');
  console.log(sorted.slice(0, 25));
}

main().catch(console.error);
