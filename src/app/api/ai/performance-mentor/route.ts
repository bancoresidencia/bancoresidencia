import { NextResponse } from 'next/server';
import { callGeminiAi, parseCleanJson } from '@/lib/gemini';

interface CachedDiagnosis {
  timestamp: number;
  data: Record<string, unknown>;
}

const diagnosisCache = new Map<string, CachedDiagnosis>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      targetExam = 'ENARE 2026',
      totalAnswered = 0,
      totalCorrect = 0,
      accuracyRate = 0,
      percentil = 'P75.0',
      theta = 1.0,
      bySpecialty = [],
      criticalSubfocos = [],
      recentMistakesSample = [],
      refresh = false
    } = body;

    const subfocoKeys = Array.isArray(criticalSubfocos)
      ? criticalSubfocos.slice(0, 3).map((c: { subfoco?: string }) => c.subfoco || '').join(',')
      : '';
    const cacheKey = `v3-${totalAnswered}-${totalCorrect}-${Math.round(accuracyRate)}-${targetExam}-${subfocoKeys}`;

    if (!refresh) {
      const cached = diagnosisCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({ success: true, ...cached.data, cached: true });
      }
    }

    const prompt = `
Você é um Coordenador Pedagógico e Preceptor Médico Sênior de Residência Médica especialista em Psicometria e Teoria de Resposta ao Item (TRI).
Analise o desempenho deste estudante de medicina para a prova ${targetExam}.

DIRETRIZES DE ESTILO:
- Seja ULTRA DIRETO, DIDÁTICO e CIRÚRGICO. Zero enrolação ou prolixidade.
- Coloque as ideias em PONTOS UM EM CIMA DO OUTRO (bullet points).
- Em CADA tópico, inicie SEMPRE com uma palavra-chave ou conceito-chave em negrito usando **...** (ex: **Ponto de Sangria:** ou **Risco TRI:** ou **Armadilha:**) seguido de UMA única frase explicativa de alto valor pedagógico.

DADOS DO ALUNO:
- Exame Alvo: ${targetExam}
- Total Resolvido: ${totalAnswered} (Acertos: ${totalCorrect}, Aproveitamento: ${accuracyRate.toFixed(1)}%)
- Percentil: ${percentil}
- Escore Theta (TRI): ${typeof theta === 'number' ? theta.toFixed(2) : theta}
- Desempenho por Área: ${JSON.stringify(bySpecialty.slice(0, 6))}
- Subfocos com Mais Erros: ${JSON.stringify(criticalSubfocos.slice(0, 5))}
- Amostra de Erros Recentes: ${JSON.stringify(recentMistakesSample.slice(0, 8))}

ESTRUTURA REQUISITADA:
1. "diagnosticoPontos": 2 a 3 pontos diretos em tópicos (cada um iniciando com **Tópico:** e no máximo 1 a 2 frases curtas) sobre a situação real para ser aprovado em ${targetExam}.
2. "alertaTRIPontos": 2 tópicos objetivos (iniciando com **Impacto TRI:** ou **Curva Psicométrica:**) explicando como os erros afetam o score.
3. "padraoErrosPontos": 2 tópicos cirúrgicos (iniciando com **Falha Cognitiva:** ou **Armadilha da Banca:**) revelando o padrão de erro.
4. "planoDeAcaoImediato": Exatamente 3 ações práticas sequenciais para hoje (iniciando com **Ação 1:**, **Ação 2:**, **Ação 3:**).
5. "recomendacaoPratica": {
     "specialty": string (área prioritária),
     "tema": string (tema prioritário),
     "subfoco": string (subfoco crítico),
     "questoesSugeridas": 15,
     "motivo": string (1 frase curta e didática do motivo)
   }

Responda OBRIGATORIAMENTE em JSON válido:
{
  "diagnosticoPontos": [
    "...",
    "..."
  ],
  "alertaTRIPontos": [
    "...",
    "..."
  ],
  "padraoErrosPontos": [
    "...",
    "..."
  ],
  "planoDeAcaoImediato": [
    "...",
    "...",
    "..."
  ],
  "recomendacaoPratica": {
    "specialty": "...",
    "tema": "...",
    "subfoco": "...",
    "questoesSugeridas": 15,
    "motivo": "..."
  }
}
`;

    const rawResponse = await callGeminiAi(prompt, { temperature: 0.2, responseMimeType: 'application/json' });
    const parsed = parseCleanJson<Record<string, unknown>>(rawResponse);

    diagnosisCache.set(cacheKey, { timestamp: Date.now(), data: parsed });

    return NextResponse.json({
      success: true,
      ...parsed
    });
  } catch (error: unknown) {
    console.error('Erro na rota de auditoria de performance IA:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao gerar auditoria de desempenho com IA.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
