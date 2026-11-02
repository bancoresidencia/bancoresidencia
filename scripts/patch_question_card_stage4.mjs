import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'components', 'QuestionCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

function applyReplace(name, startMarker, endMarker, replacement) {
  const normStart = startMarker.replace(/\r?\n/g, eol);
  const normEnd = endMarker.replace(/\r?\n/g, eol);
  const startIdx = content.indexOf(normStart);
  if (startIdx === -1) {
    console.error(`❌ ${name}: startMarker não encontrado!`);
    console.error('Marker:', normStart);
    process.exit(1);
  }
  const endIdx = content.indexOf(normEnd, startIdx);
  if (endIdx === -1) {
    console.error(`❌ ${name}: endMarker não encontrado!`);
    console.error('Marker:', normEnd);
    process.exit(1);
  }
  const fullEndIdx = endIdx + normEnd.length;
  content = content.slice(0, startIdx) + replacement.replace(/\r?\n/g, eol) + content.slice(fullEndIdx);
  console.log(`✅ ${name} aplicado com sucesso.`);
}

// 1. Ampliar a detecção de isSuspectKey
applyReplace(
  'Passo 1: Ampliação da detecção de isSuspectKey',
  '  // Detecção de gabarito sob suspeita/possível erro da banca\n  const isSuspectKey = useMemo(() => {',
  '  }, [activeQuestion.commentary]);',
  `  // Detecção abrangente de gabarito sob suspeita/possível erro ou divergência médica da banca
  const isSuspectKey = useMemo(() => {
    const comm = (activeQuestion.commentary || '').toUpperCase();
    return (
      comm.includes('[POSSÍVEL ERRO DE GABARITO') ||
      comm.includes('POSSIVEL ERRO DE GABARITO') ||
      comm.includes('GABARITO DA BANCA DIVERGENTE') ||
      comm.includes('QUESTÃO PASSÍVEL DE ANULAÇÃO') ||
      comm.includes('QUESTAO PASSIVEL DE ANULACAO') ||
      comm.includes('GABARITO OFICIAL DIVERGE') ||
      comm.includes('GABARITO EQUIVOCADO') ||
      comm.includes('ERRO DA BANCA')
    );
  }, [activeQuestion.commentary]);`
);

// 2. Inserir badge de Gabarito sob Curadoria Médica no cabeçalho
applyReplace(
  'Passo 2: Badge de Gabarito sob Curadoria no cabeçalho',
  '              {question.tipoProva && (\n                <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800">\n                  {question.tipoProva}\n                </span>\n              )}',
  '              {question.tipoProva && (\n                <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800">\n                  {question.tipoProva}\n                </span>\n              )}',
  `              {question.tipoProva && (
                <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800">
                  {question.tipoProva}
                </span>
              )}

              {isAnswered && isSuspectKey && (
                <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1.5 shadow-2xs animate-in fade-in duration-200">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Gabarito Sob Curadoria Médica</span>
                </span>
              )}`
);

// 3. Container da opção: tratamento gracioso de questão em homologação (sem pintar de vermelho indevido)
applyReplace(
  'Passo 3: Container da opção em homologação',
  '              } else if (isPending && isAnuladaQuestion) {\n                optionContainerStyle =\n                  \'border-amber-500/80 bg-amber-50/80 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/30 shadow-sm font-semibold\';\n              } else if (isPending && !isCorrect) {',
  '              } else if (isPending && !isCorrect) {',
  `              } else if (isPending && isAnuladaQuestion) {
                optionContainerStyle =
                  'border-amber-500/80 bg-amber-50/80 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/30 shadow-sm font-semibold';
              } else if (isPending && !resolvedCorrectAnswer) {
                // Questão com gabarito em homologação: estilo neutro e informativo sem acusar erro
                optionContainerStyle =
                  'border-blue-500/80 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30 shadow-sm font-semibold';
              } else if (isPending && !isCorrect) {`
);

// 4. Badge da alternativa: tratamento gracioso de questão em homologação
applyReplace(
  'Passo 4: Badge da alternativa em homologação',
  '                          : isAnswered && isPending && isAnuladaQuestion\n                          ? \'bg-amber-600 text-white\'\n                          : isAnswered && isPending && !isCorrect',
  '                          : isAnswered && isPending && !isCorrect',
  `                          : isAnswered && isPending && isAnuladaQuestion
                          ? 'bg-amber-600 text-white'
                          : isAnswered && isPending && !resolvedCorrectAnswer
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isAnswered && isPending && !isCorrect`
);

// 5. Feedback de ação da alternativa: 'Sua Opção (Em Homologação)' vs 'Incorreta'
applyReplace(
  'Passo 5: Feedback de ação da alternativa em homologação',
  '                            {isPending && isAnuladaQuestion && !isCorrect && (\n                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold">\n                                <AlertCircle className="w-4 h-4 shrink-0" />\n                                <span className="hidden sm:inline">Sua Opção (Anulada)</span>\n                              </div>\n                            )}\n                            {isPending && !isCorrect && !isAnuladaQuestion && (\n                              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">\n                                <XCircle className="w-4 h-4 shrink-0" />\n                                <span className="hidden sm:inline">Incorreta</span>\n                              </div>\n                            )}',
  '                            {isPending && !isCorrect && !isAnuladaQuestion && (\n                              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">\n                                <XCircle className="w-4 h-4 shrink-0" />\n                                <span className="hidden sm:inline">Incorreta</span>\n                              </div>\n                            )}',
  `                            {isPending && isAnuladaQuestion && !isCorrect && (
                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">Sua Opção (Anulada)</span>
                              </div>
                            )}
                            {isPending && !resolvedCorrectAnswer && !isAnuladaQuestion && (
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                <HelpCircle className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">Sua Opção (Em Homologação)</span>
                              </div>
                            )}
                            {isPending && resolvedCorrectAnswer && !isCorrect && !isAnuladaQuestion && (
                              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">Incorreta</span>
                              </div>
                            )}`
);

// 6. Cabeçalho da síntese clínica: menção explícita de Divergência Médica quando isSuspectKey
applyReplace(
  'Passo 6: Cabeçalho da síntese clínica sob curadoria',
  '                          {activeQuestion.options && activeQuestion.options.length > 0',
  '                            : \'Padrão de Resposta Oficial:\'}\n                        </span>',
  `                          {activeQuestion.options && activeQuestion.options.length > 0
                            ? (resolvedCorrectAnswer
                                ? (isSuspectKey
                                    ? \`Gabarito Oficial da Banca: Alternativa \${resolvedCorrectAnswer} (Divergência Médica Identificada)\`
                                    : \`Gabarito Oficial: Alternativa \${resolvedCorrectAnswer}\`)
                                : 'Gabarito Oficial: Em processo de homologação por provas públicas')
                            : 'Padrão de Resposta Oficial:'}
                        </span>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n🚀 PARABÉNS! Front-end QuestionCard.tsx atualizado com sucesso com todos os 6 tratamentos da Etapa 4!');
