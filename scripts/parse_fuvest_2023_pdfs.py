import re

path = r'C:\Users\froge\.gemini\antigravity-ide\brain\f34b3006-1136-4e88-97ee-ae5ee9937043\.system_generated\steps\199\content.md'
with open(path, encoding='utf-8') as f:
    txt = f.read()

pdfs = set(re.findall(r'href=["\']([^"\']+\.pdf)["\']', txt))
for p in sorted(pdfs):
    print(p)
