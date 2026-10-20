import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/qm_SimulationExam-CvRS3iv_.js', encoding='utf-8') as f:
    text = f.read()

# APIs in SimulationExam
apis = re.findall(r'[\'\"`](/api/[a-zA-Z0-9_\-\/\?]+)[\'\"`]', text)
print("=== APIs EM SimulationExam ===")
for a in sorted(set(apis)):
    print(" ", a)

print("\n=== ESTRUTURA DO OBJETO DE QUESTÃO ===")
for m in list(re.finditer(r'gabarito', text))[:5]:
    start = max(0, m.start() - 150)
    end = min(len(text), m.end() + 150)
    print("SNIPPET:", text[start:end])
    print("-" * 50)
