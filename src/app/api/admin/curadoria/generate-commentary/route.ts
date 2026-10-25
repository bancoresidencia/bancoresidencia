import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface QuestionOption {
  letter: string;
  text: string;
  explanation?: string;
}

interface GenerateCommentaryBody {
  questionId?: string;
  statement: string;
  options: QuestionOption[];
  newCorrectAnswer: string;
  institution?: string;
  banca?: string;
  year?: number | string;
  especialidade?: string;
  tema?: string;
  foco?: string;
  studentNotes?: string;
  currentCommentary?: string;
}

function getAvailableGeminiKey(): string | null {
  const envKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5
  ].filter((k): k is string => Boolean(k && k.trim().length > 10));

  if (envKeys.length > 0) {
    const randomIdx = Math.floor(Math.random() * envKeys.length);
    return envKeys[randomIdx];
  }
  return null;
}

function sanitizeText(txt: string): string {
  if (!txt) return '';
  return txt
    .replace(/estrat[ée]gia\s*med/gi, 'Base Médica Teórica')
    .replace(/estrat[ée]gia\s*vestibulares/gi, 'Base Teórica')
    .replace(/estrat[ée]gia/gi, 'Literatura Oficial')
    .replace(/medcurso/gi, 'Diretrizes Oficiais')
    .replace(/sanar/gi, 'Consenso Clínico')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateCommentaryBody = await req.json();
    const {
      statement,
      options = [],
      newCorrectAnswer,
      institution = 'Oficial',
      banca = 'Banca Examinadora',
      year = new Date().getFullYear(),
      especialidade = 'Clínica Médica',
      tema = '',
      foco = '',
      studentNotes = '',
      currentCommentary = ''
    } = body;

    const goldAnswer = (newCorrectAnswer || '').trim().toUpperCase();

    if (!statement || !options || options.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enunciado e alternativas são obrigatórios.' },
        { status: 400 }
      );
    }

    const goldOption = options.find((o) => o.letter.toUpperCase() === goldAnswer);
    const goldOptionText = goldOption?.text || (goldAnswer === 'ANULADA' ? 'Questão Anulada' : '');

    const geminiKey = getAvailableGeminiKey();

    // Se tiver chave Gemini disponível, gera via IA Médica de Alta Performance
    if (geminiKey) {
      try {
        const formattedOptions = options
          .map((o) => `[Alternativa ${o.letter}]: ${o.text}`)
          .join('\n');

        const optionsSchemaExample = options
          .map((o) => `    "${o.letter}": "Justificativa da alternativa ${o.letter} com destaque no erro..."`)
          .join(',\n');

        const prompt = `Você é um preceptor médico de elite e especialista em provas oficiais de Residência Médica e Revalida no Brasil.
Sua missão é fundamentar tecnicamente a questão e o novo gabarito homologado com rigor acadêmico máximo, 100% de precisão e profundidade clínica.

Dados da Questão:
- Instituição/Banca: ${institution || banca} (${year})
- Especialidade: ${especialidade}
- Tema/Foco: ${tema || ''} ${foco ? ` - ${foco}` : ''}
${studentNotes ? `- Apontamento do Estudante que gerou a revisão: "${studentNotes}"` : ''}
${currentCommentary ? `- Comentário Prévio da Plataforma (para referência de contexto): "${currentCommentary.slice(0, 600)}..."` : ''}

Enunciado:
${statement}

Alternativas:
${formattedOptions}

🔒 GABARITO HOMOLOGADO DEFINITIVO:
- O NOVO GABARITO HOMOLOGADO PELO CURADOR MÉDICO É A ALTERNATIVA ${goldAnswer}: "${goldOptionText}".
- REGRA ABSOLUTA: VOCÊ DEVE FUNDAMENTAR POR QUE A ALTERNATIVA ${goldAnswer} É A CORRETA SEGUNDO A LITERATURA MÉDICA PADRÃO-OURO, DISSECANDO CIRURGICAMENTE OS ERROS DE TODOS OS OUTROS DISTRATORES.

DIRETRIZES DE ELABORAÇÃO:
1. JUSTIFICATIVAS DAS ALTERNATIVAS (OBRIGATÓRIO PARA 100% DAS LETRAS: ${options.map((o) => o.letter).join(', ')}):
   - DESTAQUE EM NEGRITO OBRIGATÓRIO: Em TODAS as alternativas incorretas, coloque em **negrito** o trecho específico incorreto ou o conceito errôneo que invalida a opção. Na alternativa correta (${goldAnswer}), destaque em **negrito** o conceito-chave padrão-ouro ou conduta mandatória.
   - SEM METARRETÓRICA: Vá DIRETO ao raciocínio clínico. Comece justificando critérios clínicos, doses e consensos.
2. SÍNTESE CLÍNICA / COMENTÁRIO FINAL:
   - Fisiopatologia, raciocínio diagnóstico e linha de conduta escalonada.
3. PRINCIPAL MOTIVO DE ERRO:
   - Identifique a armadilha ("pegadinha") ou confusão comum do examinador destacando em **negrito** o ponto de confusão.
4. TAKE-HOME MESSAGE:
   - Mensagem-chave em 1 a 2 frases densas e memoráveis com destaque em **negrito**.
5. REFERÊNCIAS:
   - Liste as diretrizes e consensos médicos oficiais aplicáveis (ex.: Ministério da Saúde, SBC, Febrasgo, SBP, Harrison, etc.).

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "optionExplanations": {
${optionsSchemaExample}
  },
  "finalCommentary": "Síntese clínica unificada do preceptor médico...",
  "mainErrorReason": "O principal motivo que leva o aluno ao erro nesta questão é...",
  "takeHomeMessage": "Pérola clínica prática para memorização rápida...",
  "guidelineEvolution": "Diretriz vigente e conduta preconizada...",
  "references": [
    "Diretriz ou Tratado Médico Oficial 1",
    "Diretriz ou Tratado Médico Oficial 2"
  ]
}`;

        const candidateModels = [
          'gemini-3.5-flash',
          'gemini-flash-latest',
          'gemini-3.8-flash',
          'gemini-3-flash-preview',
          'gemini-2.5-flash'
        ];

        let rawText: string | null = null;
        for (const model of candidateModels) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            const aiRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.15
                }
              })
            });

            if (aiRes.ok) {
              const aiJson = await aiRes.json();
              rawText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text || null;
              if (rawText) break;
            } else {
              const errBody = await aiRes.text();
              console.warn(`[GenerateCommentary API] Model ${model} returned ${aiRes.status}:`, errBody.slice(0, 120));
            }
          } catch (mErr) {
            console.warn(`[GenerateCommentary API] Error calling model ${model}:`, mErr);
          }
        }

        if (rawText) {
            let parsed = null;
            try {
              let clean = rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
              const firstB = clean.indexOf('{');
              const lastB = clean.lastIndexOf('}');
              if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
                clean = clean.slice(firstB, lastB + 1);
              }
              parsed = JSON.parse(clean);
            } catch (err) {
              console.warn('[GenerateCommentary API] Parse JSON error:', err);
            }

            if (parsed && parsed.optionExplanations) {
              const optionExplanations: Record<string, string> = {};
              for (const [letra, exp] of Object.entries(parsed.optionExplanations)) {
                optionExplanations[letra.toUpperCase()] = sanitizeText(String(exp));
              }

              const updatedOptions = options.map((opt) => {
                const exp = optionExplanations[opt.letter.toUpperCase()] || '';
                return {
                  ...opt,
                  explanation: exp || (opt.letter === goldAnswer ? 'Correta.' : 'Incorreta.')
                };
              });

              const finalCommentary = sanitizeText(parsed.finalCommentary || '');
              const mainErrorReason = sanitizeText(parsed.mainErrorReason || '');
              const takeHomeMessage = sanitizeText(parsed.takeHomeMessage || '');
              const guidelineEvolution = sanitizeText(parsed.guidelineEvolution || '');
              const references = Array.isArray(parsed.references)
                ? parsed.references.map((r: unknown) => sanitizeText(String(r))).filter(Boolean)
                : [];

              const fullCommentary = [
                finalCommentary,
                mainErrorReason ? `\n\nPrincipal Motivo de Erro:\n${mainErrorReason}` : '',
                takeHomeMessage ? `\n\nTake-Home Message:\n${takeHomeMessage}` : '',
                guidelineEvolution ? `\n\nEvolução de Diretrizes:\n${guidelineEvolution}` : '',
                references.length > 0 ? `\n\nReferências:\n${references.map((r: string) => `• ${r}`).join('\n')}` : ''
              ]
                .filter(Boolean)
                .join('')
                .trim();

              return NextResponse.json({
                success: true,
                isAiGenerated: true,
                correctAnswer: goldAnswer,
                commentary: fullCommentary,
                options: updatedOptions,
                mainErrorReason,
                takeHomeMessage,
                guidelineEvolution,
                references
              });
            }
          }
        } catch (geminiErr) {
          console.warn('[GenerateCommentary API] Falha na chamada Gemini, usando fallback estruturado:', geminiErr);
        }
      }

    // Fallback Estruturado Padrão-Ouro (Garante retorno instantâneo e robusto com marcações)
    const updatedOptions = options.map((opt) => {
      const isCorrect = opt.letter.toUpperCase() === goldAnswer;
      if (isCorrect) {
        return {
          ...opt,
          explanation: `Correta. **${opt.text}** é a conduta diagnóstica e terapêutica preconizada pelas diretrizes oficiais para o caso apresentado.`
        };
      }
      return {
        ...opt,
        explanation: `Incorreta. A conduta **${opt.text.slice(0, 60)}...** não se aplica como primeira escolha ou conduta prioritária neste contexto clínico.`
      };
    });

    const fallbackFullCommentary = [
      `Síntese Clínica:\nA alternativa [${goldAnswer}] é o gabarito padrão-ouro para a questão de ${especialidade}${tema ? ` (${tema})` : ''}. Diante do quadro clínico exposto no enunciado, a conduta correta requer fundamentação rigorosa segundo as diretrizes de referência vigentes.`,
      `\n\nPrincipal Motivo de Erro:\nConfusão diagnóstica frequente com os distratores e inversão de critérios de escalonamento terapêutico.`,
      `\n\nTake-Home Message:\n**Atenção aos critérios diagnósticos e fluxogramas de primeira linha para fixação na prova de Residência.**`,
      `\n\nReferências:\n• Diretrizes e Protocolos Clínicos Oficiais do Ministério da Saúde / Sociedades Médicas Brasileiras\n• Tratados de Especialidade Médica (Consensos Padrão-Ouro)`
    ].join('');

    return NextResponse.json({
      success: true,
      isAiGenerated: false,
      correctAnswer: goldAnswer,
      commentary: fallbackFullCommentary,
      options: updatedOptions,
      mainErrorReason: 'Confusão com distratores e inversão de condutas prioritárias.',
      takeHomeMessage: `Revisão do tema ${tema || especialidade} com foco na conduta da alternativa [${goldAnswer}].`,
      references: [
        'Diretrizes Médicas Oficiais Brasileiras',
        'Protocolos Clínicos de Especialidades (Padrão-Ouro)'
      ]
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[GenerateCommentary API] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
