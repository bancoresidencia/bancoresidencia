import fs from 'fs';

const imgs = JSON.parse(fs.readFileSync('scripts/all_question_images.json', 'utf8'));
const medevoImgs = imgs.filter(i => i.url.toLowerCase().includes('medevo'));
console.log('Unique medevo image URLs:', medevoImgs.length);

const questionMap = new Map();
medevoImgs.forEach(img => {
  img.references.forEach(ref => {
    if (!questionMap.has(ref.questionId)) {
      questionMap.set(ref.questionId, {
        questionId: ref.questionId,
        code: ref.code,
        banca: ref.banca,
        year: ref.year,
        images: []
      });
    }
    questionMap.get(ref.questionId).images.push({ url: img.url, field: ref.field });
  });
});

console.log('Total questions that reference medevo image URLs:', questionMap.size);

const list = Array.from(questionMap.values());
list.slice(0, 15).forEach((item, idx) => {
  console.log(`[${idx+1}] Q: ${item.code || item.questionId} | Banca: ${item.banca} (${item.year}) | Imgs: ${item.images.length} | Campo: ${item.images[0].field}`);
  console.log(`    URL: ${item.images[0].url}`);
});

fs.writeFileSync('scripts/medevo_image_url_questions.json', JSON.stringify(list, null, 2));
