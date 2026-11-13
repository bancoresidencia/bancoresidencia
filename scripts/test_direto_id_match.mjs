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

// Carrega Pediatria local onde geramos os comentários recentes
const pedList = JSON.parse(fs.readFileSync('data/pediatria_final_questions.json', 'utf8'));
const pedGold = pedList.filter(q => q.commentary && q.commentary.includes('Take-Home'));

console.log(`Carregadas ${pedGold.length} questões com Padrão-Ouro de Pediatria.`);

// Amostra de 10
const sample = pedGold.slice(0, 10);
const sampleIds = sample.map(q => q.id);
const sampleCodes = sample.map(q => q.code).filter(Boolean);

async function checkSample() {
  const { data: byId } = await supabase.from('questions_direto').select('id, code, commentary').in('id', sampleIds);
  console.log(`Match por ID em questions_direto: ${byId?.length || 0} de 10`);

  const { data: byCode } = await supabase.from('questions_direto').select('id, code, commentary').in('code', sampleCodes);
  console.log(`Match por CODE em questions_direto: ${byCode?.length || 0} de 10`);

  if (byId && byId.length > 0) {
    console.log('Exemplo retornado por ID:');
    console.log({ id: byId[0].id, code: byId[0].code, hasTakeHome: byId[0].commentary?.includes('Take-Home') });
  }
}

checkSample();

