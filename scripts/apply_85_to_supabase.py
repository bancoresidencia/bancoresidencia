import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

with open('data/resultado_livros_verificado.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

matches = data['matches']
print(f"Total de questões a homologar no Supabase: {len(matches)}")

def update_question(m):
    qid = m['pending_id']
    letter = m['official_answer']
    url = f"{SUPABASE_URL}/rest/v1/questions?id=eq.{qid}"
    payload = {
        "correct_answer": letter
    }
    try:
        r = requests.patch(url, headers=headers, json=payload, timeout=10)
        return qid, r.status_code in [200, 204]
    except Exception as e:
        return qid, False

t0 = time.time()
success_count = 0
fail_count = 0

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(update_question, m) for m in matches]
    for future in as_completed(futures):
        qid, ok = future.result()
        if ok:
            success_count += 1
        else:
            fail_count += 1

print(f"Homologação concluída em {time.time()-t0:.2f}s!")
print(f"Sucessos: {success_count} / {len(matches)}")
print(f"Falhas: {fail_count}")

# Checar novo total de pendências no Supabase
r = requests.get(f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&select=id&limit=1", headers={'apikey': SERVICE_ROLE_KEY, 'Authorization': f'Bearer {SERVICE_ROLE_KEY}', 'Prefer': 'count=exact'})
cr = r.headers.get('content-range', '')
remaining_now = cr.split('/')[-1] if '/' in cr else 'erro'
print(f"Novo total de pendências no Supabase: {remaining_now}")

# Salvar manifesto
with open('data/manifesto_homologacao_livros_85.json', 'w', encoding='utf-8') as f:
    json.dump({
        'data': time.strftime('%Y-%m-%d %H:%M:%S'),
        'total': len(matches),
        'sucessos': success_count,
        'falhas': fail_count,
        'novo_total_pendencias': remaining_now,
        'matches': matches
    }, f, ensure_ascii=False, indent=2)
