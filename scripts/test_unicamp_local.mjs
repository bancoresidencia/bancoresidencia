import fs from 'fs';
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

async function testUnicamp() {
  console.log('=== TESTANDO UNICAMP 2026 ===');
  const bufGb = fs.readFileSync('data/official_exams/UNICAMP/UNICAMP_2026_GABARITO_DEFINITIVO.pdf');
  const pGb = new PDFParse({ data: bufGb });
  await pGb.load();
  const gbText = (await pGb.getText()).text || await pGb.getText();
  console.log('UNICAMP 2026 Gabarito text sample:');
  console.log(gbText.slice(0, 1000));

  const bufPv = fs.readFileSync('data/official_exams/UNICAMP/UNICAMP_2026_PROVA_ACESSO_DIRETO.pdf');
  const pPv = new PDFParse({ data: bufPv });
  await pPv.load();
  const pvText = (await pPv.getText()).text || await pPv.getText();
  console.log('\nUNICAMP 2026 Prova text sample:');
  console.log(pvText.slice(0, 1000));
}

testUnicamp().catch(console.error);

