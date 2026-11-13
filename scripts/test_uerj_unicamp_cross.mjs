import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeText(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function calculateSimilarity(s1, s2) {
  const n1 = normalizeText(s1);
  const n2 = normalizeText(s2);
  const w1 = new Set(n1.split(' ').filter(w => w.length > 2));
  const w2 = new Set(n2.split(' ').filter(w => w.length > 2));
  if (w1.size === 0 || w2.size === 0) return 0;
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return inter / new Set([...w1, ...w2]).size;
}

async function testUerjUnicamp() {
  console.log('=== TESTE DE CRUZAMENTO UERJ E UNICAMP ===');

  // UERJ 2024
  const uerjGb = 'data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf';
  const uerjPv = 'data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf';
  if (fs.existsSync(uerjPv)) {
    const p = new PDFParse({ data: fs.readFileSync(uerjPv) });
    await p.load();
    const uerjText = (await p.getText()).text || await p.getText();
    
    const { data: dbUerj } = await supabase
      .from('questions')
      .select('id, code, year, statement, options')
      .ilike('institution', '%UERJ%')
      .eq('year', 2024)
      .or('correct_answer.is.null,correct_answer.eq.');

    console.log(`UERJ 2024 no banco: ${dbUerj?.length || 0} pendentes`);
    let matches = 0;
    for (const q of (dbUerj || [])) {
      const cleanStmt = cleanHtml(q.statement);
      if (cleanStmt.length > 20 && uerjText.includes(cleanStmt.slice(0, 45))) {
        matches++;
        console.log(`[UERJ 2024 MATCH] ${q.code}`);
      }
    }
    console.log(`UERJ 2024 matches encontrados no PDF oficial: ${matches}`);
  }

  // UNICAMP 2026
  const uniGb = 'data/official_exams/UNICAMP/UNICAMP_2026_GABARITO_DEFINITIVO.pdf';
  const uniPv = 'data/official_exams/UNICAMP/UNICAMP_2026_PROVA_ACESSO_DIRETO.pdf';
  if (fs.existsSync(uniPv)) {
    const p = new PDFParse({ data: fs.readFileSync(uniPv) });
    await p.load();
    const uniText = (await p.getText()).text || await p.getText();

    const { data: dbUni } = await supabase
      .from('questions')
      .select('id, code, year, statement, options')
      .ilike('institution', '%UNICAMP%')
      .eq('year', 2026)
      .or('correct_answer.is.null,correct_answer.eq.');

    console.log(`UNICAMP 2026 no banco: ${dbUni?.length || 0} pendentes`);
    let uniMatches = 0;
    for (const q of (dbUni || [])) {
      const cleanStmt = cleanHtml(q.statement);
      if (cleanStmt.length > 20 && uniText.includes(cleanStmt.slice(0, 45))) {
        uniMatches++;
        console.log(`[UNICAMP 2026 MATCH] ${q.code}`);
      }
    }
    console.log(`UNICAMP 2026 matches encontrados no PDF oficial: ${uniMatches}`);
  }
}

testUerjUnicamp();

