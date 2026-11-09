import { SpecialtyHierarchy } from "@/types";

export const obstetriciaHierarchy: SpecialtyHierarchy = {
  "especialidade": "Obstetrícia",
  "temas": [
    {
        "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
        "focos": [
            {
                "foco": "Modificações Fisiológicas da Gravidez (Cardiovasculares, Renais, Hematológicas)",
                "subfocos": [
                    {
                        "subfoco": "Modificações Cardiovasculares e Hematológicas",
                        "sub_subfocos": [
                            "Aumento do Débito Cardíaco em 30-50%, Queda da RVP e Queda Pressórica Fisiológica no 2º Trimestre",
                            "Hipervolemia Fisiológica e Anemia Dilucional (Ponto de Corte de Anemia: Hb < 11 g/dL)",
                            "Estado Pró-Trombótico Fisiológico e Edema em MMII por Compressão da Veia Cava Inferior"
                        ]
                    },
                    {
                        "subfoco": "Modificações Renais, Digestivas e Respiratórias",
                        "sub_subfocos": [
                            "Aumento da TFG em 50% com Redução dos Níveis Normais de Ureia e Creatinina e Glicosúria Fisiológica",
                            "Ação da Progesterona: Relaxamento do Esfíncter Esofágico Inferior (Pirose) e Hipomotilidade Biliar",
                            "Alcalose Respiratória Compensada por Aumento do Volume Corrente"
                        ]
                    }
                ]
            },
            {
                "foco": "Rotina do Pré-Natal de Baixo Risco (Consultas, Exames e Calendário)",
                "subfocos": [
                    {
                        "subfoco": "Cronograma e Consultas de Rotina (MS/Febrasgo)",
                        "sub_subfocos": [
                            "Periodicidade Mínima Recomendada: Mensal até 28 Semanas, Quinzenal de 28 a 36 Semanas e Semanal até o Parto",
                            "Exames Laboratoriais Obrigatórios do 1º Trimestre (Tipagem/Rh, Coombs Indireto, Hemograma, Glicemia, EAS/Urocultura, Sorologias)"
                        ]
                    },
                    {
                        "subfoco": "Exames Complementares do 2º e 3º Trimestres",
                        "sub_subfocos": [
                            "Repetição Obrigatória no 3º Trimestre (VDRL, HIV, Hepatite B, Hemograma e Urocultura)",
                            "Rastreamento de Diabetes Gestacional com TOTG 75g entre 24 e 28 Semanas"
                        ]
                    }
                ]
            },
            {
                "foco": "Vacinação e Suplementação na Gestação (Ácido Fólico, Ferro)",
                "subfocos": [
                    {
                        "subfoco": "Calendário Vacinal da Gestante",
                        "sub_subfocos": [
                            "dTpa (Tríplice Bacteriana Acelular) Obrigatória a Partir da 20ª Semana a Cada Gestação (Proteção do Recém-Nascido contra Coqueluche)",
                            "Vacinas Recomendadas: Hepatite B, Influenza e COVID-19",
                            "Contraindicação Absoluta de Vacinas de Vírus Vivos Atenuados (Tríplice Viral, Varicela, Febre Amarela)"
                        ]
                    },
                    {
                        "subfoco": "Suplementação de Ácido Fólico e Ferro",
                        "sub_subfocos": [
                            "Ácido Fólico Pré-Concepcional: 0,4 mg/dia habitual vs 4-5 mg/dia se Alto Risco de DTN ou Anticonvulsivantes",
                            "Suplementação Universal de Ferro Elementar (40 mg/dia de Ferro a Partir da 20ª Semana até o Final da Lactação)"
                        ]
                    }
                ]
            },
            {
                "foco": "Cálculo da Idade Gestacional e Data Provável do Parto",
                "subfocos": [
                    {
                        "subfoco": "Regra de Nägele e Estimativa Clínica",
                        "sub_subfocos": [
                            "Cálculo da Data Provável do Parto (DPP): Somar 7 Dias ao Primeiro Dia da DUM e Somar 9 Meses (ou Subtrair 3 Meses)",
                            "Altura do Fundo Uterino (AFU): Correlação Centimétrica entre 20 e 32 Semanas"
                        ]
                    },
                    {
                        "subfoco": "Datação Ultrassonográfica da Gestação",
                        "sub_subfocos": [
                            "Comprimento Cabeça-Nádega (CCN) no 1º Trimestre (6 a 12 Semanas) como Parâmetro Mais Preciso (Margem de Erro de 3 a 5 Dias)",
                            "Diâmetro Biparietal (DBP) e Comprimento do Fêmur no 2º Trimestre"
                        ]
                    }
                ]
            },
            {
                "foco": "Estática Fetal e Diagnóstico da Gravidez",
                "subfocos": [
                    {
                        "subfoco": "Manobras de Leopold e Relações Útero-Fetais",
                        "sub_subfocos": [
                            "Os 4 Tempos de Leopold: 1º Fundo Uterino; 2º Situação e Dorso Fetal; 3º Apresentação e Mobilidade; 4º Insinuação e Atitude",
                            "Conceitos de Situação (Longitudinal, Transversa), Apresentação (Cefálica, Pélvica, Córmica) e Posição (Dorso Direita/Esquerda)"
                        ]
                    },
                    {
                        "subfoco": "Diagnóstico Clínico e Imunológico da Gravidez",
                        "sub_subfocos": [
                            "Sinais de Presunção (Náuseas, Aumento Mamário, Atraso Menstrual), Probabilidade (Amolecimento do Colo / Sinal de Hegar, Coloração Violácea da Vulva / Sinal de Jacquemier-Chadwick) e Certeza (BCF ao Sonar > 10-12s, Percepção de Movimentos Fetais pelo Examinador > 18-20s)",
                            "Fração Beta do hCG no Sangue e Zona Discriminatória Ultrassonográfica"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Hemorragias da Primeira Metade da Gravidez",
        "focos": [
            {
                "foco": "Abortamento Espontâneo e suas Formas Clínicas (Ameaça, Inevitável, Incompleto, Retido, Infectado)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial das Formas Clínicas de Abortamento",
                        "sub_subfocos": [
                            "Ameaça de Abortamento: Colo Fechado, Sangramento Moderado, BCF Presente, Vitalidade Mantida (Repouso e Abstinência Sexual)",
                            "Abortamento Inevitável: Colo Aberto com Sangramento Intenso e Cólica, Feto em Expulsão",
                            "Abortamento Incompleto: Colo Aberto com Restos Ovulares em Cavidade à USG (Endométrio Heterogêneo > 15 mm)",
                            "Abortamento Completo: Colo Fechado, Sangramento Cessado e Cavidade Uterina Vazia",
                            "Abortamento Retido: Embrião >= 7 mm sem Batimentos Cardíacos ou Saco Gestacional >= 25 mm sem Embrião com Colo Fechado",
                            "Abortamento Infectado / Séptico: Febre, Odor Fétido, Secreção Purulenta, Dor Pélvica Intensa (Internação, Antibioticoterapia EV Tripla e Esvaziamento Uterino Imediato)"
                        ]
                    },
                    {
                        "subfoco": "Métodos de Esvaziamento Uterino e Imunoprofilaxia Rh",
                        "sub_subfocos": [
                            "Aspiração Manual Intrauterina (AMIU) até 12 Semanas (Menor Risco de Perfuração e Sinéquias em Relação à Curetagem)",
                            "Curetagem Uterina Instrumental (Indicações após 12 Semanas ou Ausência de AMIU)",
                            "Manejo Farmacológico com Misoprostol e Profilaxia Obrigatória com Imunoglobulina Anti-D em Mulheres Rh Negativo Não Sensibilizadas"
                        ]
                    }
                ]
            },
            {
                "foco": "Abortamento Recorrente e Incompetência Istmocervical",
                "subfocos": [
                    {
                        "subfoco": "Incompetência Istmocervical (IIC)",
                        "sub_subfocos": [
                            "História de Perdas Fetais Tardias Repetitivas (2º Trimestre) Habitualmente Indolores, Rápidas, com Feto Vivo e Dilatação Precoce",
                            "Tratamento Eletivo de Escolha: Cerclagem Uterina pela Técnica de McDonald entre 12 e 16 Semanas de Gestação",
                            "Cerclagem de Emergência / Resgate com Colo Dilatado e Bolsa Amniótica Prolabada"
                        ]
                    },
                    {
                        "subfoco": "Investigação do Abortamento de Repetição",
                        "sub_subfocos": [
                            "Definição: >= 2 a 3 Perdas Espontâneas Consecutivas",
                            "Rastreamento de Síndrome do Anticorpo Antifosfolípide (SAF), Cariótipo do Casal e Malformações Uterinas (Útero Septado)"
                        ]
                    }
                ]
            },
            {
                "foco": "Gravidez Ectópica",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Clínico e Ultrassonográfico da Ectópica",
                        "sub_subfocos": [
                            "Tríade Clássica: Atraso Menstrual, Sangramento Vaginal de Primeiro Trimestre e Dor Pélvica Unilateral",
                            "Fatores de Risco Maiores: História de Gravidez Ectópica Prévia, Doença Inflamatória Pélvica (DIP) e Cirurgia Tubária Prévia",
                            "Zona Discriminatória do Beta-hCG (>= 1.500 a 2.000 mUI/mL sem Saco Gestacional Tópico Intrauterino à USG Transvaginal)"
                        ]
                    },
                    {
                        "subfoco": "Manejo Clínico com Metotrexato vs Cirúrgico",
                        "sub_subfocos": [
                            "Critérios Rígidos para Uso de Metotrexato (MTX 50 mg/m2 IM): Estabilidade Hemodinâmica, Massa Anexial Íntegra < 3,5 cm, Ausência de BCF e Beta-hCG < 5.000 mUI/mL",
                            "Acompanhamento do MTX com Dosagem nos Dias 4 e 7 (Queda esperada >= 15%)",
                            "Tratamento Cirúrgico: Salpingectomia Videolaparoscópica (Instabilidade Hemodinâmica ou Rotura Tubária com Choque) vs Salpingostomia Linear (Desejo de Preservação Tubária)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença Trofoblástica Gestacional (Mola Hidatiforme e Neoplasias)",
                "subfocos": [
                    {
                        "subfoco": "Mola Hidatiforme Completa vs Incompleta (Parcial)",
                        "sub_subfocos": [
                            "Mola Completa: Fecundação de Óvulo Vazio por Espermatozoide Diploide (46,XX), Ausência de Embrião, Vilosidades Edemaciadas Difusas (\"Cachos de Uva\"), Níveis Altíssimos de Beta-hCG e Risco de Malignização de 15-20%",
                            "Mola Incompleta: Fecundação de Óvulo Normal por 2 Espermatozoides (Triploidia 69,XXY), Presença de Tecido Fetal / Embrião e Risco Menor de Malignização (2-5%)",
                            "Imagem Ultrassonográfica em \"Tempestade de Neve\" ou \"Flocos de Neve"
                        ]
                    },
                    {
                        "subfoco": "Esvaziamento Uterino e Seguimento Pós-Molar",
                        "sub_subfocos": [
                            "Esvaziamento Uterino de Escolha por Vácuo-Aspiração Elétrica ou AMIU com Envio para Histopatológico",
                            "Seguimento Ambulatorial Obrigatório: Dosagem Semanal de Beta-hCG até 3 Valores Negativos Consecutivos, seguido de Mensal por 6 Meses com Anticoncepção Rigorosa",
                            "Critérios de Neoplasia Trofoblástica Gestacional (NTG / Mola Invasora / Coriocarcinoma): Platô em 4 Dosagens ou Elevação em 3 Dosagens de Beta-hCG"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Hemorragias da Segunda Metade da Gravidez",
        "focos": [
            {
                "foco": "Descolamento Prematuro de Placenta (DPP)",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico e Fatores de Risco do DPP",
                        "sub_subfocos": [
                            "Principal Fator de Risco Associado: Doença Hipertensiva Específica da Gravidez (DHEG / Pré-Eclâmpsia)",
                            "Tétrade Clássica: Dor Abdominal Súbita Intensa, Hipertonia Uterina (\"Útero Lenhoso\" que Não Relaxa), Sangramento Vaginal Escuro com Coágulos e Sofrimento Fetal Agudo Grave",
                            "Hematoma Retroplacentário e Apoplexia Útero-Placentária (Útero de Couvelaire)"
                        ]
                    },
                    {
                        "subfoco": "Conduta Obstétrica Imediata e Complicações",
                        "sub_subfocos": [
                            "Conduta com Feto Vivo: Cesariana Imediata de Urgência (Exceto se Parto Vaginal Iminente)",
                            "Conduta com Feto Morto: Amniotomia Imediata (Reduz a Pressão Intrauterina e Passagem de Tromboplastina para a Circulação) e Priorização de Parto Vaginal se Estabilidade Materna",
                            "Complicações Graves: Coagulação Intravascular Disseminada (CIVD) e Síndrome de Sheehan"
                        ]
                    }
                ]
            },
            {
                "foco": "Placenta Prévia",
                "subfocos": [
                    {
                        "subfoco": "Classificação e Quadro Clínico da Placenta Prévia",
                        "sub_subfocos": [
                            "Implantação Placentária no Segmento Inferior do Útero após 28 Semanas de Gestação",
                            "Quadro Clínico Típico: Sangramento Vaginal Vermelho Rutilante / Vivo, Espontâneo, Repetitivo, Progressivo e INDOLOR, com Tônus Uterino Normal e Ausência de Sofrimento Fetal Inicial",
                            "Contraindicação Absoluta de Toque Vaginal (Realizar Especuloscopia Delicada e USG Transvaginal)"
                        ]
                    },
                    {
                        "subfoco": "Conduta e Via de Parto na Placenta Prévia",
                        "sub_subfocos": [
                            "Manejo Conservador se Prematuridade e Sangramento Controlado com Estabilidade Materno-Fetal",
                            "Placenta Prévia Total / Oclusiva Total: Indicação Absoluta de Cesariana",
                            "Placenta Marginal ou Baixa (Borda Placentária > 2 cm do Orifício Interno): Tentativa de Parto Vaginal Permitida"
                        ]
                    }
                ]
            },
            {
                "foco": "Acretismo Placentário (Accreta, Increta, Percreta)",
                "subfocos": [
                    {
                        "subfoco": "Graus de Invasão Miometrial (Accreta, Increta e Percreta)",
                        "sub_subfocos": [
                            "Fatores de Risco Maiores: Placenta Prévia Concomitante a Cicatrizes Uterinas / Cesarianas Prévias (Risco Escalonado)",
                            "Placenta Accreta (Adesão Direta ao Miométrio sem Ultrapassá-lo - 75-80% dos Casos)",
                            "Placenta Increta (Invasão Profunda no Miométrio - 15%)",
                            "Placenta Percreta (Ultrapassa a Serosa Uterina com Invasão de Órgãos Vizinhos, Notadamente a Bexiga - 5%)"
                        ]
                    },
                    {
                        "subfoco": "Diagnóstico Pré-Natal e Manejo Cirúrgico",
                        "sub_subfocos": [
                            "Doppler Colorido Obstétrico e Ressonância Magnética da Pelve para Mapeamento de Invasão Vascular",
                            "Planejamento Cirúrgico Multidisciplinar: Cesariana com Feto Entregue por Incisão Alta sem Tocar na Placenta seguida de Histerectomia Puerperal sem Tentativa de Descolamento Manual da Placenta"
                        ]
                    }
                ]
            },
            {
                "foco": "Rotura Uterina",
                "subfocos": [
                    {
                        "subfoco": "Sinais Iminentes de Rotura (Síndrome de Bandl-Frommel)",
                        "sub_subfocos": [
                            "Sinal de Bandl (Anel de Constrição que Separa o Corpo do Segmento Inferior Uterino)",
                            "Sinal de Frommel (Estiramento e Tensão Dolorosa dos Ligamentos Redondos)",
                            "Causas Principais: Hiperdinamia Uterina, Uso Inadequado de Ocitocina/Misoprostol e Parto Obstruído"
                        ]
                    },
                    {
                        "subfoco": "Rotura Consumada e Conduta Cirúrgica",
                        "sub_subfocos": [
                            "Dor Lancinante Súbita que Cede Subitamente com Parada das Contrações Uterinas",
                            "Subida / Recuo da Apresentação Fetal, Palpação Fácil de Partes Fetais no Abdome Materno e Choque Hemorrágico Grave",
                            "Laparotomia Exploradora Imediata: Histerorrafia ou Histerectomia Subtotal/Total"
                        ]
                    }
                ]
            },
            {
                "foco": "Rotura de Vasa Prévia e Rotura de Seio Marginal",
                "subfocos": [
                    {
                        "subfoco": "Vasa Prévia e Inserção Velamentosa do Cordão",
                        "sub_subfocos": [
                            "Vasos Fetais Desprotegidos que Cruzam o Orifício Interno do Colo Uterino sob as Membranas Amnióticas",
                            "Quadro Patognomônico: Sangramento Vaginal Imediato após a Amniorrexe (Rotura de Bolsa) associado a Bradicardia Fetal Súbita / Sofrimento Fetal Agudo Grave (O Sangue Perdido é Fetal!)",
                            "Cesariana de Emergência Absoluta"
                        ]
                    },
                    {
                        "subfoco": "Rotura de Seio Marginal Placentário",
                        "sub_subfocos": [
                            "Sangramento de Sangue Materno no Periparto com Tônus Uterino Normal e Ausência de Sofrimento Fetal, Diagnóstico de Exclusão",
                            "Conduta Obstétrica Habitualmente Conservadora com Monitorização e Bom Prognóstico Perinatal"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Síndromes Hipertensivas na Gravidez",
        "focos": [
            {
                "foco": "Pré-Eclâmpsia (com e sem Sinais de Gravidade)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Critérios da Pré-Eclâmpsia",
                        "sub_subfocos": [
                            "Definição Clássica: Hipertensão Arterial (PAS >= 140 ou PAD >= 90 mmHg) que Surge após a 20ª Semana associada a Proteinúria Significativa (>= 300 mg/24h ou Relação P/C Urinária >= 0,3)",
                            "Critérios de Pré-Eclâmpsia SEM Proteinúria: Hipertensão associada a Disfunção de Órgão-Alvo (Plaquetopenia < 100.000, Transaminases Dobradas, Creatinina > 1,1 mg/dL, Edema Agudo de Pulmão ou Sintomas Visuais/Cefaleia)"
                        ]
                    },
                    {
                        "subfoco": "Pré-Eclâmpsia com Sinais de Gravidade e Manejo",
                        "sub_subfocos": [
                            "Sinais de Gravidade: PA >= 160x110 mmHg, Cefaleia Intensa Refratária, Escotomas Cintilantes, Epigastralgia / Dor em HCD (Distensão da Cápsula de Glisson)",
                            "Sulfatação Imediata para Prevenção de Convulsão com Sulfato de Magnésio (Esquema de Pritchard ou Zuspan)",
                            "Anti-hipertensivos de Ação Rápida para Crise Pressórica: Hidralazina EV ou Nifedipino Oral de Ação Rápida (Meta de PA entre 140-150 / 90-100 mmHg)"
                        ]
                    }
                ]
            },
            {
                "foco": "Eclâmpsia (Manejo da Crise e Sulfato de Magnésio)",
                "subfocos": [
                    {
                        "subfoco": "Manejo da Crise Convulsiva Eclâmptica",
                        "sub_subfocos": [
                            "Aparecimento de Convulsões Tônico-Clônicas Generalizadas em Gestante com Pré-Eclâmpsia Não Explicadas por Outras Causas Neurológicas",
                            "Droga de Escolha Absoluta para Controle e Prevenção de Recorrência: Sulfato de Magnésio (Jamais Benzodiazepínicos ou Fenitoína de 1ª Linha)"
                        ]
                    },
                    {
                        "subfoco": "Monitorização da Intoxicação por Magnésio e Antídoto",
                        "sub_subfocos": [
                            "Os 3 Parâmetros Clínicos Obrigatórios de Vigilância: Reflexo Patelar Presente, Frequência Respiratória >= 16 rpm e Débito Urinário >= 25-30 mL/hora",
                            "Sinal Mais Precoce de Intoxicação: Abolição do Reflexo Patelar",
                            "Conduta na Intoxicação / Parada Respiratória: Suspender o Sulfato e Administrar Gluconato de Cálcio a 10% EV Lentamente"
                        ]
                    }
                ]
            },
            {
                "foco": "Síndrome HELLP",
                "subfocos": [
                    {
                        "subfoco": "Critérios Laboratoriais Diagnósticos de Tennessee / Mississippi",
                        "sub_subfocos": [
                            "H (Hemólise): Esquizócitos no Sangue Periférico, Bilirrubina Indireta >= 1,2 mg/dL, Desidrogenase Láctica (LDH) >= 600 U/L",
                            "EL (Elevated Liver Enzymes): TGO/AST >= 70 U/L ou Dobro do LSN",
                            "LP (Low Platelets): Plaquetopenia < 100.000/mm3 (Classe 1 < 50.000, Classe 2 50.000-100.000, Classe 3 100.000-150.000)"
                        ]
                    },
                    {
                        "subfoco": "Conduta Obstétrica e Interrupção da Gravidez",
                        "sub_subfocos": [
                            "Indicação de Interrupção Imediata da Gestação Independentemente da Idade Gestacional após Estabilização Materna e Sulfatação",
                            "Via de Parto Obstétrica (Cesariana ou Parto Vaginal se Indução Rápida Viável)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hipertensão Arterial Crônica na Gravidez",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial e Drogas de Uso Permitido",
                        "sub_subfocos": [
                            "Hipertensão Diagnosticada Antes da Gravidez ou Antes da 20ª Semana, ou que Persiste após 12 Semanas Pós-Parto",
                            "Anti-hipertensivos Orais Seguros de 1ª Linha: Metildopa, Nifedipino Retard e Hidralazina"
                        ]
                    },
                    {
                        "subfoco": "Pré-Eclâmpsia Sobreposta à Hipertensão Crônica",
                        "sub_subfocos": [
                            "Contraindicação Formal e Absoluta: Inibidores da ECA e Bloqueadores dos Receptores de Angiotensina (Teratogenia e Disgenesia Renal Fetal)",
                            "Piora Súbita dos Níveis Pressóricos, Surgimento ou Aumento Abrupto de Proteinúria ou Disfunção Orgânica após a 20ª Semana"
                        ]
                    }
                ]
            },
            {
                "foco": "Hipertensão Gestacional",
                "subfocos": [
                    {
                        "subfoco": "Definição, Fisiopatologia e Diagnóstico Diferencial com Pré-Eclâmpsia",
                        "sub_subfocos": [
                            "Profilaxia com AAS em Baixas Doses (100-150 mg/dia) e Carbonato de Cálcio Iniciados entre 12 e 16 Semanas",
                            "Níveis Pressóricos >= 140x90 mmHg após 20 Semanas sem Proteinúria ou Lesão de Órgão-Alvo"
                        ]
                    },
                    {
                        "subfoco": "Conduta Clínica, Metas Pressóricas e Risco de Evolução para Pré-Eclâmpsia",
                        "sub_subfocos": [
                            "Diferenciação com Hipertensão Arterial Crônica Preexistente e Monitorização Ambulatorial"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Diabetes Gestacional e Endocrinopatias",
        "focos": [
            {
                "foco": "Diabetes Mellitus Gestacional (DMG: Rastreamento, Diagnóstico e Metas)",
                "subfocos": [
                    {
                        "subfoco": "Rastreamento e Critérios Diagnósticos do DMG (IADPSG/SBD/Febrasgo)",
                        "sub_subfocos": [
                            "Vigilância Materno-Fetal Estrita (Pesquisa Periódica de Proteinúria, Plaquetas e Enzimas Hepáticas)",
                            "Manejo Anti-hipertensivo (Metildopa, Hidralazina e Anlodipino) e Momento do Parto a Termo (37-39 semanas)",
                            "1ª Consulta de Pré-Natal (1º Trimestre): Glicemia de Jejum entre 92 e 125 mg/dL = Diagnóstico Imediato de DMG (Sem Necessidade de Teste Adicional)"
                        ]
                    },
                    {
                        "subfoco": "Metas Glicêmicas, Dieta e Terapia com Insulina",
                        "sub_subfocos": [
                            "Glicemia de Jejum >= 126 mg/dL ou HbA1c >= 6,5% no 1º Trimestre = Diabetes Mellitus Pré-Gestacional / Overt Diabetes",
                            "Se Glicemia < 92 mg/dL no 1º Trimestre: Realizar TOTG 75g entre 24 e 28 Semanas (Valores de Corte: Jejum >= 92, 1h >= 180, 2h >= 153 mg/dL - Apenas 1 Valor Alterado Confirma DMG)",
                            "Metas de Controle: Glicemia de Jejum < 95 mg/dL, 1h Pós-Prandial < 140 mg/dL e 2h Pós-Prandial < 120 mg/dL"
                        ]
                    }
                ]
            },
            {
                "foco": "Diabetes Mellitus Pré-Gestacional (Manejo e Riscos Malformativos)",
                "subfocos": [
                    {
                        "subfoco": "Planejamento Pré-Concepcional e Riscos de Malformações Fetais",
                        "sub_subfocos": [
                            "Terapêutica Inicial: Dieta Fracionada e Atividade Física por 1 a 2 Semanas",
                            "Indicação de Insulinoterapia se > 30% dos Valores Glicêmicos Acima da Meta",
                            "Complicações Fetais: Macrossomia Fetal (> 4.000 g), Polidrâmnio, Distócia de Ombro e Hipoglicemia Neonatal Precoce"
                        ]
                    },
                    {
                        "subfoco": "Ajuste da Insulinoterapia nos Três Trimestres e Vitalidade Fetal",
                        "sub_subfocos": [
                            "Otimização da Hemoglobina Glicada (HbA1c < 6,5%) Pré-Concepção e Suplementação de Ácido Fólico 5mg/dia",
                            "Risco de Regressão Caudal, Cardiopatias Congênitas (Transposição de Grandes Artérias) e Abortamento"
                        ]
                    }
                ]
            },
            {
                "foco": "Tireoidopatias na Gestação (Hipotireoidismo e Hipertireoidismo)",
                "subfocos": [
                    {
                        "subfoco": "Hipotireoidismo Gestacional e Metas de TSH por Trimestre",
                        "sub_subfocos": [
                            "Ajuste Dinâmico de Doses: Queda de Demanda no 1º Trimestre vs Resistência Severa no 2º e 3º Trimestres",
                            "Avaliação de Complicações Microvasculares (Retinopatia, Nefropatia) e Vigilância Fetal Rigorosa",
                            "Valores de Referência do TSH Gestacional e Aumento Precoce da Dose de Levotiroxina (30-50%)"
                        ]
                    },
                    {
                        "subfoco": "Hipertireoidismo na Gestação (Doença de Graves vs Tireotoxicose Gestacional Transitória)",
                        "sub_subfocos": [
                            "Hipotireoidismo Subclínico: Critérios de Tratamento (Anticorpo Anti-TPO Positivo)",
                            "Diferenciação: Tireotoxicose Transitória Mediada por hCG vs Doença de Graves (Anticorpo TRAB Positivo)",
                            "Tratamento Farmacológico: Propiltiouracil no 1º Trimestre vs Metimazol no 2º e 3º Trimestres"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Infecções Congênitas e Perinatais",
        "focos": [
            {
                "foco": "Sífilis Gestacional e Congênita",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Critérios de Tratamento Adequado Materno",
                        "sub_subfocos": [
                            "Rastreamento Obrigatório no 1º e 3º Trimestres e no Momento do Parto com Teste Rápido / VDRL",
                            "Critérios de Tratamento Materno Adequado para Considerar o Recém-Nascido Tratado: Uso Exclusivo de Penicilina Benzatina, Esquema Completo para o Estágio Clínico, Iniciado até 30 Dias Antes do Parto e Queda Comprovada dos Títulos de VDRL",
                            "Doses: Sífilis Recente (< 1 Ano) - 2,4 Milhões UI em Dose Única; Sífilis Tardia / Indeterminada - 7,2 Milhões UI (3 Doses Semanais de 2,4 Milhões)"
                        ]
                    },
                    {
                        "subfoco": "Abordagem Diagnóstica e Conduta no Recém-Nascido",
                        "sub_subfocos": [
                            "VDRL do Sangue Periférico do RN (Não Usar Sangue de Cordão)",
                            "RN Sintomático ou com VDRL do RN Maior que o Materno em pelo menos 2 Titulações (ex.: 1:16 vs 1:4) = Investigação Completa (Líquor, Rx de Ossos Longos, Hemograma) e Tratamento com Penicilina Cristalina EV por 10 Dias"
                        ]
                    }
                ]
            },
            {
                "foco": "Toxoplasmose Gestacional e Congênita",
                "subfocos": [
                    {
                        "subfoco": "Interpretação Sorológica e Teste de Avidez",
                        "sub_subfocos": [
                            "IgG Negativo e IgM Negativo: Gestante Suscetível (Orientação Profilática Higienodietética e Repetição Trimestral da Sorologia)",
                            "IgG Positivo e IgM Negativo: Infecção Passada / Imune (Sem Risco de Transmissão Fetal)",
                            "IgG Positivo e IgM Positivo no 1º Trimestre: Realização Imediata do Teste de Avidez de IgG (< 16 semanas: Alta Avidez Exclui Infecção Recente; Baixa Avidez Confirma Infecção Recente)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento com Espiramicina vs Esquema Tríplice",
                        "sub_subfocos": [
                            "Espiramicina Oral Imediata Diante de Infecção Aguda Materna para Prevenção da Transmissão Vertical",
                            "Amniocentese com PCR para *T. gondii* no Líquido Amniótico a Partir de 18 Semanas para Investigação de Infecção Fetal",
                            "Confirmação de Feto Infectado: Transição para Esquema Tríplice (Sulfadiazina + Pirimetamina + Ácido Folínico)",
                            "Tétrada de Sabin no Neonato: Coriorretinite, Hidrocefalia, Calcificações Intracranianas Difusas e Retardo Mental"
                        ]
                    }
                ]
            },
            {
                "foco": "HIV na Gestação e Profilaxia da Transmissão Vertical",
                "subfocos": [
                    {
                        "subfoco": "Terapia Antirretroviral e Rastreamento na Gravidez",
                        "sub_subfocos": [
                            "Rastreamento Sorológico Obrigatório na 1ª Consulta, no 3º Trimestre e no Parto",
                            "Início Imediato de TARV para Todas as Gestantes: Tenofovir + Lamivudina + Dolutegravir (TDF/3TC/DTG) com Meta de Carga Viral Indetectável",
                            "Carga Viral com 34 Semanas: CV < 1.000 cópias/mL = Parto Vaginal Permitido sem Necessidade de Zidovudina (AZT) EV se CV Indetectável; CV >= 1.000 cópias/mL = Indicação de Cesariana Eletiva com 38 Semanas associada a AZT EV Intraparto"
                        ]
                    },
                    {
                        "subfoco": "Via de Parto e Profilaxias Intra e Pós-Parto",
                        "sub_subfocos": [
                            "Contraindicação Absoluta de Amamentação no Brasil (Inibição com Cabergolina Oral e Fórmula Infantil)",
                            "Profilaxia Neonatal com AZT Oral por 4 Semanas associado a Nevirapina se Alto Risco"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecção Urinária e Pielonefrite na Gravidez",
                "subfocos": [
                    {
                        "subfoco": "Bacteriúria Assintomática e Cistite Aguda na Gestação",
                        "sub_subfocos": [
                            "Rastreamento Obrigatório na 1ª Consulta e Tratamento Sistemático da Bacteriúria Assintomática (Urocultura >= 10^5 UFC/mL)",
                            "Opções Antimicrobianas Seguras: Fosfomicina, Cefalexina, Amoxicilina-Clavulanato e Nitrofurantoína"
                        ]
                    },
                    {
                        "subfoco": "Pielonefrite Aguda Gestacional e Complicações",
                        "sub_subfocos": [
                            "Quadro Clínico (Febre, Calafrios, Sinal de Giordano Positivo) e Internação Hospitalar Mandatória",
                            "Antibioticoterapia Venosa (Ceftriaxona), Risco de Sepse e Profilaxia Antimicrobiana Contínua até o Parto"
                        ]
                    }
                ]
            },
            {
                "foco": "Rastreamento e Profilaxia do Estreptococo do Grupo B (EGB)",
                "subfocos": [
                    {
                        "subfoco": "Cultura Anovaginal Universal entre 35 e 37 Semanas",
                        "sub_subfocos": [
                            "Indicações de Swab Anovaginal sem Espéculo e Pacientes que Dispensam Rastreamento (Bacteriúria por EGB ou Filho Anterior com Sepse)",
                            "Critérios Baseados em Fatores de Risco Intraparto se Cultura Desconhecida (Prematuridade, Bolsa Rota >= 18h, Tax >= 38°C)"
                        ]
                    },
                    {
                        "subfoco": "Esquema de Profilaxia Intraparto com Antibiótico",
                        "sub_subfocos": [
                            "Penicilina Cristalina EV ou Ampicilina EV Iniciadas no Mínimo 4 Horas Antes do Parto",
                            "Manejo em Alérgicas à Penicilina: Cefazolina (Baixo Risco) vs Clindamicina/Vancomicina (Alto Risco)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez",
                "subfocos": [
                    {
                        "subfoco": "Hepatite B e C no Ciclo Gravídico-Puerperal",
                        "sub_subfocos": [
                            "Rastreamento com HBsAg e Prevenção de Transmissão Vertical: Vacina + Imunoglobulina (HBIG) no RN nas Primeiras 12h",
                            "Uso de Tenofovir na Gestante com Carga Viral Alta (> 200.000 UI/mL) a partir da 28ª Semana"
                        ]
                    },
                    {
                        "subfoco": "Citomegalovírus, Herpes Genital e Vírus Zika",
                        "sub_subfocos": [
                            "Herpes Genital Ativo no Trabalho de Parto (Lesões Visíveis ou Pródromos) como Indicação Absoluta de Cesariana",
                            "Síndrome da Zika Congênita (Microcefalia, Calcificações Subcorticais) e Infecção por CMV"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Mecanismo de Parto, Partograma e Distócias",
        "focos": [
            {
                "foco": "Trabalho de Parto (Fases Clínicas e Assistência Humanizada)",
                "subfocos": [
                    {
                        "subfoco": "Os 4 Períodos Clínicos do Parto",
                        "sub_subfocos": [
                            "1º Período (Dilatação): Fase Latente vs Fase Ativa (Dilatação >= 4-5 cm com Contrações Efetivas)",
                            "2º Período (Expulsivo): Dilatação Cervical Total (10 cm) até a Saída Completa do Feto",
                            "3º Período (Dequitadura / Secundamento): Descolamento e Expulsão da Placenta (Manejo Ativo Obrigatório com 10 UI de Ocitocina IM)",
                            "4º Período (Greenberg): Primeira Hora Pós-Parto (Hemostasia Mecânica por Ligaduras de Pinard e Trombotamponamento)"
                        ]
                    },
                    {
                        "subfoco": "Assistência Humanizada e Boas Práticas da OMS",
                        "sub_subfocos": [
                            "Presença Livre de Acompanhante de Escolha da Mulher, Dieta Líquida Permitida, Liberdade de Posição e Métodos Não Farmacológicos de Alívio da Dor",
                            "Contraindicação do Uso Rotineiro de Episiotomia, Enema, Tricotomia e Manobra de Kristeller"
                        ]
                    }
                ]
            },
            {
                "foco": "Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas",
                "subfocos": [
                    {
                        "subfoco": "Os Tempos do Mecanismo do Parto",
                        "sub_subfocos": [
                            "1º Tempo: Insinuação (Passagem do Maior Diâmetro Transverso pelo Estreito Superior / Plano 0 de De Lee) e Flexão da Cabeça (Diâmetro Suboccipitobregmático 9,5 cm)",
                            "2º Tempo: Descida e Rotação Interna da Cabeça (Variedades Anteriores como OEA viram para Púbis / OP)",
                            "3º Tempo: Desprendimento da Cabeça por Deflexão / Extensão",
                            "4º Tempo: Restituição / Rotação Externa da Cabeça e Desprendimento dos Ombros (Ombro Anterior sob a Sínfise Púbica seguido do Posterior)"
                        ]
                    },
                    {
                        "subfoco": "Apresentações Anômalas (Defletidas e Pélvicas)",
                        "sub_subfocos": [
                            "Apresentações Defletidas: 1º Grau / Bregma (Linha Sagital, Brequegmática), 2º Grau / Fronte (Pior Prognóstico, Diâmetro Occipitomentoniano 13,5 cm - Cesariana Mandatória), 3º Grau / Face (Ponto de Referência Mento - Parto Vaginal Apenas se Mento-Anterior)",
                            "Apresentação Pélvica: Manobras de Auxílio ao Parto Vaginal (Bracht, Mauriceau, Pajot)"
                        ]
                    }
                ]
            },
            {
                "foco": "Interpretação do Partograma e Linhas de Ação/Alerta",
                "subfocos": [
                    {
                        "subfoco": "Linhas de Alerta e Ação e Distócias Funcionais",
                        "sub_subfocos": [
                            "Abertura do Partograma na Fase Ativa (Dilatação >= 4-5 cm); Linha de Alerta e Linha de Ação (Traçada 4 Horas à Direita da Linha de Alerta)",
                            "Fase Ativa Prolongada: Dilatação Cervical Lenta (< 1 cm/hora) Ultrapassando a Linha de Alerta (Causa: Hipocinesia Uterina; Conduta: Ocitocina e Amniotomia)",
                            "Parada Secundária da Dilatação: Dilatação Cervical Estagnada na Mesma Medida por 2 Horas Consecutivas na Fase Ativa (Desproporção Cefalopélvica - Indicação de Cesariana)",
                            "Período Expulsivo Prolongado: Dilatação Total com Descida Fetal Parada por > 1-2 Horas",
                            "Parto Precipitado / Taquitócico: Trabalho de Parto e Parto Concluídos em Menos de 4 Horas"
                        ]
                    },
                    {
                        "subfoco": "Planos de De Lee e Avaliação da Descida",
                        "sub_subfocos": [
                            "Espinhas Isquiáticas / Ciáticas como Ponto de Referência Zero (Plano 0 de De Lee = Insinuação Comprovada)",
                            "Variação de -3 a +3 cm no Canal de Parto"
                        ]
                    }
                ]
            },
            {
                "foco": "Distócias de Trajeto, Motoras e de Ombro",
                "subfocos": [
                    {
                        "subfoco": "Distócias Ósseas e de Partes Moles",
                        "sub_subfocos": [
                            "Avaliação da Bacia Obstétrica (Pelvimetria Clínica e Diâmetro Conjugata Vera vs Diagonal)",
                            "Distócias de Partes Moles: Miomas Cervicais Prévios, Septos Vaginais e Edema de Colo"
                        ]
                    },
                    {
                        "subfoco": "Distócia de Ombro: Fatores de Risco e Manobras Sequenciais",
                        "sub_subfocos": [
                            "Fatores Predisponentes: Macrossomia Fetal e Diabetes Gestacional, e Sinal da Tartaruga",
                            "Algoritmo Canônico de Manobras: McRoberts + Pressão Suprapúbica (Rubin I), Manobra de Rubin II, Woods e Gaskin"
                        ]
                    }
                ]
            },
            {
                "foco": "Fórcipe e Vácuo-Extrator (Indicações e Condições de Aplicabilidade)",
                "subfocos": [
                    {
                        "subfoco": "Condições de Aplicabilidade do Fórcipe",
                        "sub_subfocos": [
                            "Condições Mandatórias: Dilatação Cervical Total (10 cm), Bolsa Rota, Feto Vivo, Apresentação Cefálica Fletida, Proporção Cefalopélvica Adequada, Pelve Materna Conhecida e Bacia Esvaziada",
                            "Insinuação Mínima: Cabeça Fetal em Plano >= +2 de De Lee (Fórcipe Baixo / de Alívio)"
                        ]
                    },
                    {
                        "subfoco": "Tipos de Fórcipe e Complicações",
                        "sub_subfocos": [
                            "Fórcipe de Simpson (Ideal para Cabeça Fletida sem Rotação Complexa)",
                            "Fórcipe de Piper (Exclusivo para Cabeça Derradeira em Parto Pélvico)",
                            "Fórcipe de Kielland (Para Correção de Assinclitismo e Grandes Rotações)",
                            "Vácuo-Extrator: Menor Risco de Lacerações Maternas, Contraindicado em Prematuros (< 34 semanas)"
                        ]
                    }
                ]
            },
            {
                "foco": "Cesariana (Indicações, Técnica e Parto Vaginal após Cesárea)",
                "subfocos": [
                    {
                        "subfoco": "Indicações Absolutas vs Relativas de Cesariana",
                        "sub_subfocos": [
                            "Indicações Absolutas Canônicas: Desproporção Cefalopélvica Absoluta, Placenta Prévia Oclusiva Total, Vasa Prévia e Herpes Ativo",
                            "Classificação de Robson (Grupos 1 a 10) para Auditoria e Redução de Cesarianas Desnecessárias"
                        ]
                    },
                    {
                        "subfoco": "Parto Vaginal após Cesárea Prévia (VBAC) e Riscos de Rotura",
                        "sub_subfocos": [
                            "Critérios de Segurança para Prova de Trabalho de Parto: Uma Cesárea Transversal Prévia e Ausência de Distócia Prévia",
                            "Contraindicação Absoluta ao Uso de Misoprostol pelo Risco Catastrófico de Rotura Uterina"
                        ]
                    }
                ]
            },
            {
                "foco": "Indução do Parto e Escore de Bishop",
                "subfocos": [
                    {
                        "subfoco": "Avaliação do Colo Uterino e Escore de Bishop",
                        "sub_subfocos": [
                            "5 Parâmetros do Escore de Bishop: Dilatação, Apagamento, Consistência, Posição e Altura da Apresentação",
                            "Interpretação: Bishop >= 9 (Colo Favorável) vs Bishop <= 6 (Colo Desfavorável)"
                        ]
                    },
                    {
                        "subfoco": "Métodos de Maturação Cervical e Indução",
                        "sub_subfocos": [
                            "Preparo de Colo Desfavorável: Métodos Mecânicos (Balão de Foley/Krause) e Prostaglandinas (Misoprostol)",
                            "Condução com Ocitocina EV em Bomba de Infusão Contínua e Amniotomia Artificial"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Puerpério e Hemorragia Pós-Parto",
        "focos": [
            {
                "foco": "Puerpério Fisiológico e Aleitamento Materno",
                "subfocos": [
                    {
                        "subfoco": "Modificações Locais e Sistêmicas do Puerpério Imediato e Tardio",
                        "sub_subfocos": [
                            "Involução Uterina Fisiológica (Fundo Uterino na Cicatriz Umbilical no Pós-Parto Imediato) e Loquiação (Rubra, Serosa, Alba)",
                            "Puerpério Imediato (1º ao 10º dia), Tardio (11º ao 42º dia) e Remoto (> 42 dias)"
                        ]
                    },
                    {
                        "subfoco": "Fisiologia da Lactação e Manejo de Dificuldades Iniciais",
                        "sub_subfocos": [
                            "Apojadura (Descida do Leite: 48-72h Pós-Parto) Mediada pela Queda de Progesterona e Ação da Prolactina",
                            "Ingurgitamento Mamário Fisiológico vs Patológico: Ordenha de Alívio, Massagem e Compressas Frias"
                        ]
                    }
                ]
            },
            {
                "foco": "Hemorragia Pós-Parto (HPP: 4 Ts - Tônus, Trauma, Tecido, Trombina)",
                "subfocos": [
                    {
                        "subfoco": "Definição, Fatores de Risco e Manejo Ativo do 3º Período",
                        "sub_subfocos": [
                            "Definição Canônica de HPP: Perda Sanguínea > 500 mL (Parto Vaginal) ou > 1000 mL (Cesariana) em 24h",
                            "Profilaxia Obrigatória: Administração de 10 UI de Ocitocina IM Imediatamente após a Saída do Ombro Anterior"
                        ]
                    },
                    {
                        "subfoco": "Algoritmo Terapêutico Sequencial da Atonia Uterina",
                        "sub_subfocos": [
                            "Massagem Uterina Bimanual (Manobra de Hamilton) e Uterotônicos em Cascata (Ocitocina EV, Metilergonovina, Misoprostol)",
                            "Uso Precoce de Ácido Tranexâmico 1g EV nos Primeiros 30 Minutos e Balão de Tamponamento Intrauterino (Bakri)"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecção Puerperal e Endometrite Pós-Parto",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia, Critérios Diagnósticos e Fatores de Risco",
                        "sub_subfocos": [
                            "Critérios Clínicos de Morbidade Febril Puerperal: Febre >= 38°C em 2 Dias Consecutivos (Excluindo as Primeiras 24h)",
                            "Tríade da Endometrite: Febre, Subinvolução Uterina Dolorosa e Lóquios Fétidos (Acentuada Pós-Cesariana)"
                        ]
                    },
                    {
                        "subfoco": "Esquemas Antimicrobianos Venosos e Complicações",
                        "sub_subfocos": [
                            "Investigação de Febre Persistente: Abscesso Pélvico, Hematoma Infectado e Tromboflebite Pélvica Séptica",
                            "Quadro Clínico da Mastite (Sinais Flogísticos Unilaterais em Quadrante Mamário, Febre Alta, Calafrios e Queda do EG)"
                        ]
                    }
                ]
            },
            {
                "foco": "Mastite Puerperal e Abscesso Mamário",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial: Ingurgitamento vs Mastite Puerperal",
                        "sub_subfocos": [
                            "Principal Agente Etiológico: Staphylococcus aureus e Manutenção Obrigatória da Amamentação na Mama Afetada",
                            "Tratamento Antimicrobiano com Cefalexina ou Amoxicilina-Clavulanato por 10 a 14 Dias"
                        ]
                    },
                    {
                        "subfoco": "Antibioticoterapia e Manejo de Abscessos Mamários",
                        "sub_subfocos": [
                            "Abscesso Mamário Fluctuante: Diagnóstico Ultrassonográfico e Drenagem por Aspiração com Agulha ou Incisão",
                            "Estado de Hipercoagulabilidade Puerperal e Alto Risco de Trombose Venosa Profunda em Membros Inferiores"
                        ]
                    }
                ]
            },
            {
                "foco": "Tromboflebite Pélvica Séptica e TVP no Puerpério",
                "subfocos": [
                    {
                        "subfoco": "Tromboembolismo Venoso no Puerpério",
                        "sub_subfocos": [
                            "Anticoagulação Terapêutica Segura no Puerpério e Lactação com Heparina de Baixo Peso Molecular (Enoxaparina)",
                            "Suspeita em Paciente com Endometrite que Mantém Febre em Picos (Febre em Agulha) apesar de Antibioticoterapia Ampla"
                        ]
                    },
                    {
                        "subfoco": "Tromboflebite Pélvica Séptica (Diagnóstico de Exclusão)",
                        "sub_subfocos": [
                            "Teste Terapêutico Diagnóstico com Heparinização Plena EV (Resolução Rápida da Febre em 48-72h)",
                            "Blues Puerperal: Transitório, Início Precoce (3º ao 5º dia), Autolimitado (até 2 semanas), sem Prejuízo do Vínculo"
                        ]
                    }
                ]
            },
            {
                "foco": "Depressão e Psicose Puerperal",
                "subfocos": [
                    {
                        "subfoco": "Blues Puerperal (Disforia Pós-Parto) vs Depressão Pós-Parto",
                        "sub_subfocos": [
                            "Depressão Pós-Parto: Sintomas Persistentes (> 2 semanas), Anedonia, Sentimento de Culpa e Incapacidade de Cuidar do Bebê",
                            "Quadro Clínico Severo: Alucinações, Delírios de Conteúdo Místico/Persecutório e Alto Risco de Infanticídio e Suicídio"
                        ]
                    },
                    {
                        "subfoco": "Psicose Puerperal: Emergência Psiquiátrica",
                        "sub_subfocos": [
                            "Manejo Imediato com Internação Psiquiátrica, Separação Supervisionada do Bebê e Antipsicóticos"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Avaliação da Vitalidade Fetal",
        "focos": [
            {
                "foco": "Cardiotocografia Basal e Intraparto (Categorias I, II e III)",
                "subfocos": [
                    {
                        "subfoco": "Parâmetros Normais da Cardiotocografia",
                        "sub_subfocos": [
                            "Linha de Base Normal: FC Fetal entre 110 e 160 bpm",
                            "Variabilidade Normal: Moderada (Flutuações entre 6 e 25 bpm - Marcador Mais Fidedigno de Boa Oxigenação do SNC Fetal)",
                            "Acelerações Transitórias (Aumento >= 15 bpm por >= 15 segundos)",
                            "Contrações Uterinas Normais: Até 4 a 5 Contrações em 10 Minutos (Sem Taquissistolia)"
                        ]
                    },
                    {
                        "subfoco": "Desacelerações e Categorias I, II e III do FIGO/ACOG",
                        "sub_subfocos": [
                            "DIP I / Desaceleração Precoce: Espelhada com a Contração por Compressão Cefálica Fetal Vagal (Fisiológica)",
                            "DIP II / Desaceleração Tardia: Ocorre após o Pico da Contração por Hipóxia e Asfixia Útero-Placentária (Patológica)",
                            "DIP III / Desaceleração Variável: Desacelerações Abruptas em \"V\" por Compressão de Cordão Umbilical",
                            "Categoria I (Normal / Feto Hígido); Categoria II (Indeterminada / Reavaliação); Categoria III (Anormal / Sofrimento Fetal Agudo Grave com Variabilidade Ausente + DIP II/DIP III Recorrentes ou Padrão Sinusoidal - Indicação de Parto Imediato)"
                        ]
                    }
                ]
            },
            {
                "foco": "Perfil Biofísico Fetal (PBF)",
                "subfocos": [
                    {
                        "subfoco": "Parâmetros Agudos e Crônicos do PBF",
                        "sub_subfocos": [
                            "Parâmetro Crônico (Líquido Amniótico - ILA) vs Parâmetros Agudos (Reatividade Cardíaca, Movimentos Respiratórios, Movimentos Corpóreos, Tônus Fetal)",
                            "Pontuação do PBF (Total de 10 Pontos: 2 Pontos por Parâmetro Normal e 0 se Anormal)"
                        ]
                    },
                    {
                        "subfoco": "Interpretação e Conduta Obstétrica",
                        "sub_subfocos": [
                            "Escore 8/10 ou 10/10 com ILA Normal: Feto Hígido e Bem-Estar Confirmado",
                            "Escore <= 4/10: Forte Indício de Asfixia Fetal Aguda Grave e Indicação de Interrupção da Gestação"
                        ]
                    }
                ]
            },
            {
                "foco": "Dopplervelocimetria Obstétrica (Artérias Uterinas, Umbilical e Cerebral Média, Ducto Venoso)",
                "subfocos": [
                    {
                        "subfoco": "Artérias Uterinas, Umbilical e Cerebral Média",
                        "sub_subfocos": [
                            "Doppler de Artérias Uterinas no 2º Trimestre: Presença de Incisura Protodiastólica Bilateral Persistente após 24-26 Semanas Indica Falha na 2ª Onda de Invasão Trofoblástica e Risco Aumentado de Pré-Eclâmpsia e RCIU",
                            "Doppler de Artéria Umbilical: Avalia a Resistência Placentária (Aumento da Relação S/D, Diástole Zero e Diástole Reversa como Indicador Crítico de Insuficiência Placentária)",
                            "Doppler de Artéria Cerebral Média (ACM): Vasodilatação com Queda do Índice de Pulsatilidade (Centralização Fetal - Priorização de Fluxo para Cérebro, Coração e Adrenais)"
                        ]
                    },
                    {
                        "subfoco": "Ducto Venoso e Avaliação da Acidemia Fetal",
                        "sub_subfocos": [
                            "Avaliação Hemodinâmica Cardíaca Direita Fetal: Onda A Normal (Anterógrada na Contração Atrial)",
                            "Onda A Zero ou Reversa no Ducto Venoso em Feto com RCIU Centralizado Indica Acidose Grave e Risco Iminente de Morte Fetal (Indicação de Parto Imediato)"
                        ]
                    }
                ]
            },
            {
                "foco": "Restrição de Crescimento Intrauterino (RCIU)",
                "subfocos": [
                    {
                        "subfoco": "Classificação e Diagnóstico Ultrassonográfico da RCF",
                        "sub_subfocos": [
                            "Definição Canônica (Peso Fetal Estimado < P10 com Doppler Alterado ou < P3 Isolado)",
                            "RCIU Precoce (< 32 semanas, Insuficiência Placentária Grave, Alta Resistência) vs Tardio (>= 32 semanas, Hipóxia Crônica Sutil)",
                            "Centralização Fetal: Vasodilatação da Artéria Cerebral Média com Aumento da Relação Cérebro-Placentária (RCP < 1)",
                            "Alterações Críticas do Ducto Venoso (Onda A Negativa/Reversa) como Marcador Máximo de Acidemia e Indicação de Cesárea"
                        ]
                    },
                    {
                        "subfoco": "Seguimento Dopplerfluorimétrico e Momento do Parto",
                        "sub_subfocos": [
                            "Índice de Líquido Amniótico (ILA normal: 8 a 18 cm; Oligoidrâmnio < 5 cm; Polidrâmnio > 24 cm)"
                        ]
                    }
                ]
            },
            {
                "foco": "Oligoidrâmnio e Polidrâmnio",
                "subfocos": [
                    {
                        "subfoco": "Avaliação Semiológica do Volume de Líquido Amniótico (ILA e Maior Bolsão)",
                        "sub_subfocos": [
                            "Maior Bolsão Vertical Único (MBV normal: 2 a 8 cm; Oligo < 2 cm; Poli > 8 cm)",
                            "Oligoidrâmnio: Relação com Insuficiência Placentária, RPMO e Malformações Renais (Agenesia Renal / Sequência de Potter)"
                        ]
                    },
                    {
                        "subfoco": "Etiologia e Repercussões Materno-Fetais",
                        "sub_subfocos": [
                            "Polidrâmnio: Relação com Diabetes Gestacional Descompensado, Malformações Digestivas (Atresia Esofágica) e Gemelaridade"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Prematuridade e Amniorrexe Prematura",
        "focos": [
            {
                "foco": "Rotura Prematura de Membranas Ovulares (RPMO / Amniorrexe Prematura)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Clínico da Amniorrexe Prematura",
                        "sub_subfocos": [
                            "História de Perda Súbita de Líquido Claro com Odor de Água Sanitária em Volume Abundante",
                            "Confirmação ao Exame Especular Estéril: Saída de Líquido Amniótico pelo Orifício Externo do Colo às Manobras de Valsalva",
                            "Testes Complementares: Teste do pH com Papel de Nitrazina (Vira Azul com pH Alcalino > 6,5) e Teste de Cristalização do Muco em \"Folha de Samambaia"
                        ]
                    },
                    {
                        "subfoco": "Conduta na RPMO Pré-Termo (24 a 34 Semanas)",
                        "sub_subfocos": [
                            "Manejo Conservador na Ausência de Corioamnionite ou Sofrimento Fetal",
                            "Corticoterapia Antenatal (Betametasona 12 mg IM 2 Doses com Intervalo de 24h para Aceleração da Maturidade Pulmonar Fetal)",
                            "Antibioticoterapia de Latência (Ampicilina + Azitromicina) para Aumentar o Tempo de Permanência Intrauterina e Prevenir Infecção",
                            "Contraindicação Formal de Tocólise Prolongada se Bolsa Rota"
                        ]
                    }
                ]
            },
            {
                "foco": "Trabalho de Parto Prematuro (Corticoterapia, Tocólise e Neuroproteção)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Predição do TPP",
                        "sub_subfocos": [
                            "Presença de Contrações Uterinas Regulares (Pelo Menos 4 em 20 Minutos) associadas a Modificação Cervical (Dilatação >= 2-3 cm ou Apagamento > 50%) entre 20 e 37 Semanas",
                            "Marcadores Preditivos em Pacientes com Risco: Medida do Comprimento do Colo Uterino pela USG Transvaginal (< 25 mm entre 20-24s Indica Alto Risco) e Fibronectina Fetal"
                        ]
                    },
                    {
                        "subfoco": "Manejo Farmacológico: Tocólise, Corticoide e Neuroproteção",
                        "sub_subfocos": [
                            "Tocólise de Curto Prazo (por 48 Horas Apenas para Permitir Ação do Corticoide): Bloqueador de Canal de Cálcio (Nifedipino Oral de 1ª Escolha) ou Antagonista de Ocitocina (Atosibana)",
                            "Corticoterapia com Betametasona entre 24 e 34 Semanas (Reduz Risco de Membrana Hialina, Hemorragia Peri- Intraventricular e Enterocolite Necrosante)",
                            "Neuroproteção Fetal com Sulfato de Magnésio EV se Parto Iminente < 32 Semanas (Prevenção de Paralisia Cerebral)"
                        ]
                    }
                ]
            },
            {
                "foco": "Corioamnionite Aguda",
                "subfocos": [
                    {
                        "subfoco": "Critérios Clínicos de Gibbs e Fatores de Risco",
                        "sub_subfocos": [
                            "Critérios de Gibbs: Febre Materna (>= 37,8°C) associada a >= 2 sinais (Taquicardia Materna, Taquicardia Fetal, Líquido Amniótico Fétido, Dor Uterina)",
                            "Fatores Predisponentes: Amniorrexe Prematura Prolongada e Toques Vaginais Múltiplos e Repetidos"
                        ]
                    },
                    {
                        "subfoco": "Conduta Obstétrica Ativa Imediata e Terapia Antimicrobiana",
                        "sub_subfocos": [
                            "Indicação Absoluta de Interrupção Imediata da Gravidez (Não Importa a Idade Gestacional; Corioamnionite Não se Tocólisa)",
                            "Antibioticoterapia Venosa Imediata de Amplo Espectro com Ampicilina + Gentamicina EV"
                        ]
                    }
                ]
            },
            {
                "foco": "Gravidez Prolongada (Pós-Datismo)",
                "subfocos": [
                    {
                        "subfoco": "Definição, Fisiopatologia e Riscos Perinatais",
                        "sub_subfocos": [
                            "Definições: Gravidez a Termo Tardio (41 semanas a 41 semanas e 6 dias) vs Pós-Termo (>= 42 semanas completas)",
                            "Riscos de Insuficiência Placentária Senescente, Oligoidrâmnio, Síndrome de Aspiração Meconial (SAM) e Macrossomia"
                        ]
                    },
                    {
                        "subfoco": "Monitorização da Vitalidade e Protocolos de Indução",
                        "sub_subfocos": [
                            "Avaliação Fetal Intensiva a partir de 40 Semanas (Cardiotocografia e Medida do ILA a cada 48-72h)",
                            "Recomendação Canônica de Indução Eletiva do Parto entre 41 e 42 Semanas para Prevenção de Óbito Fetal"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Gestação Múltipla",
        "focos": [
            {
                "foco": "Gemelaridade (Diagnóstico, Corionicidade e Amnionicidade)",
                "subfocos": [
                    {
                        "subfoco": "Determinação da Corionicidade e Amnionicidade",
                        "sub_subfocos": [
                            "Diagnóstico Ultrassonográfico Precoce no 1º Trimestre: Sinal do Lambda ou \"Bico Duplo\" (Gestação Dicoriônica e Diamniótica)",
                            "Sinal do \"T Invertido\" (Gestação Monocoriônica e Diamniótica - Alto Risco de Complicações Vasculares Vasculares Placentárias)",
                            "Monocoriônica e Monoamniótica (Maior Risco de Entrelaçamento de Cordão)"
                        ]
                    },
                    {
                        "subfoco": "Síndrome de Transfusão Feto-Fetal (STFF)",
                        "sub_subfocos": [
                            "Exclusiva de Gestações Monocoriônicas por Anastomoses Vasculares Arteriovenosas Profundas Desbalanceadas na Placenta",
                            "Feto Doador: Hipovolemia, Oligúria, Oligoidrâmnio Severo (\"Feto Preso\" / Stuck Twin) e RCIU",
                            "Feto Receptor: Hipervolemia, Poliúria, Polidrâmnio Marcado, Cardiomegalia, Insuficiência Cardíaca e Hidropsia Fetal"
                        ]
                    }
                ]
            },
            {
                "foco": "Síndrome de Transfusão Feto-Fetal (STFF)",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia e Critérios Diagnósticos em Gestações Monocoriônicas",
                        "sub_subfocos": [
                            "Exclusividade de Gestações Monocoriônicas decorrente de Anastomoses Vasculares Arteriovenosas Profundas na Placenta Única",
                            "Critérios Canônicos: Sequência Oligoidrâmnio (Bolsão < 2 cm no Doador) e Polidrâmnio (Bolsão > 8 cm no Receptor)"
                        ]
                    },
                    {
                        "subfoco": "Estadiamento de Quintero e Terapia Cirúrgica Fetal",
                        "sub_subfocos": [
                            "Estadiamento de Quintero (Estágio I: Oligo/Poli; Estágio II: Bexiga Não Visível; Estágio III: Doppler Alterado; Estágio IV: Hidropisia; Estágio V: Óbito)"
                        ]
                    }
                ]
            },
            {
                "foco": "Complicações e Vias de Parto em Gestações Múltiplas",
                "subfocos": [
                    {
                        "subfoco": "Determinação da Corionicidade e Amnionicidade no 1º Trimestre",
                        "sub_subfocos": [
                            "Complicações Graves Específicas de Monocoriônicas Monoamnióticas: Entrelaçamento de Cordões e Gêmeos Unidos"
                        ]
                    },
                    {
                        "subfoco": "Seleção da Via de Parto e Momento da Interrupção",
                        "sub_subfocos": [
                            "Critérios para Parto Vaginal: Gêmeo 1 Cefálico, Peso Estimado Semelhante e Ausência de Desproporção Cefalopélvica",
                            "Indicação de Cesariana: Gêmeo 1 Não-Cefálico, Gestações Monoamnióticas (Parto Eletivo com 32-34 semanas) ou Mais de 2 Fetos"
                        ]
                    }
                ]
            }
        ]
    }
]
};
