import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://sistemas.institutoverbena.ufg.br/portal/concursos/inscricoes-abertas'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    print("Links in inscricoes-abertas:")
    for l in set(links):
        print("  ", l)
except Exception as e:
    print("Error:", e)
