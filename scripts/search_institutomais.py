import requests, re, sys
sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

try:
    r = requests.get('https://www.institutomais.org.br/Concursos/', headers=headers, timeout=10)
    print('Status Concursos:', r.status_code)
    m = re.findall(r'href=[\'"]([^\'"]+?)[\'"][^>]*>(.*?)</a>', r.text, re.DOTALL)
    for l, t in m:
        t_clean = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
        if any(k in t_clean.lower() for k in ['santa casa', 'misericórdia', 'iscmsp', 'residência médica']):
            print(f"MAIS: {t_clean} -> {l}")
except Exception as e:
    print('Error Instituto Mais:', e)

# Also check encerados / finalizados
try:
    r2 = requests.get('https://www.institutomais.org.br/Concursos/Encerrados', headers=headers, timeout=10)
    print('Status Encerrados:', r2.status_code)
    m2 = re.findall(r'href=[\'"]([^\'"]+?)[\'"][^>]*>(.*?)</a>', r2.text, re.DOTALL)
    for l, t in m2:
        t_clean = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
        if any(k in t_clean.lower() for k in ['santa casa', 'misericórdia', 'iscmsp', 'residência médica']):
            print(f"MAIS ENCERRADO: {t_clean} -> {l}")
except Exception as e:
    print('Error Instituto Mais Encerrados:', e)
