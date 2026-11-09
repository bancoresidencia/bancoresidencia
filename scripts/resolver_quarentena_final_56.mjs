import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * RESOLVEDOR FINAL DAS 56 QUESTÕES RESTANTES (ARREMATE TOTAL)
 * ========================================================================
 * 
 * Escopo:
 *   - 10 questões de Clínica Médica ('Envenenamentos')
 *   - 46 questões de Ginecologia ('Miscelâneas')
 * 
 * Regras Estritas:
 *   - Classifica Foco Canônico e Subfoco Canônico (Nível 4).
 *   - novo_sub_subfoco = NULL (Nível 5 neutro).
 *   - 4 Pilares Clínicos (Enunciado + Alternativas + Comentários + Gabarito).
 *   - Zero sufixos ': Diagnóstico e Conduta'.
 *   - Commit atômico no SQLite.
 */

const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const GEMINI_API_KEY = env.GEMINI_API_KEY || env.GEMINI_API_KEY_1;
const DB_PATH        = path.resolve('data/questoes_132k.db');
const TREE_PATH      = path.resolve('data/catalogo_arvore_canonica_completa.json');
const IS_EXECUTE     = process.argv.includes('--execute');
const GEMINI_MODEL   = 'gemini-3.1-flash-lite';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não encontrada em .env.local');
  process.exit(1);
}

const tree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const db   = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

// Mapeamentos canônicos para os 4 grupos finais
function getBranchForGroup(espName, focoName) {
  const espNode = tree.hierarquia_padrao.find(e => e.especialidade.toLowerCase() === espName.toLowerCase());
  if (!espNode) return null;

  if (focoName === 'Envenenamentos') {
    return {
      type: 'TOXICOLOGY_SPECIAL',
      options: [
        {
          especialidade: 'Medicina Preventiva e Social',
          tema: 'Saúde do Trabalhador e Riscos Ocupacionais',
          foco: 'Intoxicações Ocupacionais (Metais Pesados, Benzeno e Agrotóxicos)',
          subfocos: [
            'Saturnismo (Chumbo) e Mercurialismo (Mercúrio)',
            'Benzenismo e Intoxicação por Agrotóxicos no Meio Rural'
          ]
        },
        {
          especialidade: 'Clínica Médica',
          tema: 'Toxicologia Clínica (Intoxicações e Envenenamentos)',
          foco: 'Intoxicação por Agrotóxicos e Álcoois Tóxicos (Metanol, Etilenoglicol)',
          subfocos: [
            'Intoxicação por Inibidores da Colinesterase (Organofosforados e Carbamatos)',
            'Álcoois Tóxicos: Metanol e Etilenoglicol (Fomepizol e Etanol)'
          ]
        },
        {
          especialidade: 'Clínica Médica',
          tema: 'Toxicologia Clínica (Intoxicações e Envenenamentos)',
          foco: 'Síndromes Tóxicas (Anticolinérgica, Colinérgica, Simpaticomimética, Opioide)',
          subfocos: [
            'Síndrome Colinérgica e Síndrome Anticolinérgica',
            'Síndrome Simpaticomimética (Cocaína, Anfetaminas) vs Síndrome Serotoninérgica'
          ]
        },
        {
          especialidade: 'Clínica Médica',
          tema: 'Toxicologia Clínica (Intoxicações e Envenenamentos)',
          foco: 'Intoxicações por Medicamentos (Paracetamol, Benzodiazepínicos, Antidepressivos)',
          subfocos: [
            'Intoxicação por Paracetamol (Acetaminofeno) e N-Acetilcisteína',
            'Intoxicação por Antidepressivos Tricíclicos (ADT) e Bicarbonato de Sódio'
          ]
        },
        {
          especialidade: 'Clínica Médica',
          tema: 'Toxicologia Clínica (Intoxicações e Envenenamentos)',
          foco: 'Acidentes por Animais Peçonhentos (Ofídico, Escorpiônico, Aracnídico)',
          subfocos: [
            'Acidentes Ofídicos no Brasil: Botrópico, Crotálico, Laquético e Elapídico',
            'Escorpionismo (Tityus serrulatus) e Araneísmo (Loxosceles e Phoneutria)'
          ]
        }
      ]
    };
  }

  if (focoName === 'Miscelânea em Infecções Ginecológicas') {
    const temaNode = espNode.temas.find(t => t.tema.includes('Infecções Ginecológicas'));
    return {
      type: 'FOCO_AND_SUBFOCO',
      especialidade: espNode.especialidade,
      tema: temaNode.tema,
      focos: temaNode.focos.map(f => ({
        foco: f.foco,
        subfocos: f.subfocos.map(s => s.subfoco || s.nome || s).filter(s => !s.includes(': Diagnóstico e Conduta'))
      }))
    };
  }

  if (focoName === 'Miscelânea em Sangramento Uterino Anormal') {
    const temaNode = espNode.temas.find(t => t.tema.includes('Sangramento Uterino Anormal'));
    return {
      type: 'FOCO_AND_SUBFOCO',
      especialidade: espNode.especialidade,
      tema: temaNode.tema,
      focos: temaNode.focos.map(f => ({
        foco: f.foco,
        subfocos: f.subfocos.map(s => s.subfoco || s.nome || s).filter(s => !s.includes(': Diagnóstico e Conduta'))
      }))
    };
  }

  if (focoName === 'Miscelânea em Afecções Benignas Ginecológicas') {
    const temaNode = espNode.temas.find(t => t.tema.includes('Afecções Benignas'));
    return {
      type: 'FOCO_AND_SUBFOCO',
      especialidade: espNode.especialidade,
      tema: temaNode.tema,
      focos: temaNode.focos.map(f => ({
        foco: f.foco,
        subfocos: f.subfocos.map(s => s.subfoco || s.nome || s).filter(s => !s.includes(': Diagnóstico e Conduta'))
      }))
    };
  }

  return null;
}

// Busca questões na quarentena
const remainingQuestions = db.prepare(`
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         statement, options, correct_answer, commentary
  FROM questions
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
  ORDER BY id ASC;
`).all();

console.log(`📋 Total de questões para arremate: ${remainingQuestions.length}`);

if (remainingQuestions.length === 0) {
  console.log('🎉 Quarentena já zerada! Nada a fazer.');
  db.close();
  process.exit(0);
}

// Agrupamento por foco
const groups = new Map();
for (const q of remainingQuestions) {
  if (!groups.has(q.foco)) groups.set(q.foco, []);
  groups.get(q.foco).push(q);
}

// Chamada Gemini
async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 3000
      }
    }),
    signal: AbortSignal.timeout(45000)
  });

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  let clean = (text || '').trim();
  if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  else if (clean.startsWith('```')) clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  return JSON.parse(clean);
}

const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions
  SET especialidade          = ?,
      novo_tema              = ?,
      novo_foco              = ?,
      novo_subfoco           = ?,
      novo_sub_subfoco       = NULL,
      status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM',
      motivo_regra           = ?
  WHERE id = ?;
`) : null;

let totalResolved = 0;

for (const [focoName, qList] of groups.entries()) {
  const branch = getBranchForGroup(qList[0].especialidade, focoName);
  if (!branch) {
    console.warn(`⚠️ Sem branch canônico mapeado para: ${focoName}`);
    continue;
  }

  console.log(`\n🩺 Processando ${qList.length} questões de [${qList[0].especialidade} -> ${focoName}]...`);

  // Em lotes de 5
  for (let i = 0; i < qList.length; i += 5) {
    const chunk = qList.slice(i, i + 5);
    const questionsPayload = chunk.map(q => {
      let optsText = '';
      try {
        const opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
        optsText = opts.map(o => `${o.letter}) ${o.text}`).join(' | ');
      } catch (_) {}

      return {
        id: q.id,
        enunciado: (q.statement || '').slice(0, 800),
        alternativas: optsText.slice(0, 600),
        comentarios: (q.commentary || 'Sem comentário').slice(0, 500),
        gabarito: `Alternativa ${q.correct_answer || ''}`
      };
    });

    let prompt = '';
    if (branch.type === 'TOXICOLOGY_SPECIAL') {
      prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique cada questão na opção taxonômica canônica correta (Especialidade, Tema, Foco e Subfoco).
Analise o Enunciado, as Alternativas, os Comentários e o Gabarito oficial.

OPÇÕES CANÔNICAS DISPONÍVEIS:
${JSON.stringify(branch.options, null, 2)}

QUESTÕES A CLASSIFICAR:
${JSON.stringify(questionsPayload, null, 2)}

Responda ESTRITAMENTE em JSON:
{
  "decisoes": [
    {
      "id": "ID_EXATO",
      "especialidade_escolhida": "NOME_EXATO_DA_ESPECIALIDADE",
      "tema_escolhido": "NOME_EXATO_DO_TEMA",
      "foco_escolhido": "NOME_EXATO_DO_FOCO",
      "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
      "justificativa_clinica": "1 frase concisa"
    }
  ]
}`;
    } else {
      prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique cada questão no Foco e Subfoco corretos do Tema abaixo.
Analise o Enunciado, as Alternativas, os Comentários e o Gabarito oficial.

ESPECIALIDADE: ${branch.especialidade}
TEMA: ${branch.tema}

ESTRUTURA CANÔNICA DE FOCOS E SUBFOCOS DISPONÍVEIS:
${JSON.stringify(branch.focos, null, 2)}

QUESTÕES:
${JSON.stringify(questionsPayload, null, 2)}

Responda ESTRITAMENTE em JSON:
{
  "decisoes": [
    {
      "id": "ID_EXATO",
      "foco_escolhido": "NOME_EXATO_DO_FOCO",
      "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
      "justificativa_clinica": "1 frase concisa"
    }
  ]
}`;
    }

    try {
      const result = await callGemini(prompt);
      const decisoes = result.decisoes || result.decisions || (Array.isArray(result) ? result : []);

      if (IS_EXECUTE) db.exec('BEGIN IMMEDIATE TRANSACTION;');

      for (const q of chunk) {
        const d = decisoes.find(dec => String(dec.id).trim() === String(q.id).trim());
        if (!d) continue;

        let finalEsp  = branch.type === 'TOXICOLOGY_SPECIAL' ? (d.especialidade_escolhida || branch.options[0].especialidade) : branch.especialidade;
        let finalTema = branch.type === 'TOXICOLOGY_SPECIAL' ? (d.tema_escolhido || branch.options[0].tema) : branch.tema;
        let finalFoco = branch.type === 'SUBFOCO_ONLY' ? branch.foco : d.foco_escolhido;
        let finalSub  = d.subfoco_escolhido;

        if (!finalFoco || !finalSub) continue;
        if (finalSub.includes(': Diagnóstico e Conduta')) {
          finalSub = finalSub.replace(': Diagnóstico e Conduta', '').trim();
        }
        if (finalSub.toLowerCase() === finalFoco.toLowerCase()) continue;

        if (IS_EXECUTE && updateStmt) {
          updateStmt.run(
            finalEsp,
            finalTema,
            finalFoco,
            finalSub,
            `[Arremate Final Gemini 3.1 Flash] ${d.justificativa_clinica || 'Classificação de precisão'}`,
            q.id
          );
        }
        totalResolved++;
        console.log(`  ✅ [${q.id.slice(0, 8)}] -> ${finalEsp} | Foco: ${finalFoco} | Subfoco: ${finalSub}`);
      }

      if (IS_EXECUTE) db.exec('COMMIT;');
      await new Promise(r => setTimeout(r, 4500)); // Pacing seguro
    } catch (err) {
      if (IS_EXECUTE) try { db.exec('ROLLBACK;'); } catch (_) {}
      console.error(`  ❌ Erro no lote:`, err.message);
    }
  }
}

console.log(`\n========================================================================`);
console.log(`🏁 ARREMATE CONCLUÍDO: ${totalResolved} questões classificadas!`);
console.log(`========================================================================\n`);

db.close();
