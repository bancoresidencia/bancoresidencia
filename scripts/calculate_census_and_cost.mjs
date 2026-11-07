import fs from 'fs';
import path from 'path';

console.log('Calculating census of homologated questions without comments across all specialties...');

const specialtyFiles = [
  { spec: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' },
  { spec: 'Cirurgia Geral', file: 'data/cirurgia_geral_final_questions.json' },
  { spec: 'Pediatria', file: 'data/pediatria_final_questions.json' },
  { spec: 'Ginecologia e Obstetrícia', file: 'data/ginecologia_obstetricia_final_questions.json' },
  { spec: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' }
];

// Check all files in data matching *_final_questions.json
const allDataFiles = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json') && !f.includes('.bak'));

const stats = {
  totalQuestions: 0,
  homologatedTotal: 0,
  homologatedWithComments: 0,
  homologatedWithoutComments: 0,
  homologatedWithoutCommentsWithImages: 0,
  bySpecialty: {}
};

for (const f of allDataFiles) {
  const filePath = path.join('data', f);
  try {
    const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const specName = f.replace('_final_questions.json', '');
    
    let specHomologated = 0;
    let specWithoutComments = 0;
    let specWithoutCommentsImages = 0;

    for (const q of list) {
      stats.totalQuestions++;
      const ans = (q.correct_answer || q.correctAnswer || '').toUpperCase().trim();
      const isAnulada = q.is_anulada || q.isAnulada || ans === 'ANULADA' || ans === 'NULA';
      const hasOptions = Array.isArray(q.options) && q.options.length >= 2;
      const isHomologated = ['A', 'B', 'C', 'D', 'E'].includes(ans) && !isAnulada && hasOptions;

      if (isHomologated) {
        stats.homologatedTotal++;
        specHomologated++;

        const hasCom = !!(q.commentary && q.commentary.trim().length > 100);
        if (hasCom) {
          stats.homologatedWithComments++;
        } else {
          stats.homologatedWithoutComments++;
          specWithoutComments++;

          const hasImg = (q.images && q.images.length > 0) || (q.image_urls && q.image_urls.length > 0) || !!q.imageUrl;
          if (hasImg) {
            stats.homologatedWithoutCommentsWithImages++;
            specWithoutCommentsImages++;
          }
        }
      }
    }

    stats.bySpecialty[specName] = {
      total: list.length,
      homologated: specHomologated,
      withoutComments: specWithoutComments,
      withoutCommentsWithImages: specWithoutCommentsImages
    };
  } catch (err) {
    console.error(`Error reading ${f}:`, err.message);
  }
}

console.log(JSON.stringify(stats, null, 2));

fs.writeFileSync('C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/census_stats.json', JSON.stringify(stats, null, 2));

