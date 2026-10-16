import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://institutoverbena.ufg.br/n/205082-inscricoes-do-processo-seletivo-da-coreme-ses-go-tem-inicio-nesta-segunda-feira'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    for l in set(links):
        if any(k in l.lower() for k in ['processo', 'residencia', 'sistema', 'coreme', 'edital', 'verbena']):
            print(l)
except Exception as e:
    print('Error:', e)
