import { NextRequest, NextResponse } from 'next/server';
import { callGeminiAi } from '@/lib/gemini';
import { reconcileAIFilters } from '@/utils/taxonomyMatcher';

export const dynamic = 'force-dynamic';

const KNOWN_SPECIALTIES = [
  'Clínica Médica',
  'Cirurgia Geral',
  'Pediatria',
  'Ginecologia',
  'Obstetrícia',
  'Medicina Preventiva e Social'
];

const KNOWN_BANCAS = [
  'ENARE', 'USP-SP', 'SUS-SP', 'UNICAMP', 'PSU-MG', 'AMRIGS', 'SURCE',
  'UNIFESP', 'UERJ', 'INEP Revalida', 'SES-PE', 'SES-DF', 'Einstein',
  'Santa Casa de SP', 'IAMSPE', 'UFRJ', 'FUVEST', 'FMABC', 'UFPR'
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || '').trim();

    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Por favor, descreva o que você deseja estudar.' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();

    const systemPrompt = `Você é o assistente inteligente de busca e filtros do Banco de Questões de Residência Médica (133.000 questões médicas oficiais).
O estudante solicitou em linguagem natural o seguinte objetivo de estudo:
"${prompt}"

Sua missão é analisar criteriosamente a intenção do estudante e converter para filtros formais da plataforma.

REGRAS OBRIGATÓRIAS:
1. QUANTIDADE: Extraia a quantidade EXATA de questões solicitada pelo usuário no texto (ex: se pediu "10 questões", retorne quantidade: 10; se pediu "25", retorne 25; se pediu "5", retorne 5). Se não houver quantidade mencionada, retorne null.
2. TAXONOMIA DA PLATAFORMA:
   - Especialidades válidas: ${JSON.stringify(KNOWN_SPECIALTIES)}
     (Mapeie termos como "Preventiva", "SUS", "Saúde Coletiva" para "Medicina Preventiva e Social". Termos como "Cirurgia" para "Cirurgia Geral". "Gineco" para "Ginecologia". "Obstetrícia" / "Parto" para "Obstetrícia".)
   - Bancas comuns: ${JSON.stringify(KNOWN_BANCAS)}
   - Modalidades válidas: "Residência Médica" ou "Revalida" (se o estudante mencionar Revalida, defina modalidades: ["Revalida"]. Caso contrário, default ["Residência Médica"]).
   - Dificuldades válidas: "Fácil", "Médio", "Difícil" ou "Todas".
   - Tipos de questão válidos: "Múltipla escolha", "Discursiva" ou "Todas".
   - Anos da prova: Considere o ano atual ${currentYear}. Se o aluno pedir "últimos 3 anos", retorne [${currentYear - 1}, ${currentYear - 2}, ${currentYear - 3}]. Se pedir "últimos 5 anos", retorne os 5 anos mais recentes. Se citar anos específicos (ex: 2023 e 2024), liste-os.
   - Temas, Focos e Subfocos: Identifique o tema, foco clínico ou subfoco com a maior aproximação técnica médica possível (ex: "pré-eclâmpsia", "sepse", "trauma abdominal", "cetoacidose", "asfixia perinatal", "desidratação").
   - Search (busca textual): Se o estudante citar tópicos farmacológicos, sinais clínicos específicos, síndromes raras, drogas ou diretrizes (ex: "sulfato de magnésio", "noradrenalina", "ATLS", "Glasgow", "escore de Alvarado", "manobra de Kristeller"), preencha o campo "search".

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "summary": "Resumo clínico amigável e direto em 1 frase curta do que foi identificado",
  "quantidade": 10,
  "filters": {
    "especialidades": ["Nome da Especialidade se identificada"],
    "temas": ["Nome do Tema médico se identificado"],
    "focos": ["Foco clínico mais específico se houver"],
    "subfocos": ["Subfoco específico se houver"],
    "instituicoes": ["Sigla da banca se citada"],
    "modalidades": ["Residência Médica"],
    "anos": [2024, 2023],
    "dificuldade": "Todas",
    "tipoQuestao": "Todas",
    "search": "termo médico para busca se aplicável, ou string vazia"
  }
}`;

    const rawResponse = await callGeminiAi(systemPrompt, {
      temperature: 0.1,
      responseMimeType: 'application/json'
    });

    const parsed = JSON.parse(rawResponse);

    // Reconcilia os filtros retornados com a taxonomia oficial do banco de dados (busca por semelhante)
    const reconciled = reconcileAIFilters(
      {
        ...(parsed.filters || {}),
        quantidade: parsed.quantidade
      },
      prompt
    );

    return NextResponse.json({
      success: true,
      summary: parsed.summary || 'Filtros identificados com sucesso.',
      quantidade: reconciled.quantidade,
      filters: reconciled.filters
    });
  } catch (err: unknown) {
    console.error('Erro no endpoint Smart Filter:', err);
    const msg = err instanceof Error ? err.message : 'Falha ao processar o filtro com Inteligência Artificial.';
    return NextResponse.json(
      {
        success: false,
        error: msg
      },
      { status: 500 }
    );
  }
}

