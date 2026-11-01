import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente de .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const GEMINI_API_KEY = env.GEMINI_API_KEY || env.GEMINI_API_KEY_1;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!GEMINI_API_KEY) {
  console.error('ERRO: GEMINI_API_KEY não configurada em .env.local');
  process.exit(1);
}

const MODEL_NAME = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Prompt padrão-ouro para extração médica estruturada de itens faltantes
 */
const SYSTEM_PROMPT = `
Você é um especialista e curador médico sênior de questões de Residência Médica e Revalida no Brasil.
Sua missão é extrair com precisão absoluta as questões de múltipla escolha presentes na imagem/página do PDF fornecido.

Para cada questão identificada, produza estritamente um objeto JSON com a seguinte estrutura:
{
  "question_number": number (número da questão na prova),
  "statement": string (enunciado completo em markdown limpo, preservando dados clínicos, valores de laboratório e referências),
  "options": [
    {"letter": "A", "text": "texto da alternativa A"},
    {"letter": "B", "text": "texto da alternativa B"},
    {"letter": "C", "text": "texto da alternativa C"},
    {"letter": "D", "text": "texto da alternativa D"},
    {"letter": "E", "text": "texto da alternativa E (se houver)"}
  ],
  "correct_answer": "A" | "B" | "C" | "D" | "E" | null (gabarito oficial se visível na folha/chave),
  "especialidade": "Cirurgia Geral" | "Clínica Médica" | "Ginecologia e Obstetrícia" | "Pediatria" | "Medicina Preventiva e Social" | "Outras",
  "has_image": boolean (true se a questão possui imagem clínica associada: ECG, raio-X, TC, etc.)
}

Retorne estritamente um array JSON válido sem marcadores de markdown adicionais.
`;

/**
 * Função para invocar Gemini Vision com uma imagem em Base64
 */
export async function extractQuestionsFromImage(imageBase64, mimeType = 'image/png') {
  const payload = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: imageBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Falha na API Gemini (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Nenhuma resposta retornada pelo Gemini Vision');
  }

  try {
    return JSON.parse(textOutput);
  } catch (err) {
    console.warn('Aviso: Falha ao converter JSON direto, tentando extrair bloco json...');
    const match = textOutput.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const examIdArg = args.find((a) => a.startsWith('--examId='))?.split('=')[1];

  console.log('--- Pipeline Gemini Vision para Reprocessamento de Gaps de OCR ---');
  console.log(`Modo: ${isDryRun ? 'DRY-RUN (Simulação)' : 'PRODUÇÃO'}`);
  console.log(`Modelo Utilizado: ${MODEL_NAME}`);

  // Carregar dados de gaps identificados
  const auditPath = path.join(process.cwd(), 'src', 'data', 'examGapsAudit.json');
  if (!fs.existsSync(auditPath)) {
    console.error('Arquivo examGapsAudit.json não encontrado. Execute scripts/audit_exam_gaps_census.mjs primeiro.');
    process.exit(1);
  }

  const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  const targets = examIdArg
    ? auditData.trueOcrGaps.filter((g) => g.id === examIdArg)
    : auditData.trueOcrGaps.slice(0, 5);

  console.log(`Alvos selecionados para reprocessamento: ${targets.length} exames`);
  targets.forEach((t) => {
    console.log(`- Exame: ${t.institution} (${t.year}) • ID: ${t.id} • Faltam: ${t.missingQuestions}q`);
  });

  console.log('\nPipeline inicializado com sucesso e pronto para extração de páginas PDF/imagens.');
}

if (process.argv[1]?.endsWith('reprocess_missing_questions_gemini_vision.mjs')) {
  main().catch(console.error);
}
