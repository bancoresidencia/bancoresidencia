import fs from 'fs';

const antigaStr = fs.readFileSync('data/hierarquia_antiga_clean.json', 'utf8').replace(/^\uFEFF/, '');
const novaStr = fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8').replace(/^\uFEFF/, '');

const antiga = JSON.parse(antigaStr);
const nova = JSON.parse(novaStr);

console.log('=== INVESTIGAÇÃO: POR QUE A QUANTIDADE DE FOCOS CAIU DE 701 PARA 435? ===\n');

// 1. Coletar todos os focos antigos e novos
const focosAntigos = [];
antiga.hierarquia_padrao.forEach(esp => {
  esp.temas.forEach(t => {
    t.focos.forEach(f => {
      focosAntigos.push({
        esp: esp.especialidade,
        tema: t.tema,
        foco: f.foco,
        subfocosCount: f.subfocos.length
      });
    });
  });
});

const focosNovos = [];
const subfocosNovos = [];
nova.hierarquia_padrao.forEach(esp => {
  esp.temas.forEach(t => {
    t.focos.forEach(f => {
      focosNovos.push({
        esp: esp.especialidade,
        tema: t.tema,
        foco: f.foco
      });
      f.subfocos.forEach(s => {
        subfocosNovos.push({
          esp: esp.especialidade,
          tema: t.tema,
          foco: f.foco,
          subfoco: s.subfoco
        });
      });
    });
  });
});

console.log(`Total Focos Antigos: ${focosAntigos.length}`);
console.log(`Total Focos Novos: ${focosNovos.length}`);
console.log(`Diferença: ${focosNovos.length - focosAntigos.length} focos (-${((focosAntigos.length - focosNovos.length)/focosAntigos.length*100).toFixed(1)}%)\n`);

function norm(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
}

// 2. Classificar o destino dos 701 focos antigos:
// A) Foco preservado diretamente (ou com pequenas variações ortográficas)
// B) Foco rebaixado para Subfoco na nova árvore
// C) Foco fundido / consolidado (parte de um foco maior)
// D) Foco lixeira / genérico extinto (ex: Miscelânea, Geral, Procedimentos Gerais)

const rebaixadosParaSubfoco = [];
const lixeirasExtintas = [];
const focosFragmentadosFundidos = [];

const novosFocosNorm = new Set(focosNovos.map(f => norm(f.foco)));
const novosSubfocosNorm = new Set(subfocosNovos.map(s => norm(s.subfoco)));

focosAntigos.forEach(fa => {
  const fNorm = norm(fa.foco);
  
  if (fNorm.includes('miscelanea') || fNorm.includes('geral') || fNorm === 'clinica') {
    lixeirasExtintas.push(fa);
  } else if (novosSubfocosNorm.has(fNorm)) {
    rebaixadosParaSubfoco.push(fa);
  } else {
    // Checar se o foco antigo virou substring de um subfoco novo
    const matchSub = subfocosNovos.find(s => norm(s.subfoco).includes(fNorm) || fNorm.includes(norm(s.subfoco)));
    if (matchSub) {
      rebaixadosParaSubfoco.push({ ...fa, subfocoDestino: matchSub.subfoco, focoPaiNovo: matchSub.foco });
    } else {
      // Checar se virou substring de um foco novo (fusão)
      const matchFoco = focosNovos.find(fn => norm(fn.foco).includes(fNorm) || fNorm.includes(norm(fn.foco)));
      if (matchFoco) {
        focosFragmentadosFundidos.push({ ...fa, focoDestino: matchFoco.foco });
      }
    }
  }
});

console.log('--- 1. FOCOS ANTIGOS QUE ERAM LIXEIRAS / GENÉRICOS (EXTINTOS):', lixeirasExtintas.length);
lixeirasExtintas.slice(0, 10).forEach(l => console.log(`   - [${l.esp} > ${l.tema}]: "${l.foco}"`));

console.log('\n--- 2. FOCOS ANTIGOS QUE FORAM REBAIXADOS PARA SUBFOCO (HIERARQUIA CORRETA):', rebaixadosParaSubfoco.length);
rebaixadosParaSubfoco.slice(0, 10).forEach(r => console.log(`   - Foco Antigo: "${r.foco}"\n     -> Virou Subfoco: "${r.subfocoDestino || r.foco}" (sob o Foco Canônico: "${r.focoPaiNovo || '...'}")`));

console.log('\n--- 3. FOCOS ANTIGOS HIPERFRAGMENTADOS QUE FORAM FUNDIDOS EM ENTIDADES CLÍNICAS:');
focosFragmentadosFundidos.slice(0, 10).forEach(ff => console.log(`   - Foco Fatiado Antigo: "${ff.foco}"\n     -> Consolidado no Foco Canônico: "${ff.focoDestino}"`));
