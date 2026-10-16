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

// Blindagem Lote 1
const LOTE1_BLINDADAS = [
  'ENARE', 'SUS-SP', 'USP', 'FUVEST', 'IAMSPE', 'UNESP', 'FMABC', 'UNIFESP',
  'Santa Casa SP', 'Santa Casa de São Paulo', 'INEP', 'Revalida'
];

async function checkAndSyncGold() {
  console.log('🔍 Analisando all_homologated_questions_gold.json vs Supabase...');
  
  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  console.log(`📦 Total no dataset Gold: ${gold.length} questões`);

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  // Filtrar apenas questões que têm id válido e correct_answer
  const validGold = gold.filter(q => q.id && (q.correct_answer || q.correctAnswer));
  console.log(`✅ Questões válidas com gabarito: ${validGold.length}`);

  // Verificar em blocos no Supabase se já estão atualizadas
  // Vamos buscar em blocos de 50 IDs para checar status no Supabase
  let pendingSync = [];
  const BATCH_CHECK = 50;
  
  for (let i = 0; i < Math.min(validGold.length, 1000); i += BATCH_CHECK) {
    const batch = validGold.slice(i, i + BATCH_CHECK);
    const ids = batch.map(q => q.id).filter(Boolean);
    const url = `${SUPABASE_URL}/rest/v1/questions?id=in.(${ids.join(',')})&select=id,correct_answer`;
    
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const mapSupa = new Map(data.map(d => [d.id, d.correct_answer]));
        for (const item of batch) {
          const supaVal = mapSupa.get(item.id);
          const goldVal = item.correct_answer || item.correctAnswer;
          if (!supaVal || supaVal.trim() === '') {
            pendingSync.push(item);
          }
        }
      }
    } catch (e) {
      console.error('Erro na checagem:', e.message);
    }
  }

  console.log(`📊 Amostra de 1.000 questões do Gold: ${pendingSync.length} precisam de sync no Supabase.`);
  if (pendingSync.length > 0) {
    console.log(`Exemplo de pendente: ${pendingSync[0].id} - ${pendingSync[0].banca} (${pendingSync[0].correct_answer})`);
  }
}

checkAndSyncGold();
