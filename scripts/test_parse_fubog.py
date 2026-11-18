import sys
sys.path.append('.')
from scripts.run_fase1_pdf_universal import parse_prova, parse_gabarito

pv = 'data/incoming_exams/Selecting_42/PV_EDITAL_42_VERSAO_1A.pdf'
gb = 'data/incoming_exams/Selecting_42/GB_EDITAL_42_VERSAO_1A.pdf'

prov = parse_prova(pv)
gabs = parse_gabarito(gb)
print(f'OPTY/IOG prov: {len(prov)} questoes, gabs: {len(gabs)} respostas')
if prov and gabs:
    for n in range(1, 10):
        st = prov.get(n, {}).get("statement", "")[:70].replace('\n', ' ')
        print(f"Q{n} [{gabs.get(n)}]: {st}")
