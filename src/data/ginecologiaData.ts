import { SpecialtyHierarchy } from "@/types";

export const ginecologiaHierarchy: SpecialtyHierarchy = {
  "especialidade": "Ginecologia",
  "temas": [
    {
        "tema": "Fisiologia Menstrual e Sangramento Uterino Anormal",
        "focos": [
            {
                "foco": "Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário",
                "subfocos": [
                    {
                        "subfoco": "Fisiologia do Ciclo Ovariano e Endometrial",
                        "sub_subfocos": [
                            "Fase Folicular / Proliferativa: Recrutamento Folicular, Seleção do Folículo Dominante e Pico de Estradiol",
                            "Pico Pré-Ovulatório de LH, Mecanismo da Ovulação e Formação do Corpo Lúteo",
                            "Fase Lútea / Secretora: Secreção de Progesterona, Degeneração Lútea e Mecanismo da Menstruação"
                        ]
                    },
                    {
                        "subfoco": "Controle Neuroendócrino e Feedback Hormonal",
                        "sub_subfocos": [
                            "Pulsatilidade do GnRH Hipotalâmico (Frequência e Amplitude)",
                            "Feedbacks Positivo e Negativo dos Esteroides Ovarianos sobre Hipófise e Hipotálamo"
                        ]
                    }
                ]
            },
            {
                "foco": "Sangramento Uterino Anormal (Classificação PALM-COEIN)",
                "subfocos": [
                    {
                        "subfoco": "Causas Estruturais - Mnemônico PALM",
                        "sub_subfocos": [
                            "Pólipo Endometrial e Adenomiose Focal/Difusa",
                            "Leiomioma Uterino (Classificação FIGO Submucoso vs Intramural vs Subseroso)",
                            "Malignidade e Hiperplasia com Atipia"
                        ]
                    },
                    {
                        "subfoco": "Causas Não-Estruturais - Mnemônico COEIN",
                        "sub_subfocos": [
                            "Coagulopatias (Doença de von Willebrand em Meninas Adolescentes)",
                            "Disfunção Ovulatória (Anovulação Crônica nos Extremos da Vida Reprodutiva)",
                            "Causas Endometriais, Iatrogênicas (DIU, Anticoagulantes) e Não Classificadas"
                        ]
                    }
                ]
            },
            {
                "foco": "Manejo Farmacológico e Cirúrgico do SUA",
                "subfocos": [
                    {
                        "subfoco": "Abordagem Aguda e Hemodinâmica do SUA Grave",
                        "sub_subfocos": [
                            "Estabilização Hemodinâmica e Estrogênios Conjugados em Altas Doses ou Antifibrinolíticos (Ácido Tranexâmico EV/Oral)",
                            "Tamponamento Mecânico com Balão Intrauterino (Sonda de Foley) e Curetagem Hemostática de Urgência"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Clínico Crônico e Opções Cirúrgicas",
                        "sub_subfocos": [
                            "SIU de Levonorgestrel, Progestágenos Orais Contínuos e ACOs Combinados",
                            "Ablação Endometrial Histeroscópica e Histerectomia (Indicações, Vias e Prole Constituída)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Amenorreias e Distúrbios Neuroendócrinos",
        "focos": [
            {
                "foco": "Amenorreia Primária (Investigação e Disgenesias Gonadais)",
                "subfocos": [
                    {
                        "subfoco": "Amenorreia Primária com Caracteres Sexuais Secundários Presentes",
                        "sub_subfocos": [
                            "Síndrome de Mayer-Rokitansky-Küster-Hauser (Agenesia Mülleriana, Cariótipo 46,XX, Ovários Normais e Ausência de Útero/2/3 Superiores de Vagina)",
                            "Síndrome de Insensibilidade Aos Androgênios / Morris (Cariótipo 46,XY, Testículos Intra-abdominais, Pelos Pubianos Ausentes/Escassos)",
                            "Hímen Imperfurado e Septo Vaginal Transverso (Hematocolpo / Hematometra com Dor Cíclica)"
                        ]
                    },
                    {
                        "subfoco": "Amenorreia Primária sem Caracteres Sexuais Secundários",
                        "sub_subfocos": [
                            "Hipogonadismo Hipergonadotrófico: Síndrome de Turner (45,X0) e Disgenesia Gonadal Pura (FSH e LH Muito Elevados)",
                            "Hipogonadismo Hipogonadotrófico: Síndrome de Kallmann (Anosmia e Deficiência Central de GnRH) e Atraso Constitucional"
                        ]
                    }
                ]
            },
            {
                "foco": "Amenorreia Secundária (Investigação Passo a Passo)",
                "subfocos": [
                    {
                        "subfoco": "Algoritmo Sequencial de Investigação da Amenorreia Secundária",
                        "sub_subfocos": [
                            "Passo 1: Exclusão Mandatória de Gravidez (Beta-hCG) e Dosagem de TSH e Prolactina",
                            "Passo 2: Teste da Progesterona (Avaliação do Status Estrogênico e Trato de Saída Íntegro com Sangramento Positivo)",
                            "Passo 3: Teste do Estrogênio + Progesterona (Sangramento Negativo Confirma Causa Anatômica / Uterina)",
                            "Passo 4: Dosagem de FSH e LH (Diferenciação Ovariana vs Hipotálamo-Hipofisária)",
                            "Passo 5: Teste do GnRH (Diferenciação Hipotalâmica vs Hipofisária)"
                        ]
                    },
                    {
                        "subfoco": "Causas Uterinas e Amenorreia Hipotalâmica Funcional",
                        "sub_subfocos": [
                            "Síndrome de Asherman (Sinéquias Uterinas Intrauterinas Pós-Curetagem ou Endometrite Grave)",
                            "Amenorreia Funcional Hipotalâmica por Exercício Físico Extremo, Anorexia Nervosa e Estresse Severo"
                        ]
                    }
                ]
            },
            {
                "foco": "Hiperprolactinemia e Adenomas Hipofisários",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Etiologia da Hiperprolactinemia",
                        "sub_subfocos": [
                            "Manifestações Clínicas: Galactorreia, Oligomenorreia / Amenorreia, Infertilidade e Sintomas Compressivos (Hemianopsia Bitemporal)",
                            "Causas Medicamentosas (Antipsicóticos, Metoclopramida, Antidepressivos) vs Hipotireoidismo Primário (TRH estimula prolactina)"
                        ]
                    },
                    {
                        "subfoco": "Prolactinomas e Tratamento com Agonistas Dopaminérgicos",
                        "sub_subfocos": [
                            "Diferenciação Tomográfica/Ressonância entre Microadenoma (< 10 mm) e Macroadenoma (>= 10 mm)"
                        ]
                    }
                ]
            },
            {
                "foco": "Falência Ovariana Prematura",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Quadro Clínico da Insuficiência Ovariana Prematura",
                        "sub_subfocos": [
                            "Critérios Clínicos e Laboratoriais: Amenorreia >= 4 Meses antes dos 40 Anos associada a Níveis Menopáusicos de FSH (> 25-40 UI/L) Confirmados em 2 Dosagens",
                            "Etiologias Autoimunes, Genéticas (Pré-Mutação do X Frágil) e Iatrogênicas (Quimioterapia / Radioterapia)"
                        ]
                    },
                    {
                        "subfoco": "Terapia Hormonal e Riscos a Longo Prazo",
                        "sub_subfocos": [
                            "Indicação Mandatória de Terapia Hormonal Substitutiva até a Idade Média da Menopausa Natural (~50 Anos) para Proteção Óssea e Cardiovascular",
                            "Preservação da Fertilidade e Risco Residual de Ovulação Espontânea (5-10%)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Síndrome dos Ovários Policísticos e Hiperandrogenismo",
        "focos": [
            {
                "foco": "Síndrome dos Ovários Policísticos (SOP: Critérios de Rotterdam e Fenótipos)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico e Critérios de Rotterdam Atualizados",
                        "sub_subfocos": [
                            "Critérios Canônicos (2 de 3): Oligo/Anovulação, Hiperandrogenismo Clínico/Laboratorial e Morfologia Ovariana Policística à USG (>= 20 folículos de 2-9 mm por ovário ou volume >= 10 mL)",
                            "Fenótipos da SOP (A: Completo; B: Ovulatório; C: Hiperandrogênico sem ovários policísticos; D: Não Hiperandrogênico)",
                            "Exclusão Obrigatória de Outras Causas (HAC Não Clássica, Hiperprolactinemia, Disfunção Tireoidiana e Tumores Virilizantes)"
                        ]
                    },
                    {
                        "subfoco": "Manejo Clínico, Metabólico e Reprodutivo da SOP",
                        "sub_subfocos": [
                            "Mudança do Estilo de Vida (Dieta e Atividade Física com Perda de 5-10% do Peso) como Pilar Primário",
                            "Anticoncepcionais Orais Combinados com Progestagênios Antiandrogênicos (Ciproterona, Drospirenona) para Controle de Ciclo e Hirsutismo",
                            "Metformina para Resistência Insulínica e Letrozol como Droga de 1ª Linha para Indução da Ovulação em Mulheres com Desejo Gestacional"
                        ]
                    }
                ]
            },
            {
                "foco": "Hiperandrogenismo e Hirsutismo",
                "subfocos": [
                    {
                        "subfoco": "Avaliação Clínica do Hirsutismo e Escore de Ferriman-Gallwey",
                        "sub_subfocos": [
                            "Escore de Ferriman-Gallwey modificado (Pontuação >= 8 indica hirsutismo clinicamente relevante em 9 áreas andrógeno- dependentes)",
                            "Diferenciação Hirsutismo (Pelos terminais em áreas masculinas) vs Hipertricose (Aumento generalizado de lanugem)"
                        ]
                    },
                    {
                        "subfoco": "Terapia Antiandrogênica Farmacológica",
                        "sub_subfocos": [
                            "Bloqueadores dos Receptores Androgênicos: Espironolactona (Necessidade de Anticoncepção Rigorosa pelo Risco de Feminilização de Feto Masculino)",
                            "Inibidores da 5-Alfa-Redutase (Finasterida) e Ciproterona"
                        ]
                    }
                ]
            },
            {
                "foco": "Hiperplasia Adrenal Congênita Forma Não-Clássica",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico da Deficiência Tardia da 21-Hidroxilase",
                        "sub_subfocos": [
                            "Manifestação no Final da Adolescência com Hirsutismo, Acne Severa e Irregularidade Menstrual Mimetizando a SOP",
                            "Dosagem da 17-Hidroxiprogesterona (17-OHP) Basal Pela Manhã na Fase Folicular (> 2 ng/mL suspeito; > 10 ng/mL diagnóstico; teste de estímulo com ACTH se intermediário)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento com Glicocorticoides",
                        "sub_subfocos": [
                            "Supressão do ACTH com Dexametasona ou Prednisona em Baixas Doses Noturnas",
                            "Indicações em Pacientes Sintomáticas ou com Infertilidade"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Climatério, Menopausa e Terapia Hormonal",
        "focos": [
            {
                "foco": "Síndrome Climatérica e Fisiologia da Menopausa",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia e Transição Menopáusica (Critérios STRAW)",
                        "sub_subfocos": [
                            "Depleção Folicular Ovariana Progressiva com Queda da Inibina B, Aumento Precoce de FSH e Flutuações Estrogênicas",
                            "Definição Retrospectiva de Menopausa: 12 Meses Consecutivos de Amenorreia sem Outra Causa Óbvia (Idade Média de 50-51 Anos)"
                        ]
                    },
                    {
                        "subfoco": "Sintomas Vasomotores e Alterações Neuropsíquicas",
                        "sub_subfocos": [
                            "Ondas de Calor (Fogachos), Sudorese Noturna Profusa, Labilidade Emocional, Insônia e Queda da Libido",
                            "Tratamento Não Hormonal para Fogachos: Inibidores Seletivos da Recaptação de Serotonina (Paroxetina, Sertralina) e Venlafaxina"
                        ]
                    }
                ]
            },
            {
                "foco": "Terapia Hormonal da Menopausa (Indicações, Janela de Oportunidade e Contraindicações)",
                "subfocos": [
                    {
                        "subfoco": "Indicações Formais e a \"Janela de Oportunidade\"",
                        "sub_subfocos": [
                            "Conceito da Janela de Oportunidade: Início com Menos de 60 Anos de Idade ou Menos de 10 Anos de Menopausa (Relação Risco-Benefício Favorável)",
                            "Esquema para Mulheres com Útero: Estrogênio associado Obrigatoriamente a Progestagênio para Proteção Endometrial (Prevenção de Câncer de Endométrio); Mulheres Histerectomizadas: Estrogênio Isolado"
                        ]
                    },
                    {
                        "subfoco": "Contraindicações Absolutas da Terapia Hormonal",
                        "sub_subfocos": [
                            "Câncer de Mama Vigente ou Prévio e Lesões Precursoras com Alto Risco",
                            "Neoplasias Malignas Hormonodependentes (Câncer de Endométrio)",
                            "Sangramento Vaginal de Causa Indeterminada, Doença Hepática Aguda Grave e Doença Cardiovascular ou Tromboembólica Ativa (Histórico de TVP/TEP/AVC/IAM)"
                        ]
                    }
                ]
            },
            {
                "foco": "Osteoporose Pós-Menopausa e Risco de Fratura",
                "subfocos": [
                    {
                        "subfoco": "Densitometria Óssea e Critérios da OMS (T-Score)",
                        "sub_subfocos": [
                            "Critérios de T-Score (Coluna Lombar e Fêmur Proximal): Normal (>= -1,0 DP), Osteopenia (entre -1,0 e -2,5 DP), Osteoporose (<= -2,5 DP) e Osteoporose Estabelecida / Grave (<= -2,5 com Fratura por Fragilidade)",
                            "Calculadora FRAX para Risco de Fratura Osteoporótica Maior e de Quadril em 10 Anos"
                        ]
                    },
                    {
                        "subfoco": "Farmacoterapia da Osteoporose (Bisfosfonatos e Anabólicos)",
                        "sub_subfocos": [
                            "Bisfosfonatos Orais (Alendronato Semanal) e Intravenosos (Ácido Zoledrônico Anual): Regras de Tomada em Jejum com Água e Decúbito Evitado por 30-60 min",
                            "Denosumabe (Anticorpo Anti-RANKL), Teriparatida (Análogo do PTH) e Reposição Adequada de Cálcio e Vitamina D"
                        ]
                    }
                ]
            },
            {
                "foco": "Síndrome Geniturinária da Menopausa",
                "subfocos": [
                    {
                        "subfoco": "Atrofia Vulvovaginal e Dispareunia",
                        "sub_subfocos": [
                            "Secura Vaginal, Prurido, Queimação, Perda da Elasticidade, Dispareunia de Introdução e Disúria / Infecções Urinárias de Repetição",
                            "Exame Físico: Mucosa Pálida, Lisa, sem Pregas e Friável"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Tópico Local com Estrogênios",
                        "sub_subfocos": [
                            "Estrogênio Tópico Vaginal em Baixas Doses (Estriol ou Promestrieno): Mínima Absorção Sistêmica, Seguro e Altamente Eficaz (Dispensa Uso Concomitante de Progesterona)",
                            "Hidratantes e Lubrificantes Vaginais sem Hormônio"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Planejamento Familiar e Métodos Contraceptivos",
        "focos": [
            {
                "foco": "Contraceptivos Orais Combinados e Injetáveis",
                "subfocos": [
                    {
                        "subfoco": "Mecanismo de Ação e Efeitos dos Hormônios Combinados",
                        "sub_subfocos": [
                            "Eixo Principal: Anovulação por Supressão Central de GnRH, LH e FSH",
                            "Efeitos Secundários: Espessamento do Moco Cervical (Impede Progressão Espermática) e Atrofia Endometrial",
                            "Benefícios Não Contraceptivos: Redução do Risco de Câncer de Ovário e Endométrio, Controle da Dismenorreia e Melhora da Acne"
                        ]
                    },
                    {
                        "subfoco": "Injetável Mensal e Regras de Tomada / Esquecimento",
                        "sub_subfocos": [
                            "Injetável Mensal Combinado (Enantato de Noretisterona + Valerato de Estradiol): Aplicação a Cada 30 Dias",
                            "Conduta no Esquecimento de Pílulas Combinadas (Tomar a Esquecida Imediatamente e Usar Preservativo por 7 Dias se Mais de 2 Pílulas Perdidas)"
                        ]
                    }
                ]
            },
            {
                "foco": "Métodos Contraceptivos Progestagênicos Exclusivos",
                "subfocos": [
                    {
                        "subfoco": "Minipílula e Pílula de Desogestrel",
                        "sub_subfocos": [
                            "Minipílula Tradicional (Noretisterona 0,35 mg): Ação Predominante no Moco Cervical, Rigidez de Horário (Atraso Máximo de 3 Horas), Escolha na Amamentação Exclusiva",
                            "Desogestrel 75 mcg: Anovulatório Efetivo com Janela de Tolerância de 12 Horas"
                        ]
                    },
                    {
                        "subfoco": "Acetato de Medroxiprogesterona de Depósito (AMPD Trimestral)",
                        "sub_subfocos": [
                            "Injetável Trimestral (150 mg IM a Cada 12 Semanas): Alta Eficácia com Taxas Elevadas de Amenorreia",
                            "Efeitos Adversos Comuns: Sangramento Irregular / Spotting Inicial, Ganho Ponderal, Retardo no Retorno da Fertilidade e Perda Transitória de DMO"
                        ]
                    }
                ]
            },
            {
                "foco": "Dispositivos Intrauterinos (DIU de Cobre e SIU de Levonorgestrel)",
                "subfocos": [
                    {
                        "subfoco": "Comparação Clínica: DIU T-Cobre vs SIU-LNG",
                        "sub_subfocos": [
                            "DIU de Cobre / Prata: Método não Hormonal, Reação Inflamatória Asséptica Espermistática, Duração de até 10 Anos, Pode Aumentar o Fluxo Menstrual e Cólicas",
                            "SIU Liberador de Levonorgestrel (Mirena / Kyleena): Atrofia Endometrial Intensa, Redução Marcada do Fluxo Menstrual (Alta Taxa de Amenorreia), Benefício Terapêutico em SUA e Endometriose, Duração de 5 a 8 Anos"
                        ]
                    },
                    {
                        "subfoco": "Inserção, Contraindicações e Manejo de Complicações",
                        "sub_subfocos": [
                            "Contraindicações Absolutas: Gravidez, Malformações Anatômicas que Distorcem a Cavidade, Infecção Pélvica Vigente (DIP nos Últimos 3 Meses), Câncer Cervical/Endometrial",
                            "Fio de DIU Não Visível: Ultrassonografia Transvaginal para Localização (Descartar Perfuração Uterina ou Expulsão não Percebida) e Remoção Histeroscópica se Intrauterino"
                        ]
                    }
                ]
            },
            {
                "foco": "Implante Subdérmico de Etonogestrel",
                "subfocos": [
                    {
                        "subfoco": "Mecanismo de Ação, Inserção e Critérios de Elegibilidade (MEC da OMS)",
                        "sub_subfocos": [
                            "Mecanismo de Ação Primário (Inibição do Pico de LH e Espessamento do Moco Cervical) e Eficácia Clínica",
                            "Técnica de Inserção Subdérmica Segura na Face Medial do Braço e Contraindicações Formais"
                        ]
                    },
                    {
                        "subfoco": "Eventos Adversos e Manejo do Padrão de Sangramento Irregular",
                        "sub_subfocos": [
                            "Padrão de Sangramento Imprevisível (Spotting e Amenorreia) e Aconselhamento Pré-Inserção",
                            "Manejo Farmacológico do Sangramento Persistente (AINEs, Ácido Tranexâmico e Ciclos Curtos de Estrogênio)"
                        ]
                    }
                ]
            },
            {
                "foco": "Critérios Médicos de Elegibilidade da OMS",
                "subfocos": [
                    {
                        "subfoco": "Categorias 1 a 4 da OMS e Interpretação",
                        "sub_subfocos": [
                            "Categoria 1: Condição para a qual Não Há Restrição ao Uso do Método Contraceptivo",
                            "Categoria 2: Condição em que as Vantagens do Uso Geralmente Superam os Riscos Comprovados",
                            "Categoria 3: Condição em que os Riscos Teóricos ou Comprovados Geralmente Superam as Vantagens (Método Não Recomendado exceto na Ausência de Alternativas)",
                            "Categoria 4: Condição que Representa Risco de Saúde Inaceitável se o Método For Usado (Contraindicação Absoluta)"
                        ]
                    },
                    {
                        "subfoco": "Situações Clínicas Críticas de Categoria 4 para Métodos Combinados",
                        "sub_subfocos": [
                            "Tabagismo com Idade >= 35 Anos e Fumo >= 15 Cigarros/dia = Categoria 4 para Métodos com Estrogênio (Risco de IAM/AVC)",
                            "Enxaqueca com Aura em Qualquer Idade = Categoria 4 para Combinados pelo Risco Tromboembólico Cerebral Severo",
                            "Hipertensão Arterial Sistêmica Grave (PAS >= 160 ou PAD >= 100 mmHg) e Histórico Prévio ou Agudo de TVP/TEP = Categoria 4 para Combinados",
                            "Câncer de Mama Atual = Categoria 4 para TODOS os Métodos Hormonais (Única Opção Reversível Eficaz: DIU de Cobre)"
                        ]
                    }
                ]
            },
            {
                "foco": "Contracepção de Emergência",
                "subfocos": [
                    {
                        "subfoco": "Levonorgestrel Oral e Acetato de Ulipristal",
                        "sub_subfocos": [
                            "Esquema com Levonorgestrel 1,5 mg Dose Única em até 72h e Mecanismo Anovulatório",
                            "Impacto do IMC/Obesidade na Eficácia e Acetato de Ulipristal (até 120h)"
                        ]
                    },
                    {
                        "subfoco": "DIU de Cobre como Contracepção de Emergência Pós-Coito",
                        "sub_subfocos": [
                            "Inserção do DIU de Cobre em até 5 Dias (120h) Pós-Coito Desprotegido (Método Mais Eficaz)",
                            "Uso Concomitante como Contracepção de Longa Duração e Critérios de Elegibilidade"
                        ]
                    }
                ]
            },
            {
                "foco": "Contracepção Cirúrgica Definitiva (Laqueadura Tubária)",
                "subfocos": [
                    {
                        "subfoco": "Legislação Brasileira e Critérios de Elegibilidade (Lei 14.443/2022)",
                        "sub_subfocos": [
                            "Critérios Legais Vigentes (Idade Mínima 21 Anos OU Pelo Menos 2 Filhos Vivos) e Dispensa do Consentimento do Cônjuge",
                            "Prazo Mínimo de 60 Dias entre Manifestação da Vontade e Procedimento e Permissão no Parto/Cesárea"
                        ]
                    },
                    {
                        "subfoco": "Técnicas Cirúrgicas e Salpingectomia Oportunística",
                        "sub_subfocos": [
                            "Técnica de Pomeroy, Parkland e Uso de Clipes/Anéis por Videolaparoscopia",
                            "Salpingectomia Bilateral Total como Prevenção de Câncer Epitelial de Ovário"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
        "focos": [
            {
                "foco": "Vaginose Bacteriana",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Clínico e Critérios de Amsel",
                        "sub_subfocos": [
                            "Critérios de Amsel (Pelo Menos 3 de 4): 1. Corrimento Branco-Acinzentado Homogêneo e Fluido; 2. pH Vaginal > 4,5; 3. Teste das Aminas / Whiff Test Positivo (Liberação de Odor Fétido de Peixe Podre com KOH a 10%); 4. Presença de \"Clue Cells\" / Células-Guia na Microscopia a Fresco (>= 20% das Células Epiteliais)",
                            "Desbalanço da Microbiota Vaginal: Queda de *Lactobacillus* e Proliferação de Anaeróbios (*Gardnerella vaginalis*, *Atopobium vaginae*, *Mobiluncus*)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento com Metronidazol e Manejo na Gestação",
                        "sub_subfocos": [
                            "Metronidazol Oral (500 mg 12/12h por 7 Dias) ou Gel Vaginal por 5 Noites; Alternativa com Clindamicina",
                            "Tratamento do Parceiro Sexual NÃO Recomendado de Rotina (Não é Considerada IST Clássica)",
                            "Tratamento Obrigatório em Gestantes pelo Risco de Prematuridade e RPMO"
                        ]
                    }
                ]
            },
            {
                "foco": "Candidíase Vulvovaginal",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico e Exame a Fresco",
                        "sub_subfocos": [
                            "Sintoma Cardeal: Prurido Vulvar Intenso, Ardor Miccional, Dispareunia Externa e Edema / Hiperemia Vulvovaginal com Fissuras",
                            "Aspecto Típico do Corrimento: Branco, Grumoso, em Placas Aderidas em \"Nata de Leite\" ou \"Queijo Coalho\" e sem Odor",
                            "Microscopia com KOH a 10%: Visualização de Hifas, Pseudo-Hifas e Esporos de *Candida albicans* com pH Vaginal Normal (< 4,5)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Farmacológico e Candidíase Recorrente",
                        "sub_subfocos": [
                            "Tratamento de Episódio Agudo: Fluconazol Oral (150 mg Dose Única) ou Imidazólicos Tópicos (Miconazol, Clotrimazol por 7 Noites)",
                            "Uso Exclusivo de Medicamentos Tópicos na Gestação (Fluconazol Oral é Contraindicado na Gravidez)",
                            "Candidíase Recorrente (>= 4 Episódios ao Ano): Terapia de Ataque seguida de Manutenção Semanal com Fluconazol por 6 Meses"
                        ]
                    }
                ]
            },
            {
                "foco": "Tricomoníase Vaginal",
                "subfocos": [
                    {
                        "subfoco": "Manifestações Clínicas e Exame a Fresco",
                        "sub_subfocos": [
                            "Infecção Sexualmente Transmissível Causada pelo Protozoário Flagelado *Trichomonas vaginalis*",
                            "Corrimento Típico: Amarelo-Esverdeado, Bolhoso, Fluido, Abundante e com Odor Desagradável associado a Prurido e Queimação",
                            "Colpite Focal / Difusa: Colo Uterino com Aspecto em \"Framboesa\" ou \"Morango",
                            "Exame a Fresco Imediato com Soro Fisiológico: Protozoários Móveis com Flagelos Ondulantes e Aumento Marcado de Leucócitos com pH > 5,0"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Mandatório do Casal",
                        "sub_subfocos": [
                            "Tratamento Obrigatório e Simultâneo do Parceiro Sexual Mesmo que Assintomático",
                            "Metronidazol Oral (2 g em Dose Única ou 500 mg 12/12h por 7 Dias) ou Secnidazol 2 g Dose Única (Evitar Consumo de Álcool pelo Efeito Dissulfiram / Antabuse)"
                        ]
                    }
                ]
            },
            {
                "foco": "Cervicites (Clamídia e Gonococo)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Clínico e Propedêutica Laboratorial (NAAT/PCR)",
                        "sub_subfocos": [
                            "Quadro Clínico (Colo Friável, Sangramento Pós-Coito, Exudato Mucopurulento endocervical)",
                            "Diagnóstico Microbiológico por Biologia Molecular (NAAT) e Gram endocervical"
                        ]
                    },
                    {
                        "subfoco": "Esquemas Terapêuticos e Tratamento de Parceiros",
                        "sub_subfocos": [
                            "Tratamento Farmacológico Concomitante (Ceftriaxona 500mg IM + Doxiciclina 100mg VO 7 dias)",
                            "Convocação e Notificação de Parceiros Sexuais e Rastreamento de Outras ISTs"
                        ]
                    }
                ]
            },
            {
                "foco": "Doença Inflamatória Pélvica (DIP: Critérios Diagnósticos, Estágios e Tratamento)",
                "subfocos": [
                    {
                        "subfoco": "Critérios Diagnósticos (Maiores, Menores e Elaborados) e Estadiamento de Monif",
                        "sub_subfocos": [
                            "Critérios Maiores (Dor Pélvica, Dor à Mobilização do Colo e Dor Anexial) e Menores (Febre, Leucocitose, PCR)",
                            "Estadiamento de Monif (Estágio I: Endometrite/Salpingite; Estágio II: Peritonite; Estágio III: Abscesso Tubo-Ovariano Íntegro; Estágio IV: Abscesso Roto)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Ambulatorial vs Hospitalar e Complicações Crônicas",
                        "sub_subfocos": [
                            "Esquemas Antimicrobianos (Ambulatorial: Ceftriaxona + Doxiciclina + Metronidazol; Hospitalar: Ceftriaxona + Doxiciclina + Metronidazol EV)",
                            "Complicações: Abscesso Tubo-Ovariano, Síndrome de Fitz-Hugh-Curtis, Infertilidade e Gravidez Ectópica"
                        ]
                    }
                ]
            },
            {
                "foco": "Úlceras Genitais (Sífilis Primária, Cancro Mole, Herpes Genital, Linfogranuloma, Donovanose)",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico Diferencial Clínico das Úlceras Genitais",
                        "sub_subfocos": [
                            "Sífilis Primária (Cancro Duro: Única, Indolor, Base Limpa) vs Cancro Mole (Múltiplas, Muito Dolorosas, Base Suja)",
                            "Herpes Genital (Vesículas Agrupadas em Base Eritematosa) vs Linfogranuloma Venéreo e Donovanose"
                        ]
                    },
                    {
                        "subfoco": "Manejo Propedêutico e Abordagem Sindrômica do Ministério da Saúde",
                        "sub_subfocos": [
                            "Diagnóstico Laboratorial: Campo Escuro, VDRL, Testes Rápidos e Citologia de Tzanck",
                            "Conduta Terapêutica Específica e Abordagem Sindrômica de Úlceras com Penicilina Benzatina e Azitromicina"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Endometriose e Dor Pélvica Crônica",
        "focos": [
            {
                "foco": "Endometriose Pélvica e Ovariana (Endometrioma)",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico e os \"6 Ds\" da Endometriose",
                        "sub_subfocos": [
                            "Presença de Glândulas e Estroma Endometrial Ectópicos Fora da Cavidade Uterina",
                            "Os 6 Ds: Dismenorreia Progressiva Severa, Dor Pélvica Crônica Não Cíclica, Dispareunia de Profundidade, Disquezia / Dor à Evacuação, Disúria Cíclica e Dificuldade para Engravidar (Infertilidade)",
                            "Endometrioma Ovariano: Cisto em \"Vidro Fosco\" à Ultrassonografia e \"Chocolatado\" na Cirurgia"
                        ]
                    },
                    {
                        "subfoco": "Mapeamento por Imagem e Terapêutica Escalonada",
                        "sub_subfocos": [
                            "Exames de Escolha para Endometriose Profunda: USG Transvaginal com Preparo Intestinal e Ressonância Magnética da Pelve",
                            "Tratamento Clínico de 1ª Linha: Progestágenos Orais Isolados (Dienogeste), SIU-LNG, Contraceptivos Combinados Contínuos ou Análogos do GnRH",
                            "Cirurgia Videolaparoscópica Conservadora (Excisão dos Focos e Cistectomia do Endometrioma) Reservada para Falha Clínica Refratária ou Desejo Imediato de Fertilidade com Obstrução Tuboperitoneal"
                        ]
                    }
                ]
            },
            {
                "foco": "Adenomiose Uterina",
                "subfocos": [
                    {
                        "subfoco": "Fisiopatologia e Diagnóstico por Imagem da Adenomiose",
                        "sub_subfocos": [
                            "Invasão de Glândulas e Estroma Endometrial no Interior do Miométrio Uterino",
                            "Quadro Típico: Mulher Multípara com Sangramento Uterino Anormal (Menorragia), Dismenorreia Secundária Intensa e Útero Aumentado Globoso e Doloroso ao Toque"
                        ]
                    },
                    {
                        "subfoco": "Manejo Clínico vs Histerectomia",
                        "sub_subfocos": [
                            "Tratamento Farmacológico com SIU de Levonorgestrel ou Dienogeste para Controle de Sintomas",
                            "Histerectomia como Tratamento Curativo Definitivo para Pacientes com Prole Constituída e Sintomas Refratários"
                        ]
                    }
                ]
            },
            {
                "foco": "Dor Pélvica Crônica e Dismenorreia",
                "subfocos": [
                    {
                        "subfoco": "Dismenorreia Primária vs Secundária",
                        "sub_subfocos": [
                            "Fisiopatologia da Dismenorreia Primária Mediada por Prostaglandinas (PGF2a) e Resposta a AINEs/ACO",
                            "Dismenorreia Secundária: Investigação de Endometriose, Adenomiose e Malformações Obstrutivas"
                        ]
                    },
                    {
                        "subfoco": "Investigação e Manejo da Dor Pélvica Crônica Não-Cíclica",
                        "sub_subfocos": [
                            "Diagnóstico Diferencial: Síndrome da Congestão Pélvica, Cistite Intersticial e Causas Miofasciais",
                            "Abordagem Terapêutica Multidisciplinar, Bloqueio Hormonal e Neuromoduladores"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Afecções Benignas do Trato Genital Feminino",
        "focos": [
            {
                "foco": "Leiomiomatose Uterina (Miomas: Sintomas, Classificação FIGO e Conduta)",
                "subfocos": [
                    {
                        "subfoco": "Classificação Anatômica FIGO e Sintomatologia",
                        "sub_subfocos": [
                            "Tumor Ginecológico Benigno Mais Frequente, Dependente de Estrogênio e Progesterona",
                            "Classificação FIGO: Submucosos (Graus 0, 1 e 2: Principal Causa de Sangramento Uterino Intenso e Infertilidade), Intramurais (Graus 3, 4 e 5: Aumento do Volume Uterino, Cólica e Sangramento) e Subserosos (Graus 6 e 7: Sintomas Compressivos de Bexiga e Reto sem SUA Típico)"
                        ]
                    },
                    {
                        "subfoco": "Abordagem Cirúrgica Conservadora vs Definitiva",
                        "sub_subfocos": [
                            "Miomectomia Histeroscópica de Escolha para Miomas Submucosos FIGO 0 e 1 < 4-5 cm em Mulheres com Desejo de Preservação Reprodutiva",
                            "Miomectomia Laparoscópica ou Laparotômica para Miomas Intramurais e Subserosos com Desejo de Gestação"
                        ]
                    }
                ]
            },
            {
                "foco": "Pólipos Endometriais e Cervicais",
                "subfocos": [
                    {
                        "subfoco": "Quadro Clínico, Propedêutica por Imagem e Histeroscopia",
                        "sub_subfocos": [
                            "Histerectomia e Embolização das Artérias Uterinas (EAU) em Mulheres com Prole Constituída",
                            "Apresentação com Sangramento Intermenstrual ou Pós-Menopausa e Diagnóstico por USG Transvaginal / Histerossonografia"
                        ]
                    },
                    {
                        "subfoco": "Indicações Cirúrgicas e Polipectomia Histeroscópica",
                        "sub_subfocos": [
                            "Critérios de Ressecção: Pós-Menopausa, Sintomáticos, Pólipos > 1,5 cm ou Uso de Tamoxifeno",
                            "Polipectomia Histeroscópica com Alça Diatermica e Análise Anatomopatológica"
                        ]
                    }
                ]
            },
            {
                "foco": "Cistos e Tumores Ovarianos Benignos (Teratoma Cístico, Cistoadenoma)",
                "subfocos": [
                    {
                        "subfoco": "Classificação e Diagnóstico Diferencial de Massas Anexiais Benignas",
                        "sub_subfocos": [
                            "Cistos Funcionais (Foliculares e de Corpo Lúteo) e Conduta Expectante com Reavaliação em 60 Dias",
                            "Teratoma Cístico Maduro / Cisto Dermoide (Achados Ultrassonográficos Típicos e Risco de Torção)"
                        ]
                    },
                    {
                        "subfoco": "Cistoadenomas (Seroso e Mucinoso) e Indicações Cirúrgicas",
                        "sub_subfocos": [
                            "Cistoadenoma Seroso e Mucinoso: Características Macroscópicas e Risco de Pseudomixoma Peritoneal",
                            "Indicação de Cistectomia Ovariana Laparoscópica vs Ooforectomia Preservando Fertilidade"
                        ]
                    }
                ]
            },
            {
                "foco": "Vulvovaginites Atróficas e Doenças Benignas da Vulva (Líquen Escleroso)",
                "subfocos": [
                    {
                        "subfoco": "Síndrome Geniturinária da Menopausa / Vaginite Atrófica",
                        "sub_subfocos": [
                            "Hipoestrogenismo, Ressecamento Vaginal, Dispareunia de Intróito e Queda de Lactobacillus",
                            "Tratamento Local com Estrogênio Tópico (Estriol/Promestrieno) e Hidratantes Não-Hormonais"
                        ]
                    },
                    {
                        "subfoco": "Líquen Escleroso Vulvar e Lesões Dermatológicas Vulvares",
                        "sub_subfocos": [
                            "Quadro Clínico de Prurido Vulvar Intenso, Placas Esbranquiçadas (Em Forma de 8) e Perda da Arquitetura",
                            "Biópsia Diagnóstica Obrigatória para Exclusão de Neoplasia e Corticoterapia Tópica Ultrapotente (Clobetasol)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Cânceres Ginecológicos e Lesões Precursoras",
        "focos": [
            {
                "foco": "Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)",
                "subfocos": [
                    {
                        "subfoco": "Diretrizes Nacionais do Ministério da Saúde para o Rastreamento",
                        "sub_subfocos": [
                            "Faixa Etária Prioritária (25 a 64 Anos) e Periodicidade Trienal após Dois Exames Anuais Consecutivos Negativos",
                            "Rastreamento em Populações Especiais (Gestantes, Imunossuprimidas com HIV e Pós-Menopausa)"
                        ]
                    },
                    {
                        "subfoco": "Técnica de Coleta Citopatológica (Papanicolau)",
                        "sub_subfocos": [
                            "Coleta Ectocervical com Espátula de Ayre e Endocervical com Escova de Zona de Transformação",
                            "Critérios de Adequabilidade da Amostra Citológica e Representatividade da Junção Escamocolunar (JEC)"
                        ]
                    }
                ]
            },
            {
                "foco": "Neoplasias Intraepiteliais Cervicais (NIC) e Lesões Precursoras",
                "subfocos": [
                    {
                        "subfoco": "Conduta nas Alterações Citológicas do Colo Uterino (Diretrizes MS)",
                        "sub_subfocos": [
                            "Conduta no ASC-US e LIEBG (Repetição Citológica em 6 Meses se >= 30 Anos ou 12 Meses se < 30 Anos)",
                            "Conduta no ASC-H, LIEAG e AGC (Encaminhamento Direto e Obrigatório para Colposcopia)"
                        ]
                    },
                    {
                        "subfoco": "Colposcopia e Métodos Excisionais (CAF vs Cone a Frio)",
                        "sub_subfocos": [
                            "Achados Colposcópicos Maiores (Epitélio Acetobranco Denso, Mosaico e Pontilhado Grosseiros)",
                            "Excisão da Zona de Transformação (EZT / CAF Tipos 1 e 2) vs Conização a Frio / Cirúrgica (Tipo 3)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Colo Uterino Invasor (Estadiamento e Conduta)",
                "subfocos": [
                    {
                        "subfoco": "Estadiamento Clínico FIGO 2018 do Câncer de Colo Uterino",
                        "sub_subfocos": [
                            "Estadiamento Clínico FIGO 2018 (Estádios Iniciais Restritos ao Colo vs Invasão Parametrial e Vagina)",
                            "Critérios de Inoperabilidade e Tratamento Sistêmico (Acometimento Parametrial Estádio IIB em Diante com Quimiorradioterapia Definitiva)"
                        ]
                    },
                    {
                        "subfoco": "Conduta Terapêutica por Estádio e Preservação de Fertilidade",
                        "sub_subfocos": [
                            "Traquelectomia Radical com Linfadenectomia Pélvica para Preservação de Fertilidade em Mulheres Jovens (IA2 e IB1)",
                            "Cirurgia de Wertheim-Meigs (Histerectomia Radical com Linfadenectomia Pélvica Bilateral) nos Estádios Operáveis"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Endométrio e Hiperplasia Endometrial",
                "subfocos": [
                    {
                        "subfoco": "Hiperplasia Endometrial (Sem Atipia vs Atípica / EIN)",
                        "sub_subfocos": [
                            "Hiperplasia sem Atipia (Manejo com Progestagênios Orais ou SIU-LNG) vs Atípica / EIN (Histerectomia Total)",
                            "Quadro Clínico Típico: Sangramento Uterino Pós-Menopausa e Avaliação da Espessura Endometrial à USG (> 4-5 mm)"
                        ]
                    },
                    {
                        "subfoco": "Câncer de Endométrio: Diagnóstico, Tipos Histológicos e Estadiamento",
                        "sub_subfocos": [
                            "Tipo I (Endometrioide, Dependente de Estrogênio, Bom Prognóstico) vs Tipo II (Seroso e Células Claras, Agressivo)",
                            "Estadiamento Cirúrgico do Câncer de Endométrio (Laparotomia / Laparoscopia com Linfadenectomia e Omentectomia)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Ovário e Tumores Anexiais Suspeitos",
                "subfocos": [
                    {
                        "subfoco": "Critérios Ultrassonográficos de Suspeita (IOTA) e Marcadores Tumorais (CA-125, HE4, ROMA)",
                        "sub_subfocos": [
                            "Regras Simples do IOTA para Diferenciação USG: Características B (Benignas) vs M (Malignas / Papilas, Ascite, Fluxo Doppler Alto)",
                            "Marcadores Tumorais Séricos (CA-125 para Epitelial, HE4, Alfa-fetoproteína e hCG para Germinativos) e Escore ROMA"
                        ]
                    },
                    {
                        "subfoco": "Tipos Histológicos e Cirurgia Citorredutora Estadiadora",
                        "sub_subfocos": [
                            "Carcinoma Seroso de Alto Grau (Mais Comum, Origem na Fímbria Tubária e Forte Associação com Mutações BRCA1/2)",
                            "Laparotomia Estadiadora Completa e Citorredução Cirúrgica Ótima com Resíduo Tumoral Zero (R0)"
                        ]
                    }
                ]
            },
            {
                "foco": "Neoplasias Malignas da Vulva e Vagina",
                "subfocos": [
                    {
                        "subfoco": "Neoplasia Intraepitelial Vulvar (NIV) e Carcinoma de Células Escamosas da Vulva",
                        "sub_subfocos": [
                            "NIV Usual (HPV-Induzida) vs NIV Diferenciada (Associada ao Líquen Escleroso)",
                            "Quadro Clínico do CEC de Vulva (Úlcera ou Nódulo Endurecido em Grandes Lábios com Prurido Crônico)"
                        ]
                    },
                    {
                        "subfoco": "Estadiamento e Tratamento Cirúrgico da Doença Vulvar",
                        "sub_subfocos": [
                            "Vulvectomia Radical com Margens Livres (> 1 cm) e Pesquisa de Linfonodo Sentinela vs Linfadenectomia Inguinofemoral",
                            "Papel da Radioterapia Adjuvante em Linfonodos Positivos e Manejo das Neoplasias Vaginais"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Doenças da Mama e Rastreamento",
        "focos": [
            {
                "foco": "Rastreamento do Câncer de Mama e Classificação BI-RADS",
                "subfocos": [
                    {
                        "subfoco": "Diretrizes de Rastreamento Mamográfico",
                        "sub_subfocos": [
                            "Ministério da Saúde / INCA: Mamografia Bianual para Mulheres de 50 a 69 Anos",
                            "Sociedade Brasileira de Mastologia / Febrasgo / CBR: Mamografia Anual a Partir dos 40 Anos",
                            "Rastreamento em Mulheres de Alto Risco (Mutação BRCA1/2 ou Parente de 1º Grau com Câncer Antes dos 50 Anos): Mamografia associada a Ressonância Magnética das Mamas Anual Iniciada 10 Anos Antes do Caso Mais Jovem"
                        ]
                    },
                    {
                        "subfoco": "Classificação BI-RADS e Condutas Radiológicas",
                        "sub_subfocos": [
                            "BI-RADS 0 (Incompleto): Avaliação Adicional Obrigatória com Ultrassonografia ou Manobras Mamográficas (Compressão / Ampliação)",
                            "BI-RADS 1 (Negativo) e BI-RADS 2 (Achados Benignos como Fibroadenoma Calcificado, Cistos Simples): Rastreamento de Rotina",
                            "BI-RADS 3 (Provavelmente Benigno como Nódulo Oval Circunscrito): Controle Radiológico Semestral por 2 a 3 Anos",
                            "BI-RADS 4 (Suspeito) e BI-RADS 5 (Altamente Suspeito): Indicação Mandatória de Biópsia Histopatológica por Agulha Grossa (Core Biopsy ou Mamotomia)",
                            "BI-RADS 6 (Malignidade Já Confirmada por Biópsia Prévia)"
                        ]
                    }
                ]
            },
            {
                "foco": "Câncer de Mama (Diagnóstico, Subtipos Moleculares e Estadiamento)",
                "subfocos": [
                    {
                        "subfoco": "Investigação Diagnóstica, Core Biopsy e Mamotomia",
                        "sub_subfocos": [
                            "Biópsia por Agulha Grossa (Core Biopsy) e Biópsia Vácuo-Assistida guiadas por USG ou Estereotaxia",
                            "Carcinoma Ductal Invasivo / Sem Outra Especificação (SOE) vs Carcinoma Lobular Invasivo"
                        ]
                    },
                    {
                        "subfoco": "Subtipos Moleculares Imuno-histoquímicos e Princípios Terapêuticos",
                        "sub_subfocos": [
                            "Classificação Molecular: Luminal A, Luminal B (HER2- ou HER2+), HER2-Enriquecido e Triplo-Negativo",
                            "Indicações de Cirurgia Conservadora (Setorectomia) + Linfonodo Sentinela vs Mastectomia e Terapia Sistêmica Adjuvante/Neoadjuvante"
                        ]
                    }
                ]
            },
            {
                "foco": "Doenças Benignas da Mama (Fibroadenoma e Cistos Mamários)",
                "subfocos": [
                    {
                        "subfoco": "Fibroadenoma Mamário: Diagnóstico e Manejo",
                        "sub_subfocos": [
                            "Nódulo Firme, Móvel, Indolor em Mulheres Jovens e Características Ultrassonográficas Benignas (BI-RADS 3)",
                            "Conduta Conservadora vs Indicações de Exérese (Crescimento Rápido > 2-3 cm ou Tumor Filodes)"
                        ]
                    },
                    {
                        "subfoco": "Cistos Mamários e Alterações Funcionais Benignas da Mama",
                        "sub_subfocos": [
                            "Cisto Simples (Anecóico, Reforço Posterior, Margens Regulares, BI-RADS 2) e Punção Aspirativa (PAAF) se Sintomático",
                            "Cistos Complicados e Complexos (Componente Sólido Intracístico, BI-RADS 4 e Necessidade de Biópsia)"
                        ]
                    }
                ]
            },
            {
                "foco": "Mastalgia e Descarga Papilar",
                "subfocos": [
                    {
                        "subfoco": "Mastalgia Cíclica vs Não-Cíclica",
                        "sub_subfocos": [
                            "Mastalgia Cíclica (Lútea, Bilateral, Fisiológica) e Aconselhamento Inicial com Medidas de Suporte",
                            "Mastalgia Não-Cíclica: Investigação de Causas Osteomusculares (Síndrome de Tietze) e Afecções Locais"
                        ]
                    },
                    {
                        "subfoco": "Descarga Papilar: Características de Suspeita e Conduta",
                        "sub_subfocos": [
                            "Fluxo Papilar Suspeito (Uniductal, Unilateral, Espontâneo, Sanguinolento ou 'Água de Rocha')",
                            "Papiloma Intraductal (Causa Mais Comum de Descarga Sanguinolenta) e Ressecção do Ducto Principal"
                        ]
                    }
                ]
            },
            {
                "foco": "Mastites e Abscessos Mamários Não-Puerperais",
                "subfocos": [
                    {
                        "subfoco": "Mastite Periductal e Ectasia Ductal",
                        "sub_subfocos": [
                            "Fisiopatologia da Mastite Periductal Associada ao Tabagismo e Inversão Papilar",
                            "Quadro Clínico Recidivante, Formação de Fístulas Periareolares e Antibioticoterapia contra Anaeróbios"
                        ]
                    },
                    {
                        "subfoco": "Abscessos Mamários Subareolares e Mastite Granulomatosa",
                        "sub_subfocos": [
                            "Drenagem Cirúrgica de Abscessos com Incisão Circunferencial e Excisão do Ducto Doente",
                            "Mastite Granulomatosa Idiopática: Diagnóstico Diferencial com Carcinoma Inflamatório e Corticoterapia"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Uroginecologia e Prolapsos Genitais",
        "focos": [
            {
                "foco": "Incontinência Urinária de Esforço (IUE)",
                "subfocos": [
                    {
                        "subfoco": "Mecanismo Fisiopatológico e Avaliação Urodinâmica",
                        "sub_subfocos": [
                            "Perda Involuntária de Urina Sincronizada aos Esforços Físicos (Tosse, Riso, Exercício)",
                            "Diferenciação Urodinâmica: Hipermobilidade do Colo Vesical (Pressão de Perda ao Esforço / PPE > 90 cmH2O) vs Deficiência Esfincteriana Intrínseca (PPE < 60 cmH2O)"
                        ]
                    },
                    {
                        "subfoco": "Tratamento Cirúrgico Padrão-Ouro (Slings de Uretra Média)",
                        "sub_subfocos": [
                            "Cirurgia de Sling Sintético de Uretra Média com Tela de Polipropileno Livre de Tensão",
                            "Sling Retropúbico (TVT - Tension-free Vaginal Tape: Padrão para Deficiência Esfincteriana Intrínseca)",
                            "Sling Transobturatório (TOT: Menor Risco de Perfuração Vesical, Ideal para Hipermobilidade do Colo)"
                        ]
                    }
                ]
            },
            {
                "foco": "Bexiga Hiperativa e Incontinência de Urgência",
                "subfocos": [
                    {
                        "subfoco": "Diagnóstico da Síndrome da Bexiga Hiperativa",
                        "sub_subfocos": [
                            "Quadro Clínico: Urgência Miccional Súbita e Incontrolável com ou sem Incontinência, Frequentemente Acompanhada de Noctúria e Polaciúria",
                            "Estudo Urodinâmico: Demonstração de Contrações Não Inibidas do Músculo Detrusor durante a Fase de Enchimento (Hiperatividade do Detrusor)"
                        ]
                    },
                    {
                        "subfoco": "Manejo Clínico Comportamental e Farmacológico",
                        "sub_subfocos": [
                            "Tratamento Inicial de 1ª Linha: Terapia Comportamental, Treinamento Vesical e Fisioterapia do Assoalho Pélvico",
                            "Farmacoterapia: Antimuscarínicos / Anticolinérgicos (Oxibutinina - Cuidado com Efeitos Secos e Idosos) e Agonistas Beta- 3 Adrenérgicos (Mirabegrona)",
                            "Toxina Botulínica Intravesical em Casos Refratários"
                        ]
                    }
                ]
            },
            {
                "foco": "Prolapso de Órgãos Pélvicos (Classificação POP-Q)",
                "subfocos": [
                    {
                        "subfoco": "Estadiamento Anatômico pelo Sistema POP-Q",
                        "sub_subfocos": [
                            "Pontos de Referência em Relação ao Hímen (Valor 0): Parede Anterior (Aa, Ba), Ápice (C para Colo/Cúpula, D para Fundo de Saco Posterior) e Parede Posterior (Ap, Bp)",
                            "Estágios do POP-Q: Estágio I (Ponto Mais Prolabado > 1 cm Acima do Hímen), Estágio II (Entre 1 cm Acima e 1 cm Abaixo do Hímen), Estágio III (> 1 cm Abaixo do Hímen até Comprimento Total - 2 cm), Estágio IV (Eversão Completa / Procidência Total do Útero)"
                        ]
                    },
                    {
                        "subfoco": "Correção Cirúrgica e Uso de Pessários Vaginais",
                        "sub_subfocos": [
                            "Pessários Vaginais como Excelente Opção Não Cirúrgica para Pacientes Frágeis ou com Risco Cirúrgico Elevado",
                            "Colpoperineoplastia Anterior (Correção de Cistocele), Posterior (Retocele) e Fixação do Ápice ao Ligamento Sacroespinhoso / Sacrocolpopexia Laparoscópica"
                        ]
                    }
                ]
            },
            {
                "foco": "Fístulas Urogenitais",
                "subfocos": [
                    {
                        "subfoco": "Etiologia, Fisiopatologia e Quadro Clínico das Fístulas",
                        "sub_subfocos": [
                            "Fístula Vesicovaginal: Complicação de Cirurgia Ginecológica Pélvica (Histerectomia) ou Parto Obstruído",
                            "Quadro de Perda Contínua de Urina pela Vagina sem Desejo Miccional e Diagnóstico com Teste do Azul de Metileno"
                        ]
                    },
                    {
                        "subfoco": "Diagnóstico por Imagem e Correção Cirúrgica",
                        "sub_subfocos": [
                            "Cistoscopia para Localização da Fístula e Relação com os Meatos Ureterais",
                            "Princípios da Correção Cirúrgica (Via Vaginal ou Abdominal, Dissecção Ampla, Fechamento sem Tensão e Sonda de Demora)"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Infertilidade Conjugal e Reprodução Assistida",
        "focos": [
            {
                "foco": "Investigação Básica do Casal Infértil",
                "subfocos": [
                    {
                        "subfoco": "Definição e Rotina Mínima de Avaliação da Infertilidade",
                        "sub_subfocos": [
                            "Definição: Ausência de Gestação após 12 Meses de Relações Sexuais Regulares e Desprotegidas em Mulheres < 35 Anos ou após 6 Meses em Mulheres >= 35 Anos",
                            "Os 4 Pilares da Avaliação Inicial Simultânea: Fator Masculino (Espermograma), Fator Tuboperitoneal (Histerossalpingografia), Fator Ovulatório (Progesterona de Fase Lútea no 21º Dia) e Fator Uterino (USG Transvaginal)"
                        ]
                    },
                    {
                        "subfoco": "Interpretação do Espermograma e Histerossalpingografia",
                        "sub_subfocos": [
                            "Valores de Referência do Espermograma da OMS: Volume >= 1,4 mL, Concentração >= 16 Milhões/mL, Motilidade Progressiva >= 30%, Morfologia Estrita de Kruger >= 4%",
                            "Histerossalpingografia (HSG): Prova de Cotte Positiva (Extravasamento Livre de Contraste na Cavidade Peritoneal Comprova Permeabilidade Tubária Bilateral)"
                        ]
                    }
                ]
            },
            {
                "foco": "Fator Masculino, Ovariano, Tuboperitoneal e Uterino",
                "subfocos": [
                    {
                        "subfoco": "Avaliação do Fator Ovulatório e Reserva Ovariana",
                        "sub_subfocos": [
                            "Confirmação de Ovulação (Progesterona Sérica na Fase Lútea Média) e Dosagem de FSH, Estradiol e Hormônio Antimülleriano (AMH)",
                            "Contagem de Folículos Antrais à Ultrassonografia Transvaginal no Início do Ciclo"
                        ]
                    },
                    {
                        "subfoco": "Avaliação Tuboperitoneal, Uterina e Fator Masculino",
                        "sub_subfocos": [
                            "Histerossalpingografia (HSG) para Permeabilidade Tubária e Prova de Cotte Positiva",
                            "Espermograma (Critérios OMS: Concentração, Motilidade Progressiva e Morfologia Estrita de Kruger)"
                        ]
                    }
                ]
            },
            {
                "foco": "Técnicas de Reprodução Assistida",
                "subfocos": [
                    {
                        "subfoco": "Inseminação Intrauterina (IIU / Baixa Complexidade)",
                        "sub_subfocos": [
                            "Indicações: Fator Masculino Leve, Fator Cervical e Infertilidade Sem Causa Aparente (ISCA) com Trompas Pérvias",
                            "Indução da Ovulação com Clomifeno/Letrozol e Processamento Seminal para Inseminação no Pico Ovulatório"
                        ]
                    },
                    {
                        "subfoco": "Fertilização In Vitro (FIV) e Injeção Intracitoplasmática (ICSI)",
                        "sub_subfocos": [
                            "Indicações de Alta Complexidade: Fator Tubário Bilateral Severo, Fator Masculino Grave e Endometriose Avançada",
                            "Estimulação Ovariana Controlada, Captação Folicular Guiada por USG, ICSI e Transferência Embrionária"
                        ]
                    }
                ]
            }
        ]
    },
    {
        "tema": "Violência Sexual e Aspectos Médico-Legais",
        "focos": [
            {
                "foco": "Atendimento Integral à Vítima de Violência Sexual",
                "subfocos": [
                    {
                        "subfoco": "Acolhimento Humanizado e Aspectos Médico-Legais",
                        "sub_subfocos": [
                            "Atendimento Imediato Emergencial: Dispensabilidade Absoluta de Apresentação de Boletim de Ocorrência (BO) ou Laudo Pericial para Assistência Médica",
                            "Coleta de Vestígios Biológicos com Consentimento da Vítima e Notificação Compulsória Imediata"
                        ]
                    },
                    {
                        "subfoco": "Protocolo de Profilaxias de Urgência Pós-Violência Sexual",
                        "sub_subfocos": [
                            "Profilaxia Pós-Exposição (PEP) para HIV: Início em até 72 Horas por 28 Dias Consecutivos com TDF + 3TC + DTG",
                            "Profilaxia de ISTs Não Virais: Ceftriaxona 500 mg IM (Gonococo) + Azitromicina 1 g Oral (Clamídia) + Metronidazol 2 g Oral (Tricomoníase)",
                            "Vacina e Imunoglobulina contra Hepatite B de Acordo com a Situação Vacinal Prévia",
                            "Contracepção de Emergência Mandatória com Levonorgestrel 1,5 mg Oral em até 72 Horas"
                        ]
                    }
                ]
            },
            {
                "foco": "Profilaxias Pós-Exposição (HIV, Hepatite B e ISTs) e Contracepção de Emergência",
                "subfocos": [
                    {
                        "subfoco": "Atendimento Inicial e Profilaxia de ISTs Não-Virais e Virais",
                        "sub_subfocos": [
                            "Profilaxia de ISTs Bacterianas: Ceftriaxona 500mg IM + Azitromicina 1g VO + Metronidazol 2g VO em Dose Única",
                            "Profilaxia contra Hepatite B (Vacina e Imunoglobulina Humana Hiperimune em até 14 Dias se Não Imunizada)"
                        ]
                    },
                    {
                        "subfoco": "Profilaxia Pós-Exposição ao HIV (PEP) e Contracepção de Emergência",
                        "sub_subfocos": [
                            "PEP HIV em até 72 Horas (TDF + 3TC + DTG por 28 Dias) e Testagem Rápida Inicial Mandatória",
                            "Contracepção de Emergência Oral Imediata com Levonorgestrel 1,5 mg VO"
                        ]
                    }
                ]
            },
            {
                "foco": "Aborto Previsto em Lei e Documentação Médico-Legal",
                "subfocos": [
                    {
                        "subfoco": "Hipóteses Legais de Aborto no Código Penal Brasileiro e STF",
                        "sub_subfocos": [
                            "Hipóteses Canônicas: Gravidez Decorrente de Estupro, Risco de Vida Materno e Anencefalia Fetal (ADPF 54)",
                            "Desnecessidade Legal de Boletim de Ocorrência, Autorização Judicial ou Laudo do IML para Acesso ao Serviço de Saúde"
                        ]
                    },
                    {
                        "subfoco": "Procedimentos Clínicos, Termos de Consentimento e Cuidados Humanizados",
                        "sub_subfocos": [
                            "Equipe Multiprofissional e Obtenção do Termo de Consentimento Livre e Esclarecido da Gestante",
                            "Métodos Seguros de Interrupção da Gravidez: Medicamentoso (Mifepristona/Misoprostol) e AMIU/Curetagem"
                        ]
                    }
                ]
            }
        ]
    }
]
};
