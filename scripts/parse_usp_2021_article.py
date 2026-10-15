import re, sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\froge\.gemini\antigravity-ide\brain\34739a54-bdf0-4038-b6fd-dcc240f6c901\.system_generated\steps\3901\content.md'
with open(path, encoding='utf-8') as f:
    text = f.read()

links = set(re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', text))
print(f'Total links: {len(links)}')
for txt, l in sorted(links):
    print(f'{txt} -> {l}')
