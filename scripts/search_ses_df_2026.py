import sys, re
from bs4 import BeautifulSoup
sys.stdout.reconfigure(encoding='utf-8')

p = r'C:\Users\froge\.gemini\antigravity-ide\brain\34739a54-bdf0-4038-b6fd-dcc240f6c901\.system_generated\steps\4516\content.md'
with open(p, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
text = soup.get_text()

lines = [l.strip() for l in text.split('\n') if l.strip()]
print(f'Total de linhas não-vazias: {len(lines)}')
for i, l in enumerate(lines[:100]):
    print(f'{i}: {l}')
