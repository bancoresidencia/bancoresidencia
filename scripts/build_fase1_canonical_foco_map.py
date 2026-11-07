"""
Fase 1: Construtor da Matriz Canonica De-Para de Focos
Gera data/staging/mapa_mesclagem_focos_canonica.json
com 100% de cobertura sobre os 1.546 focos ativos.
"""

import json, os, sys, re, unicodedata
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r'd:\bancoresidencia\data'
STAGING_DIR = os.path.join(DATA_DIR, 'staging')
OUTPUT_PATH = os.path.join(STAGING_DIR, 'mapa_mesclagem_focos_canonica.json')

FILES = [
    'medicina_preventiva_final_questions.json',
    'pediatria_final_questions.json',
    'cirurgia_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'clinica_medica_final_questions.json'
]

def norm(text):
    if not text:
        return ''
    t = unicodedata.normalize('NFD', str(text))
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def split_camel_case(s):
    # Insere espaco entre minuscula/digito e maiuscula
    s1 = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', s)
    # Trata siglas seguidas de palavra: ex "DM2Tipo" -> "DM2 Tipo"
    s2 = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s1)
    return s2.strip()

# Dicionario Canônico Padronizado por Tema/Especialidade
# Mapeamentos diretos de sinonimos, acronimos e normalizacao ortografica
CANONICAL_SYNONYMS = {
    # Cardiologia
    'iamcsst': 'Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)',
    'iam com supra': 'Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)',
    'infarto agudo do miocardio com supradesnivelamento de st': 'Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)',
    'infarto agudo do miocardio com supra': 'Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)',
    'iamssst': 'Síndrome Coronariana Aguda sem Supra de ST (SCASSST)',
    'iam sem supra': 'Síndrome Coronariana Aguda sem Supra de ST (SCASSST)',
    'sindrome coronariana aguda sem supra': 'Síndrome Coronariana Aguda sem Supra de ST (SCASSST)',
    'sindrome coronariana aguda sem supradesnivelamento de st': 'Síndrome Coronariana Aguda sem Supra de ST (SCASSST)',
    'angina instavel': 'Síndrome Coronariana Aguda sem Supra de ST (SCASSST)',
    'angina estavel': 'Doença Arterial Coronariana Crônica e Angina Estável',
    'has': 'Hipertensão Arterial Sistêmica (HAS)',
    'hipertensao arterial sistemica': 'Hipertensão Arterial Sistêmica (HAS)',
    'hipertensao arterial': 'Hipertensão Arterial Sistêmica (HAS)',
    'crise hipertensiva': 'Crise Hipertensiva (Urgência e Emergência Hipertensiva)',
    'insuficiencia cardiaca': 'Insuficiência Cardíaca (IC)',
    'insuficiencia cardiaca com fracao de ejecao reduzida': 'Insuficiência Cardíaca (IC)',
    'insuficiencia cardiaca descompensada': 'Insuficiência Cardíaca Descompensada (IC Aguda)',
    'edema agudo de pulmao': 'Insuficiência Cardíaca Descompensada (IC Aguda)',
    'fibrilacao atrial': 'Fibrilação Atrial e Flutter Atrial',
    'flutter atrial': 'Fibrilação Atrial e Flutter Atrial',
    'taquicardia supraventricular': 'Taquiarritmias Supraventriculares',
    'taquiarritmias': 'Taquiarritmias Supraventriculares',
    'bradiarritmias e bloqueios': 'Bradiarritmias e Bloqueios Atrioventriculares (BAV)',
    'bloqueio atrioventricular': 'Bradiarritmias e Bloqueios Atrioventriculares (BAV)',
    'parada cardiorrespiratoria': 'Parada Cardiorrespiratória e Ressuscitação (PCR / ACLS)',
    'acls': 'Parada Cardiorrespiratória e Ressuscitação (PCR / ACLS)',
    'suporte avancado de vida': 'Parada Cardiorrespiratória e Ressuscitação (PCR / ACLS)',
    'endocardite infecciosa': 'Endocardite Infecciosa',
    'estenose aortica': 'Valvopatias (Estenose e Insuficiência Aórtica / Mitral)',
    'insuficiencia mitral': 'Valvopatias (Estenose e Insuficiência Aórtica / Mitral)',
    'pericardite aguda': 'Doenças do Pericárdio (Pericardite e Tamponamento Cardíaco)',
    'tamponamento cardiaco': 'Doenças do Pericárdio (Pericardite e Tamponamento Cardíaco)',
    'disseccao de aorta': 'Doenças da Aorta (Dissecção e Aneurismas)',
    'aneurisma de aorta': 'Doenças da Aorta (Dissecção e Aneurismas)',

    # Pneumologia
    'dpoc': 'Doença Pulmonar Obstrutiva Crônica (DPOC)',
    'doenca pulmonar obstrutiva cronica': 'Doença Pulmonar Obstrutiva Crônica (DPOC)',
    'asma': 'Asma Brônquica',
    'asma bronquica': 'Asma Brônquica',
    'tep': 'Tromboembolismo Pulmonar (TEP)',
    'tromboembolismo pulmonar': 'Tromboembolismo Pulmonar (TEP)',
    'embolia pulmonar': 'Tromboembolismo Pulmonar (TEP)',
    'pneumonia adquirida na comunidade': 'Pneumonia Adquirida na Comunidade (PAC)',
    'pac': 'Pneumonia Adquirida na Comunidade (PAC)',
    'pneumonia nosocomial': 'Pneumonia Nosocomial e Associada à Ventilação Mecânica (PAV)',
    'pav': 'Pneumonia Nosocomial e Associada à Ventilação Mecânica (PAV)',
    'derrame pleural': 'Derrame Pleural e Empiema',
    'tuberculose': 'Tuberculose Pulmonar e Extrapulmonar',
    'cancer de pulmao': 'Neoplasias Pulmonares (Câncer de Pulmão)',

    # Endocrinologia
    'dm1': 'Diabetes Mellitus Tipo 1 (DM1)',
    'diabetes mellitus tipo 1': 'Diabetes Mellitus Tipo 1 (DM1)',
    'dm2': 'Diabetes Mellitus Tipo 2 (DM2)',
    'diabetes mellitus tipo 2': 'Diabetes Mellitus Tipo 2 (DM2)',
    'diabetes mellitus': 'Diabetes Mellitus Tipo 2 (DM2)',
    'cetoacidose diabetica': 'Emergências Hiperglicêmicas (CAD e EHH)',
    'estado hiperosmolar hiperglicemico': 'Emergências Hiperglicêmicas (CAD e EHH)',
    'hipotireoidismo': 'Hipotireoidismo e Tireoidites',
    'tireotoxicose e hipertireoidismo': 'Hipertireoidismo e Tireotoxicose',
    'nodulo de tireoide': 'Nódulos e Neoplasias de Tireoide',
    'osteoporose': 'Osteoporose e Doenças Osteometabólicas',
    'sindrome de cushing': 'Doenças da Adrenal (Cushing, Addison e Feocromocitoma)',
    'insuficiencia adrenal': 'Doenças da Adrenal (Cushing, Addison e Feocromocitoma)',

    # Gastroenterologia & Hepatologia
    'drge': 'Doença do Refluxo Gastroesofágico (DRGE)',
    'doenca do refluxo gastroesofagico': 'Doença do Refluxo Gastroesofágico (DRGE)',
    'ulcera peptica': 'Úlcera Péptica e Infecção por H. pylori',
    'hda': 'Hemorragia Digestiva Alta (HDA)',
    'hemorragia digestiva alta': 'Hemorragia Digestiva Alta (HDA)',
    'hdb': 'Hemorragia Digestiva Baixa (HDB)',
    'hemorragia digestiva baixa': 'Hemorragia Digestiva Baixa (HDB)',
    'pancreatite aguda': 'Pancreatite Aguda',
    'pancreatite cronica': 'Pancreatite Crônica',
    'cirrose hepatica': 'Cirrose Hepática e Hipertensão Portal',
    'hipertensao portal': 'Cirrose Hepática e Hipertensão Portal',
    'ascite e pbe': 'Complicações da Cirrose (Ascite, PBE e Encefalopatia)',
    'encefalopatia hepatica': 'Complicações da Cirrose (Ascite, PBE e Encefalopatia)',
    'hepatite a': 'Hepatites Virais Agudas e Crônicas (A, B, C, D, E)',
    'hepatite b': 'Hepatites Virais Agudas e Crônicas (A, B, C, D, E)',
    'hepatite c': 'Hepatites Virais Agudas e Crônicas (A, B, C, D, E)',
    'doencas inflamatorias intestinais': 'Doença Inflamatória Intestinal (Doença de Crohn e RCU)',
    'doenca de crohn': 'Doença Inflamatória Intestinal (Doença de Crohn e RCU)',
    'retocolite ulcerativa': 'Doença Inflamatória Intestinal (Doença de Crohn e RCU)',

    # Nefrologia
    'ira': 'Injúria Renal Aguda (IRA / LRA)',
    'lra': 'Injúria Renal Aguda (IRA / LRA)',
    'lesao renal aguda': 'Injúria Renal Aguda (IRA / LRA)',
    'injuria renal aguda': 'Injúria Renal Aguda (IRA / LRA)',
    'drc': 'Doença Renal Crônica (DRC)',
    'doenca renal cronica': 'Doença Renal Crônica (DRC)',
    'itu': 'Infecção do Trato Urinário (ITU)',
    'infeccao do trato urinario': 'Infecção do Trato Urinário (ITU)',
    'pielonefrite': 'Infecção do Trato Urinário (ITU)',
    'sindrome nefrotica': 'Síndrome Nefrótica e Glomerulopatias',
    'sindrome nefritica': 'Síndrome Nefrítica e Glomerulonefrites',
    'gnda': 'Síndrome Nefrítica e Glomerulonefrites',
    'disturbios do potassio': 'Distúrbios do Potássio (Hipo e Hipercalemia)',
    'hipercalemia': 'Distúrbios do Potássio (Hipo e Hipercalemia)',
    'hipocalemia': 'Distúrbios do Potássio (Hipo e Hipercalemia)',
    'disturbios do sodio': 'Distúrbios do Sódio (Hipo e Hipernatremia)',
    'hiponatremia': 'Distúrbios do Sódio (Hipo e Hipernatremia)',
    'hipernatremia': 'Distúrbios do Sódio (Hipo e Hipernatremia)',
    'disturbios acido base': 'Distúrbios do Equilíbrio Ácido-Base',
    'acidose metabolica': 'Distúrbios do Equilíbrio Ácido-Base',
    'alcalose metabolica': 'Distúrbios do Equilíbrio Ácido-Base',

    # Neurologia
    'avc': 'Acidente Vascular Cerebral (AVC)',
    'avci': 'Acidente Vascular Cerebral Isquêmico (AVCI)',
    'avc isquemico': 'Acidente Vascular Cerebral Isquêmico (AVCI)',
    'acidente vascular cerebral isquemico': 'Acidente Vascular Cerebral Isquêmico (AVCI)',
    'avch': 'Acidente Vascular Cerebral Hemorrágico (AVCH)',
    'avc hemorragico': 'Acidente Vascular Cerebral Hemorrágico (AVCH)',
    'hemorragia subaracnoidea': 'Hemorragia Subaracnóidea (HSA) e Aneurismas Intracranianos',
    'hsa': 'Hemorragia Subaracnóidea (HSA) e Aneurismas Intracranianos',
    'cefaleia': 'Cefaleias Primárias (Enxaqueca, Tensional e Salvas)',
    'enxaqueca': 'Cefaleias Primárias (Enxaqueca, Tensional e Salvas)',
    'epilepsia': 'Epilepsia e Crises Epilépticas',
    'estado de mal epileptico': 'Epilepsia e Crises Epilépticas',
    'meningite': 'Meningites e Encefalites Infecciosas',
    'meningite bacteriana': 'Meningites e Encefalites Infecciosas',
    'delirium': 'Delirium e Estados Confusionais Agudos',
    'demencia': 'Demências e Doença de Alzheimer',

    # Hematologia
    'anemia ferropriva': 'Anemias Microcíticas e Carenciais (Ferropriva e Doença Crônica)',
    'anemia megaloblastica': 'Anemias Macrocíticas e Megaloblásticas',
    'anemia falciforme': 'Hemoglobinopatias e Anemia Falciforme',
    'anemias hemoliticas': 'Anemias Hemolíticas Autoimunes e Hereditárias',
    'mieloma multiplo': 'Gamopatias Monoclonais e Mieloma Múltiplo',
    'linfoma': 'Linfomas (Hodgkin e Não-Hodgkin)',
    'leucemia': 'Leucemias Agudas e Crônicas',
    'pti': 'Púrpuras e Plaquetopenias (PTI / PTT)',
    'hemofilia': 'Distúrbios da Coagulação e Hemofilias',
    'transfusao sanguinea': 'Medicina Transfusional e Reações Hemolíticas',

    # Reumatologia
    'artrite reumatoide': 'Artrite Reumatoide (AR)',
    'ar': 'Artrite Reumatoide (AR)',
    'lupus': 'Lúpus Eritematoso Sistêmico (LES)',
    'les': 'Lúpus Eritematoso Sistêmico (LES)',
    'espondiloartrites': 'Espondiloartrites e Espondilite Anquilosante',
    'vasculites': 'Vasculites Sistêmicas',
    'gota': 'Artrites Microcristalinas (Gota e Pseudogota)',
    'esclerose sistemica': 'Esclerose Sistêmica e Doenças do Tecido Conjuntivo',
    'fibromialgia': 'Fibromialgia e Síndromes Dolorosas Crônicas',

    # Infectologia
    'hiv': 'Infecção pelo HIV e Síndrome da Imunodeficiência Adquirida (AIDS)',
    'aids': 'Infecção pelo HIV e Síndrome da Imunodeficiência Adquirida (AIDS)',
    'dengue': 'Arboviroses (Dengue, Zika, Chikungunya e Febre Amarela)',
    'arboviroses': 'Arboviroses (Dengue, Zika, Chikungunya e Febre Amarela)',
    'sepse': 'Sepse e Choque Séptico',
    'choque septico': 'Sepse e Choque Séptico',
    'covid 19': 'COVID-19 e Síndromes Gripais',
    'leishmaniose': 'Leishmanioses (Tegumentar e Visceral)',
    'malaria': 'Malária e Protozooses Tropicais',
    'chagas': 'Doença de Chagas e Tripanossomíases',

    # Cirurgia Geral
    'apendicite': 'Apendicite Aguda',
    'apendicite aguda': 'Apendicite Aguda',
    'colecistite': 'Colecistite Aguda e Doenças Biliares',
    'colelitíase': 'Colelitíase e Coledocolitíase',
    'coledocolitiase': 'Colelitíase e Coledocolitíase',
    'diverticulite': 'Diverticulite Aguda e Doença Diverticular do Cólon',
    'diverticulite aguda': 'Diverticulite Aguda e Doença Diverticular do Cólon',
    'obstrucao intestinal': 'Abdome Agudo Obstrutivo (Obstrução Intestinal e Volvo)',
    'volvo de sigmoide': 'Abdome Agudo Obstrutivo (Obstrução Intestinal e Volvo)',
    'hernia inguinal': 'Hérnias da Parede Abdominal (Inguinal, Crural, Incisional e Umbilical)',
    'hernia femoral': 'Hérnias da Parede Abdominal (Inguinal, Crural, Incisional e Umbilical)',
    'hernia crural': 'Hérnias da Parede Abdominal (Inguinal, Crural, Incisional e Umbilical)',
    'hernia incisional': 'Hérnias da Parede Abdominal (Inguinal, Crural, Incisional e Umbilical)',
    'hernia umbilical': 'Hérnias da Parede Abdominal (Inguinal, Crural, Incisional e Umbilical)',
    'trauma toracico': 'Trauma Torácico e Drenagem Pleural',
    'pneumotorax hipertensivo': 'Trauma Torácico e Drenagem Pleural',
    'trauma abdominal': 'Trauma Abdominal e Pélvico',
    'tce': 'Traumatismo Cranioencefálico (TCE)',
    'traumatismo cranioencefalico': 'Traumatismo Cranioencefálico (TCE)',
    'politraumatizado': 'Atendimento Inicial ao Politraumatizado (ATLS)',
    'atls': 'Atendimento Inicial ao Politraumatizado (ATLS)',
    'queimaduras': 'Queimaduras e Atendimento ao Paciente Queimado',
    'cancer colorretal': 'Câncer Colorretal e Pólipos Intestinais',
    'cancer gastrico': 'Câncer Gástrico',
    'cicatrizacao e feridas': 'Cicatrização, Feridas e Infecção de Sítio Cirúrgico (ISC)',
    'infeccao de sitio cirurgico': 'Cicatrização, Feridas e Infecção de Sítio Cirúrgico (ISC)',
    'pre operatorio': 'Avaliação Pré-Operatória e Risco Cirúrgico',
    'risco cirurgico': 'Avaliação Pré-Operatória e Risco Cirúrgico',
    'pos operatorio': 'Complicações Pós-Operatórias e Resposta Metabólica ao Trauma (REMIT)',
    'anestesia geral': 'Anestesiologia e Farmacologia dos Anestésicos',
    'bloqueios anestesicos': 'Anestesiologia e Anestesia Regional (Raqui e Peridural)',

    # Ginecologia
    'cancer de mama': 'Câncer de Mama e Rastreamento Mamográfico',
    'cancer de colo de utero': 'Câncer de Colo Uterino e Lesões Precursoras (HPV / Citologia)',
    'hpv': 'Infecção pelo HPV e Rastreamento do Câncer Cervical',
    'miomatose uterina': 'Miomatose Uterina e Pólipos Endometriais',
    'endometriose': 'Endometriose e Adenomiose',
    'sop': 'Síndrome dos Ovários Policísticos (SOP)',
    'sindrome dos ovarios policisticos': 'Síndrome dos Ovários Policísticos (SOP)',
    'sangramento uterino anormal': 'Sangramento Uterino Anormal (Classificação PALM-COEIN)',
    'palm coein': 'Sangramento Uterino Anormal (Classificação PALM-COEIN)',
    'anticoncepcao': 'Planejamento Familiar e Métodos Anticoncepcionais',
    'diu': 'Planejamento Familiar e Métodos Anticoncepcionais',
    'climaterio': 'Climatério, Menopausa e Terapia de Reposição Hormonal (TRH)',
    'vulvovaginites': 'Vulvovaginites e Vaginose Bacteriana',
    'candidíase': 'Vulvovaginites e Vaginose Bacteriana',
    'dip': 'Doença Inflamatória Pélvica (DIP)',
    'doenca inflamatoria pelvica': 'Doença Inflamatória Pélvica (DIP)',
    'incontinencia urinaria': 'Incontinência Urinária e Prolapso de Órgãos Pélvicos',
    'prolapso uterino': 'Incontinência Urinária e Prolapso de Órgãos Pélvicos',

    # Obstetrícia
    'pre eclampsia': 'Síndromes Hipertensivas da Gestação (Pré-Eclâmpsia e Eclâmpsia)',
    'eclâmpsia': 'Síndromes Hipertensivas da Gestação (Pré-Eclâmpsia e Eclâmpsia)',
    'sindrome hellp': 'Síndromes Hipertensivas da Gestação (Pré-Eclâmpsia e Eclâmpsia)',
    'diabetes gestacional': 'Diabetes Mellitus Gestacional (DMG)',
    'dmg': 'Diabetes Mellitus Gestacional (DMG)',
    'parto prematuro': 'Trabalho de Parto Prematuro (TPP) e Tocolise',
    'tpp': 'Trabalho de Parto Prematuro (TPP) e Tocolise',
    'rpmo': 'Rotura Prematura de Membranas Ovulares (RPMO)',
    'rotura prematura de membranas': 'Rotura Prematura de Membranas Ovulares (RPMO)',
    'abortamento': 'Sangramento de Primeira Metade: Abortamento e Tipos Clínicos',
    'gestacao ectopica': 'Sangramento de Primeira Metade: Gestação Ectópica',
    'doenca trofoblastica': 'Sangramento de Primeira Metade: Doença Trofoblástica Gestacional (Mola)',
    'dpp': 'Sangramento de Segunda Metade: Descolamento Prematuro de Placenta (DPP)',
    'descolamento prematuro de placenta': 'Sangramento de Segunda Metade: Descolamento Prematuro de Placenta (DPP)',
    'placenta previa': 'Sangramento de Segunda Metade: Placenta Prévia e Acretismo Placentário',
    'hemorragia pos parto': 'Hemorragia Pós-Parto (HPP) e Atonia Uterina',
    'assistencia ao parto': 'Mecanismo do Parto, Fases Clínicas e Assistência ao Trabalho de Parto',
    'partograma': 'Partograma e Distocias do Trabalho de Parto',
    'vitalidade fetal': 'Avaliação da Vitalidade Fetal (Cardiotocografia e Doppler)',
    'sifilis na gestacao': 'Infecções Congênitas e Sífilis Gestacional',
    'hiv na gestacao': 'Infecções na Gestação (HIV, Toxoplasmose e CMV)',

    # Pediatria
    'aleitamento materno': 'Aleitamento Materno e Alimentação Complementar',
    'amamentacao': 'Aleitamento Materno e Alimentação Complementar',
    'crescimento': 'Crescimento e Desenvolvimento Infantil (Marcos DNPM e Curvas OMS)',
    'desenvolvimento neuropsicomotor': 'Crescimento e Desenvolvimento Infantil (Marcos DNPM e Curvas OMS)',
    'vacinacao': 'Imunizações e Calendário Vacinal do PNI',
    'imunizacoes': 'Imunizações e Calendário Vacinal do PNI',
    'bronquiolite': 'Bronquiolite Viral Aguda (BVA)',
    'bva': 'Bronquiolite Viral Aguda (BVA)',
    'pneumonia na infancia': 'Pneumonias na Infância (Pneumonia Comunitária e Derrame Pleural)',
    'asma na infancia': 'Asma na Infância e Crise Asmática',
    'diarreia aguda': 'Doença Diarreica Aguda e Terapia de Reidratação Oral (TRO)',
    'desidratacao': 'Doença Diarreica Aguda e Terapia de Reidratação Oral (TRO)',
    'doencas exantematicas': 'Doenças Exantemáticas da Infância (Sarampo, Varicela, Escarlatina, etc.)',
    'sarampo': 'Doenças Exantemáticas da Infância (Sarampo, Varicela, Escarlatina, etc.)',
    'varicela': 'Doenças Exantemáticas da Infância (Sarampo, Varicela, Escarlatina, etc.)',
    'reanimacao neonatal': 'Reanimação Neonatal em Sala de Parto (Diretrizes SBP)',
    'ictericia neonatal': 'Icterícia Neonatal e Fototerapia',
    'sepse neonatal': 'Sepse Neonatal e Infecções Perinatais',
    'disturbios respiratorios do recem nascido': 'Desconforto Respiratório Neonatal (SDR, TTN, SAM)',
    'sindrome da angustia respiratoria do rn': 'Desconforto Respiratório Neonatal (SDR, TTN, SAM)',
    'itu na infancia': 'Infecção do Trato Urinário e Refluxo Vesicoureteral na Infância',
    'convulsao febril': 'Crises Febris e Convulsões na Infância',
    'malnutricao infantil': 'Desnutrição Energético-Proteica e Obesidade Infantil',
    'fibrose cistica': 'Fibrose Cística e Triagem Neonatal (Teste do Pezinho)',

    # Medicina Preventiva e Social
    'sus': 'Sistema Único de Saúde (SUS): Princípios, Diretrizes e Legislação',
    'principios do sus': 'Sistema Único de Saúde (SUS): Princípios, Diretrizes e Legislação',
    'lei 8080': 'Legislação do SUS (Leis 8.080/90, 8.142/90 e Decreto 7.508/11)',
    'lei 8142': 'Legislação do SUS (Leis 8.080/90, 8.142/90 e Decreto 7.508/11)',
    'atencao primaria a saude': 'Atenção Primária à Saúde (APS) e Estratégia Saúde da Família (ESF)',
    'esf': 'Atenção Primária à Saúde (APS) e Estratégia Saúde da Família (ESF)',
    'estudos epidemiologicos': 'Delineamentos de Estudos Epidemiológicos (Coorte, Caso-Controle, etc.)',
    'estudo de coorte': 'Delineamentos de Estudos Epidemiológicos (Coorte, Caso-Controle, etc.)',
    'estudo caso controle': 'Delineamentos de Estudos Epidemiológicos (Coorte, Caso-Controle, etc.)',
    'ensaio clinico': 'Delineamentos de Estudos Epidemiológicos (Coorte, Caso-Controle, etc.)',
    'testes diagnosticos': 'Testes Diagnósticos: Sensibilidade, Especificidade, VPP, VPN e Acurácia',
    'sensibilidade e especificidade': 'Testes Diagnósticos: Sensibilidade, Especificidade, VPP, VPN e Acurácia',
    'medidas de associacao': 'Medidas de Associação e Frequência (RR, OR, Risco Atribuível)',
    'indicadores de saude': 'Indicadores de Saúde e Mortalidade (Infantil, Materna, Geral)',
    'mortalidade infantil': 'Indicadores de Saúde e Mortalidade (Infantil, Materna, Geral)',
    'transicao demografica e epidemiologica': 'Transição Demográfica e Epidemiológica no Brasil',
    'vigilancia epidemiologica': 'Vigilância em Saúde e Notificação Compulsória (SINAN)',
    'notificacao compulsoria': 'Vigilância em Saúde e Notificação Compulsória (SINAN)',
    'saude do trabalhador': 'Saúde do Trabalhador e Doenças Ocupacionais (Pneumoconioses, LER/DORT)',
    'bioetica': 'Bioética, Ética Médica e Código de Ética Médica (CEM)',
}

def resolve_foco(orig_foco, tema, esp, anchors_in_tema):
    """
    Resolve um foco original para seu destino canonico ouro.
    Retorna: (foco_destino, subfoco_promovido, regra)
    """
    n_orig = norm(orig_foco)
    
    # 1. Checagem direta de sinonimo canonico
    for syn_key, target in CANONICAL_SYNONYMS.items():
        if n_orig == syn_key or syn_key in n_orig and len(n_orig) - len(syn_key) < 5:
            return target, None, "SINONIMO_CLINICO"
            
    # 2. Se e um CamelCase
    is_camel = bool(re.search(r'([a-z])([A-Z])', orig_foco))
    if is_camel:
        spaced = split_camel_case(orig_foco)
        n_spaced = norm(spaced)
        
        # Checar se contem palavras compostas (Pai Filho)
        parts = spaced.split()
        if len(parts) >= 2:
            # Tentar sinonimo para a expressao completa
            for syn_key, target in CANONICAL_SYNONYMS.items():
                if syn_key in n_spaced:
                    # Discriminador restante vira subfoco
                    sub_cand = re.sub(syn_key, '', n_spaced).strip()
                    sub_promoted = sub_cand.title() if len(sub_cand) > 3 else None
                    return target, sub_promoted, "CAMELCASE_SPLIT"
                    
            # Tentar casar com as ancoras do tema
            for anc in anchors_in_tema:
                n_anc = norm(anc)
                if any(word in n_anc for word in n_spaced.split() if len(word) > 4):
                    # Encontrou palavra-chave da ancora no camel
                    return anc, spaced, "CAMELCASE_SUBSUNCAO"
                    
        # Se nao casou, converter para titulo com espacos limpos
        clean_title = spaced.title()
        # Ajustar particulas em minusculo (da, de, do, em, e)
        for part in [' Da ', ' De ', ' Do ', ' Em ', ' E ', ' Na ', ' No ', ' Dos ', ' Das ']:
            clean_title = clean_title.replace(part, part.lower())
        return clean_title, None, "CAMELCASE_TITLE"

    # 3. Se contem acronimo entre parenteses ou formatacao estruturada
    # Casar com ancoras no mesmo tema
    for anc in anchors_in_tema:
        if orig_foco == anc:
            return anc, None, "IDENTIDADE"
        n_anc = norm(anc)
        if n_orig in n_anc or n_anc in n_orig:
            # Foco contido na ancora ou vice-versa
            return anc, orig_foco, "SUBSUNCAO_TEMA"

    # 4. Fallback: Manter foco original higienizado
    return orig_foco.strip(), None, "CANONICO_DIRETO"

def main():
    print("=================================================================")
    print("[FASE 1: CONSTRUCAO DA MATRIZ CANONICA DE-PARA DE FOCOS]")
    print("=================================================================")

    # Carregar analise previa
    analysis_file = os.path.join(STAGING_DIR, 'analise_pre_fase1_focos.json')
    if not os.path.exists(analysis_file):
        print(f"Erro: {analysis_file} nao existe!")
        return

    with open(analysis_file, 'r', encoding='utf-8') as f:
        analysis_data = json.load(f)

    # Coletar todas as ancoras (>= 100 questoes) por (especialidade, tema)
    anchors_by_tema = defaultdict(lambda: defaultdict(list))
    all_focos_by_tema = defaultdict(lambda: defaultdict(list))
    
    for esp, temas in analysis_data.items():
        for tema, tdata in temas.items():
            anchors = [a[0] for a in tdata.get('anchors', [])]
            anchors_by_tema[esp][tema] = anchors

    # Agora carregar todos os focos unicos da base
    foco_stats = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    total_q = 0
    for filename in FILES:
        p = os.path.join(DATA_DIR, filename)
        with open(p, 'r', encoding='utf-8') as f:
            q_list = json.load(f)
        for q in q_list:
            total_q += 1
            esp = q.get('especialidade') or 'Desconhecido'
            tema = q.get('tema') or 'Desconhecido'
            foco = q.get('foco') or 'Desconhecido'
            foco_stats[esp][tema][foco] += 1

    print(f"Total de questoes na base: {total_q:,}")
    
    # Construir Mapa Canônico
    canonical_map = {}
    dest_focos_set = set()
    camels_resolved = 0
    synonyms_resolved = 0
    small_subsumed = 0
    identity_count = 0

    rule_counter = Counter()

    for esp, temas in sorted(foco_stats.items()):
        for tema, focos in sorted(temas.items()):
            anchors = anchors_by_tema[esp][tema]
            for orig_foco, count in focos.items():
                dest_foco, sub_promoted, rule = resolve_foco(orig_foco, tema, esp, anchors)
                
                # Garantir que nao ha CamelCase residual no destino
                if bool(re.search(r'([a-z])([A-Z])', dest_foco)) and not ('(' in dest_foco and ')' in dest_foco):
                    dest_foco = split_camel_case(dest_foco).title()
                    for p in [' Da ', ' De ', ' Do ', ' Em ', ' E ', ' Na ', ' No ', ' Dos ', ' Das ']:
                        dest_foco = dest_foco.replace(p, p.lower())

                # Registro na matriz
                map_key = f"{esp} ||| {tema} ||| {orig_foco}"
                canonical_map[map_key] = {
                    "origem": {
                        "especialidade": esp,
                        "tema": tema,
                        "foco": orig_foco,
                        "questoes": count
                    },
                    "destino": {
                        "foco_canonico": dest_foco,
                        "subfoco_sugerido": sub_promoted
                    },
                    "regra": rule
                }
                dest_focos_set.add((esp, tema, dest_foco))
                rule_counter[rule] += 1

    total_orig_focos = len(canonical_map)
    total_dest_focos = len(dest_focos_set)
    reduction_pct = (1 - (total_dest_focos / total_orig_focos)) * 100

    print(f"\n--- METRICAS DA MATRIZ CANONICA ---")
    print(f"Total de pares (esp, tema, foco) mapeados: {total_orig_focos:,}")
    print(f"Total de focos canonicos resultantes: {total_dest_focos:,}")
    print(f"Reducao de redundancia alcancada: {reduction_pct:.1f}%")
    print("\nDistribuicao das regras aplicadas:")
    for r, cnt in rule_counter.most_common():
        print(f"  {r}: {cnt:,} focos ({cnt/total_orig_focos*100:.1f}%)")

    # Salvar matriz canonical
    output_obj = {
        "metadata": {
            "gerado_em": "2026-11-06",
            "total_questoes_analisadas": total_q,
            "total_focos_origem": total_orig_focos,
            "total_focos_destino": total_dest_focos,
            "taxa_reducao_redundancia": f"{reduction_pct:.1f}%",
            "distribuicao_regras": dict(rule_counter)
        },
        "mapa": canonical_map
    }

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output_obj, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCESSO] Matriz gravada com exito em: {OUTPUT_PATH}")
    size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"Tamanho do arquivo: {size_mb:.2f} MB")

if __name__ == '__main__':
    main()

