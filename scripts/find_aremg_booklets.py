import urllib.request, ssl, json, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for pid, name in [(70, "PSU MG 2024"), (81, "PSU MG 2025")]:
    url = f"https://www.aremg.org.br/ajaxCarregaProcesso.ajax.php?id={pid}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest'})
    data = json.loads(urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore'))
    html = data.get('html', '')
    detail_links = re.findall(r'href=[\'"]([^\'"]*detalhes-do-processo[^\'"]*)[\'"]', html)
    print(f"\n=== Checking {len(detail_links)} detail links for {name} ===")
    for dlink in detail_links:
        full_dlink = f"https://www.aremg.org.br/{dlink}"
        try:
            dhtml = urllib.request.urlopen(urllib.request.Request(full_dlink, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=6).read().decode('utf-8', errors='ignore')
            files = re.findall(r'href=[\'"]([^\'"]+galaxcms\.com\.br[^\'"]+)[\'"]', dhtml)
            for f in files:
                if any(k in f.lower() for k in ['prova', 'caderno', 'geral', 'acesso']):
                    print(f"  [{name}] Found file: {f}")
        except Exception as e:
            pass
