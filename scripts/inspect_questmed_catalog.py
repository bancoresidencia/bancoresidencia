import urllib.request
import json
import http.cookiejar
import sys
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Login
login_payload = json.dumps({
    'email': 'antigravity_test_4968@gmail.com',
    'password': 'Residencia2026!'
}).encode('utf-8')

req1 = urllib.request.Request('https://api.questmed.com.br/api/auth/sign-in/email', data=login_payload, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json',
    'Origin': 'https://www.questmed.com.br',
    'Referer': 'https://www.questmed.com.br/'
})

with opener.open(req1) as resp:
    pass

# 2. Get all exams
print("Fetching complete exam catalog from QuestMed...")
page = 1
all_exams = []

while True:
    url = f'https://api.questmed.com.br/api/exams?page={page}&limit=100'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/json',
        'x-client-route': '/student/simulados',
        'x-app-release': 'production'
    })
    with opener.open(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        data = res.get('data', [])
        if not data:
            break
        all_exams.extend(data)
        if not res.get('hasMore') or page >= res.get('totalPages', 1):
            break
        page += 1

print(f"Total exams in QuestMed catalog: {len(all_exams):,}")

# Summary by year
by_year = Counter()
questions_by_year = Counter()
bancas_by_year = {}

for ex in all_exams:
    yr = ex.get('ano')
    by_year[yr] += 1
    questions_by_year[yr] += (ex.get('total_questions') or 0)
    if yr not in bancas_by_year:
        bancas_by_year[yr] = set()
    bancas_by_year[yr].add(ex.get('banca'))

print("\n=== RESUMO DO QUESTMED POR ANO (DECRESCENTE) ===")
print(f"{'Ano':<6} | {'Provas':<8} | {'Questoes':<10} | {'Bancas':<8}")
print("-" * 42)
for yr in sorted(by_year.keys(), reverse=True):
    q_str = f"{questions_by_year[yr]:,}"
    print(f"{str(yr):<6} | {str(by_year[yr]):<8} | {q_str:<10} | {str(len(bancas_by_year[yr])):<8}")

with open('data/questmed_all_exams_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(all_exams, f, ensure_ascii=False, indent=2)
print("\nSalvo catálogo completo em data/questmed_all_exams_catalog.json")
