import fs from 'fs';
import path from 'path';

const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview'
];

let currentKeyIndex = 0;

async function callGoogleAiStudio(prompt, systemInstruction = '') {
  let attempts = 0;
  const maxAttempts = GEMINI_KEYS.length * CANDIDATE_MODELS.length;

  while (attempts < maxAttempts) {
    const key = GEMINI_KEYS[currentKeyIndex % GEMINI_KEYS.length];
    const model = CANDIDATE_MODELS[Math.floor(attempts / GEMINI_KEYS.length) % CANDIDATE_MODELS.length];
    currentKeyIndex++;
    attempts++;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192
        }
      };
      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 100) {
          console.log(`  [AI Studio] Sucesso com modelo ${model} usando chave ${(currentKeyIndex - 1) % GEMINI_KEYS.length + 1}`);
          return text.trim();
        }
      } else {
        const errText = await res.text();
        console.warn(`  [AI Studio] Tentativa ${attempts} falhou com ${model} (HTTP ${res.status}): ${errText.slice(0, 100)}`);
      }
    } catch (e) {
      console.warn(`  [AI Studio] Erro de rede: ${e.message}`);
    }

    // Pequena pausa antes da próxima tentativa
    await new Promise((r) => setTimeout(r, 600));
  }

  throw new Error('Todas as chaves e modelos do Google AI Studio falharam.');
}

const TOPICS = [
  {
    id: 'mat-gem-01',
    focusId: 'obs-gem-classificacao',
    title: 'Classificação, Diagnóstico e Corionicidade na Gemelaridade',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Gestação Múltipla',
    focus: 'Classificação e Diagnóstico de Gemelares',
    readTimeMinutes: 6,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / ACOG / ISUOG',
    summarySnippet: 'Corionicidade vs. amnionicidade, marco preditor do 1º trimestre (Sinal do Lambda vs. Sinal do T), cronologia de clivagem zigótica e rastreamento cromossômico.',
    statsTag: 'gem-stats-corionicidade',
    censusSnippet: `
Censo Real de 141 Questões de Provas (ENARE, USP, UNICAMP, PSU-MG, AMRIGS):
- Corionicidade e Amnionicidade: Definição e Determinação: 81 questões (57,4%) [Prioridade Crítica]
- Complicações Exclusivas da Gemelaridade Monocoriônica: 18 questões (12,8%) [Prioridade Alta]
- Zigotia: Monozigóticos vs. Dizigóticos: 16 questões (11,3%) [Prioridade Média]
- Ultrassonografia no 1º Trimestre: Sinais Diagnósticos (Lambda vs. T): 15 questões (10,6%) [Prioridade Média]
- Epidemiologia e Fatores de Risco para Gemelaridade: 6 questões (4,3%) [Prioridade Média]
- Manejo e Prognóstico da Gestação Gemelar: 4 questões (2,8%) [Prioridade Média]
- Classificação Geral: 1 questão (0,7%)
    `,
    clinicalDirectives: `
- Determinação de corionicidade no 1º trimestre (11 a 13+6 semanas): exame mais importante da gestação gemelar.
- Sinal do Lambda / Pico Duplo (Twin-Peak sign): projeção triangular de tecido coriônico/trofoblástico entre as membranas. Diagnóstico patognomônico de DICORIÔNICA. Espessura da membrana > 2 mm (> 4 camadas).
- Sinal do T (T-sign): fusão perpendicular fina das membranas amnióticas sem tecido trofoblástico intermediário. Diagnóstico de MONOCORIÔNICA. Espessura da membrana < 2 mm (2 camadas amnióticas).
- Cronologia de Clivagem do Zigoto Monozigótico:
  * 0 a 3 dias: Dicoriônica Diamniótica (DCDA) (~30%)
  * 4 a 8 dias: Monocoriônica Diamniótica (MCDA) (~70% dos monozigóticos)
  * 9 a 12 dias: Monocoriônica Monoamniótica (MCMA) (~1-2%)
  * > 13 dias: Gêmeos Unidos / Siameses / Conjugados (< 1%)
- Dizigóticos: sempre DICORIÔNICOS e DIAMNIÓTICOS (dois óvulos, dois espermatozoides).
- Armadilha de Prova: Fetos de sexos diferentes são OBRIGATORIAMENTE dizigóticos e dicoriônicos. Excluir monocorionicidade mesmo se placentas parecerem fundidas na USG tardia.
- Não confunda zigotia (genética) com corionicidade (placentação e risco obstétrico). A corionicidade, e não a zigotia, determina o risco de complicações e a conduta clínica.
    `,
    keyPoints: [
      'A corionicidade (e não a zigotia) é o principal determinante prognóstico e de risco obstétrico na gestação gemelar.',
      'Sinal do Lambda (pico duplo) na USG de 11 a 13+6 semanas confirma dicorionicidade; Sinal do T confirma monocorionicidade.',
      'Fetos de sexos anatômicos diferentes são obrigatoriamente dizigóticos e dicoriônicos-diamnióticos.',
      'Clivagem em 0-3 dias gera DCDA; 4-8 dias MCDA; 9-12 dias MCMA; após 13 dias gera gêmeos imperfeitos/unidos (siameses).',
      'Placentas aparentemente únicas na USG de 2º/3º trimestre podem ser dicoriônicas fundidas; a avaliação precoce no 1º tri é mandatória.',
      'A gestação monocoriônica diamniótica exige USG quinzenal com Doppler a partir de 16 semanas para rastreamento precoce de STFF.'
    ]
  },
  {
    id: 'mat-gem-02',
    focusId: 'obs-gem-complicacoes',
    title: 'Complicações Específicas da Gemelaridade Monocoriônica',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Gestação Múltipla',
    focus: 'Complicações da Gemelaridade',
    readTimeMinutes: 7,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / ISUOG / SMFM',
    summarySnippet: 'Fisiopatologia das anastomoses placentárias, TRAP (perfusão arterial reversa), CIUR seletivo, morte intrauterina de um gemelar e sequelas neurológicas isquêmicas.',
    statsTag: 'gem-stats-complicacoes',
    censusSnippet: `
Censo Real de 72 Questões de Provas (ENARE, USP, UNICAMP, PSU-MG, AMRIGS):
- STFF na Gemelaridade: 22 questões (30,6%) [Prioridade Crítica]
- TRAP: Sequência de Perfusão Arterial Reversa: 21 questões (29,2%) [Prioridade Alta]
- Complicações Gerais da Gemelaridade: 16 questões (22,2%) [Prioridade Alta]
- Discordância de Peso > 20% / CIUR seletivo: 5 questões (6,9%) [Prioridade Média]
- Morte de um Gemelar e Risco ao Outro: 5 questões (6,9%) [Prioridade Média]
- TAPS: Sequência Anemia-Policitemia: 3 questões (4,2%) [Prioridade Média]
    `,
    clinicalDirectives: `
- Anastomoses vasculares placentárias: estão presentes em praticamente 100% das placentas monocoriônicas. Podem ser superficiais (arterioarteriais [AA] - protetoras, bidirecionais; venovenosas [VV]) ou profundas (arteriovenosas [AV] - unidirecionais, desbalanço de fluxo).
- TRAP (Twin Reversed Arterial Perfusion Sequence / Feto Acárdico):
  * Fisiopatologia: anastomose vascular artério-arterial e veno-venosa calibrosa direta.
  * O feto "bomba" normal perfunde com sangue desoxigenado o feto malformado "receptor/acárdico" em sentido retrógrado pela artéria umbilical.
  * Feto receptor é acéfalo ou acárdico com edema volumoso em tronco inferior.
  * Feto doador ("bomba") entra em insuficiência cardíaca de alto débito e polidrâmnio. Conduta: ablação vascular do cordão umbilical do feto acárdico (laser / radiofrequência).
- TAPS (Twin Anemia-Polycythemia Sequence):
  * Anastomoses arteriovenosas minúsculas (< 1 mm).
  * Sem discrepância de volume amniótico (sem oligo/polidrâmnio, diferenciando da STFF!).
  * Diagnóstico pelo Doppler de artéria cerebral média (ACM): pico sistólico > 1,5 MoM em um feto (anemia) e < 1,0 MoM no outro feto (policitemia).
- CIUR Seletivo (Discordância Ponderal):
  * Fórmula de discordância de peso: ((Peso maior - Peso menor) / Peso maior) * 100.
  * Significativa quando >= 20% (ou >= 25% com pior prognóstico).
  * Classificação de Gratacós baseada no Doppler da artéria umbilical do feto restrito: Tipo I (Doppler normal), Tipo II (diástole zero/reversa persistente), Tipo III (fluxo diastólico intermitente por grandes anastomoses AA).
- Morte Intrauterina de um Gemelar Monocoriônico:
  * Ocorre descompressão aguda e exsanguinação maciça reflexa do feto sobrevivente em direção ao feto morto através das anastomoses.
  * Hipotensão súbita, isquemia cerebral, leucomalácia periventricular, microcefalia ou óbito do sobrevivente em até 20-30% dos casos.
  * Armadilha de Prova: Não há indicação de cesariana de emergência imediata após a morte de um feto monocoriônico se a lesão isquêmica já ocorreu no momento do óbito; conduta é estabilização materna e avaliação neurológica e de anemia fetal (Doppler ACM) no sobrevivente.
    `,
    keyPoints: [
      'Praticamente 100% das placentas monocoriônicas possuem anastomoses vasculares, sendo a causa de complicações exclusivas.',
      'Na TRAP, o feto doador sofre insuficiência cardíaca congestiva de alto débito e polidrâmnio ao sustentar o feto acárdico.',
      'TAPS diferencia-se de STFF pela ausência de discrepância de líquido amniótico, diagnosticando-se por Doppler da artéria cerebral média.',
      'Discordância de peso >= 20% calculada sobre o peso do maior feto define CIUR seletivo e exige vigilância com Doppler semanal.',
      'Óbito de um feto monocoriônico causa exsanguinação aguda e hipotensão no concepto vivo, com alto risco de lesão neurológica isquêmica.',
      'A presença de anastomoses artério-arteriais (AA) bidirecionais superficiais exerce papel protetor contra STFF grave.'
    ]
  },
  {
    id: 'mat-gem-03',
    focusId: 'obs-gem-stff',
    title: 'Síndrome da Transfusão Feto-Fetal (STFF)',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Gestação Múltipla',
    focus: 'Síndrome da Transfusão Feto-Fetal',
    readTimeMinutes: 7,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / Eurofetus / ISUOG',
    summarySnippet: 'Critérios diagnósticos ultrassonográficos obrigatórios, estadiamento de Quintero (Graus I a V) e conduta padrão-ouro com ablação a laser por fetoscopia.',
    statsTag: 'gem-stats-stff',
    censusSnippet: `
Censo Real de 48 Questões de Provas (ENARE, USP, UNICAMP, PSU-MG, AMRIGS):
- Critérios Diagnósticos & Achados Ultrassonográficos: 19 questões (39,6%) [Prioridade Crítica]
- Classificação de Quintero: Estadiamento e Implicações: 10 questões (20,8%) [Prioridade Alta]
- Fisiopatologia e Tipos de Gestação Gemelar: 10 questões (20,8%) [Prioridade Alta]
- Epidemiologia e Prognóstico Perinatal: 4 questões (8,3%) [Prioridade Média]
- Tratamento e Manejo Terapêutico (Laser): 3 questões (6,3%) [Prioridade Média]
- Características dos Fetos Doador e Receptor: 2 questões (4,2%) [Prioridade Média]
    `,
    clinicalDirectives: `
- Fisiopatologia da STFF: ocorre em 10% a 15% das gestações monocoriônicas diamnióticas, devido a anastomoses arteriovenosas (AV) profundas desbalanceadas sem anastomoses AA compensatórias suficientes.
- Critérios Diagnósticos Ultrassonográficos Obrigatórios de STFF (Cai em 100% das provas):
  1. Gestação Monocoriônica Diamniótica (MCDA).
  2. Oligoâmnio no feto doador: maior bolsão vertical (MBV) < 2 cm.
  3. Polidrâmnio no feto receptor: maior bolsão vertical (MBV) > 8 cm (até 20 semanas) ou > 10 cm (após 20 semanas).
  * Atenção: A discordância de peso ou de tamanho NÃO é critério obrigatório para diagnóstico de STFF!
- Quadro Fisiopatológico dos Fetos:
  * Feto Doador (Hipovolêmico): hipovolemia, oligúria/anúria, oligoâmnio acentuado ("feto prensado" / stuck twin), bexiga pequena ou invisível, restrição de crescimento e anemia.
  * Feto Receptor (Hipervolêmico): sobrecarga circulatória, poliúria, polidrâmnio, bexiga distendida, hipertrofia miocárdica (cardiomegalia), insuficiência valvar tricúspide, hidropisia fetal.
- Classificação de Quintero (Estadiamento de Gravidade):
  * Estádio I: Critério de oligoâmnio (< 2 cm) e polidrâmnio (> 8/10 cm). Bexiga do doador ainda é visível. Doppler fetal normal.
  * Estádio II: Bexiga do doador não visualizada durante todo o exame USG (anúria fetal).
  * Estádio III: Doppler criticamente alterado em qualquer feto (artéria umbilical com diástole zero ou reversa; ducto venoso com onda A reversa; pulsação de veia umbilical).
  * Estádio IV: Hidropisia fetal (ascite, derrame pleural/pericárdico ou anasarca, tipicamente no receptor).
  * Estádio V: Morte intrauterina de um ou ambos os conceptos.
- Tratamento Padrão-Ouro:
  * Fotocoagulação / Ablação Vascular das anastomoses placentárias a Laser guiada por Fetoscopia (Técnica de Solomon).
  * Janela terapêutica ideal: entre 16 e 26 semanas de gestação (Quintero II a IV, e I se progressão ou sintomático).
  * Amniodrenagem seriada: procedimento secundário/paliativo reservado para casos onde o laser não está disponível ou acima de 26 semanas.
    `,
    keyPoints: [
      'STFF é complicação exclusiva de gestações monocoriônicas decorrente de anastomoses arteriovenosas profundas desbalanceadas.',
      'O diagnóstico exige obrigatoriamente oligoâmnio no doador (MBV < 2 cm) associado a polidrâmnio no receptor (MBV > 8 cm até 20 sem ou > 10 cm após).',
      'Discordância ponderal ou de tamanho fetal NÃO é critério obrigatório para firmar o diagnóstico de STFF.',
      'Na classificação de Quintero: Grau II = bexiga do doador invisível; Grau III = Doppler alterado; Grau IV = hidropisia; Grau V = óbito.',
      'O tratamento padrão-ouro de 1ª linha entre 16 e 26 semanas é a ablação a laser das anastomoses vasculares por fetoscopia.',
      'O feto receptor sofre sobrecarga volêmica com cardiomegalia e insuficiência cardíaca de alto débito, podendo evoluir para hidropisia.'
    ]
  },
  {
    id: 'mat-gem-04',
    focusId: 'obs-gem-parto',
    title: 'Assistência ao Parto e Momento da Interrupção na Gestação Múltipla',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Gestação Múltipla',
    focus: 'Parto em Gestação Múltipla',
    readTimeMinutes: 6,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / ACOG / NICE',
    summarySnippet: 'Idade gestacional programada conforme corionicidade, critérios para parto vaginal, indicações de cesárea, apresentações combinadas e manejo do segundo gemelar.',
    statsTag: 'gem-stats-parto',
    censusSnippet: `
Censo Real de 36 Questões de Provas (ENARE, USP, UNICAMP, PSU-MG, AMRIGS):
- Momento do Parto: Idade Gestacional e Corionicidade: 10 questões (27,8%) [Prioridade Alta]
- Termo e Condições para Parto Vaginal: 10 questões (27,8%) [Prioridade Alta]
- Indicação de Parto Cesáreo em Gemelar: 6 questões (16,7%) [Prioridade Alta]
- Via de Parto: Apresentação Fetal Combinada: 5 questões (13,9%) [Prioridade Média]
- Manejo do Segundo Gemelar e Complicações: 3 questões (8,3%) [Prioridade Média]
- Parto Geral: 2 questões (5,6%) [Prioridade Média]
    `,
    clinicalDirectives: `
- Momento Programado da Resolução da Gestação (Idade Gestacional Padrão de Prova):
  * Dicoriônica Diamniótica (DCDA) não complicada: 37 semanas a 38 semanas e 6 dias.
  * Monocoriônica Diamniótica (MCDA) não complicada: 36 semanas a 37 semanas e 0 dias.
  * Monocoriônica Monoamniótica (MCMA): 32 semanas a 34 semanas (resolução OBRIGATORIAMENTE por cesariana eletiva após corticoterapia pelo risco iminente de acidente funicular por entrelaçamento de cordão).
  * Gêmeos Unidos (Siameses): 34 a 36 semanas por cesariana com histerotomia ampla.
- Seleção da Via de Parto conforme Apresentação Combinada dos Fetos:
  1. Primeiro Cefálico / Segundo Cefálico (~40% dos casos): Via de escolha é o PARTO VAGINAL.
  2. Primeiro Cefálico / Segundo Não-Cefálico (Pélvico ou Córmico) (~35-40% dos casos): O parto vaginal é PERMITIDO se equipe experiente e peso fetal estimado entre 1.500g e 4.000g (sem discordância acentuada > 20-25%). Após saída do 1º, realiza-se versão podálica interna ou extração pélvica assistida do 2º se indicado.
  3. Primeiro Não-Cefálico (Pélvico ou Córmico) / Qualquer apresentação do 2º (~20-25%): INDICAÇÃO ABSOLUTA DE CESARIANA (alto risco de entrelaçamento ou engastamento de cabeças em feto pélvico/cefálico).
  4. Gestação Monoamniótica: CESARIANA ELETIVA OBRIGATÓRIA.
- Manejo Ativo do Segundo Gemelar:
  * Imediatamente após a expulsão do 1º gemelar: clampear o cordão umbilical de imediato (prevenção de hemorragia em caso de anastomose inadvertida).
  * Confirmar estaticamente a apresentação fetal e BCF do 2º concepto por palpação e ultrassom de sala de parto.
  * Monitorar batimentos fetais continuamente.
  * Se contrações cessarem ou reduzirem: iniciar ou titular infusão de ocitocina.
  * Amniotomia do 2º saco gestacional guiada com apresentação fixa.
  * Intervalo seguro recomendado de nascimento entre o 1º e o 2º gemelar: até 30 minutos na vigência de frequência cardíaca fetal normal.
    `,
    keyPoints: [
      'Idade gestacional programada: DCDA = 37-38 sem; MCDA = 36-37 sem; MCMA = 32-34 sem (cesariana obrigatória).',
      'Se o 1º gemelar for não-cefálico (pélvico ou córmico), a indicação de parto cesáreo é absoluta, independente do 2º.',
      'Com 1º feto cefálico e 2º cefálico, a via preferencial é o parto vaginal.',
      'Com 1º cefálico e 2º não-cefálico, o parto vaginal é permitido em concepto > 1.500g e equipe habilitada em versão podálica interna.',
      'O clampeamento do cordão do 1º feto deve ser imediato para evitar espoliação hemodinâmica fetal por anastomoses desconhecidas.',
      'O intervalo entre o nascimento dos gemelares pode ser de até 30 minutos desde que a monitorização fetal permaneça estritamente normal.'
    ]
  }
];

async function generateSingleSummary(topic) {
  console.log(`\n================================================================`);
  console.log(`🚀 GERANDO RESUMO: ${topic.title}`);
  console.log(`================================================================`);

  const systemInstruction = `Você é um Médico Obstetra Preceptor Especialista em Provas de Residência Médica (FEBRASGO/ACOG/R3). 
Sua missão é redigir o RESUMO CLÍNICO PADRÃO-OURO DE ALTO RENDIMENTO para o foco "${topic.focus}" (Tema: "${topic.theme}").
Você deve obedecer estritamente às diretrizes do med-study-design-system v2.7.0.
Responda exclusivamente com o markdown estruturado cirúrgico, sem cumprimentos, sem introduções conversacionais e sem enrolação.`;

  const prompt = `
Redija o RESUMO CLÍNICO CANÔNICO DE ALTO RENDIMENTO para o foco "${topic.focus}" em Obstetrícia.

ESTRUTURA OBRIGATÓRIA DO MARKDOWN (Siga a risca o med-study-design-system):

1. TOPO LIMPO:
   - NÃO crie nenhum título H1 no início do texto (o leitor do site já renderiza o título oficial). Comece direto com:
   ---
   ## 1. O Que Mais Cai nas Provas de Residência Médica

2. SEÇÃO 1: "## 1. O Que Mais Cai nas Provas de Residência Médica"
   - Apresente um parágrafo analítico curto destacando a relevância nas bancas examinadoras líderes (ENARE, USP, UNICAMP, PSU-MG, AMRIGS).
   - Insira obrigatoriamente o token do card estatístico Recharts exatamente neste formato:
   \`\`\`${topic.statsTag}
   Recorrência Temática de ${topic.focus}
   \`\`\`
   - Apresente uma síntese analítica dos subfocos mais prevalentes com base neste censo:
${topic.censusSnippet}

3. SEÇÃO 2: "## 2. Definições Modernas & Parâmetros de Gravidade"
   - Conceito clássico vs. parâmetros atualizados pelas diretrizes (FEBRASGO, ACOG, FIGO, ISUOG).
   - Caixas de aviso obrigatórias no padrão GitHub Flavored Markdown:
     > [!WARNING] Armadilha Clássica de Prova: [Descrever o distrator ou pegadinha clássica que as bancas usam para derrubar candidatos]
   - Fórmulas clínicas matemáticas devem utilizar KaTeX centralizado elegante ($$\\text{Formula} = ...$$).

4. SEÇÃO 3: "## 3. Matriz 2x2 & Classificações Essenciais"
   - Apresente os conceitos cardinais organizados em 4 quadrantes objetivos (matriz quaternária 2x2: 2 colunas e 2 linhas) com badges e microcopy direto.

5. SEÇÃO 4: "## 4. Algoritmo Decisório & Conduta Imediata"
   - PRECEDIDO OBRIGATORIAMENTE por um subtítulo exatamente:
     ### Passo a Passo Sintético da Cascata Decisória
   - Apresente de 3 a 5 passos numerados objetivos. Cada passo DEVE abrir com a regra de ouro em negrito:
     * **[Ponto Principal]:** [Conduta mandatória ou regra de ouro]
   - PROIBIÇÃO ABSOLUTA: ZERO BLOCOS DE MERMAID ESCUROS (\`\`\`mermaid) E ZERO SVGS ARTIFICIAIS (data:image/svg+xml).

6. SEÇÃO FINAL OBRIGATÓRIA NO RODAPÉ:
   "## Diretrizes Oficiais & Consensos de Referência"
   - Liste as diretrizes oficiais de referência numeradas (ex: FEBRASGO, Ministério da Saúde, ACOG, FIGO, ISUOG).
   - PROIBIÇÃO ESTRITA: NUNCA coloque referências no topo do resumo.
   - PROIBIÇÃO ESTRITA: NÃO adicione seção estática de "Pontos-Chave para Prova" no texto (os pontos-chave já serão renderizados pelo carrossel nativo interativo).

DIRETRIZES CLÍNICAS E DADOS ESPECÍFICOS PARA EMBASAR O TEXTO:
${topic.clinicalDirectives}
`;

  const markdownContent = await callGoogleAiStudio(prompt, systemInstruction);

  // Validação básica do texto gerado
  if (markdownContent.startsWith('# ')) {
    // Remove eventual título H1 no topo
    const lines = markdownContent.split('\n');
    lines.shift();
    return lines.join('\n').trim();
  }

  return markdownContent;
}

async function main() {
  console.log('================================================================');
  console.log('🩺 INICIANDO PIPELINE DE GERAÇÃO: 4 RESUMOS DE GESTAÇÃO MÚLTIPLA');
  console.log('🤖 Motor: Exclusivo Google AI Studio com Pool de 8 Chaves');
  console.log('================================================================');

  const generatedMaterials = [];

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    try {
      const markdown = await generateSingleSummary(topic);

      // Salva arquivo individual em docs para auditoria
      const docPath = path.join(process.cwd(), 'docs', `resumo_gemelaridade_${String(i + 1).padStart(2, '0')}.md`);
      fs.writeFileSync(docPath, markdown, 'utf8');
      console.log(`  💾 Arquivo gravado em: ${docPath}`);

      generatedMaterials.push({
        id: topic.id,
        focusId: topic.focusId,
        title: topic.title,
        specialty: topic.specialty,
        theme: topic.theme,
        focus: topic.focus,
        readTimeMinutes: topic.readTimeMinutes,
        lastUpdatedYear: topic.lastUpdatedYear,
        guidelineBadge: topic.guidelineBadge,
        summarySnippet: topic.summarySnippet,
        keyPoints: topic.keyPoints,
        markdownContent: markdown
      });

      // Aguarda 2 segundos entre as requisições para evitar picos
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`❌ Falha fatal ao gerar resumo ${topic.id}:`, err);
      process.exit(1);
    }
  }

  // Salva resultado consolidado em JSON intermediário para merge seguro
  const bundlePath = path.join(process.cwd(), 'data', 'gemelaridade_study_materials.json');
  fs.writeFileSync(bundlePath, JSON.stringify(generatedMaterials, null, 2), 'utf8');
  console.log(`\n🎉 4 RESUMOS GERADOS COM SUCESSO E GRAVADOS EM: ${bundlePath}`);
}

main();

