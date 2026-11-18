import json

# Carregar imagens curadas de dominio publico
with open('data/knowledge/public_domain_medical_images.json', 'r', encoding='utf-8') as f:
    public_catalog = json.load(f)

# Carregar os 385 cards
with open('src/data/clinicalTipsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = '
start_idx = text.find(prefix) + len(prefix)
end_idx = text.rfind('];') + 1

cards = json.loads(text[start_idx:end_idx])

# Dicionário de regras médicas estritas (1:1 Ground Truth)
# Chave: foco_id ou padrão de correspondência estrito por especialidade
EXACT_MEDICAL_IMAGE_RULES = [
    # --- CLÍNICA MÉDICA ---
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'isquêmica' in f.lower() or 'iam' in f.lower() or 'coronariana' in f.lower(),
        'image_key': 'iam_supra_st'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'taquiarritmia' in f.lower() or 'taquicardia supraventricular' in f.lower(),
        'image_key': 'taquicardia_supraventricular'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'fibrilação atrial' in f.lower() or 'flutter' in f.lower(),
        'image_key': 'fibrilacao_atrial'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'bradiarritmia' in f.lower() or 'bloqueio atrioventricular' in f.lower() or 'bavt' in f.lower(),
        'image_key': 'bavt_ecg'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'pericárdio' in f.lower() or 'pericardite' in f.lower(),
        'image_key': 'pericardite_ecg'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'potássio' in f.lower() or 'hipercalemia' in f.lower(),
        'image_key': 'hipercalemia_ecg'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'obstrutivas das vias aéreas' in f.lower() or 'dpoc' in f.lower() or 'enfisema' in f.lower(),
        'image_key': 'dpoc_enfisema_rx'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'pleurais' in f.lower() and ('pneumotórax' in f.lower() or 'derrame' in f.lower()),
        'image_key': 'pneumotorax_rx'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'tuberculose' in f.lower() or 'micobacteriose' in f.lower(),
        'image_key': 'tuberculose_rx'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'pneumonia' in f.lower() and 'comunidade' in f.lower(),
        'image_key': 'pneumonia_lobar_rx'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'vesícula' in f.lower() and 'vias biliares' in f.lower(),
        'image_key': 'colecistite_usg'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'avc' in f.lower() or 'isquêmico' in f.lower() and 'cerebral' in f.lower(),
        'image_key': 'avc_isquemico_tc'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'psoríase' in f.lower() or 'eritêmato-descamativa' in f.lower(),
        'image_key': 'psoriase_dermato'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'hanseníase' in f.lower(),
        'image_key': 'hanseniase_dermato'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'câncer de pele' in f.lower() or 'melanoma' in f.lower(),
        'image_key': 'melanoma_isic'
    },
    {
        'specialty': 'Clínica Médica',
        'foco_match': lambda f, t: 'zoster' in f.lower() or 'varicela' in f.lower(),
        'image_key': 'herpes_zoster_dermato'
    },

    # --- CIRURGIA GERAL ---
    {
        'specialty': 'Cirurgia Geral',
        'foco_match': lambda f, t: 'apendicite' in f.lower() or 'abdome agudo inflamatório' in f.lower(),
        'image_key': 'apendicite_tc'
    },
    {
        'specialty': 'Cirurgia Geral',
        'foco_match': lambda f, t: 'obstrutivo' in f.lower() or 'obstrução intestinal' in f.lower(),
        'image_key': 'obstrucao_delgado_rx'
    },
    {
        'specialty': 'Cirurgia Geral',
        'foco_match': lambda f, t: 'perfurativo' in f.lower() or 'pneumoperitônio' in f.lower(),
        'image_key': 'pneumoperitonio_rx'
    },
    {
        'specialty': 'Cirurgia Geral',
        'foco_match': lambda f, t: 'volvo' in f.lower() or 'sigmoide' in f.lower(),
        'image_key': 'volvo_sigmoide_rx'
    },
    {
        'specialty': 'Cirurgia Geral',
        'foco_match': lambda f, t: 'colelitíase' in f.lower() or 'colecistite' in f.lower(),
        'image_key': 'colecistite_usg'
    },
    {
        'specialty': 'Cirurgia Geral',
        'foco_match': lambda f, t: 'derrame pleural' in f.lower() or 'empiema' in f.lower(),
        'image_key': 'derrame_pleural_rx'
    },
    {
        'specialty': 'Cirurgia Geral',
        'foco_match': lambda f, t: 'pneumotórax' in f.lower(),
        'image_key': 'pneumotorax_rx'
    },

    # --- PEDIATRIA ---
    {
        'specialty': 'Pediatria',
        'foco_match': lambda f, t: 'crescimento' in f.lower() and ('estatura' in f.lower() or 'ponderoestatural' in f.lower()),
        'image_key': 'curva_crescimento_oms'
    },

    # --- GINECOLOGIA ---
    {
        'specialty': 'Ginecologia',
        'foco_match': lambda f, t: 'bi-rads' in f.lower() or ('câncer de mama' in f.lower() and 'rastreamento' in f.lower()),
        'image_key': 'mamografia_birads'
    },
    {
        'specialty': 'Ginecologia',
        'foco_match': lambda f, t: 'ovários policísticos' in f.lower() or 'sop' in f.lower(),
        'image_key': 'sop_usg'
    },
    {
        'specialty': 'Ginecologia',
        'foco_match': lambda f, t: 'cistos e tumores ovarianos' in f.lower() or 'cisto ovariano' in f.lower(),
        'image_key': 'cisto_ovario_usg'
    },

    # --- OBSTETRÍCIA ---
    {
        'specialty': 'Obstetrícia',
        'foco_match': lambda f, t: 'placenta prévia' in f.lower(),
        'image_key': 'placenta_previa_usg'
    },
    {
        'specialty': 'Obstetrícia',
        'foco_match': lambda f, t: 'partograma' in f.lower() or 'distócias' in f.lower() or 'mecanismo do parto' in f.lower(),
        'image_key': 'partograma_grafico'
    },
    {
        'specialty': 'Obstetrícia',
        'foco_match': lambda f, t: 'cardiotocografia' in f.lower() or 'vitalidade fetal' in f.lower() or 'dopplervelocimetria' in f.lower(),
        'image_key': 'cardiotocografia_dip'
    },

    # --- MEDICINA PREVENTIVA ---
    {
        'specialty': 'Medicina Preventiva e Social',
        'foco_match': lambda f, t: 'curva roc' in f.lower() or 'sensibilidade e especificidade' in f.lower() or 'testes diagnósticos' in f.lower(),
        'image_key': 'curva_roc_grafico'
    }
]

print("Regras estritas compiladas com sucesso!")
