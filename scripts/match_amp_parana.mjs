import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // 1. Load all pending 2026 questions for Paraná institutions
  const { data: dbQuestions, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, statement, options, correct_answer')
    .eq('year', 2026)
    .is('correct_answer', null)
    .or('institution.ilike.%AMP%,institution.ilike.%HMMSJP%,institution.ilike.%Angelina Caron%,institution.ilike.%UEM%,institution.ilike.%Foz%');

  if (error) {
    console.error('Supabase error:', error);
    return;
  }
  console.log(`Loaded ${dbQuestions.length} pending 2026 Paraná questions from DB.`);

  // 2. Load all downloaded AMP PDFs text
  const pdfDir = path.resolve('data/official_exams/AMP_PARANA');
  const files = fs.readdirSync(pdfDir).filter(f => f.startsWith('AMP_2026_PROVA_') && f.endsWith('.pdf'));
  
  const examTexts = [];
  for (const f of files) {
    const p = path.join(pdfDir, f);
    const pdf = new PDFParse({ data: fs.readFileSync(p) });
    await pdf.load();
    const t = (await pdf.getText()).text || await pdf.getText();
    examTexts.push({ file: f, text: t.toLowerCase() });
    console.log(`Loaded ${f} (${t.length} chars)`);
  }

  // 3. Search for each DB question in each PDF
  let matched = 0;
  for (const q of dbQuestions) {
    // clean statement
    const cleanStmt = q.statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const probe = cleanStmt.slice(0, 45); // first 45 chars
    let foundIn = null;
    for (const ex of examTexts) {
      if (ex.text.includes(probe)) {
        foundIn = ex.file;
        break;
      }
    }
    if (foundIn) {
      matched++;
      console.log(`MATCH [${q.code}] in ${foundIn}: "${probe}..."`);
    } else {
      // try words
      const words = cleanStmt.split(' ').filter(w => w.length > 5).slice(0, 5);
      if (words.length >= 3) {
        for (const ex of examTexts) {
          if (words.every(w => ex.text.includes(w))) {
            matched++;
            console.log(`PARTIAL MATCH [${q.code}] in ${ex.file}: words [${words.join(', ')}]`);
            break;
          }
        }
      }
    }
  }
  console.log(`Total matched: ${matched} of ${dbQuestions.length}`);
}

main();
