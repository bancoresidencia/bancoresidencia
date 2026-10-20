import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/questmed_bundle.js', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'SLUG', text):
    start = max(0, m.start() - 60)
    end = min(len(text), m.end() + 60)
    print("SLUG:", text[start:end])

print("\n=== SESSAO / 30min / TEMPO DE USO / TRIAL ===")
# procurar onde questmed_session_token ou tempo é usado
for m in re.finditer(r'questmed_session_token', text):
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 100)
    print("SESSION TOKEN:", text[start:end])
    print("-" * 50)

# procurar por heartbeat ou sessions
for m in re.finditer(r'/api/sessions', text):
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 100)
    print("SESSIONS API:", text[start:end])
    print("-" * 50)
