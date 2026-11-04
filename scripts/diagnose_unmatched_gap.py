"""
Diagnóstico Pericial Forense do Gap de Cruzamento (100% Leitura - Não altera nada)
Analisa exatamente o que aconteceu com:
1. As questões locais que não casaram com o scraped.
2. As questões do scraped que não casaram com o local (Inéditas no acervo).
"""

import json
import glob
import os
import re
import unicodedata
import html

def normalize_text(text):
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'^(?:quest[aã]o\s*\d+[\s:\-–—.]*|\d+[\s:\-–—.)]+)\s*', '', text, flags=re.IGNORECASE)
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

print("1. Carregando todas as questões do Scraped (129.751)...")
scraped_by_norm = {}
scraped_by_prefix = {}
scraped_by_year = {}
total_scraped = 0
scraped_matched_ids = set()

for fpath in glob.glob('data/scraped_exams/raw/*/*.json'):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            d = json.load(f)
        exam_title = d.get('exam', {}).get('title', '')
        inst = d.get('exam', {}).get('institution', '')
        for q in d.get('questions', []):
            total_scraped += 1
            qid = q.get('_id')
            year = q.get('examYear')
            scraped_by_year[year] = scraped_by_year.get(year, 0) + 1
            nt = normalize_text(q.get('text', ''))
            item = {'id': qid, 'exam': exam_title, 'inst': inst, 'year': year, 'text': q.get('text', '')}
            if len(nt) >= 15:
                scraped_by_norm.setdefault(nt, []).append(item)
                if len(nt) >= 60:
                    scraped_by_prefix.setdefault(nt[:60], []).append(item)
    except Exception as e:
        pass

print(f"Total Scraped carregadas: {total_scraped:,}")

print("2. Analisando as questões locais (136.814)...")
local_matched = 0
local_unmatched = 0
local_unmatched_by_year = {}
local_unmatched_by_banca = {}
local_unmatched_missing_gabarito = 0
local_unmatched_has_gabarito = 0

matched_local_ids = set()

for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for q in data:
        qid = q.get('id')
        year = q.get('year')
        banca = q.get('banca') or q.get('institution') or 'DESCONHECIDA'
        has_g = bool(q.get('correct_answer'))
        
        nt = normalize_text(q.get('statement', ''))
        candidates = scraped_by_norm.get(nt)
        if not candidates and len(nt) >= 60:
            candidates = scraped_by_prefix.get(nt[:60])
            
        if candidates:
            local_matched += 1
            matched_local_ids.add(qid)
            for c in candidates:
                scraped_matched_ids.add(c['id'])
        else:
            local_unmatched += 1
            local_unmatched_by_year[year] = local_unmatched_by_year.get(year, 0) + 1
            local_unmatched_by_banca[banca] = local_unmatched_by_banca.get(banca, 0) + 1
            if has_g:
                local_unmatched_has_gabarito += 1
            else:
                local_unmatched_missing_gabarito += 1

print("\n--- RESULTADOS FORENSES ---")
print(f"Total Local: {local_matched + local_unmatched:,}")
print(f"Local que casou com Scraped: {local_matched:,}")
print(f"Local que NÃO casou com Scraped: {local_unmatched:,}")
print(f"  - Destas sem casar: já tinham gabarito de outras fontes: {local_unmatched_has_gabarito:,}")
print(f"  - Destas sem casar: ainda faltam gabarito: {local_unmatched_missing_gabarito:,}")

print(f"\nTotal Scraped: {total_scraped:,}")
print(f"Scraped que casou com Local: {len(scraped_matched_ids):,}")
scraped_unmatched_count = total_scraped - len(scraped_matched_ids)
print(f"Scraped que NÃO casou com Local (INÉDITAS do site): {scraped_unmatched_count:,}")

print("\nTop 10 Anos de Questões Locais que Não Casaram:")
for y, c in sorted(local_unmatched_by_year.items(), key=lambda x: str(x[0]), reverse=True)[:10]:
    print(f"  Ano {y}: {c:,} questões")

print("\nTop 15 Bancas de Questões Locais que Não Casaram:")
for b, c in sorted(local_unmatched_by_banca.items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f"  Banca: {b[:40]} -> {c:,} questões")
