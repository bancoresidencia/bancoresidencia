"""
Script Final de Construcao da Matriz Canonica Ouro de Focos (Fase 1)
Incorpora Ontologia Clinica Completa, Regras de Subsuncao Cirurgica, Pediatrica,
Ginecologica, Obstetricia e Medica, alcancando entre 780 e 820 focos canonicos.
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
    s1 = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', s)
    s2 = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s1)
    return s2.strip()

# Stopwords
STOPWORDS = {'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'e', 'ou', 'com', 'sem', 'para', 'por', 'sobre', 'a', 'o', 'as', 'os'}

def extract_kw(text):
    words = norm(text).split()
    return set(w for w in words if w not in STOPWORDS and len(w) > 3)

# Regras Ouro Ampliadas (incluindo as grandes sindromes cirurgicas, pediatricas e obstetricas)
CLINICAL_RULES_EXPANDED = [
    # CARDIOLOGIA
    (r'\b(iamcsst|supra.*st|st.*supra|infarto.*com.*supra)\b', 'Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)', 'Cardiologia'),
    (r'\b(iamssst|sem.*supra|angina.*instavel)\b', 'Síndrome Coronariana Aguda sem Supra de ST (SCASSST)', 'Cardiologia'),
    (r'\b(angina.*estavel|coronar.*cronica|dac.*cronica)\b', 'Doença Arterial Coronariana Crônica e Angina Estável', 'Cardiologia'),
    (r'\b(has|hipertens.*arterial)\b', 'Hipertensão Arterial Sistêmica (HAS)', 'Cardiologia'),
    (r'\b(crise.*hipertensiva|urgencia.*hipertensiva|emergencia.*hipertensiva)\b', 'Crise Hipertensiva (Urgência e Emergência Hipertensiva)', 'Cardiologia'),
    (r'\b(insuficiencia.*cardiaca.*aguda|ic.*descompensada|edema.*agudo.*pulmao)\b', 'Insuficiência Cardíaca Descompensada (IC Aguda)', 'Cardiologia'),
    (r'\b(insuficiencia.*cardiaca|ic|icfer|icfep)\b', 'Insuficiência Cardíaca (IC)', 'Cardiologia'),
    (r'\b(fibrilacao.*atrial|flutter.*atrial|fa)\b', 'Fibrilação Atrial e Flutter Atrial', 'Cardiologia'),
    (r'\b(taquicardia.*supra|tpsv|taquiarritmia)\b', 'Taquiarritmias Supraventriculares', 'Cardiologia'),
    (r'\b(taquicardia.*ventricular|fibrilacao.*ventricular|tv|fv)\b', 'Taquiarritmias Ventriculares (TV e FV)', 'Cardiologia'),
    (r'\b(bloqueio.*atrioventricular|bav|bradiarritmia|bradicardia)\b', 'Bradiarritmias e Bloqueios Atrioventriculares (BAV)', 'Cardiologia'),
    (r'\b(parada.*cardio|pcr|acls|ressuscita.*cardio)\b', 'Parada Cardiorrespiratória e Ressuscitação (PCR / ACLS)', 'Cardiologia'),
    (r'\b(estenose.*aortica|insuficiencia.*aortica|estenose.*mitral|insuficiencia.*mitral|valvopatia)\b', 'Valvopatias (Aórtica, Mitral e Tricúspide)', 'Cardiologia'),
    (r'\b(endocardite.*infecciosa|endocardite)\b', 'Endocardite Infecciosa', 'Cardiologia'),
    (r'\b(pericardite|tamponamento.*cardiaco)\b', 'Doenças do Pericárdio (Pericardite e Tamponamento)', 'Cardiologia'),
    (r'\b(disseccao.*aorta|aneurisma.*aorta)\b', 'Doenças da Aorta (Dissecção e Aneurismas)', 'Cardiologia'),
    (r'\b(choque.*cardiogenico)\b', 'Choque Cardiogênico', 'Cardiologia'),
    (r'\b(miocardite|cardiomiopatia|miocardiopatia)\b', 'Miocardiopatias e Miocardite', 'Cardiologia'),

    # PNEUMOLOGIA
    (r'\b(dpoc|obstrutiva.*cronica|enfisema|bronquite.*cronica)\b', 'Doença Pulmonar Obstrutiva Crônica (DPOC)', 'Pneumologia'),
    (r'\b(asma|crise.*asmatica)\b', 'Asma Brônquica', 'Pneumologia'),
    (r'\b(tep|embolia.*pulmonar|tromboembolismo.*pulmonar)\b', 'Tromboembolismo Pulmonar (TEP)', 'Pneumologia'),
    (r'\b(pac|pneumonia.*comunitari|pneumonia.*adquirida.*comunidade)\b', 'Pneumonia Adquirida na Comunidade (PAC)', 'Pneumologia'),
    (r'\b(pav|pneumonia.*nosocomial|pneumonia.*hospitalar)\b', 'Pneumonia Hospitalar e Associada à Ventilação (PAV)', 'Pneumologia'),
    (r'\b(derrame.*pleural|empiema)\b', 'Derrame Pleural e Empiema', 'Pneumologia'),
    (r'\b(cancer.*pulmao|neoplasia.*pulmonar|nodulo.*pulmonar)\b', 'Câncer de Pulmão e Nódulo Pulmonar Solitário', 'Pneumologia'),
    (r'\b(pneumopatia.*intersticial|fibrose.*pulmonar)\b', 'Pneumopatias Intersticiais', 'Pneumologia'),
    (r'\b(pneumotorax)\b', 'Pneumotórax Espontâneo e Hipertensivo', 'Pneumologia'),

    # ENDOCRINOLOGIA
    (r'\b(cetoacidose|hiperosmolar|cad|ehh)\b', 'Emergências Hiperglicêmicas (CAD e EHH)', 'Endocrinologia'),
    (r'\b(diabetes.*tipo.*1|dm1)\b', 'Diabetes Mellitus Tipo 1 (DM1)', 'Endocrinologia'),
    (r'\b(diabetes.*tipo.*2|dm2|diabetes.*mellitus)\b', 'Diabetes Mellitus Tipo 2 (DM2)', 'Endocrinologia'),
    (r'\b(retinopatia.*diabetica|nefropatia.*diabetica|pe.*diabetico)\b', 'Complicações Crônicas do Diabetes', 'Endocrinologia'),
    (r'\b(hipotireoidismo|tireoidite|hashimoto)\b', 'Hipotireoidismo e Tireoidites', 'Endocrinologia'),
    (r'\b(hipertireoidismo|tireotoxicose|graves)\b', 'Hipertireoidismo e Tireotoxicose', 'Endocrinologia'),
    (r'\b(nodulo.*tireoide|cancer.*tireoide)\b', 'Nódulos e Câncer de Tireoide', 'Endocrinologia'),
    (r'\b(osteoporose|osteopenia|doenca.*ossea)\b', 'Osteoporose e Doenças Osteometabólicas', 'Endocrinologia'),
    (r'\b(cushing|feocromocitoma|adrenal|addison)\b', 'Doenças da Adrenal (Cushing, Addison e Feocromocitoma)', 'Endocrinologia'),
    (r'\b(dislipidemia|hipercolesterolemia|hipertrigliceridemia)\b', 'Dislipidemias e Risco Cardiovascular', 'Endocrinologia'),
    (r'\b(obesidade|sindrome.*metabolica)\b', 'Obesidade e Síndrome Metabólica', 'Endocrinologia'),
    (r'\b(hipofise|adenoma.*hipofisario|prolactinoma|acromegalia)\b', 'Doenças da Hipófise (Prolactinoma e Acromegalia)', 'Endocrinologia'),

    # GASTROENTEROLOGIA & HEPATOLOGIA
    (r'\b(drge|refluxo.*gastroesofagico)\b', 'Doença do Refluxo Gastroesofágico (DRGE)', 'Gastroenterologia'),
    (r'\b(ulcera.*peptica|h.*pylori|gastrite)\b', 'Úlcera Péptica e Infecção por H. pylori', 'Gastroenterologia'),
    (r'\b(hemorragia.*digestiva.*alta|hda)\b', 'Hemorragia Digestiva Alta (HDA)', 'Gastroenterologia'),
    (r'\b(hemorragia.*digestiva.*baixa|hdb)\b', 'Hemorragia Digestiva Baixa (HDB)', 'Gastroenterologia'),
    (r'\b(pancreatite.*aguda)\b', 'Pancreatite Aguda', 'Gastroenterologia'),
    (r'\b(pancreatite.*cronica)\b', 'Pancreatite Crônica', 'Gastroenterologia'),
    (r'\b(cirrose|hipertensao.*portal)\b', 'Cirrose Hepática e Hipertensão Portal', 'Gastroenterologia'),
    (r'\b(ascite|pbe|peritonite.*bacteriana.*espontanea|encefalopatia.*hepatica)\b', 'Complicações da Cirrose (Ascite, PBE e Encefalopatia)', 'Gastroenterologia'),
    (r'\b(hepatite.*a|hepatite.*b|hepatite.*c|hepatites.*virais)\b', 'Hepatites Virais (A, B, C)', 'Gastroenterologia'),
    (r'\b(doenca.*crohn|retocolite.*ulcerativa|dii)\b', 'Doença Inflamatória Intestinal (Crohn e RCU)', 'Gastroenterologia'),
    (r'\b(diarreia.*cronica|sindrome.*ma.*absorcao|doenca.*celiaca)\b', 'Síndromes de Má-Absorção e Diarreia Crônica', 'Gastroenterologia'),
    (r'\b(cancer.*colorretal|polipo.*colon)\b', 'Câncer Colorretal e Pólipos Intestinais', 'Gastroenterologia'),
    (r'\b(cancer.*gastrico)\b', 'Câncer Gástrico', 'Gastroenterologia'),
    (r'\b(cancer.*esofago|megaesofago|acalasia)\b', 'Doenças do Esôfago (Acalásia e Câncer de Esôfago)', 'Gastroenterologia'),
    (r'\b(esteatose.*hepatica|nash|mash)\b', 'Doença Hepática Esteatótica (Esteatoepatite)', 'Gastroenterologia'),

    # NEFROLOGIA
    (r'\b(ira|lra|lesao.*renal.*aguda|injuria.*renal.*aguda)\b', 'Injúria Renal Aguda (IRA / LRA)', 'Nefrologia'),
    (r'\b(drc|doenca.*renal.*cronica|insuficiencia.*renal.*cronica)\b', 'Doença Renal Crônica (DRC)', 'Nefrologia'),
    (r'\b(itu|infeccao.*trato.*urinario|pielonefrite|cistite)\b', 'Infecção do Trato Urinário (ITU)', 'Nefrologia'),
    (r'\b(sindrome.*nefrotica)\b', 'Síndrome Nefrótica e Glomerulopatias', 'Nefrologia'),
    (r'\b(sindrome.*nefritica|gnda|glomerulonefrite)\b', 'Síndrome Nefrítica e Glomerulonefrites', 'Nefrologia'),
    (r'\b(potassio|hipercalemia|hipocalemia)\b', 'Distúrbios do Potássio (Hipo e Hipercalemia)', 'Nefrologia'),
    (r'\b(sodio|hipernatremia|hiponatremia)\b', 'Distúrbios do Sódio (Hipo e Hipernatremia)', 'Nefrologia'),
    (r'\b(acido.*base|acidose.*metabolica|alcalose.*metabolica)\b', 'Distúrbios do Equilíbrio Ácido-Base', 'Nefrologia'),
    (r'\b(litiase.*renal|calculo.*renal|nefrolitiase)\b', 'Litíase Urinária e Nefrolitíase', 'Nefrologia'),
    (r'\b(hemodialise|dialise|terapia.*renal.*substitutiva)\b', 'Terapia Renal Substitutiva (Diálise e Transplante)', 'Nefrologia'),

    # NEUROLOGIA
    (r'\b(avci|isquemico|isquemia.*cerebral)\b', 'Acidente Vascular Cerebral Isquêmico (AVCI)', 'Neurologia'),
    (r'\b(avch|hemorragico|hemorragia.*intraparenquimatosa)\b', 'Acidente Vascular Cerebral Hemorrágico (AVCH)', 'Neurologia'),
    (r'\b(hsa|hemorragia.*subaracnoidea)\b', 'Hemorragia Subaracnóidea (HSA) e Aneurismas Intracranianos', 'Neurologia'),
    (r'\b(avc|acidente.*vascular.*cerebral)\b', 'Acidente Vascular Cerebral (AVC)', 'Neurologia'),
    (r'\b(enxaqueca|cefaleia|tensional|salvas)\b', 'Cefaleias Primárias (Enxaqueca, Tensional e Salvas)', 'Neurologia'),
    (r'\b(epilepsia|crise.*convulsiva|convulsao|mal.*epileptico)\b', 'Epilepsia e Crises Epilépticas', 'Neurologia'),
    (r'\b(meningite|encefalite)\b', 'Meningites e Encefalites Infecciosas', 'Neurologia'),
    (r'\b(delirium|confusao.*mental)\b', 'Delirium e Estados Confusionais Agudos', 'Neurologia'),
    (r'\b(demencia|alzheimer)\b', 'Demências e Doença de Alzheimer', 'Neurologia'),
    (r'\b(parkinson|parkinsonismo)\b', 'Doença de Parkinson e Distúrbios do Movimento', 'Neurologia'),
    (r'\b(guillain.*barre|neuropatia|miastenia)\b', 'Doenças Neuromusculares e Neuropatias Periféricas', 'Neurologia'),

    # HEMATOLOGIA
    (r'\b(ferropriva|carencial|anemia.*microcitica)\b', 'Anemias Microcíticas e Carenciais (Ferropriva e Doença Crônica)', 'Hematologia'),
    (r'\b(megaloblastica|perniciosa|anemia.*macrocitica|b12|folato)\b', 'Anemias Macrocíticas e Megaloblásticas', 'Hematologia'),
    (r'\b(falciforme|talassemia|hemoglobinopatia)\b', 'Hemoglobinopatias (Doença Falciforme e Talassemias)', 'Hematologia'),
    (r'\b(anemia.*hemolitica|esferocitose|g6pd)\b', 'Anemias Hemolíticas Autoimunes e Hereditárias', 'Hematologia'),
    (r'\b(linfoma|hodgkin)\b', 'Linfomas (Hodgkin e Não-Hodgkin)', 'Hematologia'),
    (r'\b(leucemia.*aguda|leucemia.*cronica|leucemia|lmc|lla|lma|llc)\b', 'Leucemias Agudas e Crônicas', 'Hematologia'),
    (r'\b(mieloma.*multiplo|gamopatia|plasmocitoma)\b', 'Gamopatias Monoclonais e Mieloma Múltiplo', 'Hematologia'),
    (r'\b(plaquetopenia|pti|ptt|purpura)\b', 'Púrpuras e Plaquetopenias (PTI / PTT)', 'Hematologia'),
    (r'\b(hemofilia|von.*willebrand|coagulopatia)\b', 'Distúrbios da Coagulação e Hemofilias', 'Hematologia'),
    (r'\b(transfusao|hemotransfusao|reacao.*transfusional|taco|trali)\b', 'Medicina Transfusional e Reações Hemolíticas', 'Hematologia'),

    # REUMATOLOGIA
    (r'\b(artrite.*reumatoide|ar)\b', 'Artrite Reumatoide (AR)', 'Reumatologia'),
    (r'\b(lupus|les|nefrite.*lupica)\b', 'Lúpus Eritematoso Sistêmico (LES)', 'Reumatologia'),
    (r'\b(espondilite|espondiloartrite|espondiloartropatia)\b', 'Espondiloartrites e Espondilite Anquilosante', 'Reumatologia'),
    (r'\b(gota|pseudogota|hiperuricemia)\b', 'Artrites Microcristalinas (Gota e Pseudogota)', 'Reumatologia'),
    (r'\b(vasculite|anca|kawasaki|takayasu|wegener|purpura.*henoch)\b', 'Vasculites Sistêmicas', 'Reumatologia'),
    (r'\b(esclerose.*sistemica|esclerodermia)\b', 'Esclerose Sistêmica e Doenças do Tecido Conjuntivo', 'Reumatologia'),
    (r'\b(fibromialgia|dor.*cronica)\b', 'Fibromialgia e Síndromes Dolorosas Crônicas', 'Reumatologia'),
    (r'\b(artrose|osteoartrite|osteoartrose)\b', 'Osteoartrite (Osteoartrose)', 'Reumatologia'),
    (r'\b(miopatia|dermatomiosite|polimiosite)\b', 'Miopatias Inflamatórias (Dermatomiosite e Polimiosite)', 'Reumatologia'),

    # INFECTOLOGIA
    (r'\b(hiv|aids|tarv|carga.*viral)\b', 'Infecção pelo HIV e AIDS', 'Infectologia'),
    (r'\b(dengue|chikungunya|zika|febre.*amarela|arbovirose)\b', 'Arboviroses (Dengue, Zika, Chikungunya e Febre Amarela)', 'Infectologia'),
    (r'\b(sepse|choque.*septico)\b', 'Sepse e Choque Séptico', 'Infectologia'),
    (r'\b(tuberculose|tb|bk)\b', 'Tuberculose Pulmonar e Extrapulmonar', 'Infectologia'),
    (r'\b(covid|sars.*cov|influenza|sindrome.*gripal)\b', 'COVID-19 e Síndromes Gripais', 'Infectologia'),
    (r'\b(sifilis|cancro|gonorreia|clamidia|ist)\b', 'Infecções Sexualmente Transmissíveis (ISTs)', 'Infectologia'),
    (r'\b(leishmaniose|calazar)\b', 'Leishmanioses (Tegumentar e Visceral)', 'Infectologia'),
    (r'\b(chagas|tripanossoma)\b', 'Doença de Chagas', 'Infectologia'),
    (r'\b(malaria|plasmodium)\b', 'Malária e Protozooses', 'Infectologia'),
    (r'\b(leptospirose)\b', 'Leptospirose', 'Infectologia'),
    (r'\b(animais.*peconhentos|ofidico|escorpionico|aranha)\b', 'Acidentes por Animais Peçonhentos', 'Infectologia'),
    (r'\b(antimicrobianos|antibioticos|resistencia.*bacteriana)\b', 'Uso Racional de Antimicrobianos e Resistência Bacteriana', 'Infectologia'),

    # CIRURGIA GERAL
    (r'\b(apendicite|apendicite.*aguda)\b', 'Apendicite Aguda', 'Cirurgia Geral'),
    (r'\b(colecistite|colelitiase|coledocolitiase|colangite|mirizzi|vesicula.*biliar|via.*biliar|cisto.*biliar|polipo.*vesicula|colangiocarcinoma)\b', 'Colecistite Aguda e Doenças Biliares', 'Cirurgia Geral'),
    (r'\b(diverticulite|doenca.*diverticular)\b', 'Diverticulite Aguda e Doença Diverticular do Cólon', 'Cirurgia Geral'),
    (r'\b(obstrucao.*intestinal|volvo|brida|suboclusao|ogilvie|invaginacao|hirschsprung|abdome.*agudo.*obstrutivo)\b', 'Abdome Agudo Obstrutivo (Obstrução Intestinal e Volvo)', 'Cirurgia Geral'),
    (r'\b(abdome.*agudo.*perfurativo|ulcera.*perfurada|perfuracao.*diverticulo)\b', 'Abdome Agudo Perfurativo (Úlcera e Divertículo)', 'Cirurgia Geral'),
    (r'\b(abdome.*agudo.*vascular|isquemia.*mesenterica|trombose.*mesenterica)\b', 'Abdome Agudo Vascular (Isquemia Mesentérica)', 'Cirurgia Geral'),
    (r'\b(abdome.*agudo.*inflamatorio|urgencias.*abdominais)\b', 'Abdome Agudo Inflamatório (Apendicite, Colecistite, Diverticulite)', 'Cirurgia Geral'),
    (r'\b(hernia.*inguinal|hernia.*femoral|hernia.*crural|hernia.*incisional|hernia.*umbilical|hernia.*encarcerada|hernia.*estrangulada|defeito.*parede|hernia)\b', 'Hérnias da Parede Abdominal (Inguinal, Crural, Incisional e Umbilical)', 'Cirurgia Geral'),
    (r'\b(atls|trauma.*inicial|politraumatizado|avaliacao.*inicial)\b', 'Atendimento Inicial ao Politraumatizado (ATLS)', 'Cirurgia Geral'),
    (r'\b(trauma.*toracico|drenagem.*pleural|toracotomia)\b', 'Trauma Torácico e Drenagem Pleural', 'Cirurgia Geral'),
    (r'\b(trauma.*abdominal|trauma.*pelvico|laparotomia.*trauma)\b', 'Trauma Abdominal e Pélvico', 'Cirurgia Geral'),
    (r'\b(tce|cranioencefalico|hematoma.*extradural|hematoma.*subdural)\b', 'Traumatismo Cranioencefálico (TCE)', 'Cirurgia Geral'),
    (r'\b(queimadura|queimado)\b', 'Queimaduras e Atendimento ao Paciente Queimado', 'Cirurgia Geral'),
    (r'\b(pre.*operatorio|risco.*cirurgico|manejo.*perioperatorio)\b', 'Avaliação Pré-Operatória e Risco Cirúrgico', 'Cirurgia Geral'),
    (r'\b(pos.*operatorio|remit|resposta.*metabolica|complicacao.*cirurgica|deiscencia|evisceracao|fistula.*anastomotica)\b', 'Complicações Pós-Operatórias e Resposta Metabólica ao Trauma (REMIT)', 'Cirurgia Geral'),
    (r'\b(infeccao.*sitio.*cirurgico|isc|ferida|cicatrizacao)\b', 'Cicatrização, Feridas e Infecção de Sítio Cirúrgico (ISC)', 'Cirurgia Geral'),
    (r'\b(sutura|fio.*sutura|preceito.*tecnica|tecnica.*cirurgica|instrumentacao)\b', 'Técnica Cirúrgica, Suturas e Instrumentação', 'Cirurgia Geral'),
    (r'\b(anestesia.*geral|farmacologia.*anestesica|anestesicos.*locais|agentes.*anestesicos|bloqueadores.*neuromusculares)\b', 'Anestesiologia e Farmacologia dos Anestésicos', 'Cirurgia Geral'),
    (r'\b(anestesia.*neuroeixo|raqui|peridural|bloqueio.*regional)\b', 'Anestesiologia e Anestesia Regional (Raqui e Peridural)', 'Cirurgia Geral'),
    (r'\b(via.*aerea.*dificil|intubacao.*dificil)\b', 'Manejo da Via Aérea Difícil em Cirurgia', 'Cirurgia Geral'),
    (r'\b(cuidados.*posanestesicos|dor.*analgesia|analgesia.*pos)\b', 'Cuidados Pós-Anestésicos e Analgesia Pós-Operatória', 'Cirurgia Geral'),
    (r'\b(hemorroida|fissura.*anal|abscesso.*fistula|doenca.*anorretal)\b', 'Doenças Orificiais e Anorretais (Hemorroidas, Fissuras e Fístulas)', 'Cirurgia Geral'),
    (r'\b(cancer.*prostata|hpb|hiperplasia.*prostatica)\b', 'Doenças da Próstata (HPB e Câncer de Próstata)', 'Cirurgia Geral'),
    (r'\b(litiase.*urinaria|colica.*nefretica)\b', 'Litíase Urinária e Urolitíase', 'Cirurgia Geral'),
    (r'\b(cirurgia.*bariatrica|bypass|sleeve)\b', 'Cirurgia Bariátrica e Metabólica', 'Cirurgia Geral'),

    # GINECOLOGIA E OBSTETRÍCIA
    (r'\b(cancer.*colo.*utero|nic|lesao.*intraepitelial|hpv|citologia.*cervical)\b', 'Câncer de Colo Uterino e Lesões Precursoras (HPV / Citologia)', 'Ginecologia e Obstetrícia'),
    (r'\b(cancer.*mama|mamografia|birads|mastologia)\b', 'Câncer de Mama e Rastreamento Mamográfico', 'Ginecologia e Obstetrícia'),
    (r'\b(doenca.*benigna.*mama|fibroadenoma|mastalgia|mastite)\b', 'Doenças Benignas da Mama (Fibroadenoma e Mastalgia)', 'Ginecologia e Obstetrícia'),
    (r'\b(sangramento.*uterino.*anormal|sua|palm.*coein)\b', 'Sangramento Uterino Anormal (Classificação PALM-COEIN)', 'Ginecologia e Obstetrícia'),
    (r'\b(mioma|miomatose|polipo.*endometrial)\b', 'Miomatose Uterina e Pólipos Endometriais', 'Ginecologia e Obstetrícia'),
    (r'\b(endometriose|adenomiose|dor.*pelvica.*cronica)\b', 'Endometriose e Dor Pélvica Crônica', 'Ginecologia e Obstetrícia'),
    (r'\b(sop|ovarios.*policisticos)\b', 'Síndrome dos Ovários Policísticos (SOP)', 'Ginecologia e Obstetrícia'),
    (r'\b(climaterio|menopausa|trh|reposicao.*hormonal)\b', 'Climatério, Menopausa e Terapia Hormonal (TRH)', 'Ginecologia e Obstetrícia'),
    (r'\b(anticoncepcao|contracepcao|diu|planejamento.*familiar)\b', 'Planejamento Familiar e Métodos Anticoncepcionais', 'Ginecologia e Obstetrícia'),
    (r'\b(vulvovaginite|candidíase|vaginose|tricomoniase)\b', 'Vulvovaginites e Vaginose Bacteriana', 'Ginecologia e Obstetrícia'),
    (r'\b(dip|doenca.*inflamatoria.*pelvica)\b', 'Doença Inflamatória Pélvica (DIP)', 'Ginecologia e Obstetrícia'),
    (r'\b(incontinencia.*urinaria|prolapso.*orgaos.*pelvicos|uroginecologia)\b', 'Incontinência Urinária e Prolapso de Órgãos Pélvicos', 'Ginecologia e Obstetrícia'),
    (r'\b(pre.*eclampsia|eclampsia|hellp|sindromes.*hipertensivas.*gestacao)\b', 'Síndromes Hipertensivas da Gestação (Pré-Eclâmpsia e Eclâmpsia)', 'Ginecologia e Obstetrícia'),
    (r'\b(diabetes.*gestacional|dmg)\b', 'Diabetes Mellitus Gestacional (DMG)', 'Ginecologia e Obstetrícia'),
    (r'\b(abortamento|aborto|ameaca.*abortamento)\b', 'Sangramento de Primeira Metade: Abortamento e Tipos Clínicos', 'Ginecologia e Obstetrícia'),
    (r'\b(prenhez.*ectopica|gestacao.*ectopica)\b', 'Sangramento de Primeira Metade: Gestação Ectópica', 'Ginecologia e Obstetrícia'),
    (r'\b(doenca.*trofoblastica|mola.*hidatiforme)\b', 'Sangramento de Primeira Metade: Doença Trofoblástica Gestacional (Mola)', 'Ginecologia e Obstetrícia'),
    (r'\b(dpp|descolamento.*prematuro.*placenta)\b', 'Sangramento de Segunda Metade: Descolamento Prematuro de Placenta (DPP)', 'Ginecologia e Obstetrícia'),
    (r'\b(placenta.*previa|acretismo.*placentario)\b', 'Sangramento de Segunda Metade: Placenta Prévia e Acretismo Placentário', 'Ginecologia e Obstetrícia'),
    (r'\b(parto.*prematuro|tpp|trabalho.*parto.*prematuro|tocolise)\b', 'Trabalho de Parto Prematuro (TPP) e Tocolise', 'Ginecologia e Obstetrícia'),
    (r'\b(rpmo|rotura.*prematura.*membrana|amniorrexe)\b', 'Rotura Prematura de Membranas Ovulares (RPMO)', 'Ginecologia e Obstetrícia'),
    (r'\b(mecanismo.*parto|estatica.*fetal|bacia.*obstetrica)\b', 'Mecanismo do Parto e Estática Fetal', 'Ginecologia e Obstetrícia'),
    (r'\b(assistencia.*parto|fases.*parto|partograma|distocia)\b', 'Assistência ao Trabalho de Parto, Partograma e Distocias', 'Ginecologia e Obstetrícia'),
    (r'\b(hemorragia.*pos.*parto|hpp|atonia.*uterina)\b', 'Hemorragia Pós-Parto (HPP) e Atonia Uterina', 'Ginecologia e Obstetrícia'),
    (r'\b(pre.*natal|rotina.*pre.*natal|consulta.*pre.*natal)\b', 'Rotina e Assistência ao Pré-Natal de Baixo e Alto Risco', 'Ginecologia e Obstetrícia'),
    (r'\b(vitalidade.*fetal|cardiotocografia|doppler|perfil.*biofisico)\b', 'Avaliação da Vitalidade Fetal (Cardiotocografia e Doppler)', 'Ginecologia e Obstetrícia'),
    (r'\b(infeccao.*gestacao|sifilis.*gestacao|toxoplasmose.*gestacao|hiv.*gestacao)\b', 'Infecções na Gestação e Transmissão Vertical (Sífilis, HIV, Toxoplasmose)', 'Ginecologia e Obstetrícia'),
    (r'\b(gemelar|gestacao.*multipla)\b', 'Gestação Múltipla (Gemelaridade)', 'Ginecologia e Obstetrícia'),
    (r'\b(isoimunizacao|rh.*negativo|coombs|doenca.*hemolitica.*perinatal)\b', 'Isoimunização Rh e Doença Hemolítica Perinatal', 'Ginecologia e Obstetrícia'),
    (r'\b(restricao.*crescimento.*fetal|rcf|cir)\b', 'Restrição de Crescimento Fetal (RCF / CIUR)', 'Ginecologia e Obstetrícia'),
    (r'\b(modificacoes.*fisiologicas.*gestacao)\b', 'Modificações Fisiológicas da Gravidez', 'Ginecologia e Obstetrícia'),
    (r'\b(liquido.*amniotico|polidramnio|oligodramnio)\b', 'Alterações do Volume de Líquido Amniótico (Oligo e Polidrâmnio)', 'Ginecologia e Obstetrícia'),

    # PEDIATRIA
    (r'\b(aleitamento.*materno|amamentacao|leite.*materno)\b', 'Aleitamento Materno e Alimentação Complementar', 'Pediatria'),
    (r'\b(crescimento|curva.*oms|baixa.*estatura)\b', 'Crescimento Infantil e Avaliação Antropométrica (Curvas OMS)', 'Pediatria'),
    (r'\b(desenvolvimento.*neuropsicomotor|dnpm|marcos.*desenvolvimento)\b', 'Desenvolvimento Neuropsicomotor (Marcos do DNPM)', 'Pediatria'),
    (r'\b(vacinacao|imunizacao|calendario.*vacinal|pni)\b', 'Imunizações e Calendário Vacinal do PNI', 'Pediatria'),
    (r'\b(bronquiolite|bva|virus.*sincicial)\b', 'Bronquiolite Viral Aguda (BVA)', 'Pediatria'),
    (r'\b(asma.*infancia|crise.*asmatica.*infantil|lactente.*sibilante)\b', 'Asma na Infância e Síndrome do Lactente Sibilante', 'Pediatria'),
    (r'\b(pneumonia.*infancia|bcp|derrame.*parapneumonico)\b', 'Pneumonias na Infância e Complicações', 'Pediatria'),
    (r'\b(diarreia.*aguda|desidratacao|tro|reidratacao.*oral)\b', 'Doença Diarreica Aguda e Terapia de Reidratação Oral (TRO)', 'Pediatria'),
    (r'\b(exantematica|sarampo|varicela|escarlatina|eritema.*infeccioso|roseola)\b', 'Doenças Exantemáticas da Infância (Sarampo, Varicela, Escarlatina, etc.)', 'Pediatria'),
    (r'\b(reanimacao.*neonatal|sala.*parto|passos.*iniciais)\b', 'Reanimação Neonatal em Sala de Parto (Diretrizes SBP)', 'Pediatria'),
    (r'\b(ictericia.*neonatal|fototerapia|exsanguineotransfusao)\b', 'Icterícia Neonatal e Fototerapia', 'Pediatria'),
    (r'\b(sepse.*neonatal|infeccao.*neonatal)\b', 'Sepse Neonatal e Infecções Perinatais', 'Pediatria'),
    (r'\b(desconforto.*respiratorio.*rn|sdr|ttn|sam|membrana.*hialina)\b', 'Desconforto Respiratório Neonatal (SDR, TTN, SAM)', 'Pediatria'),
    (r'\b(triagem.*neonatal|teste.*pezinho|fibrose.*cistica)\b', 'Triagem Neonatal (Teste do Pezinho, Olhinho, Orelhinha e Coraçãozinho)', 'Pediatria'),
    (r'\b(itu.*infancia|refluxo.*vesicoureteral)\b', 'Infecção do Trato Urinário e Refluxo Vesicoureteral na Infância', 'Pediatria'),
    (r'\b(sindrome.*nefrotica.*infancia|lesoes.*minimas)\b', 'Síndrome Nefrótica na Infância (Doença por Lesões Mínimas)', 'Pediatria'),
    (r'\b(convulsao.*febril|crise.*febril)\b', 'Crises Febris e Convulsões na Infância', 'Pediatria'),
    (r'\b(aplv|alergia.*leite.*vaca)\b', 'Alergia à Proteína do Leite de Vaca (APLV)', 'Pediatria'),
    (r'\b(desnutricao.*infantil|obesidade.*infantil)\b', 'Desnutrição Energético-Proteica e Obesidade Infantil', 'Pediatria'),
    (r'\b(anemia.*ferropriva.*infancia)\b', 'Anemia Ferropriva na Infância e Suplementação Profilática', 'Pediatria'),
    (r'\b(cardiopatia.*congenita|tetralogia.*fallot|civ|cia|pca)\b', 'Cardiopatias Congênitas (Cianóticas e Acianóticas)', 'Pediatria'),
    (r'\b(emergencia.*pediatrica|choque.*pediatria|corpo.*estranho.*engasgo)\b', 'Emergências Pediátricas (Choque, Obstrução de Vias Aéreas e PALS)', 'Pediatria'),

    # MEDICINA PREVENTIVA E SOCIAL
    (r'\b(sus|principios.*sus|diretrizes.*sus)\b', 'Sistema Único de Saúde (SUS): Princípios, Diretrizes e Participação Social', 'Medicina Preventiva e Social'),
    (r'\b(legislacao.*sus|lei.*8080|lei.*8142|decreto.*7508)\b', 'Legislação do SUS (Leis 8.080/90, 8.142/90 e Decreto 7.508/11)', 'Medicina Preventiva e Social'),
    (r'\b(atencao.*primaria|aps|esf|saude.*familia)\b', 'Atenção Primária à Saúde (APS) e Estratégia Saúde da Família (ESF)', 'Medicina Preventiva e Social'),
    (r'\b(estudos.*epidemiologicos|coorte|caso.*controle|ensaio.*clinico|transversal)\b', 'Delineamentos de Estudos Epidemiológicos (Coorte, Caso-Controle, etc.)', 'Medicina Preventiva e Social'),
    (r'\b(testes.*diagnosticos|sensibilidade|especificidade|vpp|vpn|acuracia)\b', 'Testes Diagnósticos: Sensibilidade, Especificidade, VPP, VPN e Curva ROC', 'Medicina Preventiva e Social'),
    (r'\b(medidas.*associacao|rr|or|risco.*relativo|odds.*ratio|risco.*atribuivel)\b', 'Medidas de Associação e Frequência (Prevalência, Incidência, RR e OR)', 'Medicina Preventiva e Social'),
    (r'\b(indicadores.*saude|mortalidade.*infantil|mortalidade.*materna)\b', 'Indicadores de Saúde e Mortalidade (Infantil, Materna, Geral e Proporcional)', 'Medicina Preventiva e Social'),
    (r'\b(transicao.*demografica|transicao.*epidemiologica|piramide.*etaria)\b', 'Transição Demográfica e Epidemiológica no Brasil', 'Medicina Preventiva e Social'),
    (r'\b(vigilancia.*epidemiologica|notificacao.*compulsoria|sinan)\b', 'Vigilância em Saúde e Notificação Compulsória (SINAN)', 'Medicina Preventiva e Social'),
    (r'\b(saude.*trabalhador|doenca.*ocupacional|pneumoconiose|ler.*dort|cat)\b', 'Saúde do Trabalhador e Doenças Ocupacionais (Pneumoconioses, LER/DORT)', 'Medicina Preventiva e Social'),
    (r'\b(bioetica|etica.*medica|cem|sigilo.*medico|termo.*consentimento)\b', 'Bioética, Ética Médica e Código de Ética Médica (CEM)', 'Medicina Preventiva e Social'),
    (r'\b(prevencao.*primaria|prevencao.*secundaria|niveis.*prevencao|leavell.*clark)\b', 'Níveis de Prevenção em Saúde (Primária, Secundária, Terciária e Quaternária)', 'Medicina Preventiva e Social'),
]

def main():
    print("=================================================================")
    print("[FASE 1: CONSTRUCAO DA MATRIZ CANONICA OURO DE FOCOS]")
    print("=================================================================")

    # 1. Carregar analise de focos para obter ancoras por tema
    analysis_file = os.path.join(STAGING_DIR, 'analise_pre_fase1_focos.json')
    with open(analysis_file, 'r', encoding='utf-8') as f:
        analysis = json.load(f)

    theme_anchors = defaultdict(lambda: defaultdict(list))
    for esp, temas in analysis.items():
        for tema, data in temas.items():
            anchors = [a[0] for a in data.get('anchors', [])]
            if not anchors:
                all_sorted = sorted(data.get('camels', []) + data.get('small', []), key=lambda x: x[1], reverse=True)
                anchors = [f[0] for f in all_sorted if not re.search(r'([a-z])([A-Z])', f[0])][:8]
            theme_anchors[esp][tema] = [(anc, extract_kw(anc)) for anc in anchors]

    # 2. Carregar dados das questoes
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

    canonical_map = {}
    dest_focos_global = set()
    rule_counter = Counter()

    for esp, temas in sorted(foco_stats.items()):
        for tema, focos in sorted(temas.items()):
            anchors = theme_anchors[esp][tema]
            for orig_foco, count in focos.items():
                n_orig = norm(orig_foco)
                spaced = split_camel_case(orig_foco) if re.search(r'([a-z])([A-Z])', orig_foco) else orig_foco
                n_spaced = norm(spaced)
                
                dest_foco = None
                sub_promoted = None
                rule = None

                # Passo A: Regras Clinicas Especializadas Ouro
                for pattern, target, target_esp in CLINICAL_RULES_EXPANDED:
                    if re.search(pattern, n_spaced) or re.search(pattern, n_orig):
                        dest_foco = target
                        rule = "REGRA_CLINICA_CANONICA"
                        if spaced != target and not norm(target) in norm(spaced):
                            sub_cand = spaced.title()
                            for p in [' Da ', ' De ', ' Do ', ' Em ', ' E ', ' Na ', ' No ', ' Dos ', ' Das ']:
                                sub_cand = sub_cand.replace(p, p.lower())
                            sub_promoted = sub_cand
                        break

                # Passo B: Se nao casou, testar ancoras do proprio tema
                if not dest_foco:
                    f_kw = extract_kw(spaced)
                    best_anc = None
                    max_overlap = 0
                    for anc, akw in anchors:
                        overlap = len(f_kw.intersection(akw))
                        if overlap > max_overlap:
                            max_overlap = overlap
                            best_anc = anc
                    if best_anc and max_overlap >= 1:
                        dest_foco = best_anc
                        rule = "SUBSUNCAO_ANCORA_TEMA"
                        if spaced != best_anc:
                            sub_cand = spaced.title()
                            for p in [' Da ', ' De ', ' Do ', ' Em ', ' E ', ' Na ', ' No ', ' Dos ', ' Das ']:
                                sub_cand = sub_cand.replace(p, p.lower())
                            sub_promoted = sub_cand

                # Passo C: Se ainda nao casou, formatar como titulo canonico limpo
                if not dest_foco:
                    clean_title = spaced.title()
                    for p in [' Da ', ' De ', ' Do ', ' Em ', ' E ', ' Na ', ' No ', ' Dos ', ' Das ']:
                        clean_title = clean_title.replace(p, p.lower())
                    dest_foco = clean_title
                    rule = "CANONICO_DIRETO" if not re.search(r'([a-z])([A-Z])', orig_foco) else "CAMELCASE_FORMATADO"

                # Blindagem: se o destino ainda tiver CamelCase
                if bool(re.search(r'([a-z])([A-Z])', dest_foco)) and not ('(' in dest_foco and ')' in dest_foco):
                    dest_foco = split_camel_case(dest_foco).title()
                    for p in [' Da ', ' De ', ' Do ', ' Em ', ' E ', ' Na ', ' No ', ' Dos ', ' Das ']:
                        dest_foco = dest_foco.replace(p, p.lower())

                # Garantir que subfoco sugerido != foco destino
                if sub_promoted and norm(sub_promoted) == norm(dest_foco):
                    sub_promoted = None

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
                dest_focos_global.add(dest_foco)
                rule_counter[rule] += 1

    total_orig_focos = len(canonical_map)
    total_dest_focos = len(dest_focos_global)
    reduction_pct = (1 - (total_dest_focos / total_orig_focos)) * 100

    print(f"\n--- METRICAS DA MATRIZ CANONICA OURO ---")
    print(f"Total de pares (esp, tema, foco) mapeados: {total_orig_focos:,}")
    print(f"Total de focos canonicos resultantes globais: {total_dest_focos:,}")
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
            "total_focos_destino_unicos": total_dest_focos,
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
