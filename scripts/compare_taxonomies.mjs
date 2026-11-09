import fs from 'fs';

const antigaStr = fs.readFileSync('data/hierarquia_antiga_clean.json', 'utf8').replace(/^\uFEFF/, '');
const novaStr = fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8').replace(/^\uFEFF/, '');

const antiga = JSON.parse(antigaStr);
const nova = JSON.parse(novaStr);

console.log('=== COMPARAÇÃO ESTATÍSTICA: HIERARQUIA ANTIGA vs NOVA (CANÔNICA 2.1) ===\n');

function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
}

// Normalizar nomes de especialidade (ex: Cirurgia -> Cirurgia Geral)
function normEsp(esp) {
  const n = normalize(esp);
  if (n === 'cirurgia' || n === 'cirurgia geral') return 'Cirurgia Geral';
  if (n.includes('clinica medica')) return 'Clínica Médica';
  if (n.includes('preventiva')) return 'Medicina Preventiva e Social';
  if (n.includes('pediatria')) return 'Pediatria';
  if (n.includes('obstetricia')) return 'Obstetrícia';
  if (n.includes('ginecologia')) return 'Ginecologia';
  return esp;
}

function getStats(dataObj) {
  const stats = {
    totalTemas: 0,
    totalFocos: 0,
    totalSubfocos: 0,
    totalSubSubs: 0,
    byEsp: {},
    temasSet: new Set(),
    focosSet: new Set(),
    subfocosSet: new Set(),
    temasWords: new Set(),
    focosWords: new Set(),
    subfocosWords: new Set()
  };

  dataObj.hierarquia_padrao.forEach(esp => {
    const eName = normEsp(esp.especialidade);
    if (!stats.byEsp[eName]) {
      stats.byEsp[eName] = { temas: 0, focos: 0, subfocos: 0, subsubs: 0 };
    }

    esp.temas.forEach(t => {
      stats.totalTemas++;
      stats.byEsp[eName].temas++;
      const tNorm = normalize(t.tema);
      stats.temasSet.add(tNorm);
      tNorm.split(' ').forEach(w => w.length > 3 && stats.temasWords.add(w));

      t.focos.forEach(f => {
        stats.totalFocos++;
        stats.byEsp[eName].focos++;
        const fNorm = normalize(f.foco);
        stats.focosSet.add(fNorm);
        fNorm.split(' ').forEach(w => w.length > 3 && stats.focosWords.add(w));

        f.subfocos.forEach(sf => {
          stats.totalSubfocos++;
          stats.byEsp[eName].subfocos++;
          const sfName = typeof sf === 'string' ? sf : sf.subfoco;
          const sfNorm = normalize(sfName);
          stats.subfocosSet.add(sfNorm);
          sfNorm.split(' ').forEach(w => w.length > 3 && stats.subfocosWords.add(w));

          if (typeof sf === 'object' && sf.sub_subfocos) {
            stats.totalSubSubs += sf.sub_subfocos.length;
            stats.byEsp[eName].subsubs += sf.sub_subfocos.length;
          }
        });
      });
    });
  });

  return stats;
}

const stAntiga = getStats(antiga);
const stNova = getStats(nova);

console.log('1. TABELA QUANTITATIVA GERAL:');
console.log('-----------------------------------------------------------------------------------------------------------------');
console.log('Métrica                        | Antiga (v2.0) | Nova Canônica (v2.1) | Variação (Delta) | Variação %');
console.log('-----------------------------------------------------------------------------------------------------------------');

function printRow(label, vOld, vNew) {
  const diff = vNew - vOld;
  const pct = ((diff / vOld) * 100).toFixed(1);
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const pctStr = diff >= 0 ? `+${pct}%` : `${pct}%`;
  console.log(`${label.padEnd(30, ' ')} | ${vOld.toString().padStart(13, ' ')} | ${vNew.toString().padStart(20, ' ')} | ${diffStr.padStart(16, ' ')} | ${pctStr.padStart(10, ' ')}`);
}

printRow('Total de Temas', stAntiga.totalTemas, stNova.totalTemas);
printRow('Total de Focos Clínicos', stAntiga.totalFocos, stNova.totalFocos);
printRow('Total de Subfocos', stAntiga.totalSubfocos, stNova.totalSubfocos);
printRow('Total de Sub-subfocos (5º N)', stAntiga.totalSubSubs, stNova.totalSubSubs);

console.log('\n2. COMPARATIVO POR ESPECIALIDADE:');
console.log('-----------------------------------------------------------------------------------------------------------------');
console.log('Especialidade                  | Temas (Ant -> Novo) | Focos (Ant -> Novo) | Subfocos (Ant -> Novo) | Sub-subs (Novo)');
console.log('-----------------------------------------------------------------------------------------------------------------');

for (const espName of Object.keys(stNova.byEsp)) {
  const o = stAntiga.byEsp[espName] || { temas: 0, focos: 0, subfocos: 0, subsubs: 0 };
  const n = stNova.byEsp[espName];
  console.log(`${espName.padEnd(30, ' ')} | ${o.temas.toString().padStart(2, ' ')} -> ${n.temas.toString().padEnd(2, ' ')} (${(n.temas - o.temas >= 0 ? '+' : '') + (n.temas - o.temas)})     | ${o.focos.toString().padStart(3, ' ')} -> ${n.focos.toString().padEnd(3, ' ')} (${(n.focos - o.focos >= 0 ? '+' : '') + (n.focos - o.focos)})   | ${o.subfocos.toString().padStart(4, ' ')} -> ${n.subfocos.toString().padEnd(4, ' ')} (${(n.subfocos - o.subfocos >= 0 ? '+' : '') + (n.subfocos - o.subfocos)})     | ${n.subsubs.toString().padStart(4, ' ')}`);
}

// 3. Similaridade e Sobreposição Semântica
console.log('\n3. ANÁLISE DE SIMILARIDADE E SOBREPOSIÇÃO:');
console.log('-----------------------------------------------------------------------------------------------------------------');

function jaccard(setA, setB) {
  let inter = 0;
  for (const item of setB) {
    if (setA.has(item)) inter++;
  }
  const union = new Set([...setA, ...setB]).size;
  return { inter, union, sim: (inter / union * 100).toFixed(1) };
}

const simTemas = jaccard(stAntiga.temasSet, stNova.temasSet);
const simFocos = jaccard(stAntiga.focosSet, stNova.focosSet);
const simSubfocos = jaccard(stAntiga.subfocosSet, stNova.subfocosSet);

const simTemasWords = jaccard(stAntiga.temasWords, stNova.temasWords);
const simFocosWords = jaccard(stAntiga.focosWords, stNova.focosWords);
const simSubfocosWords = jaccard(stAntiga.subfocosWords, stNova.subfocosWords);

console.log(`- TEMAS:`);
console.log(`  • Interseção exata de nomes normalizados: ${simTemas.inter} de ${stNova.temasSet.size} novos (${((simTemas.inter/stNova.temasSet.size)*100).toFixed(1)}%)`);
console.log(`  • Similaridade vocabular/conceitual (Keywords): ${simTemasWords.sim}% de sobreposição terminológica`);

console.log(`\n- FOCOS:`);
console.log(`  • Interseção exata de nomes normalizados: ${simFocos.inter} de ${stNova.focosSet.size} novos (${((simFocos.inter/stNova.focosSet.size)*100).toFixed(1)}%)`);
console.log(`  • Similaridade vocabular/conceitual (Keywords): ${simFocosWords.sim}% de sobreposição terminológica`);

console.log(`\n- SUBFOCOS:`);
console.log(`  • Interseção exata de nomes normalizados: ${simSubfocos.inter} de ${stNova.subfocosSet.size} novos (${((simSubfocos.inter/stNova.subfocosSet.size)*100).toFixed(1)}%)`);
console.log(`  • Similaridade vocabular/conceitual (Keywords): ${simSubfocosWords.sim}% de sobreposição terminológica`);
