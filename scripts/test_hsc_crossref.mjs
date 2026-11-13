import fs from 'fs';
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

function normalize(s) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccard(s1, s2) {
  const w1 = new Set(normalize(s1).split(' ').filter(w => w.length > 2));
  const w2 = new Set(normalize(s2).split(' ').filter(w => w.length > 2));
  if (w1.size === 0 || w2.size === 0) return 0;
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return inter / new Set([...w1, ...w2]).size;
}

function bigrams(s) {
  const str = normalize(s).replace(/\s+/g, '');
  const bg = new Set();
  for (let i = 0; i < str.length - 1; i++) bg.add(str.slice(i, i + 2));
  return bg;
}

function similarity(s1, s2) {
  const j = jaccard(s1, s2);
  const bg1 = bigrams(s1);
  const bg2 = bigrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return j;
  let inter = 0;
  for (const b of bg1) if (bg2.has(b)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (j * 0.4) + (bgSim * 0.6);
}

async function testHscCrossReference() {
  console.log('Carregando 139 questoes pendentes HSC...');
  const { data: hscData, error } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options, correct_answer')
    .ilike('code', 'HSC%');

  if (error) {
    console.error('Erro:', error);
    return;
  }

  const pending = hscData.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Total HSC pendentes: ${pending.length} (2023: ${pending.filter(q=>q.year===2023).length}, 2024: ${pending.filter(q=>q.year===2024).length})`);

  // Check against SUS-SP text files
  const susFiles = [
    { year: 2023, path: 'data/official_exams/SUS_SP/sus_sp_2023_prova_extracted.txt' },
    { year: 2024, path: 'data/official_exams/SUS_SP/sus_sp_2024_prova_extracted.txt' }
  ];

  for (const sus of susFiles) {
    if (fs.existsSync(sus.path)) {
      console.log(`\nVerificando contra ${sus.path}...`);
      const txt = fs.readFileSync(sus.path, 'utf8');
      const targetPending = pending.filter(q => q.year === sus.year);
      let matchedCount = 0;

      for (const q of targetPending) {
        // take first 50 chars of statement
        const norm = normalize(q.statement).slice(0, 60);
        if (normalize(txt).includes(norm)) {
          console.log(`  -> Match encontrado no texto SUS-SP ${sus.year} para ${q.code}!`);
          matchedCount++;
        }
      }
      console.log(`SUS-SP ${sus.year}: ${matchedCount} / ${targetPending.length} matches diretos`);
    }
  }

  // Check against Santa Casa
  const scFiles = [
    { year: 2023, path: 'data/official_exams/SANTA_CASA_SP/sc_2023_prova_extracted.txt' }
  ];
  for (const sc of scFiles) {
    if (fs.existsSync(sc.path)) {
      console.log(`\nVerificando contra ${sc.path}...`);
      const txt = fs.readFileSync(sc.path, 'utf8');
      const targetPending = pending.filter(q => q.year === sc.year);
      let matchedCount = 0;
      for (const q of targetPending) {
        const norm = normalize(q.statement).slice(0, 60);
        if (normalize(txt).includes(norm)) {
          console.log(`  -> Match em Santa Casa para ${q.code}!`);
          matchedCount++;
        }
      }
      console.log(`Santa Casa ${sc.year}: ${matchedCount} / ${targetPending.length} matches`);
    }
  }
}

testHscCrossReference();
