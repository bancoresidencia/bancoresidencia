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
// Carrega todas as chaves disponíveis no pool para rotação paralela
const API_KEYS = [
  env.GEMINI_API_KEY_1,
  env.GEMINI_API_KEY_2,
  env.GEMINI_API_KEY_3,
  env.GEMINI_API_KEY_4,
  env.GEMINI_API_KEY_5,
  env.GEMINI_API_KEY
].filter((k, idx, self) => k && self.indexOf(k) === idx);

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

  const specObj = catalog.specialties[specKey];
  const books = Array.isArray(specObj) ? specObj : (specObj?.books || []);
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

// Modelos prioritários com alta velocidade, raciocínio clínico e cotas ativas
const AVAILABLE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash'
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

  const optionsSchemaExample = (question.options || [])
    .map(o => `    "${o.letter}": "Justificativa da alternativa ${o.letter}..."`)
    .join(',\n');

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
1. JUSTIFICATIVAS DAS ALTERNATIVAS (OBRIGATÓRIO PARA 100% DAS LETRAS: ${(question.options || []).map(o => o.letter).join(', ')}):
   - OBRIGATORIEDADE ABSOLUTA: Forneça justificativa completa para TODAS as alternativas existentes (${(question.options || []).map(o => o.letter).join(', ')}), INCLUINDO SEMPRE A ALTERNATIVA E (se houver). NUNCA omita nenhuma opção nem deixe texto vazio ou incompleto.
   - DESTAQUE EM NEGRITO OBRIGATÓRIO: Em TODAS as alternativas incorretas, você DEVE obrigatoriamente colocar em **negrito** o trecho específico incorreto ou o conceito errôneo que invalida a opção. Na alternativa correta (${goldAnswer}), destaque em **negrito** o conceito-chave padrão-ouro ou conduta mandatória.
   - SEM METARRETÓRICA: Vá DIRETO ao raciocínio clínico. NUNCA inicie com "A alternativa está correta/incorreta" ou "Incorreta porque". Comece imediatamente justificando os critérios clínicos, doses e diretrizes.
2. VERIFICAÇÃO DE COERÊNCIA HISTÓRICA DO GABARITO DA BANCA:
   - Avalie se a resposta oficial faz sentido segundo a literatura na época da prova (${question.year || 2024}).
   - Se o gabarito oficial for flagrantemente absurdo ou erro manifesto da banca: marque "isAbsurdKey": true e descreva em "divergenceReason" a fundamentação para curadoria/recurso. Caso contrário, mantenha "isAbsurdKey": false.
3. COMENTÁRIO FINAL / SÍNTESE CLÍNICA:
   - Comece DIRETO no raciocínio clínico, fisiopatologia e conduta, destacando em **negrito** os termos essenciais. NUNCA escreva títulos como "Gabarito Oficial: Alternativa X" nem "Resumo Clínico e Diagnóstico:".
4. PRINCIPAL MOTIVO DE ERRO:
   - Identifique a armadilha ("pegadinha") ou confusão comum de raciocínio de forma cirúrgica, destacando em **negrito** o ponto de confusão.
5. TAKE-HOME MESSAGE:
   - Mensagem-chave em 1 a 2 frases densas com destaque em **negrito** (NÃO inclua o prefixo "Pérola Prática").
6. EVOLUÇÃO DE DIRETRIZES:
   - Compare a diretriz da época com a atual (ou informe que permanece igual). NÃO use a expressão "da Banca" nem "Contexto Histórico".
7. REFERÊNCIAS:
   - Liste apenas nomes das diretrizes oficiais e tratados médicos clássicos (sem resumos teóricos genéricos).
8. REGRA ABSOLUTA: JAMAIS cite nomes de cursinhos ou marcas comerciais.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "optionExplanations": {
${optionsSchemaExample}
  },
  "isAbsurdKey": false,
  "divergenceReason": "",
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

      let parsed = null;
      try {
        let clean = rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const firstB = clean.indexOf('{');
        const lastB = clean.lastIndexOf('}');
        if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
          clean = clean.slice(firstB, lastB + 1);
        }
        parsed = JSON.parse(clean);
      } catch {
        // Tenta sanitizar vírgulas trailing antes de fechar chaves/colchetes
        try {
          const sanitized = rawText
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          const firstB = sanitized.indexOf('{');
          const lastB = sanitized.lastIndexOf('}');
          parsed = JSON.parse(sanitized.slice(firstB, lastB + 1));
        } catch (e) {
          throw new Error(`JSON inválido retornado pelo modelo: ${e.message}`);
        }
      }

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
        parsed.isAbsurdKey && parsed.divergenceReason
          ? `[POSSÍVEL ERRO DE GABARITO / QUESTÃO PASSÍVEL DE ANULAÇÃO]\n${sanitizeText(parsed.divergenceReason)}\n`
          : '',
        finalCommentary ? `${finalCommentary}\n` : '',
        mainErrorReason ? `Principal Motivo de Erro:\n${mainErrorReason}\n` : '',
        takeHomeMessage ? `Take-Home Message:\n${takeHomeMessage}\n` : '',
        guidelineEvolution ? `Evolução de Diretrizes:\n${guidelineEvolution}\n` : '',
        references.length > 0 ? `Referências:\n` + references.map(r => `• ${r}`).join('\n') : ''
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      // Atualiza as opções da questão com a propriedade explanation garantindo 100% de preenchimento e negrito em todas
      const updatedOptions = (question.options || []).map(opt => {
        let exp = (optionExplanations[opt.letter] || '').trim();
        const isCorrect = opt.letter === correctAnswer;

        if (!exp) {
          if (isCorrect) {
            exp = finalCommentary || `**Alternativa correta**. Conduta diagnóstica e terapêutica padrão-ouro preconizada pelas diretrizes oficiais de referência para o quadro clínico apresentado.`;
          } else {
            exp = `**Alternativa incorreta**. Esta afirmativa não corresponde à conduta preconizada na literatura médica, divergindo do gabarito oficial homologado pela banca examinadora (**Alternativa ${correctAnswer}**).`;
          }
        }

        // Garante destaque em negrito se a IA não tiver inserido
        if (!exp.includes('**')) {
          const firstPeriod = exp.indexOf('.');
          if (firstPeriod > 10) {
            exp = `**${exp.slice(0, firstPeriod + 1)}**${exp.slice(firstPeriod + 1)}`;
          } else {
            exp = `**${exp}**`;
          }
        }

        return {
          ...opt,
          explanation: exp
        };
      });

      return {
        ...question,
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
    especialidade: q.especialidade || 'Medicina',
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
