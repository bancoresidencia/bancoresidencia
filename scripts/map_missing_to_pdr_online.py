import sys
sys.path.append('scripts/coletor_provaderesidencia')
import config
import requests
from bs4 import BeautifulSoup
import re
import json
import os

print("=" * 80)
print("🚀 MAPEANDO QUESTÕES FALTANTES CONTRA OS 3.665 EXAMES DA PROVADERESIDENCIA.COM.BR")
print("=" * 80)

# 1. Carregar catálogo atual de faltantes
with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f).get('catalog', [])

print(f"Total de questões pendentes no catálogo do Gate 6: {len(catalog)}")

# Agrupar por Banca e Ano
missing_groups = {}
for q in catalog:
    b = (q.get('banca') or q.get('institution') or 'OUTROS').strip()
    y = str(q.get('year') or 0)
    key = f"{b} ({y})"
    if key not in missing_groups:
        missing_groups[key] = {
            "banca": b,
            "year": y,
            "questions": []
        }
    missing_groups[key]["questions"].append(q)

print(f"Total de grupos Banca / Ano pendentes: {len(missing_groups)}")

# 2. Obter lista de todas as provas de provaderesidencia.com.br
s = requests.Session()
s.headers.update(config.HEADERS)
s.cookies.update(config.COOKIES)

print("\nBuscando catálogo de 3.665 provas em provaderesidencia.com.br...")
r = s.get('https://provaderesidencia.com.br/premium/banco-de-provas', timeout=20)
soup = BeautifulSoup(r.text, 'html.parser')

all_online_exams = []
for a in soup.find_all('a', href=re.compile(r'/premium/prova/(\d+)/')):
    match_id = re.search(r'/premium/prova/(\d+)/', a['href'])
    if match_id:
        exam_id = int(match_id.group(1))
        title = a.get_text(strip=True).replace('Gratuito', '').strip()
        all_online_exams.append({
            "id": exam_id,
            "title": title,
            "url": f"https://provaderesidencia.com.br/premium/prova/{exam_id}/"
        })

print(f"Total de provas online carregadas: {len(all_online_exams)}")

def normalize(txt):
    if not txt: return ""
    txt = txt.lower()
    txt = re.sub(r'[^\w\s]', ' ', txt)
    return " ".join(txt.split())

# 3. Cruzar grupos faltantes com os títulos das provas online
matched_exams_for_missing = []

for grp_key, grp_data in missing_groups.items():
    b_norm = normalize(grp_data["banca"])
    y_str = grp_data["year"]
    q_count = len(grp_data["questions"])
    
    # Termos-chave da banca
    keywords = [t for t in b_norm.split() if len(t) > 2 and t not in ['hospital', 'universidade', 'faculdade', 'instituto', 'escola', 'medicina', 'estadual', 'federal']]
    
    candidate_exams = []
    for exam in all_online_exams:
        e_title_norm = normalize(exam["title"])
        # Se contém o ano
        if y_str in e_title_norm:
            # Se contém pelo menos um termo-chave forte da banca
            if any(kw in e_title_norm for kw in keywords) or b_norm in e_title_norm:
                candidate_exams.append(exam)
                
    if candidate_exams:
        matched_exams_for_missing.append({
            "group": grp_key,
            "banca": grp_data["banca"],
            "year": y_str,
            "missing_questions_count": q_count,
            "questions": grp_data["questions"],
            "candidate_online_exams": candidate_exams
        })

print("\n" + "=" * 80)
print(f"🎉 GRUPOS FALTANTES QUE POSSUEM PROVAS DISPONÍVEIS NA PROVADERESIDENCIA: {len(matched_exams_for_missing)}")
print("=" * 80)

total_covered_questions = sum(g["missing_questions_count"] for g in matched_exams_for_missing)
print(f"Total de questões faltantes cobertas pelas provas online: {total_covered_questions} de {len(catalog)} ({((total_covered_questions/len(catalog))*100):.1f}%)")

print("\nTop 15 Grupos Cobertos:")
for g in sorted(matched_exams_for_missing, key=lambda x: x["missing_questions_count"], reverse=True)[:15]:
    exams_sample = ", ".join([f"#{e['id']} {e['title']}" for e in g["candidate_online_exams"][:3]])
    print(f" -> {g['group']}: {g['missing_questions_count']} questões faltantes")
    print(f"    Provas online candidatas: {exams_sample}")

# Salvar mapeamento
with open('data/supabase_tables/pdr_online_matched_exams.json', 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": "2026-11-12",
        "total_covered_questions": total_covered_questions,
        "matched_groups": matched_exams_for_missing
    }, f, indent=2, ensure_ascii=False)

