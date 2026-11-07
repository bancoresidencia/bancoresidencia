import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        let v = trimmed.slice(idx + 1).trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
        process.env[k] = v;
      }
    }
  }
}
loadEnv();

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const ids = [
    '14ca9e9a-f693-475a-9233-dd6e49833d51', // ENARE Cardiologia
    'f5fc28ab-950b-4812-ba74-11200adf5028', // HEDA Neurologia
    '9e18857b-b8bd-4b98-9805-b20b70fef163', // HOSBOS Gastroenterologia
    '44faff17-69a5-4a49-89ab-44bdff4cd4f7', // UNESP Pneumologia
    'd3a6e2dc-32fa-46ec-97be-0bb4f44e4258'  // HMMSJP Endocrinologia
  ];

  const { data, error } = await supa
    .from('questions')
    .select('id, code, commentary, options')
    .in('id', ids);

  if (error) {
    console.error('Error fetching from Supabase:', error);
    return;
  }
  console.log('Found in Supabase:', data.length, 'of 5 checked:');
  for (const q of data) {
    console.log(`- [${q.code}] ID: ${q.id} | Commentary length: ${q.commentary?.length} | Options count: ${q.options?.length}`);
  }
}
check();
