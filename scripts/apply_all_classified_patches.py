import urllib.request
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

with open('.env.local', 'r', encoding='utf-8') as f:
    env = dict(l.strip().split('=', 1) for l in f if '=' in l and not l.startswith('#'))

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'].strip('"\'')
SERVICE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY', '').strip('"\'')
headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json'
}

with open(r"C:\Users\cnath\.gemini\antigravity\brain\fcbb34eb-4332-40a2-8253-abc262997cd0\scratch\patch_payload_569.json", 'r', encoding='utf-8') as f:
    payload = json.load(f)

print(f"Iniciando aplicação dos patches para {len(payload)} questões no Supabase...")

def patch_question(item):
    qid = item['id']
    fields = item['patch_fields']
    url = f"{SUPABASE_URL}/rest/v1/questions?id=eq.{qid}"
    data = json.dumps(fields).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='PATCH')

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status in (200, 204):
                    return True, qid, None
        except Exception as e:
            if attempt == 2:
                return False, qid, str(e)
            time.sleep(0.5)

start_time = time.time()
success_count = 0
failed = []

with ThreadPoolExecutor(max_workers=12) as executor:
    futures = {executor.submit(patch_question, it): it for it in payload}
    for future in as_completed(futures):
        ok, qid, err = future.result()
        if ok:
            success_count += 1
            if success_count % 50 == 0 or success_count == len(payload):
                print(f"Progresso: {success_count}/{len(payload)} questões atualizadas com sucesso...")
        else:
            failed.append((qid, err))

elapsed = time.time() - start_time
print(f"\nConcluído em {elapsed:.1f} segundos!")
print(f"Total Sucessos: {success_count}")
print(f"Total Falhas: {len(failed)}")

if failed:
    print(f"Falhas registradas: {failed[:5]}")
