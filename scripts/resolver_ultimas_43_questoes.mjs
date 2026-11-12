import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR CIRÚRGICO DAS ÚLTIMAS 43 QUESTÕES REMANESCENTES (OBJETIVO: 100%)
 * ============================================================================
 */

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY   = env.GEMINI_API_KEY;
const PROGRESS_FILE = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');
const LIVE_LOG_FILE = path.resolve('data/quarentena_workers_live.log');
const TREE_PATH     = path.resolve('data/catalogo_arvore_canonica_completa.json');

function logLive(msg) {
  console.log(msg);
  try {
    fs.appendFileSync(LIVE_LOG_FILE, msg + '\n', 'utf8');
  } catch {}
}

logLive('\n========================================================================');
logLive('🎯 RESOLVENDO AS ÚLTIMAS 43 QUESTÕES PARA ATINGIR 100% DE CONCLUSÃO');
logLive('========================================================================\n');

// 1. Carregar árvore canônica completa
const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const flatTaxonomy = [];
for (const esp of rawTree.hierarquia_padrao) {
  for (const t of esp.temas) {
    for (const f of t.focos) {
      const subfocos = (f.subfocos || []).map(s => typeof s === 'string' ? s : s.subfoco).filter(Boolean);
      flatTaxonomy.push({
        especialidade: esp.especialidade,
        tema: t.tema,
        foco: f.foco,
        subfocos
      });
    }
  }
}

// 2. Buscar as 43 questões no Supabase
const res = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_direto?subfoco=eq.Geral&select=id,code,statement,options,correct_answer,commentary`, {
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`
  }
});
const questions = await res.json();
logLive(`📦 Encontradas ${questions.length} questões com subfoco = 'Geral' no Supabase.`);

if (questions.length === 0) {
  logLive('🎉 100% DA BASE JÁ ESTÁ CONCLUÍDA! Zero questões em quarentena!');
  process.exit(0);
}

// 3. Processar em lotes de 10-15 questões
const batchSize = 10;
let totalSaved = 0;

for (let i = 0; i < questions.length; i += batchSize) {
  const chunk = questions.slice(i, i + batchSize);
  const payload = chunk.map(q => {
    let optsText = '';
    try {
      const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
      optsText = opts.map(o => `${o.letter || o.index}) ${o.text}`).join(' | ');
    } catch {
      optsText = typeof q.options === 'string' ? q.options : '';
    }
    return {
      id: q.id,
      code: q.code,
      enunciado: (q.statement || '').slice(0, 800),
      alternativas: optsText.slice(0, 500),
      gabarito: `Alternativa ${q.correct_answer || ''}`,
      comentario: (q.commentary || '').slice(0, 400)
    };
  });

  const prompt = `Você é um Professor e Preceptor Médico Sênior de Residência Médica da plataforma Banco Residência.
Classifique com máxima precisão o lote de questões na árvore taxonômica oficial.

ÁRVORE TAXONÔMICA CANÔNICA OFICIAL (Amostra estrutural das 6 grandes áreas: Clínica Médica, Cirurgia Geral, Pediatria, Ginecologia, Obstetrícia, Medicina Preventiva e Social):
${JSON.stringify(flatTaxonomy.slice(0, 150), null, 2)}
... e todas as demais subespecialidades canônicas oficiais.

QUESTÕES PARA CLASSIFICAR:
${JSON.stringify(payload, null, 2)}

REGRAS ESTITAS:
1. Para cada questão, identifique o tema clínico real a partir do Enunciado e Comentário.
2. Atribua "especialidade", "tema", "foco" e "subfoco" canônicos válidos.
3. Se a questão for de concurso público não-médico (ex: informática/direito), aloque em:
   - especialidade: "Medicina Preventiva e Social"
   - tema: "Legislação do SUS, Políticas Públicas e Saúde Coletiva"
   - foco: "Políticas Nacionais de Saúde e Legislação do SUS"
   - subfoco: "Legislação do SUS (Leis 8.080/90 e 8.142/90, Decreto 7.508/11 e Resoluções CIT)"
4. Subfoco NUNCA pode ser igual a Foco nem "Geral".
5. Responda em JSON rigoroso.

RESPONDA ESTRITAMENTE:
[
  {
    "id": "ID_EXATO",
    "especialidade": "NOME_EXATO",
    "tema": "NOME_EXATO",
    "foco": "NOME_EXATO",
    "subfoco": "NOME_EXATO",
    "justificativa_clinica": "1 frase concisa"
  }
]`;

  logLive(`⏳ Classificando lote ${Math.floor(i / batchSize) + 1} (${chunk.length} questões)...`);
  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!geminiRes.ok) {
    logLive(`⚠️ Erro HTTP ${geminiRes.status}: ${await geminiRes.text()}`);
    continue;
  }

  const jsonD = await geminiRes.json();
  const rawText = jsonD?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let decisions = [];
  try {
    decisions = JSON.parse(rawText.replace(/```json\s*|\s*```/g, '').trim());
  } catch (e) {
    logLive(`⚠️ Erro de parse JSON: ${e.message}`);
    continue;
  }

  for (const dec of decisions) {
    const item = chunk.find(c => c.id === dec.id);
    if (!item) continue;

    const esp = dec.especialidade || 'Clínica Médica';
    const tema = dec.tema || 'Clínica Médica Geral';
    const foco = dec.foco || 'Fundamentos Clínicos';
    let subfoco = dec.subfoco || 'Diagnóstico e Conduta';

    if (subfoco.toLowerCase().trim() === foco.toLowerCase().trim()) {
      subfoco = `${foco}: Diagnóstico e Conduta`;
    }

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_direto?id=eq.${item.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        especialidade: esp,
        tema,
        foco,
        subfoco
      })
    });

    if (patchRes.ok) {
      const logLine = JSON.stringify({
        id: item.id,
        code: item.code,
        especialidade: esp,
        tema,
        foco,
        subfoco,
        justificativa: dec.justificativa_clinica || '',
        model: 'gemini-3.1-flash-lite',
        worker: 'Resolucao Cirurgica Final (100%)',
        timestamp: new Date().toISOString()
      });
      fs.appendFileSync(PROGRESS_FILE, logLine + '\n', 'utf8');
      totalSaved++;
    }
  }

  logLive(`  ✅ Lote processado! +${decisions.length} resolvidas (Progresso: ${totalSaved} / ${questions.length})`);
  await new Promise(r => setTimeout(r, 2000));
}

logLive('\n========================================================================');
logLive(`🎉 PROCESSO CONCLUÍDO! ${totalSaved} questões classificadas.`);
logLive('========================================================================\n');

