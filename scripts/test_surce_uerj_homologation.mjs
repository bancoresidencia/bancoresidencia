import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanText(txt) {
  if (!txt) return '';
  return txt
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/["'“”«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function calculateJaccard(s1, s2) {
  const words1 = new Set(cleanText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(cleanText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  for (const w of words1) if (words2.has(w)) intersection++;
  return intersection / new Set([...words1, ...words2]).size;
}

function getBiGrams(str) {
  const s = cleanText(str).replace(/\s+/g, '');
  const bigrams = new Set();
  for (let i = 0; i < s.length - 1; i++) bigrams.add(s.slice(i, i + 2));
  return bigrams;
}

function calculateSimilarity(s1, s2) {
  const jaccard = calculateJaccard(s1, s2);
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return jaccard;
  let inter = 0;
  for (const bg of bg1) if (bg2.has(bg)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (jaccard * 0.4) + (bgSim * 0.6);
}

async function parsePdfText(pdfPath) {
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const p = new PDFParse({ data: buf });
  await p.load();
  return (await p.getText()).text || await p.getText();
}

async function testSurce() {
  console.log('=== TESTE DE HOMOLOGAÇÃO SURCE ===');
  const { data: dbSurce } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .ilike('institution', '%SURCE%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`Total SURCE pendentes no Supabase: ${dbSurce.length}`);
  const byYear = {};
  for (const q of dbSurce) byYear[q.year] = (byYear[q.year] || 0) + 1;
  console.log('Por ano:', byYear);

  for (const year of ['2022', '2023', '2024']) {
    const pvPath = `data/official_exams/SURCE/SURCE_${year}_PROVA_ACESSO_DIRETO.pdf`;
    const gbPath = `data/official_exams/SURCE/SURCE_${year}_GABARITO_DEFINITIVO.pdf`;
    if (!fs.existsSync(pvPath) || !fs.existsSync(gbPath)) continue;

    console.log(`\nVerificando SURCE ${year}...`);
    const pvText = await parsePdfText(pvPath);
    const gbText = await parsePdfText(gbPath);
    console.log(`  PV len: ${pvText.length} | GB len: ${gbText.length}`);
    console.log(`  Amostra GB:\n${gbText.slice(0, 200).replace(/\n/g, ' ')}`);
  }
}

testSurce().catch(console.error);
