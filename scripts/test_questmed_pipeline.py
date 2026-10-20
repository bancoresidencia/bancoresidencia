import urllib.request
import json
import http.cookiejar
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Sign in
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
    print('Login success! Status:', resp.status)

# 2. Query questions directly for AMRIGS 2021
query_payload = json.dumps({
    'banca': 'AMRIGS',
    'ano': 2021,
    'limit': 10
}).encode('utf-8')

req2 = urllib.request.Request('https://api.questmed.com.br/api/simulations/questions', data=query_payload, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json',
    'Origin': 'https://www.questmed.com.br',
    'Referer': 'https://www.questmed.com.br/student/simulados',
    'x-client-route': '/student/simulados',
    'x-app-release': 'production'
})

with opener.open(req2) as resp:
    print('Question query success! Status:', resp.status)
    data = json.loads(resp.read().decode('utf-8'))
    questions = data.get('data', [])
    print(f'Total questions returned: {len(questions)}')
    for q in questions[:5]:
        print(f"  Questão {q.get('numero')}: Gabarito={q.get('gabarito')} | Área={q.get('area')}")
        print(f"  Enunciado: {q.get('enunciado')[:90]}...")
        if q.get('comentarios'):
            gab = q.get('gabarito')
            coment = q.get('comentarios', {}).get(gab, '')
            print(f"  Comentário gabarito {gab}: {coment[:100]}...")
        print('-'*50)
