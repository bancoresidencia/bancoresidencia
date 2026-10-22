import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSample() {
  const ids = [
    'cdd6a406-6bb6-4307-8f44-2379f99ca7fa',
    '14f79fcc-9178-4e6a-a632-97032281e7ef',
    'ffe8bcbf-47e4-4783-8ccc-58ea25090a4d',
    '4472ff2b-f581-47e6-adf2-e535f7f6d535',
    '939d4911-7079-470c-ba23-05b3aa6d52dd'
  ];

  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=in.(${ids.join(',')})&select=id,code,institution,correct_answer,is_anulada,commentary`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  const data = await res.json();
  console.log('Supabase Data for sample suspect IDs:');
  for (const row of data) {
    console.log(`- ID: ${row.id} | Code: ${row.code} | Ans: ${row.correct_answer} | Anulada: ${row.is_anulada} | Comm: ${(row.commentary || '').slice(0, 80)}`);
  }
}

checkSample().catch(console.error);
