import urllib.request
import re

url = 'https://www.fundatec.org.br/portal/concursos/provas_anteriores.php?concurso=677'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        matches = re.findall(r'<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', html, re.I | re.DOTALL)
        print('Total a tags found:', len(matches))
        for href, text in matches:
            t = text.strip()
            if any(k in href.lower() or k in t.lower() for k in ['pdf', 'gabarito', 'prova']):
                print(f'{t} -> {href}')
except Exception as e:
    print('Error:', e)
