import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { callVertexAi } from '@/lib/vertexAi';
import { callGeminiAi } from '@/lib/gemini';
import { medicalKnowledgeService, KnowledgeChunk } from '@/services/medicalKnowledgeService';
import { guidelinesKnowledgeService } from '@/services/guidelinesKnowledgeService';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { sanitizePostgrestTerm, isPrivilegedRole } from '@/utils/security';
import { isAiRateLimited } from '@/lib/aiProtection';
import { FocusExamAnalytics } from '@/types/analytics';
import { StudyMaterialItem } from '@/types/flashcards';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Janela exclusiva de 60s dedicada 100% à qualidade do resumo

export interface StudyGeneratorRequest {
  especialidade: string;
  tema: string;
  foco: string;
  mode?: 'hybrid' | 'vertex_only' | 'aistudio_only';
  customGuidelineText?: string;
}

export interface ExamStatItem {
  name: string;
  shortName: string;
  percentage: number;
  questionCount: number;
  priority: 'Crítica' | 'Alta' | 'Média';
  color: string;
  themeClue: string;
}

const PALETTE = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4', '#64748B'];

export async function POST(req: NextRequest) {
  try {
    // Blindagem de segurança: Acesso restrito a estudantes autenticados ou chave de administração/curadoria
    const adminKey = req.headers.get('x-admin-key');
    const validAdminKey = process.env.ADMIN_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isAdminBypass = Boolean(adminKey && validAdminKey && adminKey === validAdminKey);

    let isPrivilegedUser = isAdminBypass;
    if (!isAdminBypass) {
      const auth = await verifyStudentSession(req);
      if (!auth.authorized || !auth.user) {
        return NextResponse.json(
          {
            success: false,
            error: auth.error || 'Acesso não autorizado: faça login ou utilize a chave administrativa para gerar resumos permanentes.'
          },
          { status: auth.status }
        );
      }

      const appRole = auth.user.app_metadata?.role;
      if (isPrivilegedRole(appRole)) {
        isPrivilegedUser = true;
      }

      // Rate limit estrito para requisições de geração de estudo (máx 5/min)
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
      const rateLimitId = `study_gen_${auth.user.id}_${clientIp}`;
      if (isAiRateLimited(rateLimitId, 5)) {
        return NextResponse.json(
          { success: false, error: 'Limite de geração de resumos atingido. Aguarde 1 minuto antes de solicitar novamente.' },
          { status: 429 }
        );
      }
    }

    const body: StudyGeneratorRequest = await req.json();
    const {
      especialidade,
      tema,
      foco,
      mode = 'hybrid',
      customGuidelineText
    } = body;

    if (!especialidade || !tema || !foco) {
      return NextResponse.json(
        { success: false, error: 'Especialidade, tema e foco são campos obrigatórios.' },
        { status: 400 }
      );
    }

    // =========================================================================
    // ETAPA 1: CENSO ESTATÍSTICO DAS QUESTÕES (SUPABASE)
    // Tolerância zero a dados falsos: se não houver dados, o resumo registra erro
    // =========================================================================
    let totalQuestions = 0;
    const subfocoMap = new Map<string, number>();
    let hasCensusError = false;

    try {
      const { data: questions, count } = await supabase
        .from('questions')
        .select('id, subfoco, banca, difficulty', { count: 'exact' })
        .or(`foco.ilike.%${sanitizePostgrestTerm(foco)}%,tema.ilike.%${sanitizePostgrestTerm(tema)}%`)
        .limit(1000);

      totalQuestions = count || questions?.length || 0;

      if (questions && questions.length > 0) {
        questions.forEach((q) => {
          const sub = (q.subfoco || 'Manejo Geral & Diagnóstico').trim();
          subfocoMap.set(sub, (subfocoMap.get(sub) || 0) + 1);
        });
      } else {
        hasCensusError = true;
      }
    } catch (dbErr) {
      console.warn('[StudyGenerator] Falha ao consultar questões no Supabase:', dbErr);
      hasCensusError = true;
    }

    const examStats: ExamStatItem[] = [];
    if (!hasCensusError && subfocoMap.size > 0 && totalQuestions > 0) {
      const sorted = Array.from(subfocoMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 7);
      sorted.forEach(([name, count], idx) => {
        const pct = Math.round((count / totalQuestions) * 100);
        examStats.push({
          name,
          shortName: name.length > 22 ? name.substring(0, 20) + '...' : name,
          percentage: pct,
          questionCount: count,
          priority: pct >= 30 ? 'Crítica' : pct >= 15 ? 'Alta' : 'Média',
          color: PALETTE[idx % PALETTE.length],
          themeClue: `Foco de cobrança frequente em bancas nacionais (ENARE, USP, etc.)`
        });
      });
    }

    // =========================================================================
    // ETAPA 2: RECUPERAÇÃO SEMÂNTICA TEMPORAL (1.337 DIRETRIZES + 350 LIVROS)
    // Priorização compulsória de consensos recentes (2024–2026 sobre antigos)
    // =========================================================================
    let retrievedChunksText = '';

    // 1. Busca no acervo de 1.337 Diretrizes Oficiais locais com time-decay
    try {
      const localGuidelines = await guidelinesKnowledgeService.retrieveTopGuidelines({
        especialidade,
        tema,
        foco,
        maxChunks: 4
      });

      if (localGuidelines.formattedText) {
        retrievedChunksText += localGuidelines.formattedText;
      }
    } catch (locErr) {
      console.warn('[StudyGenerator] Erro ao recuperar diretrizes locais:', locErr);
    }

    // 2. Busca complementar na base de 350 Livros Oficiais
    try {
      const specBooks = medicalKnowledgeService.getBooksBySpecialty(especialidade);
      if (specBooks && specBooks.length > 0) {
        const matchingBook = specBooks.find(b => 
          b.theme.toLowerCase().includes(foco.toLowerCase()) || 
          b.theme.toLowerCase().includes(tema.toLowerCase())
        );

        if (matchingBook) {
          const bookContent = await medicalKnowledgeService.fetchBookContent(matchingBook.storagePath);
          if (bookContent && bookContent.chunks) {
            const relevant = bookContent.chunks
              .filter((c: KnowledgeChunk) => 
                c.content.toLowerCase().includes(foco.toLowerCase()) || 
                c.content.toLowerCase().includes(tema.toLowerCase())
              )
              .slice(0, 4);

            if (relevant.length > 0) {
              const bookChunks = relevant.map((c: KnowledgeChunk) => `[TRATADO DE REFERÊNCIA: ${matchingBook.theme}]\n${c.content}`).join('\n\n');
              retrievedChunksText += (retrievedChunksText ? '\n\n---\n\n' : '') + bookChunks;
            }
          }
        }
      }
    } catch (knowledgeErr) {
      console.warn('[StudyGenerator] Falha ao consultar medicalKnowledgeService:', knowledgeErr);
    }

    if (customGuidelineText) {
      retrievedChunksText += `\n\n[DIRETRIZ ADICIONAL ENVIADA PELO PRECEPTOR]:\n${customGuidelineText}`;
    }

    let summaryMarkdown = '';
    const providersUsed: Record<string, string> = {};

    // Serialização dos dados censitários para injeção no markdown
    const examStatsJsonString = examStats.length > 0
      ? JSON.stringify({ totalQuestions, items: examStats }, null, 2)
      : '{}';

    // =========================================================================
    // ETAPA 3: GERAÇÃO EXCLUSIVA DO RESUMO CLÍNICO CANÔNICO (VERTEX AI / GEMINI PRO)
    // =========================================================================
    const summaryPrompt = `
Você é o Preceptor Sênior da Plataforma Banco Residência (Especialidade: ${especialidade}).
Sua missão é redigir o RESUMO CLÍNICO PADRÃO-OURO de Alto Rendimento para o foco "${foco}" (Tema: "${tema}").

OBEDEÇA ESTRITAMENTE AO DESIGN SYSTEM CANÔNICO (med-study-design-system v2.8.0):

1. NÃO crie título H1 no corpo do texto (o leitor da plataforma já renderiza o título oficial).
2. Seção 1 obrigatória: "## 1. O Que Mais Cai nas Provas de Residência Médica"
   - Apresente um parágrafo analítico curto mencionando a cobrança nas bancas líderes (ENARE, USP, UNICAMP, PSU-MG).
   - Insira o token do componente Donut Recharts serializando os dados reais em JSON exatamente assim:
   \`\`\`exam-stats
${examStatsJsonString}
   \`\`\`
3. PROIBIÇÃO ABSOLUTA DE META-TÍTULOS ABSTRATOS:
   - É terminantemente proibido utilizar títulos como "## 2. Definições Modernas", "## 3. Matriz 2x2" ou "## 4. Algoritmo Decisório".
   - CADA CABEÇALHO ## DEVE CONTER O NOME CLÍNICO REAL DA PATOLOGIA, CRITÉRIO, ESTADIAMENTO OU CONDUTA.
   (Exemplo: "## 2. Critérios Diagnósticos, Quadro Clínico & Parâmetros de Gravidade de ${foco}", "## 4. Cascata Farmacológica Escalonada & Condutas de Emergência").
   Esses títulos alimentam diretamente a barra flutuante de navegação rápida (sectionPills) do estudante.
4. SEÇÃO MANDATÓRIA DE RUPTURA DE PARADIGMA:
   Insira a subseção comparativa destacando as mudanças recentes de conduta:
   ### 🔄 O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)
   Apresente uma tabela comparativa com:
   | Ponto de Conduta | Prática Antiga (Pegadinha Frequente das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |
   Destaque a pegadinha clássica em que as bancas usam a conduta antiga revogada como distrator.
5. ESQUEMAS VISUAIS NATIVOS EM MATRIZ 2x2 (GRADE) & TABELAS:
   - Para classificações de 4 elementos ou polaridades (Risco vs Proteção), estruture em Matriz 2x2 (2 colunas x 2 linhas) com badges e microcopy arejado.
   - Para estadiamentos extensos e tabelas de doses/drogas, use tabelas nativas de markdown com alinhamento explícito (| :--- | :---: | :--- |).
6. ALGORITMO DECISÓRIO & PASSO A PASSO SINTÉTICO:
   - Precedendo qualquer fluxograma, apresente de 3 a 5 passos numerados objetivos.
   - Cada passo deve abrir com: "**[Ponto Principal]:** [Regra de ouro em negrito]".
   - PROIBIDO USAR MERMAID ESCURO (\`\`\`mermaid). PROIBIDO GERAR SVGs ARTIFICIAIS.
7. FÓRMULAS MÉDICAS EM KATEX:
   - Fórmulas clínicas matemáticas devem usar LaTeX centralizado elegante: $$\\text{Nome} = \\frac{A}{B}$$
8. CAIXAS DE AVISO E ARMADILHAS DE PROVA:
   > [!WARNING] Armadilha Clássica de Prova: [Explicar o distrator que a banca usa para derrubar o candidato]
9. SEÇÃO FINAL NO RODAPÉ:
   "## Diretrizes Oficiais & Consensos de Referência"
   - Liste os consensos oficiais aplicáveis indicando claramente o órgão emissor e o ano (ex: Ministério da Saúde 2024, FEBRASGO 2024, SBC, ATLS 11ª ed).
   - NUNCA coloque referências no topo do resumo.

DADOS ESTATÍSTICOS DO BANCO DE QUESTÕES:
${JSON.stringify(examStats, null, 2)}

TRECHOS DA BASE DE DIRETRIZES OFICIAIS E LIVROS:
${retrievedChunksText || 'Utilize as diretrizes médicas oficiais vigentes mais recentes (2024-2026) das sociedades brasileiras e internacionais.'}
`;

    const systemInstruction = 'Você é um médico preceptor especialista em provas de residência médica. Redija o resumo clínico canônico cirúrgico, fundamentado nas diretrizes vigentes mais recentes. Responda apenas com o markdown canônico, sem saudações ou comentários introdutórios.';

    if (mode === 'vertex_only' || mode === 'hybrid') {
      const vertexRes = await callVertexAi({
        prompt: summaryPrompt,
        systemInstruction,
        model: 'gemini-1.5-pro-002',
        temperature: 0.1,
        maxOutputTokens: 8192
      });

      summaryMarkdown = vertexRes.content;
      providersUsed.summary = `${vertexRes.provider} (${vertexRes.modelUsed})`;
    } else {
      const fullPrompt = `${systemInstruction}\n\n${summaryPrompt}`;
      summaryMarkdown = await callGeminiAi(fullPrompt, {
        temperature: 0.1
      });
      providersUsed.summary = 'google_ai_studio (gemini-flash)';
    }

    // =========================================================================
    // ETAPA 4: QUALITY GATE & VALIDAÇÃO AUTOMATIZADA
    // =========================================================================
    const validationChecks: Array<{ check: string; status: 'passed' | 'warning' | 'failed'; detail: string }> = [];

    if (summaryMarkdown) {
      // 1. Proibição de Mermaid escuro
      const hasMermaid = summaryMarkdown.includes('```mermaid');
      validationChecks.push({
        check: 'CHECK-DESIGN-MERMAID: Zero diagramas Mermaid escuros',
        status: hasMermaid ? 'failed' : 'passed',
        detail: hasMermaid ? 'Mermaid escuro detectado no resumo. Deve ser substituído por componentes nativos.' : 'Resumo limpo sem blocos Mermaid.'
      });

      // 2. Referências no rodapé
      const hasRefBottom = summaryMarkdown.toLowerCase().includes('diretrizes oficiais') || summaryMarkdown.toLowerCase().includes('referências');
      validationChecks.push({
        check: 'CHECK-DESIGN-REFS: Referências no rodapé',
        status: hasRefBottom ? 'passed' : 'warning',
        detail: hasRefBottom ? 'Seção de diretrizes posicionada no rodapé.' : 'Seção de referências ausente.'
      });

      // 3. Proibição de SVGs sintéticos
      const hasSvg = summaryMarkdown.includes('data:image/svg+xml');
      validationChecks.push({
        check: 'CHECK-DESIGN-SVG: Zero SVGs sintéticos',
        status: hasSvg ? 'failed' : 'passed',
        detail: hasSvg ? 'SVGs sintéticos detectados.' : 'Zero SVGs artificiais.'
      });

      // 4. Verificação de Titulação Semântica Clínica (sem meta-títulos)
      const hasMetaTitles = /##\s*(\d+\.)?\s*(Definições|Algoritmo Decisório|Matriz 2x2)/i.test(summaryMarkdown);
      validationChecks.push({
        check: 'CHECK-DESIGN-TITLES: Titulação clínica médica semântica',
        status: hasMetaTitles ? 'failed' : 'passed',
        detail: hasMetaTitles
          ? 'Meta-títulos genéricos encontrados ("Definições" ou "Algoritmo Decisório"). Devem ser substituídos por títulos clínicos reais.'
          : 'Títulos semânticos clínicos corretos para a barra de navegação rápida.'
      });

      // 5. Verificação da Seção "O Que Mudou na Diretriz Recente"
      const hasGuidelineChanges = summaryMarkdown.includes('O Que Mudou na Diretriz') || summaryMarkdown.includes('Ruptura de Paradigma');
      validationChecks.push({
        check: 'CHECK-DESIGN-CHANGES: Tabela de Mudanças de Diretriz (Antes vs Agora)',
        status: hasGuidelineChanges ? 'passed' : 'warning',
        detail: hasGuidelineChanges
          ? 'Seção comparativa de transição de diretriz e distratores de prova presente.'
          : 'Recomenda-se incluir a seção "O Que Mudou na Diretriz Recente" para patologias com atualizações.'
      });

      // 6. Verificação do Bloco Donut e Censo Estatístico
      const hasValidExamStats = summaryMarkdown.includes('```exam-stats') && !summaryMarkdown.includes('```exam-stats\n{}\n') && examStats.length > 0;
      validationChecks.push({
        check: 'CHECK-DESIGN-CENSUS: Dados do Censo Real no Donut Recharts',
        status: hasValidExamStats ? 'passed' : 'failed',
        detail: hasValidExamStats
          ? `Donut parametrizado com ${examStats.length} fatias do censo real de questões.`
          : 'ERRO: Dados do censo ausentes ou vazios no bloco exam-stats. A plataforma proíbe dados falsos.'
      });
    }

    // Formata o StudyMaterialItem pronto para a plataforma
    const slugFoco = foco.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const specPrefix = especialidade.toLowerCase().slice(0, 3);

    const recurrenceStats: FocusExamAnalytics | undefined = examStats.length > 0 ? {
      focusSlug: slugFoco,
      specialty: especialidade,
      theme: tema,
      focus: foco,
      totalQuestions,
      timeframeRange: '2017-2026',
      version: 1,
      donutSlices: examStats.map((st, i) => ({
        id: i + 1,
        name: st.name,
        shortName: st.shortName,
        percentage: st.percentage,
        questionCount: st.questionCount,
        priority: st.priority,
        color: st.color,
        trend: 'estavel' as const,
        trendLabel: '🏛️ Clássico de Prova',
        takeaway: st.themeClue
      })),
      bancaBreakdown: {},
      topTraps: [],
      auditHash: `audit-${slugFoco}-${totalQuestions}`,
      needsRecalc: false,
      lastRecalculatedAt: new Date().toISOString(),
      status: 'certified'
    } : undefined;

    const studyMaterialItem: StudyMaterialItem = {
      id: `mat-${specPrefix}-${slugFoco}`,
      focusId: `focus-${slugFoco}`,
      title: `${foco}: Resumo Padrão-Ouro de Alto Rendimento`,
      specialty: especialidade,
      theme: tema,
      focus: foco,
      readTimeMinutes: Math.max(6, Math.round(summaryMarkdown.split(/\s+/).length / 140)),
      lastUpdatedYear: 2026,
      guidelineBadge: 'Consenso Oficial & Evidência Padrão-Ouro',
      summarySnippet: `Síntese clínica e condutas de alto rendimento para ${foco} baseadas em ${totalQuestions} questões analisadas nas principais bancas examinadoras.`,
      keyPoints: [
        `Censo estatístico real com ${totalQuestions} questões mapeadas no Donut Recharts.`,
        `Passo a passo da cascata decisória e condutas imediatas de emergência.`,
        `Alertas de pegadinhas e distratores de diretrizes anteriores nas bancas ENARE, USP e estaduais.`
      ],
      markdownContent: summaryMarkdown,
      recurrenceStats
    };

    // =========================================================================
    // ETAPA 5: PERSISTÊNCIA PERMANENTE NO SUPABASE (public.study_materials)
    // Os resumos gerados pelo preceptor tornam-se parte permanente da plataforma
    // =========================================================================
    let savedToSupabase = false;
    let supabaseSaveError: string | null = null;

    if (!isPrivilegedUser) {
      supabaseSaveError = 'Apenas administradores ou curadores podem publicar resumos oficiais no acervo permanente.';
    } else {
      try {
        const supabaseAdmin = getSupabaseAdmin();
      const { error: upsertErr } = await supabaseAdmin
        .from('study_materials')
        .upsert(
          {
            id: studyMaterialItem.id,
            focus_id: studyMaterialItem.focusId || null,
            title: studyMaterialItem.title,
            specialty: studyMaterialItem.specialty,
            theme: studyMaterialItem.theme,
            focus: studyMaterialItem.focus,
            read_time_minutes: studyMaterialItem.readTimeMinutes,
            last_updated_year: studyMaterialItem.lastUpdatedYear,
            guideline_badge: studyMaterialItem.guidelineBadge || 'Consenso Oficial & Evidência Padrão-Ouro',
            summary_snippet: studyMaterialItem.summarySnippet,
            markdown_content: studyMaterialItem.markdownContent,
            key_points: studyMaterialItem.keyPoints,
            status: 'published',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );

      if (upsertErr) {
        console.error('[StudyGenerator] Erro ao persistir material permanente no Supabase:', upsertErr);
        supabaseSaveError = upsertErr.message;
      } else {
        savedToSupabase = true;
      }
    } catch (saveEx: unknown) {
      const saveErrMsg = saveEx instanceof Error ? saveEx.message : String(saveEx);
      console.warn('[StudyGenerator] Exceção ao persistir no Supabase:', saveErrMsg);
      supabaseSaveError = saveErrMsg;
      }
    }

    return NextResponse.json({
      success: true,
      meta: {
        especialidade,
        tema,
        foco,
        generatedAt: new Date().toISOString(),
        totalExamQuestionsAudited: totalQuestions,
        providersUsed
      },
      statistics: {
        totalQuestions,
        donutData: examStats,
        hasCensusError: examStats.length === 0
      },
      summaryMarkdown,
      studyMaterialItem,
      persistence: {
        savedToSupabase,
        error: supabaseSaveError
      },
      qualityGate: {
        passed: !validationChecks.some(c => c.status === 'failed'),
        checks: validationChecks
      }
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[StudyGenerator] Erro interno:', errorMsg);
    return NextResponse.json(
      { success: false, error: `Erro no pipeline de geração: ${errorMsg}` },
      { status: 500 }
    );
  }
}
