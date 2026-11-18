import { NextResponse } from 'next/server';
import { callGeminiAi, parseCleanJson } from '@/lib/gemini';
import { authenticateAiRequest } from '@/lib/aiProtection';

interface CachedDiagnosis {
  timestamp: number;
  data: Record<string, unknown>;
}

const diagnosisCache = new Map<string, CachedDiagnosis>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const MAX_DIAGNOSIS_CACHE = 500;

function setBoundedDiagnosisCache(key: string, value: CachedDiagnosis) {
  if (diagnosisCache.size >= MAX_DIAGNOSIS_CACHE) {
    const oldest = diagnosisCache.keys().next().value;
    if (oldest) diagnosisCache.delete(oldest);
  }
  diagnosisCache.set(key, value);
}

export async function POST(req: Request) {
  try {
    // Blindagem de segurança: Autenticação obrigatória + Rate Limit por usuário (máx 10/min)
    const auth = await authenticateAiRequest(req, 10);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const body = await req.json();
    const rawTargetExam = typeof body.targetExam === 'string' ? body.targetExam.trim().slice(0, 80) : 'ENARE 2026';
    const targetExam = rawTargetExam || 'ENARE 2026';
    const totalAnswered = Math.max(0, Math.floor(Number(body.totalAnswered) || 0));
    const totalCorrect = Math.max(0, Math.floor(Number(body.totalCorrect) || 0));
    const accuracyRate = Number.isFinite(Number(body.accuracyRate)) ? Math.min(100, Math.max(0, Number(body.accuracyRate))) : 0;
    const percentil = typeof body.percentil === 'string' ? body.percentil.slice(0, 20) : 'P75.0';
    const theta = Number.isFinite(Number(body.theta)) ? Number(body.theta) : 1.0;
    const bySpecialty = Array.isArray(body.bySpecialty) ? body.bySpecialty.slice(0, 6) : [];
    const criticalSubfocos = Array.isArray(body.criticalSubfocos) ? body.criticalSubfocos.slice(0, 5) : [];
    const recentMistakesSample = Array.isArray(body.recentMistakesSample) ? body.recentMistakesSample.slice(0, 8) : [];
    const refresh = Boolean(body.refresh);

    // Limita tamanho máximo serializado de cada bloco para impedir Denial of Wallet por payloads gigantes
    const safeSpecialtyJson = JSON.stringify(bySpecialty).slice(0, 1200);
    const safeSubfocosJson = JSON.stringify(criticalSubfocos).slice(0, 1200);
    const safeMistakesJson = JSON.stringify(recentMistakesSample).slice(0, 1800);

    const subfocoKeys = criticalSubfocos
      .slice(0, 3)
      .map((c: { subfoco?: string }) => (typeof c?.subfoco === 'string' ? c.subfoco.slice(0, 40) : ''))
      .join(',');
    const cacheKey = `v3-${auth.user?.id || 'u'}-${totalAnswered}-${totalCorrect}-${Math.round(accuracyRate)}-${targetExam}-${subfocoKeys}`;

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
- Desempenho por Área: ${safeSpecialtyJson}
- Subfocos com Mais Erros: ${safeSubfocosJson}
- Amostra de Erros Recentes: ${safeMistakesJson}

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

    try {
      const rawResponse = await callGeminiAi(prompt, { temperature: 0.2, responseMimeType: 'application/json' });
      const parsed = parseCleanJson<Record<string, unknown>>(rawResponse);

      setBoundedDiagnosisCache(cacheKey, { timestamp: Date.now(), data: parsed });

      return NextResponse.json({
        success: true,
        ...parsed
      });
    } catch (aiError: unknown) {
      console.warn('[Performance Mentor] Gemini indisponível ou cota esgotada. Ativando fallback psicométrico instantâneo:', aiError);

      const topCritical = Array.isArray(criticalSubfocos) && criticalSubfocos.length > 0 ? criticalSubfocos[0] : null;
      const criticalSubfoco = topCritical?.subfoco || 'Condutas de Primeira Linha e Emergências';
      const criticalTema = topCritical?.tema || topCritical?.specialty || 'Clínica Médica e Cirurgia';
      const criticalSpecialty = topCritical?.specialty || 'Especialidade Prioritária';

      const thetaFormatted = typeof theta === 'number' ? theta.toFixed(2) : String(theta || '1.0');
      const rateFormatted = accuracyRate > 0 ? `${accuracyRate.toFixed(1)}%` : 'em consolidação';

      const fallbackData = {
        isAiGenerated: false,
        diagnosticoPontos: [
          `**Aproveitamento Global:** Desempenho geral de ${rateFormatted} com percentil estimado em **${percentil}**, exigindo ajuste fino para atingir a zona de corte em ${targetExam}.`,
          `**Perfil de Discriminação:** O escore Theta atual de **${thetaFormatted}** indica retenção teórica básica, mas vulnerabilidade a distratores em questões de média complexidade.`
        ],
        alertaTRIPontos: [
          `**Curva Psicométrica:** Erros repetidos em conceitos fundamentais depreciam a coerência pedagógica no modelo TRI, derrubando o escore final.`,
          `**Impacto TRI:** A prioridade absoluta é blindar acertos nas questões de fácil e média dificuldade para garantir a máxima pontuação psicométrica.`
        ],
        padraoErrosPontos: [
          `**Ponto de Sangria:** Concentração crítica de erros identificada em **${criticalSubfoco}**, onde a inversão de conduta imediata tem gerado perdas recorrentes.`,
          `**Armadilha de Banca:** Pegadinhas clássicas da banca de ${targetExam} explorando dosagens limítrofes e contraindicações relativas como distratores prioritários.`
        ],
        planoDeAcaoImediato: [
          `**Ação 1:** Revisar o fluxograma padrão-ouro e critérios diagnósticos de **${criticalSubfoco}**.`,
          `**Ação 2:** Resolver bloco direcionado de 15 questões focadas exclusivamente em **${criticalSubfoco}** para consolidar o padrão mental.`,
          `**Ação 3:** Realizar revisão cega no Caderno de Erros das questões erradas recentemente para validação da retenção em 48h.`
        ],
        recomendacaoPratica: {
          specialty: criticalSpecialty,
          tema: criticalTema,
          subfoco: criticalSubfoco,
          questoesSugeridas: 15,
          motivo: `Subfoco com maior índice de erros e alto impacto direto na curva psicométrica do ${targetExam}.`
        }
      };

      setBoundedDiagnosisCache(cacheKey, { timestamp: Date.now(), data: fallbackData });

      return NextResponse.json({
        success: true,
        ...fallbackData
      });
    }
  } catch (error: unknown) {
    console.error('Erro na rota de auditoria de performance IA:', error);
    const msg = error instanceof Error ? error.message : 'Falha ao gerar auditoria de desempenho com IA.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
