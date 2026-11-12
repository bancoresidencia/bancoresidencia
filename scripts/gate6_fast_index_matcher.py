import json
import os
import re
import fitz

print("=" * 80)
print("🚀 GATE 6: INDEXADOR ULTRARRÁPIDO E MOTOR DE BUSCA DE PROVAS LOCAIS")
print("=" * 80)

CATALOG_PATH = "data/supabase_tables/gate6_missing_catalog.json"
EXAMS_DIR = "data/official_exams"
OUT_IMG_DIR = "data/imagens_resgatadas_gate6"
os.makedirs(OUT_IMG_DIR, exist_ok=True)

with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    catalog_data = json.load(f)

questions = catalog_data.get("catalog", [])
print(f"Total de questões no catálogo do Gate 6: {len(questions)}")

# Filtrar PDFs apenas das bancas relevantes para economizar tempo
relevant_folders = ["USP_FUVEST", "SANTA_CASA_SP", "UNICAMP", "IAMSPE", "FMABC", "ENARE", "SES_DF", "SES_GO", "SES_PE", "PSU_MG", "AMRIGS"]
target_pdfs = []

for folder in relevant_folders:
    folder_path = os.path.join(EXAMS_DIR, folder)
    if os.path.exists(folder_path):
        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.lower().endswith(".pdf") and not file.lower().endswith("_gb.pdf") and "gabarito" not in file.lower():
                    target_pdfs.append(os.path.join(root, file))

print(f"Total de cadernos de prova selecionados para indexação: {len(target_pdfs)}")

def normalize_text(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())

# Indexar páginas dos PDFs selecionados (lê cada PDF apenas UMA vez)
print("Indexando páginas dos cadernos em memória...")
pages_index = []

for pdf_path in target_pdfs:
    try:
        doc = fitz.open(pdf_path)
        for pno in range(len(doc)):
            page = doc[pno]
            raw_text = page.get_text()
            norm = normalize_text(raw_text)
            imgs = page.get_images()
            # Só indexa se tiver texto relevante
            if len(norm) > 50:
                pages_index.append({
                    "pdf_path": pdf_path,
                    "rel_path": os.path.relpath(pdf_path, EXAMS_DIR).replace("\\", "/"),
                    "filename": os.path.basename(pdf_path),
                    "page_num": pno + 1,
                    "norm_text": norm,
                    "images_count": len(imgs)
                })
        doc.close()
    except Exception as e:
        continue

print(f"✅ Total de páginas indexadas: {len(pages_index)} (em {len(target_pdfs)} cadernos)")

# Cruzar as 737 questões contra as páginas indexadas
matches_found = []
missing_local_for_web = []

for q in questions:
    q_banca = (q.get("banca") or q.get("institution") or "").lower()
    q_year = str(q.get("year") or "")
    q_stmt = q.get("statement_snippet") or ""
    q_norm = normalize_text(q_stmt)
    
    # Extrair um fragmento representativo de 40 a 60 caracteres
    tokens = [t for t in q_norm.split() if len(t) > 3]
    if len(tokens) < 4:
        missing_local_for_web.append(q)
        continue
        
    search_fragment = " ".join(tokens[:7])
    
    # Buscar páginas que contenham o fragmento
    matched_page = None
    for p in pages_index:
        # Se puder conferir ano ou banca
        if q_year and q_year in p["rel_path"]:
            if search_fragment in p["norm_text"]:
                matched_page = p
                break
        elif search_fragment in p["norm_text"]:
            matched_page = p
            break
            
    if matched_page:
        matches_found.append({
            "question_id": q["id"],
            "banca": q.get("banca"),
            "year": q.get("year"),
            "code": q.get("code"),
            "pdf": matched_page["rel_path"],
            "page": matched_page["page_num"],
            "page_has_images": matched_page["images_count"] > 0,
            "images_count": matched_page["images_count"],
            "matched_text": search_fragment
        })
    else:
        missing_local_for_web.append(q)

print("\n" + "=" * 80)
print("📊 RESULTADO DO MAPEAMENTO DO GATE 6:")
print("=" * 80)
print(f"1. Questões localizadas diretamente nos cadernos em disco: {len(matches_found)}")
print(f"   -> Dessas, páginas com imagens embutidas prontas para extração: {len([m for m in matches_found if m['page_has_images']])}")
print(f"2. Questões que necessitam de Web Search / Busca Externa: {len(missing_local_for_web)}")

# Salvar relatório do cruzamento
res_path = "data/supabase_tables/gate6_match_results.json"
with open(res_path, "w", encoding="utf-8") as f:
    json.dump({
        "timestamp": "2026-11-12",
        "matched_local": matches_found,
        "needed_web_search": missing_local_for_web
    }, f, indent=2, ensure_ascii=False)

print(f"Relatório de correspondência salvo em: {res_path}")

print("\nAmostra de 5 questões localizadas:")
for m in matches_found[:5]:
    print(f" - [{m['banca']} {m['year']}] {m['question_id']} -> {m['pdf']} (Pág {m['page']}, {m['images_count']} imagens)")

