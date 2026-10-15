import requests, re, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = "https://www.fundatec.org.br/portal/concursos/publicacoes_v2.php?concurso=647"
r = requests.get(url, headers=headers)
print("Status:", r.status_code, "Length:", len(r.text))

# Find any links, script tags, ajax calls or form actions
scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', r.text, re.I)
print("Scripts:", scripts[:5])

# Find ajax / fetch in inline scripts
inline_ajax = re.findall(r'(?:fetch|ajax|\.get|\.post|url:)\s*[\'"]([^\'"]+)[\'"]', r.text, re.I)
print("Inline endpoints:", inline_ajax)

# Print title and h1-h4
titles = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', r.text, re.I)
print("Headings:", [re.sub(r'<[^>]+>', '', t).strip() for t in titles])
