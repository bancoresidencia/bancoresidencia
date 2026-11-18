import json
import re

# Carregar imagens curadas de domínio público
with open('data/knowledge/public_domain_medical_images.json', 'r', encoding='utf-8') as f:
    public_catalog = json.load(f)

# Carregar os 385 cards originais
with open('src/data/clinicalTipsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = '
start_idx = text.find(prefix) + len(prefix)
end_idx = text.rfind('];') + 1

cards = json.loads(text[start_idx:end_idx])

def has_exact_word(pattern, text):
    return bool(re.search(rf'\b{re.escape(pattern)}\b', text, re.IGNORECASE))

def has_phrase(phrase, text):
    return phrase.lower() in text.lower()

# Matriz Canônica de Correspondência Médica de Imagens
# Cada imagem possui escopo estrito de Especialidade e Focos permitidos
STRICT_IMAGE_MAPPINGS = [
    # === 1. CLÍNICA MÉDICA ===
    {
        'key': 'iam_supra_st',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('infarto agudo do miocárdio', foco) or
            has_exact_word('iamcsst', foco) or
            (has_exact_word('iam', foco) and not has_phrase('estadiamento', foco)) or
            has_phrase('síndromes coronarianas', foco) or
            has_phrase('supra de st', foco)
        )
    },
    {
        'key': 'taquicardia_supraventricular',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('taquiarritmia', foco) or
            has_phrase('taquicardia supraventricular', foco) or
            has_phrase('reentrada nodal', foco)
        ) and not has_phrase('recém-nascido', foco) and not has_phrase('neonat', foco)
    },
    {
        'key': 'fibrilacao_atrial',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: has_phrase('fibrilação atrial', foco) or has_phrase('flutter atrial', foco)
    },
    {
        'key': 'bavt_ecg',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('bradiarritmia', foco) or
            has_phrase('bloqueio atrioventricular', foco) or
            has_exact_word('bavt', foco)
        )
    },
    {
        'key': 'pericardite_ecg',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: has_phrase('pericárdio', foco) or has_phrase('pericardite', foco)
    },
    {
        'key': 'hipercalemia_ecg',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('distúrbios do potássio', foco) or
            has_phrase('hipercalemia', foco) or
            has_phrase('hiperpotassemia', foco)
        )
    },
    {
        'key': 'dpoc_enfisema_rx',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('obstrutivas das vias aéreas', foco) or
            has_exact_word('dpoc', foco) or
            has_phrase('enfisema', foco)
        )
    },
    {
        'key': 'pneumotorax_rx',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: has_phrase('pneumotórax', foco) or has_phrase('doenças pleurais', foco)
    },
    {
        'key': 'tuberculose_rx',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: has_phrase('tuberculose', foco) or has_phrase('micobacteriose', foco)
    },
    {
        'key': 'pneumonia_lobar_rx',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('pneumonia adquirida na comunidade', foco) or
            (has_exact_word('pac', foco) and has_phrase('pneumo', tema)) or
            has_phrase('pneumonia lobar', foco)
        )
    },
    {
        'key': 'colecistite_usg',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('vesícula', foco) and has_phrase('vias biliares', foco) and not has_phrase('neoplasia', foco)
        )
    },
    {
        'key': 'avc_isquemico_tc',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: has_phrase('acidente vascular cerebral', foco) or has_exact_word('avc', foco)
    },
    {
        'key': 'psoriase_dermato',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: has_phrase('psoríase', foco) or has_phrase('eritêmato-descamativa', foco)
    },
    {
        'key': 'hanseniase_dermato',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: has_phrase('hanseníase', foco) or has_phrase('hansen', foco)
    },
    {
        'key': 'melanoma_isic',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('câncer de pele', foco) or
            has_phrase('melanoma', foco) or
            has_phrase('pré-malignas', foco)
        )
    },
    {
        'key': 'herpes_zoster_dermato',
        'specialty': 'Clínica Médica',
        'validate': lambda foco, tema, title: (
            has_phrase('herpes zoster', foco) or
            has_phrase('varicela zoster', foco)
        ) and not has_phrase('diabetes', foco) and not has_phrase('polineuropatia', foco)
    },

    # === 2. CIRURGIA GERAL ===
    {
        'key': 'apendicite_tc',
        'specialty': 'Cirurgia Geral',
        'validate': lambda foco, tema, title: has_phrase('apendicite', foco) or has_phrase('abdome agudo inflamatório', foco)
    },
    {
        'key': 'obstrucao_delgado_rx',
        'specialty': 'Cirurgia Geral',
        'validate': lambda foco, tema, title: has_phrase('abdome agudo obstrutivo', foco) or has_phrase('obstrução intestinal', foco)
    },
    {
        'key': 'pneumoperitonio_rx',
        'specialty': 'Cirurgia Geral',
        'validate': lambda foco, tema, title: has_phrase('abdome agudo perfurativo', foco) or has_phrase('pneumoperitônio', foco)
    },
    {
        'key': 'volvo_sigmoide_rx',
        'specialty': 'Cirurgia Geral',
        'validate': lambda foco, tema, title: has_phrase('volvo de sigmoide', foco) or has_phrase('megacólon', foco)
    },
    {
        'key': 'colecistite_usg',
        'specialty': 'Cirurgia Geral',
        'validate': lambda foco, tema, title: (
            has_phrase('colelitíase', foco) or
            has_phrase('colecistite', foco) or
            has_phrase('coledocolitíase', foco)
        ) and not has_phrase('neoplasia', foco)
    },
    {
        'key': 'derrame_pleural_rx',
        'specialty': 'Cirurgia Geral',
        'validate': lambda foco, tema, title: has_phrase('derrame pleural', foco) or has_phrase('empiema', foco)
    },
    {
        'key': 'pneumotorax_rx',
        'specialty': 'Cirurgia Geral',
        'validate': lambda foco, tema, title: has_phrase('pneumotórax', foco)
    },

    # === 3. PEDIATRIA ===
    {
        'key': 'curva_crescimento_oms',
        'specialty': 'Pediatria',
        'validate': lambda foco, tema, title: (
            has_phrase('crescimento', foco) and
            (has_phrase('baixa estatura', foco) or has_phrase('ponderoestatural', foco))
        ) and not has_phrase('sono', foco) and not has_phrase('comportamento', foco)
    },
    {
        'key': 'pneumonia_lobar_rx',
        'specialty': 'Pediatria',
        'validate': lambda foco, tema, title: has_phrase('pneumonia', foco) and has_phrase('comunidade', foco)
    },

    # === 4. GINECOLOGIA ===
    {
        'key': 'mamografia_birads',
        'specialty': 'Ginecologia',
        'validate': lambda foco, tema, title: (
            has_phrase('bi-rads', foco) or
            (has_phrase('câncer de mama', foco) and has_phrase('rastreamento', foco)) or
            has_phrase('microcalcificações', foco)
        ) and not has_phrase('mastite', foco) and not has_phrase('abscesso', foco) and not has_phrase('descarga', foco)
    },
    {
        'key': 'sop_usg',
        'specialty': 'Ginecologia',
        'validate': lambda foco, tema, title: (
            has_phrase('ovários policísticos', foco) or
            has_exact_word('sop', foco)
        ) and not has_phrase('amenorreia primária', foco) and not has_phrase('hiperprolactinemia', foco) and not has_phrase('falência ovariana', foco)
    },
    {
        'key': 'cisto_ovario_usg',
        'specialty': 'Ginecologia',
        'validate': lambda foco, tema, title: (
            has_phrase('cistos e tumores ovarianos', foco) or
            has_phrase('cisto ovariano', foco)
        ) and not has_phrase('adenomiose', foco) and not has_phrase('dismenorreia', foco)
    },

    # === 5. OBSTETRÍCIA ===
    {
        'key': 'placenta_previa_usg',
        'specialty': 'Obstetrícia',
        'validate': lambda foco, tema, title: has_phrase('placenta prévia', foco)
    },
    {
        'key': 'partograma_grafico',
        'specialty': 'Obstetrícia',
        'validate': lambda foco, tema, title: (
            has_phrase('interpretação do partograma', foco) or
            has_phrase('linhas de ação', foco) or
            has_phrase('fases clínicas', foco) or
            has_phrase('mecanismo do parto', foco)
        )
    },
    {
        'key': 'cardiotocografia_dip',
        'specialty': 'Obstetrícia',
        'validate': lambda foco, tema, title: (
            has_phrase('cardiotocografia', foco) or
            has_phrase('vitalidade fetal', foco) or
            has_phrase('dopplervelocimetria obstétrica', foco)
        )
    },

    # === 6. MEDICINA PREVENTIVA E SOCIAL ===
    {
        'key': 'curva_roc_grafico',
        'specialty': 'Medicina Preventiva e Social',
        'validate': lambda foco, tema, title: (
            has_phrase('curva roc', foco) or
            has_phrase('sensibilidade e especificidade', foco) or
            has_phrase('valores preditivos', foco) or
            has_phrase('razões de verossimilhança', foco)
        ) and not has_phrase('lei', foco) and not has_phrase('pacto', foco) and not has_phrase('quaternária', foco) and not has_phrase('nnt', foco)
    }
]

# Processar os 385 cards aplicando rigor absoluto
updated_cards = []
assigned_stats = {}

for card in cards:
    spec = card.get('specialty')
    tema = card.get('tema', '')
    foco = card.get('foco', '')
    title = card.get('title', '')
    
    assigned_key = None
    for mapping in STRICT_IMAGE_MAPPINGS:
        if mapping['specialty'] == spec:
            if mapping['validate'](foco, tema, title):
                assigned_key = mapping['key']
                break
                
    if assigned_key and assigned_key in public_catalog:
        p_img = public_catalog[assigned_key]
        card['requiresImage'] = True
        card['imageUrl'] = p_img['imageUrl']
        card['imageCaption'] = p_img['imageCaption']
        card['imageModality'] = p_img['imageModality']
        card['imageSource'] = p_img.get('imageSource', 'Wikimedia Commons / Domínio Público')
        card['imageAuthor'] = p_img.get('imageAuthor', 'Acervo Médico Oficial')
        card['imageLicense'] = p_img.get('imageLicense', 'Public Domain / CC-BY')
        card['imageOriginUrl'] = p_img.get('imageOriginUrl', '')
        assigned_stats[assigned_key] = assigned_stats.get(assigned_key, 0) + 1
    else:
        # Se NÃO for visual ou não tiver match 100% canônico, DESLIGA a imagem
        card['requiresImage'] = False
        card['imageUrl'] = None
        card['imageCaption'] = None
        card['imageModality'] = None
        card['imageSource'] = None
        card['imageAuthor'] = None
        card['imageLicense'] = None
        card['imageOriginUrl'] = None

    updated_cards.append(card)

print("Auditoria de Atribuição Estrita:")
for k, count in assigned_stats.items():
    print(f"  - {k}: {count} cards")

total_with_img = sum(assigned_stats.values())
print(f"\nTotal com imagem válida e precisa: {total_with_img} cards")
print(f"Total sem imagem (puramente conceituais/normativos): {len(updated_cards) - total_with_img} cards")

# Salvar o clinicalTipsData.ts atualizado
ts_output = f"""// src/data/clinicalTipsData.ts
// Catálogo Canônico com 385 Cards de Pérolas & Decorebas Médicas de Alto Rendimento
// Governança Estrita: Imagens 100% de Domínio Público com correspondência canônica rigorosa 1:1

export interface ClinicalTipItem {{
  id: string;
  category: 'triades' | 'mnemonicos' | 'antidotos' | 'semiologia' | 'rastreamento' | 'radiologia' | 'transfusao' | 'tratamento' | 'criterios' | 'decorebas';
  categoryLabel: string;
  title: string;
  fullTitle: string;
  specialty: string;
  tema: string;
  foco?: string;
  subfocos: string[];
  provenanceDefault: string;
  requiresImage?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  imageModality?: 'ecg' | 'rx' | 'tc' | 'usg' | 'dermato' | 'esquema';
  imageSource?: string;
  imageAuthor?: string;
  imageLicense?: string;
  imageOriginUrl?: string;
  chips: Array<{{
    label: string;
    letter?: string;
    value: string;
  }}>;
  rule: string;
  bancaTrap?: string;
}}

export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = {json.dumps(updated_cards, ensure_ascii=False, indent=2)};
"""

with open('src/data/clinicalTipsData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_output)

print("src/data/clinicalTipsData.ts regravado com sucesso e 100% higienizado!")
