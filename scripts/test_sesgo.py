import urllib.request
import json
import http.cookiejar
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

payload = json.dumps({'email': 'antigravity_test_4968@gmail.com', 'password': 'Residencia2026!'}).encode('utf-8')
req = urllib.request.Request('https://api.questmed.com.br/api/auth/sign-in/email', data=payload, headers={'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json', 'Origin': 'https://www.questmed.com.br'})
with opener.open(req): pass

for banca in ['ENARE', 'USP-SP', 'AMRIGS', 'AMP', 'SUS-SP', 'UNICAMP']:
    q_payload = json.dumps({'banca': banca, 'ano': 2026, 'limit': 1000}).encode('utf-8')
    req2 = urllib.request.Request('https://api.questmed.com.br/api/simulations/questions', data=q_payload, headers={'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json', 'Origin': 'https://www.questmed.com.br', 'x-client-route': '/student/simulados', 'x-app-release': 'production'})
    with opener.open(req2) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        qs = data.get('data', [])
        print(f"Banca {banca} 2026 -> {len(qs)} questões")
