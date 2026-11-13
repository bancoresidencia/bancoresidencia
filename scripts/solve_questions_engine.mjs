import fs from 'fs';
import path from 'path';

// Carrega variáveis de ambiente (Cloud Run / Docker) e .env.local (desenvolvimento local)
const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// CHAVE PAGA BLOQUEADA POR SEGURANÇA CONFORME SOLICITAÇÃO DO USUÁRIO (CUSTO R$ 0,00)
export const PAID_KEY = ''; 

const paidValues = new Set([
  env.GEMINI_API_KEY_PAID,
  env.GEMINI_API_KEY_ON_DEMAND
].filter(Boolean));

// Carrega ESTRITAMENTE as chaves GRATUITAS (bloqueia 100% a chave paga)
const rawKeys = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .filter(k => !k.includes('PAID') && !k.includes('DEMAND') && !k.includes('BILLING'))
  .sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
    const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
    return numA - numB;
  })
  .map(k => env[k])
  .filter(k => k && !paidValues.has(k) && !k.endsWith('Ukug') && !k.endsWith('rO9A') && !k.endsWith('Myxw'));

export const API_KEYS = rawKeys.filter((k, idx, self) => self.indexOf(k) === idx);

console.log(`🔒 MODO 100% GRATUITO ATIVO: Chave paga BLOQUEADA. ${API_KEYS.length} chaves gratuitas em rotação.`);

let keyIndex = 0;
export function getNextApiKey() {
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
export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/estrat[ée]gia\s*med/gi, 'Base Médica Teórica')
    .replace(/estrat[ée]gia\s*vestibulares/gi, 'Base Teórica')
    .replace(/estrat[ée]gia/gi, 'Literatura Médica Oficial')
    .replace(/medcurso/gi, 'Diretrizes Oficiais')
    .replace(/sanar/gi, 'Consenso Clínico')
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

/**
 * Converte imagens locais ou remotas para inlineData (base64) compatível com Gemini Vision
 */
export async function fetchImagePart(imgUrl) {
  if (!imgUrl) return null;
  try {
    if (imgUrl.startsWith('http')) {
      const res = await fetch(imgUrl);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      return {
        inlineData: {
          mimeType: contentType.split(';')[0],
          data: buffer.toString('base64')
        }
      };
    } else {
      let localPath = path.resolve(imgUrl.replace(/^\//, ''));
      if (!fs.existsSync(localPath)) {
        localPath = path.resolve('public', imgUrl.replace(/^\//, ''));
      }
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase().replace('.', '');
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        return {
          inlineData: {
            mimeType,
            data: buffer.toString('base64')
          }
        };
      }
    }
  } catch (err) {
    console.warn(`[Vision] Falha ao carregar imagem ${imgUrl}:`, err.message);
  }
  return null;
}

/**
 * Atribui o preceptor médico especialista amplo e suas diretrizes oficiais
 */
export function getSpecialtyGuideline(specialty, tema) {
  const spec = (specialty || '').toLowerCase();
  const t = (tema || '').toLowerCase();

  if (spec.includes('urolog') || t.includes('urolog')) {
    return 'Você é um Urologista e Cirurgião Geral, preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Urologia (SBU), American Urological Association (AUA) e Campbell-Walsh Urologia.';
  }
  if (spec.includes('cirurg')) {
    return 'Você é um Cirurgião Geral e preceptor de residência médica. Fundamente com as diretrizes do Colégio Brasileiro de Cirurgiões (CBC), ATLS 10ª/11ª edição e Sabiston Tratado de Cirurgia.';
  }
  if (spec.includes('pediat')) {
    return 'Você é um Pediatra e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Pediatria (SBP), Ministério da Saúde e Nelson Tratado de Pediatria.';
  }
  if (spec.includes('gineco')) {
    return 'Você é um Ginecologista e preceptor de residência médica. Fundamente com os consensos da FEBRASGO, Berek & Novak e diretrizes do Ministério da Saúde / INCA.';
  }
  if (spec.includes('obstet')) {
    return 'Você é um Obstetra e preceptor de residência médica. Fundamente com os manuais de Gestação de Alto Risco do Ministério da Saúde, FEBRASGO e Williams Obstetrícia.';
  }
  if (spec.includes('preventiv')) {
    return 'Você é um Especialista em Medicina Preventiva e Social / Saúde Coletiva. Fundamente com as Leis Orgânicas do SUS (8.080/90 e 8.142/90), Cadernos de Atenção Básica e Rouquayrol Epidemiologia & Saúde.';
  }
  if (t.includes('cardio')) {
    return 'Você é um Cardiologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Cardiologia (SBC), AHA/ACC e ESC.';
  }
  if (t.includes('gastro') || t.includes('hepato')) {
    return 'Você é um Gastroenterologista e preceptor de residência médica. Fundamente com as diretrizes da Federação Brasileira de Gastroenterologia (FBG) e Sociedade Brasileira de Hepatologia (SBH).';
  }
  if (t.includes('nefro')) {
    return 'Você é um Nefrologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Nefrologia (SBN) e consensos KDIGO.';
  }
  if (t.includes('pneumo')) {
    return 'Você é um Pneumologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Pneumologia e Tisiologia (SBPT), GOLD e GINA.';
  }
  if (t.includes('infecto')) {
    return 'Você é um Infectologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Infectologia (SBI) e PCDTs do Ministério da Saúde.';
  }
  if (t.includes('endocrin')) {
    return 'Você é um Endocrinologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Diabetes (SBD), SBEM e ATA.';
  }
  if (t.includes('neuro') || t.includes('otorrino')) {
    return 'Você é um Neurologista e preceptor de residência médica. Fundamente com as diretrizes da Academia Brasileira de Neurologia (ABN).';
  }
  if (t.includes('reumat')) {
    return 'Você é um Reumatologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Reumatologia (SBR) e ACR/EULAR.';
  }
  if (t.includes('hemat')) {
    return 'Você é um Hematologista e preceptor de residência médica. Fundamente com as diretrizes da Associação Brasileira de Hematologia, Hemoterapia e Terapia Celular (ABHH).';
  }
  if (t.includes('dermat')) {
    return 'Você é um Dermatologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Dermatologia (SBD).';
  }
  if (t.includes('emerg') || t.includes('uti') || t.includes('intensiv')) {
    return 'Você é um Médico Emergencista e Intensivista. Fundamente com as diretrizes da ABRAMURGEM, AMIB e Surviving Sepsis Campaign.';
  }
  if (t.includes('onco')) {
    return 'Você é um Oncologista Clínico. Fundamente com as diretrizes da SBOC, ANCP e NCCN.';
  }

  return 'Você é um Preceptor Médico de elite especialista em provas de Residência Médica e Revalida no Brasil. Fundamente com a literatura médica de referência e diretrizes das sociedades oficiais de especialidade.';
}

// Modelos prioritários em rotação gratuita com fallback automático
export const AVAILABLE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash'
];

const exhaustedPairs = new Set();

export function getNextPair() {
  const totalSlots = API_KEYS.length * AVAILABLE_MODELS.length;
  for (let step = 0; step < totalSlots; step++) {
    const kIdx = (keyIndex + step) % API_KEYS.length;
    for (const model of AVAILABLE_MODELS) {
      const pairKey = `${kIdx}_${model}`;
      if (!exhaustedPairs.has(pairKey)) {
        keyIndex = (kIdx + 1) % API_KEYS.length;
        return {
          key: API_KEYS[kIdx],
          keyIdx: kIdx,
          model
        };
      }
    }
  }
  // Se todos os pares atingiram limite de minuto, renova a cota gratuita
  exhaustedPairs.clear();
  return {
    key: API_KEYS[keyIndex % API_KEYS.length],
    keyIdx: keyIndex % API_KEYS.length,
    model: AVAILABLE_MODELS[0]
  };
}

export function markPairExhausted(keyIdx, model, reason = '') {
  const pairKey = `${keyIdx}_${model}`;
  if (!exhaustedPairs.has(pairKey)) {
    exhaustedPairs.add(pairKey);
    console.log(`⛔ Chave [${keyIdx + 1}/${API_KEYS.length}] esgotou cota no modelo [${model}] (${reason}).`);
  }
}

/**
 * Resolve e gera a fundamentação pedagógica profunda de uma única questão
 * garantindo o PRINCÍPIO DO GABARITO IMUTÁVEL (ÂNCORA DE OURO)
 * com suporte multimodal nativo, teto de 650 caracteres e estruturação de assertivas.
 */
export async function solveQuestionDeep(question) {
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

  const optLetters = (question.options || []).map(o => o.letter).join(', ');
  const optionsSchemaExample = (question.options || [])
    .map(o => o.letter === goldAnswer 
      ? `    "${o.letter}": "Conceito padrão-ouro em **negrito**"` 
      : `    "${o.letter}": "Erro em **negrito** e correção (máx 120 carac)"`)
    .join(',\n');

  // Extração e montagem de imagens para visão multimodal
  const images = [];
  if (question.imageUrl) images.push(question.imageUrl);
  if (question.image_url) images.push(question.image_url);
  if (Array.isArray(question.images)) question.images.forEach(i => i && images.push(i));
  const statement = question.statement || '';
  const imgRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/gi;
  let m;
  while ((m = imgRegex.exec(statement)) !== null) images.push(m[1]);
  if (Array.isArray(question.options)) {
    question.options.forEach(opt => {
      if (opt.imageUrl) images.push(opt.imageUrl);
      if (opt.image_url) images.push(opt.image_url);
    });
  }
  const uniqueImgs = Array.from(new Set(images.filter(Boolean)));

  const imageParts = [];
  for (const imgUrl of uniqueImgs) {
    const part = await fetchImagePart(imgUrl);
    if (part) imageParts.push(part);
  }

  const hasRoman = /\b(I|II|III|IV)\b/.test(statement) && 
    (statement.includes('I.') || statement.includes('I -') || statement.includes('I –') || statement.includes('I)') || statement.includes('I :') || statement.includes('I, ') || statement.includes('I e '));

  const roleInstruction = getSpecialtyGuideline(question.especialidade || question.specialty, question.tema);

  const finalCommentaryInstruction = hasRoman ? `
No campo "finalCommentary", estruture o texto EXCLUSIVAMENTE em tópicos correspondentes a cada item do enunciado:
• Item I: Análise direta e concisa do critério técnico que valida ou invalida o item.
• Item II: Análise concisa do erro ou acerto do ponto diferencial.
• Item III: Fundamentação rápida da conduta ou conceito cobrado.
Discuta a questão em sua integridade para a compreensão clínica, concluindo o raciocínio com clareza. NÃO adicione períodos finais discutindo diretrizes ou sociedades médicas. Destaque em **negrito** os termos diagnósticos e condutas essenciais. EXTENSÃO: Seja conciso e direto (cerca de 100 a 140 palavras / ~600 a 650 caracteres), sem frases cortadas.
` : `
No campo "finalCommentary", apresente o comentário em TEXTO CORRIDO ÚNICO, coeso, direto e bem explicativo.
NÃO SEPARE por subtópicos como "Fisiopatologia", "Raciocínio Diagnóstico", "Conduta Escalonada" ou "Critérios Decisórios".
Discuta a questão em sua integridade, abordando tudo que for importante para a compreensão clínica unindo diagnóstico à conduta.
NÃO adicione períodos finais discutindo nomes de diretrizes ou sociedades médicas (discuta a clínica do caso).
Destaque em **negrito** os termos diagnósticos e condutas essenciais/pontos diferenciais mais importantes.
O campo 'finalCommentary' DEVE ser objetivo, conciso e completo (cerca de 100 a 140 palavras / ~600 a 650 caracteres), unindo o diagnóstico à conduta sem deixar ideias inacabadas e sem qualquer palavra dispensável.
`;

  const visualInstruction = imageParts.length > 0 ? `
🖼️ ATENÇÃO - QUESTÃO COM IMAGEM MÉDICA (VISÃO MULTIMODAL ATIVADA):
Você está recebendo ${imageParts.length} imagem(ns) anexa(s) a esta questão.
Analise a imagem minuciosamente (achados radiológicos, tomográficos, derivações de ECG, cardiotocografia, ultrassom, lesões dermatológicas ou gráficos).
Integre a descrição e interpretação concisa dos achados visuais no comentário e na justificativa da alternativa correta, demonstrando como a imagem comprova o gabarito.
` : '';

  const prompt = `${roleInstruction}
Fundamente com rigor acadêmico, concisão e exatidão clínica o gabarito oficial da banca examinadora.

Dados da Questão:
- Instituição/Banca: ${question.institution || question.banca || 'Oficial'} (${question.year || 2024})
- Especialidade: ${question.especialidade || 'Clínica'} - ${question.tema || 'Geral'}

Enunciado:
${statement}

Alternativas:
${formattedOptions}

🔒 GABARITO OFICIAL IMUTÁVEL (ÂNCORA DE OURO): ALTERNATIVA ${goldAnswer}.
Fundamente tecnicamente por que a alternativa ${goldAnswer} é a correta e aponte o erro dos demais distratores. Proibido divergir do gabarito oficial.
${visualInstruction}
REGRAS OBRIGATÓRIAS:
1. Justificativas das Opções (${optLetters}):
   - Letra correta (${goldAnswer}): Destaque o conceito padrão-ouro ou conduta mandatória em **negrito**.
   - Distratores incorretos: Seja conciso (1 a 2 frases curtas, 100-120 caracteres). Destaque em **negrito** o trecho ou conceito errôneo e indique a correção médica.
   - Sem metarretórica: Vá direto ao raciocínio, sem "A alternativa está correta/incorreta".
2. Comentário Final:
${finalCommentaryInstruction.trim()}
3. Principal Motivo do Erro (analisa os distratores):
   - Identifique com precisão a armadilha ("pegadinha") ou confusão comum induzida pelos distratores da questão que leva o aluno ao erro, destacando em **negrito** o ponto de confusão.
4. Take-Home Message (principal ponto):
   - Síntese da pérola clínica central e conceito-chave para memorização rápida da questão (1 a 2 frases densas), destacando em **negrito** o ponto principal.
5. Evolução de Diretrizes:
   - Preencha APENAS se houve mudança real na conduta ou classificação histórica desde o ano da prova até hoje. Se a diretriz permanecer inalterada, retorne string vazia "".
6. Sem nomes de cursinhos ou marcas comerciais.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "optionExplanations": {
${optionsSchemaExample}
  },
  "isAbsurdKey": false,
  "divergenceReason": "",
  "suggestedCorrectAnswer": "${goldAnswer}",
  "finalCommentary": "Texto corrido direto abordando o caso em sua integridade sem período final de diretriz (~600 a 650 carac)",
  "mainErrorReason": "Análise da pegadinha dos distratores com termo em **negrito**",
  "takeHomeMessage": "Ponto central e pérola prática com termo em **negrito**",
  "guidelineEvolution": ""
}`;

  const contents = [
    {
      parts: [
        { text: prompt },
        ...imageParts
      ]
    }
  ];

  for (let attempt = 1; attempt <= 15; attempt++) {
    const pair = getNextPair();
    if (!pair) {
      throw new Error('Todas as chaves esgotaram suas cotas disponíveis.');
    }
    const { key: activeKey, keyIdx, model: activeModel } = pair;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 1500
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 401) {
          console.warn(`⚠️ Chave [${keyIdx + 1}/${API_KEYS.length}] não autorizada (401).`);
          markPairExhausted(keyIdx, activeModel, '401 não autorizada');
          continue;
        }
        if (res.status === 429) {
          markPairExhausted(keyIdx, activeModel, 'rate limit 429');
          const waitTime = Math.min(attempt * 800, 3500);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        if (res.status >= 500) {
          await new Promise(r => setTimeout(r, 1200));
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
      }

      const json = await res.json();
      const usageMetadata = json.usageMetadata || null;
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Resposta vazia da API');

      let parsed = null;
      let clean = rawText.trim().replace(/^\`\`\`json\s*/i, '').replace(/^\`\`\`\s*/i, '').replace(/\s*\`\`\`$/i, '').trim();
      const firstB = clean.indexOf('{');
      const lastB = clean.lastIndexOf('}');
      if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
        clean = clean.slice(firstB, lastB + 1);
      }

      try {
        parsed = JSON.parse(clean);
      } catch {
        try {
          const sanitized = clean
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
          parsed = JSON.parse(sanitized);
        } catch (e) {
          if (attempt < 5) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          throw new Error(`JSON inválido retornado pelo modelo: ${e.message}`);
        }
      }

      let correctAnswer = goldAnswer;
      let isAnulada = Boolean(question.is_anulada || question.isAnulada);

      if (parsed.isAbsurdKey && parsed.suggestedCorrectAnswer) {
        const suggested = String(parsed.suggestedCorrectAnswer).trim().toUpperCase();
        if (suggested === 'ANULADA') {
          isAnulada = true;
          correctAnswer = 'ANULADA';
        } else if (['A', 'B', 'C', 'D', 'E'].includes(suggested)) {
          correctAnswer = suggested;
        }
      }

      const optionExplanations = {};
      if (parsed.optionExplanations) {
        for (const [letter, exp] of Object.entries(parsed.optionExplanations)) {
          optionExplanations[letter.toUpperCase()] = sanitizeText(exp);
        }
      }

      // Preserva a integridade clínica sem truncamento abrupto de texto
      let finalCommentary = sanitizeText(parsed.finalCommentary || '').trim();
      // Remove reticências espúrias no final caso o modelo tenha gerado inadvertidamente
      if (finalCommentary.endsWith('...') || finalCommentary.endsWith('…')) {
        finalCommentary = finalCommentary.replace(/(\.\.\.|…)+$/, '').trim();
        if (!/[.!?]$/.test(finalCommentary)) {
          finalCommentary += '.';
        }
      }

      const mainErrorReason = sanitizeText(parsed.mainErrorReason || '');
      const takeHomeMessage = sanitizeText(parsed.takeHomeMessage || '');

      // Evolução de Diretrizes: se inalterada (vazia), injeta deterministicamente sem gastar tokens do LLM
      let guidelineEvolution = sanitizeText(parsed.guidelineEvolution || '').trim();
      if (!guidelineEvolution) {
        guidelineEvolution = 'Não houveram atualizações recentes nas diretrizes em relação ao tema da questão.';
      }

      // Referências: preenchimento local sem gastar tokens do LLM (conforme solicitado pelo usuário)
      const references = ['Em atualização'];

      // Monta o commentary formatado completo
      const formattedCommentary = [
        parsed.isAbsurdKey && parsed.divergenceReason
          ? `[GABARITO HOMOLOGADO - CURADORIA BANCO RESIDÊNCIA]\nO gabarito oficial da banca examinadora indicava a alternativa [${goldAnswer}], porém foi retificado para [${correctAnswer}] após auditoria médica:\n${sanitizeText(parsed.divergenceReason)}\n`
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

      // Atualiza as opções garantindo negrito em 100%
      const updatedOptions = (question.options || []).map(opt => {
        let exp = (optionExplanations[opt.letter] || '').trim();
        const isCorrect = opt.letter === correctAnswer;

        if (!exp) {
          if (isCorrect) {
            exp = finalCommentary || `**Alternativa correta**. Conduta diagnóstica e terapêutica padrão-ouro preconizada pelas diretrizes oficiais de referência.`;
          } else {
            exp = `**Alternativa incorreta**. Esta afirmativa diverge da conduta preconizada na literatura médica oficial (**Alternativa ${correctAnswer}**).`;
          }
        }

        // Garante destaque em negrito
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
        isAnulada,
        is_anulada: isAnulada,
        correctAnswer,
        correct_answer: correctAnswer,
        commentary: formattedCommentary,
        finalCommentary,
        mainErrorReason,
        takeHomeMessage,
        guidelineEvolution,
        references,
        options: updatedOptions,
        usageMetadata
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn('⚠️ Timeout atingido, alternando par chave/modelo...');
        continue;
      }
      if (attempt < 12) {
        await new Promise(r => setTimeout(r, 1200));
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
    correct_answer: (q.correctAnswer === 'ANULADA' || q.correct_answer === 'ANULADA') ? null : (q.correctAnswer || q.correct_answer),
    is_anulada: Boolean(q.isAnulada || q.is_anulada || q.correctAnswer === 'ANULADA'),
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
