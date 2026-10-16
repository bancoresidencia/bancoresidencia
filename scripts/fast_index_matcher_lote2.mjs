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

async function scanByIndex() {
  console.log('📦 Carregando todos os arquivos locais data/*_final_questions.json...');
  const files = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json'));
  
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
        // Bloquear Lote 1
        const isL1 = LOTE1.some(b => 
          (q.banca || '').toLowerCase().includes(b.toLowerCase()) || 
          (q.institution || '').toLowerCase().includes(b.toLowerCase())
        );
        if (!isL1) {
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
  }
  console.log(`✅ Total de questões Lote 2 válidas locais: ${localMap.size}`);

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY
  };

  const codes = Array.from(localMap.keys());
  const BATCH_SIZE = 80;
  const readyToUpload = [];

  console.log('⚡ Verificando códigos no Supabase...');
  for (let i = 0; i < codes.length; i += BATCH_SIZE) {
    const chunk = codes.slice(i, i + BATCH_SIZE);
    const url = `${SUPABASE_URL}/rest/v1/questions?code=in.(${chunk.join(',')})&select=id,code,correct_answer`;
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const rows = await res.json();
        for (const row of rows) {
          if (!row.correct_answer || row.correct_answer.trim() === '') {
            const loc = localMap.get(row.code);
            readyToUpload.push({
              id: row.id,
              code: row.code,
              banca: loc.banca,
              institution: loc.institution,
              correct_answer: loc.correct_answer,
              commentary: loc.commentary
            });
          }
        }
      }
    } catch (e) {
      console.error('Erro:', e.message);
    }
    if ((i + BATCH_SIZE) % 500 === 0 || i + chunk.length >= codes.length) {
      console.log(`Progresso: ${Math.min(i + BATCH_SIZE, codes.length)}/${codes.length} | Pendentes encontradas: ${readyToUpload.length}`);
    }
  }

  console.log(`\n🎉 Total de questões do Lote 2 com gabarito oficial pendente no Supabase: ${readyToUpload.length}`);
  fs.writeFileSync('data/lote2_pending_to_upload.json', JSON.stringify(readyToUpload, null, 2), 'utf8');
}

scanByIndex();
