import { SpecialtyHierarchy } from "@/types";

export const cirurgiaHierarchy: SpecialtyHierarchy = {
  "especialidade": "Cirurgia Geral",
  "temas": [
    {
        "tema": "Trauma e Atendimento Inicial",
        "focos": [
            {
                "foco": "Avaliação Inicial e Via Aérea no Trauma (A do ATLS)",
                "subfocos": [
                    {
                        "subfoco": "Sistematização do Exame Primário (ABCDE do ATLS)",
                        "sub_subfocos": [
                            "A: Via Aérea com Controle Cervical (Colar Cervical e Prancha Rígida)",
                            "B: Respiração e Ventilação; C: Circulação e Controle da Hemorragia; D: Incapacidade e Estado Neurológico; E: Exposição com Controle de Hipotermia"
                        ]
                    },
                    {
                        "subfoco": "Via Aérea Definitiva e Via Aérea Difícil no Trauma",
                        "sub_subfocos": [
                            "Sequência de Prioridades e Reavaliação Contínua",
                            "Indicações Formais de Via Aérea Definitiva: Apneia, Glasgow <= 8, Fraturas Faciais Graves, Queimadura de Vias Aéreas",
                            "Intubação Orotraqueal com Estabilização Cervical Manual em Linha",
                            "Cricotireoidostomia Cirúrgica como Via Aérea Cirúrgica de Escolha no Trauma (\"Não Intubo, Não Ventilo\") vs Traqueostomia"
                        ]
                    }
                ]
            },
            {
                "foco": "Trauma Torácico com Risco Iminente de Morte (Pneumotórax Hipertensivo/Aberto, Hemotórax Maciço, Tamponamento)",
                "subfocos": [
                    {
                        "subfoco": "Pneumotórax Hipertensivo e Pneumotórax Aberto",
                        "sub_subfocos": [
                            "Pneumotórax Hipertensivo: Diagnóstico Clínico Imediato (Hipotensão, Turgência Jugular, Murmúrio Vesicular Abolido e Desvio de Traqueia) - Jamais Aguardar Radiografia"
                        ]
                    },
                    {
                        "subfoco": "Hemotórax Maciço e Tamponamento Cardíaco",
                        "sub_subfocos": [
                            "Descompressão Imediata por Toracostomia com Agulha (5º EIC na Linha Axilar Anterior ou 2º EIC na Linha Hemiclavicular) seguida de Drenagem Tubular em Selo d'Água",
                            "Pneumotórax Aberto: Curativo de 3 Pontas Provisório e Drenagem em Sítio Cirúrgico Distante",
                            "Hemotórax Maciço: Drenagem Torácica Imediata > 1.500 mL de Sangue ou > 200-300 mL/hora por 2-4 Horas Consecutivas = Indicação de Toracotomia de Urgência",
                            "Tamponamento Cardíaco: Tríade de Beck (Hipotensão, Hipofonese de Bulhas e Turgência Jugular) e Janela Subxifoide / Toracotomia de Emergência"
                        ]
                    },
                    {
                        "subfoco": "Tórax Instável e Contusão Pulmonar",
                        "sub_subfocos": [
                            "Fratura de 2 ou Mais Costelas Consecutivas em pelo menos 2 Pontos com Respiração Paradoxal"
                        ]
                    }
                ]
            },
            {
                "foco": "Trauma Abdominal Contuso e Penetrante (FAST e Laparotomia)",
                "subfocos": [
                    {
                        "subfoco": "Avaliação por FAST e Lavado Peritoneal Diagnóstico",
                        "sub_subfocos": [
                            "Tratamento Centrado na Analgesia Agressiva (Bloqueio Epidural), Fisioterapia Respiratória e Ventilação Mecânica se Necessário",
                            "E-FAST: Avaliação dos 4 Espaços Anatômicos (Hepatorrenal / Morrison, Esplenorrenal, Pelve / Suprapúbico e Subxifoide / Pericárdico) + Janelas Apicais Pleurais"
                        ]
                    },
                    {
                        "subfoco": "Trauma Penetrante: Arma Branca vs Arma de Fogo",
                        "sub_subfocos": [
                            "Paciente Instável com FAST Positivo = Laparotomia Exploradora Imediata sem Perda de Tempo com TC",
                            "Paciente Estável com Trauma Fechado = Tomografia de Abdome com Contraste Venoso",
                            "Ferimento por Arma de Fogo com Trajeto Abdominal = Laparotomia Exploradora Mandatória (> 90% de Lesões Viscerais)",
                            "Ferimento por Arma Branca: Exploração Digital da Ferida sob Anestesia Local; se Fáscia Íntegra -> Alta; se Fáscia Violada - > Observação Seriada por 24h ou Laparotomia se Peritonite"
                        ]
                    },
                    {
                        "subfoco": "Trauma de Baço e Fígado (Manejo Não Operatório - MNO)",
                        "sub_subfocos": [
                            "Critérios de MNO: Paciente Hemodinamicamente Estável, Ausência de Sinais de Peritonite e Disponibilidade de UTI / Cirurgião de Plantão"
                        ]
                    }
                ]
            },
            {
                "foco": "Trauma Cranioencefálico (TCE Leve, Moderado e Grave)",
                "subfocos": [
                    {
                        "subfoco": "Hematoma Extradural vs Hematoma Subdural Agudo",
                        "sub_subfocos": [
                            "Angioembolização em Lesões de Alto Grau com \"Blush\" Arterial de Contraste na TC",
                            "Hematoma Extradural / Epidural: Rotura da Artéria Meníngea Média, História de \"Intervalo Lúcido\", TC com Imagem Biconvexa / Hiperdensa que Respeita as Suturas Cranianas",
                            "Hematoma Subdural Agudo: Ruptura de Veias Pontes Corticais, Idosos e Alcoólatras, TC com Imagem em Crescente / Semilunar Hiperdensa que Ultrapassa as Suturas"
                        ]
                    },
                    {
                        "subfoco": "Manejo da Hipertensão Intracraniana e Escala de Glasgow",
                        "sub_subfocos": [
                            "Classificação: TCE Leve (Glasgow 13-15), Moderado (9-12) e Grave (<= 8)",
                            "Tríade de Cushing (Hipertensão Arterial, Bradicardia e Respiração Irregular)",
                            "Medidas de Neuroproteção: Cabeceira Elevada a 30°, Sedação, Normotermia, Salina Hipertônica a 3% ou Manitol e Meta de PAM"
                        ]
                    }
                ]
            },
            {
                "foco": "Trauma Raquimedular (TRM)",
                "subfocos": [
                    {
                        "subfoco": "Avaliação Neurológica Inicial e Nível de Lesão (Escala ASIA)",
                        "sub_subfocos": [
                            "Classificação da Escala de Deficiência de ASIA (A: Completo a E: Normal) e Nível Motor/Sensitivo",
                            "Diferenciação Canônica: Choque Medular (Flacidez e Arreflexia Transitória) vs Choque Neurogênico (Hipotensão e Bradicardia por Perda de Tônus Simpático)"
                        ]
                    },
                    {
                        "subfoco": "Imobilização, Propedêutica por Imagem e Indicações Cirúrgicas de Descompressão",
                        "sub_subfocos": [
                            "Critérios de Restrição de Movimento da Coluna e Critérios NEXUS / Canadian C-Spine Rule para TC de Coluna",
                            "Indicações Cirúrgicas de Urgência: Déficit Neurológico Progressivo, Fratura Instável e Compressão Medular Aguda",
                            "Mecanismos Canônicos: Compressão Anteroposterior ('Livro Aberto' / Ruptura do Plexo Venoso Pré-Sacral), Compressão Lateral e Cisalhamento Vertical"
                        ]
                    }
                ]
            },
            {
                "foco": "Trauma Pélvico e Hemorragia Retroperitoneal",
                "subfocos": [
                    {
                        "subfoco": "Mecanismo de Trauma, Classificação de Young-Burgess e Diagnóstico",
                        "sub_subfocos": [
                            "Propedêutica Rápida no Trauma: Radiografia de Bacia no ATLS, FAST Estendido e Angio-TC em Paciente Estável"
                        ]
                    },
                    {
                        "subfoco": "Estabilização Hemodinâmica, Lençol Pélvico, Fixador Externo e Angioembolização",
                        "sub_subfocos": [
                            "Fechamento Imediato da Pelve no Choque com Lençol / Cinta Pélvica na Altura dos Grandes Trocanteres"
                        ]
                    }
                ]
            },
            {
                "foco": "Choque no Trauma e Ressuscitação Hemostática",
                "subfocos": [
                    {
                        "subfoco": "Classificação do Choque Hemorrágico (Classes I a IV do ATLS)",
                        "sub_subfocos": [
                            "Algoritmo no Paciente Instável: Fixação Externa e Packing Pré-Peritoneal vs Angiografia com Embolização Seletiva"
                        ]
                    },
                    {
                        "subfoco": "Hipotensão Permissiva e Alvos de Ressuscitação",
                        "sub_subfocos": [
                            "Classe I (< 15% de perda), Classe II (15-30% - Taquicardia, PA normal), Classe III (30-40% - Hipotensão, Oligúria), Classe IV (> 40% - Choque Profundo, Rebaixamento)",
                            "Transfusão Maciça: Relação 1:1:1 (Concentrado de Hemácias, Plasma Fresco Congelado e Plaquetas)",
                            "Ácido Tranexâmico (TXA): 1 g em Bolus em até 3 Horas do Trauma seguido de 1 g em Infusão Contínua por 8 Horas"
                        ]
                    }
                ]
            },
            {
                "foco": "Cirurgia de Controle de Danos (Damage Control)",
                "subfocos": [
                    {
                        "subfoco": "As 3 Fases do Damage Control Surgery",
                        "sub_subfocos": [
                            "Alvo de PAS entre 80-90 mmHg até o Controle Cirúrgico Definitivo da Hemorragia (Exceto se TCE Grave Concomitante)",
                            "Controle Agressivo da Tríade Letal: Hipotermia, Acidose Metabólica e Coagulopatia",
                            "Fase 1 (Bloco Cirúrgico): Laparotomia Abreviada, Controle Hemostático (Empacotamento / Packing Hepático) e Controle de Contaminação (Ligadura de Alças sem Anastomoses) e Fechamento Provisório (Bolsa de Bogotá / Vácuo)",
                            "Fase 2 (UTI): Reaquecimento Ativo, Correção da Acidose e da Coagulopatia, Otimização Ventilatória"
                        ]
                    },
                    {
                        "subfoco": "Síndrome Compartimental Abdominal (SCA)",
                        "sub_subfocos": [
                            "Fase 3 (Reoperação Programada em 24-72h): Retirada de Compressas, Reconstrução do Trânsito e Fechamento Definitivo",
                            "Pressão Intra-Abdominal (PIA) Normal vs Hipertensão Intra-Abdominal (HIA > 12 mmHg)",
                            "Critério de SCA: PIA > 20 mmHg associada a Nova Disfunção Orgânica (Oligúria, Hipoxemia, Queda do Débito Cardíaco)",
                            "Tratamento Definitivo: Laparostomia Descompressiva de Emergência"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Abdome Agudo Cirúrgico",
        "focos": [
            {
                "foco": "Abdome Agudo Inflamatório",
                "subfocos": [
                    {
                        "subfoco": "Apendicite Aguda",
                        "sub_subfocos": [
                            "Fisiopatologia, Cronologia de Murphy e Sinais Físicos Canônicos (Blumberg, Rovsing, Lenander, Obturador e Psoas)",
                            "Escore de Alvarado, Propedêutica por Imagem (USG vs TC) e Apendicectomia Videolaparoscópica de Urgência"
                        ]
                    },
                    {
                        "subfoco": "Colecistite Aguda Litiásica e Alitiásica",
                        "sub_subfocos": [
                            "Tríade Diagnóstica de Tóquio (Sinal de Murphy, Sinais Sistêmicos e Achados USG com Parede Espessada > 4 mm)",
                            "Colecistectomia Videolaparoscópica Precoce (< 72h) vs Colecistostomia Percutânea em Pacientes Graves"
                        ]
                    },
                    {
                        "subfoco": "Diverticulite Aguda dos Cólons",
                        "sub_subfocos": [
                            "Classificação Tomográfica de Hinchey (Estágios I a IV) e Diagnóstico por TC com Contraste",
                            "Tratamento Clínico com Dieta/Antibiótico vs Drenagem Percutânea (Hinchey II) vs Cirurgia de Hartmann (III e IV)"
                        ]
                    },
                    {
                        "subfoco": "Pancreatite Aguda Necrosante Cirúrgica",
                        "sub_subfocos": [
                            "Necrose Pancreática Estéril vs Infectada (Gás à TC ou Punção) e Abordagem Escalonada (Step-Up Approach)",
                            "Indicações e Momento da Colecistectomia na Pancreatite Biliar (Na Mesma Internação se Leve)"
                        ]
                    }
                ]
            },
            {
                "foco": "Abdome Agudo Obstrutivo",
                "subfocos": [
                    {
                        "subfoco": "Obstrução Intestinal por Bridas e Aderências",
                        "sub_subfocos": [
                            "Quadro Clínico (Dor em Cólica, Vômitos Biliosos, Parada de Eliminação de Gases e Fezes e Níveis Hidroaéreos)",
                            "Tratamento Conservador Inicial com Sonda Nasogástrica e Hidratação vs Laparotomia por Estrangulamento / Sofrimento de Alça"
                        ]
                    },
                    {
                        "subfoco": "Volvo de Sigmoide e Ceco",
                        "sub_subfocos": [
                            "Sinal do 'Grão de Café' / 'U Invertido' à Radiografia de Abdome e Volvo de Sigmoide",
                            "Descompressão Endoscópica por Colonoscopia seguida de Sigmoidectomia Eletiva vs Cirurgia de Emergência se Isquemia"
                        ]
                    },
                    {
                        "subfoco": "Neoplasia Colorretal Obstrutiva e Hérnias Encarceradas",
                        "sub_subfocos": [
                            "Câncer de Cólon Esquerdo Obstrutivo: Prótese Endoscópica Autoexpansível vs Cirurgia de Hartmann de Urgência",
                            "Hérnias Inguinais e Femorais Encarceradas e Estranguladas (Indicação Cirúrgica Imediata sem Tentativa de Redução)"
                        ]
                    },
                    {
                        "subfoco": "Íleo Paralítico vs Síndrome de Ogilvie (Pseudo-obstrução)",
                        "sub_subfocos": [
                            "Diferenciação: Íleo Paralítico Pós-Operatório / Hidroeletrolítico (Difuso) vs Síndrome de Ogilvie (Dilatação Maciça de Cólon)",
                            "Manejo da Síndrome de Ogilvie: Descompressão com Neostigmina EV e Colonoscopia Descompressiva se Ceco > 10-12 cm"
                        ]
                    }
                ]
            },
            {
                "foco": "Abdome Agudo Perfurativo",
                "subfocos": [
                    {
                        "subfoco": "Úlcera Péptica Perfurada (Gástrica e Duodenal)",
                        "sub_subfocos": [
                            "Quadro Hiperagudo: Dor Súbita Lancinante em Facada com Abdome em Tábua e Pneumoperitônio (Sinal de Jobert)",
                            "Tratamento Cirúrgico: Laparotomia / Laparoscopia com Úlcerorrafia e Patch de Omento (Manobra de Graham)"
                        ]
                    },
                    {
                        "subfoco": "Perfuração de Cólon e Corpo Estranho Gastrointestinal",
                        "sub_subfocos": [
                            "Perfuração de Divertículo, Neoplasia ou Pós-Colonoscopia com Pneumoperitônio e Peritonite Fecaloide",
                            "Ressuscitação Volêmica Agressiva, Antibioticoterapia de Amplo Espectro e Laparotomia com Ressecção e Estoma"
                        ]
                    }
                ]
            },
            {
                "foco": "Abdome Agudo Vascular",
                "subfocos": [
                    {
                        "subfoco": "Isquemia Mesentérica Aguda (Embolia e Trombose Arterial)",
                        "sub_subfocos": [
                            "Dor Abdominal Desproporcional aos Achados do Exame Físico Inicial em Cardiopatas com Fibrilação Atrial",
                            "Evolução Tardia: Acidose Láctica Grave, Distensão Abdominal e Sinais de Necrose de Alça / Peritonite"
                        ]
                    },
                    {
                        "subfoco": "Isquemia Mesentérica Não Oclusiva (IMNO) e Trombose Venosa Mesentérica",
                        "sub_subfocos": [
                            "IMNO em Pacientes Críticos em Choque em Uso de Vasopressores em Altas Doses (Infusão de Vasodilatadores Intra- arteriais)",
                            "Trombose Venosa Mesentérica em Pacientes com Trombofilias (Anticoagulação Plena com Heparina)",
                            "Isquemia Transitória de Baixo Fluxo em Áreas de Divisor de Águas (Ponto de Griffith e Ponto de Sudeck)"
                        ]
                    },
                    {
                        "subfoco": "Colite Isquêmica",
                        "sub_subfocos": [
                            "Colonoscopia Precoce sem Insuflação Excessiva e Tratamento Conservador na Maioria dos Casos"
                        ]
                    }
                ]
            },
            {
                "foco": "Abdome Agudo Hemorrágico",
                "subfocos": [
                    {
                        "subfoco": "Rotura de Aneurisma de Aorta Abdominal (AAA)",
                        "sub_subfocos": [
                            "Tríade Clássica: Dor Lombar/Abdominal Súbita Intensa, Hipotensão/Choque e Massa Abdominal Pulsátil Palpável",
                            "Conduta na Instabilidade Hemodinâmica: Laparotomia Imediata com Clampeamento Aórtico Supra/Infrarrenal vs Reparo Endovascular (EVAR)"
                        ]
                    },
                    {
                        "subfoco": "Rotura de Cisto Ovariano Hemorrágico e Gravidez Ectópica Rota Cirúrgica",
                        "sub_subfocos": [
                            "Choque Hemorrágico Ginecológico-Cirúrgico com Sinal de Proust (Abaulamento e Dor Excruciante no Fundo de Saco de Douglas)",
                            "Tratamento Cirúrgico por Laparoscopia / Salpingectomia de Emergência"
                        ]
                    },
                    {
                        "subfoco": "Rotura Espontânea de Neoplasias Hepáticas (Adenoma e Hepatocarcinoma)",
                        "sub_subfocos": [
                            "Hemoperitônio Agudo em Mulher Jovem em Uso Prolongado de ACO (Adenoma Hepático Roto)",
                            "Embolização Angiográfica de Emergência vs Hepatectomia"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Cirurgia do Trato Gastrointestinal Alto",
        "focos": [
            {
                "foco": "Câncer Gástrico (Adenocarcinoma e GIST)",
                "subfocos": [
                    {
                        "subfoco": "Adenocarcinoma Gástrico e Classificação de Lauren",
                        "sub_subfocos": [
                            "Classificação Histológica de Lauren: Tipo Intestinal (Idosos, Homens, Diferenciado, Relação com Gastrite Atrófica / *H. pylori*) vs Tipo Difuso (Jovens, Mulheres, Células em Anel de Sinete, Hereditário, Pior Prognóstico)",
                            "Sinais de Incurabilidade / Metástases à Distância: Linfonodo de Virchow (Supraclavicular Esquerdo), Linfonodo de Irish (Axilar Esquerdo), Nódulo da Irmã Maria José (Umbilical), Prateleira de Blumer e Tumor de Krukenberg"
                        ]
                    },
                    {
                        "subfoco": "Estadiamento e Tratamento Cirúrgico com Linfadenectomia D2",
                        "sub_subfocos": [
                            "Indicação de Gastrectomia Subtotal (Lesões Distais / Antrais com Margem de Segurança >= 5 cm) vs Total (Lesões Proximais / Corpo Alto / Tipo Difuso)",
                            "Tumores Estromais Gastrointestinais (GIST): Origem nas Células de Cajal, Marcador c-KIT / CD117 Positivo e Terapia com Imatinibe"
                        ]
                    }
                ]
            },
            {
                "foco": "Úlcera Péptica e Complicações Cirúrgicas (Sangramento e Estenose)",
                "subfocos": [
                    {
                        "subfoco": "Complicações Cirúrgicas da Doença Ulcerosa Péptica",
                        "sub_subfocos": [
                            "Estenose Pilórica Cicatricial (Vômitos Pós-Prandiais Tardios de Alimentos Não Digeridos, Alcalose Metabólica Hipoclorêmica e Hipocalêmica)",
                            "Hemorragia Digestiva Refratária a Tratamento Endoscópico (Indicações de Cirurgia de Urgência)",
                            "Técnicas de Reconstrução: Billroth I (Gastroduodenostomia), Billroth II (Gastrojejunostomia com Alça Aferente) e Y de Roux"
                        ]
                    },
                    {
                        "subfoco": "Síndromes Pós-Gastrectomia",
                        "sub_subfocos": [
                            "Síndrome de Dumping Precoce (Sintomas Vasomotores e Gastrointestinais 20-30 min pós-dieta hiperosmolar) vs Tardia (Hipoglicemia Reativa 2-3h pós-refeição)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica",
                "subfocos": [
                    {
                        "subfoco": "Indicações de Tratamento Cirúrgico da DRGE",
                        "sub_subfocos": [
                            "Gastrite por Refluxo Biliar / Alcalino e Síndrome da Alça Aferente",
                            "Pacientes Jovens Refratários a IBP, Intolerantes à Medicação, com Grandes Hérnias de Hiato ou Complicações Respiratórias Recorrentes",
                            "Exames Pré-Operatórios Obrigatórios: EDA, Esofagomanometria (Avaliar Motilidade do Corpo Esofágico) e pHmetria de 24 Horas"
                        ]
                    },
                    {
                        "subfoco": "Fundoplicatura Laparoscópica (Técnicas)",
                        "sub_subfocos": [
                            "Fundoplicatura Total a Nissen (360° - Indicada se Motilidade Esofágica Normal)",
                            "Fundoplicaturas Parciais: Toupet (Posterior 270°) ou Dor (Anterior 180°) se Hipomotilidade Esofágica para Prevenção de Disfagia Pós-Operatória",
                            "Hérnias Paraesofágicas / Mistas (Risco de Volvo Gástrico e Estrangulamento)",
                            "Perda dos Plexos Mioentéricos de Auerbach (Etiologia Idiopática vs Doença de Chagas)"
                        ]
                    }
                ]
            },
            {
                "foco": "Megaesôfago e Acalasia",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia e Diagnóstico da Acalasia",
                        "sub_subfocos": [
                            "Disfagia de Transferência Lenta e Progressiva para Sólidos e Líquidos associada a Regurgitação e Perda Ponderal",
                            "Esofagograma Baritado: Sinal do \"Bico de Pássaro\" ou \"Chama de Vela"
                        ]
                    },
                    {
                        "subfoco": "Classificação Radiológica de Rezende e Tratamento",
                        "sub_subfocos": [
                            "Graus de Rezende: Grupo I (Até 4 cm), Grupo II (4 a 7 cm), Grupo III (7 a 10 cm), Grupo IV (Dolicomegaesôfago > 10 cm)",
                            "Tratamento de Escolha para Grupos II e III: Cardiomiotomia a Heller associada a Fundoplicatura Antirrefluxo Parcial Videolaparoscópica",
                            "Esofagectomia Subtotal com Reconstrução Gástrica em Dolicomegaesôfago Grau IV Refratário"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Esôfago",
                "subfocos": [
                    {
                        "subfoco": "Carcinoma Espinocelular (CEC) vs Adenocarcinoma",
                        "sub_subfocos": [
                            "CEC de Esôfago: Terço Médio e Superior, Associação Forte com Tabagismo e Etilismo",
                            "Adenocarcinoma de Esôfago: Terço Inferior e Junção Esofagogástrica, Relação Direta com DRGE Crônica e Esôfago de Barrett"
                        ]
                    },
                    {
                        "subfoco": "Estadiamento e Tratamento Cirúrgico",
                        "sub_subfocos": [
                            "Ecoendoscopia (Ultrassom Endoscópico) para Avaliação de Profundidade Tumoral (T) e Linfonodos (N)",
                            "Quimiorradioterapia Neoadjuvante seguida de Esofagectomia Transtorácica (Ivor Lewis ou McKeown) ou Trans-Hiatal",
                            "IMC >= 40 kg/m2 ou IMC >= 35 kg/m2 com Comorbidades Graves (DM2, HAS, SAOS, Dislipidemia) Refratárias ao Manejo Clínico por pelo menos 2 Anos"
                        ]
                    }
                ]
            },
            {
                "foco": "Cirurgia Bariátrica e Metabólica",
                "subfocos": [
                    {
                        "subfoco": "Indicações Formais e Critérios do CFM",
                        "sub_subfocos": [
                            "Cirurgia Metabólica para Diabéticos Tipo 2 com IMC >= 30 kg/m2 sem Resposta Clínica Otimizada",
                            "Bypass Gástrico em Y de Roux (Fobi-Capella): Misto Restritivo e Disabsortivo Leve (Excelente para DRGE e Diabetes)"
                        ]
                    },
                    {
                        "subfoco": "Técnicas Cirúrgicas e Complicações",
                        "sub_subfocos": [
                            "Gastrectomia Vertical / Sleeve: Restritivo Puro (Risco de Agravamento de DRGE)",
                            "Complicações Agudas Graves: Fístula da Linha de Grampeamento (Taquicardia Sustentada > 120 bpm como Primeiro Sinal de Alarme), Embolia Pulmonar e Hérnia Interna de Petersen"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Cirurgia Hepato-Bilio-Pancreática",
        "focos": [
            {
                "foco": "Colelitíase e Coledocolitíase",
                "subfocos": [
                    {
                        "subfoco": "Colelitíase Sintomática e Indicações Cirúrgicas",
                        "sub_subfocos": [
                            "Cólica Biliar Típica: Dor em HCD Pós-Prandial Gordurosa com Duração Curta (< 6 Horas) sem Sinais Sistêmicos",
                            "Indicações de Colecistectomia em Assintomáticos: Vesícula em Porcelana, Pólipos Biliares > 1 cm, Associação com Coledocolitíase ou Anemia Hemolítica"
                        ]
                    },
                    {
                        "subfoco": "Coledocolitíase: Diagnóstico e Estratégia Terapêutica",
                        "sub_subfocos": [
                            "Critérios Preditivos da ASGE: Muito Alto Risco (Cálculo Visualizado na USG, Colangite ou Bilirrubina > 4 com Colédoco Dilatado > 6 mm)",
                            "Conduta em Alto Risco: CPRE (Colangiopancreatografia Retrógrada Endoscópica) Pré-Operatória com Papilotomia e Retirada dos Cálculos"
                        ]
                    }
                ]
            },
            {
                "foco": "Colangite Aguda (Tríade de Charcot e Pêntade de Reynolds)",
                "subfocos": [
                    {
                        "subfoco": "Colangite Aguda Não Supurativa (Tríade de Charcot)",
                        "sub_subfocos": [
                            "Colangiorressonância Magnética (CPRM) em Risco Intermediário e Exploração Cirúrgica do Colédoco",
                            "Tríade de Charcot: Dor em Hipocôndrio Direito, Febre com Calafrios e Icterícia",
                            "Antibioticoterapia Venosa de Amplo Espectro com Cobertura para Gram-Negativos e Enterococos"
                        ]
                    },
                    {
                        "subfoco": "Colangite Aguda Grave Supurativa (Pêntade de Reynolds)",
                        "sub_subfocos": [
                            "Pêntade de Reynolds: Tríade de Charcot associada a Choque Séptico / Hipotensão e Rebaixamento do Nível de Consciência / Confusão Mental",
                            "Emergência Cirúrgica Absoluta com Indicação de Descompressão Biliar Urgente (CPRE de Urgência ou Drenagem Biliar Trans-Hepática Percutânea)"
                        ]
                    }
                ]
            },
            {
                "foco": "Neoplasias Malignas da Vesícula e Vias Biliares (Colangiocarcinoma)",
                "subfocos": [
                    {
                        "subfoco": "Colangiocarcinoma e Tumor de Klatskin",
                        "sub_subfocos": [
                            "Tumor de Klatskin (Colangiocarcinoma Peri-Hilar na Confluência dos Ductos Hepáticos Direito e Esquerdo)"
                        ]
                    },
                    {
                        "subfoco": "Câncer de Vesícula Biliar",
                        "sub_subfocos": [
                            "Quadro Clínico: Icterícia Colestática Progressiva Indolor com Prurido Intenso e Vesícula Biliar Murcha / Não Palpável",
                            "Classificação de Bismuth-Corlette (Tipos I a IV)",
                            "Achado Incidental Frequente Pós-Colecistectomia por Colelitíase",
                            "Conduta pelo Estadiamento T: T1a (Confinado à Lâmina Própria - Colecistectomia Simples é Curativa) vs T1b/T2 em Diante (Reoperação com Ressecção Hepática em Cunha do Leito Vesicular + Linfadenectomia Portal)"
                        ]
                    }
                ]
            },
            {
                "foco": "Tumores Hepáticos Benignos e Malignos (Carcinoma Hepatocelular e Metástases)",
                "subfocos": [
                    {
                        "subfoco": "Tumores Benignos do Fígado (Hemangioma, HNF e Adenoma)",
                        "sub_subfocos": [
                            "Hemangioma Cavernoso: Tumor Hepático Mais Comum, Captação Nodular Periférica Globuliforme na Fase Arterial com Preenchimento Centrípeto Lento",
                            "Hiperplasia Nodular Focal (HNF): Cicatriz Estrelada Central Típica à Imagem, Conduta Expectante",
                            "Adenoma Hepático: Risco de Sangramento e Degeneração Maligna em Mulheres Jovens sob Uso de ACO; Indicação Cirúrgica se Sintomático, Tamanho > 5 cm ou Homens",
                            "Desenvolvimento quase Exclusivo em Fígado Cirrótico; Rastreamento Semestral com Ultrassonografia e Alfa-Fetoproteína"
                        ]
                    },
                    {
                        "subfoco": "Carcinoma Hepatocelular (CHC) e Critérios de Milão",
                        "sub_subfocos": [
                            "Padrão Tomográfico Patognomônico: Realce Intenso na Fase Arterial (*Wash-in*) com Lavagem Precoce na Fase Venosa (*Wash-out*)",
                            "Critérios de Milão para Transplante Hepático: Nódulo Único <= 5 cm ou até 3 Nódulos <= 3 cm cada, sem Invasão Vascular"
                        ]
                    }
                ]
            },
            {
                "foco": "Abscessos Hepáticos (Amebiano e Piogênico)",
                "subfocos": [
                    {
                        "subfoco": "Abscesso Hepático Piogênico vs Amebiano",
                        "sub_subfocos": [
                            "Abscesso Piogênico: Múltiplo, Idosos, Origem Biliar / Pyleflebite (*E. coli*, *Klebsiella*); Tratamento com Antibióticos EV e Drenagem Percutânea Guiada por USG/TC",
                            "Abscesso Amebiano (*Entamoeba histolytica*): Homens Jovens, Lesão Única em Lobo Direito com Conteúdo em \"Pasta de Anchova\"; Tratamento Primário Clínico com Metronidazol (Raramente Requer Cirurgia)"
                        ]
                    },
                    {
                        "subfoco": "Cisto Hidático Hepático (Equinococose)",
                        "sub_subfocos": [
                            "Contaminação por *Echinococcus granulosus*, Calcificação em Casca de Ovo e Cistos Filhos",
                            "Cuidado Cirúrgico com Risco de Ruptura e Choque Anafilático (Técnica PAIR)"
                        ]
                    }
                ]
            },
            {
                "foco": "Neoplasias do Pâncreas (Adenocarcinoma e Neoplasias Císticas)",
                "subfocos": [
                    {
                        "subfoco": "Adenocarcinoma de Cabeça de Pâncreas",
                        "sub_subfocos": [
                            "Tríade Típica: Icterícia Colestática Indolor Flutuante/Progressiva, Perda Ponderal Acentuada e Vesícula Biliar Palpável e Indolor (Sinal de Courvoisier-Terrier)",
                            "Marcador Tumoral CA 19-9 para Acompanhamento e Avaliação de Ressecabilidade Vascular na TC com Contraste (Artéria Mesentérica Superior, Tronco Celíaco)"
                        ]
                    },
                    {
                        "subfoco": "Neoplasias Císticas do Pâncreas (IPMN, Cistoadenoma)",
                        "sub_subfocos": [
                            "Tratamento Cirúrgico Curativo: Gastroduodenopancreatectomia (Cirurgia de Whipple)",
                            "IPMN (Neoplasia Mucinosa Papilar Intraductal): Dilatação do Ducto Pancreático Principal ou Ramos com Saída de Muco pela Papila",
                            "Cistoadenoma Seroso (Benigno) vs Cistoadenoma Mucinoso (Potencial Maligno)"
                        ]
                    }
                ]
            },
            {
                "foco": "Cistos e Anomalias Congênitas da Via Biliar",
                "subfocos": [
                    {
                        "subfoco": "Cistos de Colédoco e Classificação de Todani",
                        "sub_subfocos": [
                            "Classificação de Todani (Tipos I a V): Tipo I (Dilatação Fusiforme do Colédoco) como Mais Comum",
                            "Risco Significativo de Degeneração para Colangiocarcinoma; Indicação de Ressecção Completa do Cisto com Hepatojejunostomia em Y de Roux"
                        ]
                    },
                    {
                        "subfoco": "Doença de Caroli (Todani Tipo V)",
                        "sub_subfocos": [
                            "Dilatações Císticas Saculares Intra-Hepáticas Congênitas associadas a Fibrose Hepática Congênita e Litíase Intra-Hepática Recorrente",
                            "Risco de Colangite de Repetição e Indicação de Transplante Hepático em Formas Difusas Bilaterais"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Coloproctologia e Doenças Orificiais",
        "focos": [
            {
                "foco": "Câncer de Cólon",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico por Topografia (Cólon Direito vs Esquerdo)",
                        "sub_subfocos": [
                            "Câncer de Cólon Direito (Ceco / Ascendente): Anemia Ferropriva Oculta, Fadiga, Massa Palpável em FID e Sangramento Oculto nas Fezes",
                            "Câncer de Cólon Esquerdo (Descendente / Sigmoide): Mudança do Hábito Intestinal, Fezes em Fita, Obstrução Intestinal e Hematoquezia"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Cirúrgico Oncológico do Câncer de Cólon",
                        "sub_subfocos": [
                            "Rastreamento Populacional com Colonoscopia a partir dos 45-50 Anos",
                            "Colectomia com Ligadura Vascular na Origem e Linfadenectomia Obrigatória (Mínimo de 12 Linfonodos Avaliados)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Reto e Canal Anal",
                "subfocos": [
                    {
                        "subfoco": "Câncer de Reto: Terapia Neoadjuvante e Margem Distal",
                        "sub_subfocos": [
                            "Hemicolectomia Direita (Artérias Ileocólica e Cólica Direita) vs Hemicolectomia Esquerda (Artéria Cólica Esquerda)",
                            "Indicações de Quimioterapia Adjuvante: Estágio III (Linfonodo Positivo) e Estágio II de Alto Risco",
                            "Quimiorradioterapia Neoadjuvante Padrão para Tumores T3/T4 ou Linfonodos Positivos (N+)"
                        ]
                    },
                    {
                        "subfoco": "Câncer de Canal Anal (Carcinoma Epidermoide)",
                        "sub_subfocos": [
                            "Ressecção Anterior Baixa (RAB) com Excisão Total do Mesorreto (ETM) e Anastomose Coloanal para Reto Médio/Alto",
                            "Amputação Abdominoperineal do Reto (Cirurgia de Miles) com Colostomia Definitiva se Invasão do Esfíncter Anal em Reto Baixo"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença Hemorroidária",
                "subfocos": [
                    {
                        "subfoco": "Hemorroidas Internas e Classificação em Graus I a IV",
                        "sub_subfocos": [
                            "Relação Etiológica Direta com Infecção pelo Papilomavírus Humano (HPV)",
                            "Grau I (Sangramento sem Prolapso); Grau II (Prolapso com Redução Espontânea); Grau III (Prolapso que Exige Redução Manual); Grau IV (Prolapso Irredutível / Estrangulamento)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Cirúrgico e Trombose Hemorroidária Externa",
                        "sub_subfocos": [
                            "Tratamento não Cirúrgico e Ambulatorial: Dieta Rica em Fibras, Banho de Assento e Ligadura Elástica (Padrão para Graus II e III)",
                            "Hemorroidectomia Aberta (Milligan-Morgan) vs Fechada (Ferguson) para Graus III-IV Sintomáticos",
                            "Trombose Hemorroidária Externa Aguda: Nódulo Perianal Doloroso e Violáceo; Excisão do Trombo / Tromboctomia se Atendimento em até 72 Horas"
                        ]
                    }
                ]
            },
            {
                "foco": "Fissura Anal",
                "subfocos": [
                    {
                        "subfoco": "Fissura Anal Aguda vs Crônica",
                        "sub_subfocos": [
                            "Dor Perianal Intensa em \"Rasgo\" Durante e após a Evacuação associada a Sangramento Vermelho Vivo no Papel Higiênico",
                            "Tríade da Fissura Crônica: Plicoma Sentinela, Úlcera com Fibras do Esfíncter Interno Expostas e Papila Anal Hipertrófica"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Clínico e Esfincterotomia",
                        "sub_subfocos": [
                            "Localização Mais Comum: Linha Média Posterior (90%)",
                            "Tratamento Conservador de 1ª Linha: Pomadas de Nitratos (Dinitrato de Isossorbida) ou Bloqueadores de Canais de Cálcio Tópicos (Diltiazem / Nifedipino)"
                        ]
                    }
                ]
            },
            {
                "foco": "Abscessos Anorretais e Fístulas",
                "subfocos": [
                    {
                        "subfoco": "Abscesso Perianal e Isquiorretal",
                        "sub_subfocos": [
                            "Teoria Criptoglandular: Obstrução e Infecção das Glândulas Anais de Chiari",
                            "Conduta Imediata no Abscesso: Drenagem Cirúrgica sob Anestesia sem Aguardar Flutuação ou Antibioticoterapia Isolada",
                            "Sequela Crônica Pós-Drenagem de Abscesso: Comunicação entre a Cripta Anal e a Pele Perianal"
                        ]
                    },
                    {
                        "subfoco": "Fístulas Anorretais e Regra de Goodsall-Salmon",
                        "sub_subfocos": [
                            "Regra de Goodsall-Salmon: Orifício Externo Anterior -> Trajeto Retilíneo Radial; Orifício Externo Posterior -> Trajeto Curvo que Desemboca na Linha Média Posterior",
                            "Fistulotomia vs Fistulectomia e Uso de Sedênho / Flap de Avanço em Fístulas Complexas"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença Pilonidal Sacrococcígea",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico e Manejo da Crise Aguda",
                        "sub_subfocos": [
                            "Presença de Folículos Pilosos Infectados na Fenda Interglútea em Homens Jovens",
                            "Drenagem Cirúrgica Simples do Abscesso Agudo"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Definitivo da Doença Crônica",
                        "sub_subfocos": [
                            "Excisão Cirúrgica Ampla dos Trajetos com Cicatrização por Segunda Intenção ou Fechamento com Retalhos (Técnica de Limberg / Karydakis)",
                            "Técnicas Minimamente Invasivas: Ablação Endoscópica a Laser (EPSiT) e Fechamento Primário com Retalho Fora da Linha Média",
                            "Destruição dos Plexos Nervosos Entéricos pelo *Trypanosoma cruzi* com Fecaloma e Dilatação Colônica Severa",
                            "Tratamento Eletivo: Cirurgia de Duhamel-Haddad (Retossigmoidectomia com Abaixamento Retro-Retal de Cólon)"
                        ]
                    }
                ]
            },
            {
                "foco": "Megacólon Chagásico e Volvo de Sigmoide",
                "subfocos": [
                    {
                        "subfoco": "Megacólon Chagásico e Constipação Crônica",
                        "sub_subfocos": [
                            "Cirurgia Eletiva Programada Pós-Descompressão Endoscópica: Sigmoidectomia com Anastomose Primária"
                        ]
                    },
                    {
                        "subfoco": "Volvo de Sigmoide Recorrente",
                        "sub_subfocos": [
                            "Tratamento de Urgência no Volvo Isquêmico: Ressecção com Colostomia Terminal (Cirurgia de Hartmann)"
                        ]
                    }
                ]
            },
            {
                "foco": "Prolapso Retal",
                "subfocos": [
                    {
                        "subfoco": "Prolapso Retal Completo vs Prolapso Mucoso",
                        "sub_subfocos": [
                            "Eversão de Todas as Camadas da Parede Retal através do Ânus em Mulheres Idosas com Incontinência Fecal",
                            "Prega Circular Concéntrica (Prolapso Completo) vs Prega Radial (Prolapso Mucoso / Hemorroidário)"
                        ]
                    },
                    {
                        "subfoco": "Abordagem Cirúrgica Abdominal vs Perineal",
                        "sub_subfocos": [
                            "Cirurgia Abdominal (Retopexia Ventral com Tela por Videolaparoscopia)",
                            "Cirurgia Perineal para Idosos Frágeis (Procedimento de Altemeier ou Delorme)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Hérnias e Parede Abdominal",
        "focos": [
            {
                "foco": "Hérnia Inguinal (Indireta e Direta)",
                "subfocos": [
                    {
                        "subfoco": "Anatomia Cirúrgica e Diferenciação Indireta vs Direta",
                        "sub_subfocos": [
                            "Hérnia Indireta: Causa Congênita por Patência do Conduto Peritoneovaginal, Passa pelo Anel Inguinal Profundo LATERAL aos Vasos Epigástricos Inferiores, Pode Descer à Bolsa Escrotal",
                            "Hérnia Direta: Fraqueza da Fáscia Transversalis no Triângulo de Hesselbach MEDIAL aos Vasos Epigástricos Inferiores"
                        ]
                    },
                    {
                        "subfoco": "Técnicas de Correção Cirúrgica (Herniorrafia)",
                        "sub_subfocos": [
                            "Limites do Triângulo de Hesselbach: Vasos Epigástricos Inferiores, Borda Lateral do Reto Abdominal e Ligamento Inguinal",
                            "Técnicas Anatômicas sem Tela: Bassini, Shouldice e McVay",
                            "Hernioplastia Videolaparoscópica (TAPP - Transabdominal Pré-Peritoneal vs TEP - Totalmente Extraperitoneal): Indicações de Escolha em Hérnias Bilaterais e Recidivadas"
                        ]
                    }
                ]
            },
            {
                "foco": "Hérnia Femoral (Crural)",
                "subfocos": [
                    {
                        "subfoco": "Anatomia e Risco Elevado de Estrangulamento",
                        "sub_subfocos": [
                            "Mais Comum em Mulheres Idosas e Multíparas",
                            "Localização Anatômica: Abaixo do Ligamento Inguinal, Medial à Veia Femoral no Canal Femoral",
                            "Maior Índice de Estrangulamento entre Todas as Hérnias da Parede Abdominal (Indicação Cirúrgica Sempre Mandatória e Urgente)"
                        ]
                    },
                    {
                        "subfoco": "Diagnóstico Diferencial da Massa Inguinocrural",
                        "sub_subfocos": [
                            "Técnica Cirúrgica de McVay (Fixação no Ligamento de Cooper) ou Uso de Tela Pré-Peritoneal",
                            "Linfonodo de Cloquet Infartado, Aneurisma de Artéria Femoral e Ectasia de Veia Safena",
                            "Variz de Safena Magna e Abscesso do Psoas com Projeção Crural"
                        ]
                    }
                ]
            },
            {
                "foco": "Hérnia Incisional e Evisceração",
                "subfocos": [
                    {
                        "subfoco": "Fatores de Risco e Correção da Hérnia Incisional",
                        "sub_subfocos": [
                            "Fatores Predisponentes: Infecção do Sítio Cirúrgico, Obesidade, Tabagismo, DM e Técnica Inadequada de Fechamento",
                            "Uso Obrigatório de Tela de Reforço com Sobreposição Ampla (Overlap >= 5 cm)"
                        ]
                    },
                    {
                        "subfoco": "Evisceração Pós-Operatória Aguda",
                        "sub_subfocos": [
                            "Técnicas de Separação de Componentes (Técnica de Ramirez e TAR) para Grandes Defeitos com Perda de Domicílio",
                            "Deiscência Completa de Parede com Saída de Alças Intestinais para Fora da Cavidade",
                            "Sinal Precoce: Saída Abundante de Secreção Serossanguínea em \"Água de Lavado de Carne\" pelo Curativo"
                        ]
                    }
                ]
            },
            {
                "foco": "Hérnia Umbilical e Epigástrica",
                "subfocos": [
                    {
                        "subfoco": "Hérnia Umbilical no Adulto vs na Criança",
                        "sub_subfocos": [
                            "Emergência Cirúrgica: Cobertura Provisória com Compressas Estéreis Úmidas e Reoperação Imediata",
                            "Hérnia Umbilical no Adulto: Adquirida (Gravidez, Obesidade, Ascite Cirrótica), Baixo Índice de Fechamento Espontâneo, Uso de Tela se Defeito > 1-2 cm",
                            "Hérnia Umbilical na Criança: Fechamento Espontâneo na Grande Maioria até os 4 a 5 Anos de Idade; Aguardar Cirurgia exceto se Defeito > 2 cm ou Estrangulamento"
                        ]
                    },
                    {
                        "subfoco": "Hérnia Epigástrica e Diástase dos Retos",
                        "sub_subfocos": [
                            "Hérnia Epigástrica: Defeito na Linha Alba entre o Xifoide e o Umbigo com Encarceramento Frequente de Gordura Pré- Peritoneal",
                            "Diástase dos Retos: Afastamento da Linha Média sem Anel Herniário Verdadeiro (Sem Risco de Estrangulamento)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hérnias Raras (Spiegel, Obturadora, Lombar)",
                "subfocos": [
                    {
                        "subfoco": "Hérnia de Spiegel, Obturadora e Lombares",
                        "sub_subfocos": [
                            "Hérnia de Spiegel: Defeito na Linha Semilunar de Spiegel (Borda Lateral do Reto com Linha Arqueada de Douglas)",
                            "Hérnia Obturadora: Típica em Idosas Emagrecidas, Sinal de Howship-Romberg (Dor na Face Medial da Coxa que Piora com Extensão e Adução por Compressão do Nervo Obturador)",
                            "Hérnias Lombares: Petit (Trígono Lombar Inferior) e Grynfelt (Trígono Lombar Superior)",
                            "Hérnia de Littré (Contém o Divertículo de Meckel no Saco Herniário)"
                        ]
                    },
                    {
                        "subfoco": "Hérnias Especiais com Conteúdo Específico",
                        "sub_subfocos": [
                            "Hérnia de Amyand (Contém o Apêndice Cecal no Saco Inguinal) vs Hérnia de De Garengeot (Apêndice no Saco Femoral)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hérnias Estranguladas e Encarceradas",
                "subfocos": [
                    {
                        "subfoco": "Diferenciação Encarceramento vs Estrangulamento",
                        "sub_subfocos": [
                            "Hérnia de Richter (Pinçamento da Borda Antimesentérica da Alça com Estrangulamento sem Obstrução Mecânica Completa)",
                            "Hérnia Encarcerada: Irredutibilidade sem Sofrimento Vascular Isquêmico",
                            "Hérnia Estrangulada: Isquemia e Necrose da Alça, Dor Intensa Súbita, Hiperemia Cutânea Local, Febre e Sinais Sistêmicos",
                            "Contraindicação Formal de Redução Manual Forçada (Manobra de Taxis) pelo Risco de Redução em Bloco de Alça Inviável"
                        ]
                    },
                    {
                        "subfoco": "Conduta Cirúrgica de Emergência",
                        "sub_subfocos": [
                            "Laparotomia / Inguinotomia de Emergência com Avaliação da Viabilidade da Alça",
                            "Contraindicação Relativa de Prótese / Tela Sintética na Presença de Necrose e Contaminação Fecal"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
        "focos": [
            {
                "foco": "Avaliação de Risco Cirúrgico e Cardiopulmonar",
                "subfocos": [
                    {
                        "subfoco": "Escores Cardiovasculares (Índice de Lee / RCRI)",
                        "sub_subfocos": [
                            "Os 6 Fatores do Índice de Risco Cardíaco Revisado (RCRI / Lee): Cirurgia de Alto Risco, Doença Isquêmica do Coração, Insuficiência Cardíaca, Doença Cerebrovascular, DM em Uso de Insulina, Creatinina > 2 mg/dL"
                        ]
                    },
                    {
                        "subfoco": "Classificação do Estado Físico ASA",
                        "sub_subfocos": [
                            "Classificação da Capacidade Funcional em Equivalentes Metabólicos (METs >= 4 Indica Boa Reserva Funcional)",
                            "ASA I (Hígido), ASA II (Doença Sistêmica Leve sem Limitação), ASA III (Doença Sistêmica Grave com Limitação Funcional), ASA IV (Doença Sistêmica Ameaçadora à Vida), ASA V (Moribundo), ASA VI (Morte Encefálica)",
                            "Sufixo \"E\" Adicionado para Cirurgias de Emergência"
                        ]
                    }
                ]
            },
            {
                "foco": "Cicatrização, Fisiologia das Feridas e Queloides",
                "subfocos": [
                    {
                        "subfoco": "Fases da Cicatrização e Fatores de Interferência",
                        "sub_subfocos": [
                            "As 3 Fases: Inflamatória (0-4 dias: Hemostasia, Neutrófilos e Macrófagos), Proliferativa (4-14 dias: Fibroblastos, Angiogênese e Síntese de Colágeno Tipo III), Remodelação (Semanas a Meses: Maturação e Substituição por Colágeno Tipo I)",
                            "Fatores Sistêmicos que Prejudicam a Cicatrização: Tabagismo, Desnutrição / Hipoalbuminemia, Diabetes Descompensado, Uso de Corticoides e Deficiência de Vitamina C e Zinco"
                        ]
                    },
                    {
                        "subfoco": "Cicatrizes Patológicas: Queloide vs Cicatriz Hipertrófica",
                        "sub_subfocos": [
                            "Cicatriz Hipertrófica: Respeita os Limites da Ferida Original, Melhora Espontânea com o Tempo",
                            "Queloide: Ultrapassa os Limites da Ferida Original, Não Regride Espontaneamente, Mais Comum em Negros, Tratamento com Injeção Intralesional de Triancinolona e Placas de Silicone",
                            "Classificação das Feridas: Limpas (Cirurgias Eletivas sem Penetração em Tratos Oco), Limpas-Contaminadas (Abertura de Trato Digestivo, Respiratório ou Urinário com Mínimo Extravasamento), Contaminadas e Infectadas"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecção de Sítio Cirúrgico (ISC) e Profilaxia Antibiótica",
                "subfocos": [
                    {
                        "subfoco": "Classificação CDC da ISC e Cirurgias por Potencial de Contaminação",
                        "sub_subfocos": [
                            "Classificação Anatômica da ISC: Superficial (Pele e Subcutâneo), Profunda (Fáscia e Músculo) e de Órgão/Cavidade",
                            "Manifestação Típica entre o 4º e o 7º Dia Pós-Operatório (Hiperemia, Dor, Edema e Drenagem Purulenta)",
                            "Antibiótico de Escolha na Maioria dos Procedimentos: Cefazolina (Cefalosporina de 1ª Geração)",
                            "Momento Obrigatório da Administração: Até 60 Minutos Antes da Incisão da Pele (Na Indução Anestésica)"
                        ]
                    },
                    {
                        "subfoco": "Profilaxia Antibiótica em Cirurgia",
                        "sub_subfocos": [
                            "Repique Intraoperatório se Tempo Cirúrgico Ultrapassar 2x a Meia-Vida do Fármaco e Suspensão da Profilaxia em até 24 Horas Pós-Operatórias",
                            "Primeiras 24-48h (Wind): Atelectasia Pulmonar como Causa Mais Comum (Tratamento com Fisioterapia Respiratória e Deambulação Precoce)",
                            "3º Dia (Water): Infecção do Trato Urinário por Cateter Vesical",
                            "5º Dia (Wound): Infecção do Sítio Cirúrgico"
                        ]
                    }
                ]
            },
            {
                "foco": "Complicações Pós-Operatórias (Febre, Atelectasia, TVP/TEP, Deiscência)",
                "subfocos": [
                    {
                        "subfoco": "Febre Pós-Operatória (Mnemônico dos 5 Ws)",
                        "sub_subfocos": [
                            "7º Dia (Walking): Trombose Venosa Profunda e TEP"
                        ]
                    },
                    {
                        "subfoco": "Prevenção e Profilaxia de TVP/TEP no Paciente Cirúrgico",
                        "sub_subfocos": [
                            "Qualquer Momento (Wonder drugs): Febre Farmacológica",
                            "Estratificação de Risco pelo Escore de Caprini",
                            "Profilaxia Mecânica (Meias Elásticas de Compressão Graduada e Compressão Pneumática Intermitente)",
                            "Profilaxia Farmacológica com Heparina de Baixo Peso Molecular (Enoxaparina 40 mg/dia) ou Heparina Não Fracionada"
                        ]
                    }
                ]
            },
            {
                "foco": "Resposta Endócrino-Metabólica ao Trauma (REMIT)",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia Hormonal e Mediadores da REMIT",
                        "sub_subfocos": [
                            "Ativação do Eixo Simpático-Adrenal e Hormônios Contrarreguladores (Elevação de Cortisol, Glucagon, Catecolaminas, ADH e Aldosterona)"
                        ]
                    },
                    {
                        "subfoco": "Protocolos Multimodais de Aceleração da Recuperação (ERAS / ACERTO)",
                        "sub_subfocos": [
                            "Estado Hipercatabólico, Resistência Periférica à Insulina com Hiperglicemia de Estresse e Retenção Hídrica e Salina com Perda de Potássio",
                            "Abreviatura do Jejum Pré-Operatório com Bebidas Ricas em Carboidratos até 2 Horas Antes da Indução"
                        ]
                    }
                ]
            },
            {
                "foco": "Técnica Cirúrgica, Fios e Drenos",
                "subfocos": [
                    {
                        "subfoco": "Fios Cirúrgicos (Absorvíveis vs Inabsorvíveis)",
                        "sub_subfocos": [
                            "Realimentação Oral Precoce, Não Uso Sistemático de Sondas e Drenos e Deambulação Precoce",
                            "Fios Absorvíveis Sintéticos: Poliglactina / Vicryl (Trançado) e Polidioxanona / PDS (Monofilamentar - Ideal para Fáscia)",
                            "Fios Inabsorvíveis: Náilon e Polipropileno / Prolene (Monofilamentar, Mínima Reação Tecidual, Ideal para Pele e Vasos)"
                        ]
                    },
                    {
                        "subfoco": "Drenos Cirúrgicos (Laminares vs Sucção Fechada)",
                        "sub_subfocos": [
                            "Catgut (Origem Animal, Reabsorção Rápida e Marcada Reação Inflamatória)",
                            "Dreno de Penrose (Laminar, Gravitacional e Capilaridade - Sistema Aberto)",
                            "Drenos de Sucção Fechada a Vácuo (Jackson-Pratt e Portovac: Menor Risco de Infecção Ascendente)"
                        ]
                    }
                ]
            },
            {
                "foco": "Suporte Nutricional no Perioperatório",
                "subfocos": [
                    {
                        "subfoco": "Nutrição Enteral vs Parenteral no Paciente Cirúrgico",
                        "sub_subfocos": [
                            "Regra de Ouro: \"Se o Intestino Funciona, Use-o\" (Nutrição Enteral Precoce Previne Translocação Bacteriana e Atrofia de Vilosidades)",
                            "Indicações Formais de Nutrição Parenteral Total (NPT): Íleo Prolongado Refratário, Fístula Enterocutânea de Alto Débito, Síndrome do Intestino Curto Extremo"
                        ]
                    },
                    {
                        "subfoco": "Síndrome de Realimentação e Imunonutrição",
                        "sub_subfocos": [
                            "Síndrome de Realimentação: Hipofosfatemia Severa Aguda, Hipocalemia, Hipomagnesemia e Arritmias Cardíacas Pós- Reintrodução Rápida de Glicose em Desnutridos Crônicos",
                            "Imunonutrição Pré-Operatória com Arginina e Ácidos Graxos Ômega-3"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Doenças Vasculares Cirúrgicas",
        "focos": [
            {
                "foco": "Doença Arterial Obstrutiva Periférica (DAOP)",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia, Exame Físico e Classificação de Rutherford / Fontaine",
                        "sub_subfocos": [
                            "Estadiamento Clínico: Fontaine (I a IV: Claudicação Intermitente, Dor de Repouso e Úlcera Isquêmica) e Rutherford"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Clínico de Otimização e Revascularização Cirúrgica / Endovascular",
                        "sub_subfocos": [
                            "Índice Tornozelo-Braquial (ITB <= 0,9 Indica DAOP; ITB < 0,4 Isquemia Crítica) e Palpação de Pulsos Periféricos",
                            "Terapia Médica Padrão: Cessação do Tabagismo, Caminhada Supervisionada, Estatina de Alta Potência, AAS e Cilostazol",
                            "Indicações de Revascularização (Bypass com Safena / Enxerto Protético vs Angioplastia Endovascular com Stent)",
                            "Quadro Clínico Clássico dos 6 Ps: Pain (Dor), Pallor (Palidez), Pulselessness (Ausência de Pulso), Paresthesia (Parestesia), Paralysis (Paralisia) e Poikilothermia (Hipotermia)"
                        ]
                    }
                ]
            },
            {
                "foco": "Isquemia Arterial Aguda de Membros",
                "subfocos": [
                    {
                        "subfoco": "Tétrade/Hexade dos 6 'Ps' e Diagnóstico Diferencial (Êmbolo vs Trombo)",
                        "sub_subfocos": [
                            "Diferenciação Etiológica: Embolia (Fonte Cardíaca/FA, Início Súbito, Sem Circulação Colateral) vs Trombose Arterial Prévia"
                        ]
                    },
                    {
                        "subfoco": "Classificação de Rutherford da Isquemia Aguda e Cirurgia de Urgência",
                        "sub_subfocos": [
                            "Classificação de Rutherford (I: Viável; IIa: Marginalmente Ameaçado; IIb: Imediatamente Ameaçado; III: Irreversível)"
                        ]
                    }
                ]
            },
            {
                "foco": "Aneurisma de Aorta Abdominal (AAA) e Torácica",
                "subfocos": [
                    {
                        "subfoco": "Epidemiologia, Rastreamento e Indicações Cirúrgicas Eletivas",
                        "sub_subfocos": [
                            "Manejo Imediato com Heparinização Plena EV, Embolectomia Cirúrgica com Cateter de Fogarty e Fasciotomia Profilática",
                            "Rastreamento com Ultrassonografia em Homens de 65-75 Anos Tabagistas (Definição de AAA: Diâmetro >= 3,0 cm)",
                            "Indicações Cirúrgicas Canônicas: Diâmetro >= 5,5 cm em Homens (>= 5,0 cm em Mulheres), Crescimento > 1,0 cm/ano ou Presença de Sintomas"
                        ]
                    },
                    {
                        "subfoco": "Aneurisma Roto (Emergência Cirúrgica) e Técnicas (Aberta vs EVAR)",
                        "sub_subfocos": [
                            "Tríade do AAA Roto: Dor Lombar/Abdominal Súbita, Massa Pulsátil Palpável e Choque Hipovolêmico / Hipotensão",
                            "Tratamento Cirúrgico Aberto com Prótese Dacron vs Correção Endovascular de Aneurisma (EVAR)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença Carotídea Extracraniana Cirúrgica",
                "subfocos": [
                    {
                        "subfoco": "Estenose Carotídea Assintomática vs Sintomática (AIT / AVC)",
                        "sub_subfocos": [
                            "Investigação Propedêutica por Doppler de Artérias Carótidas e Vertebrais, Angio-TC e Angio-RNM",
                            "Critérios de Indicação de Revascularização (Sintomáticos com Estenose >= 50-70%; Assintomáticos com Estenose >= 70- 80%)"
                        ]
                    },
                    {
                        "subfoco": "Endarterectomia Carotídea vs Angioplastia com Stent e Complicações",
                        "sub_subfocos": [
                            "Angioplastia Carotídea com Stent e Sistema de Proteção Cerebral: Indicações Específicas (Pescoço Irradiado, Reestenose)"
                        ]
                    }
                ]
            },
            {
                "foco": "Insuficiência Venosa Crônica e Varizes de Membros Inferiores",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia, Classificação CEAP e Propedêutica",
                        "sub_subfocos": [
                            "Classificação CEAP (C0: Sem Sinais; C1: Telangiectasias; C2: Varizes; C3: Edema; C4: Alterações Tróficas/Dermatite Ocre; C5: Úlcera Cicatrizada; C6: Úlcera Ativa)",
                            "Exame Físico Vascular, Prova de Brodie-Trendelenburg e Ultrassom Doppler Venoso Colorido (Mapeamento do Refluxo Safeno)"
                        ]
                    },
                    {
                        "subfoco": "Manejo Clínico Conservador e Tratamento Cirúrgico / Termoablação",
                        "sub_subfocos": [
                            "Tratamento Conservador com Meias Elásticas de Compressão Graduada, Elevação de Membros e Cuidados com a Pele",
                            "Opções Cirúrgicas: Safenectomia Tradicional, Termoablação por Laser / Radiofrequência e Escleroterapia com Espuma Densa"
                        ]
                    }
                ]
            },
            {
                "foco": "Trombose Venosa Profunda (TVP) e Filtros de Veia Cava",
                "subfocos": [
                    {
                        "subfoco": "Escore de Wells, Dímero-D e Doppler Venoso de Membros Inferiores",
                        "sub_subfocos": [
                            "Estratificação com Escore de Wells para TVP e Uso do Dímero-D de Alta Sensibilidade como Exame de Alto VPN"
                        ]
                    },
                    {
                        "subfoco": "Protocolos de Anticoagulação Plena e Filtro de Veia Cava Inferior",
                        "sub_subfocos": [
                            "Anticoagulação com Anticoagulantes Orais Diretos (DOACs: Rivaroxabana, Apixabana) vs HBPM e Varfarina",
                            "Indicações Formais de Filtro de Veia Cava Inferior (FVCI): Contraindicação Absoluta à Anticoagulação ou TEP Recidivante em Anticoagulação Plena"
                        ]
                    }
                ]
            },
            {
                "foco": "Acessos Vasculares para Hemodiálise",
                "subfocos": [
                    {
                        "subfoco": "Fístula Arteriovenosa Autógena (FAV) vs Enxerto Protético (PTFE)",
                        "sub_subfocos": [
                            "Primeira Escolha Canônica: Fístula Autógena Radiocefálica (Brescia-Cimino) ou Braquiocefálica em Membro Não- Dominante",
                            "Critérios de Maturação da Fístula (Regra dos 6: Fluxo > 600 mL/min, Diâmetro > 6 mm, Profundidade < 6 mm e Tempo >= 6 semanas)",
                            "Identificação de Frêmito e Sopro Sistodiastólico na FAV e Propedêutica da Perda de Frêmito por Trombose"
                        ]
                    },
                    {
                        "subfoco": "Complicações de Acessos Vasculares: Trombose, Estenose e Síndrome de Roubo",
                        "sub_subfocos": [
                            "Síndrome de Roubo Arterial (Isquemia Distal da Mão com Dor, Palidez e Frialdade) e Conduta Cirúrgica (Banding / DRIL)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Patologias Cirúrgicas Urológicas",
        "focos": [
            {
                "foco": "Litíase Urinária e Cólica Nefrética Cirúrgica",
                "subfocos": [
                    {
                        "subfoco": "Avaliação Propedêutica por Imagem e Manejo da Cólica Nefrética Aguda",
                        "sub_subfocos": [
                            "Tratamento da Dor Aguda com AINEs Intravenosos (Cetoprofeno) associados a Opiáceos e Hidratação Parcimoniosa"
                        ]
                    },
                    {
                        "subfoco": "Critérios de Intervenção Cirúrgica de Urgência e Eletiva (LECO, Ureterorrenolitotripsia, NLPC)",
                        "sub_subfocos": [
                            "Emergência Urológica Absoluta: Cálculo Obstrutivo Associado a Infecção Urinária / Sepse (Descompressão com Cateter Duplo J ou Nefrostomia)",
                            "Tratamento Eletivo por Tamanho e Posição: Ureterolitotripsia Flexível a Laser, Litotripsia Extracorpórea (LECO) e Nefrolitotripsia Percutânea (NLPC > 2 cm)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hiperplasia Prostática Benigna (HPB)",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico (Sintomas de Armazenamento e Esvaziamento) e Escore IPSS",
                        "sub_subfocos": [
                            "Sintomas do Trato Urinário Inferior (LUTS): Jato Fraco, Hesitação, Noctúria, Polaciúria e Sensação de Esvaziamento Incompleto"
                        ]
                    },
                    {
                        "subfoco": "Terapia Farmacológica Combinada e Ressecção Transuretral de Próstata (RTUP)",
                        "sub_subfocos": [
                            "Toque Retal (Próstata Aumentada, Lisa, Fibroelástica, Indolor e Sulco Mediano Preservado) e Dosagem de PSA",
                            "Tratamento Medicamentoso: Alfa-Bloqueadores (Tansulosina) para Alívio Rápido + Inibidores da 5-Alfa-Redutase (Finasterida) para Redução de Volume",
                            "Tratamento Cirúrgico: RTUP Monopolar/Bipolar (Próstatas < 80g) e Prostatectomia Suprapúbica Aberta / Enucleação a Laser (HoLEP > 80g)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Próstata",
                "subfocos": [
                    {
                        "subfoco": "Rastreamento, Biópsia Prostática Transretal e Escore de Gleason / ISUP",
                        "sub_subfocos": [
                            "Investigação Inicial: Alteração no Toque Retal (Nódulo Endurecido) ou Elevação de PSA (Avaliação de Fração Livre e Velocidade)",
                            "Biópsia de Próstata Guiada por USG/RNM e Graduação Histopatológica de Gleason (Padrão Primário + Secundário) e Grupos ISUP (1 a 5)"
                        ]
                    },
                    {
                        "subfoco": "Estratificação de Risco e Opções Terapêuticas (Vigilância, Prostatectomia e Hormonioterapia)",
                        "sub_subfocos": [
                            "Doença Localizada de Baixo Risco: Vigilância Ativa com PSA Periódico e Biópsias Seriadas",
                            "Tratamento Curativo: Prostatectomia Radical (Aberta, Laparoscópica ou Robótica) vs Radioterapia e Terapia de Privação Androgênica (Bloqueio Hormonal)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer Renal (Carcinoma de Células Renais)",
                "subfocos": [
                    {
                        "subfoco": "Subtipos Histológicos, Tríade Clássica e Incidentalomas Renais",
                        "sub_subfocos": [
                            "Diagnóstico na Maioria dos Casos como Incidentaloma em Exame de Imagem (USG ou TC de Abdome)",
                            "Tríade Clássica Tardia (Presente em < 10% dos casos): Hematúria Macroscópica, Dor em Flanco e Massa Abdominal Palpável"
                        ]
                    },
                    {
                        "subfoco": "Nefrectomia Parcial vs Radical e Síndromes Paraneoplásicas",
                        "sub_subfocos": [
                            "Subtipo Mais Comum: Carcinoma de Células Claras e Síndromes Paraneoplásicas (Eritrocitose por EPO, Hipercalcemia por PTHrP)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Bexiga",
                "subfocos": [
                    {
                        "subfoco": "Fatores de Risco (Tabagismo), Apresentação Clínica e Cistoscopia",
                        "sub_subfocos": [
                            "Principal Fator de Risco: Tabagismo e Exposição a Corantes de Anilina/Aminas Aromáticas",
                            "Quadro Clínico Mais Comum: Hematúria Macroscópica Indolor, Total, Intermitente e com Coágulos"
                        ]
                    },
                    {
                        "subfoco": "Ressecção Transuretral de Bexiga (RTUB) e Invasão Muscular (Cistectomia Radical)",
                        "sub_subfocos": [
                            "Diagnóstico e Estadiamento Inicial por Cistoscopia com RTUB (Avaliação da Presença de Camada Muscular Própria na Amostra)",
                            "Doença Não Músculo-Invasiva (RTUB + Imunoterapia Intravesical com BCG) vs Músculo-Invasiva (Cistectomia Radical + Neobexiga/Bricker)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Testículo",
                "subfocos": [
                    {
                        "subfoco": "Fatores de Risco (Criptorquidia), Apresentação Clínica e Marcadores Tumorais",
                        "sub_subfocos": [
                            "Principal Fator de Risco: Histórico de Criptorquidia; Apresentação como Nódulo Testicular Endurecido, Indolor e Fixo ao Parênquima",
                            "Dosagem Pré-Operatória Mandatória de Marcadores: Alfa-fetoproteína (AFP), Beta-hCG e Desidrogenase Lática (LDH)"
                        ]
                    },
                    {
                        "subfoco": "Orquiectomia Radical Inguinal e Diferenciação Seminoma vs Não-Seminoma",
                        "sub_subfocos": [
                            "Via de Acesso Cirúrgica Obrigatória: Orquiectomia Radical por Via Inguinal (Proibida Biópsia Transescrotal pelo Risco de Disseminação)",
                            "Diferenciação Histopatológica: Seminoma (Alta Radiossensibilidade) vs Não-Seminoma (Teratoma, Carcinoma Embrionário, Coriocarcinoma)"
                        ]
                    }
                ]
            },
            {
                "foco": "Escroto Agudo (Torção Testicular e Orquiepididimite)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial: Torção de Cordão Espermático vs Orquiepididimite Aguda",
                        "sub_subfocos": [
                            "Torção Testicular: Início Hiperagudo, Adolescentes, Testículo Elevado e Horizontalizado, Sinal de Prehn Negativo e Reflexo Cremastérico Ausente",
                            "Orquiepididimite: Início Gradual, Disúria, Febre, Alívio da Dor à Elevação Testicular (Sinal de Prehn Positivo) e Reflexo Cremastérico Presente"
                        ]
                    },
                    {
                        "subfoco": "Janela Cirúrgica de Ouro (< 6 horas) e Orquidopexia Bilateral",
                        "sub_subfocos": [
                            "Emergência Cirúrgica Imediata: Exploração Escrotal de Urgência sem Perda de Tempo com Exames se Forte Suspeita Clínica",
                            "Destorção Testicular, Avaliação da Viabilidade e Fixação Obrigatória do Testículo Contralateral (Orquidopexia Bilateral)"
                        ]
                    }
                ]
            },
            {
                "foco": "Trauma Urológico (Renal, Vesical e Uretral)",
                "subfocos": [
                    {
                        "subfoco": "Trauma Renal: Mecanismos, TC com Contraste e Manejo Não-Operatório",
                        "sub_subfocos": [
                            "Indicações de TC com Contraste: Hematúria Macroscópica, Microematúria com Choque (PAS < 90 mmHg) ou Lesões Desacelerativas",
                            "Classificação da AAST (Graus I a V) e Predomínio do Tratamento Não-Operatório com Repouso e Monitorização em Pacientes Estáveis",
                            "Rotura Vesical Intraperitoneal (Dor Difusa, Indicação Cirúrgica Imediata) vs Extraperitoneal (Associada a Fratura de Pelve, Tratamento com SVD)"
                        ]
                    },
                    {
                        "subfoco": "Trauma de Bexiga e Trauma de Uretra (Anterior vs Posterior)",
                        "sub_subfocos": [
                            "Trauma de Uretra: Sangue no Meato Uretral, Retenção Urinária e Hematoma Perineal (Proibida Cateterização Vesical; Realizar Uretrocistografia)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Afecções Cirúrgicas do Tórax",
        "focos": [
            {
                "foco": "Neoplasias Malignas Pulmonares (Câncer de Pulmão)",
                "subfocos": [
                    {
                        "subfoco": "Tipos Histológicos, Rastreamento por TC de Baixa Dose e Diagnóstico",
                        "sub_subfocos": [
                            "Diferenciação Histológica: Não-Pequenas Células (Adenocarcinoma mais comum em não-fumantes, Carcinoma Epidermoide central) vs Pequenas Células (Oat-Cell, Central, Alta Agressividade)",
                            "Rastreamento Anual com TC de Baixa Dose em Indivíduos de 50-80 Anos com Carga Tabágica >= 20 maços-ano"
                        ]
                    },
                    {
                        "subfoco": "Estadiamento TNM, Avaliação da Reserva Funcional Pulmonar e Ressecção",
                        "sub_subfocos": [
                            "Avaliação Funcional: Espirometria (VEF1 previsto pós-operatório > 30-40%) e Cintilografia Pulmonar",
                            "Tratamento Cirúrgico Curativo para Estádios Iniciais (I e II): Lobectomia Pulmonar Anatômica com Linfadenectomia Mediastinal Sistêmica"
                        ]
                    }
                ]
            },
            {
                "foco": "Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico",
                "subfocos": [
                    {
                        "subfoco": "Toracocentese Diagnóstica, Critérios de Light e Derrame Neoplásico",
                        "sub_subfocos": [
                            "Critérios de Light para Exsudato (Relação Proteína Pleural/Sérica > 0,5; LDH Pleural/Sérico > 0,6; LDH Pleural > 2/3 do limite superior)"
                        ]
                    },
                    {
                        "subfoco": "Empiema Pleural: Fases Fisiopatológicas e Drenagem Torácica / Decorticação",
                        "sub_subfocos": [
                            "Manejo do Derrame Neoplásico Recidivante com Pleurodese Química (Talco / Doxiciclina) ou Cateter Pleural de Longa Permanência",
                            "Fases do Derrame Parapneumônico: Exsudativa (Líquido Fluido, pH > 7,2), Fibrinopurulenta (pH < 7,2, Glicose < 40, Drenagem Obrigatória) e Organizada",
                            "Indicações Cirúrgicas de Pleuroscopia (VATS) para Lise de Aderências e Decorticação Pulmonar Aberta na Fase de Encarceramento"
                        ]
                    }
                ]
            },
            {
                "foco": "Pneumotórax Espontâneo",
                "subfocos": [
                    {
                        "subfoco": "Pneumotórax Espontâneo Primário vs Secundário",
                        "sub_subfocos": [
                            "Primário: Jovens Altos, Magros, Tabagistas, por Ruptura de Blebs Apicais Subpleurais, sem Doença Pulmonar Prévia",
                            "Secundário: Decorrente de Pneumopatia de Base (DPOC com Bolhas, Enfisema, Tuberculose Cavitária, Fibrose Cística)"
                        ]
                    },
                    {
                        "subfoco": "Manejo Inicial, Drenagem Tubular em Selo d'Água e Cirurgia para Recidiva",
                        "sub_subfocos": [
                            "Conduta por Tamanho: Pequeno (< 2 cm na cúpula, assintomático: Observação e O2 a 100%) vs Grande (> 2 cm ou sintomático: Drenagem Torácica)",
                            "Indicações de Tratamento Cirúrgico por Toracoscopia (VATS) com Bullectomia e Pleurodese: 2º Episódio (Recidiva), Fuga Aérea Persistente (> 48-72h) ou Hemopneumotórax"
                        ]
                    }
                ]
            },
            {
                "foco": "Tumores de Mediastino",
                "subfocos": [
                    {
                        "subfoco": "Anatomia Topográfica Mediastinal e Regra dos 4 Ts",
                        "sub_subfocos": [
                            "Mediastino Anterior (Regra dos 4 Ts: Timoma, Teratoma/Células Germinativas, Tireoide Ectópica e 'Terrível' Linfoma)"
                        ]
                    },
                    {
                        "subfoco": "Investigação Radiológica e Abordagem Cirúrgica dos Timomas",
                        "sub_subfocos": [
                            "Mediastino Médio (Cistos Broncogênicos e Pericárdicos, Linfadenopatias) e Mediastino Posterior (Tumores Neuroogênicos: Schwanoma, Neurofibroma)"
                        ]
                    }
                ]
            },
            {
                "foco": "Bronquiectasias e Doenças Pleuropulmonares Supurativas",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia, Tomografia de Alta Resolução e Diagnóstico",
                        "sub_subfocos": [
                            "Tomografia Computadorizada de Tórax com Contraste e Ressonância Magnética para Avaliação de Invasão Vascular e Pericárdica",
                            "Associação de Timoma com Miastenia Gravis e Técnica de Timectomia Radical Transtorácica ou Robótica",
                            "Causas Principais: Sequela de Tuberculose, Infecções Pediátricas Graves na Infância, Fibrose Cística e Discinesia Ciliar"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Clínico de Higiene Brônquica e Ressecção Pulmonar Cirúrgica",
                        "sub_subfocos": [
                            "Manejo Clínico Conservador com Fisioterapia Respiratória, Antibioticoterapia Guiada por Escarro e Broncodilatadores",
                            "Indicações Cirúrgicas de Lobectomia / Segmentectomia: Doença Localizada Refratária ao Tratamento Clínico ou Hemoptise Maciça Ameaçadora à Vida"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Cirurgia Pediátrica e Neonatal",
        "focos": [
            {
                "foco": "Atresia de Esôfago e Fístula Traqueoesofágica",
                "subfocos": [
                    {
                        "subfoco": "Classificação Anatômica, Diagnóstico Neonatal e Sonda Orogástrica",
                        "sub_subfocos": [
                            "Tipo Mais Frequente (Tipo C / III de Gross: 85% dos casos): Atresia Proximal com Fístula Traqueoesofágica Distal",
                            "Quadro Clínico Clássico: Sialorréia Abundante, Regurgitação das Primeiras Mamadas, Sufocamento e Impossibilidade de Progressão da Sonda Orogástrica (Para a 10-12 cm)"
                        ]
                    },
                    {
                        "subfoco": "Propedêutica Radiológica (Presença de Ar no Abdome) e Correção Cirúrgica",
                        "sub_subfocos": [
                            "Radiografia Simples: Sonda Enovelada no Coto Proximal e Presença de Ar Gastrointestinal Confirmando Fístula Distal",
                            "Preparo Pré-Operatório com Aspiração Contínua do Coto Proximal e Cirurgia com Ligadura da Fístula e Anastomose Primária do Esôfago"
                        ]
                    }
                ]
            },
            {
                "foco": "Estenose Hipertrófica do Piloro",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico (Vômitos Não-Biliosos em Jato) e Distúrbio Hidroeletrolítico",
                        "sub_subfocos": [
                            "Apresentação Típica: Lactente Masculino de 3 a 6 Semanas com Vômitos Não-Biliosos Pós-Prandiais Progressivos 'Em Jato' e Fome Voraz",
                            "Distúrbio Ácido-Base Típico Patognomônico: Alcalose Metabólica Hipoclorêmica e Hipocalêmica por Perda de Ácido Clorídrico Gástrico"
                        ]
                    },
                    {
                        "subfoco": "Diagnóstico Ultrassonográfico e Piloromiotomia de Fredet-Ramstedt",
                        "sub_subfocos": [
                            "Exame Físico (Palpação da 'Oliva Pilórica' em Hipocôndrio Direito) e Ultrassom (Espessura Muscular Pilórica >= 3-4 mm e Comprimento >= 14-16 mm)",
                            "Preparo Obrigatório com Correção Hidroeletrolítica Antes de Qualquer Cirurgia, seguido de Piloromiotomia Extramucosa de Ramstedt"
                        ]
                    }
                ]
            },
            {
                "foco": "Hérnia Diafragmática Congênita",
                "subfocos": [
                    {
                        "subfoco": "Hérnia de Bochdalek vs Morgagni e Fisiopatologia da Hipoplasia Pulmonar",
                        "sub_subfocos": [
                            "Localização Mais Frequente: Hérnia Posterolateral Esquerda de Bochdalek (85-90% dos casos) com Herniação de Alças Intestinais para o Tórax",
                            "Fisiopatologia Crítica: Hipoplasia Pulmonar Bilateral Grave e Hipertensão Pulmonar Persistente do Neonato"
                        ]
                    },
                    {
                        "subfoco": "Manejo Ventilatório Neonatal Imediato e Momento da Correção Cirúrgica",
                        "sub_subfocos": [
                            "Conduta em Sala de Parto: Intubação Orotraqueal Imediata (Proibida Ventilação com Bolsa e Máscara para Evitar Distensão de Alças) e SOG Calibrosa",
                            "Estabilização Hemodinâmica e Respiratória Prévia com Óxido Nítrico Inalatório antes da Correção Cirúrgica Eletiva após 24-48h"
                        ]
                    }
                ]
            },
            {
                "foco": "Malformações Anorretais (Ânus Imperfurado)",
                "subfocos": [
                    {
                        "subfoco": "Classificação (Lesões Altas vs Baixas) e Fístulas Perineais / Urinárias",
                        "sub_subfocos": [
                            "Exame Físico Perineal Inicial após 16-24 Horas de Vida: Identificação de Fístulas no Períneo, Vestíbulo Vaginal ou Sistema Urinário",
                            "Lesões Baixas (Fístula Perineal Visível, Abaixo do Músculo Elevador do Ânus) vs Lesões Altas (Sem Fístula Externa ou Fístula Retourinária/Retovaginal)"
                        ]
                    },
                    {
                        "subfoco": "Invertograma / Radiografia em Posição Prona e Conduta (Anoplastia vs Colostomia)",
                        "sub_subfocos": [
                            "Propedêutica Radiológica (Invertograma ou Radiografia com Bacia Elevada após 24h) para Medir a Distância entre a Bolsa Retal e a Pele",
                            "Conduta Cirúrgica: Lesões Baixas tratadas com Anoplastia Sagital Posterior Imediata; Lesões Altas tratadas com Colostomia em Alça e Reconstrução Tardia (Pena)"
                        ]
                    }
                ]
            },
            {
                "foco": "Gastrosquise e Onfalocele",
                "subfocos": [
                    {
                        "subfoco": "Diferenciação Embriológica e Anatômica: Gastrosquise vs Onfalocele",
                        "sub_subfocos": [
                            "Gastrosquise: Defeito Paraumbilical à Direita do Cordão, Sem Membrana de Cobertura, Alças Espessadas e Inflamadas pelo Contato com Líquido Amniótico"
                        ]
                    },
                    {
                        "subfoco": "Cuidados Imediatos em Sala de Parto e Fechamento Primário vs Silo Gradual",
                        "sub_subfocos": [
                            "Onfalocele: Defeito Central no Ânulo Umbilical, Coberto por Membrana de Peritônio e Âmnio, Frequente Associação com Anomalias Cardíacas e Genéticas",
                            "Proteção Térmica e Asséptica Imediata das Alças com Plástico Estéril e Sonda Gástrica Aberta sem Compressão dos Vasos Mesentéricos",
                            "Redução das Vísceras: Fechamento Primário em Tempo Único vs Redução Escalonada com Silo de Molares para Evitar Síndrome Compartimental Abdominal"
                        ]
                    }
                ]
            },
            {
                "foco": "Invaginação Intestinal (Intussuscepção)",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico (Dor Paroxística, Fezes em Geleia de Framboesa) e Ultrassom",
                        "sub_subfocos": [
                            "Tríade Semiológica: Crises de Choro Intenso com Flexão de Pernas, Vômitos e Eliminação de Fezes com Sangue e Muco ('Geleia de Framboesa')"
                        ]
                    },
                    {
                        "subfoco": "Redução Hidrostática / Pneumática vs Indicação Cirúrgica de Laparotomia",
                        "sub_subfocos": [
                            "Primeira Linha no Paciente Estável sem Sinais de Peritonite: Redução Não-Cirúrgica com Enema Pneumático ou Hidrostático Guiado por USG/Fluoroscopia",
                            "Indicações Cirúrgicas Absolutas: Sinais de Peritonite, Perfuração Intestinal, Pneumoperitônio ou Falha da Redução Não- Invasiva"
                        ]
                    }
                ]
            },
            {
                "foco": "Criptorquidia e Hérnias Congênitas",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia da Descida Testicular, Exame Físico e Idade para Correção",
                        "sub_subfocos": [
                            "Diagnóstico Clínico por Palpação em Posição de Alfaiate (Testículo Retrátil vs Ectópico vs Criptorquídico)",
                            "Momento Cirúrgico Canônico: Intervenção entre 6 e 12 Meses de Idade (Risco Aumentado de Infertilidade e Neoplasia se Não Tratado)"
                        ]
                    },
                    {
                        "subfoco": "Técnica de Orquidopexia e Hérnia Inguinal Indireta Congênita na Infância",
                        "sub_subfocos": [
                            "Orquidopexia por Via Inguinal com Dissecção Funicular e Fixação do Testículo em Bolsa Escrotal Subcutânea",
                            "Hérnia Inguinal Pediátrica: Patência do Conduto Peritoniovaginal (Tratamento com Ligadura Alta do Saco Herniário sem Prótese)"
                        ]
                    }
                ]
            },
            {
                "foco": "Megacólon Congênito (Doença de Hirschsprung)",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia da Aganglionose Retal, Atraso na Eliminação de Mecônio e Toque",
                        "sub_subfocos": [
                            "Fisiopatologia: Ausência Congênita de Plexos Nervosos Entéricos (Meissner e Auerbach) no Segmento Retal Distal",
                            "Apresentação Neonatal Típica: Atraso na Eliminação de Mecônio (> 48h), Distensão Abdominal e Saída Explosiva de Fezes/Gases ao Toque Retal"
                        ]
                    },
                    {
                        "subfoco": "Enema Opaco, Manometria Anorretal, Biópsia Retal e Cirurgia de Abaixamento",
                        "sub_subfocos": [
                            "Enema Opaco demonstrando Cone de Transição e Cirurgias Definitivas de Abaixamento de Cólon (Técnicas de Duhamel, Soave ou Swenson)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Cirurgia Cervical e Tireoidiana",
        "focos": [
            {
                "foco": "Nódulos e Câncer de Tireoide Cirúrgico",
                "subfocos": [
                    {
                        "subfoco": "Avaliação Ultrassonográfica (Sistema ACR TI-RADS) e PAAF com Classificação de Bethesda",
                        "sub_subfocos": [
                            "Critérios Ultrassonográficos de Suspeita (Nódulo Sólido, Hipoecoico, Mais Alto que Largo, Margens Irregulares, Microcalcificações)",
                            "Classificação Citopatológica de Bethesda (Bethesda II: Benigno; Bethesda III/IV: Atipia/Neoplasia Folicular; Bethesda V/VI: Maligno/Papilífero)"
                        ]
                    },
                    {
                        "subfoco": "Carcinoma Papilífero e Folicular: Tireoidectomia Total vs Parcial e Esvaziamento Cervical",
                        "sub_subfocos": [
                            "Carcinoma Papilífero (Tipo Mais Comum, Disseminação Linfática, Corpos de Psamoma) e Indicação de Tireoidectomia com Esvaziamento Central",
                            "Carcinoma Folicular (Disseminação Hematogênica) e Complicações Cirúrgicas (Lesão do Nervo Laríngeo Recorrente e Hipoparatireoidismo)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hiperparatireoidismo e Cirurgia das Paratireoides",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial: Hiperparatireoidismo Primário, Secundário e Terciário",
                        "sub_subfocos": [
                            "Primário: Elevação Concomitante de Cálcio Sérico e PTH por Adenoma Único de Paratireoide (85% dos casos)",
                            "Secundário: Decorrente de Insuficiência Renal Crônica (Hipocalcemia/Hiperfosfatemia com PTH Alto Reacional)"
                        ]
                    },
                    {
                        "subfoco": "Localização Pré-Operatória (Cintilografia com Sestamibi) e Paratireoidectomia",
                        "sub_subfocos": [
                            "Exames de Localização: Cintilografia com 99mTc-Sestamibi e Ultrassonografia Cervical de Alta Resolução",
                            "Paratireoidectomia Minimamente Invasiva com Dosagem Intraoperatória de PTH (Critério de Queda > 50% em 10 Minutos)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Laringe e Cavidade Oral",
                "subfocos": [
                    {
                        "subfoco": "Fatores de Risco (Tabagismo e Etilismo Sinergistas), Lesões Precursoras e Biópsia",
                        "sub_subfocos": [
                            "Sinergia de Risco: Associação de Tabagismo Intenso e Consumo de Álcool Aumenta Exponencialmente o Risco de Carcinoma Epidermoide (CEC)",
                            "Lesões Potencialmente Malignas da Cavidade Oral: Leucoplasia e Eritroplastia (Maior Potencial de Transformação Maligna)"
                        ]
                    },
                    {
                        "subfoco": "Quadro Clínico (Disfonia Persistente > 3 semanas) e Laringectomia com Traqueostomia",
                        "sub_subfocos": [
                            "Sinal de Alerta Canônico: Rouquidão / Disfonia Progressiva por mais de 3 Semanas em Fumante exige Videolaringoscopia Imediata",
                            "Tratamento de Acordo com o Estádio: Radioterapia Exclusiva em Lesões Glóticas Iniciais vs Laringectomia Total com Esvaziamento Cervical"
                        ]
                    }
                ]
            },
            {
                "foco": "Tumores de Glândulas Salivares",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial de Nódulos em Parótida e Submandibular",
                        "sub_subfocos": [
                            "Regra de Proporcionalidade: 80% dos Tumores Ocorrem na Parótida e 80% são Benignos; Nas Glândulas Menores, Maioria é Maligna",
                            "Tumor Mais Comum: Adenoma Pleomórfico (Benigno, Crescimento Lento, Móvel) e Tumor de Warthin (Cistoadenoma Papilar Linfomatoso em Fumantes)"
                        ]
                    },
                    {
                        "subfoco": "Parotidectomia Superficial com Preservação do Nervo Facial e Carcinoma Mucoepidermoide",
                        "sub_subfocos": [
                            "Parotidectomia Superficial / Total com Dissecção e Preservação Obrigatória dos Ramos do Nervo Facial (VII Par Craniano)",
                            "Neoplasia Maligna Mais Comum: Carcinoma Mucoepidermoide e Carcinoma Adenoide Cístico (Invasão Perineural Típica)"
                        ]
                    }
                ]
            },
            {
                "foco": "Cistos Congênitos Cervicais (Tireoglosso e Branquial)",
                "subfocos": [
                    {
                        "subfoco": "Cisto do Ducto Tireoglosso: Linha Média e Cirurgia de Sistrunk",
                        "sub_subfocos": [
                            "Apresentação: Massa Cística Indolor na Linha Média Cervical que se Eleva à Deglutição e Protrusão da Língua",
                            "Cirurgia de Sistrunk: Excisão Completa do Cisto, do Trato Fictício e da Porção Central do Corpo do Osso Hioide para Prevenir Recidiva"
                        ]
                    },
                    {
                        "subfoco": "Cisto de Fenda Branquial: Borda Anterior do Esternocleidomastoideo",
                        "sub_subfocos": [
                            "Origem Embriológica Mais Frequente: Segunda Fenda Branquial (Localizado na Borda Anterior do Músculo ECM, Ângulo da Mandíbula)",
                            "Diagnóstico Diferencial com Linfonodopatias e Exérese Cirúrgica Completa sem Romper a Cápsula"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Queimaduras e Cirurgia Reparadora",
        "focos": [
            {
                "foco": "Queimaduras Térmicas, Químicas e Elétricas (Reposição Volêmica e Conduta)",
                "subfocos": [
                    {
                        "subfoco": "Avaliação da Área Queimada (Regra dos Nove de Wallace) e Fórmula de Parkland",
                        "sub_subfocos": [
                            "Cálculo da Superfície Corpórea Queimada (SCQ) pela Regra dos Nove de Wallace em Adultos (Cabeça 9%, Braços 9% cada, Tronco Ant 18%, Post 18%, Pernas 18% cada, Genitália 1%)",
                            "Fórmula de Parkland Modificada: 2 a 4 mL x Peso (kg) x % SCQ de Ringer Lactato (Metade nas Primeiras 8h a contar da Queimadura e Metade nas 16h seguintes)"
                        ]
                    },
                    {
                        "subfoco": "Queimaduras Circunferenciais (Escarotomia) e Lesão por Inalação",
                        "sub_subfocos": [
                            "Queimaduras de 3º Grau Circunferenciais em Tronco ou Membros com Síndrome Compartimental (Indicação de Escarotomia Descompressiva Imediata)",
                            "Lesão por Inalação de Fumaça (Vibriças Queimadas, Fuligem na Orofaringe, Escarro Carbonáceo) exigindo Intubação Precoce"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Pele Não-Melanoma (CBC e CEC) Cirúrgico",
                "subfocos": [
                    {
                        "subfoco": "Carcinoma Basocelular (CBC): Subtipos Clínicos e Margens Cirúrgicas",
                        "sub_subfocos": [
                            "Neoplasia Maligna Mais Frequente: CBC Nodular (Pápula Perlácea com Telangiectasias Centrais em Áreas Fotoexpostas)",
                            "Margens Cirúrgicas de Segurança: 4 mm para Lesões de Baixo Risco e Cirurgia Micrográfica de Mohs em Áreas Nobres da Face"
                        ]
                    },
                    {
                        "subfoco": "Carcinoma Espinocelular (CEC) e Ceratose Actínica",
                        "sub_subfocos": [
                            "Lesão Precursora: Ceratose Actínica; CEC com Placa Ulcerada, Crostosa, de Crescimento Rápido e Risco de Metástase Linfática",
                            "Margens de Ressecção de 4 a 6 mm (ou 10 mm em Alto Risco) e Úlcera de Marjolin (CEC sobre Cicatriz de Queimadura Antiga)"
                        ]
                    }
                ]
            },
            {
                "foco": "Melanoma Cutâneo Cirúrgico",
                "subfocos": [
                    {
                        "subfoco": "Regra do ABCDE, Biópsia Excisional e Espessura de Breslow",
                        "sub_subfocos": [
                            "Avaliação Dermatoscópica Canônica com Regra do ABCDE (Assimetria, Bordas Irregulares, Cores Múltiplas, Diâmetro > 6 mm e Evolução)",
                            "Biópsia Excisional com Margem Estreita de 1-2 mm e Índice de Breslow (Medida Histológica da Invasão em Milímetros da Granulosa até a Célula Mais Profunda)"
                        ]
                    },
                    {
                        "subfoco": "Ampliação de Margens e Biópsia de Linfonodo Sentinela (BLS)",
                        "sub_subfocos": [
                            "Margens Definitivas de Ampliação: In Situ (0,5 cm), Breslow <= 1 mm (1,0 cm), Breslow 1,01 a 2,0 mm (1 a 2 cm) e Breslow > 2 mm (2,0 cm)",
                            "Indicação Formal de Linfonodo Sentinela: Melanomas com Breslow >= 0,8 mm (ou < 0,8 mm com Ulceração Histológica)"
                        ]
                    }
                ]
            },
            {
                "foco": "Retalhos e Enxertos Cutâneos",
                "subfocos": [
                    {
                        "subfoco": "Princípios da Escada Reconstrutiva e Enxertos de Pele (Parcial vs Total)",
                        "sub_subfocos": [
                            "Diferença Biológica: Enxertos de Pele Parcial (Epiderme e Parte da Derme: Fácil Pega, Maior Contração Secundária) vs Pele Total (Menor Contração, Estética Superior)",
                            "Fases de Integração do Enxerto: Embebição Plasmática (Primeiras 48h), Inosculação Capilar e Neovascularização"
                        ]
                    },
                    {
                        "subfoco": "Retalhos Cutâneos Locais e Microcirurgia Reconstrutiva",
                        "sub_subfocos": [
                            "Definição de Retalho: Tecido Transferido Mantendo seu Próprio Pedículo Vascular Nutridor (Retalhos de Avanço, Rotação e Transposição)",
                            "Indicações de Retalhos: Cobertura de Estruturas Nobres Expostas (Ossos Desprovidos de Periósteo, Tendões Desprovidos de Paratendão e Vasos)"
                        ]
                    }
                ]
            },
            {
                "foco": "Feridas Complexas e Úlceras por Pressão",
                "subfocos": [
                    {
                        "subfoco": "Estadiamento de Úlceras por Pressão (Estágios 1 a 4) e Prevenção",
                        "sub_subfocos": [
                            "Estadiamento Canônico: Estágio 1 (Eritema que Não Desaparece à Pressão em Pele Íntegra); Estágio 2 (Perda Parcial da Derme, Bolha); Estágio 3 (Perda Total da Pele com Exposição de Gordura); Estágio 4 (Exposição de Músculo/Osso)",
                            "Prevenção Primária: Mudança de Decúbito a Cada 2 Horas, Colchão Pneumático de Pressão Alternada e Avaliação com Escala de Braden"
                        ]
                    },
                    {
                        "subfoco": "Desbridamento Cirúrgico, Curativos Especiais e Terapia por Pressão Negativa",
                        "sub_subfocos": [
                            "Tipos de Desbridamento: Cirúrgico Instrumental (Necrose Seca/Úmida Extensa) vs Autolítico e Enzimático (Colagenase)",
                            "Terapia por Pressão Negativa (Curativo a Vácuo): Redução do Edema, Estímulo à Angiogênese e Formação de Tecido de Granulação Saudável"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Anestesia e Controle da Dor",
        "focos": [
            {
                "foco": "Avaliação Pré-Anestésica (Classificação ASA)",
                "subfocos": [
                    {
                        "subfoco": "Classificação do Estado Físico ASA (I a VI e Sufixo de Emergência)",
                        "sub_subfocos": [
                            "Definições: ASA I (Saudável); ASA II (Doença Sistêmica Leve sem Limitação: HAS controlada, Tabagista); ASA III (Doença Sistêmica Grave com Limitação Funcional); ASA IV (Ameaça Constante à Vida); ASA V (Moribundo)",
                            "Adição do Sufixo 'E' para Cirurgias Realizadas em Caráter de Emergência (Ex: ASA II-E)"
                        ]
                    },
                    {
                        "subfoco": "Tempo de Jejum Pré-Operatório e Manejo de Medicações Contínuas",
                        "sub_subfocos": [
                            "Tempos Mínimos de Jejum Canônicos: Líquidos Claros sem Resíduos (2 Horas), Leite Materno (4 Horas), Refeição Leve (6 Horas) e Refeição Gordurosa (8 Horas)",
                            "Manejo Farmacológico: Manter Anti-hipertensivos (Exceto IECA/BRA que Devem ser Suspensos no Dia) e Suspender Hipoglicemiantes Orais e Anticoagulantes"
                        ]
                    }
                ]
            },
            {
                "foco": "Anestesia Geral (Inalação, Venosa e Bloqueadores Neuromusculares)",
                "subfocos": [
                    {
                        "subfoco": "Hipnóticos Venosos (Propofol, Etomidato, Cetamina) e Opioides",
                        "sub_subfocos": [
                            "Propofol (Vasodilatador e Hipotensor, Excelente para Via Aérea) vs Etomidato (Estabilidade Hemodinâmica Ideal no Choque, Inibição da Adrenal)",
                            "Cetamina (Efeito Simpaticomimético, Broncodilatador, Ideal na Asma e Choque) e Fentanil/Remifentanil na Analgesia Intraoperatória"
                        ]
                    },
                    {
                        "subfoco": "Bloqueadores Neuromusculares (Succinilcolina vs Rocurônio) e Reversão com Sugamadex",
                        "sub_subfocos": [
                            "Succinilcolina: Despolarizante, Ação Ultrarrápida, Contraindicada em Grandes Queimados, Trauma Grave e Hipercalemia",
                            "Rocurônio: Não-Despolarizante, Alternativa em Sequência Rápida e Reversão Específica Rápida com Sugamadex"
                        ]
                    }
                ]
            },
            {
                "foco": "Bloqueios Neuroaxiais (Raquianestesia e Peridural)",
                "subfocos": [
                    {
                        "subfoco": "Anatomia do Neuroeixo, Camadas Transpassadas e Raquianestesia",
                        "sub_subfocos": [
                            "Camadas Transpassadas na Punção Lombar: Pele, Tecido Subcutâneo, Ligamento Supraespinhoso, Interespinhoso, Flavo, Espaço Peridural, Dura-máter e Aracnoide",
                            "Raquianestesia (Espaço Subaracnoideo com Líquor, Dose Baixa, Início Imediato, Bloqueio Motor Intenso e Risco de Hipotensão por Bloqueio Simpático)"
                        ]
                    },
                    {
                        "subfoco": "Anestesia Peridural e Cefaleia Pós-Punção Dural (CPPD)",
                        "sub_subfocos": [
                            "Peridural: Identificação com Perda de Resistência (Agulha de Tuohy), Permite Cateter Contínuo e Analgesia de Parto/Pós- Operatória",
                            "Cefaleia Pós-Punção de Dura-Máter: Caráter Ortostático Típico e Tratamento com Repouso, Cafeína e Tampão Sanguíneo Peridural (Blood Patch)"
                        ]
                    }
                ]
            },
            {
                "foco": "Anestésicos Locais e Toxicidade Sistêmica",
                "subfocos": [
                    {
                        "subfoco": "Farmacologia dos Anestésicos Locais: Amino-Ésteres vs Amino-Amidas",
                        "sub_subfocos": [
                            "Diferenciação Química: Amino-Amidas (Lidocaína, Bupivacaína, Ropivacaína: Dois 'Is' no Nome, Metabolismo Hepático) vs Ésteres (Procaína)",
                            "Dose Máxima Segura de Lidocaína (5 mg/kg sem Adrenalina e 7 mg/kg com Adrenalina) e Efeito Vasoconstritor da Adrenalina"
                        ]
                    },
                    {
                        "subfoco": "Intoxicação Sistêmica por Anestésicos Locais (LAST) e Emulsão Lipídica",
                        "sub_subfocos": [
                            "Sinais de LAST: Gosto Metálico, Dormência Perioral, Zumbido, Convulsões seguidas de Arritmias Ventriculares e Colapso Cardiovascular (Cardiotoxicidade da Bupivacaína)",
                            "Tratamento Específico Imediato de Resgate: Emulsão Lipídica a 20% Intravenosa (Lipid Sink)"
                        ]
                    }
                ]
            },
            {
                "foco": "Dor Pós-Operatória e Manejo Analgésico",
                "subfocos": [
                    {
                        "subfoco": "Analgesia Multimodal Poupadores de Opioides",
                        "sub_subfocos": [
                            "Conceito de Analgesia Multimodal: Associação de Dipirona/Paracetamol + AINEs + Anestesia Regional para Reduzir Necessidade de Opioides",
                            "Prevenção de Náuseas e Vômitos Pós-Operatórios (NVPO) com Dexametasona e Ondansetrona (Escore de Apfel)"
                        ]
                    },
                    {
                        "subfoco": "Analgesia Controlada pelo Paciente (PCA) e Complicações de Opioides",
                        "sub_subfocos": [
                            "Uso de PCA com Morfina Intravenosa com Intervalo de Bloqueio Seguro e Monitorização de Sedação e Depressão Respiratória",
                            "Reversão Imediata de Depressão Respiratória Grave por Opioides com Naloxona Titulada"
                        ]
                    }
                ]
            },
            {
                "foco": "Hipertermia Maligna",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia, Agentes Desencadeantes e Quadro Clínico Precoce",
                        "sub_subfocos": [
                            "Canalopatia Autossômica Dominante do Receptor de Rianodina (RYR1) com Liberação Descontrolada de Cálcio no Retículo Sarcoplasmático",
                            "Agentes Gatilho: Anestésicos Inalatórios Halogenados (Isoflurano, Sevoflurano, Desflurano) e Succinilcolina",
                            "Primeiro Sinal Mais Precoce e Sensível: Aumento Inexplicável do CO2 Expirado (Hipercapnia / EtCO2) e Rigidez de Masseter, Taquicardia e Hipertermia Tardia"
                        ]
                    },
                    {
                        "subfoco": "Protocolo de Emergência Imediata e Antídoto Específico (Dantroleno)",
                        "sub_subfocos": [
                            "Ações Imediatas: Interromper Imediatamente os Anestésicos Gatilho, Hiperventilar com O2 a 100%, Trocar o Circuito e Resfriamento Ativo"
                        ]
                    }
                ]
            }
        ]
    }
]
};
