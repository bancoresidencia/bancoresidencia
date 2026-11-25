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

// 1. Inspect EXP-DIR-194101 and EXP-DIR-196078 in full
for (const code of ['EXP-DIR-194101', 'EXP-DIR-196078']) {
  const r = db.prepare(`SELECT code, commentary, options FROM questions_curated_staging WHERE code = ?`).get(code);
  console.log(`\n=== FULL SAMPLE: ${code} ===`);
  console.log(r?.commentary?.slice(0, 700));
  console.log('... TAIL:', r?.commentary?.slice(-300));
}

// 2. Break down all 3279 non-Take-Home in SQLite even finer
const rows = db.prepare(`
  SELECT id, code, modalidade, type, commentary, options
  FROM questions_curated_staging
  WHERE commentary IS NOT NULL
    AND length(trim(commentary)) > 0
    AND lower(commentary) NOT LIKE '%take-home%'
`).all();

const sub = {
  json_bruto_terceiros: 0,
  placeholder_gabarito_curto: 0, // <= 250 chars starting with Gabarito Oficial or [Gabarito Oficial
  espelho_banca_dissertativa: 0, // GABARITO OFICIAL: ..., Padrão de resposta...
  solucao_terceiros_scraping: 0, // Solução / Resolução / Caro aluno / Olá estudante
  ia_antiga_analise_caso_clinico: 0, // ANÁLISE DO CASO CLÍNICO / Raciocínio / Comentário / > 800 chars structured
  curto_lixo_menor_80: 0,
  outros_maior_80: []
};

for (const r of rows) {
  const c = (r.commentary || '').trim();
  const cLow = c.toLowerCase();
  if (c.startsWith('{') && (c.includes('"_id"') || c.includes('"statementComment"'))) {
    sub.json_bruto_terceiros++;
  } else if (
    c === 'Gabarito Oficial Homologado.' ||
    c.startsWith('[Gabarito Oficial Homologado]') ||
    c.startsWith('Gabarito Oficial Homologado -') ||
    c.startsWith('Gabarito Oficial Homologado:') ||
    cLow.includes('gabarito não disponibilizado') ||
    cLow.includes('padrão de resposta não disponível') ||
    c.startsWith('Gabarito Oficial [REVALIDA')
  ) {
    sub.placeholder_gabarito_curto++;
  } else if (
    cLow.startsWith('gabarito oficial') ||
    cLow.startsWith('gabarito:') ||
    cLow.startsWith('padrão de resposta') ||
    cLow.startsWith('(a)') ||
    cLow.startsWith('a)')
  ) {
    sub.espelho_banca_dissertativa++;
  } else if (
    cLow.startsWith('solução') ||
    cLow.includes('caro aluno') ||
    cLow.includes('olá, estudante') ||
    cLow.includes('olá estudante') ||
    cLow.includes('gabarito: alternativa')
  ) {
    sub.solucao_terceiros_scraping++;
  } else if (
    c.includes('ANÁLISE DO CASO') ||
    c.includes('MENSAGEM-CHAVE') ||
    c.includes('MENSAGEM CHAVE') ||
    c.includes('PONTOS-CHAVE') ||
    c.includes('RACIOCÍNIO CLÍNICO') ||
    c.includes('COMENTÁRIO DO PROFESSOR') ||
    c.includes('CONCLUSÃO')
  ) {
    sub.ia_antiga_analise_caso_clinico++;
  } else if (c.length < 80) {
    sub.curto_lixo_menor_80++;
  } else {
    sub.outros_maior_80.push({ code: r.code, mod: r.modalidade, type: r.type, len: c.length, prev: c.slice(0, 120).replace(/\n/g, ' ') });
  }
}

console.log('\n=== BREAKDOWN PRECISO DOS 3.279 NO SQLITE ===');
console.log({
  ...sub,
  outros_maior_80: sub.outros_maior_80.length
});
console.log('\nAmostra outros_maior_80 (primeiros 25):');
console.table(sub.outros_maior_80.slice(0, 25));

// 3. Check Supabase questions_revalida 111 "legados" too
let allRev = [];
let from = 0;
while (true) {
  const { data } = await supabase.from('questions_revalida').select('code, year, commentary').eq('has_gabarito', true).range(from, from + 999);
  if (!data || !data.length) break;
  allRev.push(...data);
  if (data.length < 1000) break;
  from += 1000;
}
const revLegados = allRev.filter(r => {
  const c = (r.commentary || '').trim();
  return c.length > 50 && !c.includes('Take-Home') && !c.startsWith('Gabarito Oficial') && !c.includes('Gabarito Oficial Homologado');
});
console.log('\n=== AMOSTRA DOS LEGADOS EM SUPABASE questions_revalida (' + revLegados.length + ') ===');
console.table(revLegados.slice(0, 15).map(r => ({ code: r.code, year: r.year, len: r.commentary.length, prev: r.commentary.slice(0, 100).replace(/\n/g, ' ') })));

