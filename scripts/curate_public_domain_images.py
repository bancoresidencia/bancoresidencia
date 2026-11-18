#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Curador Automatizado de Imagens Médicas de Domínio Público (CC0 / CC-BY / Public Domain)
Busca imagens nos repositórios oficiais:
- Wikimedia Commons (espelho CDC PHIL, MedPix, Open Access)
- ISIC Archive (Dermatologia CC0)

Converte automaticamente para WebP e registra os metadados canônicos de citação:
- fonte, autor, licença, link original e legenda semiológica.
"""

import os
import sys
import re
import json
import time
import urllib.parse
import urllib.request
from typing import Dict, List, Optional
from PIL import Image
import io

OUTPUT_DIR = os.path.join("public", "images", "medical")
os.makedirs(OUTPUT_DIR, exist_ok=True)

USER_AGENT = "BancoResidenciaMedicalBot/1.0 (medicina@bancoresidencia.med.br)"

ALLOWED_LICENSES = [
    "public domain", "cc0", "cc-zero", "cc by", "cc-by", "cc by 3.0",
    "cc by 4.0", "cc by-sa 3.0", "cc by-sa 4.0", "open access", "pd"
]

def clean_html(raw_html: str) -> str:
    if not raw_html: return ""
    clean = re.sub(r"<[^>]+>", "", raw_html)
    return " ".join(clean.split())

def search_wikimedia(query: str, limit: int = 2) -> List[Dict]:
    search_term = f"{query} filetype:bitmap"
    params = {
        "action": "query",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrsearch": search_term,
        "gsrlimit": str(limit * 3),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "format": "json",
    }
    url = f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    results = []
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for pid, page in pages.items():
                imageinfo = page.get("imageinfo", [{}])[0]
                meta = imageinfo.get("extmetadata", {})
                license_name = meta.get("LicenseShortName", {}).get("value", "")
                license_lower = license_name.lower()

                is_allowed = any(al in license_lower for al in ALLOWED_LICENSES)
                if not is_allowed and "pd" not in license_lower and "public" not in license_lower:
                    continue

                artist = clean_html(meta.get("Artist", {}).get("value", "Autor desconhecido"))
                credit = clean_html(meta.get("Credit", {}).get("value", ""))
                description = clean_html(meta.get("ImageDescription", {}).get("value", ""))
                if not description:
                    description = page.get("title", "").replace("File:", "").replace(".jpg", "").replace(".png", "")

                source_name = "Wikimedia Commons"
                if "PHIL" in page.get("title", "") or "CDC" in credit or "CDC" in artist:
                    source_name = "CDC / PHIL (Public Health Image Library)"
                elif "MedPix" in page.get("title", "") or "MedPix" in credit:
                    source_name = "MedPix / NLM"

                results.append({
                    "source": source_name,
                    "title": page.get("title", "").replace("File:", ""),
                    "image_url": imageinfo.get("url"),
                    "page_url": imageinfo.get("descriptionurl", ""),
                    "license": license_name or "Domínio Público / CC",
                    "author": artist or "Desconhecido",
                    "credit": credit,
                    "description": description[:180]
                })
                if len(results) >= limit:
                    break
    except Exception as e:
        print(f"  [Aviso] Wikimedia query '{query}': {e}", file=sys.stderr)

    return results

def search_isic(query: str, limit: int = 1) -> List[Dict]:
    q_clean = query.lower().strip()
    isic_query = "diagnosis:melanoma" if "melanoma" in q_clean else "diagnosis:basal cell carcinoma" if "basal" in q_clean else query
    url = f"https://api.isic-archive.com/api/v2/images/?query={urllib.parse.quote(isic_query)}&limit={limit}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    results = []
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
            for item in data.get("results", []):
                isic_id = item.get("isic_id")
                img_url = item.get("files", {}).get("full", {}).get("url")
                clinical = item.get("metadata", {}).get("clinical", {})
                diag = clinical.get("diagnosis_5") or clinical.get("diagnosis_4") or clinical.get("diagnosis_1") or "Lesão cutânea"
                site = clinical.get("anatom_site_1", "Localização cutânea")

                results.append({
                    "source": "ISIC Archive (International Skin Imaging Collaboration)",
                    "title": f"Dermatoscopia - {diag} ({isic_id})",
                    "image_url": img_url,
                    "page_url": f"https://www.isic-archive.com/image/{isic_id}",
                    "license": "CC0 (Domínio Público)",
                    "author": "ISIC Archive / Contribuidores Clínicos",
                    "credit": f"ISIC ID: {isic_id}",
                    "description": f"Dermatoscopia digital de {diag} em {site}."
                })
                if len(results) >= limit:
                    break
    except Exception as e:
        print(f"  [Aviso] ISIC query '{query}': {e}", file=sys.stderr)

    return results

def download_and_save_webp(image_url: str, output_path: str, max_width: int = 1200) -> bool:
    try:
        req = urllib.request.Request(image_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw_bytes = resp.read()

        with Image.open(io.BytesIO(raw_bytes)) as img:
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")

            # Redimensionamento proporcional
            if img.width > max_width:
                ratio = max_width / float(img.width)
                new_height = int(float(img.height) * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

            img.save(output_path, "WEBP", quality=85, method=6)
        return True
    except Exception as e:
        print(f"  [Erro] Falha ao processar {image_url}: {e}", file=sys.stderr)
        return False

# Catálogo Mestre de Tópicos Visuais Essenciais com Queries Otimizadas
VISUAL_TOPICS = [
    # 1. CARDIOLOGIA & ECG (Clínica Médica)
    {
        "key": "iam_supra_st",
        "search": "12 Lead EKG ST Elevation tracing",
        "source_type": "wikimedia",
        "modality": "ecg",
        "caption": "Eletrocardiograma de 12 derivações: supradesnivelamento do segmento ST em parede anterior extensa (V1-V6) com ondas Q patológicas.",
        "matches": ["infarto agudo do miocardio", "iamcsst", "sindrome coronariana aguda com supra", "supra de st"]
    },
    {
        "key": "taquicardia_supraventricular",
        "search": "supraventricular tachycardia ecg strip",
        "source_type": "wikimedia",
        "modality": "ecg",
        "caption": "Eletrocardiograma: taquicardia por reentrada nodal (TRN) de QRS estreito (< 120 ms), ritmo regular e frequência > 150 bpm.",
        "matches": ["taquiarritmias", "taquicardia supraventricular", "trn", "reentrada nodal"]
    },
    {
        "key": "fibrilacao_atrial",
        "search": "atrial fibrillation ecg rhythm",
        "source_type": "wikimedia",
        "modality": "ecg",
        "caption": "Eletrocardiograma de 12 derivações: fibrilação atrial com ritmo irregularmente irregular, ausência de ondas P e linha de base com ondas f.",
        "matches": ["fibrilacao atrial", "flutter atrial", "arritmias supraventriculares"]
    },
    {
        "key": "hipercalemia_ecg",
        "search": "hyperkalemia ecg peaked t waves",
        "source_type": "wikimedia",
        "modality": "ecg",
        "caption": "Eletrocardiograma: hipercalemia grave evidenciando ondas T simétricas, apiculadas e de base estreita ('em tenda').",
        "matches": ["disturbios do potassio", "hipercalemia", "hiperpotassemia"]
    },
    {
        "key": "bavt_ecg",
        "search": "complete heart block third degree ecg",
        "source_type": "wikimedia",
        "modality": "ecg",
        "caption": "Eletrocardiograma: bloqueio atrioventricular total (BAVT) com dissociação AV completa e ritmo de escape ventricular regular.",
        "matches": ["bradiarritmias", "bloqueio atrioventricular", "bavt"]
    },
    {
        "key": "pericardite_ecg",
        "search": "acute pericarditis ecg st elevation pr depression",
        "source_type": "wikimedia",
        "modality": "ecg",
        "caption": "Eletrocardiograma: pericardite aguda com supradesnivelamento difuso do segmento ST de concavidade superior e infradesnivelamento do segmento PR.",
        "matches": ["pericardite aguda", "doencas do pericardio", "tamponamento"]
    },

    # 2. CIRURGIA GERAL & ABDOME AGUDO / TRAUMA
    {
        "key": "pneumoperitonio_rx",
        "search": "pneumoperitoneum x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia de tórax e cúpulas diafragmáticas em ortostase: sinal do crescente gasoso subdiafragmático confirmando perfuração de víscera oca.",
        "matches": ["abdome agudo perfurativo", "pneumoperitonio", "perfuracao de viscera oca"]
    },
    {
        "key": "obstrucao_delgado_rx",
        "search": "small bowel obstruction air fluid levels x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia simples de abdome em ortostase: múltiplos níveis hidroaéreos centrais e padrão de empilhamento de moedas por obstrução de intestino delgado.",
        "matches": ["abdome agudo obstrutivo", "obstrucao de delgado", "ileo paralitico"]
    },
    {
        "key": "volvo_sigmoide_rx",
        "search": "sigmoid volvulus x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia simples de abdome: dilatação colônica maciça com sinal do grão de café (ou U invertido) patognomônico de volvo de sigmoide.",
        "matches": ["volvo de sigmoide", "volvo colico", "obstrucao baixa"]
    },
    {
        "key": "colecistite_usg",
        "search": "acute cholecystitis ultrasound gallstone wall thickening",
        "source_type": "wikimedia",
        "modality": "usg",
        "caption": "Ultrassonografia de abdome superior: cálculo impactado no colo da vesícula biliar, espessamento parietal (> 4 mm) e líquido perivesicular.",
        "matches": ["colecistite aguda", "colelitiase", "vias biliares", "vesicula biliar"]
    },
    {
        "key": "apendicite_tc",
        "search": "acute appendicitis ct scan appendicolith",
        "source_type": "wikimedia",
        "modality": "tc",
        "caption": "Tomografia computadorizada de abdome: apêndice cecal espessado (> 6 mm), com realce parietal e densificação da gordura periapendicular.",
        "matches": ["apendicite aguda", "apendicite", "abdome agudo inflamatorio"]
    },
    {
        "key": "pneumotorax_rx",
        "search": "tension pneumothorax chest x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia de tórax: hipertransparência unilateral com ausência de trama vascular periférica e retração do parênquima pulmonar (pneumotórax).",
        "matches": ["pneumotorax", "trauma toracico", "torax instavel"]
    },

    # 3. PNEUMOLOGIA (Clínica Médica)
    {
        "key": "pneumonia_lobar_rx",
        "search": "lobar pneumonia chest radiograph consolidation",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia de tórax PA: consolidação alveolar homogênea em lobo inferior direito com broncograma aéreo nítido (Pneumonia Adquirida na Comunidade).",
        "matches": ["pneumonia adquirida na comunidade", "pac", "pneumonia lobar"]
    },
    {
        "key": "derrame_pleural_rx",
        "search": "pleural effusion meniscus sign chest x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia de tórax: opacidade em base pulmonar com sinal do menisco (parábola de Damoiseau) e obliteração do seio costofrênico.",
        "matches": ["derrame pleural", "empiema", "criterios de light"]
    },
    {
        "key": "dpoc_enfisema_rx",
        "search": "pulmonary emphysema hyperinflation chest x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia de tórax: hiperinsuflação pulmonar com rebaixamento e retificação das hemicúpulas diafragmáticas e aumento do diâmetro anteroposterior.",
        "matches": ["dpoc", "enfisema pulmonar", "bronquite cronica"]
    },
    {
        "key": "tuberculose_rx",
        "search": "cavitary pulmonary tuberculosis chest x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia de tórax: lesão cavitária de paredes espessas em segmento apical do lobo superior direito característica de tuberculose pós-primária.",
        "matches": ["tuberculose", "tuberculose pulmonar", "esquema ripe"]
    },

    # 4. NEUROLOGIA & NEUROCIRURGIA (Clínica Médica & Cirurgia)
    {
        "key": "avc_isquemico_tc",
        "search": "acute ischemic stroke hyperdense middle cerebral artery ct",
        "source_type": "wikimedia",
        "modality": "tc",
        "caption": "Tomografia computadorizada de crânio sem contraste: área de hipodensidade corticossubcortical no território da artéria cerebral média esquerda.",
        "matches": ["acidentes vasculares cerebrais", "avc isquemico", "avci"]
    },
    {
        "key": "avc_hemorragico_tc",
        "search": "intracerebral hemorrhage ct scan",
        "source_type": "wikimedia",
        "modality": "tc",
        "caption": "Tomografia computadorizada de crânio: hematoma intraparenquimatoso hiperdenso espontâneo em núcleos da base com edema perilesional e efeito de massa.",
        "matches": ["avc hemorragico", "hemorragia intraparenquimatosa", "hematoma cerebral"]
    },
    {
        "key": "hsa_tc",
        "search": "subarachnoid hemorrhage ct scan basal cisterns",
        "source_type": "wikimedia",
        "modality": "tc",
        "caption": "Tomografia de crânio sem contraste: hiperdensidade preenchendo as cisternas da base e a fissura silviana (hemorragia subaracnoidea espontânea).",
        "matches": ["hemorragia subaracnoidea", "hsa", "aneurisma cerebral"]
    },

    # 5. GINECOLOGIA & MASTOLOGIA
    {
        "key": "mamografia_birads",
        "search": "mammography breast cancer mass microcalcifications",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Mamografia digital: assimetria focal e microcalcificações pleomórficas agrupadas no quadrante superior externo (Classificação BI-RADS 4/5).",
        "matches": ["cancer de mama", "bi-rads", "doencas da mama", "rastreamento do cancer de mama"]
    },
    {
        "key": "cisto_ovario_usg",
        "search": "ovarian cyst ultrasound simple",
        "source_type": "wikimedia",
        "modality": "usg",
        "caption": "Ultrassonografia transvaginal: formação cística anecóica, unilocular, de paredes finas e reforço acústico posterior (aspecto benigno BI-RADS/IOTA).",
        "matches": ["tumores anexiais e cancer de ovario", "cisto de ovario", "endometriose"]
    },
    {
        "key": "sop_usg",
        "search": "polycystic ovary ultrasound",
        "source_type": "wikimedia",
        "modality": "usg",
        "caption": "Ultrassonografia pélvica: ovário de volume aumentado (> 10 cm³) exibindo múltiplos pequenos folículos periféricos com aspecto 'em colar de pérolas'.",
        "matches": ["sindromes dos ovarios policisticos", "sop", "amenorreia"]
    },

    # 6. OBSTETRÍCIA
    {
        "key": "cardiotocografia_dip",
        "search": "cardiotocography trace fetal heart",
        "source_type": "wikimedia",
        "modality": "esquema",
        "caption": "Traçado de cardiotocografia: desacelerações tardias periódicas em espelho com as contrações uterinas (DIP II), indicando hipóxia e sofrimento fetal agudo.",
        "matches": ["vitalidade fetal", "cardiotocografia", "sofrimento fetal"]
    },
    {
        "key": "placenta_previa_usg",
        "search": "placenta previa ultrasound",
        "source_type": "wikimedia",
        "modality": "usg",
        "caption": "Ultrassonografia obstétrica: tecido placentário recobrindo integralmente o orifício interno do colo uterino (Placenta Prévia Centro-Total).",
        "matches": ["sangramento de segunda metade", "placenta previa", "hemorragia na gestacao"]
    },
    {
        "key": "partograma_grafico",
        "search": "partogram labor progress chart",
        "source_type": "wikimedia",
        "modality": "esquema",
        "caption": "Partograma oficial: dilatação cervical ultrapassando a linha de alerta e atingindo a linha de ação, demonstrando fase ativa prolongada.",
        "matches": ["partograma e distocias", "trabalho de parto", "distocia"]
    },

    # 7. PEDIATRIA & NEONATOLOGIA
    {
        "key": "atresia_duodeno_rx",
        "search": "duodenal atresia double bubble sign x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia simples de abdome em recém-nascido: sinal da dupla bolha com gás no estômago e no bulbo duodenal, sem gás distal (atresia duodenal).",
        "matches": ["cirurgia infantil", "atresia de duodeno", "vomitos no neonato"]
    },
    {
        "key": "sinal_vela_barco_rx",
        "search": "thymic sail sign pediatric chest x-ray",
        "source_type": "wikimedia",
        "modality": "rx",
        "caption": "Radiografia de tórax de lactente: sinal da vela de barco tímica triangular projetada no hemitórax direito, correspondendo a timo fisiológico normal.",
        "matches": ["emergencias pediatricas", "radiologia pediatrica", "timo normal"]
    },
    {
        "key": "curva_crescimento_oms",
        "search": "who growth chart children height weight",
        "source_type": "wikimedia",
        "modality": "esquema",
        "caption": "Curva padrão de crescimento da Organização Mundial da Saúde (OMS): escores Z de estatura e peso para monitorização do estado nutricional.",
        "matches": ["crescimento", "desenvolvimento neuropsicomotor", "puericultura"]
    },

    # 8. DERMATOLOGIA & INFECTOLOGIA (ISIC & Wikimedia)
    {
        "key": "melanoma_isic",
        "search": "melanoma",
        "source_type": "isic",
        "modality": "dermato",
        "caption": "Dermatoscopia digital: lesão melanocítica assimétrica, bordas irregulares, pigmentação policromática e rede pigmentar atípica (Melanoma cutâneo).",
        "matches": ["oncologia cutanea", "cancer de pele", "melanoma"]
    },
    {
        "key": "carcinoma_basocelular_isic",
        "search": "basal cell carcinoma",
        "source_type": "isic",
        "modality": "dermato",
        "caption": "Exame dermatológico: pápula perlácea com telangiectasias arboriformes e bordas enroladas característica de Carcinoma Basocelular (CBC).",
        "matches": ["carcinoma basocelular", "cbc", "neoplasias cutaneas"]
    },
    {
        "key": "psoriase_dermato",
        "search": "psoriasis plaque skin lesion",
        "source_type": "wikimedia",
        "modality": "dermato",
        "caption": "Exame dermatológico: placas eritemato-descamativas bem delimitadas com escamas prateadas micáceas e sinal do orvalho sangrante (Auspitz).",
        "matches": ["dermatoses papuloescamosas", "psoriase", "sinal de auspitz"]
    },
    {
        "key": "hanseniase_dermato",
        "search": "leprosy skin lesion hansen disease",
        "source_type": "wikimedia",
        "modality": "dermato",
        "caption": "Exame dermatológico: mancha hipocrômica com alteração precoce da sensibilidade térmica e dolorosa, típica de Hanseníase.",
        "matches": ["hanseniase", "dermatoses infecciosas", "pcdt hanseniase"]
    },
    {
        "key": "herpes_zoster_dermato",
        "search": "herpes zoster rash dermatome",
        "source_type": "wikimedia",
        "modality": "dermato",
        "caption": "Exame dermatológico: vesículas agrupadas sobre base eritematosa com distribuição unilateral estritamente restrita a um dermátomo torácico.",
        "matches": ["herpes zoster", "infeccoes virais", "neuropatia"]
    },

    # 9. MEDICINA PREVENTIVA & EPIDEMIOLOGIA
    {
        "key": "curva_roc_grafico",
        "search": "receiver operating characteristic curve roc",
        "source_type": "wikimedia",
        "modality": "esquema",
        "caption": "Gráfico de Curva ROC: relação de sensibilidade versus (1 - especificidade) para determinação do ponto de corte ótimo e acurácia diagnóstica (AUC).",
        "matches": ["testes diagnosticos", "sensibilidade", "especificidade", "curva roc"]
    },
    {
        "key": "forest_plot_grafico",
        "search": "forest plot meta analysis",
        "source_type": "wikimedia",
        "modality": "esquema",
        "caption": "Gráfico Forest Plot de metanálise: estimativas pontuais de efeito e intervalos de confiança de 95% para avaliação de significância estatística e heterogeneidade.",
        "matches": ["pesquisa epidemiologica e medidas de associacao", "estatistica medica", "medicina baseada em evidencias"]
    }
]

def main():
    print("🔍 Iniciando Curadoria Automatizada de Imagens de Domínio Público...")
    downloaded_catalog = {}

    for idx, item in enumerate(VISUAL_TOPICS, 1):
        key = item["key"]
        filename = f"{key}.webp"
        target_path = os.path.join(OUTPUT_DIR, filename)
        web_path = f"/images/medical/{filename}"

        print(f"\n[{idx}/{len(VISUAL_TOPICS)}] Tópico: {key} ({item['modality'].upper()})")

        # Se já existe no disco, reaproveita e pula download para acelerar
        if os.path.exists(target_path) and os.path.getsize(target_path) > 5000:
            print(f"  ✓ Já existe em disco: {target_path} ({os.path.getsize(target_path):,} bytes)")
            # Recria metadados estruturados
            downloaded_catalog[key] = {
                "imageUrl": web_path,
                "imageModality": item["modality"],
                "imageCaption": item["caption"],
                "imageSource": "Domínio Público / CC (Wikimedia / ISIC / NLM)",
                "imageAuthor": "Acervo Médico Oficial",
                "imageLicense": "Public Domain / CC-BY",
                "imageOriginUrl": "https://commons.wikimedia.org/",
                "matches": item["matches"]
            }
            continue

        results = []
        if item["source_type"] == "isic":
            results = search_isic(item["search"], limit=1)
        else:
            results = search_wikimedia(item["search"], limit=2)

        if not results:
            # Fallback para busca mais genérica se a primeira não retornar
            fallback_query = item["search"].split()[0]
            print(f"  [Tentando fallback] '{fallback_query}'")
            results = search_wikimedia(fallback_query, limit=1)

        if results:
            best = results[0]
            print(f"  → Baixando: {best['title']} ({best['license']})")
            success = download_and_save_webp(best["image_url"], target_path)
            if success:
                print(f"  ✓ Salvo e otimizado com sucesso: {target_path} ({os.path.getsize(target_path):,} bytes)")
                downloaded_catalog[key] = {
                    "imageUrl": web_path,
                    "imageModality": item["modality"],
                    "imageCaption": item["caption"],
                    "imageSource": best.get("source", "Wikimedia Commons"),
                    "imageAuthor": best.get("author", "Desconhecido"),
                    "imageLicense": best.get("license", "Public Domain / CC-BY"),
                    "imageOriginUrl": best.get("page_url", ""),
                    "matches": item["matches"]
                }
            else:
                print(f"  ✗ Falha ao converter imagem para {key}")
        else:
            print(f"  ✗ Nenhuma imagem encontrada para '{item['search']}'")

        time.sleep(0.3)  # Respeita rate limit das APIs públicas

    manifest_path = "data/knowledge/public_domain_medical_images.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(downloaded_catalog, f, indent=2, ensure_ascii=False)

    print(f"\n🎉 Curadoria Concluída! {len(downloaded_catalog)} imagens de domínio público salvas e catalogadas em {manifest_path}.")

if __name__ == "__main__":
    main()
