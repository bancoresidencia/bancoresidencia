import urllib.request, ssl, json, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Query announcements for PSU MG 2024 (id 70) and PSU MG 2025 (id 81)
for pid, name in [(70, "PSU MG 2024"), (81, "PSU MG 2025")]:
    url = f"https://www.aremg.org.br/ajaxCarregaProcesso.ajax.php?id={pid}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest'})
    data = json.loads(urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore'))
    html = data.get('html', '')
    links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
    print(f"\n=== {name} Links de Prova/Gabarito ===")
    for href, text in links:
        clean = re.sub(r'<[^>]+>', ' ', text).strip()
        if any(k in clean.lower() for k in ['prova', 'gabarito', 'caderno', 'recurso']):
            print(f"  {clean} -> https://www.aremg.org.br/{href}")
