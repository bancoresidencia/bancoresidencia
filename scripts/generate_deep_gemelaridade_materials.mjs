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

    await new Promise((r) => setTimeout(r, 800));
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
    readTimeMinutes: 10,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / ISUOG / ACOG',
    summarySnippet: 'Corionicidade como preditor primário de morbimortalidade, marco ultrassonográfico do 1º trimestre (Lambda vs. T), cronologia de clivagem zigótica, rastreamento genético e conduta pré-natal.',
    statsTag: 'gem-stats-corionicidade',
    specificSectionsPrompt: `
ESTRUTURA DE SEÇÕES CLÍNICAS OBRIGATÓRIAS (Utilize exatamente estes cabeçalhos médicos):

---
## 1. O Que Mais Cai: A Corionicidade como Preditor Primário de Risco
- Apresente um parágrafo analítico fundamentado no censo das principais bancas brasileiras (ENARE, USP, UNICAMP, PSU-MG, AMRIGS).
- Insira o token estatístico:
\`\`\`gem-stats-corionicidade
Recorrência Temática de Classificação e Diagnóstico de Gemelares
\`\`\`
- Explique cirurgicamente que a **corionicidade (número de placentas)**, e NÃO a zigotia (genética), é a variável que dita o risco obstétrico e a conduta de prova.

## 2. Ultrassonografia do 1º Trimestre: Sinal do Lambda (Pico Duplo) vs. Sinal do T
- Janela de ouro: 11 a 13 semanas e 6 dias (acurácia > 98%).
- Explique a fisiopatologia e histologia da membrana intergemelar:
  * **Sinal do Lambda (Twin Peak Sign):** Projeção triangular de tecido trofoblástico entre os folhetos. Confirma DICORIÔNICA. Espessura da membrana > 2 mm (4 camadas: 2 âmnios + 2 córions).
  * **Sinal do T (T-sign):** Inserção perpendicular da membrana fina diretamente sobre a placa coriônica sem tecido trofoblástico interposto. Confirma MONOCORIÔNICA. Espessura da membrana < 2 mm (2 camadas: apenas 2 âmnios).
- Insira notações matemáticas elegantes com implicação clínica:
  $$\\text{Sinal do Lambda} \\implies \\text{Dicoriônica Diamniótica (DCDA)} \\implies \\text{Espessura} > 2\\text{ mm}$$
  $$\\text{Sinal do T} \\implies \\text{Monocoriônica Diamniótica (MCDA)} \\implies \\text{Espessura} < 2\\text{ mm}$$
- Insira uma caixa de aviso:
  > [!WARNING] Armadilha Clássica de Prova: Placentas Fundidas na USG Tardia
  > No 2º e 3º trimestres, duas placentas dicoriônicas adjacentes podem se fundir anatomicamente e simular uma placenta única. O ultrassom precoce do 1º trimestre prevalece SEMPRE sobre qualquer laudo tardio.

## 3. Cronologia da Clivagem Monozigótica e Tipos de Placentação
- Apresente uma tabela completa e detalhada com a cronologia biológica da clivagem do blastocisto monozigótico:
  * Colunas: Dias pós-fertilização | Tipo de Placentação | Proporção entre Monozigóticos | Risco Clínico Principal | Conduta de Vigilância
  * Linhas: 0 a 3 dias (DCDA - 30%), 4 a 8 dias (MCDA - 70%), 9 a 12 dias (MCMA - 1 a 2%), > 13 dias (Gêmeos Unidos/Siameses - < 1%).
- Destaque os dizigóticos: sempre 100% dicoriônicos e diamnióticos (2 óvulos, 2 espermatozoides).

## 4. Rastreamento Cromossômico, Malformações & A Armadilha dos Sexos Opostos
- Como realizar a translucência nucal (TN) em gemelares (avaliação feto a feto).
- NIPT (DNA fetal livre no sangue materno): acurácia em gemelares e limitações.
- Rastreamento de pré-eclâmpsia (uso universal de AAS 100-150 mg/dia a partir de 12 semanas até 36 semanas).
- Caixa de aviso:
  > [!WARNING] Armadilha Clássica de Prova: Fetos de Sexos Diferentes
  > Se a questão descreve um feto masculino e um feminino, eles são OBRIGATORIAMENTE dizigóticos e dicoriônicos. Exclua sumariamente qualquer hipótese de monocorionicidade ou risco de STFF, mesmo se o examinador tentar induzir erro com descrições ultrassonográficas duvidosas.

## 5. Algoritmo Decisório para Diagnóstico e Vigilância Pré-Natal
- Deve conter obrigatoriamente o subtítulo:
### Passo a Passo Sintético da Cascata Decisória
- 4 a 5 passos numerados objetivos. Cada passo DEVE abrir com a regra de ouro em negrito:
  * **[Ponto Principal]:** [Conduta mandatória ou regra de ouro]
- Protocolo de consultas e USG:
  * DCDA: USG a cada 4 semanas a partir de 20 semanas.
  * MCDA: USG com Doppler a cada 2 semanas a partir de 16 semanas (rastreamento ativo de STFF, TAPS e CIUR seletivo).

## Diretrizes Oficiais & Consensos de Referência
- Liste as diretrizes oficiais: FEBRASGO, ACOG, ISUOG, FIGO e Ministério da Saúde.
`,
    keyPoints: [
      'A corionicidade (número de placentas) é o preditor isolado mais relevante de morbimortalidade perinatal na gemelaridade.',
      'Sinal do Lambda (pico duplo) na USG de 11 a 13+6 semanas confirma dicorionicidade; Sinal do T confirma monocorionicidade.',
      'Fetos de sexos anatômicos diferentes são obrigatoriamente dizigóticos e dicoriônicos-diamnióticos.',
      'Clivagem do zigoto em 0-3 dias gera DCDA; 4-8 dias MCDA; 9-12 dias MCMA; após 13 dias gera gêmeos unidos/siameses.',
      'Placentas aparentemente únicas na USG de 2º/3º trimestre podem ser dicoriônicas fundidas; a avaliação no 1º trimestre é padrão-ouro.',
      'Gestação monocoriônica diamniótica exige ultrassonografia quinzenal com Doppler a partir de 16 semanas para rastreio de STFF.',
      'Toda gestação gemelar tem indicação formal de profilaxia para pré-eclâmpsia com AAS em baixa dose (100 a 150 mg/dia) de 12 a 36 semanas.'
    ]
  },
  {
    id: 'mat-gem-02',
    focusId: 'obs-gem-complicacoes',
    title: 'Complicações Específicas da Gemelaridade Monocoriônica',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Gestação Múltipla',
    focus: 'Complicações da Gemelaridade',
    readTimeMinutes: 12,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / ISUOG / SMFM',
    summarySnippet: 'Fisiopatologia das anastomoses vasculares placentárias (AA vs. AV), sequência TRAP (feto acárdico), TAPS, CIUR seletivo (Gratacós) e conduta na morte de um co-gemelar.',
    statsTag: 'gem-stats-complicacoes',
    censusSnippet: '72 questões analisadas',
    specificSectionsPrompt: `
ESTRUTURA DE SEÇÕES CLÍNICAS OBRIGATÓRIAS (Utilize exatamente estes cabeçalhos médicos):

---
## 1. O Que Mais Cai: Fisiopatologia das Anastomoses Vasculares Placentárias
- Parágrafo de cobrança de prova fundamentado nas 72 questões do tema.
- Token estatístico:
\`\`\`gem-stats-complicacoes
Recorrência Temática de Complicações da Gemelaridade
\`\`\`
- Fisiopatologia das anastomoses:
  * Praticamente 100% das placentas monocoriônicas possuem anastomoses vasculares.
  * **Anastomoses Superficiais (Arterioarteriais - AA e Venovenosas - VV):** Bidirecionais, de baixa resistência e alto fluxo. As anastomoses AA exercem papel **protetor crucial**, agindo como válvulas de segurança que equilibram as pressões.
  * **Anastomoses Profundas (Arteriovenosas - AV):** Unidirecionais, no leito capilar cotiledonar compartilhado. São as responsáveis pelo desequilíbrio volumétrico e hemodinâmico.

## 2. Sequência TRAP (Perfusão Arterial Reversa): Feto Bomba vs. Acárdico
- Fisiopatologia: anastomose vascular artério-arterial calibrosa associada a anastomose veno-venosa direta.
- O feto normal ("feto bomba") perfunde o feto malformado receptor retrógradamente via artéria umbilical com sangue desoxigenado.
- Feto acárdico: ausência de desenvolvimento cardíaco e cefálico (acéfalo-acárdico), com edema maciço em tronco inferior e membros inferiores.
- Repercussão no Feto Bomba: hipertrofia miocárdica, cardiomegalia, insuficiência cardíaca congestiva de alto débito, hidropisia e polidrâmnio.
- Conduta Padrão-Ouro: oclusão vascular do cordão umbilical do feto acárdico por ablação por radiofrequência (RFA) ou coagulação a laser.

## 3. Sequência TAPS (Anemia-Policitemia): Diagnóstico pelo Doppler da ACM
- Fisiopatologia: decorre de microanastomoses arteriovenosas minúsculas (< 1 mm) de fluxo muito lento.
- Critério Diagnóstico Padrão de Prova:
  * Ausência de discordância de volume amniótico (SEM oligo/polidrâmnio — isso diferencia crucialmente de STFF!).
  * Diagnóstico firmado exclusivamente pela medição do **Pico de Velocidade Sistólica da Artéria Cerebral Média (PVS-ACM)**:
    $$\\text{Feto Doador (Anêmico)} \\implies \\text{PVS-ACM} > 1,5\\text{ MoM}$$
    $$\\text{Feto Receptor (Policitêmico)} \\implies \\text{PVS-ACM} < 1,0\\text{ MoM}$$
- Caixa de aviso:
  > [!WARNING] Armadilha Clássica de Prova: TAPS vs. STFF
  > A banca tenta enganar o candidato afirmando que há líquido amniótico diminuído no doador de TAPS. Lembre-se: no TAPS, o volume de líquido amniótico é NORMAL e CONCORDANTE em ambos os sacos.

## 4. Restrição de Crescimento Seletiva (RCFs) & Classificação de Gratacós
- Definição: Estimativa de Peso Fetal (EPF) de um dos conceptos abaixo do percentil 10 E/OU discordância de peso $\\ge 20\\%$.
- Fórmula de Discordância Ponderal:
  $$\\text{Discordância Ponderal (\\%)} = \\frac{\\text{Peso do Maior} - \\text{Peso do Menor}}{\\text{Peso do Maior}} \\times 100$$
- Tabela da Classificação de Gratacós (baseada no Doppler da artéria umbilical do feto restrito):
  * Colunas: Tipo Gratacós | Achado de Doppler na Artéria Umbilical | Fisiopatologia Vascular | Prognóstico Clínico | Conduta Recomendada
  * Tipo I: Doppler normal da artéria umbilical (prognóstico favorável, conduta expectante).
  * Tipo II: Diástole zero ou reversa persistente na artéria umbilical (insuficiência placentária severa, alto risco de óbito).
  * Tipo III: Fluxo diastólico intermitente/cíclico na artéria umbilical (presença de grandes anastomoses AA; risco imprevisível de óbito súbito ou lesão neurológica).

## 5. Morte Intrauterina de um Co-Gemelar: Riscos ao Sobrevivente & Conduta
- O que ocorre no momento do óbito de um concepto monocoriônico:
  * Queda brusca da pressão vascular na placenta do feto que morreu.
  * Ocorre exsanguinação aguda e maciça do feto vivo em direção ao leito de baixa resistência do feto morto através das anastomoses.
  * O feto vivo sofre choque hipovolêmico agudo, hipotensão súbita e hipoperfusão cerebral transitória intensa.
- Repercussões clínicas:
  * Morte do segundo feto em até 15-25% dos casos.
  * Lesão isquêmica cerebral grave no sobrevivente em até 20-30% dos casos: **Leucomalácia Periventricular**, porencefalia, microcefalia e paralisia cerebral.
- Caixa de aviso:
  > [!WARNING] Armadilha Clássica de Prova: Não Indicar Cesariana de Emergência Imediata
  > Se o óbito de um feto monocoriônico acabou de ser constatado, a lesão isquêmica no concepto vivo ocorreu NO MOMENTO do óbito. Fazer cesariana de emergência imediata acrescenta a morbidade extrema da prematuridade sem reverter a isquemia prévia. A conduta correta é: estabilização materna, Doppler de ACM no feto vivo (pesquisar anemia aguda) e RNM de encéfalo após 2 a 3 semanas.

## 6. Algoritmo Decisório na Suspeita de Complicações Monocoriônicas
- Deve conter obrigatoriamente o subtítulo:
### Passo a Passo Sintético da Cascata Decisória
- 4 passos numerados objetivos. Cada passo DEVE abrir com a regra de ouro em negrito:
  * **[Ponto Principal]:** [Conduta mandatória ou regra de ouro]

## Diretrizes Oficiais & Consensos de Referência
- Liste as diretrizes: FEBRASGO, ISUOG, ACOG, SMFM e FIGO.
`,
    keyPoints: [
      'Anastomoses vasculares estão presentes em quase 100% das placentas monocoriônicas, gerando patologias exclusivas.',
      'Anastomoses arterioarteriais (AA) são bidirecionais e superficiais, exercendo papel protetor contra desbalanço hemodinâmico grave.',
      'A sequência TRAP envolve perfusão arterial reversa de um feto acárdico, gerando sobrecarga cardíaca e insuficiência no feto bomba.',
      'O TAPS é diagnosticado por discrepância de pico sistólico na artéria cerebral média (> 1,5 MoM vs < 1,0 MoM) sem alteração de líquido amniótico.',
      'Na restrição seletiva (Gratacós), o Tipo II apresenta diástole zero/reversa contínua e o Tipo III apresenta fluxo intermitente por grandes anastomoses AA.',
      'O óbito de um concepto monocoriônico gera exsanguinação aguda reflexa e hipotensão no concepto vivo, com alto risco de leucomalácia periventricular.',
      'A confirmação de óbito de um feto monocoriônico NÃO é indicação de cesariana de emergência imediata indiscriminada.'
    ]
  },
  {
    id: 'mat-gem-03',
    focusId: 'obs-gem-stff',
    title: 'Síndrome da Transfusão Feto-Fetal (STFF)',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Gestação Múltipla',
    focus: 'Síndrome da Transfusão Feto-Fetal',
    readTimeMinutes: 12,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / Eurofetus / ISUOG',
    summarySnippet: 'Critérios diagnósticos ultrassonográficos obrigatórios, fisiopatologia do doador vs. receptor, classificação completa de Quintero (I a V), ablação vascular a laser e técnicas paliativas.',
    statsTag: 'gem-stats-stff',
    specificSectionsPrompt: `
ESTRUTURA DE SEÇÕES CLÍNICAS OBRIGATÓRIAS (Utilize exatamente estes cabeçalhos médicos):

---
## 1. O Que Mais Cai: Critérios Diagnósticos Ultrassonográficos Obrigatórios
- Parágrafo analítico de cobrança com base nas 48 questões de concursos.
- Token estatístico:
\`\`\`gem-stats-stff
Recorrência Temática de Síndrome da Transfusão Feto-Fetal
\`\`\`
- Critérios Diagnósticos Obrigatórios de STFF (Cai em 100% das bancas):
  1. Gestação Monocoriônica Diamniótica (MCDA).
  2. Oligoâmnio no Feto Doador: Maior Bolsão Vertical (MBV) < 2 cm.
  3. Polidrâmnio no Feto Receptor: Maior Bolsão Vertical (MBV) > 8 cm (até 20 semanas) ou > 10 cm (após 20 semanas).
- Caixa de aviso:
  > [!WARNING] Armadilha Clássica de Prova: A Pegadinha da Discordância de Peso
  > As bancas adoram colocar como alternativa: "Diagnóstico firmado por discordância de peso > 20%". ISSO É FALSO. A discordância de peso é critério de CIUR seletivo, NÃO critério diagnóstico de STFF. A STFF é definida estritamente pela discrepância de volume amniótico (MBV < 2 cm e > 8/10 cm).

## 2. Fisiopatologia Comparativa: Feto Doador (Stuck Twin) vs. Receptor (Sobrecarga)
- Tabela comparativa completa das repercussões clínicas e fisiopatológicas:
  * Colunas: Parâmetro Clínico | Feto Doador (Hipovolêmico) | Feto Receptor (Hipervolêmico) | Fisiopatologia Subjacente
  * Volemia: Hipovolemia / Desidratação vs. Hipervolemia / Pletora
  * Função Renal: Oligúria / Anúria vs. Poliúria acentuada
  * Bexiga Fetal: Pequena ou colapsada / Invisível vs. Muito distendida e cheia
  * Líquido Amniótico: Oligoâmnio grave (feto colado à parede / "stuck twin") vs. Polidrâmnio tenso
  * Sistema Cardiovascular: Coração normal/comprimido vs. Cardiomegalia, hipertrofia miocárdica de VD e regurgitação tricúspide
  * Peso e Crescimento: Habitualmente menor / Restrito vs. Maior / Hidrópico
  * Hematimetria: Anemia vs. Policitemia

## 3. Classificação de Quintero (Estádios I a V) & Achados de Doppler Fetal
- Tabela detalhada do Estadiamento de Quintero:
  * Colunas: Estádio de Quintero | Critérios Diagnósticos Exatos | Achados de Doppler Fetal | Significado Prognóstico | Conduta Terapêutica
  * **Estádio I:** Oligoâmnio (MBV < 2 cm) + Polidrâmnio (MBV > 8/10 cm); Bexiga do doador ainda visível; Doppler fetal normal.
  * **Estádio II:** Critérios de oligo/poli presentes; **Bexiga do doador NÃO visualizada** durante todo o exame USG (anúria fetal reflexa); Doppler ainda normal.
  * **Estádio III:** Presença de **Doppler criticamente alterado** em qualquer um dos fetos:
    - Artéria umbilical com diástole zero ou reversa (geralmente doador).
    - Ducto venoso com onda A reversa durante a contração atrial (sobrecarga do receptor).
    - Veia umbilical com pulsação contínua (insuficiência cardíaca direita do receptor).
  * **Estádio IV:** **Hidropisia Fetal** (presença de ascite, derrame pericárdico, derrame pleural ou edema subcutâneo, habitualmente no feto receptor por falência miocárdica).
  * **Estádio V:** **Óbito intrauterino** de um ou ambos os conceptos.

## 4. Tratamento Padrão-Ouro: Ablação a Laser por Fetoscopia (Técnica de Solomon)
- Procedimento de escolha de 1ª linha: Fotocoagulação a Laser das anastomoses vasculares da placa coriônica guiada por fetoscopia.
- Técnica de Solomon: coagulação completa em linha contínua de todo o equador vascular placentário, separando funcionalmente a placenta em dois territórios independentes (dichorionization) para evitar recorrência ou TAPS pós-laser.
- Janela Terapêutica Ideal: entre **16 e 26 semanas de gestação** (Quintero Estádios II a IV, e Estádio I se progressivo ou sintomático).
- Taxas de sucesso: sobrevida de pelo menos um feto em > 80-85% dos casos e sobrevida de ambos em ~60-70%, com redução dramática de sequelas neurológicas.

## 5. Procedimentos Alternativos e Manejo Paliativo (Amniodrenagem Seriada)
- Quando o laser não está disponível ou em idade gestacional avançada (> 26 semanas):
  * **Amniodrenagem descompressiva de alívio:** drenagem lenta de 1 a 3 litros do saco do receptor para reduzir risco de abortamento ou parto prematuro extremo. Procedimento paliativo, não trata a causa vascular.
  * Septostomia: punção deliberada da membrana intergemelar (atualmente proscrita devido a complicações graves de entrelaçamento de cordão).

## 6. Algoritmo Decisório no Diagnóstico e Manejo da STFF
- Deve conter obrigatoriamente o subtítulo:
### Passo a Passo Sintético da Cascata Decisória
- 5 passos numerados objetivos. Cada passo DEVE abrir com a regra de ouro em negrito:
  * **[Ponto Principal]:** [Conduta mandatória ou regra de ouro]

## Diretrizes Oficiais & Consensos de Referência
- Liste as diretrizes: FEBRASGO, Eurofetus Consortium, ISUOG, ACOG e FIGO.
`,
    keyPoints: [
      'STFF é complicação exclusiva de gestações monocoriônicas diamnióticas por desbalanço de anastomoses arteriovenosas profundas.',
      'O diagnóstico exige obrigatoriamente oligoâmnio no doador (MBV < 2 cm) associado a polidrâmnio no receptor (MBV > 8 cm até 20 sem ou > 10 cm após).',
      'Discordância de peso ou de tamanho fetal NÃO é critério diagnóstico obrigatório de STFF.',
      'Quintero II = bexiga do doador invisível; Quintero III = Doppler alterado (diástole zero/reversa na AU ou onda A reversa no DV); Quintero IV = hidropisia; Quintero V = óbito.',
      'O tratamento padrão-ouro de 1ª linha entre 16 e 26 semanas é a fotocoagulação a laser das anastomoses vasculares por fetoscopia (Técnica de Solomon).',
      'A amniodrenagem seriada é um tratamento secundário/paliativo de alívio para quando o laser é indisponível ou após 26 semanas.',
      'Sem intervenção fetal, a mortalidade perinatal na STFF grave (Quintero II a IV) ultrapassa 90% dos casos.'
    ]
  },
  {
    id: 'mat-gem-04',
    focusId: 'obs-gem-parto',
    title: 'Assistência ao Parto e Momento da Interrupção na Gestação Múltipla',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Gestação Múltipla',
    focus: 'Parto em Gestação Múltipla',
    readTimeMinutes: 10,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / ACOG / NICE',
    summarySnippet: 'Cronograma rigoroso de idade gestacional por corionicidade, algoritmo de vias de parto por apresentações combinadas, critérios para parto vaginal, manejo ativo do 2º gemelar e profilaxia da hemorragia puerperal.',
    statsTag: 'gem-stats-parto',
    specificSectionsPrompt: `
ESTRUTURA DE SEÇÕES CLÍNICAS OBRIGATÓRIAS (Utilize exatamente estes cabeçalhos médicos):

---
## 1. O Que Mais Cai: Idade Gestacional de Interrupção por Corionicidade
- Parágrafo de cobrança baseado nas 36 questões de provas (ENARE, USP, PSU-MG, AMRIGS).
- Token estatístico:
\`\`\`gem-stats-parto
Recorrência Temática de Parto em Gestação Múltipla
\`\`\`
- Tabela Canônica do Momento Programado do Parto:
  * Colunas: Tipo de Placentação | Idade Gestacional Recomendada | Via de Parto Padrão | Justificativa Fisiopatológica / Evidência
  * **Dicoriônica Diamniótica (DCDA):** 37 semanas e 0 dias a 38 semanas e 6 dias (após 38s aumenta mortalidade perinatal sem benefício fetal).
  * **Monocoriônica Diamniótica (MCDA):** 36 semanas e 0 dias a 37 semanas e 0 dias (risco acumulado de óbito súbito por anastomoses placentárias supera riscos de prematuridade tardia).
  * **Monocoriônica Monoamniótica (MCMA):** 32 semanas e 0 dias a 34 semanas e 0 dias (resolução OBRIGATORIAMENTE por CESARIANA ELETIVA após corticoterapia pelo risco iminente de acidente de cordão por entrelaçamento).
  * **Gêmeos Unidos (Siameses):** 34 a 36 semanas por cesariana eletiva programada com incisão uterina ampla.

## 2. Seleção da Via de Parto Conforme Apresentação Combinada dos Fetos
- Tabela com a matriz das apresentações fetais combinadas:
  * Colunas: Apresentação Fetal Combinada | Frequência | Via de Parto Recomendada | Condições e Cuidados de Sala de Parto
  * **1º Cefálico / 2º Cefálico (~40% dos casos):** Via de escolha é o PARTO VAGINAL.
  * **1º Cefálico / 2º Não-Cefálico (Pélvico ou Córmico) (~35-40% dos casos):** Parto vaginal é PERMITIDO se equipe obstétrica habilitada, feto com peso estimado entre 1.500g e 4.000g e sem discordância de peso excessiva (> 20-25%). Após desprendimento do 1º feto, realiza-se versão podálica interna ou extração pélvica assistida do 2º se indicado.
  * **1º Não-Cefálico (Pélvico ou Córmico) / Qualquer apresentação do 2º (~20-25%):** INDICAÇÃO ABSOLUTA DE CESARIANA ELETIVA (alto risco de distócia grave ou engastamento de cabeças fetais em 1º pélvico e 2º cefálico).
  * **Gestação Monoamniótica:** CESARIANA ELETIVA MANDATÓRIA independente das apresentações.

## 3. Condições Clínicas e Critérios Mandatórios para o Parto Vaginal
- Critérios mandatórios da FEBRASGO / ACOG para autorizar o trabalho de parto vaginal:
  1. Primeiro feto em apresentação cefálica.
  2. Idade gestacional $\\ge 32$ semanas e peso estimado de ambos os fetos $> 1.500\\text{ g}$.
  3. Ausência de placenta prévia ou cesárea corporal anterior.
  4. Disponibilidade imediata de centro cirúrgico obstétrico, anestesista, neonatologista e sangue tipado.
  5. Monitorização contínua dos batimentos cardíacos fetais de ambos os fetos (cardiotocografia com duplo transdutor).
- Caixa de aviso:
  > [!WARNING] Armadilha Clássica de Prova: Gemelaridade NÃO é Sinônimo de Cesariana
  > As bancas costumam afirmar que "toda gravidez gemelar tem indicação de cesárea". Isso é FALSO. Com o 1º feto cefálico e conceito a termo em DCDA ou MCDA, a via vaginal é segura, recomendada e tem desfechos neonatais equivalentes à cesariana programada (Twin Birth Study).

## 4. Assistência Ativa ao Nascimento do Segundo Gemelar & Intervalo Seguro
- Protocolo da sala de parto imediatamente após a expulsão do 1º feto:
  1. **Clampeamento imediato do cordão umbilical do 1º concepto:** Evita exsanguinação fetal caso existam anastomoses vasculares não diagnosticadas.
  2. **Avaliação estática do 2º concepto:** Realizar palpação abdominal imediata e ultrassonografia de cabeceira em sala de parto para confirmar apresentação, atitude e frequência cardíaca fetal.
  3. **Manutenção ou indução da dinâmica uterina:** Se as contrações cessarem ou enfraquecerem após o nascimento do 1º, iniciar ou titular infusão intravenosa contínua de ocitocina.
  4. **Amniotomia guiada:** Realizar a rotura artificial da membrana do 2º feto somente após a apresentação estar encaixada/fixada na pelve, para prevenir prolapso de cordão.
  5. **Intervalo entre os nascimentos:** O nascimento do 2º feto deve ocorrer idealmente em até **30 minutos**. Contudo, não há limite de tempo rígido desde que a frequência cardíaca fetal permaneça estritamente normal.
  6. **Versão Podálica Interna:** Indicada quando o 2º feto está em situação transversa ou córmica após o nascimento do 1º.

## 5. Puerpério Imediato: Profilaxia Agressiva da Hemorragia Pós-Parto por Atonia
- A principal causa de morbimortalidade materna no parto gemelar é a **Hemorragia Pós-Parto (HPP)** por **Atonia Uterina** decorrente da sobredistensão acentuada da musculatura miometrial.
- Protocolo de profilaxia e preparo:
  * Manejo ativo do 3º período obrigatório: **Ocitocina 10 UI IM** imediatamente após desprendimento do último feto (ou infusão IV lenta).
  * Vigilância rigorosa do tônus uterino na primeira hora (4º período do parto / Greenberg).
  * Acesso venoso calibroso prévio (14G ou 16G) e reserva de concentrado de hemácias garantida.

## 6. Algoritmo Decisório no Parto da Gestação Múltipla
- Deve conter obrigatoriamente o subtítulo:
### Passo a Passo Sintético da Cascata Decisória
- 5 passos numerados objetivos. Cada passo DEVE abrir com a regra de ouro em negrito:
  * **[Ponto Principal]:** [Conduta mandatória ou regra de ouro]

## Diretrizes Oficiais & Consensos de Referência
- Liste as diretrizes: FEBRASGO, ACOG, NICE, FIGO e Ministério da Saúde.
`,
    keyPoints: [
      'Idade gestacional programada: DCDA = 37-38s; MCDA = 36-37s; MCMA = 32-34s (cesariana obrigatória pós-corticoide).',
      'Se o 1º gemelar for não-cefálico (pélvico ou córmico), a indicação de cesariana é absoluta pelo risco de engastamento.',
      'Com 1º feto cefálico e 2º cefálico, a via de escolha é o parto vaginal.',
      'Com 1º cefálico e 2º não-cefálico, o parto vaginal é permitido em concepto > 1.500g e equipe habilitada em versão podálica.',
      'O clampeamento do cordão do 1º concepto deve ser imediato para evitar exsanguinação caso existam anastomoses placentárias.',
      'O intervalo entre os conceptos pode ser de até 30 minutos desde que a monitorização fetal contínua permaneça estritamente normal.',
      'A principal complicação puerperal é a hemorragia por atonia uterina pela sobredistensão, exigindo profilaxia universal com ocitocina.'
    ]
  }
];

async function generateSingleSummary(topic) {
  console.log(`\n================================================================`);
  console.log(`🩺 GERANDO RESUMO APROFUNDADO: ${topic.title}`);
  console.log(`================================================================`);

  const systemInstruction = `Você é um Médico Obstetra Preceptor Sênior Especialista em Provas de Residência Médica (FEBRASGO/ACOG/R3).
Sua missão é redigir o RESUMO CLÍNICO CANÔNICO DE ALTO RENDIMENTO para o foco "${topic.focus}" (Tema: "${topic.theme}").
Você deve obedecer rigorosamente às novas diretrizes do med-study-design-system v2.7.0 e do Plano Motor de Resumos:
1. NÃO use títulos H1 no corpo do texto (o leitor já renderiza o título oficial). Comece direto com "---" e o primeiro H2.
2. TÍTULOS H2 CLÍNICOS E SEMÂNTICOS OBRIGATÓRIOS: Utilize exatamente os títulos médicos prescritos no prompt, sem inventar cabeçalhos abstratos como "Matriz 2x2" ou "Algoritmo Decisório".
3. EXTENSÃO PROFUNDA E DENSIDADE MÉDICA: Desenvolva o texto com riqueza de detalhes, sem atalhos telegráficos. O resumo deve ser uma referência médica completa com tabelas minuciosas, critérios, doses, condutas e pegadinhas de bancas examinadoras.
4. ZERO MERMAID ESCURO E ZERO SVGS ARTIFICIAIS.
5. Responda exclusivamente com o markdown estruturado cirúrgico, sem introduções ou saudações.`;

  const prompt = `
Redija o RESUMO CLÍNICO CANÔNICO PADRÃO-OURO DE ALTO RENDIMENTO para o foco "${topic.focus}" em Obstetrícia.

${topic.specificSectionsPrompt}
`;

  const markdownContent = await callGoogleAiStudio(prompt, systemInstruction);

  let cleanMarkdown = markdownContent.trim();
  if (cleanMarkdown.startsWith('# ')) {
    const lines = cleanMarkdown.split('\n');
    lines.shift();
    cleanMarkdown = lines.join('\n').trim();
  }

  return cleanMarkdown;
}

async function main() {
  console.log('================================================================');
  console.log('🩺 INICIANDO GERAÇÃO DOS 4 RESUMOS DE GESTAÇÃO MÚLTIPLA');
  console.log('🤖 Motor: Google AI Studio com as 2 Chaves Fornecidas');
  console.log('📐 Arquitetura: Linhas Livres, Tópicos Clínicos Semânticos e Tabelas Ricas');
  console.log('================================================================');

  const generatedMaterials = [];

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    try {
      const markdown = await generateSingleSummary(topic);

      const docPath = path.join(process.cwd(), 'docs', `resumo_gemelaridade_${String(i + 1).padStart(2, '0')}.md`);
      fs.writeFileSync(docPath, markdown, 'utf8');
      console.log(`  💾 Arquivo gravado em: ${docPath} (${markdown.split('\n').length} linhas)`);

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

      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`❌ Falha fatal ao gerar resumo ${topic.id}:`, err);
      process.exit(1);
    }
  }

  const bundlePath = path.join(process.cwd(), 'data', 'gemelaridade_study_materials.json');
  fs.writeFileSync(bundlePath, JSON.stringify(generatedMaterials, null, 2), 'utf8');
  console.log(`\n🎉 4 RESUMOS PROFUNDOS GERADOS COM SUCESSO EM: ${bundlePath}`);
}

main();

