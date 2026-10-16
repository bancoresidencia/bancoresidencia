import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

candidates = [
    'https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2021',
    'https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2020',
    'https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2019',
    'https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2018',
    'https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2017',
    'https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2016',
    'https://www.cepuerj.uerj.br/concursos2.php?concurso=S04597&ano=2015',
]

for url in candidates:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, context=ctx, timeout=6)
        html = res.read().decode('latin1', errors='ignore')
        opts = re.findall(r'<option[^>]*value=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</option>', html, re.DOTALL | re.IGNORECASE)
        print(f"[{url.split('=')[-1]}] len: {len(html)} | options: {len(opts)}")
    except Exception as e:
        print(f"[{url.split('=')[-1]}] err: {e}")
