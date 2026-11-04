import json

data_path = r'c:\bancoresidencia\bancoresidencia\data\analytics\infeccao-puerperal.json'

with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Slices com enriquecimento de Imagem 3 (focusExplanation) e Como a Banca Cobra (bancaPatterns)
slices_data = [
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
]

# Mantém auditQuestionIds originais
for new_s in slices_data:
    for old_s in data.get('donutSlices', []):
        if old_s.get('id') == new_s['id'] and 'auditQuestionIds' in old_s:
            new_s['auditQuestionIds'] = old_s['auditQuestionIds']
            break

data['donutSlices'] = slices_data

# Enriquece bancaBreakdown
bb = data.get('bancaBreakdown', {})

bb['ENARE'] = {
    "banca": "ENARE",
    "totalQuestions": 42,
    "topSubfocos": [
        {"subfoco": "Antibioticoterapia na Infecção Puerperal", "questionCount": 16, "percentageInBanca": 38.1},
        {"subfoco": "Endometrite Puerperal: Diagnóstico & Clínica", "questionCount": 14, "percentageInBanca": 33.3},
        {"subfoco": "Fatores de Risco & Profilaxia na Cesárea", "questionCount": 6, "percentageInBanca": 14.3},
        {"subfoco": "Mastite Puerperal: Diagnóstico & Conduta", "questionCount": 4, "percentageInBanca": 9.5},
        {"subfoco": "Morbidade Febril Puerperal & Critérios", "questionCount": 2, "percentageInBanca": 4.8}
    ],
    "predominantDifficulty": "Médio"
}

bb['PSU-MG'] = {
    "banca": "PSU-MG",
    "totalQuestions": 24,
    "topSubfocos": [
        {"subfoco": "Endometrite Puerperal: Diagnóstico & Clínica", "questionCount": 9, "percentageInBanca": 37.5},
        {"subfoco": "Antibioticoterapia na Infecção Puerperal", "questionCount": 7, "percentageInBanca": 29.2},
        {"subfoco": "Morbidade Febril Puerperal & Critérios", "questionCount": 4, "percentageInBanca": 16.7},
        {"subfoco": "Fatores de Risco & Profilaxia na Cesárea", "questionCount": 3, "percentageInBanca": 12.5},
        {"subfoco": "Demais Critérios & Diagnósticos Menores", "questionCount": 1, "percentageInBanca": 4.1}
    ],
    "predominantDifficulty": "Médio"
}

bb['USP'] = {
    "banca": "USP",
    "totalQuestions": 35,
    "topSubfocos": [
        {"subfoco": "Antibioticoterapia na Infecção Puerperal", "questionCount": 12, "percentageInBanca": 34.3},
        {"subfoco": "Endometrite Puerperal: Diagnóstico & Clínica", "questionCount": 11, "percentageInBanca": 31.4},
        {"subfoco": "Demais Critérios & Diagnósticos Menores", "questionCount": 5, "percentageInBanca": 14.3},
        {"subfoco": "Fatores de Risco & Profilaxia na Cesárea", "questionCount": 4, "percentageInBanca": 11.4},
        {"subfoco": "Mastite Puerperal: Diagnóstico & Conduta", "questionCount": 3, "percentageInBanca": 8.6}
    ],
    "predominantDifficulty": "Difícil"
}

bb['UNICAMP'] = {
    "banca": "UNICAMP",
    "totalQuestions": 28,
    "topSubfocos": [
        {"subfoco": "Endometrite Puerperal: Diagnóstico & Clínica", "questionCount": 11, "percentageInBanca": 39.3},
        {"subfoco": "Antibioticoterapia na Infecção Puerperal", "questionCount": 8, "percentageInBanca": 28.6},
        {"subfoco": "Fatores de Risco & Profilaxia na Cesárea", "questionCount": 4, "percentageInBanca": 14.3},
        {"subfoco": "Mastite Puerperal: Diagnóstico & Conduta", "questionCount": 3, "percentageInBanca": 10.7},
        {"subfoco": "Morbidade Febril Puerperal & Critérios", "questionCount": 2, "percentageInBanca": 7.1}
    ],
    "predominantDifficulty": "Médio"
}

data['bancaBreakdown'] = bb

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('JSON data successfully updated!')

# Agora atualiza também no studyMaterialsData.ts
study_path = r'c:\bancoresidencia\bancoresidencia\src\data\studyMaterialsData.ts'
with open(study_path, 'r', encoding='utf-8') as f:
    content = f.read()

p = content.find('infeccao-puerperal')
idx_start = content.rfind('```exam-stats', 0, p)
if idx_start != -1:
    idx_end = content.find('```', idx_start + 13)
    if idx_end != -1:
        # Prepara objeto enxuto para o exam-stats do markdown
        exam_stats_obj = {
            "focusSlug": data["focusSlug"],
            "specialty": data["specialty"],
            "theme": data["theme"],
            "focus": data["focus"],
            "totalQuestions": data["totalQuestions"],
            "timeframeRange": data["timeframeRange"],
            "donutSlices": [
                {k: v for k, v in s.items() if k != 'auditQuestionIds'}
                for s in data["donutSlices"]
            ],
            "bancaBreakdown": data["bancaBreakdown"]
        }
        
        new_json_str = json.dumps(exam_stats_obj, ensure_ascii=False, indent=2)
        new_block = f"```exam-stats\n{new_json_str}\n```"
        
        content = content[:idx_start] + new_block + content[idx_end + 3:]
        
        with open(study_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('studyMaterialsData.ts successfully updated with new exam-stats block!')
    else:
        print('Could not find end of exam-stats block')
else:
    print('Could not find exam-stats block before infeccao-puerperal')
