import fs from 'fs';

// Reconstruir o prompt padrão gerado por solve_questions_engine.mjs para uma questão média
const specialtyInstruction = 'Você é um Cardiologista e preceptor de residência médica. Fundamente com as diretrizes da Sociedade Brasileira de Cardiologia (SBC), AHA/ACC e ESC.';
const mission = 'Sua missão é fundamentar tecnicamente a questão e o gabarito oficial da banca examinadora com rigor acadêmico máximo, 100% de precisão e concisão clínica.';

const metadataExample = `Dados da Questão:
- Instituição/Banca: ENARE/ENAMED (2021)
- Especialidade: Clínica Médica
- Tema: Cardiologia
- Tópicos de Referência dos Livros Médicos: Síndromes Coronarianas Agudas, Insuficiência Cardíaca, Hipertensão Arterial Sistêmica`;

const statementExample = `Enunciado:
Paciente masculino, 70 anos, hipertenso, diabético e obeso, dá entrada no pronto atendimento com quadro de dor torácica de início súbito há cerca de 2 horas, de forte intensidade, com irradiação para região dorsal. Na admissão, está com PA de 200/110 mmHg, FC de 95 bpm, FR de 16 irpm e saturação de O2 de 95%, com ausculta cardíaca mostrando sopro aórtico sistólico +++/IV, pulsos periféricos assimétricos, finos, e palidez cutânea com pele fria. Foi realizada tomografia de aorta com contraste, com diagnóstico de dissecção aguda de aorta. Sobre esse quadro, assinale a alternativa correta.`;

const optionsExample = `Alternativas:
A) O controle da dor do paciente deve ser feito com anti-inflamatório não esteroidal, como dipirona.
B) O uso de nitroprussiato de sódio deve ser iniciado imediatamente para controle pressórico em monoterapia.
C) Deve-se iniciar anticoagulação do paciente.
D) Deve-se ter como alvo o betabloqueio efetivo do paciente, com a FC oscilando entre 60 e 75.
E) O tratamento inicial deve ser com administração de betabloqueadores por via endovenosa, visando diminuir a frequência cardíaca e a pressão arterial.`;

const anchorRule = `🔒 PRINCÍPIO DO GABARITO IMUTÁVEL (ÂNCORA DE OURO DA BANCA EXAMINADORA):
- O GABARITO OFICIAL DEFINITIVO DA BANCA EXAMINADORA É A ALTERNATIVA B: "O uso de nitroprussiato de sódio deve ser iniciado imediatamente para controle pressórico em monoterapia.".
- REGRA ABSOLUTA: VOCÊ NÃO DEVE ESCOLHER OUTRA ALTERNATIVA NEM DISCORDAR DA BANCA. O gabarito oficial considerado pelo concurso É A ALTERNATIVA B.
- Sua tarefa como preceptor é EXPLICAR e FUNDAMENTAR com a literatura médica por que a banca deu a Alternativa B como correta, dissecando os erros de todos os outros distratores.`;

const finalCommentaryInstruction = `⚠️ REGRA MANDATÓRIA PARA O COMENTÁRIO FINAL (QUESTÃO SEM ITENS):
No campo "finalCommentary", apresente o comentário em TEXTO CORRIDO ÚNICO, coeso, direto e bem explicativo.
NÃO SEPARE por subtópicos como "Fisiopatologia", "Raciocínio Diagnóstico", "Conduta Escalonada" ou "Critérios Decisórios".
Una o diagnóstico à conduta de forma concisa e fluida. Poupe tokens e só faça raciocínio mais complexo quando for realmente necessário.
Destaque em **negrito** os termos diagnósticos e condutas essenciais/pontos diferenciais mais importantes.
O campo 'finalCommentary' DEVE ser objetivo, contendo no máximo 650 caracteres no total. Vá direto ao ponto sem qualquer palavra dispensável.`;

const formattingGuidelines = `DIRETRIZES DE FORMATAÇÃO:
1. JUSTIFICATIVAS DAS ALTERNATIVAS (OBRIGATÓRIO PARA 100% DAS LETRAS: A, B, C, D, E):
   - Forneça justificativa completa para TODAS as alternativas existentes.
   - DESTAQUE EM NEGRITO OBRIGATÓRIO: Em TODAS as alternativas incorretas, você DEVE obrigatoriamente colocar em **negrito** o trecho específico incorreto ou o conceito errôneo que invalida a opção. Na alternativa correta (B), destaque em **negrito** o conceito-chave padrão-ouro ou conduta mandatória.
   - SEM METARRETÓRICA: Vá DIRETO ao raciocínio clínico. NUNCA inicie com "A alternativa está correta/incorreta" ou "Incorreta porque".
2. VERIFICAÇÃO DE COERÊNCIA HISTÓRICA DO GABARITO DA BANCA:
   - Se o gabarito oficial for flagrantemente absurdo: marque "isAbsurdKey": true, descreva em "divergenceReason" a fundamentação e em "suggestedCorrectAnswer" indique a letra correta ou "ANULADA". Caso contrário, mantenha "isAbsurdKey": false e "suggestedCorrectAnswer": "B".
3. PRINCIPAL MOTIVO DE ERRO:
   - Identifique a armadilha ("pegadinha") ou confusão comum de raciocínio de forma cirúrgica, destacando em **negrito** o ponto de confusão.
4. TAKE-HOME MESSAGE:
   - Mensagem-chave em 1 a 2 frases densas com destaque em **negrito**.
5. EVOLUÇÃO DE DIRETRIZES:
   - Situação da diretriz na época da prova vs conduta atualizada hoje (ou informe que permanece igual).
6. REFERÊNCIAS:
   - Liste apenas nomes das diretrizes oficiais e tratados médicos clássicos.
7. REGRA ABSOLUTA: JAMAIS cite nomes de cursinhos ou marcas comerciais concorrentes.`;

const jsonSchemaInstruction = `Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "optionExplanations": {
    "A": "Justificativa da alternativa A com destaque no erro...",
    "B": "Justificativa da alternativa B com destaque no erro...",
    "C": "Justificativa da alternativa C com destaque no erro...",
    "D": "Justificativa da alternativa D com destaque no erro...",
    "E": "Justificativa da alternativa E com destaque no erro..."
  },
  "isAbsurdKey": false,
  "divergenceReason": "",
  "suggestedCorrectAnswer": "B",
  "finalCommentary": "Síntese clínica unificada ou tópicos dos itens I, II, III...",
  "mainErrorReason": "O principal motivo que leva o aluno ao erro nesta questão é...",
  "takeHomeMessage": "Pérola clínica prática para memorização...",
  "guidelineEvolution": "Como era na época da prova vs o que mudou e como é hoje...",
  "references": [
    "Nome da Obra ou Diretriz Oficial 1",
    "Nome da Obra ou Diretriz Oficial 2"
  ]
}`;

const fullPrompt = [
  specialtyInstruction,
  mission,
  metadataExample,
  statementExample,
  optionsExample,
  anchorRule,
  finalCommentaryInstruction,
  formattingGuidelines,
  jsonSchemaInstruction
].join('\n\n');

console.log('--- ANÁLISE DE TAMANHO DO PROMPT (INPUT) ---');
console.log('Tamanho total do prompt em caracteres:', fullPrompt.length);

const sections = [
  { name: '1. Persona do Preceptor e Missão', text: specialtyInstruction + '\n\n' + mission },
  { name: '2. Metadados e Tópicos dos Livros', text: metadataExample },
  { name: '3. Enunciado da Questão (Dinâmico)', text: statementExample },
  { name: '4. Alternativas da Questão (Dinâmico)', text: optionsExample },
  { name: '5. Âncora de Ouro / Gabarito Imutável', text: anchorRule },
  { name: '6. Regra do Comentário Final (650 chars/assertivas)', text: finalCommentaryInstruction },
  { name: '7. Diretrizes de Formatação (Negrito, 7 regras)', text: formattingGuidelines },
  { name: '8. Schema JSON e Exemplo de Resposta', text: jsonSchemaInstruction },
];

let totalChars = 0;
sections.forEach(s => totalChars += s.text.length);

// Taxa empírica no Gemini para PT-BR ~ 3.2 caracteres por token
const ratio = 1 / 3.2;

sections.forEach(s => {
  const c = s.text.length;
  const pct = ((c / totalChars) * 100).toFixed(1);
  const estTokens = Math.round(c * ratio);
  console.log(`- ${s.name}: ${c} chars | ~${estTokens} tokens (${pct}%)`);
});

const dynamicChars = statementExample.length + optionsExample.length;
const staticChars = totalChars - dynamicChars;

console.log(`\nResumo Estático vs Dinâmico no Prompt:`);
console.log(`- Conteúdo Dinâmico da Questão (Enunciado + Alternativas): ${dynamicChars} chars (~${Math.round(dynamicChars * ratio)} tokens, ${((dynamicChars / totalChars) * 100).toFixed(1)}%)`);
console.log(`- Instruções Estáticas (Regras, Diretrizes, Persona, Schema JSON): ${staticChars} chars (~${Math.round(staticChars * ratio)} tokens, ${((staticChars / totalChars) * 100).toFixed(1)}%)`);

