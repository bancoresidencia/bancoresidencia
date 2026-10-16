import urllib.request, ssl, re, sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

html = urllib.request.urlopen(urllib.request.Request('https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2024', headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8).read().decode('latin1', errors='ignore')
clean = re.sub(r'<[^>]+>', ' ', html)
clean = re.sub(r'\s+', ' ', clean)
idx = clean.lower().find('resid')
if idx != -1:
    print(clean[idx:idx+1500])
