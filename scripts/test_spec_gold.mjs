import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testSpecGold() {
  const specs = ['Ginecologia', 'Obstetrícia', 'Pediatria'];
  for (const s of specs) {
    const start = Date.now();
    const { count, error } = await supabase
      .from('questions_direto')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', s)
      .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
      .ilike('commentary', '%Take-Home%');

    if (error) {
      console.log(`${s}: Erro - ${error.message} (${Date.now() - start}ms)`);
    } else {
      console.log(`${s}: ${count} questões com Padrão-Ouro (${Date.now() - start}ms)`);
    }
  }
}

testSpecGold();

