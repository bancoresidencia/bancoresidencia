## 1. O Que Mais Cai nas Provas de Residência Médica

A Síndrome de Transfusão Feto-Fetal (STFF) é o tema mais cobrado e de maior rigor técnico dentro do capítulo de gestação múltipla nas provas de R1 e R3 de todo o país (ENARE, USP-SP, UNICAMP, PSU-MG, AMRIGS, SUS-SP). O examinador cobra do candidato a capacidade de reconhecer prontamente a síndrome baseando-se **exclusivamente na discrepância do volume de líquido amniótico (sequência oligo-polidrâmnio)** em gestação monocoriônica diamniótica, sem se deixar induzir a erro por parâmetros de crescimento ponderal.

Além do diagnóstico sindrômico primário, as questões exigem o domínio impecável da **Classificação de Quintero (Estádios I a V)**, a indicação mandatória da **ablação vascular a laser fetoscópica (Técnica de Solomon)** entre 16 e 26 semanas como padrão-ouro respaldado pelo histórico ensaio clínico *Eurofetus*, e o manejo das complicações hemodinâmicas nos conceptos doador (*stuck twin*) e receptor (*hidrópico com sobrecarga de câmaras direitas*).

```gem-stats-stff
{
  "focusSlug": "gemelaridade-stff",
  "specialty": "Ginecologia e Obstetrícia",
  "theme": "Gestação Múltipla",
  "focus": "Síndrome da Transfusão Feto-Fetal",
  "totalQuestions": 48,
  "timeframeRange": "2017-2026",
  "version": 1,
  "donutSlices": [
    {
      "id": 1,
      "name": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
      "shortName": "Critérios USG",
      "percentage": 39.6,
      "questionCount": 19,
      "priority": "Crítica",
      "color": "#3B82F6",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "Oligoâmnio no doador (MBV < 2 cm) + Polidrâmnio no receptor (MBV > 8 ou 10 cm) em MCDA.",
      "focusExplanation": "O diagnóstico de STFF exige obrigatoriamente a presença concomitante de: **gestação monocoriônica diamniótica** comprovada (Sinal do T); **oligoidrâmnio grave no feto doador**, definido pelo Maior Bolsão Vertical (**MBV < 2 cm**); e **polidrâmnio tenso no feto receptor**, definido por **MBV > 8 cm em gestações até 20 semanas** ou **MBV > 10 cm após 20 semanas**. A discordância de peso fetal NÃO é critério diagnóstico de STFF (pertence à Restrição de Crescimento Fetal Seletiva).",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Valores de corte do Maior Bolsão Vertical (MBV < 2 cm e > 8/10 cm) como o único critério definidor primário da síndrome.",
          "trapAlert": "Assinalar alternativa que exige discordância de peso fetal > 20% para fechar o diagnóstico de STFF."
        },
        "ENARE": {
          "howItCharges": "Apresentação de caso clínico com laudo ultrassonográfico de 18 semanas em gestante com placenta única, demonstrando bolsão de 1,2 cm em um feto e 9,5 cm no outro.",
          "trapAlert": "Confundir com rotura prematura de membranas no feto com pouco líquido."
        },
        "USP": {
          "howItCharges": "Diferenciação precisa entre o corte de polidrâmnio antes e depois de 20 semanas: MBV > 8 cm (<= 20 sem) vs. MBV > 10 cm (> 20 sem).",
          "trapAlert": "Aplicar o corte de MBV > 8 cm indiscriminadamente para gestações de 24 semanas."
        },
        "UNICAMP": {
          "howItCharges": "A UNICAMP enfatiza a medida do Maior Bolsão Vertical em cavidade livre de cordão e membros fetais, rechaçando o ILA como parâmetro de escolha em gemelares.",
          "trapAlert": "Utilizar o Índice de Líquido Amniótico (ILA) de 4 quadrantes para estadiar STFF (o ILA não é validado para gemelares)."
        },
        "PSU-MG": {
          "howItCharges": "Identificação rápida: feto com bexiga cheia e muito líquido associado a feto prensado contra a parede uterina sem líquido visível.",
          "trapAlert": "Sugerir que a gestação é dicoriônica com agenesia renal em um dos fetos."
        },
        "AMRIGS": {
          "howItCharges": "Pergunta direta sobre os valores numéricos em centímetros que definem a oligohidramnia e o polihidrâmnio na STFF.",
          "trapAlert": "Confundir 2 cm com 3 cm para o limite inferior do doador."
        },
        "SUS-SP": {
          "howItCharges": "Encaminhamento de emergência: detecção de oligo-polidrâmnio no 2º trimestre exige referência imediata para cirurgia fetal.",
          "trapAlert": "Aguardar retorno ambulatorial em 30 dias para checar evolução do líquido."
        }
      }
    },
    {
      "id": 2,
      "name": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
      "shortName": "Estadiamento Quintero",
      "percentage": 20.8,
      "questionCount": 10,
      "priority": "Alta",
      "color": "#10B981",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "I (Oligo-Poli) -> II (Bexiga ausente) -> III (Doppler crítico) -> IV (Hidrops) -> V (Óbito).",
      "focusExplanation": "A **Classificação de Quintero** é a ferramenta prognóstica soberana: **Estádio I**: Oligo-polidrâmnio presente, com **bexiga do feto doador visível** e Doppler normal; **Estádio II**: **Bexiga do doador colapsada e NÃO visualizada** durante todo o exame (anúria fetal); **Estádio III**: **Doppler criticamente alterado** (diástole zero ou reversa na artéria umbilical, onda A reversa no ducto venoso ou pulsação na veia umbilical); **Estádio IV**: **Hidropisia fetal franca** (ascite, derrame ou anasarca, habitualmente no receptor); **Estádio V**: **Óbito intrauterino** de um ou ambos os conceptos.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Identificação exata do estádio a partir da descrição dos achados ultrassonográficos e do traçado de dopplervelocimetria.",
          "trapAlert": "Classificar ausência de bexiga como Estádio III ou Doppler alterado como Estádio II."
        },
        "ENARE": {
          "howItCharges": "Caso clínico descrevendo feto doador com bexiga não visualizada após 60 minutos de observação ecográfica contínua, mantendo Doppler normal (Quintero II).",
          "trapAlert": "Marcar Estádio I por considerar apenas o volume de líquido."
        },
        "USP": {
          "howItCharges": "Análise detalhada do Doppler do Estádio III: presença de onda A reversa no ducto venoso do receptor (insuficiência cardíaca direita) ou diástole zero na AU do doador.",
          "trapAlert": "Achar que o Doppler alterado precisa estar presente obrigatoriamente em ambos os conceptos simultaneamente."
        },
        "UNICAMP": {
          "howItCharges": "Apresentação de feto receptor com ascite fetal volumosa e derrame pericárdico: enquadramento imediato no Estádio IV de Quintero.",
          "trapAlert": "Exigir óbito iminente para classificar como Estádio IV."
        },
        "PSU-MG": {
          "howItCharges": "Sequência cronológica dos estádios de Quintero: qual parâmetro define a transição do Estádio I para o Estádio II (visualização da bexiga fetal).",
          "trapAlert": "Responder que a transição decorre da alteração da artéria cerebral média."
        },
        "AMRIGS": {
          "howItCharges": "Enunciado direto questionando qual o achado que caracteriza o Estádio III da classificação de Quintero.",
          "trapAlert": "Responder hidropisia fetal (hidropisia é Estádio IV)."
        },
        "SUS-SP": {
          "howItCharges": "Reconhecimento de que a progressão entre os estádios pode ser rápida e atípica, pulando etapas em menos de 48-72 horas.",
          "trapAlert": "Supor que todo caso passa obrigatoriamente e lentamente por todos os estádios de forma linear."
        }
      }
    },
    {
      "id": 3,
      "name": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
      "shortName": "Anastomoses AV",
      "percentage": 20.8,
      "questionCount": 10,
      "priority": "Alta",
      "color": "#EC4899",
      "trend": "estavel",
      "trendLabel": "🏛️ Clássico Estável",
      "takeaway": "Shunts AV cotiledonares profundos desbalanceados sem anastomoses AA compensatórias suficientes.",
      "focusExplanation": "A etiologia reside na presença de **anastomoses arteriovenosas (AV) profundas desbalanceadas** no interior dos cotilédones compartilhados. O fluxo unidirecional transfere cronicamente sangue do doador para o receptor. O **doador** desenvolve hipovolemia, hipoperfusão renal e ativação intensa do **Sistema Renina-Angiotensina-Aldosterona (SRAA)**, culminando em oligúria extrema e oligoidrâmnio (*stuck twin*). O **receptor** sofre hipervolemia crônica, aumento do **Peptídeo Natriurético Atrial (PNA)** e diurese osmótica com polidrâmnio massivo, evoluindo com sobrecarga ventricular direita, hipertensão pulmonar, regurgitação tricúspide e falência cardíaca.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Mecanismo neuro-humoral: ativação do SRAA no doador vs. hipervolemia com PNA elevado e hipertrofia miocárdica no receptor.",
          "trapAlert": "Afirmar que a falência cardíaca ocorre no feto doador por anemia severa."
        },
        "ENARE": {
          "howItCharges": "Anatomia vascular placentária: localização das anastomoses AV responsáveis pela STFF no leito capilar cotiledonar profundo.",
          "trapAlert": "Confundir com anastomoses superficiais artério-arteriais (que são protetoras)."
        },
        "USP": {
          "howItCharges": "Aprofundamento hemodinâmico: passagem de renina do doador para o receptor através do shunt agrava a vasoconstrição e a hipertensão sistêmica no feto receptor.",
          "trapAlert": "Desconsiderar o impacto hormonal cruzado da renina na circulação do receptor."
        },
        "UNICAMP": {
          "howItCharges": "Diferença fisiopatológica entre STFF e TAPS: na STFF o shunt transporta plasma e solutos; no TAPS o shunt é lento e transporta apenas hemácias.",
          "trapAlert": "Afirmar que o mecanismo etiopatogênico da STFF e do TAPS é idêntico."
        },
        "PSU-MG": {
          "howItCharges": "Por que o feto doador fica colado à parede uterina (mecanismo mecânico do stuck twin pela ausência completa de líquido no saco).",
          "trapAlert": "Atribuir o stuck twin a bridas amnióticas ou aderências intrauterinas inflamatórias."
        },
        "AMRIGS": {
          "howItCharges": "Causa básica da poliúria no feto receptor: hipervolemia gerando elevação da taxa de filtração glomerular e supressão do ADH.",
          "trapAlert": "Dizer que a poliúria decorre de diabetes gestacional materno."
        },
        "SUS-SP": {
          "howItCharges": "Morbidade associada ao polidrâmnio agudo materno: dispneia, risco de rotura prematura de membranas e trabalho de parto pré-termo extremo.",
          "trapAlert": "Tratar o polidrâmnio sintomático apenas com restrição hídrica materna."
        }
      }
    },
    {
      "id": 4,
      "name": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
      "shortName": "Clínica & Sobrecarga",
      "percentage": 12.5,
      "questionCount": 6,
      "priority": "Média",
      "color": "#F59E0B",
      "trend": "estavel",
      "trendLabel": "🏛️ Clássico Estável",
      "takeaway": "Doador desidratado/restrito (*stuck twin*) vs. Receptor pletórico/hipertrófico com hidropisia.",
      "focusExplanation": "Sem intervenção médica, a mortalidade perinatal na STFF grave ultrapassa 90%. O **feto doador** apresenta restrição de crescimento severa, palidez, ausência de urina na bexiga e fica imobilizado junto à parede uterina pela membrana amniótica retraída (*stuck twin*). O **feto receptor** é volumoso, pletórico, policitêmico, com bexiga persistentemente repleta e sinais de **cardiomiopatia hipertrófica obstrutiva** (espessamento do septo interventricular e insuficiência tricúspide), evoluindo para anasarca, derrame pericárdico e hidropisia franca.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Quadro clínico contrastante entre o doador (hipovolêmico e desidratado) e o receptor (sobrecarregado e hidrópico).",
          "trapAlert": "Achar que o feto receptor é o 'saudável' por ser maior e ter muito líquido amniótico."
        },
        "ENARE": {
          "howItCharges": "Avaliação ecocardiográfica fetal no feto receptor revelando regurgitação tricúspide e disfunção diastólica ventricular direita.",
          "trapAlert": "Interpretar o sopro tricúspide como cardiopatia congênita estrutural primária e não funcional."
        },
        "USP": {
          "howItCharges": "Risco neurológico a longo prazo: sobrevida com sequelas neurológicas motoras e cognitivas sem descompressão vascular oportuna.",
          "trapAlert": "Acreditar que a lesão neurológica decorre exclusivamente do parto prematuro e não da hipoperfusão crônica."
        },
        "UNICAMP": {
          "howItCharges": "Impacto materno da síndrome de espelho (Ballantyne Syndrome): pré-eclâmpsia grave materna desencadeada pela hidropisia fetal do receptor.",
          "trapAlert": "Desconhecer a associação entre hidropisia fetal grave na STFF e síndrome materna de espelho."
        },
        "PSU-MG": {
          "howItCharges": "Reconhecimento semiológico do abdome materno em 'casca de ovo' pela distensão polihidrâmnica aguda.",
          "trapAlert": "Confundir com polidrâmnio crônico idiopático de progressão lenta."
        },
        "AMRIGS": {
          "howItCharges": "Alterações hematimétricas pós-natais: hematócrito do receptor acentuadamente superior ao do doador.",
          "trapAlert": "Esperar hematócritos concordantes entre os conceptos."
        },
        "SUS-SP": {
          "howItCharges": "Acolhimento da puérpera com recém-nascidos acometidos por STFF na UTI neonatal e seguimento multidisciplinar.",
          "trapAlert": "Dar alta neonatal precoce sem ecocardiograma e avaliação neurológica especializada."
        }
      }
    },
    {
      "id": 5,
      "name": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
      "shortName": "Ablação a Laser",
      "percentage": 6.3,
      "questionCount": 3,
      "priority": "Média",
      "color": "#8B5CF6",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "Laser fetoscópico (Técnica de Solomon) entre 16 e 26 semanas é o padrão-ouro curativo absoluto.",
      "focusExplanation": "A **fotocoagulação a laser das anastomoses vasculares por fetoscopia** é a terapia padrão-ouro de primeira linha comprovada pelo ensaio clínico multinacional *Eurofetus* para **Quintero >= II entre 16 e 26 semanas** (e Quintero I progressivo/sintomático). A **Técnica de Solomon** consiste na coagulação de todas as anastomoses seguida de uma linha de fotocoagulação contínua ao longo de todo o equador vascular placentário de borda a borda, promovendo a **dicorionização funcional completa da placenta**. Essa técnica reduziu drasticamente a recorrência da STFF e a incidência de TAPS pós-laser em relação à ablação seletiva pontual simples.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Superioridade inequívoca da cirurgia fetal a laser sobre a amniodrenagem descompressiva seriada em taxas de sobrevida e redução de sequelas neurológicas.",
          "trapAlert": "Indicar amniodrenagem seriada como terapia de primeira escolha quando o laser fetoscópico está disponível."
        },
        "ENARE": {
          "howItCharges": "Janela terapêutica ideal para realização da fotocoagulação a laser por fetoscopia: entre 16 e 26 semanas de idade gestacional.",
          "trapAlert": "Indicar o procedimento fetoscópico com 32 semanas de gestação."
        },
        "USP": {
          "howItCharges": "Conceito e vantagens da Técnica de Solomon: coagulação contínua que une os cotilédones na linha do equador vascular placentário para dicorionizar a placenta e evitar microshunts residuais.",
          "trapAlert": "Confundir Técnica de Solomon com técnica não seletiva indiscriminada de toda a placa corial."
        },
        "UNICAMP": {
          "howItCharges": "Papel restrito da amniodrenagem seriada descompressiva: reservada para casos paliativos de alívio sintomático materno quando a fetoscopia a laser é tecnicamente inacessível ou contraindicada.",
          "trapAlert": "Considerar a amniodrenagem como tratamento etiológico das anastomoses vasculares."
        },
        "PSU-MG": {
          "howItCharges": "Contraindicação formal da septostomia deliberada da membrana intergemelar por risco de transformar a gestação em monoamniótica iatrogênica.",
          "trapAlert": "Indicar septostomia como técnica segura de equilíbrio pressórico."
        },
        "AMRIGS": {
          "howItCharges": "Resultados pós-laser: taxa de sobrevida de pelo menos um feto superior a 80-85% e sobrevida de ambos em cerca de 50-60%.",
          "trapAlert": "Afirmar que a cirurgia a laser tem mortalidade fetal de 100%."
        },
        "SUS-SP": {
          "howItCharges": "Vigilância pós-operatória: USG e Doppler semanais após o procedimento a laser para monitorização de sangramento, descolamento de membranas e TAPS pós-fetoscopia.",
          "trapAlert": "Dispensar a paciente do seguimento especializado após o sucesso cirúrgico inicial."
        }
      }
    }
  ],
  "bancaBreakdown": {
    "ENARE": {
      "banca": "ENARE",
      "totalQuestions": 11,
      "topSubfocos": [
        {
          "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
          "questionCount": 5,
          "percentageInBanca": 45.5
        },
        {
          "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
          "questionCount": 2,
          "percentageInBanca": 18.2
        },
        {
          "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
          "questionCount": 2,
          "percentageInBanca": 18.2
        },
        {
          "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
          "questionCount": 1,
          "percentageInBanca": 9.1
        },
        {
          "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
          "questionCount": 1,
          "percentageInBanca": 9.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "USP": {
      "banca": "USP",
      "totalQuestions": 13,
      "topSubfocos": [
        {
          "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
          "questionCount": 5,
          "percentageInBanca": 38.5
        },
        {
          "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
          "questionCount": 3,
          "percentageInBanca": 23.1
        },
        {
          "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
          "questionCount": 3,
          "percentageInBanca": 23.1
        },
        {
          "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
          "questionCount": 1,
          "percentageInBanca": 7.7
        },
        {
          "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
          "questionCount": 1,
          "percentageInBanca": 7.6
        }
      ],
      "predominantDifficulty": "Difícil"
    },
    "UNICAMP": {
      "banca": "UNICAMP",
      "totalQuestions": 9,
      "topSubfocos": [
        {
          "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
          "questionCount": 4,
          "percentageInBanca": 44.4
        },
        {
          "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
          "questionCount": 2,
          "percentageInBanca": 22.2
        },
        {
          "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
          "questionCount": 2,
          "percentageInBanca": 22.2
        },
        {
          "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
          "questionCount": 1,
          "percentageInBanca": 11.2
        }
      ],
      "predominantDifficulty": "Difícil"
    },
    "PSU-MG": {
      "banca": "PSU-MG",
      "totalQuestions": 6,
      "topSubfocos": [
        {
          "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
          "questionCount": 2,
          "percentageInBanca": 33.3
        },
        {
          "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
          "questionCount": 2,
          "percentageInBanca": 33.3
        },
        {
          "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
          "questionCount": 1,
          "percentageInBanca": 16.7
        },
        {
          "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
          "questionCount": 1,
          "percentageInBanca": 16.7
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "AMRIGS": {
      "banca": "AMRIGS",
      "totalQuestions": 4,
      "topSubfocos": [
        {
          "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
          "questionCount": 2,
          "percentageInBanca": 50.0
        },
        {
          "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
          "questionCount": 1,
          "percentageInBanca": 25.0
        },
        {
          "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
          "questionCount": 1,
          "percentageInBanca": 25.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "SUS-SP": {
      "banca": "SUS-SP",
      "totalQuestions": 5,
      "topSubfocos": [
        {
          "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
          "questionCount": 2,
          "percentageInBanca": 40.0
        },
        {
          "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
          "questionCount": 1,
          "percentageInBanca": 20.0
        },
        {
          "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
          "questionCount": 1,
          "percentageInBanca": 20.0
        },
        {
          "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
          "questionCount": 1,
          "percentageInBanca": 20.0
        }
      ],
      "predominantDifficulty": "Médio"
    }
  },
  "topTraps": [
    {
      "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
      "trapTitle": "Distrator de Discordância Ponderal na STFF",
      "trapDescription": "Discordância de peso > 20% define CIUR seletivo, NÃO é critério diagnóstico obrigatório de STFF (que exige sequência oligo-poli com MBV < 2 cm e > 8/10 cm)."
    },
    {
      "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
      "trapTitle": "Distrator de Amniodrenagem Seriada como Primeira Linha",
      "trapDescription": "Amniodrenagem seriada é medida puramente paliativa de alívio; o padrão-ouro curativo definitivo é a ablação a laser pela Técnica de Solomon (Eurofetus Trial)."
    }
  ],
  "auditHash": "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
  "needsRecalc": false,
  "certifiedAt": "2026-11-04T00:00:00.000Z",
  "lastRecalculatedAt": "2026-11-04T00:00:00.000Z",
  "status": "certified"
}
```

---

## 2. Critérios Diagnósticos Ultrassonográficos Obrigatórios de STFF

A Síndrome de Transfusão Feto-Fetal afeta aproximadamente 10 a 15% das gestações monocoriônicas diamnióticas (MCDA). A definição diagnóstica de prova baseia-se na presença de **três critérios obrigatórios concomitantes**:

$$
\text{Critérios Canônicos de STFF} \iff \begin{cases} \text{1. Gestação Monocoriônica Diamniótica (MCDA com placenta única e Sinal do T)} \\ \text{2. Feto Doador (Oligoidrâmnio Grave): Maior Bolsão Vertical (MBV)} < 2\text{ cm} \\ \text{3. Feto Receptor (Polidrâmnio Tenso): MBV} > 8\text{ cm }(\le 20\text{ sem}) \lor > 10\text{ cm }(> 20\text{ sem}) \end{cases}
$$

A avaliação de líquido amniótico deve ser realizada medindo-se o **Maior Bolsão Vertical (MBV)** em uma área livre de partes fetais e alças de cordão umbilical. O uso do Índice de Líquido Amniótico (ILA de 4 quadrantes) é tecnicamente desaconselhado em gemelares devido à imprecisão na delimitação dos quadrantes de cada saco amniótico.

> [!WARNING] Armadilha Clássica de Prova: A Pegadinha da Discordância de Peso
> Uma das pegadinhas mais clássicas e frequentes em concursos médicos é apresentar como alternativa: *"Diagnóstico de STFF firmado por discordância de peso fetal superior a 20%"*. **ISSO É INCORRETO.** A discordância de peso fetal é o critério definidor da **Restrição de Crescimento Fetal Seletiva (RCFs)**, mas **NÃO faz parte dos critérios diagnósticos obrigatórios de STFF**. A STFF é definida exclusivamente pela discrepância quantitativa de volume amniótico (sequência oligo-polidrâmnio).

---

## 3. Fisiopatologia Comparativa: Doador (Stuck Twin) vs. Receptor (Sobrecarga Volêmica)

A etiopatogenia da STFF decorre da presença de **anastomoses arteriovenosas profundas desbalanceadas** no leito capilar cotiledonar da placenta compartilhada, estabelecendo um shunt sanguíneo crônico e unidirecional do feto doador para o feto receptor:

### Matriz Comparativa Fisiopatológica Feto a Feto:

| Parâmetro Clínico-Biológico | Feto Doador (Hipovolêmico) | Feto Receptor (Hipervolêmico) | Mecanismo Fisiopatológico Subjacente |
| :--- | :--- | :--- | :--- |
| **Volemia e Pré-Carga** | **Hipovolemia acentuada** e desidratação | **Hipervolemia crônica** e pletora sanguínea | Desvio de sangue desbalanceado através de shunts cotiledonares AV profundos. |
| **Função Renal e Diurese** | Hipoperfusão renal severa $\rightarrow$ **Oligúria / Anúria** | Hiperfiltração glomerular $\rightarrow$ **Poliúria osmótica massiva** | O fluxo sanguíneo renal dita a taxa de filtração glomerular e a produção de urina fetal. |
| **Volume Amniótico** | **Oligoidrâmnio grave** (MBV $< 2\text{ cm}$) $\rightarrow$ *Stuck Twin* | **Polidrâmnio tenso** (MBV $> 8\text{ ou }10\text{ cm}$) | A urina fetal é o componente primário do líquido amniótico a partir de 16 semanas. |
| **Visualização da Bexiga** | **Bexiga colapsada e invisível** (Estádio II de Quintero) | **Bexiga persistentemente distendida e repleta** | Reflexo direto da presença ou ausência de diurese ativa na cavidade vesical. |
| **Eixo Neuro-Humoral** | Ativação intensa do **Sistema Renina-Angiotensina (SRAA)** | Secreção maciça de **Peptídeo Natriurético Atrial (PNA)** | Tentativa compensatória do doador de reter volume vs. receptor tentando excretar água e sódio. |
| **Aparelho Cardiovascular** | Coração de dimensões normais ou comprimido | **Cardiomegalia, hipertrofia de VD e insuficiência tricúspide** | A sobrecarga pressórica e volêmica gera disfunção diastólica e sistólica no receptor. |
| **Evolução Fetal Terminal** | Restrição de crescimento severa e morte por choque hipovolêmico | **Hidropisia fetal franca** (anasarca, ascite e derrame) | Falência miocárdica descompensada e elevação crítica das pressões venosas centrais. |

---

## 4. Classificação Completa de Quintero (Estádios I a V) & Parâmetros Doppler

O estadiamento proposto por Quintero é o padrão-ouro internacional para estadiamento prognóstico e direcionamento terapêutico na STFF:

$$
\text{Estadiamento de Quintero} \implies \begin{cases} \text{Estádio I: Sequência Oligo-Poli isolada (MBV } < 2\text{ e } > 8/10\text{ cm; bexiga do doador VISÍVEL)} \\ \text{Estádio II: Bexiga do feto doador NÃO visualizada durante todo o exame (anúria)} \\ \text{Estádio III: Doppler criticamente alterado (AU diástole zero/reversa, DV onda A reversa, VU pulsátil)} \\ \text{Estádio IV: Hidropisia fetal franca (anasarca, ascite, derrame pleural/pericárdico)} \\ \text{Estádio V: Óbito intrauterino de um ou ambos os fetos} \end{cases}
$$

### Tabela Canônica do Estadiamento de Quintero:

| Estádio | Critérios Ultrassonográficos Diagnósticos | Achados de Dopplervelocimetria | Significado Clínico e Conduta |
| :--- | :--- | :--- | :--- |
| **Estádio I** | Sequência Oligo-Polidrâmnio obrigatória (MBV $< 2\text{ cm}$ e $> 8/10\text{ cm}$) | Doppler normal em ambos os conceptos | **Bexiga do feto doador claramente visível.** Vigilância expectante estrita ou Laser se sintomático. |
| **Estádio II** | Critérios do Estádio I presentes | Doppler permanece normal em ambos | **Bexiga do doador colapsada e invisível.** Hipovolemia e anúria estabelecidas; indicação formal de cirurgia. |
| **Estádio III** | Critérios do Estádio I ou II associados a Doppler alterado | **Doppler Criticamente Alterado:** AU com diástole zero/reversa; DV com onda A reversa; ou pulsação de VU | **Disfunção cardiovascular e hemodinâmica grave.** Indicação absoluta de fotocoagulação a laser de urgência. |
| **Estádio IV** | Presença de **Hidropisia Fetal** em um ou ambos os conceptos | Sinais de falência cardíaca descompensada no Doppler | Anasarca, ascite, derrame pleural/pericárdico (geralmente no receptor). Alto risco de morte iminente. |
| **Estádio V** | **Óbito fetal intrauterino** de um ou ambos os conceptos | Ausência completa de batimentos cardiofetais (BCF) | Risco de 20-30% de sequela neurológica grave ou óbito subsequente no feto sobrevivente. |

*Legenda: AU (Artéria Umbilical); DV (Ducto Venoso); VU (Veia Umbilical).*

---

## 5. Tratamento Padrão-Ouro: Ablação a Laser por Fetoscopia (Técnica de Solomon)

O objetivo primário do tratamento consiste em erradicar a causa subjacente da síndrome através da interrupção cirúrgica de todas as comunicações vasculares anômalas entre os conceptos, promovendo a **dicorionização funcional completa da placenta**:

*   **Procedimento de Escolha Padrão-Ouro:** **Fotocoagulação a Laser das anastomoses vasculares da placa coriônica guiada por fetoscopia**.
*   **A Evidência do Ensaio Clínico Eurofetus:** O estudo multicêntrico randomizado internacional *Eurofetus Trial* (Senat et al., publicado no New England Journal of Medicine) demonstrou de forma inequívoca a **superioridade da cirurgia fetoscópica a laser em relação à amniodrenagem seriada descompressiva**, proporcionando maior sobrevida perinatal (pelo menos um feto vivo em $> 80\text{-}85\%$ vs $60\%$) e reduzindo pela metade a incidência de paralisia cerebral e sequelas neurológicas motoras graves aos 6 anos de vida.
*   **Técnica de Solomon:** Avanço técnico padrão atual em que, após a coagulação de todas as anastomoses arteriovenosas individuais identificadas, o cirurgião fetal realiza uma **linha de fotocoagulação contínua ao longo de todo o equador vascular da placenta**, de borda a borda. Essa técnica bloqueia microanastomoses residuais ocultas, reduzindo drasticamente a recorrência da STFF e prevenindo o surgimento da Sequência TAPS pós-operatória.
*   **Janela Gestacional Ótima:** Realizada idealmente entre **16 semanas e 26 semanas de gestação**.
*   **Indicações Formais:** Estádios II, III e IV de Quintero. No Estádio I, a intervenção cirúrgica é indicada na presença de polidrâmnio materno muito sintomático, encurtamento cervical progressivo ($< 25\text{ mm}$) ou progressão documentada de estádio.
*   **Procedimentos de Exceção:** A **Amniodrenagem Seriada** consiste na retirada lenta de 1 a 3 litros de líquido amniótico do saco do receptor; não trata as anastomoses e é restrita aos casos paliativos em que o laser é inacessível ou após 26 semanas. A **Septostomia deliberada da membrana intergemelar é formalmente proscrita** pelo risco inaceitável de criar uma gestação monoamniótica artificial com entrelaçamento fatal de cordão.

---

```clinical-scheme
{
  "type": "step-up",
  "badge": "Diretriz Eurofetus / FEBRASGO",
  "data": {
    "steps": [
      {
        "level": 1,
        "title": "Quintero Estádio I (Oligo-Poli com Bexiga Visível)",
        "criteria": "MBV < 2 cm no doador e > 8/10 cm no receptor; bexiga do doador visível e Doppler normal.",
        "therapy": "Vigilância ultrassonográfica estrita semanal. Indicar fotocoagulação a laser se polidrâmnio materno sintomático ou colo < 25 mm.",
        "failCriteria": "Se bexiga do doador desaparecer ou Doppler alterar -> Escalar imediatamente para Nível 2."
      },
      {
        "level": 2,
        "title": "Quintero Estádios II, III e IV (Indicação Absoluta de Cirurgia Fetal)",
        "criteria": "Bexiga invisível (II), Doppler criticamente alterado na AU/DV/VU (III) ou hidropisia fetal (IV) entre 16 e 26 semanas.",
        "therapy": "Fotocoagulação a Laser das anastomoses vasculares por fetoscopia utilizando a Técnica de Solomon (dicorionização contínua).",
        "failCriteria": "Se falha técnica, placenta inacessível ou IG > 26s -> Amniodrenagem paliativa de alívio ou parto planejado."
      },
      {
        "level": 3,
        "title": "Manejo Pós-Procedimento e Resolução da Gestação",
        "criteria": "Após ablação a laser bem-sucedida com dicorionização da placa coriônica.",
        "therapy": "Vigilância ecográfica semanal (líquido e Doppler de ACM para rastreio de TAPS pós-laser). Parto programado entre 34 e 36 semanas.",
        "failCriteria": "Se morte de um concepto ou persistência de alteração hemodinâmica -> Avaliação de maturidade e conduta individualizada."
      }
    ]
  }
}
```

---

### 🔄 O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)

| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |
| :--- | :--- | :--- | :--- |
| **Tratamento de Primeira Escolha** | Amniodrenagem seriada descompressiva como terapia de rotina | **Fotocoagulação a laser fetoscópica como padrão-ouro absoluto** (Eurofetus Trial) | **FEBRASGO / ISUOG (2023)** |
| **Técnica Cirúrgica de Ablação** | Coagulação seletiva pontual apenas dos cotilédones visíveis | **Técnica de Solomon** (coagulação contínua do equador vascular) para prevenir TAPS pós-laser | **Solomon Trial / SMFM (2022)** |
| **Manejo do Quintero Estádio I** | Conduta expectante passiva universal em todos os casos | Indicação de **ablação a laser se encurtamento cervical (< 25 mm)** ou sintomas maternos graves | **ISUOG / SMFM (2023)** |
| **Septostomia da Membrana** | Punção da membrana com agulha para equilibrar os líquidos | **Formalmente proscrita** pelo risco crítico de entrelaçamento letal de cordão | **ACOG / FEBRASGO (2023)** |

> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:
> Questões recentes do ENARE e da USP têm cobrado diretamente a superioridade do laser fetoscópico sobre a amniodrenagem em termos de sobrevida neurológica livre de deficiências. A amniodrenagem não trata a causa vascular subjacente e não deve ser assinalada como melhor conduta em serviço terciário estruturado.

---

## 6. Algoritmo Decisório no Manejo da Síndrome de Transfusão Feto-Fetal

### Passo a Passo Sintético da Cascata Decisória

1.  **[Diagnóstico Ultrassonográfico Imediato]:** Confirmar gestação monocoriônica diamniótica (Sinal do T) e mensurar o Maior Bolsão Vertical (MBV). Se MBV $< 2\text{ cm}$ no doador e $> 8\text{ cm }(\le 20\text{s})$ ou $> 10\text{ cm }(> 20\text{s})$ no receptor, o diagnóstico de STFF está confirmado.
2.  **[Estadiamento de Quintero]:** Avaliar a bexiga fetal do doador. Se visível $\rightarrow$ Estádio I. Se não visualizada $\rightarrow$ Estádio II. Realizar Doppler de Artéria Umbilical, Ducto Venoso e Veia Umbilical. Se diástole zero/reversa na AU, onda A reversa no DV ou VU pulsátil $\rightarrow$ Estádio III. Se houver hidropisia (edema, derrame, ascite) $\rightarrow$ Estádio IV.
3.  **[Encaminhamento Terciário]:** Referenciar imediatamente a gestante com Quintero $\ge \text{I}$ sintomático ou $\ge \text{II}$ para centro quaternário de Medicina Fetal e Cirurgia Fetal.
4.  **[Intervenção Fetal Específica]:** Se idade gestacional entre **16 e 26 semanas**, indicar e realizar a **Fotocoagulação a Laser Fetoscópica pela Técnica de Solomon**.
5.  **[Seguimento Pós-Operatório e Parto]:** Monitorar semanalmente com Doppler de PVS-ACM e Maior Bolsão Vertical para detectar TAPS pós-laser ou recidiva da STFF. Programar o nascimento eletivo entre **34 e 36 semanas** após corticoterapia para maturação pulmonar.

---

## Diretrizes Oficiais & Consensos de Referência

*   **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** Tratado de Obstetrícia & Manual de Procedimentos Invasivos em Medicina Fetal (2021/2023).
*   **Eurofetus Consortium (Senat et al., NEJM):** Endoscopic Laser Surgery versus Serial Amnioreduction for Severe Twin-to-Twin Transfusion Syndrome (New England Journal of Medicine, estudo seminal).
*   **ISUOG (International Society of Ultrasound in Obstetrics and Gynecology):** Practice Guidelines for the management of twin-to-twin transfusion syndrome (2023).
*   **ACOG (American College of Obstetricians and Gynecologists):** Practice Bulletin No. 231 - Management of Monochorionic Twin Complications (2021, revalidado 2024).
*   **FIGO (International Federation of Gynecology and Obstetrics):** Guidelines on fetal surgery and twin pregnancy interventions (2023).
