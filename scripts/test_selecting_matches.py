import os
import sys
sys.path.append('.')
import requests
import json
from scripts.run_fase1_pdf_universal import parse_prova, clean_text, strip_intro

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

# Carrega todas as pendências
all_pending = []
offset = 0
step = 1000
while True:
    req_headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Range': f"{offset}-{offset + step - 1}"
    }
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,institution,year,statement,options&order=id.asc",
        headers=req_headers,
        timeout=25
    )
    if r.status_code not in [200, 206]:
        break
    data = r.json()
    if not data or not isinstance(data, list):
        break
    all_pending.extend(data)
    offset += len(data)
    if len(data) < step:
        break

print(f"Total pendências carregadas: {len(all_pending)}")

# Testa contra os PDFs de Selecting
import glob
for edital in [35, 36, 41, 42, 43]:
    pv_files = glob.glob(f"data/incoming_exams/Selecting_{edital}/PV_*.pdf")
    print(f"\n--- EDITAL {edital}: {len(pv_files)} cadernos ---")
    for pv in pv_files:
        qs = parse_prova(pv)
        if not qs: continue
        print(f"  {os.path.basename(pv)}: {len(qs)} questões extraídas")
        
        # Testa se alguma questão bate com o banco
        matches = 0
        for num, q in qs.items():
            q_clean = clean_text(q['statement'])
            q_words = set(q_clean.split())
            if len(q_words) < 5: continue
            
            for p in all_pending:
                p_clean = clean_text(p['statement'])
                p_words = set(p_clean.split())
                if not p_words: continue
                inter = len(q_words.intersection(p_words))
                dice = (2 * inter) / (len(q_words) + len(p_words))
                if dice >= 0.70:
                    matches += 1
                    print(f"    🎯 MATCH ENCONTRADO! {p['code']} ({p['institution']} - {p['year']}) vs Q{num} (Dice: {dice:.2f})")
                    print(f"       PDF: {q['statement'][:100]}...")
                    print(f"       BD:  {p['statement'][:100]}...")
                    break
            if matches >= 5:
                break
        print(f"  Total amostra de matches: {matches}")
