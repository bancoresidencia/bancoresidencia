import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env.local');
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

async function checkRemote() {
  console.log("Checando tabelas no Supabase...");
  
  // 1. Checar questions_revalida
  try {
    const res1 = await fetch(`${SUPABASE_URL}/rest/v1/questions_revalida?select=count`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    console.log("questions_revalida status:", res1.status, "content-range:", res1.headers.get('content-range'));
  } catch(e) {
    console.log("Erro questions_revalida:", e);
  }

  // 2. Checar questions_expansion_revalida
  try {
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_revalida?select=count`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    console.log("questions_expansion_revalida status:", res2.status, "content-range:", res2.headers.get('content-range'));
  } catch(e) {
    console.log("Erro questions_expansion_revalida:", e);
  }

  // Pegar amostra de questions_revalida
  try {
    const res3 = await fetch(`${SUPABASE_URL}/rest/v1/questions_revalida?select=id,institution,banca,year,modalidade&limit=5`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const data3 = await res3.json();
    console.log("\nAmostra questions_revalida:", data3);
  } catch(e) {
    console.log("Erro amostra questions_revalida:", e);
  }
}

checkRemote();
