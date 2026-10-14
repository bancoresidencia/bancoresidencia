import os, sys, json, re, unicodedata, pypdf

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))

# 1. Carrega OCR
with open('data/official_exams/USP_FUVEST/usp_2024_ocr_text.json', 'r', encoding='utf-8-sig') as f:
    ocr_map = json.load(f)

# 2. Carrega gabarito Prova A1 do PDF
from coletor_gabaritos.extractors.usp_extractor import USPExtractor
ext = USPExtractor()
gb_results = ext.extract('data/official_exams/USP_FUVEST/USP_FUVEST_2024_GB.pdf')
prova_a1 = next((r for r in gb_results if 'A1' in r.versao_caderno), None)

print(f"Gabarito Prova A1: {len(prova_a1.questoes)} questões")
ans_map = {}
for q in prova_a1.questoes:
    ans_map[q.numero_questao] = 'ANULADA' if q.status == 'anulada' else q.alternativa

print("Amostra gabarito A1:", [(k, ans_map[k]) for k in range(1, 15)])

# 3. Extrai questões do caderno OCR
# Junta páginas com quebras limpas
pages = []
for p in range(3, 39):
    k = f"page_{p:02d}"
    txt = ocr_map.get(k, '')
    txt = re.sub(r'Processo Seletivo aos Programas.*?PROVA AI\s*', '', txt)
    txt = re.sub(r'PAG \d+/\d+.*$', '', txt, flags=re.MULTILINE)
    pages.append(txt)

full_txt = '\n'.join(pages)

# Procura cada questão de 1 a 120
# Cada questão aparece como "01", "02", ..., "120"
# Vamos achar os índices no texto
q_positions = []
for qn in range(1, 121):
    q_str = f"{qn:02d}" if qn < 100 else f"{qn}"
    # regex procurando o número da questão no início de linha ou após espaço, seguido de letra maiúscula
    m = re.search(rf'(?:^|\n|\s){q_str}\s+([A-ZÀ-Ú])', full_txt)
    if m:
        # posição do dígito
        start_idx = m.start() + (1 if m.group(0)[0] in ['\n', ' ', '\r'] else 0)
        q_positions.append((qn, start_idx))
    else:
        # tenta sem zero à esquerda
        m2 = re.search(rf'(?:^|\n|\s){qn}\s+([A-ZÀ-Ú])', full_txt)
        if m2:
            start_idx = m2.start() + (1 if m2.group(0)[0] in ['\n', ' ', '\r'] else 0)
            q_positions.append((qn, start_idx))

q_positions = sorted(q_positions, key=lambda x: x[0])
print(f"Questões identificadas no caderno: {len(q_positions)}/120")
missing = [i for i in range(1, 121) if i not in [q[0] for q in q_positions]]
print(f"Faltantes se houver: {missing}")
