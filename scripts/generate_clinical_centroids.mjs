import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { pipeline } from '@xenova/transformers';

const SOURCE_DB_PATH = path.resolve('data/supabase_tables.db');
const TREE_PATH = path.resolve('data/catalogo_arvore_canonica_completa.json');
const OUTPUT_CENTROIDS_PATH = path.resolve('data/cache_canonical_tree_clinical_centroids.json');

console.log('========================================================================');
console.log('⚡ GERAÇÃO DE CENTRÓIDES CLÍNICOS REAIS (130K QUESTÕES GOLDEN)');
console.log(`📖 Árvore: ${TREE_PATH}`);
console.log(`💾 Base Golden: ${SOURCE_DB_PATH}`);
console.log(`🎯 Destino: ${OUTPUT_CENTROIDS_PATH}`);
console.log('========================================================================\n');

const db = new DatabaseSync(SOURCE_DB_PATH, { readOnly: true });
const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

const canonicalFocos = [];
for (const esp of rawTree.hierarquia_padrao) {
  for (const t of esp.temas) {
    for (const f of t.focos) {
      canonicalFocos.push({
        especialidade: esp.especialidade,
        tema: t.tema,
        foco: f.foco,
        subfocos: f.subfocos.map(s => typeof s === 'string' ? s : s.subfoco)
      });
    }
  }
}

console.log(`Total de Focos Canônicos: ${canonicalFocos.length}`);

console.log('📡 Carregando e agrupando as 130.024 questões em memória...');
const t0 = Date.now();
const rows = db.prepare(`
  SELECT especialidade, foco, statement, options, correct_answer
  FROM questions
  WHERE foco IS NOT NULL AND foco != 'Geral'
`).all();

const questionsByFoco = new Map();
const letters = ['A', 'B', 'C', 'D', 'E'];

for (const r of rows) {
  const fNorm = r.foco.trim().toLowerCase();
  if (!questionsByFoco.has(fNorm)) {
    questionsByFoco.set(fNorm, []);
  }
  const list = questionsByFoco.get(fNorm);
  if (list.length < 5) {
    let correctText = '';
    try {
      const opts = typeof r.options === 'string' ? JSON.parse(r.options) : (r.options || []);
      for (let k = 0; k < opts.length; k++) {
        const o = opts[k];
        const letter = o.letter || (typeof o.index === 'number' ? letters[o.index] : null);
        if (letter && letter === r.correct_answer) {
          correctText = o.text || '';
          break;
        }
      }
    } catch {}

    const snippet = `${(r.statement || '').slice(0, 180)} Resposta: ${correctText.slice(0, 80)}`;
    list.push(snippet);
  }
}

console.log(`✅ Agrupamento concluído em ${((Date.now() - t0) / 1000).toFixed(2)}s.`);

// Montar os textos clínicos de cada Foco
const focoClinicalTexts = [];
for (const f of canonicalFocos) {
  const fNorm = f.foco.trim().toLowerCase();
  const samples = questionsByFoco.get(fNorm) || [];

  let clinicalBody = '';
  if (samples.length > 0) {
    clinicalBody = samples.join(' | ');
  } else {
    // Fallback: busca por substring nos focos conhecidos
    for (const [k, list] of questionsByFoco.entries()) {
      if (k.includes(fNorm.slice(0, 15)) || fNorm.includes(k.slice(0, 15))) {
        clinicalBody = list.slice(0, 3).join(' | ');
        break;
      }
    }
  }

  const finalText = clinicalBody.length > 0
    ? `${f.especialidade}. ${f.tema}. ${f.foco}. Casos reais: ${clinicalBody.slice(0, 700)}`
    : `${f.especialidade} ${f.tema} ${f.foco}. Subfocos: ${f.subfocos.join(', ')}.`;

  focoClinicalTexts.push({
    key: `${f.especialidade}|||${f.foco}`,
    text: finalText
  });
}

console.log(`✅ Textos clínicos consolidados para os 435 Focos.\n`);

console.log('⏳ Carregando modelo Transformers...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
console.log('✅ Transformers pronto!\n');

console.log('🚀 Vetorizando os 435 Centróides Clínicos Reais...');
const t1 = Date.now();
const centroidsObj = {};
const CHUNK_SIZE = 48;

for (let i = 0; i < focoClinicalTexts.length; i += CHUNK_SIZE) {
  const chunk = focoClinicalTexts.slice(i, i + CHUNK_SIZE);
  const out = await extractor(chunk.map(c => c.text), { pooling: 'mean', normalize: true });
  for (let k = 0; k < chunk.length; k++) {
    const entry = chunk[k];
    const vec = Array.from(out.data.subarray(k * 384, (k + 1) * 384));
    centroidsObj[entry.key] = vec;
  }
  process.stdout.write(`  Centróides: ${Math.min(i + CHUNK_SIZE, focoClinicalTexts.length)} / ${focoClinicalTexts.length}\r`);
}

const elapsed = ((Date.now() - t1) / 1000).toFixed(2);
console.log(`\n✅ 435 Centróides Clínicos Reais gerados em ${elapsed}s!\n`);

const originalVectors = JSON.parse(fs.readFileSync(path.resolve('data/cache_canonical_tree_vectors.json'), 'utf8'));

fs.writeFileSync(OUTPUT_CENTROIDS_PATH, JSON.stringify({
  focos: centroidsObj,
  subfocos: originalVectors.subfocos
}), 'utf8');

const sizeMb = (fs.statSync(OUTPUT_CENTROIDS_PATH).size / (1024 * 1024)).toFixed(2);
console.log(`🎉 Sucesso! Cache de Centróides Clínicos salvo em: ${OUTPUT_CENTROIDS_PATH} (${sizeMb} MB)`);
