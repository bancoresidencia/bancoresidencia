import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for cid in ['407', '315', '358']:
    url = f'https://www.fundatec.org.br/portal/concursos/index_concursos.php?concurso={cid}'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('iso-8859-1', errors='ignore')
        
        janelas = re.findall(r'janelagrande\([\'"]([^\'"]+)[\'"]\)', html)
        print(f"\n=== Concurso {cid} ({len(janelas)} janelas) ===")
        for j in janelas:
            print("  ", j)
    except Exception as e:
        print(f"Concurso {cid} error:", e)
