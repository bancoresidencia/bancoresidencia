import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const uuid = 'ab4178fe-164a-5c70-a6a0-557a2ecc5d75';
const code = 'EXP-REV-179785';

async function check() {
  const tables = ['questions_expansion_revalida', 'questions_revalida', 'questions'];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('id, code, commentary').or(`id.eq.${uuid},code.eq.${code}`).limit(1);
      console.log(`Table ${t}:`, error ? `❌ ${error.message}` : `✅ Found: ${data?.length} row(s)`);
      if (data && data.length) console.log(data[0]);
    } catch (e) {
      console.log(`Table ${t} exception:`, e.message);
    }
  }
}

check();
