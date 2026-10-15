import re
import urllib.request

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.fundatec.org.br/portal/concursos/index_concursos.php?concurso=677'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('iso-8859-1', errors='ignore')
    
    for m in re.finditer(r'janelagrande\([\'"]([^\'"]+)[\'"]\)', html):
        print('Janela:', m.group(1))

    for m in re.finditer(r'[\'"\(]([^\'"\(\)\s]+\.pdf[^\'"\)\s]*)', html):
        print('PDF:', m.group(1))
except Exception as e:
    print("Error:", e)
