## 1. O Que Mais Cai nas Provas de Residência Médica

A Infecção Puerperal figura historicamente entre as **quatro principais causas de mortalidade materna no Brasil e no mundo** (ao lado de pré-eclâmpsia, hemorragia pós-parto e abortamento séptico). A auditoria estatística do censo de questões oficiais de residência médica (ENARE, USP-SP, UNICAMP, UNIFESP, SUS-SP, PSU-MG, UERJ, AMRIGS) revela a seguinte distribuição temática mandatória de cobrança:

```exam-stats
{
  "focusSlug": "infeccao-puerperal",
  "specialty": "Obstetrícia",
  "theme": "Puerpério",
  "focus": "Infecção Puerperal",
  "totalQuestions": 249,
  "timeframeRange": "2017-2026",
  "donutSlices": [
    {
      "id": 1,
      "name": "Antibioticoterapia na Infecção Puerperal",
      "shortName": "Antibioticoterapia",
      "percentage": 26.5,
      "questionCount": 66,
      "priority": "Alta",
      "color": "#3B82F6",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "Clindamicina + Gentamicina IV de primeira linha até 48h afebril; sem antibiótico oral pós-alta.",
      "focusExplanation": "O esquema de **primeira linha padrão-ouro** para endometrite pós-parto é a combinação intravenosa de **Clindamicina 900 mg IV a cada 8h** (cobertura de anaeróbios, incluindo *Bacteroides fragilis*) associada a **Gentamicina 5 mg/kg IV uma vez ao dia** ou 1,5 mg/kg a cada 8h (cobertura de Gram-negativos entéricos). O tratamento deve ser mantido em regime hospitalar até a paciente permanecer **48 horas afebril e assintomática**. Ao atingir esse critério de cura clínica, **a alta hospitalar é concedida SEM antibioticoterapia oral pós-alta** (não há benefício comprovado e eleva resistência bacteriana).",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Cobrança unânime nas principais bancas: indicação imediata de Clindamicina + Gentamicina IV, tempo de manutenção hospitalar até 48h afebril e suspensão completa do antibiótico na alta hospitalar (sem transição oral).",
          "trapAlert": "Prescrever Cefalexina ou Amoxicilina-Clavulanato oral pós-alta é o distrator mais assinalado e punido em provas."
        },
        "ENARE": {
          "howItCharges": "O **ENARE** formula casos clínicos objetivos no ambiente de enfermaria obstétrica do SUS, cobrando a prescrição da associação parenteral (Clindamicina 900mg + Gentamicina IV) e o critério de alta.",
          "trapAlert": "A banca sempre insere uma alternativa com 'alta hospitalar com antibiótico oral por 7 a 10 dias'. A regra de ouro é: alta SEM antibiótico oral após 48h afebril."
        },
        "USP": {
          "howItCharges": "A **USP** exige o raciocínio clínico da falha terapêutica: se após 48 a 72h de Clinda + Genta a paciente mantiver febre e piora clínica, deve-se associar **Ampicilina IV** (cobertura de *Enterococcus faecalis*) e pesquisar abscesso pélvico ou tromboflebite pélvica séptica.",
          "trapAlert": "Trocar empiricamente para carbapenêmico sem investigar focos complicados ou não associar Ampicilina para cobrir Enterococo."
        },
        "UNICAMP": {
          "howItCharges": "A **UNICAMP** explora o perfil farmacológico dos aminoglicosídeos: Gentamicina em dose única diária (5 mg/kg) possui a mesma eficácia clínica da dose fracionada de 8/8h, com menor potencial de nefrotoxicidade e ototoxicidade.",
          "trapAlert": "Alternativas sugerindo monoterapia com fluoroquinolonas orais em pacientes com endometrite puerperal."
        },
        "PSU-MG": {
          "howItCharges": "O **PSU-MG** foca no critério de cura clínica: a contagem do tempo de segurança exige 48 horas ininterruptas afebril, com involução uterina normal e lóquios sem odor fétido.",
          "trapAlert": "Alternativas que fixam tempos arbitrários de 14 dias de internação independentemente da melhora clínica."
        },
        "AMRIGS": {
          "howItCharges": "A **AMRIGS** tem estilo direto, cobrando o espectro microbiano dos fármacos: Clindamicina para cobertura de anaeróbios estritos e Gentamicina para bacilos Gram-negativos facultativos.",
          "trapAlert": "Substituir Clindamicina por Metronidazol em monoterapia sem a cobertura sinérgica de Gram-negativos da Gentamicina."
        },
        "SUS-SP": {
          "howItCharges": "O **SUS-SP** aborda o fluxo de porta de emergência: puérpera febril no 4º DPO deve ter internação imediata e início do esquema venoso na primeira hora de admissão.",
          "trapAlert": "Liberar a paciente para tratamento domiciliar com repouso e antitérmicos."
        }
      }
    },
    {
      "id": 2,
      "name": "Endometrite Puerperal: Diagnóstico & Clínica",
      "shortName": "Endometrite & Clínica",
      "percentage": 26.1,
      "questionCount": 65,
      "priority": "Alta",
      "color": "#10B981",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "Tríade de Bumm: febre, útero amolecido/doloroso e lóquios fétidos achocolatados.",
      "focusExplanation": "A endometrite puerperal é a causa mais comum de febre pós-parto. O diagnóstico é **eminentemente clínico**, caracterizado pela clássica **Tríade de Bumm**: **febre** (geralmente entre o 3º e 5º DPO), **útero subinvoluído, doloroso e amolecido** à palpação abdominal/bimanual, e **lóquios fétidos purulentos ou com aspecto achocolatado** (loquiometra). O colo uterino costuma encontrar-se entreaberto e doloroso à mobilização. Exames de imagem (USG pélvica) são indicados exclusivamente para afastar **restos ovulares retidos ou coleções/abscessos**, sendo **formalmente contraindicada a coleta de swab vaginal para cultura** devido à contaminação com a flora bacteriana habitual do trato reprodutivo inferior.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Apresentação da Tríade de Bumm (febre + útero doloroso e amolecido + lóquios fétidos) no 3º a 5º dia pós-parto, com diagnóstico 100% clínico.",
          "trapAlert": "Indicar cultura de swab vaginal ou biópsia endometrial para confirmar diagnóstico de endometrite (contraindicado e desnecessário)."
        },
        "ENARE": {
          "howItCharges": "O **ENARE** apresenta puérpera jovem que evoluiu no 4º DPO de cesárea com picos febris de 38,8°C, taquicardia e dor no baixo ventre com lóquios escuros e fétidos, exigindo o diagnóstico sindrômico imediato.",
          "trapAlert": "Confundir febre transitória de apojadura mamária (fisiológica, até 38°C nas primeiras 24h) com endometrite bacteriana estabelecida."
        },
        "USP": {
          "howItCharges": "A **USP** explora a semiologia detalhada: palpação do fundo uterino acima da cicatriz umbilical no 4º DPO (útero subinvoluído), dor aos anexos e diagnóstico diferencial com hematoma de cúpula ou infecção de sítio cirúrgico.",
          "trapAlert": "Solicitar histeroscopia diagnóstica ou curetagem de urgência na ausência de achados ultrassonográficos de restos placentários retidos."
        },
        "UNICAMP": {
          "howItCharges": "A **UNICAMP** cobra o diagnóstico diferencial entre endometrite e infecção de ferida operatória na parede abdominal, destacando que a ferida pode estar limpa enquanto a infecção primária reside na decídua endometrial.",
          "trapAlert": "Achar que a ausência de hiperemia ou secreção na incisão cirúrgica da cesárea descarta infecção puerperal."
        },
        "PSU-MG": {
          "howItCharges": "O **PSU-MG** destaca a interpretação laboratorial: leucocitose de até 25.000/mm³ é fisiológica no puerpério imediato devido ao estresse do parto, devendo o diagnóstico se basear na presença de desvio à esquerda e na Tríade de Bumm.",
          "trapAlert": "Fechar diagnóstico de infecção bacteriana apenas pela contagem isolada de leucócitos no 1º ou 2º DPO sem outros sinais flogísticos."
        },
        "AMRIGS": {
          "howItCharges": "A **AMRIGS** cobra nominalmente quais são os três sinais semiológicos constitutivos da clássica Tríade de Bumm.",
          "trapAlert": "Alternativas que trazem 'útero duro e retraído' como sinal de endometrite (o útero da endometrite é amolecido e atônico)."
        },
        "SUS-SP": {
          "howItCharges": "Cenário de puérpera admitida em UPA/PS com queixa de cólicas intensas e sangramento fétido após cesárea de urgência realizada há 5 dias.",
          "trapAlert": "Atrasar o início da antibioticoterapia parenteral para aguardar resultados de hemoculturas ou laudo tomográfico."
        }
      }
    },
    {
      "id": 3,
      "name": "Fatores de Risco & Profilaxia na Cesárea",
      "shortName": "Risco & Profilaxia",
      "percentage": 15.3,
      "questionCount": 38,
      "priority": "Alta",
      "color": "#EC4899",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "Cesárea é o maior fator isolado (risco 10-30x maior); Cefazolina na indução anestésica.",
      "focusExplanation": "A **operação cesariana é o principal fator de risco isolado** para endometrite puerperal, aumentando a incidência em **10 a 30 vezes** quando comparada ao parto vaginal espontâneo. Outros fatores de risco determinantes são: **trabalho de parto prolongado**, **bolsa rota prolongada (> 6 a 18 horas)**, múltiplos toques vaginais (> 5 exames), corioamnionite intraparto, anemia materna e desnutrição. A profilaxia padrão-ouro universal para todas as cesáreas consiste na administração de **Cefazolina 2g IV em dose única realizada 30 a 60 minutos antes da incisão cirúrgica** (ou na indução anestésica). Em pacientes obesas com peso ≥ 120 kg ou IMC ≥ 35 kg/m², a dose deve ser ajustada para **3g IV**.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Cesariana como maior fator isolado de risco (10-30x) e uso de Cefazolina 2g IV (3g se obesa) na indução anestésica para 100% das cesáreas.",
          "trapAlert": "Fazer o antibiótico profilático somente após o clampeamento do cordão umbilical (conduta antiga e revogada; hoje é antes da incisão cutânea)."
        },
        "ENARE": {
          "howItCharges": "O **ENARE** cobra a conduta profilática farmacológica padrão: qual antibiótico, via e momento exato de administração na cesárea eletiva ou de urgência.",
          "trapAlert": "Alternativas que propõem ampicilina oral preventiva pós-alta para todas as cesarianas."
        },
        "USP": {
          "howItCharges": "A **USP** exige a correlação entre rotura prematura de membranas ovulares prolongada (> 18h) e colonização bacteriana ascendente mista, além do ajuste de dose de Cefazolina para 3g em obesas.",
          "trapAlert": "Omitir a profilaxia em cesarianas com membranas íntegras fora de trabalho de parto (é mandatória em todas as cesáreas)."
        },
        "UNICAMP": {
          "howItCharges": "A **UNICAMP** avalia o risco cumulativo de múltiplos toques vaginais no período de dilatação e a importância da assepsia rigorosa e técnica operatória adequada.",
          "trapAlert": "Indicar Cefazolina profilática de rotina em partos vaginais eutócicos sem laceração grave de trajeto (não recomendada)."
        },
        "PSU-MG": {
          "howItCharges": "O **PSU-MG** formula questões comparativas de epidemiologia obstétrica: o risco relativo de infecção puerperal pós-cesárea vs. pós-parto normal.",
          "trapAlert": "Prescrever antibioticoterapia profilática prolongada por 48 horas de rotina pós-cesárea sem evidência de corioamnionite."
        },
        "AMRIGS": {
          "howItCharges": "A **AMRIGS** questiona qual a cefalosporina de escolha para profilaxia cirúrgica obstétrica (Cefazolina 1ª geração).",
          "trapAlert": "Optar por Cefepima ou Ceftriaxona para profilaxia cirúrgica primária em pacientes sem histórico de colonização resistente."
        },
        "SUS-SP": {
          "howItCharges": "O **SUS-SP** enfatiza as metas de segurança do paciente do Ministério da Saúde: checklist de cirurgia segura com checagem da infusão da Cefazolina antes do corte.",
          "trapAlert": "Não realizar repique intraoperatório de Cefazolina quando o procedimento ultrapassa 4 horas ou há sangramento superior a 1500 mL."
        }
      }
    },
    {
      "id": 4,
      "name": "Morbidade Febril Puerperal & Critérios",
      "shortName": "Morbidade Febril",
      "percentage": 10.4,
      "questionCount": 26,
      "priority": "Média",
      "color": "#8B5CF6",
      "trend": "estavel",
      "trendLabel": "🏛️ Clássico Estável",
      "takeaway": "Febre ≥ 38°C em 2 dias distintos entre o 2º e 10º dia pós-parto; aferição oral obrigatória.",
      "focusExplanation": "Pelo critério canônico internacional da US Joint Commission on Maternal Welfare e FIGO, define-se **Morbidade Febril Puerperal** como a presença de **temperatura corporal axilar ou oral ≥ 38,0°C**, registrada em **pelo menos 2 dias distintos**, entre o **2º e o 10º dia do pós-parto**, **excluindo-se obrigatoriamente as primeiras 24 horas**. Essa exclusão das primeiras 24h pós-parto é fundamental porque a elevação térmica precoce decorre frequentemente de **desidratação transitória, liberação de citocinas pelo estresse muscular do trabalho de parto e apojadura mamária fisiológica**. Quando a febre surge ou persiste a partir do 2º DPO, a etiologia bacteriana infecciosa (endometrite em > 70% dos casos) torna-se a principal hipótese diagnóstica.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Definição formal dos critérios: ≥ 38°C em 2 dias distintos entre o 2º e o 10º dia pós-parto, excluindo as primeiras 24 horas.",
          "trapAlert": "Considerar febre isolada nas primeiras 24 horas após o parto como infecção puerperal estabelecida (é habitualmente fisiológica)."
        },
        "ENARE": {
          "howItCharges": "O **ENARE** cobra a regra numérica de temperatura e dias para enquadramento formal de morbidade febril puerperal.",
          "trapAlert": "Considerar duas aferições térmicas feitas com poucas horas de intervalo no mesmo dia como critérios suficientes (exige dias distintos)."
        },
        "USP": {
          "howItCharges": "A **USP** coloca casos clínicos de curvas térmicas puerperais para o aluno identificar o momento exato em que a febre deixa de ser fisiológica e passa a configurar infecção puerperal.",
          "trapAlert": "Rotular apojadura mamária (febre baixa autolimitada em até 24h associada a mamas túrgidas bilaterais) como infecção que necessita de antibioticoterapia."
        },
        "UNICAMP": {
          "howItCharges": "A **UNICAMP** exige a busca ativa e sistemática dos 4 principais focos de febre no puerpério: Endométrio (endometrite), Parede abdominal (ferida cirúrgica), Mamas (mastite) e Trato urinário (ITU).",
          "trapAlert": "Iniciar antibioticoterapia empírica sem antes examinar as mamas, a ferida operatória e a urina da paciente."
        },
        "PSU-MG": {
          "howItCharges": "O **PSU-MG** diferencia a cronologia das causas infecciosas: primeiras 24h (apojadura/atelectasia); 3º ao 5º dia (endometrite/ferida); 2ª à 4ª semana (mastite puerperal).",
          "trapAlert": "Atribuir febre no 4º dia pós-parto à apojadura mamária (a apojadura ocorre no 2º ao 3º dia e não dura mais de 24 horas)."
        },
        "AMRIGS": {
          "howItCharges": "A **AMRIGS** questiona qual o valor de corte de temperatura corporal padronizado para morbidade puerperal (≥ 38,0°C).",
          "trapAlert": "Assinalar 37,8°C ou 38,5°C como pontos de corte oficiais do consenso de morbidade puerperal."
        },
        "SUS-SP": {
          "howItCharges": "O **SUS-SP** foca na vigilância epidemiológica hospitalar de infecções pós-parto e registro fidedigno em prontuário.",
          "trapAlert": "Dar alta à puérpera febril no 2º DPO acreditando ser apenas estresse puerperal."
        }
      }
    },
    {
      "id": 5,
      "name": "Mastite Puerperal: Diagnóstico & Conduta",
      "shortName": "Mastite Puerperal",
      "percentage": 8.0,
      "questionCount": 20,
      "priority": "Média",
      "color": "#F59E0B",
      "trend": "alta",
      "trendLabel": "🔥 Em Alta (2024-2026)",
      "takeaway": "S. aureus; Cefalexina ou Clavulin; contraindicação formal a suspender amamentação.",
      "focusExplanation": "A mastite puerperal é a infecção bacteriana do parênquima mamário que acomete preferencialmente entre a **2ª e a 4ª semanas pós-parto**. O agente etiológico clássico em mais de **85% a 90% dos casos é o *Staphylococcus aureus*** (sensível à oxacilina na comunidade), inoculado a partir da nasofaringe do recém-nascido através de fissuras ou microtraumas mamilares. Manifesta-se clinicamente por **eritema localizado em cunha (geralmente unilateral), calor, dor intensa e ingurgitamento**, acompanhados de febre alta (> 38,5°C) e calafrios. A droga de primeira linha é a **Cefalexina 500 mg VO de 6/6h** ou Amoxicilina + Clavulanato por 10 a 14 dias. **CONDUTA DE OURO DAS BANCAS:** É **PROIBIDO suspender a amamentação**; a manutenção do esvaziamento mamário frequente da mama afetada é pilar obrigatório do tratamento para prevenir formação de abscesso.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Agente principal (S. aureus), tratamento com Cefalexina oral e proibição formal de interromper o aleitamento materno (manter amamentação na mama doente).",
          "trapAlert": "Prescrever desmame, suspender a amamentação na mama afetada ou dar inibidores de prolactina (Cabergolina) é o erro mais punido em provas!"
        },
        "ENARE": {
          "howItCharges": "O **ENARE** apresenta lactante com 3 semanas de puerpério apresentando dor e placa hiperemiada na mama direita com febre de 39°C, questionando o antimicrobiano e a orientação sobre amamentação.",
          "trapAlert": "A banca sempre insere alternativa orientando a suspender o aleitamento e oferecer fórmula infantil temporariamente."
        },
        "USP": {
          "howItCharges": "A **USP** cobra o reconhecimento clínico do abscesso mamário (área de flutuação palpável ou coleção purulenta ecográfica), exigindo drenagem cirúrgica ou punção ecoguiada.",
          "trapAlert": "Realizar massagem compressiva vigorosa sobre coleção com ponto de flutuação evidente (risco de ruptura tecidual e disseminação)."
        },
        "UNICAMP": {
          "howItCharges": "A **UNICAMP** exige a distinção clínica precisa entre ingurgitamento mamário fisiológico (bilateral, difuso, afebril ou febrícula transitória) e mastite puerperal infecciosa (unilateral, em cunha, febre alta).",
          "trapAlert": "Prescrever antibiótico desnecessário para ingurgitamento mamário simples sem sinais de infecção bacteriana."
        },
        "PSU-MG": {
          "howItCharges": "O **PSU-MG** questiona qual o principal agente microbiano isolado nas mastites puerperais agudas (*Staphylococcus aureus*).",
          "trapAlert": "Confundir com *Streptococcus agalactiae* (GBS) ou *Escherichia coli* como agentes primários de mastite."
        },
        "AMRIGS": {
          "howItCharges": "A **AMRIGS** explora as orientações de pega correta da aréola pelo recém-nascido como medida profilática primária de fissuras mamilares e mastite.",
          "trapAlert": "Recomendar pomadas de antibiótico tópico nos mamilos durante o período de amamentação."
        },
        "SUS-SP": {
          "howItCharges": "O **SUS-SP** aborda o acolhimento na Unidade Básica de Saúde: incentivo à amamentação, prescrição de Cefalexina e analgesia com Ibuprofeno/Paracetamol.",
          "trapAlert": "Encaminhar para internação hospitalar terciária mastite inicial não complicada com bom estado geral."
        }
      }
    },
    {
      "id": 6,
      "name": "Demais Critérios & Diagnósticos Menores",
      "shortName": "Demais Aspectos",
      "percentage": 13.7,
      "questionCount": 34,
      "priority": "Média",
      "color": "#64748B",
      "trend": "estavel",
      "trendLabel": "🏛️ Tópicos Secundários",
      "takeaway": "Tromboflebite pélvica séptica, teste da heparina, sepse e indicações de curetagem.",
      "focusExplanation": "Reúne complicações puerperais graves e diagnósticos de exclusão na puérpera séptica refratária. O principal destaque em provas é a **Tromboflebite Pélvica Séptica (TPS)**: trombose séptica das veias ovarianas e plexos uterinos caracterizada por **febre em picos contínua e persistente após 48 a 72 horas de antibioticoterapia venosa adequada**, sem coleções purulentas detectáveis ao exame físico. O diagnóstico padrão de confirmação é o **Teste Terapêutico da Heparina**: defervescência térmica completa em 48 a 72 horas após início de Heparina venosa contínua ou HBPM plena associada à manutenção dos antibióticos. A TC ou RM pélvica contrastada evidencia falha de enchimento na veia ovariana (mais frequente à direita). Na suspeita de abscesso pélvico ou retenção maciça de restos, indica-se drenagem percutânea ou curetagem uterina criteriosa.",
      "bancaPatterns": {
        "Todas": {
          "howItCharges": "Febre puerperal persistente após 48-72h de antibióticos venosos sem foco evidente: suspeitar de Tromboflebite Pélvica Séptica e realizar Teste da Heparina.",
          "trapAlert": "Trocar empiricamente a classe do antibiótico sem considerar tromboflebite séptica ou sem solicitar TC de pelve."
        },
        "ENARE": {
          "howItCharges": "O **ENARE** relata paciente em uso de Clindamicina + Gentamicina há 4 dias sem melhora da febre diária e com exame ginecológico inocente, questionando a conduta diagnóstica-terapêutica.",
          "trapAlert": "Indicar laparotomia de urgência imediata sem evidência clínica ou tomográfica de peritonite ou perfuração uterina."
        },
        "USP": {
          "howItCharges": "A **USP** explora a fisiopatologia vascular da TPS: maior acometimento da veia ovariana direita pelo comprimento vascular aumentado, fluxo retrógrado e compressão mecânica pelo útero dextrorrotado.",
          "trapAlert": "Realizar curetagem uterina de rotina em útero séptico friável sem comprovação ecográfica de restos, pelo risco grave de perfuração e choque séptico."
        },
        "UNICAMP": {
          "howItCharges": "A **UNICAMP** cobra o reconhecimento da Síndrome do Choque Tóxico Estreptocócico pós-parto (*Streptococcus pyogenes* / GAS): progressão fulminante para choque distributivo e fasceíte necrotizante.",
          "trapAlert": "Retardar intervenção cirúrgica de controle de danos (histerectomia puerperal) quando há miometrite necrotizante e sepse refratária."
        },
        "PSU-MG": {
          "howItCharges": "O **PSU-MG** cobra o mecanismo de confirmação da TPS pelo Teste da Heparina (defervescência térmica rápida nas primeiras 48-72h de anticoagulação).",
          "trapAlert": "Acreditar que ultrassonografia transvaginal de rotina possui alta sensibilidade para trombose de veias ovarianas altas (TC contrastada é o padrão)."
        },
        "AMRIGS": {
          "howItCharges": "A **AMRIGS** foca no diagnóstico diferencial de infecções do sítio cirúrgico da cesárea: seroma, hematoma e abscesso de parede abdominal.",
          "trapAlert": "Não abrir a fáscia e não drenar ferida operatória com flutuação purulenta profunda."
        },
        "SUS-SP": {
          "howItCharges": "O **SUS-SP** cobra os critérios de sepse materna puerperal e protocolo de ressuscitação volêmica imediata com cristaloides (30 mL/kg nas primeiras 3h).",
          "trapAlert": "Atrasar o início de noradrenalina em puérpera em choque séptico mantendo PAM < 65 mmHg após prova de volume."
        }
      }
    }
  ],
  "bancaBreakdown": {
    "AMRIGS": {
      "banca": "AMRIGS",
      "totalQuestions": 5,
      "topSubfocos": [
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 3,
          "percentageInBanca": 60.0
        },
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 1,
          "percentageInBanca": 20.0
        },
        {
          "subfoco": "Complicações de Prótese: Infecção, Migração e Dor",
          "questionCount": 1,
          "percentageInBanca": 20.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "SUS-SP": {
      "banca": "SUS-SP",
      "totalQuestions": 5,
      "topSubfocos": [
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 3,
          "percentageInBanca": 60.0
        },
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 2,
          "percentageInBanca": 40.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "UNESP/HCFMB": {
      "banca": "UNESP/HCFMB",
      "totalQuestions": 8,
      "topSubfocos": [
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 4,
          "percentageInBanca": 50.0
        },
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 2,
          "percentageInBanca": 25.0
        },
        {
          "subfoco": "Tromboflebite Pélvica Séptica & Complicações",
          "questionCount": 2,
          "percentageInBanca": 25.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "UNICAMP/HC": {
      "banca": "UNICAMP/HC",
      "totalQuestions": 9,
      "topSubfocos": [
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 6,
          "percentageInBanca": 66.7
        },
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 2,
          "percentageInBanca": 22.2
        },
        {
          "subfoco": "Tromboflebite Pélvica Séptica & Complicações",
          "questionCount": 1,
          "percentageInBanca": 11.1
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "CERMAM": {
      "banca": "CERMAM",
      "totalQuestions": 5,
      "topSubfocos": [
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 2,
          "percentageInBanca": 40.0
        },
        {
          "subfoco": "Morbidade Febril Puerperal & Critérios",
          "questionCount": 2,
          "percentageInBanca": 40.0
        },
        {
          "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
          "questionCount": 1,
          "percentageInBanca": 20.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "Pontifícia Universidade Católica do Paraná": {
      "banca": "Pontifícia Universidade Católica do Paraná",
      "totalQuestions": 6,
      "topSubfocos": [
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 3,
          "percentageInBanca": 50.0
        },
        {
          "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
          "questionCount": 2,
          "percentageInBanca": 33.3
        },
        {
          "subfoco": "Complicações de Prótese: Infecção, Migração e Dor",
          "questionCount": 1,
          "percentageInBanca": 16.7
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "USP/HCRP": {
      "banca": "USP/HCRP",
      "totalQuestions": 5,
      "topSubfocos": [
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 2,
          "percentageInBanca": 40.0
        },
        {
          "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
          "questionCount": 2,
          "percentageInBanca": 40.0
        },
        {
          "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
          "questionCount": 1,
          "percentageInBanca": 20.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "INEP Revalida": {
      "banca": "INEP Revalida",
      "totalQuestions": 6,
      "topSubfocos": [
        {
          "subfoco": "Infecção Puerperal",
          "questionCount": 6,
          "percentageInBanca": 100.0
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "ENARE": {
      "banca": "ENARE",
      "totalQuestions": 42,
      "topSubfocos": [
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 16,
          "percentageInBanca": 38.1
        },
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 14,
          "percentageInBanca": 33.3
        },
        {
          "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
          "questionCount": 6,
          "percentageInBanca": 14.3
        },
        {
          "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
          "questionCount": 4,
          "percentageInBanca": 9.5
        },
        {
          "subfoco": "Morbidade Febril Puerperal & Critérios",
          "questionCount": 2,
          "percentageInBanca": 4.8
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "PSU-MG": {
      "banca": "PSU-MG",
      "totalQuestions": 24,
      "topSubfocos": [
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 9,
          "percentageInBanca": 37.5
        },
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 7,
          "percentageInBanca": 29.2
        },
        {
          "subfoco": "Morbidade Febril Puerperal & Critérios",
          "questionCount": 4,
          "percentageInBanca": 16.7
        },
        {
          "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
          "questionCount": 3,
          "percentageInBanca": 12.5
        },
        {
          "subfoco": "Demais Critérios & Diagnósticos Menores",
          "questionCount": 1,
          "percentageInBanca": 4.1
        }
      ],
      "predominantDifficulty": "Médio"
    },
    "USP": {
      "banca": "USP",
      "totalQuestions": 35,
      "topSubfocos": [
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 12,
          "percentageInBanca": 34.3
        },
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 11,
          "percentageInBanca": 31.4
        },
        {
          "subfoco": "Demais Critérios & Diagnósticos Menores",
          "questionCount": 5,
          "percentageInBanca": 14.3
        },
        {
          "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
          "questionCount": 4,
          "percentageInBanca": 11.4
        },
        {
          "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
          "questionCount": 3,
          "percentageInBanca": 8.6
        }
      ],
      "predominantDifficulty": "Difícil"
    },
    "UNICAMP": {
      "banca": "UNICAMP",
      "totalQuestions": 28,
      "topSubfocos": [
        {
          "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
          "questionCount": 11,
          "percentageInBanca": 39.3
        },
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "questionCount": 8,
          "percentageInBanca": 28.6
        },
        {
          "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
          "questionCount": 4,
          "percentageInBanca": 14.3
        },
        {
          "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
          "questionCount": 3,
          "percentageInBanca": 10.7
        },
        {
          "subfoco": "Morbidade Febril Puerperal & Critérios",
          "questionCount": 2,
          "percentageInBanca": 7.1
        }
      ],
      "predominantDifficulty": "Médio"
    }
  }
}
```

---

## 2. Morbidade Febril Puerperal: Critérios Diagnósticos & Diagnóstico Diferencial Imediato

### Definição Canônica Oficial (FEBRASGO / OMS)
A **Morbidade Febril Puerperal** é formalmente definida pela presença de:
* **Temperatura oral $\ge 38,0^\circ\text{C}$**
* Registrada em **pelo menos 2 dias diferentes**
* Durante os **primeiros 10 dias após o parto**
* **EXCLUÍDAS AS PRIMEIRAS 24 HORAS** pós-parto

> [!WARNING] Armadilha Clássica de Prova: Aferição Oral vs. Febre nas Primeiras 24 Horas
> 1. **Por que excluir as primeiras 24 horas?** Elevações térmicas discretas no primeiro dia decorrem frequentemente de desidratação, esforço muscular no trabalho de parto ou reação inflamatória reabsortiva fisiológica.
> 2. **Por que a aferição deve ser oral?** A temperatura axilar na puérpera é falseada pelo ingurgitamento vascular mamário e pela **apojadura** ("febre do leite"), registrando calor local sem febre sistêmica.

### Apojadura Mamária Fisiológica vs. Endometrite vs. Tromboflebite
O contraste imediato entre as afecções febris puerperais mais cobradas em provas é sintetizado na arquitetura comparativa abaixo:

```diff-diagnosis
{
  "diffId": "febre-puerperal-diagnosticos",
  "title": "Diagnóstico Diferencial da Febre no Puerpério",
  "entities": [
    {
      "name": "Apojadura Fisiológica",
      "period": "2º ao 4º dia pós-parto",
      "feverDuration": "Duração autolimitada < 24 horas",
      "uterineSigns": "Útero indolor em involução normal",
      "lochia": "Lóquios fisiológicos (rubros a serosos)",
      "hallmark": "Mamas difusamente túrgidas; puérpera em bom estado geral sem taquicardia",
      "keyConduct": "Conduta expectante: amamentação em livre demanda, sutiã de sustentação e compressas frias (crioterapia)"
    },
    {
      "name": "Endometrite Puerperal",
      "period": "2º ao 5º dia pós-parto",
      "feverDuration": "Persistente em picos elevados (≥ 38,0°C)",
      "uterineSigns": "Tríade de Bumm (subinvoluído, pastoso, doloroso à palpação)",
      "lochia": "Lóquios abundantes, achocolatados e fétidos",
      "hallmark": "Taquicardia precoce desproporcional à curva térmica; bacteremia polimicrobiana",
      "keyConduct": "Internação hospitalar obrigatória + Clindamicina 900mg IV 8/8h + Gentamicina 5mg/kg IV 24/24h"
    },
    {
      "name": "Mastite Puerperal",
      "period": "2ª a 3ª semana pós-parto",
      "feverDuration": "Picos febris elevados com calafrios",
      "uterineSigns": "Involução uterina fisiológica normal",
      "lochia": "Fisiológicos (lochia alba)",
      "hallmark": "Sinais flogísticos focais em cunha (dor, rubor, calor) em quadrante de uma mama",
      "keyConduct": "Cefalexina 500mg VO 6/6h por 10 a 14 dias + MANTER amamentação mandatória sob livre demanda"
    },
    {
      "name": "Tromboflebite Pélvica Séptica",
      "period": "5º ao 10º dia pós-parto",
      "feverDuration": "Febre em agulha refratária a 72h de antibioticoterapia",
      "uterineSigns": "Exame pélvico e ultrassonografia normais",
      "lochia": "Fisiológicos",
      "hallmark": "Curva térmica em picos diários contrastando com paciente afebril e bem-disposta entre os episódios",
      "keyConduct": "Teste terapêutico da Heparina (HNF ou Enoxaparina 1mg/kg 12/12h); apirexia em 48-72h sela o diagnóstico"
    }
  ]
}
```

---

## 3. Fatores de Risco & Prevenção: O Papel Determinante da Cesariana

A via de parto é o determinante isolado mais expressivo na patogênese infecciosa: o **parto cesáreo eleva em 10 a 30 vezes o risco de endometrite** em comparação com o parto vaginal eutócico.

```clinical-scheme
{
  "type": "bipolar",
  "badge": "Diretriz FEBRASGO / CDC",
  "leftColumn": {
    "title": "FATORES DE RISCO (Aumentam Incidência)",
    "items": [
      "Parto Cesáreo de Emergência: Risco 10 a 30 vezes superior ao parto vaginal eutócico.",
      "Bolsa Rota Prolongada (> 6 a 18 horas) e Trabalho de Parto arrastado.",
      "Toques Vaginais Repetidos (≥ 5 toques intraparto elevam inoculação bacteriana).",
      "Anemia Materna (Hb < 10 g/dL), Obesidade mórbida e líquido amniótico meconial."
    ],
    "alert": "A cesariana intraparto é o principal fator de risco independente cobrado em provas!"
  },
  "rightColumn": {
    "title": "PROFILAXIA EFETIVA & BOAS PRÁTICAS",
    "items": [
      "Antibioticoprofilaxia Universal: Cefazolina 2g IV (ou 3g se peso ≥ 120 kg) 30 a 60 min ANTES da incisão na pele.",
      "Azitromicina 500mg IV Adjuvante: Recomendada em cesáreas não eletivas intraparto (ACOG).",
      "Antissepsia Dupla: Clorexidina alcoólica a 2% no abdome e preparo vaginal prévio.",
      "Dequitação Espontânea: Tração controlada de cordão (abolição formal da curagem manual de rotina)."
    ],
    "alert": "A profilaxia com Cefazolina deve ser feita na indução anestésica; NUNCA aguardar o clampeamento!"
  }
}
```


---

## 4. Endometrite Puerperal: Tríade de Bumm & Triagem de Sepse Materna

A **Endometrite** é a causa mais comum de infecção puerperal (~85% dos casos). Inicia-se no leito de inserção placentária e ascende para a decídua e miométrio (endomiometrite).

### O Quadro Clínico Clássico: A Tríade de Bumm
A identificação clínica em provas fundamenta-se nos achados da semiologia obstétrica:

$$\text{Endometrite Puerperal} \implies \begin{cases} \text{1. Febre persistente com taquicardia} \\ \text{2. Útero subinvoluído, doloroso e amolecido} \\ \text{3. Lóquios achocolatados com odor fétido} \end{cases}$$

1. **Febre em Picos ($\ge 38,0^\circ\text{C}$):** Tipicamente instalada entre o 2º e o 5º dia pós-parto, acompanhada de taquicardia materna precoce desproporcional.
2. **Subinvolução Uterina Dolorosa:** O útero não regride na velocidade fisiológica esperada (o normal é regredir cerca de $1\text{ cm por dia}$ após o parto). À palpação bimanual, o fundo uterino é doloroso e pastoso.
3. **Loquiação Anormal:** Lóquios abundantes, de coloração escura/achocolatada e odor intensamente fétido.
   * *Atenção:* Em infecções causadas por *Streptococcus pyogenes* (Strepto do Grupo A), os lóquios podem ser escassos e sem odor ("endometrite inodora"), porém o quadro sistêmico é fulminante com bacteremia precoce.

![**[Achado Visual Cardinal]**: Endométrio espessado e heterogêneo com múltiplos focos hiperecogênicos puntiformes e sombra acústica suja compatível com gás intrauterino. • **[Diagnóstico Associado]**: Endometrite puerperal bacteriana com colonização mista anaeróbia. • **[Ponto Crítico de Prova]**: A presença isolada de gás antes do 5º dia pós-cesárea pode ser iatrogênica transitória; só firma diagnóstico quando correlacionada com febre persistente e Tríade de Bumm!](/images/clinical/endometrite_usg.jpg)


### Microbiologia Polimicrobiana Ascendente
A infecção puerperal intrauterina é de caráter **polimicrobiano misto**, envolvendo microrganismos aeróbios e anaeróbios provenientes do trato genital inferior:
* **Anaeróbios Obrigatórios (50% a 80%):** *Bacteroides fragilis*, *Peptostreptococcus*, *Prevotella bivia*.
* **Gram-Negativos Entéricos Facultativos (30% a 50%):** *Escherichia coli*, *Klebsiella pneumoniae*, *Proteus mirabilis*.
* **Gram-Positivos (30% a 40%):** *Streptococcus agalactiae* (EGB), *Enterococcus faecalis*, *Staphylococcus epidermidis*.

> [!WARNING] Armadilha Clássica de Prova: Não Aguardar Culturas Vaginais
> A coleta de swab de secreção vaginal ou endocervical **NÃO tem utilidade diagnóstica** na endometrite pós-parto, pois as amostras são inevitavelmente contaminadas pela flora comensal. O diagnóstico é puramente clínico e o início da antibioticoterapia é imediato e empírico. Hemoculturas são solicitadas apenas em caso de choque séptico ou ausência de melhora após 48 horas.

### Triagem de Sepse Obstétrica: Escore MEOWS & Pacote da 1ª Hora
As alterações hemodinâmicas fisiológicas do puerpério (leucocitose de até 25.000/$\text{mm}^3$, taquicardia leve) invalidam o qSOFA clássico. As diretrizes FEBRASGO e da OMS preconizam a utilização de escores de alerta precoce obstétrico:

```clinical-score
{
  "scoreId": "meows-puerperal-sepsis",
  "title": "MEOWS: Escore de Alerta Precoce Obstétrico / Sepse Puerperal",
  "parameters": [
    {
      "parameter": "Frequência Cardíaca",
      "normalRange": "60 a 99 bpm",
      "alertTrigger": "≥ 110 bpm ou < 50 bpm",
      "clinicalMeaning": "Taquicardia persistente é o marcador precoce mais sensível de bacteremia puerperal"
    },
    {
      "parameter": "Frequência Respiratória",
      "normalRange": "12 a 20 irpm",
      "alertTrigger": "≥ 25 irpm ou < 10 irpm",
      "clinicalMeaning": "Taquipneia reflete acidose metabólica compensatória por hiperlactatemia"
    },
    {
      "parameter": "Pressão Arterial Sistólica",
      "normalRange": "100 a 139 mmHg",
      "alertTrigger": "< 90 mmHg ou ≥ 160 mmHg",
      "clinicalMeaning": "Hipotensão define choque distributivo séptico e hipoperfusão tecidual"
    },
    {
      "parameter": "Temperatura Oral",
      "normalRange": "36,0°C a 37,4°C",
      "alertTrigger": "≥ 38,5°C ou < 35,5°C",
      "clinicalMeaning": "Hipotermia materna está associada a sepse grave refratária de pior prognóstico"
    },
    {
      "parameter": "Estado Neurológico",
      "normalRange": "Alerta e orientada",
      "alertTrigger": "Sonolência, confusão ou agitação",
      "clinicalMeaning": "Disfunção neurológica aguda decorrente de hipoperfusão cerebral"
    }
  ],
  "actionThreshold": {
    "triggerCondition": "Presença de 1 parâmetro com alerta vermelho ou 2 com alerta amarelo",
    "bundleProtocol": "PACOTE DA 1ª HORA (Hour-1 Bundle)",
    "mandatorySteps": [
      "1. Dosagem imediata de Lactato Sérico (repetir em 2 a 4h se ≥ 2 mmol/L)",
      "2. Coleta de 2 pares de Hemoculturas antes da antibioticoterapia venosa",
      "3. Início de Antibioticoterapia Venosa de Amplo Espectro na PRIMEIRA HORA",
      "4. Ressuscitação volêmica com Cristaloide (30 mL/kg em 3h) se PAS < 90 mmHg ou Lactato ≥ 4 mmol/L",
      "5. Iniciar Vasopressor precoce (Noradrenalina de escolha) para manter PAM ≥ 65 mmHg se hipotensão refratária"
    ]
  }
}
```

---

## 5. Esquema Antibiótico Padrão-Ouro & Tempo de Tratamento

### Esquema de Primeira Escolha Hospitalar
O tratamento da endometrite puerperal exige internação hospitalar e antibioticoterapia intravenosa de amplo espectro:

| Fármaco | Posologia Recomendada | Espectro Antimicrobiano Coberto |
| :--- | :--- | :--- |
| **Clindamicina** | **900 mg IV a cada 8 horas** | Anaeróbios estritos (inclusive *Bacteroides*) + Cocos Gram-positivos |
| **Gentamicina** | **5 mg/kg IV em dose única diária** (ou $1,5\text{ mg/kg}$ IV 8/8h) | Bacilos Gram-negativos entéricos facultativos (*E. coli*, *Klebsiella*) |

### Esquemas Alternativos e Adições
* **Adição de Ampicilina (2g IV 6/6h):** Deve ser associada ao esquema de Clindamicina + Gentamicina quando houver **suspeita de infecção por *Enterococcus faecalis*** (puérperas graves, instrumentadas, com toques múltiplos) ou se a paciente mantiver febre após 48 a 72 horas de tratamento inicial.
* **Monoterapia de Amplo Espectro:** Amoxicilina + Clavulanato IV, Ampicilina + Sulbactam IV ou Cefoxitina IV são opções aceitas em protocolos institucionais.
* **Alergia Severa à Penicilina / Clindamicina:** Gentamicina + Metronidazol 500mg IV 8/8h.

### Duração do Tratamento & Critério de Alta Hospitalar
* **Quando suspender a antibioticoterapia venosa?**
  * A antibioticoterapia intravenosa deve ser mantida até que a puérpera permaneça **afebril e assintomática por 48 horas consecutivas**, com normalização do trânsito intestinal e redução da dor uterina.
* **É necessário passar para antibiótico oral após a alta?**
  * **NÃO!** As diretrizes internacionais (ACOG, CDC) e a FEBRASGO são unânimes: **não há benefício clínico em prescrever antibióticos orais ambulatoriais** para casa após o alcance da cura clínica hospitalar venosa.

---

## 6. O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)

| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |
| :--- | :--- | :--- | :--- |
| **Momento da Cefazolina Profilática na Cesárea** | Administrada apenas *após o clampeamento do cordão umbilical*, temendo depressão neonatal ou alteração de culturas no recém-nascido. | **Administrada 30 a 60 minutos ANTES da incisão cirúrgica (na indução anestésica).** Ensaios clínicos demonstraram redução de 50% na endometrite sem impacto adverso no neonato. | **FEBRASGO (2024) / ACOG Practice Bulletin** |
| **Dose de Cefazolina na Puérpera Obesa** | Dose padrão fixa de 2g IV para todas as pacientes, independentemente da massa corporal. | **Cefazolina 3g IV** para gestantes com peso $\ge 120\text{ kg}$ ou $\text{IMC} \ge 35\text{ kg/m}^2$, garantindo concentração tecidual bactericida no tecido adiposo. | **CDC / FEBRASGO (2023-2025)** |
| **Posologia da Gentamicina na Endometrite** | Fracionamento em 3 tomadas diárias ($1,5\text{ mg/kg}$ IV a cada 8 horas). | **Dose única diária ($5\text{ mg/kg}$ IV a cada 24 horas).** Mesma eficácia bactericida por efeito pico-dependente e menor taxa de nefro/ototoxicidade materna. | **Williams Obstetrícia 26ª ed. / FEBRASGO** |
| **Antibioticoterapia Pós-Alta** | Prescrição de 7 a 10 dias de cefalexina ou amoxicilina oral após a alta hospitalar. | **Suspensão completa após 48 horas afebril e assintomática.** Prescrição oral ambulatorial foi formalmente abandonada por selecionar resistência bacteriana. | **ACOG / FEBRASGO Consensos Recentes** |

> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:
> Se a questão do concurso afirmar que a Cefazolina profilática na cesárea deve ser infundida "logo após o obstetra clampear o cordão umbilical", considere a assertiva **INCORRETA**. As bancas contemporâneas cobram a administração de 30 a 60 minutos antes da incisão na pele (indução anestésica).

---

## 7. Febre Persistente após 48 a 72 Horas: Algoritmo Decisório Sequencial

Quando a puérpera tratada com Clindamicina + Gentamicina mantém picos febris após 48 a 72 horas de medicação, a investigação etiológica deve seguir uma ordem lógica rigorosa:

### Passo a Passo da Cascata Decisória

```clinical-scheme
{
  "type": "pipeline",
  "title": "Pipeline de Investigação da Febre Puerperal Persistente (> 48-72h de ATB)",
  "subtitle": "Sequência lógica armada obrigatória diante de falha do esquema Clindamicina + Gentamicina",
  "badge": "Diretriz ACOG / FEBRASGO",
  "steps": [
    {
      "badge": "Etapa 1 • Exame Inicial de Escolha",
      "title": "Ultrassonografia Pélvica & Hemoculturas",
      "items": [
        "Coleta imediata de 2 pares de hemoculturas e urinocultura.",
        "USG Pélvica / Transvaginal: Avaliar espessamento endometrial, restos ovulares e coleções.",
        "Hematoma de parede ou abscesso incisional superficial / subaponeurótico."
      ],
      "alert": "A presença de gás na cavidade antes do 5º dia pode ser fisiológica pós-cesárea; correlacionar com clínica!"
    },
    {
      "badge": "Etapa 2 • Resolução Anatômica / Coleções",
      "title": "Tomografia Computadorizada de Pelve com Contraste",
      "items": [
        "Padrão-ouro para mapear abscessos profundos e flegmões parametrais.",
        "Mapeamento de trombos nas veias ovarianas e veia cava inferior.",
        "Indicação de drenagem percutânea guiada por TC/USG se coleção > 5 cm."
      ],
      "alert": "Coleção pélvica volumosa não responde apenas a antibiótico sistêmico; requer drenagem dirigida!"
    },
    {
      "badge": "Etapa 3 • Diagnóstico de Exclusão",
      "title": "Teste Terapêutico com Heparina (TPS)",
      "items": [
        "Suspeita de Tromboflebite Pélvica Séptica: Febre em picos com paciente em bom estado geral.",
        "Exclusão de abscessos e coleções à tomografia.",
        "Heparina Plena (HNF ou HBPM) associada a antibióticos de amplo espectro."
      ],
      "alert": "Afebril em 48-72h após heparina confirma o diagnóstico clínico de TPS sem necessidade de outro exame!"
    }
  ]
}
```


* **Passo 1 (Exame Físico Focado):** **[Ponto Principal]:** Inspecionar a incisão cirúrgica da cesárea ou episiorrafia, procurando abaulamento, eritema, hipertermia local, crepitação ou secreção purulenta (pesquisa de celulite, abscesso de parede abdominal ou fasciíte necrotizante).
* **Passo 2 (Exame de Imagem Dirigido):** **[Ponto Principal]:** Realizar Ultrassonografia Pélvica Transvaginal ou Tomografia Computadorizada de Abdome e Pelve para descartar restos placentários retidos, hematomas infectados, abscesso de fundo de saco de Douglas ou flegmão de ligamento largo.
* **Passo 3 (Regra de Segurança para Restos Placentários):** **[Ponto Principal]:** Diante de restos ovulares infectados, **é contraindicado curetar de imediato sem cobertura antibiótica prévia**. Deve-se aguardar pelo menos **4 a 6 horas de impregnação antimicrobiana venosa** e estabilização para realizar o esvaziamento uterino (usar cureta romba grande de Romani ou AMIU com máxima suavidade, pelo altíssimo risco de perfuração do miométrio miomalácico).
* **Passo 4 (Ampliação Antimicrobiana):** **[Ponto Principal]:** Adicionar **Ampicilina 2g IV a cada 6 horas** ao esquema de Clindamicina + Gentamicina para cobrir *Enterococcus faecalis* resistente aos fármacos originais.
* **Passo 5 (Hipótese de Tromboflebite Pélvica Séptica):** **[Ponto Principal]:** Diante de puérpera com febre persistente em picos ("em agulha"), taquicardia acentuada e exame físico pélvico e ultrassonografia normais, suspeitar de **Tromboflebite Pélvica Séptica (TPS)** e iniciar o **Teste Terapêutico da Heparina** (apirexia nas próximas 48 a 72 horas confirma a hipótese).

### Conduta nas Complicações Pélvicas Cirúrgicas Específicas
* **Flegmão do Ligamento Largo (Parametrite / Celulite Pélvica):** Induração dolorosa unilateral que se estende do colo uterino até a parede lateral da pelve. O tratamento é **estritamente clínico/conservador** com antibioticoterapia venosa prolongada (não se opera a menos que haja formação de abscesso evidente).
* **Abscesso de Fundo de Saco de Douglas:** Diagnóstico ao toque bimanual e imagem; conduta preferencial é a **drenagem por colpotomia posterior**.
* **Indicações Formais de Histerectomia Puerperal de Urgência:**
  1. Microabscessos miometriais múltiplos refratários;
  2. Necrose miometrial extensa / gangrena gasosa (*Clostridium* / Síndrome de Mondor);
  3. Sepse grave com falência multiorgânica refratária ao tratamento clínico e debridamento.

---

## 8. Diagnósticos Diferenciais Extragenitais no Puerpério

![**[Achado Visual Cardinal]**: Eritema inflamatório cutâneo bem delimitado em disposição em cunha em quadrante mamário, sem ponto de flutuação palpável. • **[Diagnóstico Associado]**: Mastite puerperal aguda estafilocócica em fase flegmonosa. • **[Ponto Crítico de Prova]**: A presença de mastite febril NÃO contraindica o aleitamento materno; a amamentação deve ser obrigatoriamente mantida sob livre demanda!](/images/clinical/mastite_puerperal.jpg)


A febre no puerpério nem sempre se origina na cavidade uterina. O exame clínico minucioso deve distinguir os seguintes sítios infecciosos:

| Patologia | Agente Etiológico Típico | Quadro Clínico de Prova | Conduta Homologada |
| :--- | :--- | :--- | :--- |
| **Mastite Puerperal** | *Staphylococcus aureus* (adquirido da nasofaringe do recém-nascido) | Sinais flogísticos localizados em quadrante mamário (dor, calor, rubor, edema em cunha) + febre alta e calafrios (2ª a 3ª semana pós-parto). | **Cefalexina 500mg VO 6/6h** ou Amoxicilina-Clavulanato por 10-14 dias.<br>🚫 **Regra de Ouro (Protocolo ABM #36):** **MANTER AMAMENTAÇÃO MANDATÓRIA** em livre demanda. Contraindicadas massagens vigorosas e hiperordenha mecânica (pioram edema ductal). Crioterapia e AINEs para desinflamar. |
| **Abscesso Mamário** | *Staphylococcus aureus* | Mastite complicada com massa flutuante dolorosa à palpação mamária. | **Drenagem cirúrgica ou aspiração por agulha guiada por USG** + Antibioticoterapia venosa. Manter amamentação na mama contralateral sã. |
| **Infecção de Ferida Cirúrgica (Cesárea)** | *Staphylococcus aureus*, *Enterobacteriaceae* | Febre após o 4º-7º DPO com dor incisional, hiperemia de bordas e drenagem de exsudato purulento pela cicatriz cirúrgica. | Abertura dos pontos cirúrgicos, drenagem da secreção, desbridamento de tecidos desvitalizados e curativos úmidos. Antibiótico se celulite adjacente. |
| **Deiscência / Infecção de Episiorrafia** | Polimicrobiana (flora vaginal e perineal) | Dor perineal intensa, edema, saída de secreção purulenta e afastamento dos bordos da sutura no períneo. | Abertura de suturas infectadas, desbridamento, limpeza mecânica e antibioticoterapia. Estando o leito limpo e com tecido de granulação são, indica-se **ressutura secundária precoce** (não aguardar cicatrização por 2ª intenção). |
| **Fasciíte Necrosante** | Polimicrobiana (Gram-negativos + Anaeróbios + *S. pyogenes*) | Eritema com flictenas hemorrágicas, anestesia cutânea focal, crepitação subcutânea e choque séptico fulminante. | **Emergência Cirúrgica Extrema:** Desbridamento cirúrgico radical e agressivo em centro cirúrgico + Meropenem + Vancomicina + Clindamicina IV. |
| **Infecção do Trato Urinário (Pielonefrite)** | *Escherichia coli* (> 80%) | Febre, calafrios, disúria, polaciúria e **Sinal de Giordano positivo** (dor à punho-percussão lombar). | Urocultura + Ceftriaxona 1g IV ao dia ou Ciprofloxacino (se não lactante). Rastreio obrigatório após cateterismo vesical. |
| **Atelectasia Pulmonar** | Mecânica / Hipoventilação pós-anestésica | Febre baixa nas primeiras 24 a 48 horas pós-cesárea com diminuição de murmúrio vesicular nas bases. | Fisioterapia respiratória, tosse assistida e deambulação precoce; dispensados antibióticos. |

---

## 9. Diretrizes Oficiais & Consensos de Referência

1. **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** *Protocolos de Conduta em Infecções Puerperais e Choque Séptico em Obstetrícia* (Comissão Nacional Especializada em Urgências Obstétricas, 2022–2025).
2. **Ministério da Saúde do Brasil:** *Cadernos de Atenção Básica nº 32 - Atenção ao Pré-Natal e Puerpério* e *Manual de Gestação de Alto Risco* (Secretaria de Atenção Primária à Saúde).
3. **American College of Obstetricians and Gynecologists (ACOG):** Practice Bulletin nº 195 (*Prevention of Infection After Gynecologic and Obstetric Surgery*) e Practice Bulletin nº 211 (*Critical Care in Obstetrics*).
4. **Academy of Breastfeeding Medicine (ABM):** Clinical Protocol #36 (*The Mastitis Spectrum*, Revised 2022/2023).
5. **Surviving Sepsis Campaign / FEBRASGO:** *International Guidelines for Management of Sepsis and Septic Shock in Obstetric Patients*.
6. **Centers for Disease Control and Prevention (CDC):** *Guideline for the Prevention of Surgical Site Infection* (Atualizações pós-operatórias em obstetrícia).
7. **Williams Obstetrics:** Cunningham FG, Leveno KJ, Bloom SL, et al. *Williams Obstetrics*, 26th Edition. McGraw-Hill Education (Capítulo 37: Puerperal Infections).
8. **World Health Organization (WHO):** *WHO recommendations for prevention and treatment of maternal peripartum infections* (Genebra, Suíça).
