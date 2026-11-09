import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

const db = new DatabaseSync('data/questoes_132k.db');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

const rawTreeData = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

// Build Foco Map
const focoMap = new Map();
const rawList = Array.isArray(rawTreeData) ? rawTreeData : (rawTreeData.hierarquia_padrao || []);
for (const espNode of rawList) {
  for (const temaNode of (espNode.temas || [])) {
    for (const focoNode of (temaNode.focos || [])) {
      let subfocosList = [];
      if (Array.isArray(focoNode.subfocos)) {
        for (const s of focoNode.subfocos) {
          const name = typeof s === 'string' ? s : (s.subfoco || s.nome);
          if (name && !name.includes(': Diagnóstico e Conduta')) subfocosList.push(name);
        }
      }
      focoMap.set(`${espNode.especialidade}|||${focoNode.foco}`.toLowerCase().trim(), {
        especialidade: espNode.especialidade,
        tema: temaNode.tema,
        foco: focoNode.foco,
        subfocosList
      });
    }
  }
}

const rows = db.prepare(`
  SELECT id, especialidade, novo_foco, antigo_foco, foco, antigo_subfoco, statement, options, correct_answer 
  FROM questions 
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA' 
  LIMIT 5
`).all();

for (const q of rows) {
  const f = q.novo_foco || q.antigo_foco || q.foco;
  const canonical = focoMap.get(`${q.especialidade}|||${f}`.toLowerCase().trim());
  if (!canonical || canonical.subfocosList.length === 0) continue;

  let opts = [];
  try { opts = JSON.parse(q.options || '[]'); } catch(_) {}
  const correctOpt = opts.find(o => o.letter === q.correct_answer);
  const correctText = correctOpt ? `Gabarito Oficial (${correctOpt.letter}): ${correctOpt.text}. ` : '';

  const statementBrief = (q.statement || '').replace(/\s+/g, ' ').slice(0, 350);
  const antigoSubfocoText = q.antigo_subfoco ? `Tema prévio: ${q.antigo_subfoco}. ` : '';
  const qPayload = `${antigoSubfocoText}Foco: ${canonical.foco}. Caso clínico: ${statementBrief}. ${correctText}`;

  const qEmb = await extractor(qPayload, { pooling: 'mean', normalize: true });

  const scores = [];
  for (const sub of canonical.subfocosList) {
    const sProfile = `Especialidade: ${canonical.especialidade}. Foco: ${canonical.foco}. Subfoco: ${sub}.`;
    const sEmb = await extractor(sProfile, { pooling: 'mean', normalize: true });
    scores.push({ sub, score: cos_sim(qEmb.data, sEmb.data) });
  }
  scores.sort((a, b) => b.score - a.score);

  console.log(`Q#${q.id.slice(0, 8)} | Foco: ${canonical.foco}`);
  console.log(`  Top 1: '${scores[0]?.sub}' (${scores[0]?.score.toFixed(4)})`);
  console.log(`  Top 2: '${scores[1]?.sub}' (${scores[1]?.score.toFixed(4)}) | Margem: ${(scores[0]?.score - scores[1]?.score).toFixed(4)}`);
  console.log('');
}

db.close();

