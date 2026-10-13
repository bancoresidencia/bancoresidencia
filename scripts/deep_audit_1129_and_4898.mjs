import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();

// 1. Analisar as 1.129 questões pendentes do MEDCURSO
const baseExtracao = path.join(BASE_DIR, 'data', 'knowledge', 'extracao_de_questoes');

let total1129 = 0;
let pendentesNaPlataforma = 0;
let pendentesIneditas = 0;
const bancasPendentes = {};

for (const spec of fs.readdirSync(baseExtracao)) {
  const specDir = path.join(baseExtracao, spec);
  if (!fs.statSync(specDir).isDirectory()) continue;
  for (const f of fs.readdirSync(specDir)) {
    if (!f.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8'));
    (data.questoes || []).forEach(q => {
      // Questões que estavam sem gabarito
      if (!q.gabarito || !q.gabarito.trim()) {
        total1129++;
        if (q.presenteNaPlataforma) {
          pendentesNaPlataforma++;
        } else {
          pendentesIneditas++;
        }
        const b = q.banca || 'Não identificada';
        bancasPendentes[b] = (bancasPendentes[b] || 0) + 1;
      }
    });
  }
}

console.log('=== AUDITORIA DAS 1.129 QUESTÕES PENDENTES ===');
console.log(`Total de questões pendentes de gabarito : ${total1129}`);
console.log(` • Já existem na plataforma (possíveis de atualizar): ${pendentesNaPlataforma}`);
console.log(` • São inéditas (não existem no banco da plataforma): ${pendentesIneditas}`);
console.log('\nTop Bancas das questões pendentes:');
Object.entries(bancasPendentes).sort((a,b) => b[1] - a[1]).slice(0, 10).forEach(([b, count]) => {
  console.log(` • ${b.padEnd(25)}: ${count}`);
});

// 2. Analisar o universo das 29.931 apostilas e os ~4.898
const gabManifestPath = path.join(BASE_DIR, 'data', 'gabarito_das_questoes_manifest.json');
const gabManifest = JSON.parse(fs.readFileSync(gabManifestPath, 'utf8'));

console.log('\n=== AUDITORIA DO UNIVERSO DE APOSTILAS (MEDCURSO) ===');
console.log(`Total de questões contadas nos 337 livros: ${gabManifest.totalUniqueQuestions.toLocaleString('pt-BR')}`);
