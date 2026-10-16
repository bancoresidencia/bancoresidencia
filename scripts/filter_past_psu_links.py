import urllib.request, ssl, json, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

targets = [
    (63, 2023),
    (57, 2022),
    (46, 2021),
    (41, 2020)
]

for pid, year in targets:
    url = f"https://www.aremg.org.br/ajaxCarregaProcesso.ajax.php?id={pid}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest'})
        res = urllib.request.urlopen(req, context=ctx, timeout=12)
        data = json.loads(res.read().decode('utf-8', errors='ignore'))
        html = data.get('html', '')
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        print(f"\n=== PSU MG {year} (ID {pid}) ===")
        for href, text in links:
            clean = re.sub(r'<[^>]+>', ' ', text).strip()
            if any(k in clean.lower() for k in ['gabarito', 'prova', 'caderno', 'recurso']):
                print(f"  [{clean}] -> {href}")
    except Exception as e:
        print(f"Error {year}: {e}")
