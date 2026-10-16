import urllib.request, ssl, json, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for y in [2023, 2022, 2021, 2020]:
    url = f"https://www.aremg.org.br/ajaxCarregaProcessosPorAno.ajax.php?ano={y}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest'})
        res = urllib.request.urlopen(req, context=ctx, timeout=15)
        data = json.loads(res.read().decode('utf-8', errors='ignore'))
        html = data.get('html', '')
        matches = re.findall(r'data-id=[\'"](\d+)[\'"][^>]*>\s*<div>(.*?)</div>', html)
        print(f"\n=== ANO {y} ({len(matches)} processos) ===")
        for pid, name in matches:
            if 'minas' in name.lower() or 'psu mg' in name.lower():
                print(f"  [ID {pid}] {name}")
    except Exception as e:
        print(f"Error {y}: {e}")
