import sys
sys.path.append('.')
from scripts.run_fase1_pdf_universal import parse_gabarito, parse_prova

gb_path = "data/official_exams/SES_GO_2026/SES_GO_2026_GB_PEDIATRIA_A.pdf"
pv_path = "data/official_exams/SES_GO_2026/SES_GO_2026_PV_PEDIATRIA_A.pdf"

gabs = parse_gabarito(gb_path)
print(f"Gabarito extraído: {len(gabs)} respostas")
print(gabs)

prov = parse_prova(pv_path)
print(f"Prova extraída: {len(prov)} questões")
if prov:
    first_key = list(prov.keys())[0]
    print(f"Q{first_key}:", prov[first_key]['statement'][:100])
