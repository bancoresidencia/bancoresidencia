import urllib.request, ssl, json, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

years = [2025, 2024, 2023, 2022, 2021, 2020]

for y in years:
    url = f"https://www.aremg.org.br/ajaxCarregaProcessosPorAno.ajax.php?ano={y}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest'})
        res = urllib.request.urlopen(req, context=ctx, timeout=8)
        data = json.loads(res.read().decode('utf-8', errors='ignore'))
        html = data.get('html', '')
        print(f"\n=== ANO {y} (HTML len: {len(html)}) ===")
        # Find all process links/ids
        matches = re.findall(r'data-id=[\'"](\d+)[\'"][^>]*>(.*?)<', html)
        for pid, name in matches:
            clean = name.strip()
            if clean:
                print(f"  [ID {pid}] {clean}")
    except Exception as e:
        print(f"Error {y}: {e}")
