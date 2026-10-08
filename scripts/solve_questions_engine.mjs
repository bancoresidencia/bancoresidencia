import fs from 'fs';
import path from 'path';

// Carrega variáveis do .env.local prioritariamente
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// .env.local tem precedência absoluta sobre o ambiente anterior
const rawKeys = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const API_KEYS = rawKeys
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

let keyIndex = 0;
function getNextApiKey() {
  if (API_KEYS.length === 0) return '';
  const k = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return k;
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CATALOG_PATH = path.resolve('src/data/medicalKnowledgeCatalog.json');

if (API_KEYS.length === 0) {
  console.error('❌ ERRO: Nenhuma GEMINI_API_KEY encontrada nas variáveis de ambiente.');
  process.exit(1);
}

// Catálogo de Livros da Base Médica
let catalog = null;
if (fs.existsSync(CATALOG_PATH)) {
  try {
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  } catch {}
}

/**
 * Filtra termos ou menções comerciais indevidas
 */
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/estrat[ée]gia\s*med/gi, 'Base Médica Teórica')
    .replace(/estrat[ée]gia\s*vestibulares/gi, 'Base Teórica')
    .replace(/estrat[ée]gia/gi, 'Literatura Médica Oficial')
    .replace(/medevo/gi, 'Banca de Residência');
}

/**
 * Encontra temas e livros da base médica relevantes para a questão
 */
function getRelevantBookThemes(specialty, tema) {
  if (!catalog || !catalog.specialties) return [];
  const specKey = Object.keys(catalog.specialties).find(
    s => s.toLowerCase() === (specialty || '').toLowerCase()
  );
  if (!specKey) return [];

  const books = catalog.specialties[specKey] || [];
  if (!tema) return books.slice(0, 3).map(b => b.theme);

  const tLower = tema.toLowerCase();
  const matched = books.filter(b => {
    const bTheme = b.theme.toLowerCase();
    return bTheme.includes(tLower) || tLower.includes(bTheme);
  });

  if (matched.length > 0) {
    return matched.map(b => b.theme);
  }
  return books.slice(0, 3).map(b => b.theme);
}

// Modelos prioritários: gemini-3.5-flash provou ser o mais rápido e compatível
const AVAILABLE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];
let currentModelIndex = 0;

function getActiveModel() {
  return AVAILABLE_MODELS[currentModelIndex % AVAILABLE_MODELS.length];
}

function rotateModel(reason = '') {
  currentModelIndex = (currentModelIndex + 1) % AVAILABLE_MODELS.length;
  console.log(`🔄 Alternando modelo para: ${AVAILABLE_MODELS[currentModelIndex]} ${reason ? '(' + reason + ')' : ''}`);
}

/**
 * Resolve e gera a fundamentação pedagógica profunda de uma única questão
 * garantindo o PRINCÍPIO DO GABARITO IMUTÁVEL (ÂNCORA DE OURO)
 */
export async function solveQuestionDeep(question) {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const formattedOptions = (question.options || [])
    .map(opt => `${opt.letter}) ${opt.text}`)
    .join('\n');

  // Trava de Ouro: Identifica o gabarito oficial real pré-existente
  const goldAnswer = (question.correctAnswer || question.correct_answer || '').toUpperCase().trim();
  if (!goldAnswer) {
    throw new Error(`Questão ${question.id} não possui gabarito oficial da banca definido. Pelo Princípio da Âncora de Ouro, a IA é proibida de adivinhar gabaritos.`);
  }

  const goldOption = (question.options || []).find(o => o.letter === goldAnswer);
  const goldOptionText = goldOption ? goldOption.text : '';

  const themes = getRelevantBookThemes(question.especialidade, question.tema);
  const themesStr = themes.length > 0 ? themes.join(', ') : question.tema || question.especialidade;

  const prompt = `Você é um preceptor médico de elite e especialista em provas oficiais de Residência Médica e Revalida no Brasil.
Sua missão é fundamentar tecnicamente a questão e o gabarito oficial da banca examinadora com rigor acadêmico máximo, 100% de precisão e profundidade clínica.

Dados da Questão:
- Instituição/Banca: ${question.institution || question.banca || 'Oficial'} (${question.year || 2024})
- Especialidade: ${question.especialidade || 'Clínica'}
- Tema/Foco: ${question.tema || ''} - ${question.foco || ''}
- Tópicos de Referência dos Livros Médicos: ${themesStr}

Enunciado:
${question.statement}

Alternativas:
${formattedOptions}

🔒 PRINCÍPIO DO GABARITO IMUTÁVEL (ÂNCORA DE OURO DA BANCA EXAMINADORA):
- O GABARITO OFICIAL HISTÓRICO DEFINITIVO DA BANCA EXAMINADORA É A ALTERNATIVA ${goldAnswer}: "${goldOptionText}".
- REGRA ABSOLUTA: VOCÊ NÃO DEVE ESCOLHER OUTRA ALTERNATIVA NEM DISCORDAR DA BANCA. O gabarito oficial considerado pelo concurso É A ALTERNATIVA ${goldAnswer}.
- Sua tarefa como preceptor é EXPLICAR e FUNDAMENTAR com a literatura médica por que a banca deu a Alternativa ${goldAnswer} como correta, dissecando os erros de todos os outros distratores.

DIRETRIZES FUNDAMENTAIS DE ELABORAÇÃO:
1. FUNDAMENTAÇÃO DA ALTERNATIVA CORRETA (${goldAnswer}):
   - Justifique em detalhes os fundamentos fisiopatológicos, critérios diagnósticos, escores de gravidade ou condutas preconizadas que embasam a escolha da banca.
2. DISSECAÇÃO DOS DISTRATORES INCORRETOS:
   - Dissequilhe especificamente o erro de cada uma das outras opções incorretas (dose errada, tempo incorreto, contraindicação, confusão de conceitos).
3. EVOLUÇÃO DE DIRETRIZES & MUDANÇAS HISTÓRICAS (COMO ERA ANTES vs O QUE FICOU DEPOIS):
   - Avalie minuciosamente o ano da prova (${question.year || 2024}) e verifique se as diretrizes daquela época mudaram em relação aos dias de hoje.
   - SE HOUVE MUDANÇA DE DIRETRIZ OU CONDUTA:
     * Explique claramente "COMO ERA NA ÉPOCA DA PROVA" (o motivo exato pelo qual a banca considerou a alternativa ${goldAnswer} correta naquele ano).
     * Explique detalhadamente "O QUE MUDOU E COMO É HOJE" (as diretrizes atuais e condutas contemporâneas vigentes).
     * Esclareça para o aluno como esse tema é cobrado atualmente nas provas de residência médica para não haver confusão no estudo.
   - SE A DIRETRIZ PERMANECE IGUAL:
     * Aponte expressamente que o protocolo permanece pleno e totalmente convergente com as diretrizes e literatura vigentes.
4. COMENTÁRIO FINAL / SÍNTESE CLÍNICA: Redija um texto unificado que sintetize o raciocínio clínico completo do caso, integrando anamnese, exame físico e conduta médica.
5. PRINCIPAL MOTIVO QUE PODERIA LEVAR O ALUNO A ERRAR: Identifique a armadilha ("pegadinha") clássica, o distrator mais tentador ou a confusão comum de raciocínio.
6. TAKE-HOME MESSAGE: Forneça uma pérola prática/mnemônica de alto impacto em 1 a 2 frases para retenção rápida na memória.
7. EMBASAMENTO & REFERÊNCIAS: Cite nominalmente os livros médicos clássicos de referência e/ou diretrizes oficiais de sociedades brasileiras ou mundiais (ex: Sabiston Tratado de Cirurgia, Nelson Tratado de Pediatria, Diretrizes FEBRASGO, Tratado de Medicina de Família, Protocolos do Ministério da Saúde).
8. REGRA ABSOLUTA: JAMAIS cite nomes de cursinhos ou marcas comerciais (como "estratégiamed"). Baseie-se unicamente nas obras médicas, diretrizes oficiais e na ciência.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "optionExplanations": {
    "A": "Justificativa da alternativa A...",
    "B": "Justificativa da alternativa B...",
    "C": "Justificativa da alternativa C...",
    "D": "Justificativa da alternativa D..."
  },
  "finalCommentary": "Síntese clínica unificada do professor...",
  "mainErrorReason": "O principal motivo que leva o aluno ao erro nesta questão é...",
  "takeHomeMessage": "Pérola clínica prática para memorização...",
  "guidelineEvolution": "Como era na época da prova vs o que mudou e como é hoje...",
  "references": [
    "Nome da Obra ou Diretriz Oficial 1",
    "Nome da Obra ou Diretriz Oficial 2"
  ]
}`;

  for (let attempt = 1; attempt <= 8; attempt++) {
    const activeKey = getNextApiKey();
    const activeModel = getActiveModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.15
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) {
          if (errText.includes('RESOURCE_EXHAUSTED') || errText.includes('Quota exceeded')) {
            rotateModel('cota 429 esgotada');
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          const backoffWait = Math.min(attempt * 2000, 6000);
          await new Promise(r => setTimeout(r, backoffWait));
          continue;
        }
        if (res.status === 503 || res.status === 500) {
          rotateModel(`HTTP ${res.status} alta demanda`);
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        if (res.status === 404) {
          rotateModel('modelo 404');
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Resposta vazia da API');

      const parsed = JSON.parse(rawText);

      // Trava Irrevogável: o gabarito É SEMPRE a âncora de ouro da banca
      const correctAnswer = goldAnswer;
      const optionExplanations = {};
      if (parsed.optionExplanations) {
        for (const [letter, exp] of Object.entries(parsed.optionExplanations)) {
          optionExplanations[letter.toUpperCase()] = sanitizeText(exp);
        }
      }

      const finalCommentary = sanitizeText(parsed.finalCommentary || '');
      const mainErrorReason = sanitizeText(parsed.mainErrorReason || '');
      const takeHomeMessage = sanitizeText(parsed.takeHomeMessage || '');
      const guidelineEvolution = sanitizeText(parsed.guidelineEvolution || '');
      const references = Array.isArray(parsed.references)
        ? parsed.references.map(sanitizeText).filter(Boolean)
        : [];

      // Monta o commentary formatado completo e elegante
      const formattedCommentary = [
        `Gabarito Oficial: Alternativa ${correctAnswer}.\n`,
        `Resumo Clínico e Diagnóstico:\n${finalCommentary}\n`,
        `Análise das Alternativas:\n` +
          Object.entries(optionExplanations)
            .map(([letra, exp]) => `• Alternativa ${letra}: ${exp}`)
            .join('\n') +
          '\n',
        mainErrorReason ? `Principal Motivo que Leva ao Erro:\n${mainErrorReason}\n` : '',
        takeHomeMessage ? `Take-Home Message (Pérola Prática):\n${takeHomeMessage}\n` : '',
        guidelineEvolution ? `Evolução de Diretrizes & Contexto Histórico da Banca:\n${guidelineEvolution}\n` : '',
        references.length > 0 ? `Referências Teóricas:\n` + references.map(r => `• ${r}`).join('\n') : ''
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      // Atualiza as opções da questão com a propriedade explanation
      const updatedOptions = (question.options || []).map(opt => ({
        ...opt,
        explanation: optionExplanations[opt.letter] || ''
      }));

      return {
        id: question.id,
        correctAnswer,
        correct_answer: correctAnswer,
        commentary: formattedCommentary,
        mainErrorReason,
        takeHomeMessage,
        guidelineEvolution,
        references,
        options: updatedOptions
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        rotateModel('timeout 60s');
        continue;
      }
      if (attempt < 4) {
        const wait = attempt * 1500;
        await new Promise(r => setTimeout(r, wait));
      } else {
        console.error(`❌ Falha na questão ${question.id}: ${err.message}`);
        return null;
      }
    }
  }
  return null;
}

/**
 * Atualiza um lote de questões no Supabase
 */
export async function updateQuestionsInSupabase(updatedQuestions) {
  if (!SUPABASE_URL || !SERVICE_KEY) return false;

  const url = `${SUPABASE_URL}/rest/v1/questions`;
  const records = updatedQuestions.map(q => ({
    id: q.id,
    statement: q.statement || 'Enunciado da questão',
    options: q.options || [],
    correct_answer: q.correctAnswer || q.correct_answer,
    commentary: q.commentary,
    institution: q.institution || q.banca || 'Oficial',
    year: q.year || 2024,
    especialidade: q.especialidade || 'Urologia',
    tema: q.tema || '',
    foco: q.foco || '',
    subfoco: q.subfoco || ''
  }));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(records)
    });
    return res.ok;
  } catch (err) {
    console.error('Erro ao atualizar Supabase:', err.message);
    return false;
  }
}
