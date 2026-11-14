import fs from 'fs';

const ranking = JSON.parse(fs.readFileSync('data/ranking_pendencias_atualizado.json', 'utf8'));
console.log('Total pendentes no ranking:', ranking.totalGeralPendentes);

console.log('Top 20 bancas/instituicoes no ranking:');
ranking.ranking.slice(0, 20).forEach((item, i) => {
  console.log(`${i + 1}. ${JSON.stringify(item)}`);
});
