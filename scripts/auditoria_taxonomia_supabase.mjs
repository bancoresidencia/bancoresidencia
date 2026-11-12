import fs from 'fs';

// Leitura de variáveis de ambiente
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Supabase URL ou Service Key não encontradas em .env.local');
  process.exit(1);
}

// Helper para contagem exata no Supabase PostgREST
async function queryCount(table, filter = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=id${filter ? '&' + filter : ''}`;
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const cr = res.headers.get('content-range');
    if (!cr) {
      const text = await res.text();
      return { status: res.status, count: null, err: text };
    }
    const parts = cr.split('/');
    return { status: res.status, count: parts[1] === '*' ? 0 : parseInt(parts[1], 10) };
  } catch (err) {
    return { status: 500, count: null, err: err.message };
  }
}

// Helper para buscar amostras
async function querySample(table, filter = '', limit = 5) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=id,banca,year,especialidade,tema,foco,subfoco${filter ? '&' + filter : ''}&limit=${limit}`;
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function audit() {
  console.log('========================================================================');
  console.log('🔍 AUDITORIA COMPLETA DE TAXONOMIA MÉDICA NO SUPABASE (READ-ONLY)');
  console.log('========================================================================\n');

  const tables = [
    'questions',
    'questions_expansion_direto',
    'questions_revalida_base',
    'questions_expansion_revalida',
    'view_questions_acesso_direto',
    'view_questions_revalida'
  ];

  const results = {};

  for (const t of tables) {
    console.log(`--- [Tabela / View: ${t}] ---`);
    const total = await queryCount(t);
    console.log(`Total de Registros: ${total.count?.toLocaleString('pt-BR') || 'Erro: ' + total.err}`);

    // Checagem de NULL
    const nullEsp = await queryCount(t, 'especialidade=is.null');
    const nullTema = await queryCount(t, 'tema=is.null');
    const nullFoco = await queryCount(t, 'foco=is.null');
    const nullSub = await queryCount(t, 'subfoco=is.null');

    // Checagem de Strings Vazias
    const emptyEsp = await queryCount(t, 'especialidade=eq.');
    const emptyTema = await queryCount(t, 'tema=eq.');
    const emptyFoco = await queryCount(t, 'foco=eq.');
    const emptySub = await queryCount(t, 'subfoco=eq.');

    // Checagem de "Geral"
    const geralEsp = await queryCount(t, 'especialidade=ilike.Geral');
    const geralTema = await queryCount(t, 'tema=ilike.Geral');
    const geralFoco = await queryCount(t, 'foco=ilike.Geral');
    const geralSub = await queryCount(t, 'subfoco=ilike.Geral');

    // Checagem de "Outros" / "Indefinido" / "Desconhecido" / "Sem classificação"
    const outrosSub = await queryCount(t, 'subfoco=ilike.Outros');
    const indefinidoSub = await queryCount(t, 'subfoco=ilike.*indefinido*');
    const semClassifSub = await queryCount(t, 'subfoco=ilike.*sem class*');

    console.log(`  NULL:      Esp=${nullEsp.count} | Tema=${nullTema.count} | Foco=${nullFoco.count} | Subfoco=${nullSub.count}`);
    console.log(`  Vazio \"\":   Esp=${emptyEsp.count} | Tema=${emptyTema.count} | Foco=${emptyFoco.count} | Subfoco=${emptySub.count}`);
    console.log(`  \"Geral\":   Esp=${geralEsp.count} | Tema=${geralTema.count} | Foco=${geralFoco.count} | Subfoco=${geralSub.count}`);
    console.log(`  Residuais: Outros=${outrosSub.count} | Indefinido=${indefinidoSub.count} | SemClass=${semClassifSub.count}\n`);

    results[t] = {
      total: total.count,
      nulls: { esp: nullEsp.count, tema: nullTema.count, foco: nullFoco.count, subfoco: nullSub.count },
      empty: { esp: emptyEsp.count, tema: emptyTema.count, foco: emptyFoco.count, subfoco: emptySub.count },
      geral: { esp: geralEsp.count, tema: geralTema.count, foco: geralFoco.count, subfoco: geralSub.count },
      residuais: { outros: outrosSub.count, indefinido: indefinidoSub.count, semClass: semClassifSub.count }
    };
  }

  return results;
}

audit();
