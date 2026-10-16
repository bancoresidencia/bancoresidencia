import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Lote 1 blindado
const LOTE1 = [
  'ENARE', 'SUS-SP', 'USP', 'FUVEST', 'IAMSPE', 'UNESP', 'FMABC', 'UNIFESP',
  'Santa Casa SP', 'Santa Casa de São Paulo', 'INEP', 'Revalida'
];

async function listPendingLote2() {
  console.log('🔍 Consultando questões com correct_answer nulo no Supabase...');
  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY
  };

  // Buscar 1000 questões com correct_answer is null
  const url = `${SUPABASE_URL}/rest/v1/questions?correct_answer=is.null&select=id,code,institution,banca,year&limit=1000`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error('Erro:', res.status, await res.text());
    return;
  }
  const items = await res.json();
  console.log(`Recebidas ${items.length} questões com gabarito nulo.`);

  const bancas = {};
  for (const q of items) {
    const isL1 = LOTE1.some(b => 
      (q.banca || '').toLowerCase().includes(b.toLowerCase()) || 
      (q.institution || '').toLowerCase().includes(b.toLowerCase())
    );
    if (isL1) continue;
    const b = q.banca || q.institution || 'Desconhecida';
    bancas[b] = (bancas[b] || 0) + 1;
  }

  console.log('Top bancas do Lote 2 com correct_answer nulo na amostra:');
  console.table(Object.entries(bancas).sort((a,b) => b[1] - a[1]).slice(0, 20));
}

listPendingLote2();
