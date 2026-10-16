import urllib.request, ssl, json, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

pids = [
    (70, "PSU MG 2024"),
    (81, "PSU MG 2025")
]

for pid, name in pids:
    url = f"https://www.aremg.org.br/ajaxCarregaProcesso.ajax.php?id={pid}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest'})
        res = urllib.request.urlopen(req, context=ctx, timeout=10)
        data = json.loads(res.read().decode('utf-8', errors='ignore'))
        html = data.get('html', '')
        print(f"\n=== {name} (ID {pid}) - HTML len: {len(html)} ===")
        # Find all pdf and links
        links = re.findall(r'<a\s+[^>]*href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
        for href, text in links:
            clean_text = re.sub(r'<[^>]+>', ' ', text)
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
            print(f"   -> [{clean_text}] {href}")
    except Exception as e:
        print(f"Error {pid}: {e}")
