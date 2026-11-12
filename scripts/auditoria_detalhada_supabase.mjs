import fs from 'fs';

// Leitura do .env.local
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// 1. Carregar Árvore Canônica
const rawTree = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

const canonicalSpecialties = new Set();
const canonicalTemas = new Set();
const canonicalFocos = new Set();
const canonicalSubfocos = new Set();

// Mapas hierárquicos para validação de paternidade
const temaToSpecialty = new Map();
const focoToTema = new Map();
const subfocoToFoco = new Map();

for (const esp of rawTree.hierarquia_padrao) {
  canonicalSpecialties.add(esp.especialidade.toLowerCase().trim());
  if (esp.especialidade === 'Cirurgia Geral') canonicalSpecialties.add('cirurgia');
  if (esp.especialidade === 'Medicina Preventiva e Social') canonicalSpecialties.add('medicina preventiva');
  if (esp.especialidade === 'Ginecologia' || esp.especialidade === 'Obstetrícia') canonicalSpecialties.add('ginecologia e obstetrícia');

  for (const t of esp.temas) {
    const tKey = t.tema.toLowerCase().trim();
    canonicalTemas.add(tKey);
    temaToSpecialty.set(tKey, esp.especialidade);

    for (const f of t.focos) {
      const fKey = f.foco.toLowerCase().trim();
      canonicalFocos.add(fKey);
      focoToTema.set(fKey, t.tema);

      for (const s of (f.subfocos || [])) {
        const sName = typeof s === 'string' ? s : s.subfoco;
        if (sName) {
          const sKey = sName.toLowerCase().trim();
          canonicalSubfocos.add(sKey);
          subfocoToFoco.set(sKey, f.foco);
        }
      }
    }
  }
}

console.log('========================================================================');
console.log('🔬 AUDITORIA DETALHADA E RASTREAMENTO DE ANOMALIAS NO SUPABASE');
console.log('========================================================================\n');
console.log(`Catálogo Canônico: ${canonicalSpecialties.size} especialidades, ${canonicalTemas.size} temas, ${canonicalFocos.size} focos, ${canonicalSubfocos.size} subfocos.\n`);

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
    if (!cr) return 0;
    const parts = cr.split('/');
    return parts[1] === '*' ? 0 : parseInt(parts[1], 10);
  } catch (err) {
    return -1;
  }
}

async function queryRows(table, filter = '', limit = 100) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=id,code,institution,banca,year,modalidade,especialidade,tema,foco,subfoco${filter ? '&' + filter : ''}&limit=${limit}`;
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

const ALL_TABLES = [
  { name: 'questions', type: 'Base Principal (Acesso Direto)' },
  { name: 'questions_expansion_direto', type: 'Expansão Acesso Direto' },
  { name: 'questions_revalida_base', type: 'Base Revalida' },
  { name: 'questions_expansion_revalida', type: 'Expansão Revalida' },
  { name: 'questions_expansion_r_plus', type: 'Expansão R+ Especialidades' },
  { name: 'questions_expansion_titulo_especialista', type: 'Expansão Título de Especialista' },
  { name: 'view_questions_acesso_direto', type: 'View Pública Acesso Direto' },
  { name: 'view_questions_revalida', type: 'View Pública Revalida' }
];

async function runDetailedAudit() {
  const auditReport = [];

  for (const t of ALL_TABLES) {
    console.log(`>>> Analisando [${t.name}] (${t.type})...`);
    const total = await queryCount(t.name);

    // 1. Nulos
    const nEsp = await queryCount(t.name, 'especialidade=is.null');
    const nTema = await queryCount(t.name, 'tema=is.null');
    const nFoco = await queryCount(t.name, 'foco=is.null');
    const nSub = await queryCount(t.name, 'subfoco=is.null');

    // 2. Vazios
    const vEsp = await queryCount(t.name, 'especialidade=eq.');
    const vTema = await queryCount(t.name, 'tema=eq.');
    const vFoco = await queryCount(t.name, 'foco=eq.');
    const vSub = await queryCount(t.name, 'subfoco=eq.');

    // 3. "Geral"
    const gEsp = await queryCount(t.name, 'especialidade=ilike.Geral');
    const gTema = await queryCount(t.name, 'tema=ilike.Geral');
    const gFoco = await queryCount(t.name, 'foco=ilike.Geral');
    const gSub = await queryCount(t.name, 'subfoco=ilike.Geral');

    // 4. "Outros" / "Indefinido" / "Desconhecido"
    const oSub = await queryCount(t.name, 'subfoco=ilike.Outros');
    const indSub = await queryCount(t.name, 'subfoco=ilike.*indefinido*');
    const descSub = await queryCount(t.name, 'subfoco=ilike.*desconhecido*');

    const totalIssues = (nEsp + nTema + nFoco + nSub) +
                        (vEsp + vTema + vFoco + vSub) +
                        (gEsp + gTema + gFoco + gSub) +
                        (oSub + indSub + descSub);

    console.log(`    Total: ${total.toLocaleString('pt-BR')} registros`);
    console.log(`    Nulos: Esp=${nEsp}, Tema=${nTema}, Foco=${nFoco}, Subfoco=${nSub}`);
    console.log(`    Vazios: Esp=${vEsp}, Tema=${vTema}, Foco=${vFoco}, Subfoco=${vSub}`);
    console.log(`    \"Geral\": Esp=${gEsp}, Tema=${gTema}, Foco=${gFoco}, Subfoco=${gSub}`);
    console.log(`    Genéricos residuais: Outros=${oSub}, Indefinido=${indSub}, Desconhecido=${descSub}`);
    console.log(`    Status: ${totalIssues === 0 ? '✅ 100% LIMPO E HOMOLOGADO' : '⚠️ DETECTADAS ANOMALIAS (' + totalIssues + ')'}\n`);

    auditReport.push({
      table: t.name,
      description: t.type,
      total,
      nulls: { esp: nEsp, tema: nTema, foco: nFoco, subfoco: nSub },
      empty: { esp: vEsp, tema: vTema, foco: vFoco, subfoco: vSub },
      geral: { esp: gEsp, tema: gTema, foco: gFoco, subfoco: gSub },
      genericos: { outros: oSub, indefinido: indSub, desconhecido: descSub },
      totalIssues
    });
  }

  // Rastreamento profundo das tabelas com erros
  console.log('========================================================================');
  console.log('🔍 RASTREAMENTO PROFUNDO DAS ANOMALIAS DETECTADAS');
  console.log('========================================================================\n');

  for (const rep of auditReport) {
    if (rep.totalIssues > 0) {
      console.log(`🔎 Rastreando tabela [${rep.table}]...`);
      // Amostrar questões com problemas
      const sampleGeralSub = await queryRows(rep.table, 'subfoco=ilike.Geral', 5);
      console.log(`  Amostra de registros com subfoco=\"Geral\" (${rep.geral.subfoco} encontrados):`);
      sampleGeralSub.forEach((s, idx) => {
        console.log(`    [${idx+1}] ID: ${s.id} | Código: ${s.code || 'N/A'} | Banca: ${s.banca} | Ano: ${s.year} | Modalidade: ${s.modalidade}`);
        console.log(`        Taxonomia: [Esp: ${s.especialidade}] -> [Tema: ${s.tema}] -> [Foco: ${s.foco}] -> [Subfoco: ${s.subfoco}]`);
      });

      // Distribuição de especialidades nessas questões anômalas
      const sampleDist = await queryRows(rep.table, 'subfoco=ilike.Geral', 100);
      const espCounts = {};
      const modalidadeCounts = {};
      const bancaCounts = {};
      for (const row of sampleDist) {
        espCounts[row.especialidade || 'NULO'] = (espCounts[row.especialidade || 'NULO'] || 0) + 1;
        modalidadeCounts[row.modalidade || 'NULO'] = (modalidadeCounts[row.modalidade || 'NULO'] || 0) + 1;
        bancaCounts[row.banca || 'NULO'] = (bancaCounts[row.banca || 'NULO'] || 0) + 1;
      }
      console.log('  Distribuição da amostra (100 itens):');
      console.log('    Especialidades:', espCounts);
      console.log('    Modalidades:', modalidadeCounts);
      console.log('    Top Bancas:', Object.entries(bancaCounts).slice(0, 5));
      console.log('');
    }
  }

  // Amostragem de validação canônica cruzada nas tabelas ativas (questions e questions_expansion_direto)
  console.log('========================================================================');
  console.log('🌳 VALIDAÇÃO DA ÁRVORE CANÔNICA EM AMOSTRA DE QUESTÕES ATIVAS');
  console.log('========================================================================\n');

  for (const tName of ['questions', 'questions_expansion_direto', 'questions_revalida_base', 'questions_expansion_revalida']) {
    const sample = await queryRows(tName, '', 200);
    let matchedCanonicalEsp = 0;
    let matchedCanonicalTema = 0;
    let matchedCanonicalFoco = 0;
    let matchedCanonicalSubfoco = 0;
    let totalSample = sample.length;

    const unmappedFocos = new Set();
    const unmappedSubfocos = new Set();

    for (const q of sample) {
      const e = (q.especialidade || '').toLowerCase().trim();
      const t = (q.tema || '').toLowerCase().trim();
      const f = (q.foco || '').toLowerCase().trim();
      const s = (q.subfoco || '').toLowerCase().trim();

      if (canonicalSpecialties.has(e)) matchedCanonicalEsp++;
      if (canonicalTemas.has(t)) matchedCanonicalTema++;
      if (canonicalFocos.has(f)) matchedCanonicalFoco++;
      else if (f) unmappedFocos.add(q.foco);

      if (canonicalSubfocos.has(s)) matchedCanonicalSubfoco++;
      else if (s) unmappedSubfocos.add(q.subfoco);
    }

    console.log(`Tabela [${tName}] (Amostra de ${totalSample} itens):`);
    console.log(`  Especialidade canônica: ${matchedCanonicalEsp}/${totalSample} (${Math.round(matchedCanonicalEsp/totalSample*100)}%)`);
    console.log(`  Tema canônico:          ${matchedCanonicalTema}/${totalSample} (${Math.round(matchedCanonicalTema/totalSample*100)}%)`);
    console.log(`  Foco canônico:          ${matchedCanonicalFoco}/${totalSample} (${Math.round(matchedCanonicalFoco/totalSample*100)}%)`);
    console.log(`  Subfoco canônico:       ${matchedCanonicalSubfoco}/${totalSample} (${Math.round(matchedCanonicalSubfoco/totalSample*100)}%)`);
    if (unmappedFocos.size > 0) {
      console.log(`  Exemplos de focos fora da árvore padrão:`, Array.from(unmappedFocos).slice(0, 3));
    }
    if (unmappedSubfocos.size > 0) {
      console.log(`  Exemplos de subfocos fora da árvore padrão:`, Array.from(unmappedSubfocos).slice(0, 3));
    }
    console.log('');
  }

  // Salvar relatório estruturado em JSON para síntese
  fs.writeFileSync('data/relatorio_auditoria_supabase.json', JSON.stringify(auditReport, null, 2), 'utf8');
  console.log('✅ Relatório completo salvo em data/relatorio_auditoria_supabase.json');
}

runDetailedAudit();
