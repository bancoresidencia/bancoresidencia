import { SpecialtyHierarchy } from '@/types';

export const clinicaMedicaHierarchy: SpecialtyHierarchy = {
  especialidade: 'Clínica Médica',
  temas: [
    {
      tema: 'Cardiologia',
      focos: [
        {
          foco: 'Hipertensão Arterial Sistêmica',
          subfocos: [
            'Tratamento da HAS: Farmacológico e Não Farmacológico',
            'Diagnóstico, Classificação e Monitorização (MAPA/MRPA)',
            'HAS Secundária e Resistente: Investigação e Manejo',
            'Crises e Emergências Hipertensivas: Manejo e Tratamento',
            'HAS em Populações Específicas e Lesão de Órgão-Alvo'
          ]
        },
        {
          foco: 'Insuficiência Cardíaca',
          subfocos: [
            'Tratamento Farmacológico (ICFEr, ICFEP) e Diuréticos',
            'Classificação, Etiologia e Semiologia da IC',
            'IC Aguda e Descompensada',
            'Avaliação Diagnóstica e Biomarcadores (BNP/NT-proBNP)',
            'Complicações, Comorbidades e Manifestações Específicas',
            'Terapias Avançadas e Transplante'
          ]
        },
        {
          foco: 'Síndrome Coronariana Aguda',
          subfocos: [
            'Diagnóstico da SCA: Clínica, ECG e Marcadores de Necrose',
            'Manejo Farmacológico: Antiplaquetários e Anticoagulação',
            'Estratégias de Reperfusão e Revascularização',
            'Estratificação de Risco e Complicações da SCA',
            'Estratificação de Risco (TIMI, GRACE)'
          ]
        },
        {
          foco: 'DAC Crônica e Prevenção Secundária',
          subfocos: [
            'Prevenção Secundária e Risco Cardiovascular',
            'Tratamento Farmacológico da DAC: Estatinas e Anti-hipertensivos',
            'Indicações e Métodos de Revascularização',
            'Angina Estável e Doença Microvascular Coronariana',
            'Revascularização (ICP vs RM)'
          ]
        },
        {
          foco: 'Taquiarritmias',
          subfocos: [
            'Taquicardia Ventricular e Fibrilação Ventricular',
            'Taquicardias Supraventriculares e Síndromes de QT Longo',
            'Eletrofisiologia Cardíaca e Farmacologia Antiarrítmica',
            'Flutter Atrial',
            'Arritmias em Condições Específicas e Distúrbios Eletrolíticos'
          ]
        },
        {
          foco: 'Valvopatias',
          subfocos: [
            'Valvopatia Mitral: Estenose e Insuficiência',
            'Valvopatias Aórticas: Estenose e Insuficiência',
            'Diagnóstico e Etiologia das Valvopatias',
            'Indicações Cirúrgicas e Complicações de Valvopatias',
            'Cardiopatias Congênitas e Valvares'
          ]
        },
        {
          foco: 'Cardiomiopatias',
          subfocos: [
            'Miocardite: Etiologia, Diagnóstico e Tratamento',
            'Cardiomiopatia Dilatada e Fibrose Miocárdica',
            'Cardiomiopatia Restritiva: Etiologia e Diagnóstico',
            'Síndrome de Takotsubo: Diagnóstico e Fisiopatologia'
          ]
        },
        {
          foco: 'Fibrilação Atrial: Estratificação e Anticoagulação',
          subfocos: [
            'Anticoagulação na FA: Indicações e Condutas Específicas',
            'Estratificação de Risco: CHA2DS2-VASc e HAS-BLED',
            'Cardioversão: Indicações e Técnicas',
            'Cardioversão Elétrica e Farmacológica',
            'Ablação de Fibrilação Atrial'
          ]
        },
        {
          foco: 'Pericardite e Doenças do Pericárdio',
          subfocos: [
            'Pericardite Aguda: Etiologia, Diagnóstico e ECG',
            'Tamponamento Cardíaco: Reconhecimento e Manejo de Emergência',
            'Tratamento da Pericardite: AINEs, Colchicina e Outras Terapias',
            'Pericardite Crônica, Constritiva e Pós-IAM (Dressler)',
            'Pericardiocentese e Janela Pericárdica'
          ]
        },
        {
          foco: 'Endocardite Infecciosa: Critérios de Duke, Antibiótico e Indicações Cirúrgicas',
          subfocos: [
            'Etiologia, Patogênese e Manifestações Clínicas',
            'Tratamento: Antibioticoterapia e Indicações Cirúrgicas',
            'Profilaxia Antibiótica para Endocardite Infecciosa',
            'Critérios de Duke: Classificação e Fenômenos Associados',
            'Complicações e Endocardite em Próteses/Dispositivos'
          ]
        },
        {
          foco: 'Bradiarritmias e Bloqueios AV',
          subfocos: [
            'Indicações de Marcapasso',
            'Bloqueio AV de 2º Grau (Mobitz I e II)',
            'Bradicardia Sinusal',
            'Bloqueio AV de 1º Grau',
            'Bloqueio AV de 3º Grau (BAVT)'
          ]
        },
        {
          foco: 'Embolia Pulmonar: Cor Pulmonale e Repercussão Hemodinâmica',
          subfocos: [
            'TEP Maciço e Instabilidade Hemodinâmica',
            'Hipertensão Pulmonar Tromboembólica Crônica',
            'Cor Pulmonale Crônico',
            'Cor Pulmonale Agudo'
          ]
        },
        {
          foco: 'Síndromes Aórticas Agudas',
          subfocos: [
            'Dissecção Aórtica: Stanford, Diagnóstico, Marfan e Manejo',
            'Aneurisma de Aorta Torácica',
            'Aneurisma de Aorta: Epidemiologia, Ruptura e Complicações'
          ]
        },
        {
          foco: 'Síncope',
          subfocos: [
            'Síncope Vasovagal',
            'Hipotensão Ortostática',
            'Síncope Cardíaca (Arritmogênica)'
          ]
        }
      ]
    },
    {
      tema: 'Gastroenterologia',
      focos: [
        {
          foco: 'Doenças Biliares e Pancreatite Aguda',
          subfocos: [
            'Pancreatite Aguda: Diagnóstico e Manejo',
            'Colecistite e Colangite',
            'Colelitíase e Síndromes Pós-Colecistectomia',
            'Complicações: Necrose, Infecção e Síndromes',
            'Pancreatite Crônica: Etiologia e Diagnóstico'
          ]
        },
        {
          foco: 'Cirrose e Complicações',
          subfocos: [
            'Cirrose: Complicações e Etiologia',
            'Peritonite Bacteriana Espontânea (PBE)',
            'Diagnóstico e Manejo da Ascite',
            'Encefalopatia Hepática e Síndrome Hepatorrenal',
            'Síndrome Hepatorrenal (SHR)',
            'Ascite e Peritonite Bacteriana Espontânea'
          ]
        },
        {
          foco: 'Hemorragia Digestiva Alta',
          subfocos: [
            'HDA Não Varicosa: Etiologia e Endoscopia',
            'Avaliação Inicial e Ressuscitação na HDA',
            'HDA Varicosa: Manejo e Profilaxia',
            'Escores Prognósticos e Estratificação de Risco',
            'TIPS e Resgate Hemostático'
          ]
        },
        {
          foco: 'Doença Inflamatória Intestinal e Diverticulite',
          subfocos: [
            'Crohn: Diagnóstico e Manejo',
            'DII: Complicações e Manifestações Extraintestinais',
            'Diverticulite Aguda: Diagnóstico e Classificação',
            'Retocolite Ulcerativa: Diagnóstico e Manejo',
            'DII: Tratamento Farmacológico',
            'Doença Celíaca: Rastreamento e Diagnóstico'
          ]
        },
        {
          foco: 'Doença do Refluxo Gastroesofágico (DRGE)',
          subfocos: [
            'DRGE: Fisiopatologia e Diagnóstico',
            'Esôfago de Barrett e Adenocarcinoma',
            'DRGE: Tratamento Clínico e Cirúrgico',
            'Distúrbios Motores do Esôfago',
            'Esofagites Infecciosas e Eosinofílicas',
            'Emergências Esofágicas',
            'Ingestão de Cáusticos e Corpos Estranhos'
          ]
        },
        {
          foco: 'Úlcera Péptica e H. pylori',
          subfocos: [
            'H. pylori: Diagnóstico e Erradicação',
            'Úlcera Péptica: Patogênese e Diagnóstico',
            'Úlcera Péptica: Tratamento e Complicações',
            'Gastropatias e Uso de AINEs',
            'Sangramento por Úlcera e Classificação de Forrest'
          ]
        },
        {
          foco: 'Hepatite Autoimune e Hepatopatia Viral Crônica',
          subfocos: [
            'Hepatopatia Medicamentosa e Tóxica',
            'Hepatite Autoimune: Diagnóstico e Tratamento',
            'DHGNA e Esteato-hepatite',
            'Colangite Aguda e Abscessos Hepáticos',
            'Doença de Wilson e Hemocromatose',
            'Colangite Biliar e Colangite Esclerosante'
          ]
        },
        {
          foco: 'Diarreia Aguda e Crônica',
          subfocos: [
            'Diarreia Aguda: Etiologia e Manejo',
            'Diarreia Crônica: Investigação e Classificação',
            'Diarreia: Complicações e Situações Especiais',
            'Síndrome do Intestino Irritável e Funcional',
            'Diarreia Crônica: Síndrome do Intestino Irritável',
            'Causas Endócrinas de Diarreia'
          ]
        },
        {
          foco: 'Hemorragia Digestiva Baixa e Isquemia Mesentérica',
          subfocos: [
            'HDB: Etiologia e Diagnóstico',
            'Doença Diverticular e Angiodisplasia',
            'HDB: Ressuscitação e Manejo Inicial',
            'HDB: Neoplasias e Causas Incomuns',
            'Pólipos Colônicos e Neoplasias',
            'Colonoscopia e Terapia Endoscópica'
          ]
        }
      ]
    },
    {
      tema: 'Infectologia',
      focos: [
        {
          foco: 'Infecções Bacterianas Sistêmicas e Nosocomiais',
          subfocos: [
            'Sífilis: Diagnóstico e Tratamento',
            'Infecções por Gram-Positivos e Negativos',
            'Antibioticoterapia Empírica e Multirresistência',
            'Leptospirose e Febre Tifoide',
            'Sepse e Bacteremia: Manejo',
            'Infecções Bacterianas Específicas: Clostridium difficile',
            'Endocardite e Infecções Ósteo-articulares'
          ]
        },
        {
          foco: 'Arboviroses e Viroses Epidêmicas (Dengue, Chikungunya, Zika, Influenza, COVID-19)',
          subfocos: [
            'Dengue: Diagnóstico, Classificação e Manejo',
            'Arboviroses: Diagnóstico Diferencial e Epidemiologia',
            'Influenza e COVID-19: Diagnóstico e Manejo',
            'Chikungunya e Zika: Diagnóstico e Manejo',
            'Malária: Diagnóstico e Tratamento',
            'Febre Amarela: Diagnóstico e Manejo',
            'Leptospirose: Diagnóstico e Manejo'
          ]
        },
        {
          foco: 'HIV/AIDS',
          subfocos: [
            'HIV: Terapia Antirretroviral',
            'HIV: Diagnóstico e Estadiamento',
            'HIV: Manifestações Dermatológicas e Orais',
            'HIV: Prevenção, PEP e PrEP',
            'HIV: Coinfecções e Gestação'
          ]
        },
        {
          foco: 'Sepse: Etiologia, Diagnóstico e Antibioticoterapia',
          subfocos: [
            'Definição e Critérios Diagnósticos (Sepse-3, qSOFA)',
            'Manejo Inicial: Bundle de 1 Hora',
            'Antibioticoterapia Empírica e Guiada',
            'Choque Séptico: Fluidos e Vasopressores',
            'Hemoculturas e Coleta de Amostras'
          ]
        },
        {
          foco: 'Hepatites Virais: Diagnóstico, Tratamento e Profilaxia',
          subfocos: [
            'Hepatites: Diagnóstico Diferencial e Imunoprofilaxia',
            'Hepatite C: Diagnóstico e Tratamento',
            'Hepatite B: Diagnóstico e Tratamento',
            'Hepatites A e E: Agudas',
            'Coinfecção HIV/HBV e HIV/HCV',
            'Hepatite Fulminante'
          ]
        },
        {
          foco: 'Tuberculose Extrapulmonar, Resistência e Esquemas Especiais',
          subfocos: [
            'TB Extrapulmonar e Latente',
            'TB: Multirresistência e Esquemas Especiais',
            'TB e Coinfecção HIV',
            'TB Pulmonar: Diagnóstico e Esquema RHZE',
            'TB Multirresistente (MDR-TB)'
          ]
        },
        {
          foco: 'Meningites e Encefalites no Adulto: Antibiótico Empírico e Janela Terapêutica',
          subfocos: [
            'Meningite Bacteriana: Etiologia e Manejo',
            'Meningite Viral e Asséptica',
            'Análise do LCR e Diagnóstico',
            'Profilaxia e Vacinação Meningocócica',
            'Meningite Fúngica e Tuberculosa'
          ]
        },
        {
          foco: 'Infecções Oportunistas no HIV',
          subfocos: [
            'Pneumocistose e Infecções Respiratórias',
            'Neurotoxoplasmose e Neurocriptococose',
            'TB e Micobactérias no HIV',
            'Profilaxias Primárias e Secundárias no HIV',
            'Infecções e CMV no HIV',
            'Síndrome Inflamatória da Reconstituição Imune'
          ]
        },
        {
          foco: 'Parasitoses e Doenças Tropicais',
          subfocos: [
            'Esquistossomose: Diagnóstico e Manejo',
            'Malária: Plasmodium e Recaídas'
          ]
        },
        {
          foco: 'Retroviruses e Infecções Virais Crônicas',
          subfocos: [
            'HTLV-1: Manifestações Dermatológicas'
          ]
        }
      ]
    },
    {
      tema: 'Endocrinologia',
      focos: [
        {
          foco: 'Diabetes Mellitus',
          subfocos: [
            'Classificação, Diagnóstico e Fisiopatologia do DM',
            'Antidiabéticos Orais e Tratamento Nutricional',
            'Complicações Crônicas Macrovasculares e Outras',
            'Insulinoterapia: Esquemas, Bomba e Tecnologias',
            'Metas Glicêmicas, Monitoramento e Diabetes Perioperatório',
            'Complicações Crônicas Microvasculares (Retinopatia, Nefropatia e Neuropatia)',
            'Diabetes Secundário e Formas Especiais'
          ]
        },
        {
          foco: 'Doenças da Tireoide',
          subfocos: [
            'Hipotireoidismo: Diagnóstico, Etiologias e Tratamento',
            'Nódulos Tireoidianos: Investigação, TI-RADS e Conduta',
            'Hipertireoidismo: Doença de Graves e Outras Causas',
            'Tireoidites: Hashimoto, Subaguda e Outras',
            'Câncer de Tireoide Diferenciado: Diagnóstico, Tratamento e Complicações Pós-Cirúrgicas',
            'Câncer de Tireoide Medular e Formas Raras (Anaplásico)',
            'Disfunções Tireoidianas na Gestação'
          ]
        },
        {
          foco: 'Metabolismo Ósseo e Mineral',
          subfocos: [
            'Osteoporose: Diagnóstico, Fatores de Risco e Rastreamento',
            'Hiperparatireoidismo: Diagnóstico e Manejo',
            'Hipocalcemia, Hipoparatireoidismo e Hipocalcemia Secundária',
            'Osteoporose: Tratamento Farmacológico e Não Farmacológico',
            'Vitamina D: Deficiência e Reposição',
            'Doença de Paget: Diagnóstico e Manejo'
          ]
        },
        {
          foco: 'Complicações Agudas do DM',
          subfocos: [
            'Cetoacidose Diabética (CAD): Diagnóstico, Fisiopatologia e Manejo',
            'Hipoglicemia: Diagnóstico, Manejo e Glucagon',
            'CAD: Complicações, Resolução e Formas Atípicas (Euglicêmica)',
            'Crises Hiperglicêmicas: Comparativo, Distúrbios Eletrolíticos e Prevenção',
            'Estado Hiperglicêmico Hiperosmolar (EHH): Diagnóstico e Manejo'
          ]
        },
        {
          foco: 'Doenças da Adrenal',
          subfocos: [
            'Hiperaldosteronismo Primário: Diagnóstico e Manejo',
            'Feocromocitoma e Paraganglioma: Diagnóstico e Tratamento',
            'Insuficiência Adrenal: Primária, Secundária e Terciária',
            'Incidentaloma Adrenal: Avaliação e Conduta',
            'Síndrome de Cushing: Manifestações Clínicas e Tratamento',
            'Hiperplasia Adrenal Congênita (HAC) e NEM',
            'Síndrome de Cushing: Diagnóstico Etiológico e Diferencial'
          ]
        },
        {
          foco: 'Distúrbios Hipofisários',
          subfocos: [
            'Prolactinoma: Diagnóstico e Tratamento',
            'Hipopituitarismo: Etiologia, Diagnóstico e Reposição Hormonal',
            'Regulação Hormonal Hipotalâmico-Hipofisária',
            'Diabetes Insipidus e Distúrbios do ADH',
            'Doença de Cushing Hipofisária: Diagnóstico e Tratamento',
            'Acromegalia: Diagnóstico, Manifestações e Tratamento',
            'Distúrbios da Puberdade e Hipogonadismo Central'
          ]
        },
        {
          foco: 'Síndrome Metabólica',
          subfocos: [
            'Critérios Diagnósticos da Síndrome Metabólica',
            'Fisiopatologia e Componentes da SM',
            'Risco Cardiovascular na Síndrome Metabólica',
            'Resistência Insulínica e Obesidade Central',
            'Tratamento Não Farmacológico da SM'
          ]
        },
        {
          foco: 'Insuficiência Adrenal Aguda e Crise Addisoniana',
          subfocos: [
            'Insuficiência Adrenal: Manejo Terapêutico e Monitoramento',
            'Insuficiência Adrenal: Etiologia e Diagnóstico',
            'Crise Adrenal Aguda: Apresentação Clínica e Laboratorial',
            'Reposição de Glicocorticoide em Estresse'
          ]
        },
        {
          foco: 'Emergências Tireoidianas: Crise Tireotóxica e Coma Mixedematoso',
          subfocos: [
            'Crise Tireotóxica (Tempestade Tireoidiana): Diagnóstico e Tratamento',
            'Coma Mixedematoso: Diagnóstico e Tratamento',
            'Bloqueio Adrenérgico na Crise Tireotóxica',
            'Tireotoxicose: Etiologia e Diagnóstico Diferencial'
          ]
        }
      ]
    },
    {
      tema: 'Pneumologia',
      focos: [
        {
          foco: 'DPOC: Manejo e Exacerbação',
          subfocos: [
            'Diagnóstico, Classificação GOLD e Fisiopatologia',
            'Exacerbação da DPOC: Manejo Clínico',
            'Tratamento Farmacológico da DPOC Estável',
            'Oxigenoterapia, Suporte Ventilatório e Reabilitação Pulmonar',
            'Tabagismo, Cessação e Prognóstico (BODE)',
            'Comorbidades e Cor Pulmonale'
          ]
        },
        {
          foco: 'Pneumonia Adquirida na Comunidade',
          subfocos: [
            'Diagnóstico, Imagem e Estratificação de Gravidade (CURB-65, PSI)',
            'Antibioticoterapia Empírica e Direcionada',
            'Etiologia da PAC: Agentes Típicos e Atípicos',
            'Pneumonias Especiais: Aspiração e Populações Específicas',
            'Complicações da PAC: Derrame Parapneumônico e Abscesso'
          ]
        },
        {
          foco: 'Asma',
          subfocos: [
            'Tratamento de Manutenção e Classificação de Controle (GINA)',
            'Fisiopatologia, Epidemiologia e Fenótipos da Asma',
            'Diagnóstico e Avaliação da Função Pulmonar',
            'Manejo da Crise Aguda de Asma',
            'Asma Grave, Biológicos e Fenótipos Especiais'
          ]
        },
        {
          foco: 'Derrame Pleural: Investigação e Manejo Clínico',
          subfocos: [
            'Derrames Pleurais Específicos: Tuberculoso, Neoplásico e Transudativo',
            'Derrame Parapneumônico e Empiema: Diagnóstico e Manejo',
            'Abordagem Diagnóstica: Critérios de Light e Toracocentese',
            'Toracocentese e Drenagem Torácica',
            'Pneumotórax: Diagnóstico e Manejo'
          ]
        },
        {
          foco: 'Tuberculose Pulmonar: Diagnóstico e Tratamento Inicial',
          subfocos: [
            'Diagnóstico de TB: Clínica, Baciloscopia, Testes Rápidos e Imagem',
            'Tratamento da TB: Esquema RHZE e Casos Resistentes',
            'ILTB e Quimioprofilaxia',
            'TB Pleural e Extrapulmonar',
            'TB Latente, Prevenção e Controle de Transmissão'
          ]
        },
        {
          foco: 'TEP: Diagnóstico, Estratificação e Anticoagulação',
          subfocos: [
            'Avaliação Clínica: Escore de Wells e D-dímero',
            'Diagnóstico por Imagem: Angiotomografia e Cintilografia V/Q',
            'TEP Maciço: Trombolítico, Filtro de VCI e Manejo',
            'Anticoagulação no TEP: Início, Manutenção e Duração',
            'Fatores de Risco, Prevenção e TEP Pós-operatório',
            'Estratificação de Risco (PESI) e Complicações'
          ]
        },
        {
          foco: 'Câncer de Pulmão: Diagnóstico e Tratamento Oncológico',
          subfocos: [
            'Tipos Histológicos e Diagnóstico Diferencial (NSCLC vs SCLC)',
            'Estadiamento TNM e Opções Terapêuticas',
            'Manifestações Clínicas, Síndromes Paraneoplásicas e SVCS',
            'Nódulo Pulmonar Solitário e Tumores Benignos',
            'Rastreamento de Câncer de Pulmão com TC de Baixa Dose'
          ]
        },
        {
          foco: 'Pneumopatias Intersticiais',
          subfocos: [
            'Outras PIDc: Organização, Doenças Sistêmicas e Ocupacionais',
            'Fibrose Pulmonar Idiopática (FPI): Diagnóstico e Tratamento',
            'Sarcoidose Pulmonar: Diagnóstico, Tratamento e Prognóstico',
            'TCAR e Avaliação Radiológica em Doenças Intersticiais',
            'Pneumonite de Hipersensibilidade: Etiologia, Diagnóstico e Radiologia',
            'Fibrose Cística: Genética e Manifestações Pulmonares'
          ]
        },
        {
          foco: 'Exacerbação de Asma e DPOC: VNI e Manejo',
          subfocos: [
            'Ventilação Não-Invasiva (VNI): Indicações e Manejo',
            'Insuficiência Respiratória Aguda: Manejo e Critérios de Intubação',
            'Exacerbação de DPOC: Manejo Clínico e Farmacológico',
            'Exacerbação de Asma: Manejo Farmacológico e Fatores de Risco'
          ]
        },
        {
          foco: 'Pneumonia Associada à Assistência à Saúde',
          subfocos: [
            'Diagnóstico e Marcadores da PAAS',
            'Tratamento da PAAS: Antibioticoterapia e Duração',
            'Definição, Epidemiologia e Fatores de Risco da PAAS',
            'Prevenção de PAAS',
            'Pneumonia Hospitalar e Associada à Ventilação Mecânica (PAV)'
          ]
        },
        {
          foco: 'SAHOS (Apneia Obstrutiva do Sono)',
          subfocos: [
            'Diagnóstico Clínico e Polissonografia',
            'CPAP e BIPAP',
            'Complicações Cardiovasculares da SAHOS',
            'Síndrome Obesidade-Hipoventilação'
          ]
        }
      ]
    },
    {
      tema: 'Nefrologia',
      focos: [
        {
          foco: 'Distúrbios Hidroeletrolíticos',
          subfocos: [
            'Distúrbios do Potássio',
            'Hiponatremia: Diagnóstico e Tratamento',
            'Distúrbios Eletrolíticos em Situações Específicas',
            'Hipernatremia: Diagnóstico e Tratamento',
            'Distúrbios do Cálcio e Fósforo',
            'Distúrbios do Magnésio e Reposição'
          ]
        },
        {
          foco: 'Doença Renal Crônica',
          subfocos: [
            'DRC: Manejo Conservador e Complicações',
            'Nefropatia Diabética e Hipertensiva',
            'DRC: Classificação e Progressão',
            'Anemia e Doença Mineral-Óssea na DRC',
            'DRC: Complicações Cardiovasculares e Nutrição',
            'Aspectos Nutricionais na DRC'
          ]
        },
        {
          foco: 'Glomerulopatias',
          subfocos: [
            'Glomerulopatias Primárias e Secundárias',
            'Síndromes Glomerulares: Nefrítica e Nefrótica',
            'Glomerulonefrite Pós-Infecciosa (Ex: Estreptocócica)',
            'Nefropatia por IgA (Doença de Berger)',
            'Glomerulonefrite Rapidamente Progressiva (GNRP)',
            'Síndromes Nefríticas: Etiologias e Manifestações',
            'Biópsia Renal e Imunofluorescência'
          ]
        },
        {
          foco: 'Insuficiência Renal Aguda',
          subfocos: [
            'Necrose Tubular Aguda e IRA Intrínseca',
            'IRA Pré-Renal: Diagnóstico e Manejo',
            'Rabdomiólise e Nefrotoxicidade',
            'IRA: Classificação e Critérios KDIGO',
            'IRA Pós-Renal e Obstrutiva',
            'Indicações de Diálise de Urgência'
          ]
        },
        {
          foco: 'Infecção do Trato Urinário',
          subfocos: [
            'ITU Não Complicada: Cistite e Pielonefrite',
            'ITU em Populações Especiais',
            'ITU Complicada e de Repetição',
            'ITU: Urocultura e Cultura',
            'ITU Recorrente e Profilaxia',
            'Diagnóstico Laboratorial e por Imagem em ITU'
          ]
        },
        {
          foco: 'Distúrbios Ácido-Base',
          subfocos: [
            'Acidose Metabólica: Gap e Não-Gap',
            'Distúrbios Respiratórios e Mistos',
            'Alcalose Metabólica: Etiologia e Manejo',
            'Gasometria: Interpretação Sistemática',
            'Fisiologia Ácido-Base e Regulação Renal'
          ]
        },
        {
          foco: 'Nefrolitíase',
          subfocos: [
            'Investigação Metabólica e Prevenção',
            'Tipos de Cálculos e Fisiopatologia',
            'Cólica Renal: Diagnóstico e Manejo Agudo',
            'Imagem na Nefrolitíase',
            'Urolitíase Complicada e Intervenção'
          ]
        },
        {
          foco: 'Terapia Renal Substitutiva: Urgências Dialíticas e Acesso',
          subfocos: [
            'Hemodiálise: Princípios e Indicações',
            'Acesso Vascular e Complicações de TRS',
            'Diálise Peritoneal: Indicações e Complicações',
            'Uremia e suas Manifestações',
            'Acesso Vascular para Hemodiálise: Fístula vs Cateter'
          ]
        }
      ]
    },
    {
      tema: 'Neurologia',
      focos: [
        {
          foco: 'AVC Isquêmico',
          subfocos: [
            'Avaliação Clínica e Diagnóstico Inicial (NIHSS, Déficits Focais)',
            'Terapia de Recanalização: Trombólise (rtPA)',
            'Prevenção Secundária: Fatores de Risco e Manejo',
            'Etiologias do AVC Isquêmico (Classificação TOAST)',
            'Manejo Pós-AVC e Reabilitação'
          ]
        },
        {
          foco: 'Cefaleias',
          subfocos: [
            'Cefaleias Secundárias: Sinais de Alarme',
            'Cefaleia em Salvas: Clínica e Diagnóstico',
            'Tratamento Abortivo de Enxaqueca',
            'Enxaqueca sem Aura',
            'Cefaleias Primárias: Classificação Geral',
            'Cefaleia Tensional Episódica'
          ]
        },
        {
          foco: 'Demências',
          subfocos: [
            'Doença de Alzheimer: Apresentação Clínica e Diagnóstico',
            'Demências Reversíveis e Secundárias',
            'Diagnóstico e Avaliação Cognitiva Inicial',
            'Demência Frontotemporal: Apresentação e Diagnóstico',
            'Demência Vascular: Fisiopatologia e Manifestações'
          ]
        },
        {
          foco: 'Coma e Alterações da Consciência',
          subfocos: [
            'Escala de Coma de Glasgow: Aplicação Clínica',
            'Alterações da Consciência: Causas Estruturais/Traumáticas',
            'Hidrocefalia e Hipertensão Intracraniana',
            'Encefalopatia de Wernicke: Tríade e Diagnóstico',
            'Morte Encefálica: Critérios Diagnósticos',
            'Delirium: Diagnóstico e Manejo'
          ]
        },
        {
          foco: 'Doenças Neurodegenerativas (Parkinson, ELA, Ataxias)',
          subfocos: [
            'Esclerose Lateral Amiotrófica (ELA): Diagnóstico e Clínica',
            'Doenças Neurodegenerativas Atípicas e Parkinsonismos',
            'Transtornos do Movimento: Tremor Essencial e Coreias',
            'Doença de Parkinson: Manifestações Motoras Clássicas',
            'Doença de Parkinson: Tratamento e Manejo'
          ]
        },
        {
          foco: 'Doenças Desmielinizantes',
          subfocos: [
            'Encefalites Autoimunes e Desmielinizantes',
            'Mielite Transversa: Diagnóstico e Etiologia',
            'Esclerose Múltipla: Diagnóstico e Critérios',
            'Neuromielite Óptica: Diagnóstico e Critérios',
            'Esclerose Múltipla: Tratamento Modificador da Doença'
          ]
        },
        {
          foco: 'AVC Hemorrágico',
          subfocos: [
            'Hemorragia Subaracnoidea: Manejo e Complicações',
            'Hemorragia Intraparenquimatosa: Manejo Clínico e Controle Pressórico',
            'Hemorragia Subaracnoidea: Etiologia e Fatores de Risco',
            'Hemorragia Intraparenquimatosa: Etiologia e Fatores de Risco',
            'Hemorragias Cerebrais: Manejo Cirúrgico e Endovascular'
          ]
        },
        {
          foco: 'Doenças Neuromusculares',
          subfocos: [
            'Miastenia Gravis',
            'Neuropatias Periféricas e Miastenia Gravis',
            'Síndrome de Guillain-Barré',
            'Miosites Inflamatórias (DM, PM)',
            'Crise Miastênica'
          ]
        },
        {
          foco: 'Epilepsia no Adulto',
          subfocos: [
            'Epilepsia e Gestação',
            'Diagnóstico Diferencial de Crises',
            'Farmacoterapia da Epilepsia',
            'Classificação de Crises Epilépticas',
            'Síndromes Epilépticas Específicas'
          ]
        },
        {
          foco: 'Estado de Mal Epiléptico: Algoritmo e Manejo de Via Aérea',
          subfocos: [
            'Algoritmo Terapêutico do Estado de Mal Epiléptico',
            'Tratamento de Segunda e Terceira Linha do EME',
            'Definição e Critérios Diagnósticos do Estado de Mal Epiléptico',
            'Manejo de Via Aérea e Ventilação no EME'
          ]
        }
      ]
    },
    {
      tema: 'Reumatologia',
      focos: [
        {
          foco: 'Artrite Reumatoide e Osteoartrite',
          subfocos: [
            'Artrite Reumatoide: Quadro Clínico e Critérios Diagnósticos',
            'Artrite Reumatoide: Tratamento e Monitoramento',
            'Manifestações Extra-articulares da AR',
            'Diagnóstico Diferencial de Artrites e Artrite Séptica',
            'Tratamento de Artrite Idiopática Juvenil'
          ]
        },
        {
          foco: 'Autoimunes Sistêmicas: Esclerose, Sjögren e Miosites',
          subfocos: [
            'Esclerodermia Sistêmica: Diagnóstico e Manifestações Multissistêmicas',
            'Colagenoses Indiferenciadas, DMTC e SAF',
            'Miopatias Inflamatórias: Polimiosite e Dermatomiosite',
            'Fibromialgia: Diagnóstico e Manifestações Associadas',
            'Síndrome de Sjögren: Diagnóstico e Manifestações'
          ]
        },
        {
          foco: 'Lúpus Eritematoso Sistêmico',
          subfocos: [
            'LES: Quadro Clínico, Autoanticorpos e Critérios Diagnósticos',
            'Nefrite Lúpica e Manifestações Neuropsiquiátricas do LES',
            'LES: Tratamento, Monitoramento e Atividade de Doença',
            'LES Induzido por Drogas',
            'SAF Associada ao LES e Fatores de Prognóstico'
          ]
        },
        {
          foco: 'Vasculites',
          subfocos: [
            'Vasculites de Grandes Vasos: ACG e Polimialgia Reumática',
            'Vasculites ANCA-positivas: GPA, PAM e Síndrome Pulmão-Rim',
            'Vasculites de Médios e Pequenos Vasos: PAN, IgA e Leucocitoclástica',
            'Vasculites Secundárias: Hepatites Virais e Doença de Buerger',
            'Vasculites: Classificação de Chapel Hill e Investigação por ANCA'
          ]
        },
        {
          foco: 'Espondiloartrites',
          subfocos: [
            'Artrite Reativa e Artrite Psoriásica',
            'Espondiloartrites: Classificação, Genética e Critérios Diagnósticos',
            'Espondilite Anquilosante: Manifestações e Complicações',
            'Sacroiliíte e Critérios de Imagem',
            'Espondiloartrites: Tratamento e Manejo'
          ]
        },
        {
          foco: 'Gota e Doenças por Cristais',
          subfocos: [
            'Gota: Fisiopatologia, Apresentação Clínica e Diagnóstico',
            'Gota: Tratamento da Crise Aguda e Manutenção',
            'Pseudogota: Diagnóstico e Manejo',
            'Tofo e Artropatia Crônica',
            'Gota: Manifestações Atípicas e Complicações'
          ]
        }
      ]
    },
    {
      tema: 'Hematologia',
      focos: [
        {
          foco: 'Anemias no Adulto',
          subfocos: [
            'Anemias Carenciais: Ferropriva e Megaloblástica',
            'Anemias Hemolíticas e Hemoglobinopatias',
            'Abordagem Geral e Classificação das Anemias',
            'Anemias em Contextos Específicos',
            'Insuficiência Medular e Síndromes Mielodisplásicas'
          ]
        },
        {
          foco: 'Tromboses',
          subfocos: [
            'Fatores de Risco, Profilaxia e Tromboses em Sítios Atípicos',
            'Trombose Venosa Profunda (TVP): Diagnóstico e Tratamento',
            'Anticoagulação: Heparinas e Anticoagulantes Orais',
            'Trombofilias e Síndrome Antifosfolipíde (SAF)',
            'Trombofilia Hereditária e Adquirida'
          ]
        },
        {
          foco: 'Coagulopatias',
          subfocos: [
            'Púrpuras Trombocitopênicas: PTI e PTT',
            'Hemofilias e Doença de von Willebrand',
            'Reversão de Anticoagulantes e Manejo de Sangramento',
            'Coagulação Intravascular Disseminada (CIVD)',
            'Trombocitopenia Induzida por Heparina (TIH)'
          ]
        },
        {
          foco: 'Gamopatias Monoclonais',
          subfocos: [
            'Mieloma Múltiplo: Diagnóstico e Manifestações Clínicas',
            'Amiloidose AL e Macroglobulinemia de Waldenström',
            'MGUS e Diagnóstico Laboratorial das Gamopatias',
            'Síndrome POEMS',
            'Mieloma Múltiplo: Tratamento e Monitoramento'
          ]
        },
        {
          foco: 'Linfomas',
          subfocos: [
            'Linfoma de Hodgkin: Diagnóstico, Estadiamento e Tratamento',
            'Linfomas: Apresentação Clínica e Estadiamento',
            'Linfoma Não-Hodgkin: Classificação e Subtipos',
            'Linfoma Não-Hodgkin: Tratamento e Manejo',
            'Linfomas em Contextos Específicos'
          ]
        },
        {
          foco: 'Transfusão e Reações Transfusionais: Indicações e Eventos Adversos',
          subfocos: [
            'Indicações de Transfusão de Hemocomponentes',
            'Reações Transfusionais Imediatas: Hemolítica, Febril e Alérgica',
            'Reações Transfusionais Pulmonares (TRALI/TACO)',
            'Complicações Tardias e Não Imunológicas',
            'Hemotransfusão Maciça'
          ]
        },
        {
          foco: 'Leucemias no Adulto',
          subfocos: [
            'Leucemia Mieloide Aguda (LMA) e Promielocítica (LPA)',
            'Síndromes Mielodisplásicas, Mieloproliferativas e Aspectos Gerais',
            'Leucemia Mieloide Crônica (LMC): Diagnóstico e Tratamento',
            'Leucemia Linfoide Crônica (LLC) e Leucemias Raras',
            'Complicações Hematológicas, TMO e Terapia de Suporte',
            'Leucemia Linfoide Aguda (LLA): Diagnóstico e Tratamento'
          ]
        }
      ]
    },
    {
      tema: 'Propedêutica e Raciocínio Clínico',
      focos: [
        {
          foco: 'Raciocínio Clínico e Diagnóstico Diferencial',
          subfocos: [
            'DD por Queixa: Dor Abdominal, Sintomas GI e Urinários',
            'DD por Queixa: Hematológico, Endócrino e Nefrológico',
            'Raciocínio Diagnóstico: Princípios, Abordagem e HDE',
            'DD por Queixa: Cardiovascular, Respiratório e Musculoesquelético',
            'DD por Queixa: Dermatológico, Síndromes e Doenças Raras'
          ]
        },
        {
          foco: 'Semiologia e Propedêutica',
          subfocos: [
            'Anamnese, História Clínica e Sinais Vitais',
            'Exame Físico: Abdome, TGI e Urológico',
            'Exame Físico: Neurológico, Musculoesquelético e Dermatológico',
            'Exame Físico: Cardiovascular, Respiratório e Vascular',
            'Avaliação Pré-operatória, Anatomia Aplicada e Propedêutica Geral'
          ]
        },
        {
          foco: 'Interpretação de Exames Complementares',
          subfocos: [
            'Exames de Imagem: Radiografia, TC, RM e Ultrassom',
            'Hemograma, Coagulograma e Análise Hematológica',
            'Bioquímica: Função Renal, Hepática, Enzimas e Marcadores',
            'Testes Diagnósticos: Validade e Especificidade',
            'Gasometria Arterial e Distúrbios Ácido-Base',
            'Urinálise: Exame Tipo 1 e Citoúria'
          ]
        },
        {
          foco: 'Febre de Origem Indeterminada e Síndromes Febris',
          subfocos: [
            'Investigação Diagnóstica e Diagnóstico Diferencial de Febre',
            'Febre de Origem Indeterminada (FOI) e Obscura (FOD)',
            'Febre em Populações Especiais: Imunocomprometidos, Pós-Op e Comorbidades',
            'Fisiopatologia, Termorregulação e Tratamento Antipirético'
          ]
        }
      ]
    },
    {
      tema: 'Oncologia Clínica',
      focos: [
        {
          foco: 'Tumores Sólidos Frequentes',
          subfocos: [
            'Tumores Gástricos, Esofágicos e GIST: Diagnóstico e Tratamento',
            'Tumores Hepatobiliopancreáticos: Diagnóstico e Tratamento',
            'CCR: Tratamento Adjuvante, Linfomas e Outros Tumores',
            'Tumores de Pulmão e Rim: NSCLC, SCLC e CCR',
            'Tumores de Mama, Ovário e Ginecológicos: Subtipos e Conduta',
            'Tumores de Pele: Melanoma e Não Melanoma'
          ]
        },
        {
          foco: 'Rastreamento e Prevenção do Câncer',
          subfocos: [
            'CCR: Pólipos, Lesões Pré-Malignas e Síndromes Hereditárias',
            'Rastreamento de CCR: Diretrizes, Métodos e Fatores de Risco',
            'Rastreamento Ginecológico: Colo Uterino, HPV e Sangramento',
            'Rastreamento de Próstata, Pulmão e Pele',
            'Rastreamento de Câncer: Testes Genéticos e Síndromes Familiares',
            'Rastreamento de Mama: Diretrizes, Mamografia e Biópsia'
          ]
        },
        {
          foco: 'Emergências Oncológicas: Neutropenia Febril, Hipercalcemia e Compressão Medular',
          subfocos: [
            'Diagnóstico e Manejo da Neutropenia Febril',
            'Hipercalcemia Maligna: Mecanismos e Tratamento',
            'Fisiopatologia e Alterações Eletrolíticas da Síndrome de Lise Tumoral',
            'Compressão Medular Neoplásica: Diagnóstico e Conduta',
            'Síndrome da Veia Cava Superior'
          ]
        },
        {
          foco: 'Quimioterapia e Efeitos Adversos',
          subfocos: [
            'Toxicidade Cardíaca, Renal e Neurológica por QT',
            'Princípios de QT, Mecanismos e Biomarcadores',
            'Neutropenia Febril, Lise Tumoral e Sepse no Imunossuprimido',
            'Efeitos Adversos GI: Náuseas, Mucosite e Manejo',
            'Imunoterapia: ICIs, Efeitos Adversos e Reativação Viral'
          ]
        },
        {
          foco: 'Dor e Cuidados de Suporte',
          subfocos: [
            'Manejo da Dor Oncológica com Opióides',
            'Dor Neuropática em Pacientes Oncológicos',
            'Uso de Corticosteroides em Suporte Oncológico',
            'Náusea e Êmese por Quimioterapia'
          ]
        }
      ]
    },
    {
      tema: 'Dermatologia',
      focos: [
        {
          foco: 'Dermatoses Infecciosas',
          subfocos: [
            'Micoses Superficiais e Profundas',
            'Infecções Bacterianas Cutâneas: Impetigo, Erisipela e Celulite',
            'Infecções Virais Cutâneas: Herpes Simples e Zóster',
            'Ectoparasitoses e Infestações Cutâneas',
            'Leishmaniose Cutânea'
          ]
        },
        {
          foco: 'Dermatoses Inflamatórias',
          subfocos: [
            'Semiologia Dermatológica, Exantemas e Manifestações Cutâneas Sistêmicas',
            'Farmacodermias, DRESS e Dermatoses Bolhosas',
            'Eczemas: Dermatite Atópica, de Contato e Seborreica',
            'Psoríase: Diagnóstico, Classificação e Tratamento',
            'Doença de Anexos, Dermatoses Ocupacionais e Outras Condições',
            'Dermatoses Bolhosas Autoimunes e Não Autoimunes'
          ]
        },
        {
          foco: 'Lesões Cutâneas Malignas',
          subfocos: [
            'Melanoma: Diagnóstico, Regra ABCDE e Fatores de Risco',
            'Carcinoma Espinocelular: Diagnóstico e Tratamento',
            'Carcinoma Basocelular: Epidemiologia e Tipos',
            'Lesões Pré-Malignas, Neoplasias Benignas e Tumores Raros',
            'Melanoma: Estadiamento, Tratamento e Seguimento'
          ]
        },
        {
          foco: 'Hanseníase',
          subfocos: [
            'Formas Clínicas (Indeterminada, T, D, V)',
            'Reações Hansênicas: Tipo 1 e Tipo 2',
            'Poliquimioterapia (PQT)',
            'Prevenção de Incapacidades',
            'Classificação Operacional (PB e MB)'
          ]
        },
        {
          foco: 'Acne e Rosácea',
          subfocos: [
            'Acne Vulgar: Classificação e Apresentação Clínica',
            'Acne Vulgar: Tratamento Tópico, Sistêmico e Isotretinoína',
            'Isotretinoína e Efeitos Adversos',
            'Rosácea: Diagnóstico e Manejo',
            'Acne Conglobata e Fulminans'
          ]
        }
      ]
    },
    {
      tema: 'Medicina de Emergência',
      focos: [
        {
          foco: 'Parada Cardiorrespiratória no Adulto',
          subfocos: [
            'SAV: Algoritmos, Desfibrilação e Via Aérea Avançada',
            'SBV: Cadeia de Sobrevivência, Compressões e DEA',
            'Causas Reversíveis (5H5T) e Farmacoterapia na PCR',
            'Ritmos de PCR: Chocáveis vs Não Chocáveis',
            'Cuidados Pós-PCR: Hipotermia Terapêutica e Neuroproteção'
          ]
        },
        {
          foco: 'Choque: Reconhecimento e Protocolo Inicial',
          subfocos: [
            'Choque: Reconhecimento, Classificação e Monitorização Hemodinâmica',
            'Choque: Manejo Inicial, Fluidoterapia e Vasopressores',
            'Choque Hipovolêmico, Neurogênico e Distributivo',
            'Choque Séptico: Diagnóstico, Focos Infecciosos e Protocolo',
            'Choque Cardiogênico e Obstrutivo: Causas e Manejo',
            'Emergências Neurológicas, Hipertensivas e Situações Especiais'
          ]
        },
        {
          foco: 'Trauma: Avaliação Inicial e ATLS',
          subfocos: [
            'TCE: Avaliação, Glasgow, Lesões Específicas e HIC',
            'Avaliação Primária (ABCDE), Triagem e Classificação de Risco',
            'Trauma Torácico, Abdominal e Pélvico: Diagnóstico e Conduta',
            'Hipertermia Maligna, Lesões Tardias e Complicações do Trauma',
            'Queimaduras, Ferimentos e Traumas em Populações Especiais'
          ]
        },
        {
          foco: 'Intoxicações: Estabilização Inicial e Antídotos de Primeira Hora',
          subfocos: [
            'Opioides, CO e Agentes Químicos: Reconhecimento e Tratamento',
            'Paracetamol, Organofosforados e Antídotos Específicos',
            'Intoxicações Agudas: Diagnóstico Diferencial e Descontaminação',
            'Abstinência Alcoólica: Clínica e Manejo',
            'Lavagem Gástrica e Carvão Ativado'
          ]
        },
        {
          foco: 'POCUS: Point-of-Care Ultrasound na Emergência',
          subfocos: [
            'Avaliação Pulmonar (Pneumotórax, Derrame)',
            'Acesso Vascular Guiado por USG',
            'Avaliação Cardíaca Rápida (USG à beira-leito)'
          ]
        }
      ]
    },
    {
      tema: 'Geriatria',
      focos: [
        {
          foco: 'Síndromes Geriátricas',
          subfocos: [
            'Polifarmácia, Iatrogenia e Prescrição em Cascata',
            'Quedas, Instabilidade e Úlceras por Pressão',
            'Fragilidade e Sarcopenia Geriátrica, Diagnóstico e Manejo',
            'Alterações Fisiológicas do Envelhecimento',
            'Incontinência Urinária, Envelhecimento e Abordagem Integrada'
          ]
        },
        {
          foco: 'Delirium',
          subfocos: [
            'Identificação e Critérios Diagnósticos de Delirium',
            'Fatores Desencadeantes e Causas Precipitantes de Delirium',
            'Delirium Hipoativo vs Hiperativo',
            'Manejo Não Farmacológico do Delirium',
            'Delirium: Fisiopatologia e Mecanismos Celulares'
          ]
        },
        {
          foco: 'Avaliação Geriátrica Ampla',
          subfocos: [
            'Fragilidade, Nutrição e Escalas Geriátricas',
            'AVD Básicas e Instrumentais: Escalas e Aplicação',
            'Avaliação Cognitiva, Humor e Testes de Rastreio',
            'Avaliação de Humor e Depressão Geriátrica',
            'Avaliação de Risco de Quedas e Marcha'
          ]
        }
      ]
    },
    {
      tema: 'Toxicologia Clínica',
      focos: [
        {
          foco: 'Intoxicação por Medicamentos',
          subfocos: [
            'Isoniazida e Anti-infecciosos: Neurotoxicidade e Antídotos Específicos',
            'Digoxina, Metformina, Estatinas e Outros: Toxicidade Sistêmica',
            'Princípios de Toxicocinética: Farmacocinética, Cinética e Descontaminação',
            'Paracetamol e Salicilatos: Hepatotoxicidade, Acidose e Antídotos',
            'Antidepressivos Tricíclicos e Lítio: Cardiotoxicidade e Manejo',
            'Benzodiazepínicos, Anticonvulsivantes e Síndromes de Abstinência'
          ]
        },
        {
          foco: 'Envenenamentos',
          subfocos: [
            'Acidentes Ofídicos: Botrópico, Crotálico, Laquético e Elapídico',
            'Intoxicação por Organofosforados, Carbamatos e Clorados',
            'Intoxicação por Metais Pesados: Chumbo, Mercúrio e Outros',
            'Acidentes por Escorpiões, Lagartas e Outros Animais Peçonhentos',
            'Acidentes por Aranhas: Phoneutria, Loxosceles e Outras'
          ]
        },
        {
          foco: 'Intoxicação por Drogas de Abuso',
          subfocos: [
            'Cocaína e Anfetaminas: Toxicidade Cardiovascular, Neurológica e Sistêmica',
            'Opioides: Intoxicação Aguda, Abstinência e Naloxona',
            'Toxidromes e Sinais Clínicos: Serotoninérgica, Pupilar e Emese',
            'Sedativos, Hipnóticos e Anticolinérgicos: Intoxicação e Manejo',
            'Cannabis, Alucinógenos, Nicotina e Drogas Diversas'
          ]
        },
        {
          foco: 'Intoxicação por Agrotóxicos',
          subfocos: [
            'Organofosforados: Clínica, Diagnóstico e Síndrome Colinérgica',
            'Intoxicações por Agrotóxicos: Aspectos Gerais e Ocupacionais',
            'Pralidoxima e Atropina',
            'Paraquat, Herbicidas e Intoxicações Diversas por Agrotóxicos',
            'Organofosforados: Tratamento, Antídotos e Efeitos Tardios'
          ]
        },
        {
          foco: 'Intoxicação Alcoólica',
          subfocos: [
            'Síndrome de Abstinência Alcoólica e Delirium Tremens',
            'Intoxicação por Metanol e Etilenoglicol',
            'Encefalopatia de Wernicke-Korsakoff',
            'Diagnóstico e Manejo de Intoxicação Alcoólica Aguda',
            'Complicações Neurológicas da Abstinência Alcoólica'
          ]
        }
      ]
    },
    {
      tema: 'Nutrologia',
      focos: [
        {
          foco: 'Deficiências Vitamínicas',
          subfocos: [
            'Vitamina B12: Anemia Megaloblástica, Neurológica e Absorção',
            'Tiamina (B1): Beribéri, Wernicke-Korsakoff e Pós-Bariátrica',
            'Niacina, Complexo B e Outras Deficiências Vitamínicas',
            'Vitamina A e D: Manifestações e Metabolismo Ósseo',
            'Vitamina C, Ferro e Outros Micronutrientes'
          ]
        },
        {
          foco: 'Terapia Nutricional e Suporte',
          subfocos: [
            'Nutrição Enteral: Indicações, Vias e Formulações',
            'Nutrição Parenteral: Indicações, Complicações e Componentes',
            'Nutrição em Condições Específicas: Oncologia, Hepatopatia, DRC e Celíaca',
            'Nutrição no Paciente Crítico, Perioperatório e Fístulas',
            'Pós-Cirurgia Bariátrica e Avaliação de Necessidades Energéticas'
          ]
        },
        {
          foco: 'Obesidade',
          subfocos: [
            'Fisiopatologia, Síndromes Genéticas e Comorbidades',
            'Tratamento Farmacológico e Não Farmacológico da Obesidade',
            'Classificação e Diagnóstico por IMC e Circunferência Abdominal',
            'Medicamentos Antiobesidade (GLP-1, Orlistat)',
            'Cirurgia Bariátrica: Indicações, Técnicas e Populações Especiais'
          ]
        },
        {
          foco: 'Desnutrição',
          subfocos: [
            'Avaliação Nutricional: Marcadores, Antropometria e Triagem',
            'Desnutrição Proteico-Energética: Kwashiorkor e Marasmo',
            'Metabolismo, Adaptação à Inanição e Sarcopenia',
            'Nutrição em Doenças Crônicas, Cirurgias e Condições Específicas',
            'Terapia Nutricional: Suporte Oral e Enteral'
          ]
        },
        {
          foco: 'Síndrome de Realimentação: Identificação de Risco e Prevenção',
          subfocos: [
            'Fisiopatologia e Manifestações Clínicas da SR',
            'Identificação de Pacientes de Risco para SR',
            'Monitorização e Progressão Calórica',
            'Prevenção e Manejo Inicial da SR',
            'Reposição de Fósforo e Eletrólitos'
          ]
        },
        {
          foco: 'Transtornos Alimentares no Adulto',
          subfocos: [
            'Anorexia Nervosa: Diagnóstico, Fisiopatologia e Achados',
            'Bulimia Nervosa: Diagnóstico e Sinais',
            'Anorexia Nervosa: Manejo Clínico e Complicações',
            'Bulimia Nervosa: Abordagem Terapêutica'
          ]
        }
      ]
    },
    {
      tema: 'Terapia Intensiva',
      focos: [
        {
          foco: 'Sepse e Choque Séptico: Bundles de 1 e 3 Horas, Fonte e Metas',
          subfocos: [
            'Bundle de 1 Hora: Avaliação e Intervenção Inicial',
            'Definição e Critérios Diagnósticos (Sepsis-3)',
            'Bundle de 3 Horas: Ressuscitação Volêmica e Hemodinâmica',
            'Sepse: Avaliação Distúrbios Ácido-Básicos',
            'Controle de Fonte Infecciosa'
          ]
        },
        {
          foco: 'Ventilação Mecânica',
          subfocos: [
            'Desmame Ventilatório e Falência Respiratória',
            'Indicações de IOT e Modos Ventilatórios Básicos',
            'PEEP, FiO2 e Monitorização de Curvas/Gasometria',
            'Modos Avançados: PSV, SIMV e Outros',
            'Complicações da Ventilação Mecânica'
          ]
        },
        {
          foco: 'Choque: Vasopressores, Monitorização Avançada e Metas Hemodinâmicas',
          subfocos: [
            'Metas de Ressuscitação e Vasopressores',
            'Choque Cardiogênico e Distributivo: Causas e Abordagem',
            'Monitorização Hemodinâmica: PAI, POCUS e Parâmetros',
            'Choque Hipovolêmico e Cenários Específicos de Choque',
            'Choque Séptico: Diagnóstico, Manejo Inicial e IRA'
          ]
        },
        {
          foco: 'Síndrome do Desconforto Respiratório Agudo (SDRA)',
          subfocos: [
            'Manejo Ventilatório Protetor na SDRA',
            'Critérios Diagnósticos e Classificação da SDRA (Berlin)',
            'Fisiopatologia da SDRA',
            'Ventilação Protetora e Prona',
            'ECMO e Terapias de Resgate'
          ]
        },
        {
          foco: 'Suporte Hemodinâmico',
          subfocos: [
            'Avaliação e Reposição Volêmica',
            'Manejo de Choque Séptico e Vasopressores',
            'Suporte Inotrópico e Vasodilatador',
            'Hipertensão Intra-abdominal: Diagnóstico e Tratamento',
            'PAM Alvo e Lactato'
          ]
        },
        {
          foco: 'Sedação e Analgesia',
          subfocos: [
            'Farmacologia e Uso de Sedativos',
            'Escalas de Avaliação de Sedação e Consciência',
            'RASS e BPS'
          ]
        }
      ]
    },
    {
      tema: 'Psiquiatria',
      focos: [
        {
          foco: 'Transtornos de Humor',
          subfocos: [
            'Antidepressivos: ISRS, Outros Fármacos e Manejo de Efeitos Adversos',
            'Depressão Maior: Diagnóstico, Distimia e Critérios',
            'Transtorno Bipolar: Diagnóstico, Mania e Diferencial',
            'Estabilizadores de Humor e Tratamento do Bipolar',
            'Transtornos de Personalidade e Outros Transtornos de Humor'
          ]
        },
        {
          foco: 'Transtornos de Ansiedade',
          subfocos: [
            'Transtorno do Pânico, Fobias e Agorafobia',
            'TOC e TEPT: Diagnóstico e Tratamento',
            'TAG: Diagnóstico, Critérios e Apresentação',
            'Transtornos Somáticos, Burnout e Insônia',
            'TAG e Ansiedade: Tratamento Farmacológico e BZDs'
          ]
        },
        {
          foco: 'Dependência Química',
          subfocos: [
            'Alcoolismo: Síndrome de Abstinência e Tratamento',
            'Dependência de Álcool: Diagnóstico e Critérios',
            'Dependência de Estimulantes, Maconha e Outras Substâncias',
            'Tabagismo: Avaliação, Cessação e Farmacoterapia',
            'Dependência de Benzodiazepínicos: Clínica e Abstinência'
          ]
        },
        {
          foco: 'Esquizofrenia e Transtornos Psicóticos',
          subfocos: [
            'Esquizofrenia: Diagnóstico, Sintomas e Critérios DSM-5',
            'Antipsicóticos: Típicos, Atípicos e Escolha Terapêutica',
            'Síndrome Neuroléptica Maligna, Discinesia Tardia e Efeitos Adversos',
            'Primeiro Episódio Psicótico, Catatonia e Outros Transtornos',
            'Sintomas Negativos e Reabilitação'
          ]
        },
        {
          foco: 'Risco de Suicídio e Manejo de Crise: Avaliação e Medidas de Segurança',
          subfocos: [
            'Avaliação de Risco Suicida: Fatores e Métodos',
            'Manejo de Crise Suicida: Medidas de Segurança',
            'Internação Psiquiátrica para Risco Suicida'
          ]
        }
      ]
    },
    {
      tema: 'Cuidados Paliativos',
      focos: [
        {
          foco: 'Cuidados de Fim de Vida',
          subfocos: [
            'Identificação e Indicação de Cuidados Paliativos',
            'Controle de Sintomas (Dor, Dispneia, Náusea)',
            'Sedação Paliativa',
            'Diretivas Antecipadas de Vontade',
            'Comunicação de Más Notícias (SPIKES)'
          ]
        },
        {
          foco: 'Controle de Sintomas',
          subfocos: [
            'Manejo da Dispneia em Doenças Avançadas',
            'Cuidados Paliativos Pediátricos e Familiares',
            'Manejo da Constipação e Obstrução Intestinal',
            'Manejo de Náuseas e Vômitos',
            'Avaliação e Manejo do Delirium'
          ]
        },
        {
          foco: 'Controle da Dor',
          subfocos: [
            'Manejo de Opioides: Uso, Titulação e Toxicidade',
            'Escada Analgésica da OMS: Princípios e Aplicação',
            'Dor Neuropática: Fisiopatologia e Tratamento',
            'Escalas de Dor e Avaliação',
            'Adjuvantes Analgésicos'
          ]
        },
        {
          foco: 'Comunicação e Aspectos Éticos',
          subfocos: [
            'Tomada de Decisão Compartilhada e Autonomia do Paciente',
            'Comunicação de Más Notícias: Protocolo SPIKES',
            'Princípios Éticos e Filosóficos dos Cuidados Paliativos',
            'Diretivas Antecipadas de Vontade e Testamento Vital',
            'Conferência Familiar'
          ]
        },
        {
          foco: 'Suporte à Família e Luto',
          subfocos: [
            'Suporte à Família e Rede Social',
            'Fases e Tipos de Luto',
            'Luto Complicado'
          ]
        }
      ]
    },
    {
      tema: 'Alergia e Imunologia',
      focos: [
        {
          foco: 'Anafilaxia e Manejo Agudo: Adrenalina IM e Alta Segura',
          subfocos: [
            'Adrenalina IM: Primeira Linha no Manejo Agudo',
            'Critérios Diagnósticos e Reconhecimento da Anafilaxia',
            'Tratamento Adjuvante: Corticoides e Anti-histamínicos',
            'Dessensibilização'
          ]
        },
        {
          foco: 'Reações de Hipersensibilidade (Tipos I a IV)',
          subfocos: [
            'Reações de Hipersensibilidade Tipo I: Anafilaxia e Alergias Agudas',
            'Reações de Hipersensibilidade Tipo IV: Tardias e Celulares',
            'Alergias Alimentares Específicas',
            'Reações de Hipersensibilidade Tipo III: Imunocomplexos',
            'Reações de Hipersensibilidade Tipo II: Citotóxicas'
          ]
        },
        {
          foco: 'Imunodeficiências e Imunologia Básica',
          subfocos: [
            'Imunologia Geral: Células, Citocinas e Respostas Imunes',
            'Imunodeficiências Primárias: Sinais de Alerta e Classificação',
            'HIV/AIDS: Diagnóstico, Manifestações, Tratamento e Profilaxia',
            'Imunodeficiências Primárias: Autoimunidade, Tratamento e TMO'
          ]
        },
        {
          foco: 'Rinite Alérgica',
          subfocos: [
            'Diagnóstico e Classificação da Rinite Alérgica',
            'Tratamento Farmacológico da Rinite Alérgica',
            'Prevenção e Controle de Doenças Alérgicas'
          ]
        },
        {
          foco: 'Urticária e Angioedema no Adulto',
          subfocos: [
            'Angioedema Adquirido: Causas e Manejo',
            'Tratamento Farmacológico de Urticária e Angioedema',
            'Urticária e Angioedema: Manifestações e Diagnóstico',
            'Angioedema Hereditário: Fisiopatologia e Subtipos',
            'Urticária Crônica: Diagnóstico e Classificação',
            'Urticária Aguda: Etiologia e Desencadeantes'
          ]
        }
      ]
    },
    {
      tema: 'Ética e Bioética',
      focos: [
        {
          foco: 'Bioética Clínica: Autonomia, Beneficência e Dilemas',
          subfocos: [
            'Recusa de Tratamento e Autonomia',
            'Alocação de Recursos e Equidade em Saúde',
            'Comunicação do Diagnóstico e Autonomia do Paciente',
            'Objeção de Consciência',
            'Negociação de Exames e Medo do Paciente'
          ]
        },
        {
          foco: 'Consentimento Informado',
          subfocos: [
            'Princípios do Consentimento Informado e Autonomia',
            'Recusa de Tratamento: Autonomia e Convicções Religiosas',
            'Comunicação de Diagnóstico, Prognóstico e Modelos de Relação',
            'Capacidade Civil e Decisória',
            'Recusa de Tratamento em Pacientes Incapazes ou Vulneráveis'
          ]
        },
        {
          foco: 'Código de Ética Médica: Aplicação na Prática Clínica',
          subfocos: [
            'Princípios Éticos: Autonomia, Consentimento e Deveres Médicos',
            'Morte Encefálica, Cuidados Paliativos e Terminalidade',
            'Prescrição, Atestados, Erros e Uso Indevido de Substâncias',
            'Sigilo, Confidencialidade e Processo Ético-Profissional',
            'Relação Médico-Paciente: Comunicação, Vínculo e Limites'
          ]
        },
        {
          foco: 'Sigilo e Confidencialidade',
          subfocos: [
            'Sigilo Médico: Situações Específicas',
            'Sigilo Médico em Pacientes Maiores de Idade',
            'Sigilo Médico em Pacientes Menores de Idade',
            'Prontuário Médico: Acesso e Conteúdo',
            'Notificação Compulsória e Exceções'
          ]
        }
      ]
    },
    {
      tema: 'Otorrinolaringologia',
      focos: [
        {
          foco: 'Vertigem e Doenças do Labirinto',
          subfocos: [
            'Vertigem Posicional Paroxística Benigna (VPPB): Diagnóstico e Manobras',
            'Vertigem Aguda: Diagnóstico Diferencial (Periférica vs. Central)',
            'Doença de Ménière: Clínica e Diagnóstico',
            'Tratamento Sintomático e Farmacológico da Vertigem',
            'Manobra de Epley'
          ]
        },
        {
          foco: 'Otites e Infecções do Ouvido',
          subfocos: [
            'Audiologia: Testes, Hipoacusia e PAIR',
            'Otite Externa, Cerúmen e Lesões Auriculares',
            'Otite Média Aguda: Diagnóstico, Etiologia e Tratamento',
            'Otite Média com Efusão e Complicações',
            'Paralisia Facial, Glândula Parótida e Manifestações Atípicas'
          ]
        },
        {
          foco: 'Rinossinusites',
          subfocos: [
            'Rinossinusite Aguda: Diagnóstico, Etiologia e Antibioticoterapia',
            'Patologia Nasossinusal, Sinusal e Otalgia Referida',
            'Complicações da Rinossinusite e Diagnóstico por Imagem',
            'Rinossinusite Fúngica'
          ]
        },
        {
          foco: 'Faringoamigdalites',
          subfocos: [
            'Faringite Viral e Diagnóstico Diferencial',
            'Amigdalite Bacteriana: Tratamento e Falha Terapêutica',
            'Abscesso Periamigdaliano',
            'Apneia Obstrutiva do Sono e Otorrino',
            'Faringite Bacteriana Aguda: Diagnóstico e Critérios'
          ]
        },
        {
          foco: 'Epistaxe',
          subfocos: [
            'Epistaxe: Tamponamento Nasal',
            'Cauterização e Tamponamento',
            'Epistaxe: Etiologia e Classificação',
            'Epistaxe: Manejo Inicial e Urgência'
          ]
        },
        {
          foco: 'Corpos Estranhos em Vias Aéreas',
          subfocos: [
            'Corpo Estranho em Vias Aéreas Superiores: Causas e Diagnóstico',
            'Corpo Estranho em Esôfago: Conduta e Remoção'
          ]
        }
      ]
    },
    {
      tema: 'Oftalmologia',
      focos: [
        {
          foco: 'Retinopatias e Doenças da Retina',
          subfocos: [
            'Retinopatia Diabética: Achados e Classificação',
            'Retinopatias Infecciosas e Inflamatórias',
            'Oclusão da Artéria Central da Retina',
            'Oftalmopercepção: Etiologia e Diagnóstico',
            'Oclusão de Veia Central da Retina'
          ]
        },
        {
          foco: 'Glaucoma',
          subfocos: [
            'Glaucoma Agudo de Ângulo Fechado: Apresentação Clínica e Emergência',
            'Tonometria e Diagnóstico',
            'Glaucoma Primário de Ângulo Aberto: Fatores de Risco e Epidemiologia',
            'Tratamento Medicamentoso (Colírios)'
          ]
        },
        {
          foco: 'Traumas Oculares',
          subfocos: [
            'Queimadura Química Ocular',
            'Trauma Contuso e Perfurante',
            'Exposição a \'Flash\' de Solda',
            'Corpo Estranho Ocular (Não Químico)'
          ]
        },
        {
          foco: 'Olho Vermelho e Conjuntivites',
          subfocos: [
            'Conjuntivite: Diagnóstico Diferencial e Agentes Etiológicos',
            'Olho Vermelho: Sintomas Inespecíficos e Avaliação Inicial',
            'Conjuntivite Viral: Quadro Clínico e Complicações',
            'Conjuntivite Bacteriana: Tratamento',
            'Conjuntivite Alérgica: Etiologia e Clínica',
            'Conjuntivite Crônica e Trauma'
          ]
        },
        {
          foco: 'Catarata e Cristalino',
          subfocos: [
            'Causas de Visão Turva',
            'Indicação e Técnica de Facectomia',
            'Exames e Manifestações de Doenças Lacrimais'
          ]
        },
        {
          foco: 'Uveítes e Doenças Inflamatórias',
          subfocos: [
            'Uveíte Anterior: Etiologia e Diagnóstico',
            'Uveíte e Doenças Sistêmicas',
            'Doenças Inflamatórias Palpebrais',
            'Tratamento Imunossupressor em Uveítes'
          ]
        }
      ]
    },
    {
      tema: 'Medicina Esportiva',
      focos: [
        {
          foco: 'Avaliação do Atleta',
          subfocos: [
            'Avaliação Pré-Participação: Esportes Críticos e Liberação',
            'Fisiologia do Exercício: VO2 max e Resposta Cardiovascular',
            'Eletrocardiograma (ECG) no Atleta: Achados Normais e Patológicos',
            'Condições Específicas em Mulheres Atletas',
            'Teste Ergométrico (TE): Indicações e Interpretação'
          ]
        },
        {
          foco: 'Lesões Esportivas',
          subfocos: [
            'Lesões Ligamentares e Tendíneas',
            'Lesões Musculares Induzidas por Exercício',
            'Radiculopatia e Compressão Nervosa',
            'Fraturas por Estresse e Baixa Densidade Óssea'
          ]
        }
      ]
    }
  ]
};
