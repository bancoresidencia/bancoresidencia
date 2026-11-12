import sqlite3
import json
import re

db = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db.row_factory = sqlite3.Row

with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)['catalog']

print("=" * 80)
print(f"🩺 ANÁLISE DE AUTOSSUFICIÊNCIA CLÍNICA E HIGIENIZAÇÃO NAS {len(cat)} RESTANTES")
print("=" * 80)

# Padrões de higienização de frases remanescentes
CLEANABLE_PATTERNS = [
    r'\((?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es?)[^)]*\)',
    r'\[(?:ver|conforme|veja|observe|vide)\s+(?:a\s+)?(?:imagem|figura|foto|caderno\s+de\s+quest[õo]es?)[^\]]*\]',
    r'\bconforme\s+(?:a\s+)?(?:imagem|figura|foto)\s+(?:do\s+caderno\s+de\s+quest[õo]es?|abaixo|a\s+seguir)\b',
    r'\bque\s+pode\s+ser\s+vist[ao]\s+na\s+figura\s+(?:abaixo|a\s+seguir)\b',
    r'\((?:imagem|figura)\s+(?:abaixo|a\s+seguir)\)',
    r'\[(?:imagem|figura)\s+(?:abaixo|a\s+seguir)\]'
]

# Indicadores de dependência visual estrita (não pode ser resolvida sem ver)
STRICT_VISUAL_INDICATORS = [
    r'\bseta\s+(?:preta|branca|vermelha|amarela|aponta)\b',
    r'\bletra\s+["\']?[A-D]["\']?\s+corresponde\b',
    r'\bqual\s+(?:o\s+)?achado\s+(?:radiológico|tomográfico|endoscópico|histopatológico|dermatoscópico)\b',
    r'\bcom\s+base\s+na\s+(?:imagem|figura)\s+(?:acima|abaixo|a\s+seguir)\s*,\s*(?:assinale|qual|o\s+diagnóstico)\b',
    r'\[ver\s+imagem\]'
]

# Indicadores de autossuficiência clínica descritiva
DESCRIPTIVE_FINDINGS = [
    r'\bevidencia\b', r'\bdemonstra\b', r'\bcomprovando\b', r'\bcom\s+presen[çc]a\s+de\b',
    r'\bmedindo\s+\d+', r'\bapresenta\s+les[ãa]o\b', r'\bcom\s+achado\s+de\b',
    r'\bmostra\s+ritmo\b', r'\bonda\s+T\b', r'\bsupradesnivelamento\b', r'\binfradesnivelamento\b',
    r'\bfratura\s+(?:de|em)\b', r'\bderrame\s+pleural\b', r'\bconsolida[çc][ãa]o\b'
]

results = {
    "cleanable_phrases": [],
    "strictly_visual": [],
    "descriptive_self_sufficient": [],
    "borderline": []
}

for item in cat:
    row = db.execute("SELECT id, statement, options, correct_answer, commentary, is_anulada FROM questions_curated_staging WHERE id = ?", (item['id'],)).fetchone()
    if not row or not row['statement']: continue
    
    stmt = row['statement']
    opts_str = row['options'] or ''
    
    # Checar frases limpáveis
    has_cleanable = False
    for pat in CLEANABLE_PATTERNS:
        if re.search(pat, stmt, re.IGNORECASE):
            has_cleanable = True
            break
            
    # Checar dependência visual estrita
    is_strictly_visual = False
    for pat in STRICT_VISUAL_INDICATORS:
        if re.search(pat, stmt, re.IGNORECASE) or re.search(pat, opts_str, re.IGNORECASE):
            is_strictly_visual = True
            break
            
    # Checar autossuficiência descritiva
    has_descriptive = False
    for pat in DESCRIPTIVE_FINDINGS:
        if re.search(pat, stmt, re.IGNORECASE):
            has_descriptive = True
            break
            
    entry = {
        "id": row['id'],
        "statement": stmt,
        "is_anulada": bool(row['is_anulada']),
        "has_cleanable": has_cleanable,
        "is_strictly_visual": is_strictly_visual,
        "has_descriptive": has_descriptive
    }
    
    if has_cleanable:
        results["cleanable_phrases"].append(entry)
        
    if is_strictly_visual:
        results["strictly_visual"].append(entry)
    elif has_descriptive:
        results["descriptive_self_sufficient"].append(entry)
    else:
        results["borderline"].append(entry)

print(f"1. Questões com frases remanescentes prontas para higienização: {len(results['cleanable_phrases'])}")
print(f"2. Questões puramente descritivas / clinicamente autossuficientes: {len(results['descriptive_self_sufficient'])}")
print(f"3. Questões com dependência visual estrita (setas, letras, exame mudo): {len(results['strictly_visual'])}")
print(f"4. Questões com contexto clínico intermediário (borderline): {len(results['borderline'])}")

# Salvar relatório detalhado
with open('data/supabase_tables/clinical_sufficiency_audit.json', 'w', encoding='utf-8') as f:
    json.dump({
        "cleanable_count": len(results["cleanable_phrases"]),
        "descriptive_count": len(results["descriptive_self_sufficient"]),
        "strictly_visual_count": len(results["strictly_visual"]),
        "borderline_count": len(results["borderline"]),
        "cleanable_sample": [{"id": e["id"], "snippet": e["statement"][:120]} for e in results["cleanable_phrases"][:10]],
        "strictly_visual_sample": [{"id": e["id"], "snippet": e["statement"][:120]} for e in results["strictly_visual"][:10]],
        "descriptive_sample": [{"id": e["id"], "snippet": e["statement"][:120]} for e in results["descriptive_self_sufficient"][:10]]
    }, f, indent=2, ensure_ascii=False)

