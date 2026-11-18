import requests
import json
import collections

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
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}'
}

print("Carregando todas as pendências reais do Supabase para ranking preciso...")
all_pending = []
offset = 0
step = 1000

while True:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&select=institution,year,banca&offset={offset}&limit={step}",
        headers=headers
    )
    if r.status_code not in [200, 206]:
        break
    data = r.json()
    if not data:
        break
    all_pending.extend(data)
    offset += len(data)
    print(f"  {len(all_pending)} pendências coletadas...")
    if len(data) < step:
        break

print(f"\nTotal real de pendências: {len(all_pending)}")

counter = collections.Counter()
for q in all_pending:
    inst = (q.get('institution') or 'Desconhecida').strip()
    yr = q.get('year') or 0
    banca = (q.get('banca') or '').strip()
    counter[(inst, yr, banca)] += 1

top = counter.most_common(50)

print("\n--- TOP 35 PROVAS COM MAIS GABARITOS FALTANTES (AO VIVO NO SUPABASE) ---")
ranking = []
for i, ((inst, yr, banca), count) in enumerate(top, 1):
    print(f"{i:2d}. {inst} ({yr}) [Banca: {banca}] -> Faltam: {count}")
    ranking.append({'rank': i, 'institution': inst, 'year': yr, 'banca': banca, 'missing': count})

with open('data/live_top_missing_exams.json', 'w', encoding='utf-8') as f:
    json.dump({'totalPending': len(all_pending), 'ranking': ranking}, f, ensure_ascii=False, indent=2)

print("\nSalvo em data/live_top_missing_exams.json com sucesso!")
