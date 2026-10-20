import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('data/qm_SimulationExam-CvRS3iv_.js', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'/api/simulations/(?:questions|pdf/questions)', text):
    start = max(0, m.start() - 250)
    end = min(len(text), m.end() + 250)
    print("MATCH AT", m.start())
    print(text[start:end])
    print('='*60)
