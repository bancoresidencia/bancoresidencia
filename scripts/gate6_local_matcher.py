import json
import os
import re
import fitz # PyMuPDF
from PIL import Image
import io

print("=" * 80)
print("🚀 GATE 6: MOTOR DE RESGATE LOCAL VIA CADERNOS OFICIAIS (PYMUPDF)")
print("=" * 80)

CATALOG_PATH = "data/supabase_tables/gate6_missing_catalog.json"
EXAMS_DIR = "data/official_exams"
OUT_IMG_DIR = "data/imagens_resgatadas_gate6"
os.makedirs(OUT_IMG_DIR, exist_ok=True)

with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    catalog_data = json.load(f)

questions = catalog_data.get("catalog", [])
print(f"Total de questões no catálogo do Gate 6: {len(questions)}")

# Indexar todos os PDFs locais por ano e termos de banca
pdf_index = []
for root, _, files in os.walk(EXAMS_DIR):
    for file in files:
        if file.lower().endswith(".pdf"):
            full_path = os.path.join(root, file)
            # extrair ano do nome do arquivo ou pasta
            years = re.findall(r"20\d\d", full_path)
            year = int(years[0]) if years else 0
            pdf_index.append({
                "path": full_path,
                "filename": file,
                "year": year,
                "folder": os.path.basename(root)
            })

print(f"Total de PDFs indexados em {EXAMS_DIR}: {len(pdf_index)}")

def normalize_text(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())

# Testar correspondência para os primeiros 50 itens
matched_count = 0
matches = []

for q in questions[:50]:
    q_banca = (q.get("banca") or q.get("institution") or "").lower()
    q_year = q.get("year") or 0
    q_stmt = q.get("statement_snippet") or ""
    q_norm = normalize_text(q_stmt[:120])
    
    # filtrar candidatos por ano
    candidates = [p for p in pdf_index if p["year"] == q_year]
    
    # filtrar por banca no caminho
    if "usp" in q_banca:
        candidates = [p for p in candidates if "usp" in p["path"].lower()]
    elif "santa casa" in q_banca:
        candidates = [p for p in candidates if "santa_casa" in p["path"].lower()]
    elif "unicamp" in q_banca:
        candidates = [p for p in candidates if "unicamp" in p["path"].lower()]
    elif "iamspe" in q_banca:
        candidates = [p for p in candidates if "iamspe" in p["path"].lower()]
    elif "einstein" in q_banca:
        candidates = [p for p in candidates if "einstein" in p["path"].lower()]
        
    found_pdf = None
    found_page = None
    
    # Tentar encontrar a questão no texto dos PDFs candidatos
    for cand in candidates:
        try:
            doc = fitz.open(cand["path"])
            for pno in range(len(doc)):
                p_text = normalize_text(doc[pno].get_text())
                if q_norm[:60] in p_text or (len(q_norm) > 80 and q_norm[:80] in p_text):
                    found_pdf = cand["path"]
                    found_page = pno + 1
                    break
            doc.close()
            if found_pdf:
                break
        except Exception as e:
            continue
            
    if found_pdf:
        matched_count += 1
        matches.append({
            "id": q["id"],
            "banca": q.get("banca"),
            "year": q_year,
            "pdf": os.path.basename(found_pdf),
            "page": found_page,
            "snippet": q_stmt[:80]
        })

print(f"\nAmostra de 50 testada: {matched_count} questões localizadas com sucesso em PDFs locais!")
for m in matches[:10]:
    print(f" -> [{m['banca']} {m['year']}] {m['id']} -> {m['pdf']} (Pág {m['page']})")

