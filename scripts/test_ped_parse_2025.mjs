import fs from 'fs';
import { parseVerbenaCaderno } from './parse_verbena_booklet.mjs';

async function testPedParse() {
  const q = await parseVerbenaCaderno('data/official_exams/SES_GO_2025/PV_PEDIATRIA_2025.pdf');
  console.log('Total questions parsed from PV_PEDIATRIA_2025.pdf:', Object.keys(q).length);
  for (let i = 1; i <= Math.min(5, Object.keys(q).length); i++) {
    console.log(`Q${i}:`, q[i]?.statement?.slice(0, 80));
    console.log(`   Options:`, q[i]?.options);
  }
}

testPedParse();
