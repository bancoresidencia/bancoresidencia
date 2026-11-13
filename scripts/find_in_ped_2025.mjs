import fs from 'fs';
import { parseVerbenaCaderno } from './parse_verbena_booklet.mjs';

async function findInPediatria2025() {
  const q = await parseVerbenaCaderno('data/official_exams/SES_GO_2025/PV_PEDIATRIA_2025.pdf');
  for (const [qNum, data] of Object.entries(q)) {
    if (data.statement.toLowerCase().includes('coqueluche') || 
        JSON.stringify(data.options).toLowerCase().includes('coqueluche') ||
        data.statement.toLowerCase().includes('sbp')) {
      console.log(`Matched Q${qNum}:`);
      console.log('Statement:', data.statement);
      console.log('Options:', data.options);
    }
  }
}

findInPediatria2025();
