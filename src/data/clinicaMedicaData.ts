import { SpecialtyHierarchy } from "@/types";

export const clinicaMedicaHierarchy: SpecialtyHierarchy = {
  "especialidade": "Clínica Médica",
  "temas": [
    {
        "tema": "Cardiologia",
        "focos": [
            {
                "foco": "Síndromes Coronarianas Isquêmicas (Aguda e Crônica)",
                "subfocos": [
                    {
                        "subfoco": "IAM com Supradesnivelamento do Segmento ST (IAMCSST)",
                        "sub_subfocos": [
                            "Eletrocardiograma e Localização da Parede Infartada (Anterior, Inferior com VD, Lateral)",
                            "Terapia de Reperfusão Imediata: Angioplastia Primária (< 90-120 min) vs Fibrinólise (< 30 min e até 12h)"
                        ]
                    },
                    {
                        "subfoco": "Síndrome Coronariana Aguda sem Supra de ST (SCASST) e Angina Instável",
                        "sub_subfocos": [
                            "Terapia Farmacológica Coadjuvante (Dupla Antiagregação, Anticoagulação, Estatina e Betabloqueador)",
                            "Complicações Mecânicas (Rotura de Parede Livre, Septo Interventricular e Músculo Papilar) e Elétricas",
                            "Estratificação de Risco (Escores TIMI e GRACE) e Biomarcadores de Necrose (Troponina Ultrassensível)",
                            "Estratégia Invasiva Precoce (< 24h) vs Imediata (< 2h) vs Seletiva"
                        ]
                    },
                    {
                        "subfoco": "Doença Arterial Coronariana Crônica e Angina Estável",
                        "sub_subfocos": [
                            "Investigação Diagnóstica não Invasiva (Teste Ergométrico, Angio-TC Coronariana e Cintilografia)",
                            "Otimização da Terapia Antianginosa e Modificação de Estilo de Vida"
                        ]
                    }
                ]
            },
            {
                "foco": "Insuficiência Cardíaca e Cardiomiopatias",
                "subfocos": [
                    {
                        "subfoco": "Insuficiência Cardíaca com Fração de Ejeção Reduzida (ICFER)",
                        "sub_subfocos": [
                            "Critérios Diagnósticos de Framingham e Papel dos Peptídeos Natriuréticos (BNP / NT-proBNP)",
                            "O \"Quarteto Fantástico\" Modificador de Sobrevida (iSGLT2, iECA/BRA/ARNI, Betabloqueador e Antagonista da Aldosterona)",
                            "Indicações de Dispositivos (Cardiodesfibrilador Implantável - CDI e Terapia de Ressincronização Cardíaca)"
                        ]
                    },
                    {
                        "subfoco": "Insuficiência Cardíaca Agudamente Descompensada",
                        "sub_subfocos": [
                            "Perfil Hemodinâmico de Stevenson (Perfil A Quente/Seco, B Quente/Úmido, L Frio/Seco, C Frio/Úmido)",
                            "Edema Agudo de Pulmão Cardiogênico (Furosemida EV, Vasodilatador EV e VNI com CPAP/BIPAP)",
                            "Choque Cardiogênico e Uso Racional de Inotrópicos (Dobutamina) e Vasopressores (Noradrenalina)"
                        ]
                    },
                    {
                        "subfoco": "Cardiomiopatia Hipertrófica e Cardiomiopatia Chagásica",
                        "sub_subfocos": [
                            "Cardiomiopatia Hipertrófica: Sopro Sistólico que Aumenta com Valsalva e Manejo com Betabloqueador",
                            "Cardiopatia Chagásica: Aneurisma de Ponta do VE, Bloqueio de Ramo Direito + BDAS e Arritmias Ventriculares"
                        ]
                    }
                ]
            },
            {
                "foco": "Taquiarritmias e Bradiarritmias",
                "subfocos": [
                    {
                        "subfoco": "Fibrilação Atrial e Flutter Atrial",
                        "sub_subfocos": [
                            "Avaliação de Risco Tromboembólico pelo Escore CHA2DS2-VASc e Indicação de Anticoagulação Oral (DOACs vs Varfarina)",
                            "Escore HAS-BLED para Risco de Sangramento",
                            "Controle de Ritmo (Cardioversão Química/Elétrica) vs Controle de Frequência Cardíaca (Betabloqueador / Bloqueador de Canal de Cálcio)"
                        ]
                    },
                    {
                        "subfoco": "Taquicardias Supraventriculares Paroxísticas",
                        "sub_subfocos": [
                            "Conduta na Instabilidade Hemodinâmica (Cardioversão Elétrica Sincronizada Imediata)",
                            "Taquicardia por Reentrada Nodal (TRN): Manobras Vagais e Adenosina EV em Bolus Rápido",
                            "Síndrome de Wolff-Parkinson-White (Pré-Excitação: Onda Delta e Intervalo PR Curto)"
                        ]
                    },
                    {
                        "subfoco": "Bradiarritmias e Bloqueios Atrioventriculares",
                        "sub_subfocos": [
                            "Bloqueio Atrioventricular de 1º Grau e 2º Grau Mobitz I (Wenckebach) - Geralmente Benignos",
                            "BAV de 2º Grau Mobitz II e BAV de 3º Grau / Total (Indicação Mandatória de Marcapasso Provisório e Definitivo)",
                            "Manejo Agudo da Bradicardia Instável: Atropina EV, Marcapasso Transcutâneo e Adrenalina/Dopamina"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Valvares Cardíacas",
                "subfocos": [
                    {
                        "subfoco": "Estenose Aórtica",
                        "sub_subfocos": [
                            "Tríade Clássica de Gravidade: Angina, Síncope e Dispneia aos Esforços",
                            "Exame Físico: Sopro Mesossistólico em Diamante com Irradiação para Carótidas e Pulso Parvus et Tardus",
                            "Tratamento Cirúrgico: Troca Valvar Aórtica Cirúrgica vs TAVI (Transcatheter Aortic Valve Implantation)"
                        ]
                    },
                    {
                        "subfoco": "Insuficiência Mitral e Estenose Mitral",
                        "sub_subfocos": [
                            "Estenose Mitral Reumática: Ruflar Diastólico com Estalido de Abertura, Reforço Pré-Sistólico e Hipertensão Pulmonar",
                            "Insuficiência Mitral Crônica e Aguda (Sopro Holossistólico em Ápice com Irradiação para Axila)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hipertensão Arterial Sistêmica e Crise Hipertensiva",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Manejo Ambulatorial da Hipertensão",
                        "sub_subfocos": [
                            "Critérios da Diretriz Brasileira de HAS: Classificação em Estágios 1, 2 e 3 e Metas Pressóricas",
                            "Papel do MAPA e MRPA (Fenômeno do Avental Branco e Hipertensão Mascarada)",
                            "Escolha de Anti-hipertensivos de 1ª Linha (Tiazídicos, Bloqueadores de Canal de Cálcio, iECA/BRA) e Associações"
                        ]
                    },
                    {
                        "subfoco": "Crise Hipertensiva (Urgência vs Emergência Hipertensiva)",
                        "sub_subfocos": [
                            "Emergência Hipertensiva: Lesão Aguda e Progressiva de Órgãos-Alvo (Redução com Nitroprussiato ou Nitroglicerina EV)",
                            "Urgência Hipertensiva: Elevação Pressórica sem Lesão de Órgão-Alvo (Anti-hipertensivos Orais e Alta Programada)",
                            "Encefalopatia Hipertensiva e Dissecção Aguda de Aorta (Meta de PAS < 120 mmHg e FC < 60 bpm com Esmolol + Nitroprussiato)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças do Pericárdio e Endocardite Infecciosa",
                "subfocos": [
                    {
                        "subfoco": "Pericardite Aguda e Tamponamento Cardíaco",
                        "sub_subfocos": [
                            "Pericardite: Dor Torácica Pleurítica que Melhora ao Inclinar o Tronco para Frente, Atrito Pericárdico e Supra de ST Côncavo Difuso",
                            "Tamponamento Cardíaco: Tríade de Beck (Hipotensão, Hipofonese de Bulhas e Turgência Jugular) + Pulso Paradoxal",
                            "Conduta Imediata no Tamponamento: Pericardiocentese de Urgência (Manobra de Marfan)"
                        ]
                    },
                    {
                        "subfoco": "Endocardite Infecciosa",
                        "sub_subfocos": [
                            "Critérios Modificados de Duke (Critérios Maiores: Hemoculturas Típicas e Vegetação no Ecocardiograma)",
                            "Fenômenos Vasculares e Imunológicos (Nódulos de Osler, Lesões de Janeway, Manchas de Roth)",
                            "Profilaxia de Endocardite para Procedimentos Odontológicos em Pacientes de Alto Risco (Amoxicilina 2g 1h antes)"
                        ]
                    }
                ]
            },
            {
                "foco": "Parada Cardiorrespiratória e Ressuscitação (ACLS)",
                "subfocos": [
                    {
                        "subfoco": "Ritmos Chocáveis e Não Chocáveis",
                        "sub_subfocos": [
                            "Ritmos Chocáveis: Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP) - Choque Imediato + RCP",
                            "Ritmos Não Chocáveis: Assistolia e Atividade Elétrica sem Pulso (AESP) - RCP Imediata + Adrenalina 1 mg precoce",
                            "Drogas no Suporte Avançado de Vida (Adrenalina a cada 3-5 min e Amiodarona / Lidocaína para Ritmos Chocáveis)"
                        ]
                    },
                    {
                        "subfoco": "Cuidados Pós-Parada Cardiorrespiratória",
                        "sub_subfocos": [
                            "Causas Reversíveis de PCR: Mnemônicos dos 5 Hs e 5 Ts",
                            "Controle Direcionado de Temperatura (32 a 36°C) em Pacientes Comatosos",
                            "Coronariografia de Emergência e Otimização Hemodinâmica"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Pneumologia",
        "focos": [
            {
                "foco": "Doenças Obstrutivas das Vias Aéreas (Asma e DPOC)",
                "subfocos": [
                    {
                        "subfoco": "Asma Brônquica no Adulto",
                        "sub_subfocos": [
                            "Diagnóstico Espirométrico: Distúrbio Ventilatório Obstrutivo com Resposta Significativa ao Broncodilatador (Aumento VEF1 > 12% e > 200 mL)",
                            "Manejo Crônico pelo GINA: Corticoide Inalatório como Pilar Central Obrigatório (Associação com Formoterol de Demanda/Manutenção)",
                            "Crise Asmática Aguda no Pronto-Socorro: Beta-2 Agonista Inalatório, Corticoide Sistêmico Precoce e Brometo de Ipratrópio"
                        ]
                    },
                    {
                        "subfoco": "Doença Pulmonar Obstrutiva Crônica (DPOC)",
                        "sub_subfocos": [
                            "Diagnóstico Espirométrico: Obstrução Fixa Pós-Broncodilatador (VEF1 / CVF < 0,70)",
                            "Estratificação GOLD (ABCD / ABE) e Terapia de Manutenção (LAMA, LABA e Associação com Corticoide Inalatório em Eosinofilia >= 300)",
                            "Exacerbação Aguda da DPOC: Critérios de Anthonisen (Aumento do Escarro, Purulência e Piora da Dispneia) e Indicações de Antibiótico e VNI",
                            "Medidas Modificadoras de Sobrevida na DPOC: Cessação do Tabagismo e Oxigenoterapia Domiciliar Prolongada"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecções Respiratórias Baixas (Pneumonias e Abscessos)",
                "subfocos": [
                    {
                        "subfoco": "Pneumonia Adquirida na Comunidade (PAC) no Adulto",
                        "sub_subfocos": [
                            "Estratificação de Gravidade pelo Escore CURB-65 (Confusão, Ureia >= 50, FR >= 30, PAS < 90 ou PAD <= 60, Idade >= 65)",
                            "Esquemas de Antibioticoterapia Empírica: Ambulatorial (Amoxicilina ou Macrolídeo), Enfermaria (Beta-lactâmico + Macrolídeo ou Quinolona Respiratória) e UTI"
                        ]
                    },
                    {
                        "subfoco": "Abscesso Pulmonar e Pneumonia Aspirativa",
                        "sub_subfocos": [
                            "Agentes Anaeróbios da Cavidade Oral, Imagem com Nível Hidroaéreo e Tratamento com Amoxicilina/Clavulanato ou Clindamicina",
                            "Critérios para Drenagem Externa vs Suporte Clínico Prolongado"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Vasculares Pulmonares (TEP e Hipertensão Pulmonar)",
                "subfocos": [
                    {
                        "subfoco": "Tromboembolismo Pulmonar (TEP)",
                        "sub_subfocos": [
                            "Estratificação de Probabilidade Clínica pelos Escores de Wells e Genebra",
                            "Algoritmo Diagnóstico: D-Dímero em Baixa/Intermediária Probabilidade vs Angio-TC de Tórax em Alta Probabilidade",
                            "TEP Maciço / Choque Obstrutivo: Indicação de Trombólise Sistêmica (Alteplase) e Suporte Hemodinâmico",
                            "Anticoagulação Plena (DOACs de 1ª Escolha, Enoxaparina e Varfarina) e Duração Mínima do Tratamento"
                        ]
                    },
                    {
                        "subfoco": "Hipertensão Pulmonar",
                        "sub_subfocos": [
                            "Classificação em 5 Grupos Clínicos da OMS",
                            "Diagnóstico Hemodinâmico por Cateterismo Cardíaco Direito (Pressão Média de Artéria Pulmonar > 20 mmHg) e Vasodilatadores Específicos"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Pleurais (Derrames e Pneumotórax)",
                "subfocos": [
                    {
                        "subfoco": "Derrame Pleural e Critérios de Light",
                        "sub_subfocos": [
                            "Critérios de Light para Diferenciação Transudato vs Exsudato (Proteína Pleural/Sérica > 0,5, LDH Pleural/Sérico > 0,6, LDH Pleural > 2/3 LSN Sérico)",
                            "Derrame Parapneumônico Complicado e Empiema (Critérios de Drenagem em Selo d'Água: pH < 7,20, Glicose < 40, Bactérias ou Pus Franco)"
                        ]
                    },
                    {
                        "subfoco": "Pneumotórax Espontâneo no Adulto",
                        "sub_subfocos": [
                            "Pneumotórax Primário (Jovens Longilíneos com Blebs Apicais) vs Secundário (DPOC com Bolhas Enfisematosas)",
                            "Conduta pelo Tamanho: Observação com O2 em Pequenos Volumes vs Drenagem Torácica Fechada e Pleurodese em Recidivantes"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Pulmonares Intersticiais e Fibrose",
                "subfocos": [
                    {
                        "subfoco": "Fibrose Pulmonar Idiopática (FPI) e Padrão TCAR de PIU",
                        "sub_subfocos": [
                            "Padrão Tomográfico de Pneumonia Intersticial Usual (PIU: Faveolamento Subpleural, Bronquiectasias de Tração e Gradiente Ápico-Basal)",
                            "Terapia Antifibrótica com Nintedanibe e Pirfenidona para Redução do Declínio da CVF"
                        ]
                    },
                    {
                        "subfoco": "Sarcoidose e Pneumonite por Hipersensibilidade (PH)",
                        "sub_subfocos": [
                            "Sarcoidose Pulmonar: Linfadenopatia Hilar Bilateral Simétrica, Granulomas Não-Caseificantes e Corticoterapia",
                            "Pneumonite por Hipersensibilidade: Exposição a Mofo/Pássaros, Padrão em Mosaico e Lavado com Linfocitose CD4/CD8"
                        ]
                    }
                ]
            },
            {
                "foco": "Tuberculose Pulmonar e Micobacterioses",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Manejo Clínico da Tuberculose Ativa",
                        "sub_subfocos": [
                            "Diagnóstico Laboratorial: Teste Rápido Molecular para TB (TRM-TB) com Detecção de Resistência à Rifampicina e Bacilos Álcool-Ácido Resistentes (BAAR)",
                            "Esquema Básico RIPE (Rifampicina, Isoniazida, Pirazinamida e Etambutol por 2 meses + Rifampicina e Isoniazida por 4 meses)",
                            "Efeitos Adversos dos Fármacos Antituberculose (Hepatotoxicidade, Neurite Óptica pelo Etambutol, Hiperuricemia)"
                        ]
                    },
                    {
                        "subfoco": "Infecção Latente pelo Mycobacterium tuberculosis (ILTB)",
                        "sub_subfocos": [
                            "Indicações de Rastreamento com PPD / IGRA (Contatos Domiciliares, PVHIV, Imunossuprimidos)",
                            "Esquemas de Tratamento da ILTB: Isoniazida por 6 a 9 Meses ou Rifapentina + Isoniazida por 3 Meses (3HP)"
                        ]
                    }
                ]
            },
            {
                "foco": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário",
                "subfocos": [
                    {
                        "subfoco": "Nódulo Pulmonar Solitário (NPS): Critérios de Fleischner e Malignidade",
                        "sub_subfocos": [
                            "Estratificação de Risco pelo Critério de Fleischner (Tamanho, Vidro Fosco vs Sólido, Margens Espiculadas)",
                            "Conduta Propedêutica: Acompanhamento Tomográfico vs PET-CT e Biópsia/Ressonância em Alto Risco"
                        ]
                    },
                    {
                        "subfoco": "Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo",
                        "sub_subfocos": [
                            "Pesquisa de Mutações Condutoras no Adenocarcinoma (EGFR, ALK, ROS1, BRAF e Expressão de PD-L1)",
                            "Síndrome da Veia Cava Superior e Síndrome de Pancoast (Dor no Ombro e Síndrome de Horner por Invasão do Gânglio Estrelado)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Gastroenterologia",
        "focos": [
            {
                "foco": "Doenças Esofágicas e Gastroduodenais (DRGE, Úlcera e Gastrite)",
                "subfocos": [
                    {
                        "subfoco": "Doença do Refluxo Gastroesofágico (DRGE) e Esôfago de Barrett",
                        "sub_subfocos": [
                            "Sintomas Típicos (Pirose e Regurgitação) e Indicações de Endoscopia Digestiva Alta (Sinais de Alarme ou Idade > 40-45 anos)",
                            "Esôfago de Barrett (Metaplasia Intestinal Especializada com Células Caliciformes) e Protocolo de Vigilância Histológica"
                        ]
                    },
                    {
                        "subfoco": "Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori",
                        "sub_subfocos": [
                            "Diferenciação Úlcera Gástrica (Obrigatoriedade de Biópsia para Excluir Neoplasia) vs Duodenal (Maior Associação com H. pylori)",
                            "Esquema Canônico de Erradicação de 1ª Linha: IBP + Claritromicina + Amoxicilina por 14 Dias e Controle de Cura"
                        ]
                    }
                ]
            },
            {
                "foco": "Hemorragia Digestiva (Alta e Baixa)",
                "subfocos": [
                    {
                        "subfoco": "Hemorragia Digestiva Alta (HDA) Não-Varicosa vs Varicosa",
                        "sub_subfocos": [
                            "Estratificação de Risco (Escore de Glasgow-Blatchford e Rockall) e EDA Precoce nas Primeiras 24 Horas",
                            "Classificação de Forrest para Úlcera Sangrante e Terapia Endoscópica Combinada (Injeção de Adrenalina + Termocoagulação/Clipe)"
                        ]
                    },
                    {
                        "subfoco": "Hemorragia Digestiva Baixa (HDB): Divertículos, Angiodisplasia e Conduta",
                        "sub_subfocos": [
                            "Principais Causas: Doença Diverticular dos Cólons (Sangramento Arterial Volumoso) e Angiodisplasias (Idosos e DRC)",
                            "Algoritmo Propedêutico: Colonoscopia após Preparo Rápido vs Angio-TC e Arteriografia com Embolização na Instabilidade"
                        ]
                    }
                ]
            },
            {
                "foco": "Hepatites Agudas e Crônicas (Virais, Tóxicas e Autoimunes)",
                "subfocos": [
                    {
                        "subfoco": "Hepatite B e C: Interpretação Sorológica e Terapia Antiviral",
                        "sub_subfocos": [
                            "Perfil Sorológico da Hepatite B (HBsAg, Anti-HBc IgM/IgG, HBeAg e Anti-HBe) e Critérios de Tratamento com Tenofovir/Entecavir",
                            "Hepatite C: Diagnóstico com Anti-HCV e Carga Viral (HCV-RNA) e Cura com Antivirais de Ação Direta (Sofosbuvir/Velpatasvir)"
                        ]
                    },
                    {
                        "subfoco": "Hepatite Autoimune e Doença Hepática Alcoólica",
                        "sub_subfocos": [
                            "Hepatite Autoimune: Elevação de IgG, Autoanticorpos (FAN, Antimúsculo Liso, Anti-LKM1) e Resposta a Prednisona e Azatioprina",
                            "Hepatite Alcoólica Aguda: Relação AST/ALT > 2 com AST < 300-500 U/L e Cálculo da Função Discriminante de Maddrey (Corticoide se >= 32)"
                        ]
                    }
                ]
            },
            {
                "foco": "Cirrose Hepática e Hipertensão Portal",
                "subfocos": [
                    {
                        "subfoco": "Estratificação Prognóstica (Child-Pugh e MELD) e Síndrome de Hipertensão Portal",
                        "sub_subfocos": [
                            "Classificação de Child-Pugh (Bilirrubina, Albumina, INR, Ascite, Encefalopatia) e Escore MELD para Fila de Transplante Hepático",
                            "Gradiente de Pressão Venosa Hepática (GPVH >= 10 mmHg para Hipertensão Portal Clinicamente Significativa) e Varizes Esofágicas"
                        ]
                    },
                    {
                        "subfoco": "Manejo da Ascite, Peritonite Bacteriana Espontânea (PBE) e Encefalopatia Hepática",
                        "sub_subfocos": [
                            "Análise do Líquido Ascítico pelo GASA (GASA >= 1,1 g/dL Indica Hipertensão Portal) e Tratamento com Espironolactona + Furosemida",
                            "Diagnóstico de PBE (PMN >= 250/mm3 no Líquido Ascítico), Tratamento com Cefotaxima e Profilaxia com Albumina Humana (1,5g/kg no D1 e 1g/kg no D3)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças da Vesícula, Vias Biliares e Pancreatite",
                "subfocos": [
                    {
                        "subfoco": "Pancreatite Aguda no Adulto: Diagnóstico Clínico e Escores Prognósticos",
                        "sub_subfocos": [
                            "Critérios Diagnósticos de Atlanta (2 de 3: Dor Típica em Faixa, Amilase/Lipase > 3x o LSN, Achados Radiológicos em TC/USG)",
                            "Estratificação Prognóstica Precoce (Critérios de Ranson, BISAP, Apache II e Hematócrito > 44%) e Hidratação Vigorosa com Ringer Lactato"
                        ]
                    },
                    {
                        "subfoco": "Pancreatite Crônica, Doenças Colestáticas (Cirrose Biliar Primária e CEP)",
                        "sub_subfocos": [
                            "Tríade da Pancreatite Crônica Avançada: Calcificações Pancreáticas à TC, Esteatorreia e Diabetes Mellitus Secundário",
                            "Colangite Biliar Primária (Anticorpo Antimitocôndria - AMA Positivo e Ácido Ursodesoxicólico) vs Colangite Esclerosante Primária (p-ANCA)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Inflamatórias Intestinais (Crohn e RCU)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial Clínico e Endoscópico: Doença de Crohn vs Retocolite Ulcerativa",
                        "sub_subfocos": [
                            "Retocolite Ulcerativa: Acometimento Contínuo, Restrito à Mucosa, Iniciando no Reto com Sangramento Retal Frequente e Pseudopólipos",
                            "Doença de Crohn: Acometimento Transmural, Salteado (Skip Lesions), da Boca ao Ânus (Íleo Terminal), com Fístulas, Estenoses e Fissuras"
                        ]
                    },
                    {
                        "subfoco": "Terapia de Indução e Manutenção (Biológicos) e Megacólon Tóxico",
                        "sub_subfocos": [
                            "Escalonamento Terapêutico: Derivados de 5-ASA (Mesalazina), Corticoides para Crise e Biológicos Anti-TNF (Infliximabe, Adalimumabe)",
                            "Megacólon Tóxico: Dilatação do Cólon Transverso > 6 cm à Radiografia com Toxemia Sistêmica (Urgência Clínica e Cirúrgica)"
                        ]
                    }
                ]
            },
            {
                "foco": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais",
                "subfocos": [
                    {
                        "subfoco": "Doença Celíaca: Fisiopatologia, Sorologia e Biópsia Duodenal",
                        "sub_subfocos": [
                            "Propedêutica Sorológica: Anticorpo Antitransglutaminase Tecidual IgA (Anti-tTG) e Dosagem Concomitante de IgA Total"
                        ]
                    },
                    {
                        "subfoco": "Síndrome do Intestino Irritável (Critérios de Roma IV) e Supercrescimento Bacteriano (SIBO)",
                        "sub_subfocos": [
                            "Critérios de Roma IV para SII: Dor Abdominal Recorrente >= 1 dia/semana associada a Mudança na Frequência ou Forma das Fezes",
                            "Supercrescimento Bacteriano no Intestino Delgado (SIBO): Teste Respiratório do Hidrogênio Expirado e Tratamento com Rifaximina"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Nefrologia",
        "focos": [
            {
                "foco": "Injúria Renal Aguda (LRA)",
                "subfocos": [
                    {
                        "subfoco": "Classificação KDIGO e Fisiopatologia da LRA",
                        "sub_subfocos": [
                            "Estágios KDIGO 1, 2 e 3 Baseados em Níveis de Creatinina Sérica e Débito Urinário",
                            "Diferenciação LRA Pré-Renal vs Necrose Tubular Aguda (NTA): Fração de Excreção de Sódio (FeNa < 1% vs > 2%) e Osmolaridade Urinária",
                            "Sedimento Urinário: Cilindros Hialinos (Pré-Renal) vs Cilindros Granulosos Pigmentares / Marrom-Grumosos (NTA)"
                        ]
                    },
                    {
                        "subfoco": "Indicações de Diálise de Urgência",
                        "sub_subfocos": [
                            "Indicações Absolutas de Terapia Renal Substitutiva de Urgência (Critérios AEIOU: Acidose Refratária pH < 7,15, Hipercalemia Grave Refratária, Intoxicações Exógenas Dialisáveis, Sobrecarga Volêmica / Edema Agudo Refratário, Uremia Grave Encefalopatia/Pericardite)",
                            "Manejo Clínico Inicial de Estabilização Pré-Diálise e Seleção de Modalidade Dialítica (Hemodiálise Intermitente vs Métodos Contínuos em Choque/Instabilidade Hemodinâmica)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença Renal Crônica (DRC) e Manejo Conservador/Dialítico",
                "subfocos": [
                    {
                        "subfoco": "Estadiamento da DRC (KDIGO por TFG e Albuminúria) e Medidas Nefroprotetoras",
                        "sub_subfocos": [
                            "Classificação KDIGO (Estágios G1 a G5 combinados com Categorias de Albuminúria A1 < 30, A2 30-300, A3 > 300 mg/g)",
                            "Nefroproteção Canônica: Controle Estrito de PA com Bloqueadores do SRAA (IECA/BRA), Inibidores de SGLT2 e Restrição Salina"
                        ]
                    },
                    {
                        "subfoco": "Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo (DMO-DRC)",
                        "sub_subfocos": [
                            "Anemia da DRC por Deficiência de Eritropoietina (Alvo de Hemoglobina 10-11,5 g/dL com Reposição de Ferro e Alfaepoetina)",
                            "DMO-DRC: Hiperparatireoidismo Secundário, Controle de Fósforo com Quelantes e Indicações Formais de Hemodiálise de Urgência"
                        ]
                    }
                ]
            },
            {
                "foco": "Distúrbios Hidroeletrolíticos (Sódio, Potássio, Cálcio, Magnésio)",
                "subfocos": [
                    {
                        "subfoco": "Hiponatremia e Hipernatremia",
                        "sub_subfocos": [
                            "Hiponatremia Hipotônica: Diferenciação pelo Volume Extracelular (Hipovolêmica, Euvolêmica - SIADH, Hipervolêmica)",
                            "Correção com Solução Salina Hipertônica a 3% na Hiponatremia Aguda Sintomática Grave",
                            "Limite de Correção da Natremia: Não Ultrapassar 8-10 mEq/L em 24 Horas para Evitar Síndrome de Desmielinização Osmótica (Mielinólise Pontina)"
                        ]
                    },
                    {
                        "subfoco": "Distúrbios do Potássio (Hipercalemia e Hipocalemia)",
                        "sub_subfocos": [
                            "Alterações Eletrocardiográficas da Hipercalemia: Onda T Apiculada e Simétrica em Tenda, Achatamento de P, Alargamento de QRS e Ritmo Sinusoidal",
                            "Tratamento Imediato da Hipercalemia com Alteração de ECG: Gluconato de Cálcio a 10% EV para Estabilização da Membrana Miocárdica",
                            "Medidas de Translocação (Glicoinsulina, Inalação com Beta-2 Agonista) e Eliminação (Furosemida, Resinas de Troca)"
                        ]
                    }
                ]
            },
            {
                "foco": "Distúrbios do Equilíbrio Ácido-Base",
                "subfocos": [
                    {
                        "subfoco": "Acidose Metabólica com Ânion Gap Elevado vs Normal (Hiperclorêmica)",
                        "sub_subfocos": [
                            "Cálculo do Ânion Gap Sérico (Na - [Cl + HCO3]; Normal: 8 a 12 mEq/L) e Causas de AG Elevado (Mnemônico GOLD MARK: Cetoacidose, Uremia, Lático)",
                            "Acidose Metabólica Hiperclorêmica (Ânion Gap Normal): Perdas Digestivas Baixas (Diarreia) e Acidoses Tubulares Renais (ATRs)"
                        ]
                    },
                    {
                        "subfoco": "Alcalose Metabólica e Distúrbios Respiratórios (Acidose e Alcalose)",
                        "sub_subfocos": [
                            "Alcalose Metabólica: Avaliação do Cloro Urinário (Cl-Responsiva < 15 mEq/L por Vômitos/Diuréticos vs Cl-Resistente por Hiperaldosteronismo)",
                            "Compensação Respiratória Esperada (Fórmula de Winter: pCO2 = [1,5 x HCO3] + 8 +/- 2) para Identificação de Distúrbios Mistos"
                        ]
                    }
                ]
            },
            {
                "foco": "Síndromes Glomerulares (Nefrítica, Nefrótica, GNRP)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome Nefrótica: Fisiopatologia, Complicações e Padrões Histológicos",
                        "sub_subfocos": [
                            "Tríade Clássica: Proteinúria Maciça (> 3,5 g/24h ou Relação P/C urinária > 3,0), Hipoalbuminemia Severa e Edema Generalizado",
                            "Principais Nefropatias: Lesão Mínima (Crianças, Resposta a Corticoide), GESF (Mais Comum em Adultos), Membranosa (Anticorpo Anti-PLA2R) e Risco de Trombose de Veia Renal"
                        ]
                    },
                    {
                        "subfoco": "Síndrome Nefrítica, GNRP e Glomerulonefrite Difusa Aguda (GNDA)",
                        "sub_subfocos": [
                            "Tétrade Nefrítica: Hematúria Dismórfica com Cilindros Hemáticos, Hipertensão Arterial, Edema Periorbital e Oligúria",
                            "GNDA Pós-Estreptocócica (Queda Transitória de C3 e Consumo de Complemento) vs Glomerulonefrite Rapidamente Progressiva com Crescentes Celulares"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Tubulointersticiais e Microangiopatias Trombóticas",
                "subfocos": [
                    {
                        "subfoco": "Nefrite Intersticial Aguda (NIA) e Necrose Tubular Aguda (NTA)",
                        "sub_subfocos": [
                            "Nefrite Intersticial Aguda Induzida por Fármacos (Beta-lactâmicos, AINEs, IBP) com Tríade Típica: Febre, Rash Cutâneo e Eosinofilia/Eosinofilúria",
                            "Necrose Tubular Aguda (NTA Isquêmica ou Tóxica por Aminoglicosídeos/Contraste Iodado) com Cilindros Granulosos Pigmentares e FeNa > 1%"
                        ]
                    },
                    {
                        "subfoco": "Microangiopatia Trombótica: Púrpura Trombocitopênica Trombótica (PTT) e SHU",
                        "sub_subfocos": [
                            "PTT no Adulto: Deficiência Severa da Metaloprotease ADAMTS13 (< 10%), Presença de Esquizócitos no Sangue Periférico e Plasmaférese Terapêutica de Emergência",
                            "Síndrome Hemolítico-Urêmica (SHU Típica por E. coli produtora de Toxina Shiga vs Atípica por Desregulação do Complemento)"
                        ]
                    }
                ]
            },
            {
                "foco": "Litíase Renal e Infecções Urinárias no Adulto",
                "subfocos": [
                    {
                        "subfoco": "Investigação Metabólica da Nefrolitíase Recorrente",
                        "sub_subfocos": [
                            "Composição dos Cálculos (Oxalato de Cálcio 75-80%, Ácido Úrico radiotransparente, Fosfato de Cálcio e Estruvita / Coraliforme)",
                            "Painel Metabólico Urinário de 24 Horas: Hipercalciúria Idiopática (Tratamento com Tiazídicos) e Hipocitratúria (Citrato de Potássio)"
                        ]
                    },
                    {
                        "subfoco": "Cistite, Pielonefrite Aguda e ITU Complicada no Adulto",
                        "sub_subfocos": [
                            "Tratamento da Cistite Aguda Não-Complicada em Mulheres (Fosfomicina Trometamol 3g Dose Única ou Nitrofurantoína 100mg 6/6h por 5 dias)",
                            "Pielonefrite Aguda: Critérios de Internação Hospitalar e Terapia Empírica Guiada por Antibiograma (Ceftriaxona vs Ciprofloxacino)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Endocrinologia",
        "focos": [
            {
                "foco": "Diabetes Mellitus e Complicações Agudas (CAD e EHH)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Metas Glicêmicas no Diabetes Tipo 2",
                        "sub_subfocos": [
                            "Critérios Diagnósticos da SBD/ADA (Glicemia de Jejum >= 126 mg/dL, TOTG 2h >= 200 mg/dL, HbA1c >= 6,5% ou Sintomas Típicos com Glicemia Casual >= 200)",
                            "Metas Terapêuticas Individualizadas de Hemoglobina Glicada (Geral < 7,0%; Idosos/Frágeis < 8,0%)",
                            "Fármacos de Escolha com Proteção Cardiorrenal Comprovada: Inibidores de SGLT2 e Agonistas do GLP-1"
                        ]
                    },
                    {
                        "subfoco": "Cetoacidose Diabética (CAD) e Estado Hiperglicêmico Hiperosmolar (EHH)",
                        "sub_subfocos": [
                            "Critérios Laboratoriais da CAD: Glicemia > 250, Cetonemia/Cetonúria, Acidose Metabólica pH < 7,30 e Bicarbonato < 15",
                            "Manejo Terapêutico da CAD: Hidratação Venosa com Solução Fisiológica a 0,9%, Monitorização Rigorosa do Potássio e Insulina Regular EV Contínua",
                            "Regra de Ouro do Potássio: Não Iniciar Insulina se K+ < 3,3 mEq/L (Repor Potássio Primeiro)",
                            "Critérios de Resolução da CAD e Transição Segura para Insulina Subcutânea"
                        ]
                    }
                ]
            },
            {
                "foco": "Complicações Crônicas do Diabetes (Nefropatia, Retinopatia, Neuropatia)",
                "subfocos": [
                    {
                        "subfoco": "Doença Renal do Diabetes (DRD) e Rastreamento de Albuminúria",
                        "sub_subfocos": [
                            "Rastreamento Anual Obrigatório: Relação Albuminúria/Creatinúria (RAC em Amostra Isolada) e Estimativa da TFG",
                            "Histologia Típica: Glomeruloesclerose Nodular Intercapilar (Nódulos de Kimmelstiel-Wilson) e Terapia com iSGLT2 e Finerenona"
                        ]
                    },
                    {
                        "subfoco": "Retinopatia Diabética, Polineuropatia Simétrica Distal e Pé Diabético",
                        "sub_subfocos": [
                            "Retinopatia Diabética Não-Proliferativa (Microaneurismas e Exsudatos) vs Proliferativa (Neovascularização de Retina e Laserterapia)",
                            "Exame do Pé Diabético: Teste do Monofilamento de Semmes-Weinstein de 10g para Perda da Sensibilidade Protetora e Prevenção de Úlceras"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças da Glândula Tireoide (Hipo, Hiper e Tireoidites)",
                "subfocos": [
                    {
                        "subfoco": "Hipotireoidismo Primário (Tireoidite de Hashimoto) e Hipotireoidismo Subclínico",
                        "sub_subfocos": [
                            "Diagnóstico Laboratorial: TSH Elevado e T4 Livre Baixo; Anticorpo Anti-TPO Positivo Confirmando Doença de Hashimoto",
                            "Tratamento com Levotiroxina (1,6 mcg/kg/dia em Jejum) e Critérios de Tratamento do Hipotireoidismo Subclínico (TSH > 10 ou Gravidez)"
                        ]
                    },
                    {
                        "subfoco": "Hipertireoidismo (Doença de Graves, Bócio Multinodular Tóxico) e Tireoidites",
                        "sub_subfocos": [
                            "Doença de Graves: Anticorpo Anti-Receptor de TSH (TRAb) Positivo, Bócio Difuso Vascularizado e Oftalmopatia Infiltrativa",
                            "Tireoidite Subaguda de De Quervain (Pós-Viral, Dor Cervical Intensa, VHS Muito Alto, Captação de Iodo Baixa e Tratamento com AINEs)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças das Glândulas Adrenais (Cushing, Addison, Feocromocitoma)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome de Cushing: Algoritmo de Triagem e Localização Etiológica",
                        "sub_subfocos": [
                            "Testes de Triagem Inicial (Cortisol Salivar Noturno, Cortisol Livre Urinário de 24h e Teste de Supressão com 1mg de Dexametasona)",
                            "Dosagem de ACTH Plasmático para Diferenciação: ACTH-Dependente (Doença de Cushing Hipofisária) vs ACTH- Independente (Adenoma Adrenal)"
                        ]
                    },
                    {
                        "subfoco": "Insuficiência Adrenal (Doença de Addison) e Feocromocitoma",
                        "sub_subfocos": [
                            "Insuficiência Adrenal Primária: Hipotensão, Hiponatremia, Hipercalemia e Hiperpigmentação Cutaneomucosa por Excesso de ACTH",
                            "Feocromocitoma: Paroxismos de Cefaleia, Sudorese e Palpitações associados a HAS Severa e Dosagem de Metanefrinas Livres Plasmáticas"
                        ]
                    }
                ]
            },
            {
                "foco": "Distúrbios Hipotálamo-Hipofisários e Prolactina",
                "subfocos": [
                    {
                        "subfoco": "Hiperprolactinemia e Prolactinomas (Micro vs Macroprolactinomas)",
                        "sub_subfocos": [
                            "Causas Mais Frequentes: Fármacos Antidopaminérgicos (Antipsicóticos, Metoclopramida), Hipotireoidismo Primário e Prolactinomas",
                            "Tratamento Clínico de 1ª Linha com Agonistas Dopaminérgicos (Cabergolina / Bromocriptina) Promovendo Controle Hormonal e Redução Tumoral"
                        ]
                    },
                    {
                        "subfoco": "Acromegalia e Diabetes Insipidus (Central vs Nefrogênico)",
                        "sub_subfocos": [
                            "Acromegalia: Dosagem de IGF-1 Sérico Elevado e Falha de Supressão do GH no Teste Oral de Tolerância à Glicose",
                            "Diabetes Insipidus: Poliúria Hipotônica (Osmolaridade Urinária < 300 mOsm/kg) e Teste da Desmopressina (dDAVP) para Diferenciação Central vs Renal"
                        ]
                    }
                ]
            },
            {
                "foco": "Obesidade, Síndrome Metabólica e Dislipidemias",
                "subfocos": [
                    {
                        "subfoco": "Critérios Diagnósticos de Síndrome Metabólica (NCEP-ATP III / IDF)",
                        "sub_subfocos": [
                            "Critérios Harmonizados (Presença de 3 ou mais: Circunferência Abdominal Aumentada, Triglicerídeos >= 150, HDL < 40/50, PA >= 130/85, Glicemia >= 100)",
                            "Fisiopatologia Central da Resistência Insulínica e Risco Cardiovascular Exponencial"
                        ]
                    },
                    {
                        "subfoco": "Dislipidemias: Metas de LDL-c e Terapia Farmacológica (Estatinas e Ezetimiba)",
                        "sub_subfocos": [
                            "Estratificação do Risco Cardiovascular (Baixo, Intermediário, Alto e Muito Alto Risco) com Metas Específicas de LDL-c (< 50 mg/dL no Muito Alto)",
                            "Terapia Hipolipemiante de Alta Potência (Atorvastatina 40-80mg ou Rosuvastatina 20-40mg) associada a Ezetimiba e Inibidores de PCSK9"
                        ]
                    }
                ]
            },
            {
                "foco": "Distúrbios do Metabolismo Ósseo e Paratireoide",
                "subfocos": [
                    {
                        "subfoco": "Osteoporose no Adulto: Densitometria Óssea e Escore FRAX",
                        "sub_subfocos": [
                            "Critérios Diagnósticos da OMS à Densitometria (T-score <= -2,5 Desvios-Padrão em Coluna Lombar ou Colo Femoral)",
                            "Tratamento Farmacológico Anti-Reabsortivo (Bisfosfonatos Orais e Intravenosos: Alendronato e Zoledronato) e Teriparatida"
                        ]
                    },
                    {
                        "subfoco": "Distúrbios do Cálcio: Hipercalcemia da Malignidade vs Hiperparatireoidismo",
                        "sub_subfocos": [
                            "Hipercalcemia da Malignidade: Queda Rápida do Estado Geral, PTH Suprimido e Elevação do Peptídeo Relacionado ao PTH (PTHrP)",
                            "Tratamento Imediato da Crise Hipercalcêmica com Hidratação Vigorosa com Solução Salina 0,9% e Ácido Zoledrônico EV"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Reumatologia",
        "focos": [
            {
                "foco": "Artrite Reumatoide e Doença de Still",
                "subfocos": [
                    {
                        "subfoco": "Critérios de Classificação ACR/EULAR 2010 da Artrite Reumatoide",
                        "sub_subfocos": [
                            "Poliartrite Crônica, Simétrica, Periférica, de Pequenas e Grandes Articulações, com Rigidez Matinal > 1 Hora e Poupação das Interfalângicas Distais (IFD)",
                            "Marcadores Sorológicos: Fator Reumatoide (FR) e Anticorpo Antipeptídeo Citrulinado Cíclico (Anti-CCP: Alta Especificidade)"
                        ]
                    },
                    {
                        "subfoco": "Medicamentos Modificadores do Curso da Doença (DMARDs) e Doença de Still",
                        "sub_subfocos": [
                            "Terapia de 1ª Linha Canônica: Metotrexato (MTX) associado a Ácido Fólico e Associação com Biológicos Anti-TNF na Falha Terapêutica",
                            "Doença de Still do Adulto: Febre Diária em Agulha, Erupção Cutânea Evanescente Cor Salmão e Hiperferritinemia Acentuada"
                        ]
                    }
                ]
            },
            {
                "foco": "Lúpus Eritematoso Sistêmico (LES) e SAF",
                "subfocos": [
                    {
                        "subfoco": "Critérios EULAR/ACR 2019 de Classificação do LES",
                        "sub_subfocos": [
                            "Critério de Entrada Obrigatório: Anticorpo Antinuclear (FAN) Positivo em Título >= 1:80 em Células HEp-2",
                            "Critérios Aditivos e Específicos: Anti-Sm e Anti-DNA Dupla Hélice (Nativo), Queda de Complemento (C3 e C4) e Nefrite Lúpica"
                        ]
                    },
                    {
                        "subfoco": "Síndrome do Anticorpo Antifosfolípide (SAF) e Tratamento do LES",
                        "sub_subfocos": [
                            "SAF: Eventos Trombóticos Vasculares ou Morbidade Gestacional associados a Anticoagulante Lúpico, Anticardiolipina ou Anti-Beta-2-Glicoproteína I",
                            "Pilar Terapêutico Universal do LES: Hidroxicloroquina para Todos os Pacientes e Imunossupressão (Micofenolato / Ciclofosfamida na Nefrite)"
                        ]
                    }
                ]
            },
            {
                "foco": "Espondiloartrites (Espondilite Anquilosante, Artrite Psoriásica, Reativa)",
                "subfocos": [
                    {
                        "subfoco": "Espondilite Anquilosante: Lombalgia Inflamatória e HLA-B27",
                        "sub_subfocos": [
                            "Características da Dor Lombar Inflamatória (Início < 45 anos, Melhora com Movimento, Piora com Repouso e Rigidez Matinal > 30 min)",
                            "Sacroiliíte Bilateral à Ressonância Magnética / Radiografia e Presença do Antígeno HLA-B27"
                        ]
                    },
                    {
                        "subfoco": "Artrite Psoriásica e Artrite Reativa (Síndrome de Reiter)",
                        "sub_subfocos": [
                            "Artrite Psoriásica: Padrão Oligoarticular Assimétrico ou Poliarticular com Acometimento de IFD, Dactilite ('Dedo em Salsicha') e Pitting Ungueal",
                            "Artrite Reativa: Tríade Clássica (Artrite Assimétrica, Uretrite Não-Gonocócica e Conjuntivite) após Infecção Geniturinária ou Gastrointestinal"
                        ]
                    }
                ]
            },
            {
                "foco": "Vasculites Sistêmicas (Grandes, Médios e Pequenos Vasos)",
                "subfocos": [
                    {
                        "subfoco": "Vasculites de Grandes e Médios Vasos (Arterite Temporal, Takayasu e Poliarterite Nodosa)",
                        "sub_subfocos": [
                            "Arterite de Células Gigantes / Temporal: Idosos > 50 Anos com Cefaleia Temporal, Claudicação de Mandíbula, VHS Muito Alto e Risco de Cegueira por Oclusão da Artéria Ciliar",
                            "Arterite de Takayasu (Mulheres Jovens, Assimetria de Pulsos e Sopros Vasculares) e Poliarterite Nodosa (Associação com Hepatite B)"
                        ]
                    },
                    {
                        "subfoco": "Vasculites de Pequenos Vasos Associadas ao ANCA e por Imunocomplexos",
                        "sub_subfocos": [
                            "Granulomatose com Poliangiite / Wegener (c-ANCA / Anti-PR3 Positivo, Sinusopatia Crônica, Nódulos Pulmonares Cavitados e Glomerulonefrite)",
                            "Poliangiite Microscópica (p-ANCA / Anti-MPO) e Púrpura de Henoch-Schönlein (Vasculite por IgA com Púrpura Palpável em Membros Inferiores)"
                        ]
                    }
                ]
            },
            {
                "foco": "Esclerose Sistêmica e Miopatias Inflamatórias",
                "subfocos": [
                    {
                        "subfoco": "Esclerose Sistêmica Limitada (Síndrome CREST) vs Difusa",
                        "sub_subfocos": [
                            "Síndrome CREST (Calcinose, Raynaud, Esofagopatia, Esclerodactilia, Telangiectasias) com Anticorpo Anticentrômero Positivo e Risco de Hipertensão Pulmonar",
                            "Forma Difusa: Espessamento Cutâneo Proximal aos Cotovelos/Joelhos, Anticorpo Anti-Scl-70 (Topoisomerase I) e Risco de Crise Renal Esclerodérmica"
                        ]
                    },
                    {
                        "subfoco": "Polimiosite e Dermatomiosite: Diagnóstico Clínico e Imunológico",
                        "sub_subfocos": [
                            "Fraqueza Muscular Proximal e Simétrica com Elevação Acentuada de Enzimas Musculares (CPK e Aldolase) e Eletromiografia Típica",
                            "Manifestações Cutâneas Patognomônicas da Dermatomiosite: Heliótropo (Eritema Violáceo Periorbital) e Pápulas de Gottron sobre as Articulações"
                        ]
                    }
                ]
            },
            {
                "foco": "Artropatias por Microcristais (Gota e Pseudogota)",
                "subfocos": [
                    {
                        "subfoco": "Gota Úrica: Fisiopatologia, Crise Aguda de Podagra e Artrocentese",
                        "sub_subfocos": [
                            "Quadro Clínico da Crise Aguda: Monoartrite Hiperaguda Exuberante, Mais Comumente na 1ª Articulação Metatarsofalângica (Podagra)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento da Crise Aguda vs Terapia Hipouricemiante Crônica",
                        "sub_subfocos": [
                            "Manejo da Crise Inflamatória: AINEs em Doses Plenas, Colchicina Precoce ou Corticoides Orais (Proibido Alterar Dose de Alopurinol na Crise)",
                            "Controle Crônico com Alopurinol associado a Profilaxia de Crise com Colchicina em Baixa Dose (Meta de Ácido Úrico < 6,0 mg/dL)"
                        ]
                    }
                ]
            },
            {
                "foco": "Osteoartrite e Fibromialgia",
                "subfocos": [
                    {
                        "subfoco": "Osteoartrite (Artrose): Fisiopatologia, Nódulos de Heberden/Bouchard e Radiologia",
                        "sub_subfocos": [
                            "Quadro Clínico: Dor Articular Mecânica que Piora com o Uso e Melhora com o Repouso, Rigidez Matinal Breve (< 30 min) e Crepitação",
                            "Sinais Radiológicos Típicos: Redução Assimétrica do Espaço Articular, Esclerose Subcondral, Osteófitos Marginais e Cistos Subcondrais"
                        ]
                    },
                    {
                        "subfoco": "Fibromialgia: Critérios Diagnósticos do ACR e Terapia Farmacológica",
                        "sub_subfocos": [
                            "Quadro de Dor Crônica Difusa Generalizada por mais de 3 Meses associada a Fadiga Crônica, Sono Não-Reparador e Disfunção Cognitiva",
                            "Tratamento Multidisciplinar com Exercícios Físicos Aeróbicos Regulares e Farmacoterapia Central (Duloxetina, Pregabalina e Ciclobenzaprina)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Infectologia",
        "focos": [
            {
                "foco": "Infecção pelo HIV e Doenças Oportunistas",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Terapia Antirretroviral (TARV)",
                        "sub_subfocos": [
                            "Diagnóstico pelo Fluxograma do MS (Testes Rápidos em Paralelo ou Sequencial e Carga Viral)",
                            "Esquema Inicial de Escolha no Brasil: Tenofovir (TDF) + Lamivudina (3TC) + Dolutegravir (DTG)",
                            "Monitorização Terapêutica: Carga Viral Indetectável e Contagem de Linfócitos T CD4+",
                            "Profilaxia Pré-Exposição (PrEP) e Profilaxia Pós-Exposição (PEP em até 72h)"
                        ]
                    },
                    {
                        "subfoco": "Doenças Oportunistas Maiores no HIV",
                        "sub_subfocos": [
                            "Neurotoxoplasmose (CD4 < 100: Lesões Expansivas com Realce Anelar de Contraste e Edema Perilesional à TC/RM; Tratamento com Sulfadiazina + Pirimetamina + Ácido Folínico)",
                            "Pneumocistose / PCP (CD4 < 200: Dispneia Progressiva, Tosse Seca, Infiltrado Intersticial Peri-Hilar Bilateral; Tratamento e Profilaxia com Sulfametoxazol-Trimetoprima)",
                            "Meningite Criptocócica: Líquor com Tinta da China Positiva e Tratamento com Anfotericina B Lipossomal + Flucitosina"
                        ]
                    }
                ]
            },
            {
                "foco": "Arboviroses e Viroses Sistêmicas (Dengue, Chikungunya, Zika, Febre Amarela)",
                "subfocos": [
                    {
                        "subfoco": "Dengue (Classificação de Risco e Manejo Clínico)",
                        "sub_subfocos": [
                            "Grupos de Manejo do MS: Grupo A (Sem Alarme/Risco - Hidratação Oral Domiciliar), Grupo B (Condição Especial / Risco Social - Hidratação Oral Supervisionada no Posto)",
                            "Sinais de Alarme (Dor Abdominal Intensa/Contínua, Vômitos Persistentes, Acúmulo de Líquidos, Hipotensão Postural, Hepatomegalia > 2 cm, Letargia e Hemoconcentração) = Grupo C (Hidratação Venosa Imediata 10 mL/kg na 1ª hora)",
                            "Choque e Sangramento Grave = Grupo D (Ressuscitação Volêmica Venosa Agressiva 20 mL/kg em 20 min)"
                        ]
                    },
                    {
                        "subfoco": "Febre Amarela, Chikungunya e Zika Vírus",
                        "sub_subfocos": [
                            "Febre Amarela: Sinal de Faget (Dissociação Pulso-Temperatura), Insuficiência Hepatorrenal Ictérica e Hemorrágica",
                            "Febre de Chikungunya: Poliartrite Intensa, Simétrica, Incapacitante e Risco de Cronificação Articular"
                        ]
                    }
                ]
            },
            {
                "foco": "Sepse e Choque Séptico no Adulto",
                "subfocos": [
                    {
                        "subfoco": "Definições do Consenso Sepsis-3 e Escore SOFA / qSOFA",
                        "sub_subfocos": [
                            "Sepse: Disfunção Orgânica Ameaçadora à Vida Causada por Resposta Desregulada do Hospedeiro à Infecção (Aumento de >= 2 Pontos no Escore SOFA)",
                            "Choque Séptico: Necessidade de Vasopressor (Noradrenalina) para Manter PAM >= 65 mmHg E Lactato Sérico > 2 mmol/L apesar de Ressuscitação Volêmica Adequada"
                        ]
                    },
                    {
                        "subfoco": "Pacote de 1 Hora do Surviving Sepsis Campaign (SSC)",
                        "sub_subfocos": [
                            "Medidas Canônicas Obrigatórias na 1ª Hora: Dosagem de Lactato Sérico, Coleta de Hemoculturas antes dos Antibióticos e Início Imediato de Antimicrobianos de Amplo Espectro",
                            "Ressuscitação Volêmica com Cristaloides (30 mL/kg nas Primeiras 3 Horas) em Caso de Hipotensão ou Lactato >= 4 mmol/L"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecções por Micobactérias e Fungos Sistêmicos",
                "subfocos": [
                    {
                        "subfoco": "Tuberculose Pulmonar: Diagnóstico (TRM-TB, Baciloscopia) e Esquema RIPE",
                        "sub_subfocos": [
                            "Teste Rápido Molecular para Tuberculose (TRM-TB): Detecção do DNA do M. tuberculosis e Detecção Rápida de Resistência à Rifampicina"
                        ]
                    },
                    {
                        "subfoco": "Micoses Endêmicas: Paracoccidioidomicose, Histoplasmose e Criptococose",
                        "sub_subfocos": [
                            "Paracoccidioidomicose: Exposição Rural, Lesões Mucosas em Estomatite Moriforme e Leveduras com Brotamento Múltiplo em 'Roda de Leme'",
                            "Histoplasmose Disseminada e Criptococose Meníngea no Paciente Imunodeprimido (Tratamento com Anfotericina B e Fluconazol)"
                        ]
                    }
                ]
            },
            {
                "foco": "Zoonoses e Doenças Tropicais (Leptospirose, Malária, Chagas, Leishmanioses)",
                "subfocos": [
                    {
                        "subfoco": "Leptospirose (Doença de Weil) e Malária no Brasil",
                        "sub_subfocos": [
                            "Síndrome de Weil (Forma Ictero-Hemorrágica Grave): Tríade de Icterícia Rubínica / Alaranjada, Insuficiência Renal Aguda Hipocalêmica e Hemorragia Pulmonar",
                            "Malária: Febre Terçã (P. vivax e P. falciparum) vs Quartã (P. malariae), Diagnóstico por Gota Espessa e Tratamento com Cloroquina + Primaquina"
                        ]
                    },
                    {
                        "subfoco": "Doença de Chagas (Fase Aguda e Crônica) e Leishmaniose Visceral (Calazar)",
                        "sub_subfocos": [
                            "Doença de Chagas: Formas Clínicas Crônicas Cardíaca (Bloqueio de Ramo Direito + BDAS) e Digestiva (Megaesôfago e Megacólon)",
                            "Leishmaniose Visceral: Febre Prolongada, Hepatoesplenomegalia Volumosa Maciça, Pancitopenia e Terapia com Antimoniato de Meglumina ou Anfotericina B Lipossomal"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecções Respiratórias e Faríngeas (COVID-19, Influenza)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome Respiratória Aguda Grave (SRAG) por Influenza e Oseltamivir",
                        "sub_subfocos": [
                            "Definição de SRAG (Síndrome Gripal associada a Dispneia, Saturação de O2 < 95% em ar ambiente ou Desconforto Respiratório)",
                            "Indicação Precoce de Inibidores da Neuraminidase (Oseltamivir Oral) em até 48 Horas para Pacientes com Fatores de Risco ou SRAG"
                        ]
                    },
                    {
                        "subfoco": "COVID-19 no Adulto: Estratificação de Gravidade e Manejo Terapêutico",
                        "sub_subfocos": [
                            "Critérios de Gravidade e Indicação de Oxigenoterapia em Pacientes Hipoxêmicos",
                            "Terapia com Corticosteroides Sistêmicos (Dexametasona 6 mg/dia por até 10 dias) nos Pacientes que Requerem Suporte de Oxigênio"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecções do Sistema Nervoso Central no Adulto (Meningites e Encefalites)",
                "subfocos": [
                    {
                        "subfoco": "Meningite Bacteriana Aguda: Quadro Clínico, Punção Lombar e Análise Liquórica",
                        "sub_subfocos": [
                            "Tríade Clássica: Febre Alta, Rigidez de Nuca (Sinais de Kernig e Brudzinski) e Alteração do Nível de Consciência",
                            "Padrão Liquórico Bacteriano Típico: Pleocitose com Predomínio Neutrofílico (> 80%), Hiperproteinorraquia (> 100-200 mg/dL) e Hipoglicorraquia Severa (Razão Líquor/Sérica < 0,4)"
                        ]
                    },
                    {
                        "subfoco": "Terapia Antimicrobiana Empírica Imediata e Encefalite Herpética",
                        "sub_subfocos": [
                            "Esquema Empírico de 1ª Linha: Ceftriaxona 2g EV 12/12h associada a Dexametasona EV Precoce antes ou junto com a Primeira Dose de Antibiótico",
                            "Encefalite por Herpes Simples (HSV-1): Febre, Alteração Comportamental, Crises Focais, Acometimento Temporal Típico à RNM e Aciclovir EV Imediato"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecções Hospitalares e Uso Racional de Antimicrobianos",
                "subfocos": [
                    {
                        "subfoco": "Pneumonia Associada à Ventilação Mecânica (PAV) e Infecções de Corrente Sanguínea (IPCS)",
                        "sub_subfocos": [
                            "PAV: Critérios Diagnósticos Radiológicos e Clínicos, Coleta de Aspirado Traqueal e Pacote de Medidas Preventivas (Cabeceira Elevada 30-45°)",
                            "Infecção Primária de Corrente Sanguínea associada a Cateter Venoso Central (CVC) e Princípios de Coleta de Hemoculturas Pareadas"
                        ]
                    },
                    {
                        "subfoco": "Patógenos Multirresistentes (MDR / ESKAPE) e Stewardship de Antimicrobianos",
                        "sub_subfocos": [
                            "Mecanismos de Resistência: Enterobactérias Produtoras de ESBL (Tratamento com Carbapenêmicos) e KPC (Tratamento com Ceftazidima-Avibactam)",
                            "Staphylococcus aureus Resistente à Meticilina (MRSA: Tratamento com Vancomicina e Daptomicina) e Descalonamento Guiado por Cultura"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Hematologia",
        "focos": [
            {
                "foco": "Anemias Carenciais e de Doença Crônica",
                "subfocos": [
                    {
                        "subfoco": "Anemia Ferropriva: Cinética do Ferro e Propedêutica Laboratorial",
                        "sub_subfocos": [
                            "Padrão Laboratorial Clássico: Microcitose e Hipocromia com RDW Elevado (Anisocitose), Ferritina Sérica Baixa (< 30 ng/mL) e Capacidade Total de Ligação do Ferro (TIBC) Elevada",
                            "Investigação Etiológica Obrigatória de Sangramento Gastrointestinal Oculto em Homens Adultos e Mulheres Pós- Menopausadas"
                        ]
                    },
                    {
                        "subfoco": "Anemia de Doença Crônica e Anemias Megaloblásticas (B12 e Folato)",
                        "sub_subfocos": [
                            "Anemia de Doença Crônica / Inflamatória: Bloqueio de Ferro Mediado por Hepcidina com Ferritina Normal ou Elevada e Ferro Sérico Baixo",
                            "Anemia Megaloblástica: Macrocitose Acentuada (VCM > 100-110 fL), Neutrófilos Hipersegmentados e Deficiência de Vitamina B12 com Sintomas Neurológicos"
                        ]
                    }
                ]
            },
            {
                "foco": "Anemias Hemolíticas Adquiridas e Congênitas",
                "subfocos": [
                    {
                        "subfoco": "Achados Gerais de Hemólise e Anemia Falciforme (Crises Vaso-Oclusivas)",
                        "sub_subfocos": [
                            "Tétrade Laboratorial da Hemólise: Aumento de Reticulócitos, Elevação de LDH, Hiperbilirrubinemia Indireta e Queda Acentuada de Haptoglobina",
                            "Anemia Falciforme: Manejo da Crise Álgica Aguda Vaso-Oclusiva (Hidratação, Analgesia Escalonada com Opioides) e Síndrome Torácica Aguda"
                        ]
                    },
                    {
                        "subfoco": "Anemias Hemolíticas Autoimunes (AHAI) e Esferocitose Hereditária",
                        "sub_subfocos": [
                            "AHAI por Anticorpos Quentes (IgG, Teste de Coombs Direto Positivo, Resposta a Corticoide) vs Anticorpos Frios (IgM / Aglutininas Frias)",
                            "Esferocitose Hereditária: Defeito no Citoesqueleto Eritrocitário (Espectrina/Anquirina), Teste de Fragilidade Osmótica Aumentado e Esplenectomia"
                        ]
                    }
                ]
            },
            {
                "foco": "Leucemias Agudas e Crônicas no Adulto",
                "subfocos": [
                    {
                        "subfoco": "Leucemia Mieloide Aguda (LMA) e Leucemia Linfoide Aguda (LLA)",
                        "sub_subfocos": [
                            "Definição Diagnóstica de Leucemia Aguda: Presença de >= 20% de Blastos na Medula Óssea ou Sangue Periférico",
                            "LMA: Presença de Bastonetes de Auer ao Mielograma e Leucemia Promielocítica Aguda (LMA-M3 / Translocação t[15;17] tratada com ATRA)"
                        ]
                    },
                    {
                        "subfoco": "Leucemia Mieloide Crônica (LMC) e Leucemia Linfoide Crônica (LLC)",
                        "sub_subfocos": [
                            "LMC: Neutrofilia Intensa com Desvio Escalonado à Esquerda, Cromossomo Philadelphia t(9;22) com Gene de Fusão BCR- ABL e Tratamento com Imatinibe",
                            "LLC: Linfocitose B Clonal Absoluta Persistente em Idosos, Manchas de Gumprecht no Esfregaço e Estadiamento de Rai e Binet"
                        ]
                    }
                ]
            },
            {
                "foco": "Linfomas (Hodgkin e Não-Hodgkin) e Mieloma Múltiplo",
                "subfocos": [
                    {
                        "subfoco": "Linfoma de Hodgkin vs Linfoma Não-Hodgkin (LNH)",
                        "sub_subfocos": [
                            "Linfoma de Hodgkin: Presença Típica de Células de Reed-Sternberg à Biópsia Linfonodal Excisional e Sintomas B (Febre Pel-Ebstein, Sudorese Noturna e Perda de Peso)",
                            "Linfomas Não-Hodgkin: Linfoma Difuso de Grandes Células B (Tipo Mais Comum, Agressivo) e Linfoma Folicular Indolente"
                        ]
                    },
                    {
                        "subfoco": "Mieloma Múltiplo: Critérios Diagnósticos Canônicos (CRAB)",
                        "sub_subfocos": [
                            "Tétrade CRAB: Hipercalcemia (C), Insuficiência Renal (R), Anemia Normo/Normo (A) e Lesões Ósseas Líticas em 'Saca- Bocado' (B)",
                            "Propedêutica: Eletroforese de Proteínas com Pico Monoclonal, Cadeias Leves Livres Séricas e Mielograma com Plasmócitos Clonais >= 10%"
                        ]
                    }
                ]
            },
            {
                "foco": "Distúrbios da Hemostasia e Coagulopatias (Hemofilias e Plaquetopenias)",
                "subfocos": [
                    {
                        "subfoco": "Púrpura Trombocitopênica Imunológica (PTI) e Trombocitopenia Induzida por Heparina (HIT)",
                        "sub_subfocos": [
                            "PTI Primária: Trombocitopenia Isolada sem Outras Citopenias ou Esquizócitos e Tratamento Inicial com Corticoides ou Imunoglobulina Humana EV",
                            "HIT Tipo II: Queda de > 50% das Plaquetas após 5-10 Dias de Heparina com Alto Risco Paradoxal de Trombose (Suspensão e Troca por Fondaparinux)"
                        ]
                    },
                    {
                        "subfoco": "Hemofilias Congênitas (Hemofilia A e B) e Coagulação Intravascular Disseminada (CIVD)",
                        "sub_subfocos": [
                            "Hemofilia A (Deficiência de Fator VIII) e B (Deficiência de Fator IX): Herança Ligada ao X, Alargamento Isolado do TTPA com TP Normal e Hemartroses",
                            "CIVD: Consumo de Fatores e Plaquetas com Alargamento Simultâneo de TP e TTPA, Hipofibrinogenemia e Elevação Maciça de Dímero-D"
                        ]
                    }
                ]
            },
            {
                "foco": "Trombofilias e Trombose",
                "subfocos": [
                    {
                        "subfoco": "Trombofilias Hereditárias (Fator V de Leiden, Mutação da Protrombina)",
                        "sub_subfocos": [
                            "Trombofilia Hereditária Mais Comum: Fator V de Leiden (Resistência à Proteína C Ativada) e Mutação G20210A da Protrombina",
                            "Deficiências de Inibidores Naturais da Coagulação: Antitrombina III, Proteína C e Proteína S (Risco de Necrose Cutânea por Varfarina)"
                        ]
                    },
                    {
                        "subfoco": "Indicações de Rastreamento de Trombofilias e Duração da Anticoagulação",
                        "sub_subfocos": [
                            "Critérios Clínicos de Investigação: TVP Não-Provocada em Idade Jovem (< 50 anos), Trombose em Sítios Incomuns (Mesentérica, Cerebral) ou Trombose Recorrente",
                            "Momento Correto da Coleta: Evitar Dosagens na Fase Aguda da Trombose ou sob Uso de Anticoagulantes para Evitar Falso-Positivos"
                        ]
                    }
                ]
            },
            {
                "foco": "Medicina Transfusional e Reações Hemolíticas",
                "subfocos": [
                    {
                        "subfoco": "Gatilhos Transfusionais para Concentrado de Hemácias e Plaquetas",
                        "sub_subfocos": [
                            "Gatilho Restritivo Padrão: Hemoglobina < 7,0 g/dL no Paciente Crítico Estável (Gatilho < 8,0 g/dL em Pacientes com Doença Cardiovascular Aguda)",
                            "Transfusão de Plaquetas: Profilática em Contagens < 10.000/mm3 (Falência Medular) ou < 50.000/mm3 antes de Procedimentos Invasivos de Médio Porte"
                        ]
                    },
                    {
                        "subfoco": "Reações Transfusionais Graves: TRALI, TACO e Hemólise Aguda Imune",
                        "sub_subfocos": [
                            "TRALI (Lesão Pulmonar Aguda Relacionada à Transfusão): Hipoxemia e Infiltrado Pulmonar Bilateral Não-Cardiogênico em até 6 Horas Pós-Transfusão",
                            "TACO (Sobrecarga Circulatória Associada à Transfusão): Edema Agudo Cardiogênico com Aumento de Pressão Venosa e BNP (Tratamento com Furosemida EV)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Neurologia",
        "focos": [
            {
                "foco": "Acidente Vascular Cerebral (Isquêmico e Hemorrágico)",
                "subfocos": [
                    {
                        "subfoco": "Acidente Vascular Cerebral Isquêmico (AVCi) Agudo",
                        "sub_subfocos": [
                            "Tomografia de Crânio sem Contraste Imediata para Exclusão de Sangramento",
                            "Janela de Trombólise Intravenosa com Alteplase em até 4,5 Horas do Ictus (Critérios de Inclusão, Exclusão e Alvo Pressórico < 185x110 mmHg)",
                            "Trombectomia Mecânica Endovascular em até 6 a 24 Horas para Oclusão de Grandes Vasos da Circulação Anterior"
                        ]
                    },
                    {
                        "subfoco": "Acidente Vascular Cerebral Hemorrágico e Hemorragia Subaracnóidea",
                        "sub_subfocos": [
                            "Prevenção Secundária: Antiagregação Plaquetária (AAS / Clopidogrel), Estatina de Alta Potência e Anticoagulação se Origem Cardioembólica",
                            "Hemorragia Intraparenquimatosa Espontânea: Controle Rigoroso da Pressão Arterial (PAS < 140 mmHg) e Reversão de Anticoagulação",
                            "Hemorragia Subaracnóidea (HSA) por Aneurisma Sacular: Cefaleia Súbita e Explosiva (\"Pior Cefaleia da Vida\"), TC sem Contraste / Punção Lombar (Xantocromia)",
                            "Complicações da HSA: Vasoespasmo Cerebral (Prevenção com Nimodipino Oral) e Ressangramento"
                        ]
                    }
                ]
            },
            {
                "foco": "Epilepsias e Estado de Mal Epiléptico no Adulto",
                "subfocos": [
                    {
                        "subfoco": "Classificação das Crises Epilépticas (Focais vs Generalizadas)",
                        "sub_subfocos": [
                            "Crises Focais com Percepção Preservada vs Comprometida (Origem Temporal com Automatismos Motores) e Crises Tônico-Clônicas Generalizadas Bilaterais",
                            "Propedêutica Inicial do 1º Episódio Crítico: Neuroimagem (TC/RNM) e Eletroencefalograma (EEG) para Pesquisa de Descargas Epileptiformes"
                        ]
                    },
                    {
                        "subfoco": "Protocolo de Manejo do Estado de Mal Epiléptico (Status Epilepticus)",
                        "sub_subfocos": [
                            "Definição Operacional (Crise Convulsiva Contínua >= 5 Minutos ou 2 Crises sem Recuperação da Consciência)",
                            "Algoritmo Escalonado: 1ª Linha com Benzodiazepínico EV (Diazepam / Lorazepam) seguido de 2ª Linha (Fenitoína EV ou Levetiracetam)"
                        ]
                    }
                ]
            },
            {
                "foco": "Cefaleias Primárias e Secundárias",
                "subfocos": [
                    {
                        "subfoco": "Cefaleias Primárias: Enxaqueca, Tensional e Cefaleia em Salvas",
                        "sub_subfocos": [
                            "Migrânea / Enxaqueca: Unilateral, Pulsátil, Moderada a Grave, Piora com Atividade, Foto/Fonofobia e Náuseas (Tratamento Agudo com Triptanos)",
                            "Cefaleia em Salvas: Dor Periorbital Unilateral Excruciante em Homens, Acompanhada de Sinais Autonômicos (Lacrimejamento e Rinorreia, Tratada com O2 a 100%)"
                        ]
                    },
                    {
                        "subfoco": "Sinais de Alarme (Red Flags) e Cefaleia Secundária (Hemorragia Subaracnóidea)",
                        "sub_subfocos": [
                            "Sinais de Alarme (Mnemônico SNOOP: Sintomas Sistêmicos, Déficit Neurológico, Início Súbito 'Em Trovoada' e Mudança de Padrão)",
                            "Hemorragia Subaracnóidea por Ruptura de Aneurisma Sacular: Cefaleia em Trovoada Hiperaguda, Rigidez de Nuca e TC de Crânio Imediata"
                        ]
                    }
                ]
            },
            {
                "foco": "Síndromes Demenciais e Doença de Alzheimer",
                "subfocos": [
                    {
                        "subfoco": "Doença de Alzheimer: Fisiopatologia, Perda de Memória Recente e Farmacoterapia",
                        "sub_subfocos": [
                            "Déficit Amnéstico Precoce da Memória Episódica Recente com Preservação da Memória Remota e Deposição de Placas Beta-Amiloides e Emaranhados Tau",
                            "Tratamento com Inibidores da Acetilcolinesterase (Donepezila, Rivastigmina, Galantamina) e Antagonista NMDA (Memantina nas Fases Moderadas a Graves)"
                        ]
                    },
                    {
                        "subfoco": "Diagnóstico Diferencial: Demência Vascular, Corpos de Lewy e Frontotemporal",
                        "sub_subfocos": [
                            "Demência com Corpos de Lewy: Flutuação Cognitiva Cognitiva Precoce, Alucinações Visuais Vívidas e Parkinsonismo Espontâneo",
                            "Demência Vascular (Evolução em Degraus associada a Doença Cerebrovascular) e Demência Frontotemporal com Alteração Comportamental Precoce"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Desmielinizantes (Esclerose Múltipla)",
                "subfocos": [
                    {
                        "subfoco": "Esclerose Múltipla: Fisiopatologia, Disseminação no Tempo e Espaço (Critérios de McDonald)",
                        "sub_subfocos": [
                            "Manifestações Típicas em Mulheres Jovens: Neurite Óptica Unilateral Dolorosa, Mielite Transversa e Síndrome de Fadiga",
                            "Ressonância Magnética com Lesões Desmielinizantes Periventriculares ('Dedos de Dawson') e Bandas Oligoclonais no Líquor"
                        ]
                    },
                    {
                        "subfoco": "Tratamento do Surto Agudo (Pulsoterapia) e Terapias Modificadoras de Doença",
                        "sub_subfocos": [
                            "Tratamento do Surto Neurológico Agudo com Metilprednisolona Intravenosa em Altas Doses (1g/dia por 3 a 5 dias)",
                            "Terapias de Manutenção Modificadoras da Doença (Interferon-beta, Acetato de Glatirâmer, Natalizumabe e Ocrelizumabe)"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Neuromusculares e Polineuropatias (Guillain-Barré, Miastenia Gravis)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome de Guillain-Barré (Polirradiculoneuropatia Inflamatória Desmielinizante Aguda)",
                        "sub_subfocos": [
                            "Quadro Clínico: Paralisia Flácida Ascendente, Simétrica e Arreflexia com Início após Infecção Prévia (Campylobacter jejuni)",
                            "Dissociação Proteíno-Citológica no Líquor (Proteína Elevada sem Elevação de Celularidade) e Tratamento com Imunoglobulina EV ou Plasmaférese"
                        ]
                    },
                    {
                        "subfoco": "Miastenia Gravis: Fisiopatologia Autoimune da Placa Motora e Crise Miastênica",
                        "sub_subfocos": [
                            "Fatigabilidade Muscular Flutuante com Piora ao Final do Dia (Ptose Palpebral, Diplopia, Disartria) e Anticorpos Anti- Receptor de Acetilcolina (Anti-AChR)",
                            "Tratamento com Piridostigmina (Inibidor da Acetilcolinesterase), Corticoides, Timectomia e Manejo da Crise Miastênica com Suporte Ventilatório"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença de Parkinson e Distúrbios do Movimento",
                "subfocos": [
                    {
                        "subfoco": "Tétrade Motora Canônica do Parkinsonismo e Diagnóstico Clínico",
                        "sub_subfocos": [
                            "Quadro Clínico: Tremor de Repouso Unilateral ('Contar Moedas'), Rigidez em 'Roda Dentada', Bradicinesia Obrigatória e Instabilidade Postural Tardia",
                            "Assimetria dos Sintomas Motores no Início e Excelente Resposta Terapêutica ao Teste com Levodopa Confirmando o Diagnóstico"
                        ]
                    },
                    {
                        "subfoco": "Tratamento com Levodopa/Carbidopa e Diagnóstico Diferencial de Parkinsonismo Secundário",
                        "sub_subfocos": [
                            "Uso da Levodopa associada a Inibidor da Dopa-Descarboxilase e Complicações Motoras Tardias (Flutuações 'On-Off' e Discinesias)",
                            "Parkinsonismo Medicamentoso Induzido por Antagonistas Dopaminérgicos (Antipsicóticos, Metoclopramida, Flunarizina: Quadro Bilateral e Simétrico)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Dermatologia",
        "focos": [
            {
                "foco": "Dermatoses Inflamatórias e Eritêmato-Descamativas (Psoríase, Dermatite Atópica)",
                "subfocos": [
                    {
                        "subfoco": "Psoríase Vulgar: Fisiopatologia, Quadro Clínico e Fenômeno de Koebner",
                        "sub_subfocos": [
                            "Placas Eritematodescamativas Bem Delimitadas com Escamas Prateadas em Áreas de Extensão (Cotovelos, Joelhos e Couro Cabeludo)",
                            "Semiologia Dermatológica Típica: Curetagem de Brocq (Sinal da Vela e Orvalho Sanguinante de Auspitz) e Fenômeno de Koebner"
                        ]
                    },
                    {
                        "subfoco": "Dermatite Atópica e Dermatite de Contato (Alérgica vs Irritativa)",
                        "sub_subfocos": [
                            "Dermatite Atópica: Prurido Intenso, Pele Seca e Lesões Eczematosas em Áreas Flexurais (Fossas Antecubitais e Poplíteas) associadas a Asma e Rinite",
                            "Dermatite de Contato por Irritante Primário (Dano Direto, Todos Indivíduos) vs Alérgica por Hipersensibilidade Tipo IV (Níquel, Teste de Contato Positivo)"
                        ]
                    }
                ]
            },
            {
                "foco": "Erupções Medicamentosas Graves (DRESS, Stevens-Johnson, NET)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome DRESS (Drug Reaction with Eosinophilia and Systemic Symptoms)",
                        "sub_subfocos": [
                            "Início Tardio (2 a 8 Semanas após Fármacos como Anticonvulsivantes e Alopurinol) com Erupção Morbiliforme, Febre Alta e Linfadenopatia",
                            "Comprometimento de Órgão-Alvo (Hepatite Aguda, Nefrite) e Marcada Eosinofilia Sérica e Linfócitos Atípicos"
                        ]
                    },
                    {
                        "subfoco": "Síndrome de Stevens-Johnson (SSJ) e Necrólise Epidérmica Tóxica (NET)",
                        "sub_subfocos": [
                            "Destacamento Epidérmico Agudo Necrótico com Sinal de Nikolsky Positivo e Acometimento Severo de Múltiplas Mucosas (Oral, Ocular, Genital)",
                            "Diferenciação por Área de Superfície Corporal Descolada: SSJ (< 10%), Superposição SSJ/NET (10-30%) e NET (> 30%) com Tratamento em Centro de Queimados"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Bolhosas Autoimunes (Pênfigos e Penfigoide)",
                "subfocos": [
                    {
                        "subfoco": "Pênfigo Vulgar vs Pênfigo Foliáceo",
                        "sub_subfocos": [
                            "Pênfigo Vulgar: Autoanticorpos Anti-Desmogleína 3, Bolhas Flácidas Intraepidérmicas Suprabasais que se Rompem Facilmente, Sinal de Nikolsky Positivo e Envolvimento Mucoso Oral Extenso",
                            "Pênfigo Foliáceo ('Fogo Selvagem'): Anticorpos Anti-Desmogleína 1, Bolhas Subcórneas Superficiais com Crostas e Poupação Mandatória de Mucosas"
                        ]
                    },
                    {
                        "subfoco": "Penfigoide Bolhoso: Fisiopatologia e Quadro Clínico em Idosos",
                        "sub_subfocos": [
                            "Autoanticorpos contra a Zona da Membrana Basal (Anti-BP180 e Anti-BP230) com Formação de Bolhas Subepidérmicas Tensas e Raras Lesões Mucosas",
                            "Acometimento Predominante em Idosos com Sinal de Nikolsky Negativo e Resposta Favorável a Corticosteroides Sistêmicos"
                        ]
                    }
                ]
            },
            {
                "foco": "Infecções Cutâneas Bacterianas, Fúngicas e Virais",
                "subfocos": [
                    {
                        "subfoco": "Infecções Bacterianas Cutâneas: Erisipela, Celulite e Fasciíte Necrosante",
                        "sub_subfocos": [
                            "Erisipela (Estrepto do Grupo A: Superficial, Bordas Nítidas, Bem Delimitadas e Dor Aguda) vs Celulite (Estafilo/Estrepto: Mais Profunda e Bordas Indistintas)",
                            "Fasciíte Necrosante: Emergência Cirúrgica Ameaçadora com Dor Desproporcional aos Achados Físicos, Crepitação e Rápida Progressão com Bolhas Hemorrágicas"
                        ]
                    },
                    {
                        "subfoco": "Micoses Superficiais (Dermatofitoses) e Infecções Virais (Herpes-Zóster)",
                        "sub_subfocos": [
                            "Tinea Corporis, Cruris e Pedis: Lesões Anulares com Bordas Eritematosas Elevadas e Centro Mais Claro (Exame Micológico Direto com Hifas Hialinas)",
                            "Herpes-Zóster: Reativação do Vírus Varicela-Zóster em Dermátomo Unilateral com Vesículas Agrupadas em Base Eritematosa e Neuralgia Pós-Herpética"
                        ]
                    }
                ]
            },
            {
                "foco": "Hanseníase e Manifestações Cutâneas",
                "subfocos": [
                    {
                        "subfoco": "Classificação de Ridley-Jopling e Formas Operacionais (Paucibacilar vs Multibacilar)",
                        "sub_subfocos": [
                            "Critérios Diagnósticos Clínicos: Lesão Cutânea com Alteração Térmica, Dolorosa e Tátil associada a Espessamento de Nervos Periféricos",
                            "Classificação Operacional da OMS: Paucibacilar (Até 5 lesões de pele: Formas Indeterminada e Tuberculoide) vs Multibacilar (Mais de 5 lesões: Virchowiana e Dimorfa)"
                        ]
                    },
                    {
                        "subfoco": "Poliquimioterapia Única (PQT-U) e Estados Reacionais Hansênicos",
                        "sub_subfocos": [
                            "Esquema Terapêutico Padrão PQT-U (Rifampicina, Dapsona e Clofazimina) por 6 Meses (PB) ou 12 Meses (MB)",
                            "Reações Hansênicas: Reação Tipo 1 (Reversa: Neurite Aguda tratada com Prednisona) vs Reação Tipo 2 (Eritema Nodoso Hansênico tratado com Talidomida)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Pele e Lesões Pré-Malignas no Adulto",
                "subfocos": [
                    {
                        "subfoco": "Carcinomas Cutâneos (CBC e CEC) e Ceratose Actínica na Prática Clínica",
                        "sub_subfocos": [
                            "Identificação Clínica de Ceratoses Actínicas (Placas Ásperas Eritematosas Hiperceratóticas em Áreas Expostas ao Sol tratadas com Crioterapia ou Fluorouracil)",
                            "Suspeição Clínica de Carcinoma Basocelular e Espinocelular e Encaminhamento com Biópsia Confirmatória"
                        ]
                    },
                    {
                        "subfoco": "Melanoma Cutâneo: Reconhecimento Precoce e Triagem Dermatológica",
                        "sub_subfocos": [
                            "Aplicação da Regra do ABCDE no Exame Físico de Rotina e Identificação do 'Sinal do Patinho Feio' (Lesão Pigmentada Doadora Distinta das Demais)",
                            "Indicação Precisa de Biópsia Excisional em Lesões Pigmentadas Suspeitas e Avaliação de Linfonodos Regionais"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Alergia e Imunologia",
        "focos": [
            {
                "foco": "Anafilaxia e Reações Alérgicas Graves",
                "subfocos": [
                    {
                        "subfoco": "Critérios Clínicos de Diagnóstico Imediato da Anafilaxia",
                        "sub_subfocos": [
                            "Início Agudo (Minutos a Horas) envolvendo Pele/Mucosas (Urticária, Angioedema) associado a Comprometimento Respiratório OU Hipotensão/Colapso Cardiovascular",
                            "Principais Gatilhos: Alimentos (Amendoim, Frutos do Mar), Medicamentos (Beta-lactâmicos, AINEs) e Venenos de Insetos Himenópteros"
                        ]
                    },
                    {
                        "subfoco": "Protocolo de Emergência: Adrenalina Intramuscular Precoce e Manejo",
                        "sub_subfocos": [
                            "Medicamento de 1ª Linha Absoluto e Mandatório: Adrenalina Aquosa (1:1.000) por Via Intramuscular na Face Anterolateral da Coxa (0,3 a 0,5 mg no Adulto)",
                            "Posicionamento em Decúbito Dorsal com Elevação de Membros, Oxigenoterapia, Expansão com Cristaloide e Corticoide/Anti-histamínico apenas como Coadjuvantes Tardios"
                        ]
                    }
                ]
            },
            {
                "foco": "Urticária e Angioedema (Hereditário e Adquirido)",
                "subfocos": [
                    {
                        "subfoco": "Urticária Aguda vs Crônica e Terapia com Anti-Histamínicos H1",
                        "sub_subfocos": [
                            "Definição Temporal: Urticária Aguda (< 6 semanas) vs Urticária Crônica Espontânea (>= 6 semanas com Lesões Fugazes e Pruriginosas que Duram < 24h sem Deixar Marcas)",
                            "Tratamento Escalonado de 1ª Linha: Anti-histamínicos H1 de 2ª Geração Não-Sedantes (Cetirizina, Fexofenadina) com Possibilidade de Aumento da Dose em até 4 Vezes"
                        ]
                    },
                    {
                        "subfoco": "Angioedema Hereditário Mediado por Bradicinina",
                        "sub_subfocos": [
                            "Fisiopatologia: Deficiência Quantitativa ou Funcional do Inibidor de C1-Esterase (C1-INH) com Edema Subcutâneo/Mucoso Não-Pruriginoso e sem Urticária Concomitante",
                            "Risco de Edema de Glote e Refratariedade a Adrenalina e Corticoides; Tratamento Específico com Concentrado de C1-INH ou Antagonista do Receptor B2 de Bradicinina (Icatibanto)"
                        ]
                    }
                ]
            },
            {
                "foco": "Rinite Alérgica e Alergias Alimentares/Medicamentosas",
                "subfocos": [
                    {
                        "subfoco": "Rinite Alérgica: Classificação ARIA e Corticoterapia Nasal",
                        "sub_subfocos": [
                            "Classificação ARIA (Intermitente vs Persistente; Leve vs Moderada-Grave) e Tríade de Prurido Nasal, Espirros em Salva e Rinorreia Clara"
                        ]
                    },
                    {
                        "subfoco": "Reações Adversas a Fármacos: Reações Alérgicas Tipo I (IgE) vs Reações Pseudoalérgicas",
                        "sub_subfocos": [
                            "Reações Mediadas por IgE a Antibióticos Beta-Lactâmicos e Papel dos Testes Cutâneos e Dessensibilização",
                            "Reações de Hipersensibilidade a AINEs Mediadas por Inibição da COX-1 e Desvio para Via dos Leucotrienos (Tríade de Samter / Doença Respiratória Exacerbada por AAS)"
                        ]
                    }
                ]
            },
            {
                "foco": "Imunodeficiências Primárias e Secundárias no Adulto",
                "subfocos": [
                    {
                        "subfoco": "Imunodeficiência Comum Variável (IDCV) no Adulto",
                        "sub_subfocos": [
                            "Imunodeficiência Primária Sintomática Mais Frequente no Adulto: Infecções Sinopulmonares de Repetição por Bactérias Encapsuladas e Bronquiectasias",
                            "Achado Laboratorial Típico: Hipogamaglobulinemia Marcada (Redução Significativa de IgG associada a IgA ou IgM) e Tratamento com Imunoglobulina Humana de Reposição"
                        ]
                    },
                    {
                        "subfoco": "Imunodeficiências Secundárias a Fármacos Imunossupressores e Doenças Sistêmicas",
                        "sub_subfocos": [
                            "Imunossupressão Iatrogênica por Corticoterapia Prolongada, Agentes Biológicos Anti-TNF e Inibidores de Checkpoint Imunológico",
                            "Risco Aumentado de Reativação de Infecções Latentes (Tuberculose, Hepatite B, Estrongiloidíase) e Profilaxias Recomendadas"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Oncologia Clínica",
        "focos": [
            {
                "foco": "Princípios de Oncogênese, Estadiamento e Biópsia",
                "subfocos": [
                    {
                        "subfoco": "Bases Biológicas do Câncer e Avaliação do Performance Status (ECOG / Karnofsky)",
                        "sub_subfocos": [
                            "Hallmarks do Câncer (Sustentação de Sinal Proliferativo, Evasão de Supressores, Resistência à Apoptose, Angiogênese e Metástase)",
                            "Escalas de Funcionalidade Clínica: ECOG (0: Atividade Plena a 4: Confinado ao Leito) como Determinante Crítico de Elegibilidade Quimioterápica"
                        ]
                    },
                    {
                        "subfoco": "Princípios do Sistema TNM e Importância da Confirmação Histopatológica",
                        "sub_subfocos": [
                            "Sistema de Estadiamento TNM (Tamanho do Tumor Primário, Linfonodos Regionais e Metástase a Distância)",
                            "Obrigatoriedade de Biópsia Tecidual com Análise Imuno-histoquímica antes de Qualquer Intervenção Sistêmica Neoplásica"
                        ]
                    }
                ]
            },
            {
                "foco": "Emergências Oncológicas (Síndrome de Lise Tumoral, Neutropenia Febril, Hipercalcemia)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome de Lise Tumoral (SLT): Fisiopatologia, Critérios de Cairo-Bishop e Rasburicase",
                        "sub_subfocos": [
                            "Alterações Laboratoriais Típicas por Destruição Celular Maciça: Hiperuricemia, Hipercalemia, Hiperfosfatemia e Hipocalcemia Secundária",
                            "Prevenção e Tratamento: Hiper-hidratação Venosa Vigorosa associada a Hipouricemiantes (Alopurinol) ou Rasburicase (Urato Oxidase Recombinante)"
                        ]
                    },
                    {
                        "subfoco": "Neutropenia Febril e Compressão Medular Maligna",
                        "sub_subfocos": [
                            "Neutropenia Febril (Neutrófilos Totais < 500/mm3 associados a Temperatura >= 38,3°C): Emergência com Início Imediato de Cefepime EV em até 1 Hora",
                            "Compressão Medular Neoplásica: Dor Dorsal/Lombar com Déficit Motor e Disfunção Esfincteriana (RNM de Coluna Total e Dexametasona em Altas Doses)"
                        ]
                    }
                ]
            },
            {
                "foco": "Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo",
                "subfocos": [
                    {
                        "subfoco": "Toxicidades Clássicas de Quimioterápicos Citotóxicos",
                        "sub_subfocos": [
                            "Cardiotoxicidade por Antraciclinas (Doxorrubicina com Disfunção Ventricular Cumulativa) e Nefrotoxicidade/Ototoxicidade por Platinas (Cisplatina)",
                            "Neuropatia Periférica Sensitiva por Taxanos e Oxaliplatina e Alopecia Induzida por Quimioterapia"
                        ]
                    },
                    {
                        "subfoco": "Eventos Adversos Imunomediados por Inibidores de Checkpoint (Anti-PD-1, Anti-CTLA-4)",
                        "sub_subfocos": [
                            "Toxicidades Autoimunes Induzidas por Pembrolizumabe e Ipilimumabe: Colite Imunomediada, Hipofisite, Pneumonite e Tiroidite",
                            "Manejo das Toxicidades Imunomediadas Graves com Suspensão do Agente Imunoterápico e Instituição Precoce de Corticoterapia em Altas Doses"
                        ]
                    }
                ]
            },
            {
                "foco": "Síndromes Paraneoplásicas",
                "subfocos": [
                    {
                        "subfoco": "Síndromes Paraneoplásicas Endócrinas (SIADH, Cushing Ectópico, Hipercalcemia)",
                        "sub_subfocos": [
                            "SIADH Paraneoplásica associada ao Carcinoma Pulmonar de Pequenas Células (Oat-Cell) com Hiponatremia Hipotônica Euvolêmica",
                            "Síndrome de Cushing Ectópica por Secreção de ACTH por Tumores Neuroendócrinos Pulmonares com Alcalose Metabólica e Hiperpigmentação"
                        ]
                    },
                    {
                        "subfoco": "Síndromes Paraneoplásicas Neurológicas e Hematológicas",
                        "sub_subfocos": [
                            "Síndrome Miastênica de Lambert-Eaton (Anticorpos contra Canais de Cálcio Voltagem-Dependentes, Melhora com Repetição do Movimento, Pequenas Células de Pulmão)",
                            "Encefalite Límbica Paraneoplásica e Tromboflebite Migratória (Sinal de Trousseau associado ao Adenocarcinoma de Pâncreas)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Medicina de Emergência",
        "focos": [
            {
                "foco": "Choque Circulatório e Monitorização Hemodinâmica",
                "subfocos": [
                    {
                        "subfoco": "Diferenciação Hemodinâmica dos 4 Tipos de Choque (Distributivo, Cardiogênico, Hipovolêmico, Obstrutivo)",
                        "sub_subfocos": [
                            "Choque Distributivo (Séptico/Anafilático): RVP Baixa, Débito Cardíaco Elevado na Fase Inicial e Saturação Venosa Central (SvcO2) Normal ou Elevada",
                            "Choque Cardiogênico e Hipovolêmico (RVP Elevada Compensatória com Baixo Débito Cardíaco) vs Obstrutivo (Tamponamento, TEP Maciço, Pneumotórax Hipertensivo)"
                        ]
                    },
                    {
                        "subfoco": "Uso de Drogas Vasoativas, Inotrópicos e Ressuscitação Guiada por Metas",
                        "sub_subfocos": [
                            "Vasopressor de 1ª Escolha Universal: Noradrenalina Titulada para Alvo de PAM >= 65 mmHg associada precocemente a Vasopressina",
                            "Inotrópico de Escolha na Disfunção Miocárdica: Dobutamina associada a Alvos de Clearance de Lactato e Tempo de Enchimento Capilar"
                        ]
                    }
                ]
            },
            {
                "foco": "Insuficiência Respiratória Aguda e Ventilação Mecânica",
                "subfocos": [
                    {
                        "subfoco": "Insuficiência Respiratória Tipo 1 (Hipoxêmica) vs Tipo 2 (Hipercápnica)",
                        "sub_subfocos": [
                            "Tipo 1 / Hipoxêmica (Distúrbio V/Q e Shunt Intrapulmonar em EAP, Pneumonia e SDRA com Gradiente Alvéolo-Arterial Elevado)",
                            "Tipo 2 / Hipercápnica (Hipoventilação Alveolar em DPOC Descompensada, Doenças Neuromusculares e Depressão do SNC com pCO2 > 45-50 mmHg)"
                        ]
                    },
                    {
                        "subfoco": "Parâmetros Iniciais da Ventilação Mecânica Protetora na SDRA",
                        "sub_subfocos": [
                            "Protocolo ARDSNet: Volume Corrente Baixo (4 a 6 mL/kg de Peso Predito) para Prevenção de Volutrauma e Biotrauma",
                            "Limitação de Pressão de Platô <= 30 cmH2O e Pressão de Distensão Alveolar (Driving Pressure <= 15 cmH2O) associada a PEEP Titulada"
                        ]
                    }
                ]
            },
            {
                "foco": "Intoxicações Exógenas Agudas e Síndromes Tóxicas",
                "subfocos": [
                    {
                        "subfoco": "Descontaminação Gastrointestinal e Métodos de Eliminação Acelerada",
                        "sub_subfocos": [
                            "Carvão Ativado em Dose Única (1 g/kg até 1-2 Horas da Ingestão Oral) e Contraindicações (Cáusticos, Hidrocarbonetos, Metais)",
                            "Lavagem Gástrica (Apenas em Ingestões Potencialmente Fatais em até 1 Hora com Via Aérea Protegida) e Alcalinização Urinária para Salicilatos"
                        ]
                    },
                    {
                        "subfoco": "Reconhecimento das Toxidromes e Antídotos Específicos em Emergência",
                        "sub_subfocos": [
                            "Síndrome Opioide (Depressão Respiratória, Miose Puntiforme e Coma tratada com Naloxona EV Titulada)",
                            "Síndrome Sedativo-Hipnótica (Flumazenil com Cuidado em Usuários Crônicos de BZD) e Síndrome Anticolinérgica"
                        ]
                    }
                ]
            },
            {
                "foco": "Coma e Alteração Aguda do Nível de Consciência (Delirium)",
                "subfocos": [
                    {
                        "subfoco": "Coma Agudo: Escala de Coma de Glasgow-P e Avaliação de Tronco Encefálico",
                        "sub_subfocos": [
                            "Aplicação da Escala de Glasgow Atualizada com Reatividade Pupilar (ECG-P: Pontuação de 1 a 15) e Indicação de IOT se Pontuação <= 8",
                            "Reflexos de Tronco Encefálico: Fotomotor, Córneo-Palpebral, Oculocefálico ('Olhos de Boneca') e Oculovestibular"
                        ]
                    },
                    {
                        "subfoco": "Delirium no Paciente Grave: Avaliação com CAM-ICU e Manejo",
                        "sub_subfocos": [
                            "Critérios do CAM-ICU (Início Agudo/Flutuante, Inatenção associada a Pensamento Desorganizado ou Nível Alterado de Consciência)",
                            "Subtipos Hiperativo vs Hipoativo (Mais Comum e de Pior Prognóstico) e Manejo Não-Farmacológico Primário associado a Antipsicóticos (Haloperidol)"
                        ]
                    }
                ]
            },
            {
                "foco": "Hipotermia e Queimaduras no Adulto em UTI",
                "subfocos": [
                    {
                        "subfoco": "Hipotermia Acidental Grave no Adulto e Reaquecimento Ativo",
                        "sub_subfocos": [
                            "Estadiamento da Hipotermia: Leve (32-35°C), Moderada (28-32°C com Arritmias e Bradicardia) e Grave (< 28°C com Risco de FV)",
                            "Eletrocardiograma Típico: Ondas J de Osborn e Técnicas de Reaquecimento Ativo Interno (Fluidos Aquecidos EV, Lavagem Pleural/Peritoneal)"
                        ]
                    },
                    {
                        "subfoco": "Suporte Intensivo ao Grande Queimado Adulto e Complicações Sistêmicas",
                        "sub_subfocos": [
                            "Hipermetabolismo Severo no Grande Queimado, Síndrome da Resposta Inflamatória Sistêmica e Nutrição Enteral Precoce",
                            "Monitorização do Débito Urinário (Alvo de 0,5 mL/kg/h em Adultos) e Manejo da Mioglobinúria e Rabdomiólise associadas"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Geriatria",
        "focos": [
            {
                "foco": "Grandes Síndromes Geriátricas (Instabilidade, Quedas e Fragilidade)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome da Fragilidade no Idoso: Fenótipo de Fried",
                        "sub_subfocos": [
                            "Critérios do Fenótipo de Fried (>= 3 presentes: Perda de Peso Não-Intencional, Exaustão, Fraqueza na Força de Preensão, Marcha Lenta e Baixa Atividade Física)",
                            "Fisiopatologia da Sarcopenia e Vulnerabilidade Acentuada a Desfechos Adversos e Hospitalização"
                        ]
                    },
                    {
                        "subfoco": "Instabilidade Postural, Marcha e Avaliação de Quedas em Idosos",
                        "sub_subfocos": [
                            "Avaliação Funcional da Mobilidade com Teste Timed Up and Go (TUG > 12-14 segundos indica Alto Risco de Quedas)",
                            "Investigação Multifatorial de Quedas: Hipotensão Postural, Déficits Sensoriais, Fatores Ambientais Domiciliares e Polifarmácia"
                        ]
                    }
                ]
            },
            {
                "foco": "Polifarmácia e Critérios de Beers/STOPP-START",
                "subfocos": [
                    {
                        "subfoco": "Definição de Polifarmácia e Efeito Cascata Iatrogênico",
                        "sub_subfocos": [
                            "Conceito de Polifarmácia (Uso Concomitante de >= 5 Medicamentos Contínuos) e Farmacocinética do Envelhecimento (Queda de TFG e Aumento de Gordura Corporal)",
                            "Cascata Iatrogênica: Prescrição de Novo Fármaco para Tratar Efeito Colateral Não Reconhecido de Medicamento Prévio"
                        ]
                    },
                    {
                        "subfoco": "Critérios de Beers e Ferramenta STOPP/START para Prescrição Segura",
                        "sub_subfocos": [
                            "Medicamentos Potencialmente Inapropriados para Idosos (Benzodiazepínicos de Longa Ação, Anticolinérgicos, AINEs Contínuos e Antipsicóticos)",
                            "Desprescrição Estruturada e Aplicação dos Critérios START para Iniciar Terapias com Benefício Comprovado"
                        ]
                    }
                ]
            },
            {
                "foco": "Avaliação Geriátrica Ampla (AGA) e Funcionalidade",
                "subfocos": [
                    {
                        "subfoco": "Instrumentos de Avaliação das Atividades de Vida Diária (AVDs e AIVDs)",
                        "sub_subfocos": [
                            "Atividades Básicas de Vida Diária (ABVD / Índice de Katz: Banho, Vestir-se, Higiene Pessoal, Transferência, Continência e Alimentação)",
                            "Atividades Instrumentais de Vida Diária (AIVD / Escala de Lawton: Uso do Telefone, Compras, Preparo de Refeições, Tarefas Domésticas e Gestão de Finanças)"
                        ]
                    },
                    {
                        "subfoco": "Avaliação Cognitiva e Rastreamento de Humor no Idoso (MEEM e GDS)",
                        "sub_subfocos": [
                            "Miniexame do Estado Mental (MEEM / Folstein) e Teste de Fluência Verbal com Ajuste Obrigatório pela Escolaridade",
                            "Escala de Depressão Geriátrica (GDS-15: Triagem Específica de Sintomas Depressivos no Paciente Idoso)"
                        ]
                    }
                ]
            },
            {
                "foco": "Incontinência e Imobilidade no Idoso",
                "subfocos": [
                    {
                        "subfoco": "Incontinência Urinária no Idoso: Causas Transitórias (Mnemônico DIAPPERS)",
                        "sub_subfocos": [
                            "Mnemônico DIAPPERS: Delirium, Infecção Urinária, Atrofia Vaginal, Farmacológica, Psiquiátrica, Excesso de Produção de Urina, Restrição de Mobilidade e Fecaloma",
                            "Diferenciação Canônica: Incontinência de Urgência (Bexiga Hiperativa) vs Esforço vs Transbordamento por Retenção Urinária Crônica"
                        ]
                    },
                    {
                        "subfoco": "Síndrome da Imobilidade e Consequências Sistêmicas do Confinamento ao Leito",
                        "sub_subfocos": [
                            "Critérios Maiores e Menores da Síndrome de Imobilização Prolongada (Contraturas Articulares, Úlceras por Pressão e Atrofia Muscular)",
                            "Prevenção Terciária e Reabilitação Motora Multidisciplinar com Fisioterapia Motora Precoce"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Cuidados Paliativos",
        "focos": [
            {
                "foco": "Princípios e Filosofia dos Cuidados Paliativos",
                "subfocos": [
                    {
                        "subfoco": "Definição da OMS, Indicações Precoces e Ortogásia",
                        "sub_subfocos": [
                            "Conceito Canônico de Cuidados Paliativos: Abordagem que Aprimora a Qualidade de Vida de Pacientes e Familiares diante de Doenças Ameaçadoras da Vida",
                            "Integração Precoce dos Cuidados Paliativos Concomitante à Terapia Modificadora de Doença desde o Diagnóstico de Doença Crônica Avançada"
                        ]
                    },
                    {
                        "subfoco": "Avaliação do Sofrimento Global (Dor Total de Cicely Saunders)",
                        "sub_subfocos": [
                            "Conceito de Dor Total: Dimensões Física, Psicológica, Social e Espiritual do Sofrimento Humano",
                            "Comunicação de Más Notícias: Protocolo SPIKES (Setting, Perception, Invitation, Knowledge, Empathy, Strategy/Summary)"
                        ]
                    }
                ]
            },
            {
                "foco": "Manejo da Dor Crônica e Escada Analgésica da OMS",
                "subfocos": [
                    {
                        "subfoco": "Escada Analgésica da OMS para Dor Oncológica e Não-Oncológica",
                        "sub_subfocos": [
                            "Degraus Canônicos: Degrau 1 (Não-Opioides: Dipirona/Paracetamol +/- Adjuvante); Degrau 2 (Opioides Fracos: Codeína, Tramadol); Degrau 3 (Opioides Fortes: Morfina, Metadona, Fentanil)",
                            "Princípios Fundamentais: Administração 'Pelo Relógio' (Horário Fixo, Não se Dor), Pela Boca (Via Oral Preferencial) e Individualizada"
                        ]
                    },
                    {
                        "subfoco": "Conversão de Opioides, Manejo de Efeitos Colaterais e Dor Incidental",
                        "sub_subfocos": [
                            "Cálculo de Doses de Resgate para Dor Irruptiva (10 a 1/6 da Dose Total Diária de Morfina Oral em Tomadas Extras)",
                            "Manejo Obrigatório da Constipação Induzida por Opioides com Laxativos Estimulantes (Bisacodil, Senne) e Profilaxia de Náuseas Iniciais"
                        ]
                    }
                ]
            },
            {
                "foco": "Controle de Sintomas Não-Dor (Dispneia, Náusea, Estertor, Agitação)",
                "subfocos": [
                    {
                        "subfoco": "Dispneia Refratária em Cuidados Paliativos e Uso de Opioides",
                        "sub_subfocos": [
                            "Medidas Não-Farmacológicas Eficazes: Posicionamento Elevado, Ventilação Facial Direta com Ventilador Portátil e Janela Aberta",
                            "Estertor do Fim de Vida ('Respiração Ruidosa'): Esclarecimento à Família e Terapia com Anticolinérgicos (Butilescopolamina SC)"
                        ]
                    },
                    {
                        "subfoco": "Manejo de Sintomas Digestivos e Neuropsiquiátricos (Estertor Agônico)",
                        "sub_subfocos": [
                            "Náuseas e Vômitos Intratáveis: Diferenciação entre Causas Centrais (Haloperidol), Gastroparesia (Metoclopramida) e Hipertensão Intracraniana (Dexametasona)"
                        ]
                    }
                ]
            },
            {
                "foco": "Sedação Paliativa e Comunicação em Fim de Vida",
                "subfocos": [
                    {
                        "subfoco": "Critérios Éticos e Indicações Formais de Sedação Paliativa",
                        "sub_subfocos": [
                            "Indicação Estrita: Presença de Sintoma Refratário Insuportável (Dispneia Asfixiante, Delirium Hiperativo Grave, Dor Incontrolável) no Paciente em Fase Terminal",
                            "Distinção Ética e Legal Absoluta entre Sedação Paliativa (Objetivo de Alívio do Sofrimento) e Eutanásia (Objetivo de Provocar a Morte)"
                        ]
                    },
                    {
                        "subfoco": "Protocolos Farmacológicos de Sedação com Midazolam e Cuidados com a Família",
                        "sub_subfocos": [
                            "Fármaco de Escolha Canônico: Midazolam em Infusão Contínua Subcutânea ou Intravenosa Titulado até o Alívio do Sintoma Alvo",
                            "Apoio Psicológico e Espiritual à Família, Acolhimento do Luto Antecipatório e Adequação do Plano de Cuidados"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Toxicologia Clínica",
        "focos": [
            {
                "foco": "Síndromes Tóxicas (Anticolinérgica, Colinérgica, Simpaticomimética, Opioide)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome Colinérgica e Síndrome Anticolinérgica",
                        "sub_subfocos": [
                            "Síndrome Colinérgica (Organofosforados/Carbamatos): Miose, Sialorreia Intensa, Broncorreia, Broncoespasmo, Fasciculações e Bradicardia (Tratamento com Atropina)",
                            "Síndrome Anticolinérgica: 'Cego como uma Coruja, Louco como um Chapeleiro, Vermelho como uma Beterraba, Seco como um Osso' (Midríase, Pele Seca e Quente, Retenção Urinária)"
                        ]
                    },
                    {
                        "subfoco": "Síndrome Simpaticomimética (Cocaína, Anfetaminas) vs Síndrome Serotoninérgica",
                        "sub_subfocos": [
                            "Simpaticomimética: Midríase, Taquicardia, Hipertensão, Sudorese Profusa e Agitação Psicomotora (Tratamento com Benzodiazepínicos e Contraindicação a Beta-Bloqueadores Puros)",
                            "Síndrome Serotoninérgica: Hiper-reflexia Acentuada, Clônus Induzível/Espontâneo, Instabilidade Autonômica e Hipertermia após Antidepressivos"
                        ]
                    }
                ]
            },
            {
                "foco": "Intoxicações por Medicamentos (Paracetamol, Benzodiazepínicos, Antidepressivos)",
                "subfocos": [
                    {
                        "subfoco": "Intoxicação por Paracetamol (Acetaminofeno) e N-Acetilcisteína",
                        "sub_subfocos": [
                            "Fisiopatologia: Depleção de Glutationa Hepática e Acúmulo do Metabólito Tóxico NAPQI causando Necrose Hepática Fulminante",
                            "Nomograma de Rumack-Matthew para Avaliação do Risco de Hepatotoxicidade e Tratamento com N-Acetilcisteína (NAC) Precoce em até 8 Horas"
                        ]
                    },
                    {
                        "subfoco": "Intoxicação por Antidepressivos Tricíclicos (ADT) e Bicarbonato de Sódio",
                        "sub_subfocos": [
                            "Tétrade Tóxica: Alteração da Consciência, Arritmias Cardíacas Ventriculares, Convulsões e Efeitos Anticolinérgicos",
                            "Eletrocardiograma Típico (Alargamento de QRS > 100 ms e Onda R Alta em aVR) e Tratamento Específico Imediato com Bicarbonato de Sódio a 8,4% EV"
                        ]
                    }
                ]
            },
            {
                "foco": "Acidentes por Animais Peçonhentos (Ofídico, Escorpiônico, Aracnídico)",
                "subfocos": [
                    {
                        "subfoco": "Acidentes Ofídicos no Brasil: Botrópico, Crotálico, Laquético e Elapídico",
                        "sub_subfocos": [
                            "Acidente Botrópico (Jararaca: Mais Comum - 85% dos casos, Ação Proteolítica/Inflamatória Local, Coagulante e Hemorrágica)",
                            "Acidente Crotálico (Cascavel: Ação Neurotóxica com Fácies Miatênica/Ptose, Miotóxica com Rabdomiólise e Urina Escura, sem Reação Local)"
                        ]
                    },
                    {
                        "subfoco": "Escorpionismo (Tityus serrulatus) e Araneísmo (Loxosceles e Phoneutria)",
                        "sub_subfocos": [
                            "Escorpionismo Grave em Crianças: Manifestações Sistêmicas Autonômicas (Vômitos Profusos, Sudorese, Insuficiência Cardíaca e Edema Pulmonar tratados com Soro Antiescorpiônico)",
                            "Loxoscelismo (Aranha-Marrom): Placa Marmórea Típica com Necrose Cutânea Tardia e Forma Cutâneo-Hemolítica Grave"
                        ]
                    }
                ]
            },
            {
                "foco": "Intoxicação por Agrotóxicos e Álcoois Tóxicos (Metanol, Etilenoglicol)",
                "subfocos": [
                    {
                        "subfoco": "Intoxicação por Inibidores da Colinesterase (Organofosforados e Carbamatos)",
                        "sub_subfocos": [
                            "Inibição Irreversível da Acetilcolinesterase por Organofosforados ('Envelhecimento da Enzima') vs Reversível por Carbamatos (Chumbinho)",
                            "Atropinização Contínua Titulada com Alvo em Parâmetros Pulmonares (Cessação da Broncorreia e Ressecamento de Secreções) e Oximas (Pralidoxima)"
                        ]
                    },
                    {
                        "subfoco": "Álcoois Tóxicos: Metanol e Etilenoglicol (Fomepizol e Etanol)",
                        "sub_subfocos": [
                            "Metanol (Ácido Fórmico causando Neurite Óptica e Cegueira Típica) vs Etilenoglicol (Ácido Oxálico com Cristais de Oxalato de Cálcio e Insuficiência Renal Aguda)",
                            "Acidose Metabólica com Ânion Gap Elevado e Gap Osmolar Aumentado (> 10-15 mOsm/kg); Tratamento com Fomepizol ou Etanol EV e Hemodiálise de Urgência"
                        ]
                    }
                ]
            }
        ]
    }
]
};
