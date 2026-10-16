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

// Lista canônica das bancas do Lote 2 e Expansão Regional
const LOTE2_BANCAS = [
  'UERJ', 'AMP', 'AMRIGS', 'UEL', 'PSU-MG', 'Sírio-Libanês', 'SES-RJ',
  'UNICAMP', 'UFRJ', 'SES-GO', 'CERMAM', 'UFRGS', 'HU-FMJ', 'Albert Einstein',
  'SES-DF', 'SURCE', 'SCBH', 'PUCPR', 'UEPA', 'UFCSPA', 'UFPR', 'UESPI',
  'HAC', 'PUC-SP', 'FAMEMA', 'CMC', 'UFG', 'UNITAU', 'HPP', 'UERN',
  'IPSEMG', 'FCMMG', 'PUCRS', 'Mário Gatti', 'UFMA', 'UFF', 'SES-MA',
  'UFS', 'UFMT', 'UFPI', 'UFT', 'INTO', 'UNAERP'
];

// Bancas do Lote 1 expressamente BLINDADAS
const LOTE1_BLINDADAS = [
  'ENARE', 'SUS-SP', 'USP', 'FUVEST', 'IAMSPE', 'UNESP', 'FMABC', 'UNIFESP',
  'Santa Casa SP', 'Santa Casa de São Paulo', 'INEP', 'Revalida'
];

async function fetchAllPendingForBanca(bancaName) {
  const headers = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };
  let offset = 0;
  const limit = 1000;
  const pending = [];

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/questions?or=(banca.ilike.*${encodeURIComponent(bancaName)}*,institution.ilike.*${encodeURIComponent(bancaName)}*)&select=id,code,institution,banca,year,statement,options,correct_answer&limit=${limit}&offset=${offset}`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) break;

      for (const r of rows) {
        // Blindagem estrita do Lote 1
        const isLote1 = LOTE1_BLINDADAS.some(b => 
          (r.banca || '').toLowerCase().includes(b.toLowerCase()) || 
          (r.institution || '').toLowerCase().includes(b.toLowerCase())
        );
        if (isLote1) continue;

        // Se está pendente de gabarito válido (vazio ou nulo)
        if (!r.correct_answer || r.correct_answer.trim().length === 0) {
          pending.push({
            id: r.id,
            code: r.code,
            institution: r.institution,
            banca: r.banca,
            year: r.year,
            statement: r.statement,
            options: r.options
          });
        }
      }

      if (rows.length < limit) break;
      offset += limit;
    } catch (e) {
      console.error(`Erro ao buscar ${bancaName} offset ${offset}:`, e.message);
      break;
    }
  }
  return pending;
}

async function buildIndex() {
  console.log('🚀 Iniciando indexação acelerada de questões pendentes do Lote 2...');
  const allPending = [];
  const stats = {};

  for (const b of LOTE2_BANCAS) {
    const list = await fetchAllPendingForBanca(b);
    if (list.length > 0) {
      // Deduplica por ID
      for (const item of list) {
        if (!allPending.some(p => p.id === item.id)) {
          allPending.push(item);
        }
      }
      stats[b] = list.length;
      console.log(`  📦 ${b}: ${list.length} questões pendentes indexadas`);
    }
  }

  console.log(`\n✅ Total de questões pendentes do Lote 2 indexadas: ${allPending.length}`);
  fs.writeFileSync('data/lote2_pending_index.json', JSON.stringify(allPending, null, 2), 'utf8');
  fs.writeFileSync('data/lote2_pending_stats.json', JSON.stringify(stats, null, 2), 'utf8');
  console.log('💾 Índice salvo com sucesso em data/lote2_pending_index.json');
}

buildIndex();
