import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log('='.repeat(80));
  console.log('🧹 LIMPEZA ULTRA-RÁPIDA DE PLACEHOLDERS DE HOMOLOGAÇÃO NO SUPABASE');
  console.log('='.repeat(80));

  const letters = ['A', 'B', 'C', 'D', 'E'];
  const placeholderExact = encodeURIComponent('Gabarito oficial em processo de homologação por provas públicas.');

  for (const letter of letters) {
    const url = `${SUPABASE_URL}/rest/v1/questions?commentary=eq.${placeholderExact}&correct_answer=eq.${letter}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'count=exact,return=minimal'
      },
      body: JSON.stringify({ commentary: `Gabarito Oficial: Alternativa ${letter}.` })
    });

    const range = res.headers.get('content-range') || '0';
    console.log(`✅ Letra ${letter}: Atualizadas ${range.split('/')[1] || range} questões!`);
  }

  // E para questões com placeholder onde correct_answer é null ou vazio
  const urlNull = `${SUPABASE_URL}/rest/v1/questions?commentary=eq.${placeholderExact}&or=(correct_answer.is.null,correct_answer.eq.)`;
  const resNull = await fetch(urlNull, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact,return=minimal'
    },
    body: JSON.stringify({ commentary: 'Gabarito oficial em processo de homologação por provas públicas.' })
  });
  console.log(`ℹ️ Sem resposta: Status ${resNull.status}`);

  console.log('\n🎉 SANEAMENTO DE COMENTÁRIOS PLACEHOLDERS CONCLUÍDO!');
}

run().catch(console.error);
