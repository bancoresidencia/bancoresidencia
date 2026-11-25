import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim(); if (!t || t.startsWith('#')) return;
  const [k, ...v] = t.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log('=== 1. CLASSIFICAÇÃO DETALHADA DOS COMENTÁRIOS NO SQLITE (SEM "Take-Home") ===');
const rows = db.prepare(`
  SELECT id, code, modalidade, especialidade, commentary, options
  FROM questions_curated_staging
  WHERE commentary IS NOT NULL
    AND length(trim(commentary)) > 0
    AND lower(commentary) NOT LIKE '%take-home%'
`).all();

const clusters = {
  // Padrão-ouro / IA nossa sem a grafia exata Take-Home (PRESERVAR!)
  ia_take_home_sem_hifen: [],
  ia_estrutura_ouro_sintese_armadilha_perola: [],
  ia_options_explicadas_no_json: [],
  ia_alternativas_bold_ouro: [],
  // Legados reais / Placeholders (ALVOS DE LIMPEZA!)
  json_bruto_terceiros: [],
  placeholder_gabarito_oficial: [],
  padrao_resposta_dissertativa_banca: [],
  texto_terceiros_ola_aluno_estrategia_sanar: [],
  outros_textos_nao_classificados: []
};

for (const r of rows) {
  const c = (r.commentary || '').trim();
  const cLow = c.toLowerCase();
  let optsHasExp = false;
  try {
    const opts = JSON.parse(r.options || '[]');
    if (Array.isArray(opts) && opts.some(o => o.explanation && o.explanation.trim().length > 15)) {
      optsHasExp = true;
    }
  } catch {}

  if (cLow.includes('take home') || cLow.includes('takehome')) {
    clusters.ia_take_home_sem_hifen.push(r);
  } else if (c.startsWith('{') && (c.includes('"_id"') || c.includes('"statementComment"'))) {
    clusters.json_bruto_terceiros.push(r);
  } else if (
    c.startsWith('Gabarito Oficial') ||
    c.startsWith('[Gabarito Oficial') ||
    cLow.includes('gabarito não disponibilizado') ||
    cLow.includes('padrão de resposta não disponível') ||
    c === 'Gabarito Oficial Homologado.'
  ) {
    clusters.placeholder_gabarito_oficial.push(r);
  } else if (
    c.includes('Síntese Clínica') ||
    c.includes('Comentário Integrado') ||
    c.includes('Armadilha da Questão') ||
    c.includes('Pérola Clínica') ||
    c.includes('Dica de Ouro') ||
    c.includes('💡')
  ) {
    clusters.ia_estrutura_ouro_sintese_armadilha_perola.push(r);
  } else if (optsHasExp) {
    clusters.ia_options_explicadas_no_json.push(r);
  } else if (cLow.startsWith('padrão de resposta') || cLow.startsWith('(a) ') || cLow.startsWith('a) ')) {
    clusters.padrao_resposta_dissertativa_banca.push(r);
  } else if (
    cLow.includes('olá, estudante') ||
    cLow.includes('olá estudante') ||
    cLow.includes('caro aluno') ||
    cLow.includes('prezado aluno') ||
    cLow.includes('coruja') ||
    cLow.includes('estratégia med') ||
    cLow.includes('medcurso') ||
    cLow.includes('sanar') ||
    cLow.includes('vamos analisar a questão') ||
    cLow.includes('analisando as alternativas')
  ) {
    clusters.texto_terceiros_ola_aluno_estrategia_sanar.push(r);
  } else if (/\*\*[A-E]\)|\*\*Alternativa [A-E]|\*\*[A-Za-zÀ-ÿ\s]{4,40}\*\*/.test(c) && c.length > 250) {
    clusters.ia_alternativas_bold_ouro.push(r);
  } else {
    clusters.outros_textos_nao_classificados.push(r);
  }
}

console.log('Total registros não-vazios sem "Take-Home" no SQLite:', rows.length);
const summary = Object.entries(clusters).map(([k, arr]) => ({
  cluster: k,
  qtd: arr.length,
  tipo_provavel: k.startsWith('ia_') ? '🛡️ PRESERVAR (Ouro/IA)' : (k === 'outros_textos_nao_classificados' ? '⚠️ INSPECIONAR' : '🧹 LEGADO/PLACEHOLDER')
}));
console.table(summary);

// Amostras para o usuário / auditoria inspecionar!
console.log('\n--- Amostra: ia_alternativas_bold_ouro (top 5) ---');
for (const r of clusters.ia_alternativas_bold_ouro.slice(0, 5)) {
  console.log(`[${r.code} | ${r.modalidade}] ${r.commentary.slice(0, 160).replace(/\n/g, ' ')}`);
}

console.log('\n--- Amostra: texto_terceiros_ola_aluno_estrategia_sanar (top 5) ---');
for (const r of clusters.texto_terceiros_ola_aluno_estrategia_sanar.slice(0, 5)) {
  console.log(`[${r.code} | ${r.modalidade}] ${r.commentary.slice(0, 160).replace(/\n/g, ' ')}`);
}

console.log('\n--- Amostra: outros_textos_nao_classificados (top 15) ---');
for (const r of clusters.outros_textos_nao_classificados.slice(0, 15)) {
  console.log(`[${r.code} | ${r.modalidade} | len=${r.commentary.length}] ${r.commentary.slice(0, 160).replace(/\n/g, ' ')}`);
}

