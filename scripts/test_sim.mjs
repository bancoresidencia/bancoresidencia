export function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const s2 = str2.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;

  const w1 = s1.split(' ');
  const w2 = s2.split(' ');
  const set1 = new Set(w1);
  const set2 = new Set(w2);

  let intersection = 0;
  for (const w of set1) {
    if (set2.has(w)) intersection++;
  }
  const dice = (2 * intersection) / (set1.size + set2.size);
  return Math.round(dice * 100) / 100;
}

const sim1 = calculateSimilarity(
  'Além da triagem específica por meio do M-CHAT-R/F, quais os achados de anamnese que indicam investigação diagnóstica para transtorno de espectro autista?',
  '<p>Além da triagem específica por meio do M-CHAT-R/F, quais os achados de anamnese que indicam investigação diagnóstica para transtorno de espectro autista (TEA):</p>'
);
console.log('Statement Similarity:', sim1);

const sim2 = calculateSimilarity('Irmãos ou pais com TEA.', 'Irmãos ou pais com TEA.');
console.log('Option Similarity:', sim2);
