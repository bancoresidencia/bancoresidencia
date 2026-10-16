import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Search AREMG (PSU-MG)
print("=== AREMG PSU-MG ===")
try:
    req = urllib.request.Request('https://www.aremg.org.br/processos-seletivos', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    for l in set(links):
        if any(k in l.lower() for k in ['psu', 'prova', 'gabarito', 'edital', 'processo']):
            print("AREMG:", l)
except Exception as e:
    print("AREMG error:", e)

# Search Instituto Verbena (SES-GO)
print("\n=== SES-GO (Instituto Verbena) ===")
try:
    req = urllib.request.Request('https://sistemas.institutoverbena.ufg.br/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    for l in set(links):
        if any(k in l.lower() for k in ['residencia', 'ses-go', 'medica', 'medico', 'saude']):
            print("Verbena:", l)
except Exception as e:
    print("Verbena error:", e)
