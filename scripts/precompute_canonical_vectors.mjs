import fs from 'fs';
import path from 'path';
import { pipeline } from '@xenova/transformers';

const VECTOR_CACHE_FILE = path.resolve('data/cache_canonical_tree_vectors.json');
const TREE_PATH = fs.existsSync('data/catalogo_arvore_canonica_completa.json')
  ? path.resolve('data/catalogo_arvore_canonica_completa.json')
  : path.resolve('src/data/hierarquiaCompletaFiltros.json');

console.log('========================================================================');
console.log('⚡ PRÉ-COMPUTAÇÃO DE VETORES CANÔNICOS (@xenova/transformers)');
console.log(`📖 Árvore: ${TREE_PATH}`);
console.log(`💾 Destino do Cache: ${VECTOR_CACHE_FILE}`);
console.log('========================================================================\n');

const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const allCanonicalFocos = [];

for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const focoName = f.foco;
      const subfocos = [];
      for (const s of (f.subfocos || [])) {
        const subName = typeof s === 'string' ? s : s.subfoco;
        if (subName) subfocos.push(subName);
      }
      allCanonicalFocos.push({
        especialidade: espName,
        tema: t.tema,
        foco: focoName,
        subfocos
      });
    }
  }
}

console.log(`Total de Focos Canônicos a vetorizar: ${allCanonicalFocos.length}`);
let totalSubfocos = 0;
for (const f of allCanonicalFocos) totalSubfocos += f.subfocos.length;
console.log(`Total de Subfocos Canônicos a vetorizar: ${totalSubfocos}\n`);

console.log('⏳ Carregando modelo Xenova/paraphrase-multilingual-MiniLM-L12-v2...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
console.log('✅ Modelo carregado com sucesso!\n');

const focosObj = {};
const subfocosObj = {};

console.log('🚀 Vetorizando Focos...');
const focoTexts = allCanonicalFocos.map(f => `${f.especialidade} ${f.tema} ${f.foco}. Subfocos: ${f.subfocos.join(', ')}.`);
const CHUNK_SIZE = 64;

for (let i = 0; i < focoTexts.length; i += CHUNK_SIZE) {
  const chunk = focoTexts.slice(i, i + CHUNK_SIZE);
  const out = await extractor(chunk, { pooling: 'mean', normalize: true });
  for (let k = 0; k < chunk.length; k++) {
    const f = allCanonicalFocos[i + k];
    const vec = Array.from(out.data.subarray(k * 384, (k + 1) * 384));
    focosObj[`${f.especialidade}|||${f.foco}`] = vec;
  }
  process.stdout.write(`  Focos: ${Math.min(i + CHUNK_SIZE, focoTexts.length)} / ${focoTexts.length}\r`);
}
console.log(`\n✅ ${Object.keys(focosObj).length} Focos vetorizados!\n`);

console.log('🚀 Vetorizando Subfocos...');
const subfocoEntries = [];
for (const f of allCanonicalFocos) {
  for (const sub of f.subfocos) {
    subfocoEntries.push({
      key: `${f.especialidade}|||${f.foco}|||${sub}`,
      text: `${f.especialidade} ${f.foco} ${sub}. Aspectos clínicos e conduta em ${sub}.`
    });
  }
}

for (let i = 0; i < subfocoEntries.length; i += CHUNK_SIZE) {
  const chunk = subfocoEntries.slice(i, i + CHUNK_SIZE);
  const out = await extractor(chunk.map(c => c.text), { pooling: 'mean', normalize: true });
  for (let k = 0; k < chunk.length; k++) {
    const entry = chunk[k];
    const vec = Array.from(out.data.subarray(k * 384, (k + 1) * 384));
    subfocosObj[entry.key] = vec;
  }
  process.stdout.write(`  Subfocos: ${Math.min(i + CHUNK_SIZE, subfocoEntries.length)} / ${subfocoEntries.length}\r`);
}
console.log(`\n✅ ${Object.keys(subfocosObj).length} Subfocos vetorizados!\n`);

fs.writeFileSync(VECTOR_CACHE_FILE, JSON.stringify({ focos: focosObj, subfocos: subfocosObj }), 'utf8');
console.log(`🎉 Sucesso! Cache salvo em: ${VECTOR_CACHE_FILE} (${(fs.statSync(VECTOR_CACHE_FILE).size / (1024 * 1024)).toFixed(2)} MB)`);
