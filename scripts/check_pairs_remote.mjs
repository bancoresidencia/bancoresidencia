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

async function checkAllRemote() {
  const pairs = [
    ['questions_revalida', 'questions_expansion_revalida'],
    ['questions_titulo', 'questions_expansion_titulo_especialista'],
    ['questions_rplus', 'questions_expansion_r_plus'],
    ['questions_direto', 'questions_expansion_direto'],
    ['questions', 'questions']
  ];

  for (const [t1, t2] of pairs) {
    let c1 = 'N/A', c2 = 'N/A';
    try {
      const r1 = await fetch(`${SUPABASE_URL}/rest/v1/${t1}?select=count`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Range': '0-0', 'Prefer': 'count=exact' }
      });
      c1 = r1.headers.get('content-range')?.split('/')[1] || r1.status;
    } catch (e) { c1 = e.message; }

    if (t1 !== t2) {
      try {
        const r2 = await fetch(`${SUPABASE_URL}/rest/v1/${t2}?select=count`, {
          headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Range': '0-0', 'Prefer': 'count=exact' }
        });
        c2 = r2.headers.get('content-range')?.split('/')[1] || r2.status;
      } catch (e) { c2 = e.message; }
    } else {
      c2 = c1;
    }

    console.log(`${t1.padEnd(25)}: ${c1.toString().padStart(8)}  vs  ${t2.padEnd(42)}: ${c2.toString().padStart(8)}`);
  }
}

checkAllRemote();
