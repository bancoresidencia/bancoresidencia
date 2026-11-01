import fs from 'fs';

const textHits = JSON.parse(fs.readFileSync('scripts/medevo_supabase_text_hits.json', 'utf8'));
const imageUrlQuestions = JSON.parse(fs.readFileSync('scripts/medevo_image_url_questions.json', 'utf8'));

// Merge questions into a unified Map
const unified = new Map();

// 1. Add text hits
textHits.forEach(q => {
  unified.set(q.id, {
    id: q.id,
    code: q.code,
    banca: q.banca,
    year: q.year,
    hasTextHit: true,
    textHits: q.hits,
    hasImageHit: false,
    images: []
  });
});

// 2. Add image hits
imageUrlQuestions.forEach(q => {
  if (unified.has(q.questionId)) {
    const existing = unified.get(q.questionId);
    existing.hasImageHit = true;
    existing.images = q.images;
  } else {
    unified.set(q.questionId, {
      id: q.questionId,
      code: q.code,
      banca: q.banca,
      year: q.year,
      hasTextHit: false,
      textHits: [],
      hasImageHit: true,
      images: q.images
    });
  }
});

const allQuestions = Array.from(unified.values());

// Statistics
const totalUniqueQuestions = allQuestions.length;
const totalWithTextOnly = allQuestions.filter(q => q.hasTextHit && !q.hasImageHit).length;
const totalWithImageOnly = allQuestions.filter(q => !q.hasTextHit && q.hasImageHit).length;
const totalWithBoth = allQuestions.filter(q => q.hasTextHit && q.hasImageHit).length;

// Group by Banca
const byBanca = {};
allQuestions.forEach(q => {
  const b = q.banca || 'Desconhecida';
  byBanca[b] = (byBanca[b] || 0) + 1;
});

// Sort bancas descending
const sortedBancas = Object.entries(byBanca).sort((a, b) => b[1] - a[1]);

console.log('========================================================');
console.log('📊 CONSOLIDAÇÃO DA AUDITORIA MEDEVO (SUPABASE 132k)');
console.log('========================================================');
console.log(`Total de questões únicas afetadas: ${totalUniqueQuestions}`);
console.log(` - Com menção textual no enunciado/alternativas: ${textHits.length}`);
console.log(` - Com URLs de imagens / marca d'água MedEvo: ${imageUrlQuestions.length}`);
console.log(` - Com AMBOS (texto + imagem): ${totalWithBoth}`);
console.log(` - Somente texto: ${totalWithTextOnly}`);
console.log(` - Somente imagens/marca d'água: ${totalWithImageOnly}`);
console.log('\nDistribuição por Banca (Top 10):');
sortedBancas.slice(0, 10).forEach(([banca, count]) => {
  console.log(`  - ${banca}: ${count} questões`);
});

fs.writeFileSync('scripts/medevo_consolidated_report.json', JSON.stringify({
  summary: {
    totalAudited: 132965,
    totalAffected: totalUniqueQuestions,
    textHitsCount: textHits.length,
    imageHitsCount: imageUrlQuestions.length,
    bothCount: totalWithBoth,
    bancaBreakdown: byBanca
  },
  questions: allQuestions
}, null, 2));

console.log('\nRelatório salvo em scripts/medevo_consolidated_report.json');
