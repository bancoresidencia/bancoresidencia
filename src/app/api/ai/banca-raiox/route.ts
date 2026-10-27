import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveBancaList } from '@/services/questionService';
import { callGeminiAi, parseCleanJson } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

const raioxCache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bancaRaw = (body.banca || 'ENARE').trim();

    if (!bancaRaw) {
      return NextResponse.json({ success: false, error: 'Banca não especificada.' }, { status: 400 });
    }

    const cacheKey = bancaRaw.toUpperCase();
    const cached = raioxCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, ...cached.data });
    }

    const resolved = resolveBancaList([bancaRaw]);
    const bancaFilters = resolved.length > 0 ? resolved : [bancaRaw];

    // 1. Estatísticas reais do banco Supabase
    const { data: rows, count: totalCount, error } = await supabase
      .from('questions')
      .select('especialidade, tema, difficulty', { count: 'exact' })
      .in('banca', bancaFilters)
      .limit(1500);

    if (error) {
      console.warn('Erro ao consultar estatísticas da banca no Supabase:', error);
    }

    const totalQuestions = totalCount || rows?.length || 0;
    const specialtyDist: Record<string, number> = {};
    const difficultyDist: Record<string, number> = { 'Fácil': 0, 'Médio': 0, 'Difícil': 0 };
    const temaFrequency: Record<string, number> = {};

    (rows || []).forEach((r) => {
      // Especialidade
      const esp = r.especialidade || 'Outros';
      specialtyDist[esp] = (specialtyDist[esp] || 0) + 1;

      // Dificuldade
      if (r.difficulty && difficultyDist[r.difficulty] !== undefined) {
        difficultyDist[r.difficulty] += 1;
      } else {
        difficultyDist['Médio'] += 1;
      }

      // Tema
      if (r.tema && r.tema.trim()) {
        const t = r.tema.trim();
        temaFrequency[t] = (temaFrequency[t] || 0) + 1;
      }
    });

    const topTemas = Object.entries(temaFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tema, count]) => ({
        tema,
        count,
        percent: totalQuestions > 0 ? Math.round((count / (rows?.length || 1)) * 100) : 0
      }));

    // 2. Análise Pedagógica e Qualitativa da Banca com Gemini
    const systemPrompt = `Você é o Diretor Pedagógico e Especialista em Bancas de Residência Médica do Brasil (ENARE, USP, SUS-SP, UNICAMP, AMRIGS, PSU-MG, etc.).
Analise os dados estatísticos reais da banca examinadora "${bancaRaw}" (${totalQuestions} questões no acervo):

Top temas mapeados: ${topTemas.map((t) => `${t.tema} (${t.count} questões)`).join(', ')}

Gere um parecer analítico de altíssimo rendimento para o estudante de medicina que vai prestar essa prova.
Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "estiloEnunciados": "Descrição cirúrgica do tamanho e formato dos enunciados (ex: 'Casos clínicos extensos com parâmetros laboratoriais, gasometrias e achados de imagem' ou 'Questões diretas e conceituais')",
  "perfilGeral": "Parecer tático geral de 2 a 3 frases sobre o perfil de corte e foco da banca examinadora",
  "armadilhasComuns": "A pegadinha ou armadilha clássica mais frequente que essa banca usa para induzir o candidato ao erro",
  "diretrizesPrioritarias": "Diretrizes e consensos mais valorizados (ex: 'Ministério da Saúde, Diretrizes Brasileiras de Hipertensão SBC, FEBRASGO, ATLS')",
  "dicaDeOuro": "A dica definitiva de ouro para pontuar acima do percentil 90 nesta banca específica",
  "dificuldadePredominante": "Média" | "Alta" | "Muito Alta"
}`;

    let aiAnalysis: Record<string, unknown> = {
      estiloEnunciados: 'Casos clínicos com foco em tomada de conduta imediata e diagnóstico diferencial.',
      perfilGeral: `A banca ${bancaRaw} prioriza situações frequentes de pronto-socorro e ambulatório com foco nas diretrizes nacionais.`,
      armadilhasComuns: 'Alternativas com condutas corretas porém em momentos clínicos trocados.',
      diretrizesPrioritarias: 'Consensos das Sociedades Brasileiras de Especialidades e Ministério da Saúde.',
      dicaDeOuro: 'Foque nos temas de maior prevalência e domine as condutas de primeira linha.',
      dificuldadePredominante: 'Alta'
    };

    try {
      const rawAi = await callGeminiAi(systemPrompt, {
        temperature: 0.2,
        responseMimeType: 'application/json'
      });
      aiAnalysis = parseCleanJson(rawAi);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Falha na análise Gemini para Raio-X da Banca:', msg);
    }

    const payload = {
      banca: bancaRaw,
      totalQuestions,
      specialties: specialtyDist,
      difficulties: difficultyDist,
      topTemas,
      analysis: aiAnalysis
    };

    raioxCache.set(cacheKey, { data: payload, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      ...payload
    });
  } catch (err: unknown) {
    console.error('Erro no endpoint Raio-X da Banca:', err);
    const msg = err instanceof Error ? err.message : 'Falha ao processar o Raio-X da banca.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
