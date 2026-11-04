## 1. O Que Mais Cai nas Provas de Residência Médica

As complicações da gemelaridade monocoriônica (MC) representam o ápice da complexidade em Medicina Fetal e Obstetrícia de Alto Risco. Nas bancas de concurso (ENARE, USP-SP, UNICAMP, PSU-MG, AMRIGS, SUS-SP), **o foco das questões recai sobre a anatomia funcional das anastomoses vasculares placentárias**. Praticamente 100% das placentas monocoriônicas possuem comunicações vasculares na placa coriônica, mas o fenótipo clínico e o desfecho dependem estritamente do tipo, calibre e equilíbrio hemodinâmico entre elas.

O censo estatístico de questões revela que as bancas cobram o reconhecimento imediato do mecanismo fisiopatológico subjacente para diferenciar entidades com prognósticos e condutas totalmente distintos: a Síndrome de Transfusão Feto-Fetal (STFF), a Sequência de Perfusão Arterial Reversa (TRAP), a Sequência Anemia-Policitemia (TAPS), a Restrição de Crescimento Fetal Seletiva (RCFs classificada por Gratacós) e a conduta conservadora obrigatória diante da morte intrauterina de um co-gemelar.

```gem-stats-complicacoes
{
  "focusSlug": "gemelaridade-complicacoes-monocorionicas",
  "specialty": "Ginecologia e Obstetrícia",
  "theme": "Gestação Múltipla",
  "focus": "Complicações da Gemelaridade",
  "totalQuestions": 72,
  "timeframeRange": "2017-2026",
  "version": 1,
  "donutSlices": [
    {
      "id": 1,
      "name": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
      "shortName": "STFF na Gemelaridade",
      "percentage": 30.6,
      "questionCount": 22,
      "priority": "Crítica",
      "color": "#3B82F6",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "Desbalanço hemodinâmico por anastomoses arteriovenosas profundas; sequência oligo-poli.",
      "focusExplanation": "A **STFF** decorre de shunts arteriovenosos (AV) profundos desbalanceados, sem anastomoses de compensação suficientes. Manifesta-se pela clássica sequência de **oligoâmnio acentuado no doador** (Maior Bolsão Vertical < 2 cm) e **polidrâmnio no receptor** (MBV > 8 cm até 20 sem ou > 10 cm após). O tratamento padrão-ouro de primeira linha entre 16 e 26 semanas é a **fotocoagulação a laser fetoscópica (Técnica de Solomon)**.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Critério diagnóstico firmado exclusivamente pela discrepância do volume de líquido amniótico (sequência oligo-poli) e indicação de ablação a laser como cirurgia fetal curativa.",
          "trapAlert": "Exigir discordância de peso fetal como critério obrigatório para diagnóstico de STFF (pertence à RCFs)."
        },
        "ENARE": {
          "howItCharges": "Casos clínicos de emergência obstétrica: gestante no 2º trimestre com queixa de aumento rápido do volume uterino e dor, com USG revelando polidrâmnio tenso em um feto e feto colado à parede uterina (stuck twin) no outro.",
          "trapAlert": "Indicar amniocentese diagnóstica seriada como conduta definitiva em vez de referenciar para cirurgia fetal a laser."
        },
        "USP": {
          "howItCharges": "Fisiopatologia fina: papel do sistema renina-angiotensina-aldosterona (SRAA) ativado no feto doador e sobrecarga volêmica com aumento de peptídeo natriurético atrial (PNA) no feto receptor gerando hipertrofia de ventrículo direito.",
          "trapAlert": "Atribuir a insuficiência cardíaca do receptor à anemia (o receptor é pletórico/policitêmico)."
        },
        "UNICAMP": {
          "howItCharges": "Diagnóstico diferencial entre STFF e TAPS: no TAPS o líquido é normal e concordante; na STFF há discrepância marcante de bolsões amnióticos.",
          "trapAlert": "Confundir TAPS pós-laser com recidiva da STFF."
        },
        "PSU-MG": {
          "howItCharges": "Reconhecimento dos estádios de Quintero e momento cirúrgico ideal entre 16 e 26 semanas de idade gestacional.",
          "trapAlert": "Indicar cirurgia a laser antes de 16 semanas ou em concepto viável acima de 28 semanas com feto hidrópico."
        },
        "AMRIGS": {
          "howItCharges": "Identificação direta: qual a complicação vascular mais frequente em gestações monocoriônicas diamnióticas (ocorre em 10 a 15%).",
          "trapAlert": "Assinalar TRAP como mais frequente que STFF (TRAP é complicação rara, ~1% dos monocoriônicos)."
        },
        "SUS-SP": {
          "howItCharges": "Regulação e transporte de gestantes com diagnóstico de STFF para centros quaternários de cirurgia fetal no SUS.",
          "trapAlert": "Atrasar o encaminhamento terciário aguardando maturidade pulmonar para interrupção da gestação."
        }
      }
    },
    {
      "id": 2,
      "name": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
      "shortName": "TRAP / Feto Acárdico",
      "percentage": 29.2,
      "questionCount": 21,
      "priority": "Alta",
      "color": "#10B981",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "Anastomose AA calibrosa; feto bomba perfunde concepto acárdico retrógradamente; oclusão vascular.",
      "focusExplanation": "A **Sequência TRAP** é uma complicação rara e exclusiva de gestações monocoriônicas. Decorre da presença de uma **grande anastomose artério-arterial (AA)** associada a uma venovenosa (VV). O feto morfologicamente normal (**feto bomba**) bombeia sangue desoxigenado de forma retrógrada diretamente pela artéria umbilical do concepto malformado (**feto acárdico/acéfalo**). O feto bomba sofre sobrecarga cardíaca severa de alto débito, evoluindo para cardiomegalia, polidrâmnio, hidropisia e óbito fetal em até 50-70% dos casos sem tratamento. A conduta padrão-ouro é a **interrupção precoce do fluxo vascular do feto acárdico** via ablação por radiofrequência (RFA) ou coagulação a laser do cordão.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Identificação da ecografia de primeiro/segundo trimestre com fluxo reverso pela artéria umbilical em feto sem estrutura cardíaca definida e risco de falência cardíaca no feto bomba.",
          "trapAlert": "Acreditar que o feto acárdico é viável ou que a conduta é expectante até o termo."
        },
        "ENARE": {
          "howItCharges": "Apresentação clínica de gemelaridade com feto sem cabeça e sem tórax desenvolvido, perguntando o mecanismo hemodinâmico e o nome da síndrome (TRAP / Gemelar Acárdico).",
          "trapAlert": "Confundir com feto papiráceo ou aborto retido de gestação dicoriônica."
        },
        "USP": {
          "howItCharges": "Avaliação prognóstica e conduta: a relação de peso fetal estimada entre feto acárdico e bomba (> 50-70%) prediz falência cardíaca iminente no feto bomba, exigindo intervenção fetal por ablação por radiofrequência.",
          "trapAlert": "Esperar o feto bomba desenvolver hidropisia manifesta para indicar a cirurgia fetal."
        },
        "UNICAMP": {
          "howItCharges": "Mapeamento vascular Doppler: confirmação de sangue entrando pela artéria umbilical e saindo pela veia umbilical do concepto acárdico (inversão completa do fluxo fisiológico fetal).",
          "trapAlert": "Afirmar que a perfusão reversa ocorre por artérias uterinas maternas anômalas."
        },
        "PSU-MG": {
          "howItCharges": "Tratamento cirúrgico de escolha: termo técnico da técnica minimamente invasiva (oclusão vascular do cordão por radiofrequência ou laser).",
          "trapAlert": "Sugerir ligadura cirúrgica do cordão por laparotomia e histerotomia aberta."
        },
        "AMRIGS": {
          "howItCharges": "Definição do feto bomba como a estrutura anatômica sã que sustenta o parasita acárdico à custa de cardiomegalia.",
          "trapAlert": "Chamar o feto malformado de feto bomba."
        },
        "SUS-SP": {
          "howItCharges": "Conduta diante de feto acárdico volumoso no 2º trimestre em centro de referência: encaminhamento para procedimento intervencionista de oclusão de cordão.",
          "trapAlert": "Prescrever digitálicos para a mãe como terapia primária do TRAP."
        }
      }
    },
    {
      "id": 3,
      "name": "Complicações Gerais, Sobredistensão e Prematuridade",
      "shortName": "Complicações Gerais",
      "percentage": 22.2,
      "questionCount": 16,
      "priority": "Alta",
      "color": "#EC4899",
      "trend": "estavel",
      "trendLabel": "🏛️ Clássico Estável",
      "takeaway": "Parto prematuro (< 37s em > 50%), rotura prematura de membranas e atonia uterina por sobredistensão.",
      "focusExplanation": "Gestações múltiplas impõem **sobredistensão mecânica severa das fibras miometrias**, desencadeando contratilidade prematura e encurtamento cervical acelerado. Mais de **50% dos gemelares nascem prematuros** (< 37 semanas) e cerca de 10-15% antes de 32 semanas. O rastreio preditor de prematuridade padrão-ouro é a **medida transvaginal seriada do comprimento do colo uterino entre 18 e 24 semanas**. Repouso no leito e tocolíticos profiláticos prolongados são formalmente proscritos por falta de benefício e aumento do risco trombótico.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Prematuridade espontânea como complicação obstétrica mais prevalente e a ineficácia do repouso absoluto profilático.",
          "trapAlert": "Indicar internação prolongada e repouso em decúbito lateral para todas as gestantes gemelares sem queixas."
        },
        "ENARE": {
          "howItCharges": "Medida do comprimento do colo uterino por USG transvaginal no 2º trimestre: valor de colo curto (< 25 mm) e indicação de Progesterona natural micronizada 200 mg/dia via vaginal.",
          "trapAlert": "Indicar cerclagem cervical de urgência em gestação gemelar assintomática apenas pelo colo curto sem histórico de incompetência cervical."
        },
        "USP": {
          "howItCharges": "Fisiopatologia da sobredistensão uterina: aumento da tensão parietal (Lei de Laplace) levando à expressão precoce de receptores de ocitocina e conexina-43 no miométrio.",
          "trapAlert": "Atribuir o trabalho de parto prematuro exclusivamente a infecções bacterianas ascendentes."
        },
        "UNICAMP": {
          "howItCharges": "Risco puerperal associado: o excesso de estiramento miometrial é a principal causa de atonia uterina e hemorragia pós-parto imediata no 4º período do parto.",
          "trapAlert": "Não realizar manejo ativo do 3º período com ocitocina profilática imediata após o parto."
        },
        "PSU-MG": {
          "howItCharges": "Conduta farmacológica na ameaça de trabalho de parto prematuro gemelar antes de 34 semanas: corticoterapia para maturação pulmonar (Betametasona 12 mg IM 2 doses) e neuroproteção com Sulfato de Magnésio se < 32 semanas.",
          "trapAlert": "Prescrever múltiplos ciclos semanais repetidos de corticoterapia pulmonar."
        },
        "AMRIGS": {
          "howItCharges": "Epidemiologia da prematuridade tardia (34-36 semanas) e morbidades respiratórias neonatais associadas (taquipneia transitória e desconforto respiratório).",
          "trapAlert": "Achar que concepto com 35 semanas gemelar tem risco zero de complicações respiratórias."
        },
        "SUS-SP": {
          "howItCharges": "Protocolo de corticoterapia fetal e transporte materno seguro para maternidade com UTI neonatal disponível.",
          "trapAlert": "Realizar o parto em unidade básica ou hospital de pequeno porte sem suporte de neonatologia intensiva."
        }
      }
    },
    {
      "id": 4,
      "name": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
      "shortName": "CIUR & TAPS",
      "percentage": 11.1,
      "questionCount": 8,
      "priority": "Média",
      "color": "#F59E0B",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "RCFs (Gratacós I, II, III por Doppler de AU); TAPS (líquido normal, PVS-ACM > 1,5 vs < 1,0 MoM).",
      "focusExplanation": "A **RCFs** é definida pelo peso fetal estimado de um dos conceptos abaixo do percentil 10 e/ou discordância ponderal $\\ge 20\\%$. Classifica-se por **Gratacós** conforme o Doppler da Artéria Umbilical: **Tipo I** (diástole positiva contínua, bom prognóstico); **Tipo II** (diástole zero ou reversa persistente, mau prognóstico com insuficiência placentária severa); e **Tipo III** (fluxo diastólico cíclico/intermitente devido a grandes anastomoses AA, com risco de morte fetal súbita sem aviso prévio). Já o **TAPS** cursa com líquido amniótico normal e concordante, sendo diagnosticado pela discrepância do Pico de Velocidade Sistólica da Artéria Cerebral Média (PVS-ACM > 1,5 MoM no doador anêmico e < 1,0 MoM no receptor policitêmico).",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Diferenciação precisa entre os Tipos I, II e III de Gratacós na RCFs e reconhecimento do TAPS por Doppler de ACM com líquido amniótico normal.",
          "trapAlert": "Considerar que o TAPS apresenta a sequência oligo-polidrâmnio característica da STFF."
        },
        "ENARE": {
          "howItCharges": "Interpretação do Doppler de Artéria Umbilical de um dos fetos monocoriônicos demonstrando fluxo diastólico intermitente (Gratacós Tipo III).",
          "trapAlert": "Classificar fluxo intermitente como Gratacós Tipo II."
        },
        "USP": {
          "howItCharges": "Manejo da RCFs Tipo II em concepto viável pré-termo (30-32 semanas): corticoterapia para maturação pulmonar, sulfato de magnésio para neuroproteção e interrupção por cesariana.",
          "trapAlert": "Aguardar termo completo (37 semanas) em feto com diástole reversa persistente da artéria umbilical."
        },
        "UNICAMP": {
          "howItCharges": "Sequência TAPS: fisiopatologia de microanastomoses arteriovenosas (< 1 mm) periféricas na borda placentária.",
          "trapAlert": "Afirmar que o TAPS decorre de anastomoses venovenosas superficiais de alto calibre."
        },
        "PSU-MG": {
          "howItCharges": "Fórmula e critério de discordância de peso fetal: diferença ponderal dividida pelo peso do maior feto expressa em porcentagem.",
          "trapAlert": "Calcular a discordância dividindo pelo peso do menor feto."
        },
        "AMRIGS": {
          "howItCharges": "Prognóstico comparativo dos tipos de Gratacós: o Tipo I tem sobrevida > 90% com conduta conservadora.",
          "trapAlert": "Indicar interrupção imediata ou laser para todos os casos de Gratacós Tipo I."
        },
        "SUS-SP": {
          "howItCharges": "Vigilância ecográfica semanal com Doppler da artéria umbilical, ducto venoso e ACM em fetos monocoriônicos com suspeita de RCFs.",
          "trapAlert": "Espaçar consultas para cada 3 a 4 semanas na presença de restrição de crescimento com Doppler alterado."
        }
      }
    },
    {
      "id": 5,
      "name": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
      "shortName": "Óbito de um Gemelar",
      "percentage": 6.9,
      "questionCount": 5,
      "priority": "Média",
      "color": "#8B5CF6",
      "trend": "estavel",
      "trendLabel": "🏛️ Clássico Estável",
      "takeaway": "Exsanguinação reflexa aguda para placenta do feto morto; risco de leucomalácia periventricular; NÃO operar de imediato.",
      "focusExplanation": "A morte súbita de um concepto monocoriônico gera **exsanguinação reflexa aguda do concepto sobrevivente em direção ao leito vascular de baixa resistência da placenta do feto falecido**. Isso acarreta choque hipovolêmico súbito, hipotensão grave e hipoperfusão cerebral no sobrevivo, provocando **lesões neurológicas isquêmicas definitivas (Leucomalácia Periventricular, encefalomalácia multiquística e paralisia cerebral)** em 20 a 30% dos casos. A lesão isquêmica ocorre no instante do óbito; portanto, **a cesariana de emergência imediata não reverte a lesão já instalada e adiciona o risco severo de prematuridade iatrogênica**. A conduta correta é: estabilização materna, pesquisa de anemia fetal aguda no sobrevivo pelo PVS-ACM e Ressonância Magnética cerebral após 2 a 3 semanas.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Conduta obstétrica diante da constatação de óbito de um gêmeo monocoriônico no 2º ou início do 3º trimestre: NÃO indicar cesariana de emergência imediata.",
          "trapAlert": "Assinalar cesariana de urgência imediata para 'salvar' o feto vivo."
        },
        "ENARE": {
          "howItCharges": "Caso clínico com óbito intrauterino de um gemelar monocoriônico de 26 semanas. Pergunta a conduta imediata para o feto vivo.",
          "trapAlert": "Indicar parto cesáreo com 26 semanas sem investigação prévia de anemia fetal."
        },
        "USP": {
          "howItCharges": "Fisiopatologia da leucomalácia periventricular: necrose isquêmica da substância branca periventricular decorrente da hipotensão aguda de descompressão transfusional.",
          "trapAlert": "Atribuir a lesão cerebral à passagem de substâncias tromboplásticas do feto morto (teoria antiga revogada)."
        },
        "UNICAMP": {
          "howItCharges": "Exame de imagem padrão-ouro e tempo ideal para rastreio de sequelas cerebrais no sobrevivo: Ressonância Magnética após 2 a 3 semanas do óbito.",
          "trapAlert": "Solicitar tomografia de crânio fetal ou USG imediatamente após o evento para descartar lesão."
        },
        "PSU-MG": {
          "howItCharges": "Avaliação de anemia fetal aguda no sobrevivente: PVS-ACM > 1,5 MoM autoriza transfusão intrauterina de resgate para estabilização hemodinâmica.",
          "trapAlert": "Prescrever ferro endovenoso para a mãe esperando correção da anemia fetal aguda."
        },
        "AMRIGS": {
          "howItCharges": "Risco de coagulopatia materna de consumo (CID) pelo feto retido: complicação extremamente rara em gemelares, exigindo apenas monitorização de fibrinogênio sérico.",
          "trapAlert": "Indicar interrupção imediata por medo de coagulopatia intravascular disseminada materna grave nas primeiras 48h."
        },
        "SUS-SP": {
          "howItCharges": "Apoio psicológico, monitorização clínica ambulatorial semanal do bem-estar fetal e planejamento de parto próximo a 34-36 semanas se estável.",
          "trapAlert": "Manter internação hospitalar contínua sem plano de vigilância ambulatorial especializada."
        }
      }
    }
  ],
  "bancaBreakdown": {
    "ENARE": {
      "banca": "ENARE",
      "totalQuestions": 16,
      "topSubfocos": [
        {
          "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
          "questionCount": 5,
          "percentageInBanca": 31.3
        },
        {
          "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
          "questionCount": 5,
          "percentageInBanca": 31.3
        },
        {
          "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
          "questionCount": 3,
          "percentageInBanca": 18.8
        },
        {
          "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
          "questionCount": 2,
          "percentageInBanca": 12.5
        },
        {
          "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
          "questionCount": 1,
          "percentageInBanca": 6.1
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "USP": {
      "banca": "USP",
      "totalQuestions": 18,
      "topSubfocos": [
        {
          "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
          "questionCount": 6,
          "percentageInBanca": 33.3
        },
        {
          "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
          "questionCount": 5,
          "percentageInBanca": 27.8
        },
        {
          "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
          "questionCount": 4,
          "percentageInBanca": 22.2
        },
        {
          "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
          "questionCount": 2,
          "percentageInBanca": 11.1
        },
        {
          "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
          "questionCount": 1,
          "percentageInBanca": 5.6
        }
      ],
      "predominantDifficulty": "Difícil"
    },
    "UNICAMP": {
      "banca": "UNICAMP",
      "totalQuestions": 13,
      "topSubfocos": [
        {
          "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
          "questionCount": 4,
          "percentageInBanca": 30.8
        },
        {
          "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
          "questionCount": 4,
          "percentageInBanca": 30.8
        },
        {
          "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
          "questionCount": 3,
          "percentageInBanca": 23.1
        },
        {
          "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
          "questionCount": 1,
          "percentageInBanca": 7.7
        },
        {
          "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
          "questionCount": 1,
          "percentageInBanca": 7.6
        }
      ],
      "predominantDifficulty": "Difícil"
    },
    "PSU-MG": {
      "banca": "PSU-MG",
      "totalQuestions": 10,
      "topSubfocos": [
        {
          "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
          "questionCount": 3,
          "percentageInBanca": 30.0
        },
        {
          "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
          "questionCount": 3,
          "percentageInBanca": 30.0
        },
        {
          "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
          "questionCount": 2,
          "percentageInBanca": 20.0
        },
        {
          "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
          "questionCount": 1,
          "percentageInBanca": 10.0
        },
        {
          "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
          "questionCount": 1,
          "percentageInBanca": 10.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "AMRIGS": {
      "banca": "AMRIGS",
      "totalQuestions": 7,
      "topSubfocos": [
        {
          "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
          "questionCount": 2,
          "percentageInBanca": 28.6
        },
        {
          "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
          "questionCount": 2,
          "percentageInBanca": 28.6
        },
        {
          "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
          "questionCount": 2,
          "percentageInBanca": 28.6
        },
        {
          "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
          "questionCount": 1,
          "percentageInBanca": 14.2
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "SUS-SP": {
      "banca": "SUS-SP",
      "totalQuestions": 8,
      "topSubfocos": [
        {
          "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
          "questionCount": 2,
          "percentageInBanca": 25.0
        },
        {
          "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
          "questionCount": 2,
          "percentageInBanca": 25.0
        },
        {
          "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
          "questionCount": 2,
          "percentageInBanca": 25.0
        },
        {
          "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
          "questionCount": 1,
          "percentageInBanca": 12.5
        },
        {
          "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
          "questionCount": 1,
          "percentageInBanca": 12.5
        }
      ],
      "predominantDifficulty": "Médio"
    }
  },
  "topTraps": [
    {
      "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
      "trapTitle": "Distrator de Cesariana de Emergência Imediata",
      "trapDescription": "No óbito de co-gemelar monocoriônico, a cesariana imediata não reverte o dano isquêmico já ocorrido e causa prematuridade iatrogênica; conduta é conservadora com Doppler de ACM e RNM após 2-3 semanas."
    },
    {
      "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
      "trapTitle": "Distrator de Líquido Amniótico no TAPS",
      "trapDescription": "No TAPS o volume de líquido amniótico é estritamente normal e concordante; se houver oligo-polidrâmnio o diagnóstico é STFF."
    }
  ],
  "auditHash": "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
  "needsRecalc": false,
  "certifiedAt": "2026-11-04T00:00:00.000Z",
  "lastRecalculatedAt": "2026-11-04T00:00:00.000Z",
  "status": "certified"
}
```

---

## 2. Arquitetura Vascular Placentária: Anastomoses Superficiais vs. Profundas

A placenta monocoriônica contém uma rica malha vascular na superfície coriônica. O balanço hemodinâmico entre os conceptos é governado pelo tipo predominante de anastomose:

1.  **Anastomoses Superficiais (Artério-Arteriais - AA e Veno-Venosas - VV):**
    *   São conexões diretas visíveis macroscopicamente na superfície da placa coriônica.
    *   Apresentam **fluxo bidirecional, de baixa resistência e alta velocidade**.
    *   **Papel Fisiológico Protetor:** As anastomoses AA funcionam como **válvulas de alívio e segurança**, equalizando instantaneamente picos pressóricos entre os dois territórios e protegendo contra shunts crônicos graves.
2.  **Anastomoses Profundas (Artério-Venosas - AV):**
    *   Localizam-se no leito capilar cotiledonar profundo, onde uma artéria de um concepto penetra no cotilédone e a veia de drenagem desse mesmo cotilédone retorna para o outro concepto.
    *   Apresentam **fluxo estritamente unidirecional**.
    *   **Gatilho Fisiopatológico de Doença:** Quando há desbalanço na proporção de anastomoses AV sem anastomoses AA compensatórias suficientes, instala-se a transferência volumétrica crônica que desencadeia a **STFF** e a **Sequência TAPS**.

$$
\text{Arquitetura Vascular} \implies \begin{cases} \text{Anastomoses Superficiais (AA e VV)} \implies \text{Bidirecionais, placa corial nua, protetoras contra STFF} \\ \text{Anastomoses Profundas (AV)} \implies \text{Unidirecionais, leito capilar cotiledonar, motor da STFF e TAPS} \end{cases}
$$

---

## 3. Sequência TRAP (Perfusão Arterial Reversa): Feto Bomba vs. Feto Acárdico

A Sequência de Perfusão Arterial Reversa em Gemelares (**TRAP - Twin Reversed Arterial Perfusion**) ocorre em cerca de 1% das gestações monocoriônicas:

*   **Fisiopatologia Vascular:** Conexão vascular direta anômala através de uma **grande anastomose artério-arterial (AA)** associada a uma veno-venosa (VV). A pressão sistólica do feto normal supera a do concepto malformado, invertendo completamente o sentido da circulação.
*   **Feto Acárdico (Receptor Malformado):** Não possui coração funcional e frequentemente carece de estruturas cefálicas e membros superiores (acéfalo-acárdico). Recebe sangue **desoxigenado e desnutrido** que já perfundiu o feto bomba, desenvolvendo apenas as porções inferiores do corpo cobertas por edema gelatinoso volumoso e higroma cístico.
*   **Feto Bomba (Doador Morfologicamente Normal):** Assume o débito cardíaco de ambos os corpos. Evolui com hipertrofia cardíaca, insuficiência cardíaca congestiva de alto débito, regurgitação tricúspide, polidrâmnio e hidropisia fetal.
*   **Conduta Padrão-Ouro:** Interrupção do fluxo vascular para o feto acárdico para preservar o feto bomba. O procedimento de escolha é a **ablação do cordão umbilical do feto acárdico por Radiofrequência (RFA) ou Laser guiado por ultrassom**, idealmente realizada entre **16 e 24 semanas de gestação**.

> [!WARNING] Armadilha Clássica de Prova: Não Aguardar Hidropisia no TRAP
> As bancas costumam apresentar um caso de feto acárdico no 2º trimestre e perguntar se a conduta é expectante até que o feto bomba mostre sinais de sofrimento cardíaco. **ISSO É FALSO.** Quando a massa do feto acárdico atinge $> 50\%$ do peso do feto bomba ou quando há piora progressiva do Doppler cardíaco, a intervenção cirúrgica de ablação vascular está formalmente indicada antes que a hidropisia irreversível se estabeleça.

---

## 4. Sequência TAPS (Twin Anemia-Polycythemia Sequence) & Diagnóstico pelo Doppler da ACM

O TAPS caracteriza-se por uma forma atípica e crônica de transfusão sanguínea feto-fetal:

*   **Fisiopatologia:** Decorre de **microanastomoses arteriovenosas minúsculas (< 1 mm de diâmetro)**, tipicamente situadas na borda da placenta. O fluxo é extremamente lento, permitindo apenas a passagem gradual de eritrócitos, **sem transferir grandes volumes plasmáticos** suficientes para desequilibrar a volemia e a função renal.
*   **Critério Diagnóstico de Prova (Sem Oligo-Polidrâmnio):**
    *   Diferença marcante dos níveis de hemoglobina entre os conceptos.
    *   **Volume de líquido amniótico estritamente NORMAL e CONCORDANTE em ambos os sacos** (ausência de sequência oligo-polidrâmnio).
    *   Diagnóstico firmado com base no **Doppler do Pico de Velocidade Sistólica da Artéria Cerebral Média (PVS-ACM)**:

$$
\text{Critério Doppler TAPS} \iff \begin{cases} \text{1. Volume de líquido amniótico NORMAL em ambos os sacos amnióticos} \\ \text{2. Feto Doador (Anêmico): PVS-ACM} > 1{,}5\text{ MoM (circulação hiperdinâmica)} \\ \text{3. Feto Receptor (Policitêmico): PVS-ACM} < 1{,}0\text{ MoM (sangue hiperviscoso)} \end{cases}
$$

> [!WARNING] Armadilha Clássica de Prova: TAPS vs. STFF de Quintero
> O distrator favorito dos examinadores é afirmar que no TAPS há oligoidrâmnio no doador. Lembre-se: **no TAPS o líquido amniótico é normal em ambos os fetos**. Havendo oligoâmnio (MBV < 2 cm) no doador e polidrâmnio (MBV > 8/10 cm) no receptor, o diagnóstico é **Síndrome de Transfusão Feto-Fetal (STFF)**, e não TAPS!

---

## 5. Restrição de Crescimento Fetal Seletiva (RCFs) & Classificação de Gratacós

A RCFs afeta 10 a 15% das gestações monocoriônicas, originando-se primariamente da partilha desigual do território placentário entre os conceptos. É diagnosticada quando um dos fetos apresenta Peso Fetal Estimado (PFE) $< \text{percentil 10}$ associado ou não a uma discordância ponderal $\ge 20\%$:

$$
\text{Discordância Ponderal (\%)} = \frac{\text{Peso Fetal do Maior} - \text{Peso Fetal do Menor}}{\text{Peso Fetal do Maior}} \times 100 \ge 20\%
$$

### Classificação Canônica de Gratacós (Baseada no Doppler da Artéria Umbilical do Feto Restrito):

| Tipo Gratacós | Padrão da Artéria Umbilical (Feto RCF) | Fisiopatologia Vascular Subjacente | Prognóstico Perinatal | Conduta Clínica Homologada |
| :--- | :--- | :--- | :--- | :--- |
| **Tipo I** | **Diástole Positiva e Contínua** (Doppler normal) | Insuficiência placentária leve; partilha desigual moderada | **Favorável** (sobrevida > 90%) | Conduta expectante com vigilância semanal; parto planejado com **34 a 36 semanas**. |
| **Tipo II** | **Diástole Zero ou Reversa Persistente** | Hipoplasia placentária grave; ausência de grandes shunts AA | **Reservado** (alto risco de óbito intrauterino) | Vigilância intensiva (Doppler de ducto venoso); corticoterapia e parto com **30 a 32 semanas**. |
| **Tipo III** | **Diástole Intermitente / Cíclica** (alterna positivo e reverso) | Grandes anastomoses artério-arteriais (AA) bidirecionais | **Imprevisível** (morte súbita sem aviso prévio) | Vigilância frequente; planejamento de parto entre **32 e 34 semanas** em centro terciário. |

---

## 6. Morte Intrauterina de um Co-gemelar Monocoriônico: Conduta Imediata

Quando um feto monocoriônico morre in utero, o tônus vascular em sua placenta cai a zero instantaneamente:

1.  **Mecanismo de Exsanguinação Retrógrada Aguda:** O feto vivo sofre uma perda sanguínea massiva aguda em direção ao leito de baixa pressão da placenta do concepto falecido através das anastomoses interfetais. Isso desencadeia **choque hipovolêmico agudo grave, hipotensão sistêmica e hipoperfusão tecidual**.
2.  **Lesões no Sobrevivo (20 a 30% dos casos):** A hipóxia isquêmica cerebral atinge seletivamente a substância branca em desenvolvimento, resultando em **Leucomalácia Periventricular (LPV)**, encefalomalácia multiquística, porencefalia e paralisia cerebral definitiva.
3.  **Conduta Médica Padrão-Ouro:**
    *   **NÃO indicar cesariana de emergência imediata indiscriminada:** A lesão cerebral isquêmica ocorre nos primeiros minutos após a parada circulatória do co-gemelar. A interrupção cirúrgica imediata não reverte o dano já estabelecido e expõe o feto sobrevivente aos riscos da prematuridade extrema iatrogênica.
    *   **Avaliação do Doppler da ACM:** Mensurar o PVS-ACM do feto vivo para rastrear anemia fetal aguda grave. Em caso de PVS-ACM $> 1,5\text{ MoM}$, indicar **transfusão intrauterina de emergência** para restaurar a volemia.
    *   **Neuroimagem Estruturada:** Realizar **Ressonância Magnética (RNM) cerebral fetal após 2 a 3 semanas**, período necessário para que as áreas de necrose e cavitação isquêmica se tornem radiologicamente visíveis.

---

```clinical-scheme
{
  "type": "pipeline",
  "badge": "Diretriz FEBRASGO / ISUOG",
  "data": {
    "steps": [
      {
        "step": 1,
        "title": "Vigilância Ultrassonográfica Quinzenal (16s em diante)",
        "badge": "Rastreio Ativo",
        "desc": "Avaliação rotineira a cada 14 dias: medida do Maior Bolsão Vertical (MBV), visualização de bexigas fetais e Doppler da Artéria Cerebral Média (PVS-ACM) e Artéria Umbilical feto a feto.",
        "alert": "Permite detecção precoce de STFF ou TAPS antes do comprometimento hemodinâmico irreversível!"
      },
      {
        "step": 2,
        "title": "Diferenciação Sindrômica de Alta Precisão",
        "badge": "Diagnóstico Diferencial",
        "desc": "Se discrepância de líquido (oligo-poli) -> STFF de Quintero. Se líquido normal e PVS-ACM discrepante (> 1,5 vs < 1,0 MoM) -> TAPS. Se discordância de peso >= 20% com Doppler de AU alterado -> RCFs de Gratacós.",
        "alert": "Líquido amniótico concordante exclui STFF e orienta para TAPS ou Restrição de Crescimento!"
      },
      {
        "step": 3,
        "title": "Intervenção Cirúrgica Fetal Dirigida",
        "badge": "Conduta Padrão-Ouro",
        "desc": "Na STFF (Quintero >= II): fotocoagulação a laser pela Técnica de Solomon (16-26s). No TRAP: oclusão vascular do cordão umbilical do acárdico por radiofrequência ou laser.",
        "alert": "No óbito de um co-gemelar: não indicar cesárea imediata; avaliar PVS-ACM e programar RNM após 2-3 semanas!"
      }
    ]
  }
}
```

---

### 🔄 O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)

| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |
| :--- | :--- | :--- | :--- |
| **Óbito de um Co-gemelar Monocoriônico** | Indicar cesariana de emergência imediata na tentativa de 'salvar' o feto vivo | **Conduta conservadora:** estabilização, avaliação de anemia por PVS-ACM e **RNM fetal após 2 a 3 semanas** | **FEBRASGO / ISUOG (2023)** |
| **Momento de Intervenção no TRAP** | Aguardar hidropisia no feto bomba ou interrupção tardia | **Oclusão vascular precoce do cordão por Radiofrequência ou Laser** entre 16 e 24 semanas | **SMFM / ISUOG (2023)** |
| **Critério Diagnóstico do TAPS** | Classificar como STFF atípica ou exigir oligo-polidrâmnio | Entidade distinta com **líquido amniótico normal**, firmada pelo **Doppler de PVS-ACM** (> 1,5 vs < 1,0 MoM) | **Leiden Consensus / ISUOG (2022)** |
| **Manejo da RCFs Gratacós Tipo III** | Conduta expectante até o termo devido aos períodos de Doppler normal | Parto programado precoce com **32 a 34 semanas** devido ao risco de morte fetal súbita por grandes anastomoses AA | **Gratacós / ISUOG (2023)** |

> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:
> A conduta conservadora diante do óbito intrauterino de um gemelar monocoriônico com concepto vivo é uma das pegadinhas mais assinaladas em provas paulistas (USP, UNICAMP) e federais (ENARE). Não caia no erro de marcar cesariana imediata: o dano cerebral isquêmico ocorre no momento do óbito; antecipar o parto só gera sequelas neonatais de prematuridade extrema.

---

## 7. Algoritmo Decisório no Manejo das Complicações Monocoriônicas

### Passo a Passo Sintético da Cascata Decisória

1.  **[Triagem Ultrassonográfica]:** Em toda gestação monocoriônica, realizar ecografia obstétrica com dopplervelocimetria rigorosamente a cada **14 dias a partir de 16 semanas**.
2.  **[Avaliação de Líquido Amniótico]:** Avaliar o Maior Bolsão Vertical (MBV). Se houver discrepância oligo-poli (MBV $< 2\text{ cm}$ no doador e $> 8/10\text{ cm}$ no receptor), classificar como **STFF** e estadiar por Quintero.
3.  **[Doppler da ACM]:** Se o líquido amniótico estiver normal e concordante, avaliar o PVS-ACM de ambos os fetos. Se houver discrepância ($> 1,5\text{ MoM}$ em um e $< 1,0\text{ MoM}$ no outro), firmar diagnóstico de **Sequência TAPS**.
4.  **[Avaliação Ponderal e Artéria Umbilical]:** Se houver discordância ponderal $\ge 20\%$, classificar a **RCFs segundo Gratacós** avaliando se a diástole na artéria umbilical é positiva (Tipo I), ausente/reversa persistente (Tipo II) ou intermitente (Tipo III).
5.  **[Conduta Cirúrgica Especializada]:** Se confirmada STFF Quintero $\ge \text{II}$ ou TRAP com sobrecarga cardíaca do feto bomba entre 16 e 26 semanas, encaminhar com urgência para **cirurgia fetal em centro terciário**.

---

## Diretrizes Oficiais & Consensos de Referência

*   **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** Manual de Orientação em Medicina Fetal e Gestação Múltipla (2021/2023).
*   **ISUOG (International Society of Ultrasound in Obstetrics and Gynecology):** Practice Guidelines: role of ultrasound in twin pregnancy and management of monochorionic complications (2023).
*   **SMFM (Society for Maternal-Fetal Medicine):** Consult Series #60: Management of monochorionic twin pregnancy and specific complications (2022/2024).
*   **ACOG (American College of Obstetricians and Gynecologists):** Practice Bulletin No. 231 - Management of Multifetal Gestations (2021, revalidado 2024).
*   **FIGO (International Federation of Gynecology and Obstetrics):** Guidelines on fetal therapy and monochorionic twinning complications (2023).
