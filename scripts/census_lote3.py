import json
import urllib.request
import urllib.parse

SUPABASE_URL = 'https://ezluharxlmlqhdkqrjbz.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bHVoYXJ4bG1scWhka3FyamJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNDkxNzcsImV4cCI6MjEwNjgyNTE3N30.kT9521OP3j5yTmnQTqF6Wzl29xc6ZjV2UzF8EB_5xrI'

targets = [
    ('SUS-BA', '%SUS-BA%'),
    ('SES-DF', '%SES-DF%'),
    ('IADES', '%IADES%'),
    ('FAMERP', '%FAMERP%'),
    ('Sirio-Libanes', '%Sirio%'),
    ('CERMAM', '%CERMAM%'),
    ('PUC-PR', '%PUC-PR%'),
    ('PUC-SP', '%PUC-SP%'),
    ('PUC-Campinas', '%PUC-Campinas%'),
    ('FUNDATEC', '%FUNDATEC%')
]

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Range-Unit': 'items',
    'Prefer': 'count=exact'
}

print(f"{'Instituicao / Banca':22} | {'Total':>7} | {'Com Gab':>7} | {'%':>7}")
print("-" * 52)

for name, pattern in targets:
    # Total
    url_tot = f"{SUPABASE_URL}/rest/v1/questions?select=id&or=(banca.ilike.{urllib.parse.quote(pattern)},institution.ilike.{urllib.parse.quote(pattern)})"
    req_tot = urllib.request.Request(url_tot, headers={**headers, 'Range': '0-0'}, method='HEAD')
    
    tot = 0
    try:
        with urllib.request.urlopen(req_tot) as resp:
            cr = resp.headers.get('Content-Range', '')
            if '/' in cr:
                tot = int(cr.split('/')[1])
    except Exception as e:
        pass

    # Com Gabarito
    url_with = f"{SUPABASE_URL}/rest/v1/questions?select=id&or=(banca.ilike.{urllib.parse.quote(pattern)},institution.ilike.{urllib.parse.quote(pattern)})&correct_answer=neq."
    req_with = urllib.request.Request(url_with, headers={**headers, 'Range': '0-0'}, method='HEAD')
    
    with_ans = 0
    try:
        with urllib.request.urlopen(req_with) as resp:
            cr = resp.headers.get('Content-Range', '')
            if '/' in cr:
                with_ans = int(cr.split('/')[1])
    except Exception as e:
        pass

    pct = (with_ans / tot * 100) if tot > 0 else 0
    print(f"{name:22} | {tot:7d} | {with_ans:7d} | {pct:6.1f}%")
