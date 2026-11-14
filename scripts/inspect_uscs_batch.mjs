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

async function inspectUscs() {
  const { data: dbUscs } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, correct_answer')
    .ilike('institution', '%São Caetano do Sul%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`USCS pendentes no banco: ${dbUscs.length}`);
  const byYear = {};
  for (const q of dbUscs) {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  }
  console.log('Distribuição por ano no banco:', byYear);

  for (const f of ['USCS_2025_GB_DEF.pdf', 'USCS_2026_GB_DEF.pdf']) {
    const pth = 'data/official_exams/USCS/' + f;
    const buf = new Uint8Array(fs.readFileSync(pth));
    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    console.log(`\n=== PDF ${f} (len: ${txt.length}) ===`);
    console.log(txt.slice(0, 300).replace(/\n/g, ' '));
  }
}

inspectUscs().catch(console.error);
