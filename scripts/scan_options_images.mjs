import fs from 'fs';
import path from 'path';

const files = [
  'data/obstetricia_final_questions.json',
  'data/cirurgia_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/ginecologia_final_questions.json'
];

// Imagens locais existentes
const localImages = new Set();
function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isFile()) {
      localImages.add(path.basename(f).toLowerCase());
    }
  }
}
scanDir('public/images');
scanDir('data/images');

console.log('Total de imagens locais indexadas:', localImages.size);

const questionsWithImagesInOptions = [];
const allOptionImageUrls = new Set();
let totalQuestionsChecked = 0;
const perSpecialty = {};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  const espName = path.basename(file).replace('_final_questions.json', '');
  perSpecialty[espName] = { total: list.length, withImagesInOptions: 0, totalImages: 0 };

  for (const q of list) {
    totalQuestionsChecked++;
    if (!Array.isArray(q.options)) continue;

    let hasImgInOption = false;
    const optionImgs = [];

    for (const opt of q.options) {
      const text = opt.text || '';
      
      // Procura URLs HTTP/HTTPS
      const matches = text.match(/https?:\/\/[^\s"'<)]+/gi) || [];
      const imgTags = text.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
      const mdImgs = text.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/gi) || [];

      const urlsFound = [];
      for (const m of matches) {
        if (/\.(png|jpe?g|webp|gif|svg)/i.test(m) || /medevo|cloudfront|s3|storage|supabase/i.test(m)) {
          urlsFound.push(m.replace(/[.,;)]+$/, ''));
        }
      }
      for (const t of imgTags) {
        const src = t.match(/src=["']([^"']+)["']/i)?.[1];
        if (src) urlsFound.push(src);
      }
      for (const md of mdImgs) {
        const src = md.match(/\((https?:\/\/[^)]+)\)/i)?.[1];
        if (src) urlsFound.push(src);
      }

      if (urlsFound.length > 0) {
        hasImgInOption = true;
        urlsFound.forEach(u => {
          allOptionImageUrls.add(u);
          optionImgs.push({ letter: opt.letter, url: u, rawText: text });
        });
      }
    }

    if (hasImgInOption) {
      perSpecialty[espName].withImagesInOptions++;
      perSpecialty[espName].totalImages += optionImgs.length;
      questionsWithImagesInOptions.push({
        id: q.id,
        code: q.code,
        specialty: q.especialidade || q.specialty,
        tema: q.tema,
        optionsWithImages: optionImgs
      });
    }
  }
}

console.log('Total de questões verificadas:', totalQuestionsChecked);
console.log('Questões com imagens nas alternativas:', questionsWithImagesInOptions.length);
console.log('Total de URLs de imagens únicas nas alternativas:', allOptionImageUrls.size);
console.log('Estatísticas por especialidade:', JSON.stringify(perSpecialty, null, 2));

let localFound = 0;
let missingLocally = 0;
const missingUrls = [];

for (const u of allOptionImageUrls) {
  const filename = path.basename(u.split('?')[0]).toLowerCase();
  if (localImages.has(filename)) {
    localFound++;
  } else {
    missingLocally++;
    missingUrls.push(u);
  }
}

console.log('Imagens que JÁ existem localmente:', localFound);
console.log('Imagens FALTANDO localmente:', missingLocally);

fs.writeFileSync('scripts/options_images_report.json', JSON.stringify({
  totalQuestions: questionsWithImagesInOptions.length,
  totalUniqueImages: allOptionImageUrls.size,
  localFound,
  missingLocally,
  perSpecialty,
  samples: questionsWithImagesInOptions.slice(0, 15),
  missingUrlsSample: missingUrls.slice(0, 30)
}, null, 2));

console.log('Relatório salvo em scripts/options_images_report.json');
