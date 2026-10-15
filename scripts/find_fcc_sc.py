import requests, re, sys
sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for slug in ['scmsp124', 'scmsp224', 'scmsp125', 'scmsp225', 'scmsp126', 'scmsp226']:
    url = f'https://www.concursosfcc.com.br/concursos/{slug}/index.html'
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            title = re.findall(r'<title>(.*?)</title>', r.text, re.I)
            t = title[0] if title else 'Sem titulo'
            print(f"\n=== {slug} ({url}): {t} ===")
            links = re.findall(r'href=[\'"]([^\'"]+?)[\'"][^>]*>(.*?)</a>', r.text, re.DOTALL)
            for l, txt in links:
                txt_c = ' '.join(re.sub(r'<[^>]+>', ' ', txt).split())
                if any(k in txt_c.lower() or k in l.lower() for k in ['prova', 'gabarito', 'caderno']):
                    print(f"  {txt_c}: {l}")
    except Exception as e:
        print(f"Error {slug}: {e}")
