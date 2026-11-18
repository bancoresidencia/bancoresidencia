import sys
sys.path.append('.')
from scripts.run_fase1_pdf_universal import parse_prova, parse_gabarito

pv_path = "data/official_exams/SES_GO_2026/PV_CLINICA_MEDICA_A.pdf"
gb_path = "data/official_exams/SES_GO_2026/GB_CLINICA_MEDICA_A.pdf"

prov = parse_prova(pv_path)
print(f"PV extraída: {len(prov)} questões")
gabs = parse_gabarito(gb_path)
print(f"GB extraído: {len(gabs)} respostas")

if prov:
    for num, q in list(prov.items())[:5]:
        print(f"Q{num}:", q['statement'][:80].replace('\n', ' '))
