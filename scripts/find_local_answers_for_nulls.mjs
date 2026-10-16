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

const LOTE1 = [
  'ENARE', 'SUS-SP', 'USP', 'FUVEST', 'IAMSPE', 'UNESP', 'FMABC', 'UNIFESP',
  'Santa Casa SP', 'Santa Casa de São Paulo', 'INEP', 'Revalida'
];

async function scanLocalDatasets() {
  console.log('📦 Carregando todos os arquivos locais data/*_final_questions.json...');
  const files = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json'));
  
  // Mapa de code -> question com gabarito oficial e sem IA
  const localMap = new Map();
  for (const f of files) {
    const list = JSON.parse(fs.readFileSync(`data/${f}`, 'utf8'));
    for (const q of list) {
      const code = q.code;
      const ans = q.correct_answer || q.correctAnswer;
      // Proibir terminantemente IA
      const isAI = (q.commentary && q.commentary.includes('IA')) || 
                   (q.audit && q.audit.source && q.audit.source.includes('ai')) ||
                   (q.official_audit && q.official_audit.source && q.official_audit.source.includes('ai'));
      if (code && ans && !isAI) {
        localMap.set(code, {
          code,
          correct_answer: ans,
          commentary: q.commentary || null,
          banca: q.banca,
          institution: q.institution
        });
      }
    }
  }
  console.log(`✅ Total de questões com gabarito nos arquivos locais: ${localMap.size}`);

  // Agora vamos buscar questões no Supabase que estão com correct_answer is null
  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY
  };

  console.log('🌐 Buscando questões com correct_answer nulo no Supabase...');
  let offset = 0;
  const limit = 1000;
  const readyToUpload = [];

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/questions?correct_answer=is.null&select=id,code,institution,banca&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const batch = await res.json();
    if (!batch.length) break;

    for (const q of batch) {
      const isL1 = LOTE1.some(b => 
        (q.banca || '').toLowerCase().includes(b.toLowerCase()) || 
        (q.institution || '').toLowerCase().includes(b.toLowerCase())
      );
      if (isL1) continue;

      if (localMap.has(q.code)) {
        const local = localMap.get(q.code);
        readyToUpload.push({
          id: q.id,
          code: q.code,
          banca: q.banca || local.banca,
          institution: q.institution || local.institution,
          correct_answer: local.correct_answer,
          commentary: local.commentary
        });
      }
    }

    offset += limit;
    if (offset >= 15000) break; // temos ~14.500 no total
  }

  console.log(`🎯 Encontradas ${readyToUpload.length} questões do Lote 2 prontas para subir ao Supabase!`);
  if (readyToUpload.length > 0) {
    fs.writeFileSync('data/lote2_ready_for_upload.json', JSON.stringify(readyToUpload, null, 2), 'utf8');
    console.log('Salvo em data/lote2_ready_for_upload.json');
  }
}

scanLocalDatasets();
