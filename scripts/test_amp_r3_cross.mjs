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

async function testAmpR3() {
  console.log('=== TESTANDO PROVAS R3 DA AMP PARANÁ CONTRA PENDÊNCIAS HMMSJP/AMP ===');
  const dir = path.resolve('data/official_exams/AMP_PARANA');
  const r3Files = [
    { name: 'Pediatria R3', pv: 'AMP_2026_PROVA_PEDIATRIA.pdf', header: 'PEDIATRIA' },
    { name: 'Clínica Médica R3', pv: 'AMP_2026_PROVA_CLINICA_MEDICA.pdf', header: 'CLÍNICA MÉDICA' },
    { name: 'Cirurgia Geral R3', pv: 'AMP_2026_PROVA_CIRURGIA_GERAL.pdf', header: 'CIRURGIA GERAL' }
  ];

  // Fetch pending HMMSJP / AMP questions
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, institution, year, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .or('institution.ilike.%HMMSJP%,institution.ilike.%São José dos Pinhais%,code.ilike.%HMMSJP%');

  console.log(`Pendências HMMSJP: ${pending?.length || 0}`);

  for (const r3 of r3Files) {
    const pvPath = path.join(dir, r3.pv);
    if (!fs.existsSync(pvPath)) continue;
    const p = new PDFParse({ data: fs.readFileSync(pvPath) });
    await p.load();
    const text = (await p.getText()).text || await p.getText();

    let matchesFound = 0;
    for (const q of (pending || [])) {
      const cleanStmt = cleanHtml(q.statement);
      if (cleanStmt.length < 25) continue;
      const snippet = cleanStmt.slice(0, 50).trim();
      if (text.includes(snippet)) {
        matchesFound++;
        console.log(`[MATCH EXACTO] ${r3.name} -> ${q.code}: ${snippet}...`);
      }
    }
    console.log(`${r3.name}: ${matchesFound} cruzamentos exatos com HMMSJP.`);
  }
}

testAmpR3();

