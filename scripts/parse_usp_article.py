import re, sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\froge\.gemini\antigravity-ide\brain\34739a54-bdf0-4038-b6fd-dcc240f6c901\.system_generated\steps\3853\content.md'
with open(path, encoding='utf-8') as f:
    text = f.read()

links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', text, re.I | re.DOTALL)
print(f'Total links: {len(links)}')
for l, t in links:
    t_c = ' '.join(re.sub(r'<[^>]+>', ' ', t).split())
    if any(k in l.lower() or k in t_c.lower() for k in ['prova', 'gabarito', 'caderno', 'pdf', 'download', 'clique aqui', 'fmusp']):
        print(f'{t_c} -> {l}')
