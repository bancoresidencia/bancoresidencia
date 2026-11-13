import fs from 'fs';
import { parseAmpGabarito } from './parse_amp_booklet.mjs';

async function testGb() {
  const gb = await parseAmpGabarito('data/official_exams/AMP_PARANA/GB_AMP_2024_OFICIAL.pdf', 'PROVA GERAL');
  console.log('GB AMP 2024 Oficial parsed answers count:', Object.keys(gb).length);
  console.log('Answers 1..20:', Object.entries(gb).slice(0, 20));
  console.log('Answers 21..40:', Object.entries(gb).slice(20, 40));
}
testGb();

