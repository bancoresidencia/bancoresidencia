import sys, requests, json
sys.path.append('.')
from scripts.run_fase1_pdf_universal import SUPABASE_URL, SERVICE_ROLE_KEY

headers = {'apikey': SERVICE_ROLE_KEY, 'Authorization': f'Bearer {SERVICE_ROLE_KEY}'}

# Busca 10 questoes de HMMSJP
r = requests.get(f'{SUPABASE_URL}/rest/v1/questions?institution=ilike.*São José dos Pinhais*&or=(correct_answer.is.null,correct_answer.eq.)&select=id,code,year,statement,options&limit=10', headers=headers)
hmmsjp_qs = r.json()
print(f"Carregadas {len(hmmsjp_qs)} questões de HMMSJP.")

for q in hmmsjp_qs:
    stmt = (q.get('statement') or '').strip()
    words = [w for w in stmt.split() if len(w) > 3][:6]
    query_text = '%'.join(words)
    # Busca na AMP
    r2 = requests.get(f'{SUPABASE_URL}/rest/v1/questions?institution=ilike.*Associa%C3%A7%C3%A3o M%C3%A9dica do Paran%C3%A1*&statement=ilike.*{query_text}*&select=id,code,year,correct_answer,statement', headers=headers)
    amp_qs = r2.json()
    print(f"\nHMMSJP [{q['code']}] ({q['year']}): {stmt[:60]}")
    if amp_qs:
        for a in amp_qs:
            print(f"  -> MATCH AMP [{a['code']}] ({a['year']}) GAB: {a['correct_answer']}")
    else:
        print("  -> Nenhum match direto com ilike na AMP")
