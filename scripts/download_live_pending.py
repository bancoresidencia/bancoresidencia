import requests, json, time, os

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
}

out_file = 'data/pending_10k_live.json'
if os.path.exists(out_file) and os.path.getsize(out_file) > 1000000:
    print(f"Arquivo {out_file} já existe com {os.path.getsize(out_file)} bytes.")
else:
    print("Baixando as 10.217 pendências do Supabase...")
    all_pending = []
    offset = 0
    step = 1000
    t0 = time.time()
    while True:
        url = f"{SUPABASE_URL}/rest/v1/questions?or=(correct_answer.is.null,correct_answer.eq.)&select=id,institution,year,banca,statement,options&offset={offset}&limit={step}"
        r = requests.get(url, headers=headers)
        if r.status_code not in [200, 206]:
            print("Status:", r.status_code, r.text[:200])
            break
        data = r.json()
        if not data:
            break
        all_pending.extend(data)
        offset += len(data)
        print(f"  {len(all_pending)} baixadas...")
        if len(data) < step:
            break
    
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(all_pending, f, ensure_ascii=False)
    print(f"Download concluído em {time.time() - t0:.1f}s! Total: {len(all_pending)}")
