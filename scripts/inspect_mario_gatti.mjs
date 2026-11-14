import fs from 'fs';
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

async function inspectMarioGatti() {
  const { data: dbMg } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, correct_answer')
    .ilike('institution', '%Mário Gatti%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`Mário Gatti pendentes no banco: ${dbMg.length}`);
  const byYear = {};
  for (const q of dbMg) {
    byYear[q.year || 'sem ano'] = (byYear[q.year || 'sem ano'] || 0) + 1;
  }
  console.log('Distribuição por ano no banco:', byYear);

  const pth = 'data/official_exams/MARIO_GATTI/GB_MARIO_GATTI_2026_DEFINITIVO.pdf';
  const buf = new Uint8Array(fs.readFileSync(pth));
  const p = new PDFParse({ data: buf });
  await p.load();
  const txt = (await p.getText()).text || await p.getText();
  console.log(`\n=== GABARITO DEFINITIVO MÁRIO GATTI 2026 (len: ${txt.length}) ===`);
  console.log(txt.slice(0, 500).replace(/\n/g, ' '));
}

inspectMarioGatti().catch(console.error);
