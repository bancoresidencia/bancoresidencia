import fs from 'fs';
import path from 'path';

// 1. Extração segura da taxonomia TypeScript dos 6 arquivos canônicos
function extractHierarchy(tsPath) {
  const content = fs.readFileSync(tsPath, 'utf-8');
  const eqIdx = content.indexOf('=');
  const jsonStart = content.indexOf('{', eqIdx);
  const jsonEnd = content.lastIndexOf(';');
  let jsonStr = content.slice(jsonStart, jsonEnd > jsonStart ? jsonEnd : undefined).trim();
  if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
  return eval('(' + jsonStr + ')');
}

console.log('🩺 Carregando hierarquias canônicas das 6 especialidades...');
const hierarchies = {
  'Clínica Médica': extractHierarchy('src/data/clinicaMedicaData.ts'),
  'Cirurgia Geral': extractHierarchy('src/data/cirurgiaData.ts'),
  'Pediatria': extractHierarchy('src/data/pediatriaData.ts'),
  'Ginecologia': extractHierarchy('src/data/ginecologiaData.ts'),
  'Obstetrícia': extractHierarchy('src/data/obstetriciaData.ts'),
  'Medicina Preventiva e Social': extractHierarchy('src/data/preventivaData.ts'),
};

// 2. Carrega base de questões com imagens locais WebP do AjudaMédico
console.log('🖼️ Carregando banco de imagens clínicas verificadas (AjudaMédico)...');
const ajudaData = JSON.parse(fs.readFileSync('data/knowledge/ajudamedico_consolidado_9223.json', 'utf-8'));
const questoesComImg = ajudaData.questoes.filter(q => q.images && q.images.length > 0);

// Cria índice de busca de imagens por tags normalizadas
const imgIndexByTag = new Map();
questoesComImg.forEach(q => {
  if (q.tags) {
    q.tags.forEach(t => {
      const norm = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!imgIndexByTag.has(norm)) {
        imgIndexByTag.set(norm, []);
      }
      imgIndexByTag.get(norm).push(q);
    });
  }
});

console.log(`✅ ${questoesComImg.length} imagens verificadas indexadas em ${imgIndexByTag.size} tags.`);

// 3. Regras de distribuição das 385 cartas
const TARGET_COUNTS = {
  'Clínica Médica': 120,
  'Cirurgia Geral': 75,
  'Pediatria': 65,
  'Ginecologia': 45,
  'Obstetrícia': 45,
  'Medicina Preventiva e Social': 35
};

console.log('🎯 Alvos de distribuição dos 385 cards:', TARGET_COUNTS);
