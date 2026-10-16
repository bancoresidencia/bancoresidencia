import urllib.request, ssl, json, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.aremg.org.br/ajaxCarregaProcessosPorAno.ajax.php?ano=2024"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest'})
res = urllib.request.urlopen(req, context=ctx, timeout=12)
data = json.loads(res.read().decode('utf-8', errors='ignore'))
html = data.get('html', '')
print("HTML for 2024:")
print(html)
