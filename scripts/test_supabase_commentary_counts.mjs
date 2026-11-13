import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const tables = ['questions_direto', 'questions_revalida', 'questions_rplus', 'questions_titulo'];

async function getCount(url) {
  const res = await fetch(url, {
    method: 'HEAD',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'count=exact'
    }
  });
  const range = res.headers.get('content-range');
  return range ? parseInt(range.split('/')[1], 10) : 0;
}

async function testCounts() {
  console.log('Testing Supabase table counts...');
  for (const t of tables) {
    const total = await getCount(`${SUPABASE_URL}/rest/v1/${t}?limit=1`);
    const withComm = await getCount(`${SUPABASE_URL}/rest/v1/${t}?limit=1&commentary=not.is.null&commentary=neq.`);
    const withTakeHome = await getCount(`${SUPABASE_URL}/rest/v1/${t}?limit=1&commentary=like.*Take-Home*`);
    const withJustificativa = await getCount(`${SUPABASE_URL}/rest/v1/${t}?limit=1&commentary=like.*Justificativa*`);
    console.log(`Table: ${t}`);
    console.log(`  Total: ${total}`);
    console.log(`  With commentary: ${withComm}`);
    console.log(`  With 'Take-Home': ${withTakeHome}`);
    console.log(`  With 'Justificativa': ${withJustificativa}`);
  }
}

testCounts().catch(console.error);

