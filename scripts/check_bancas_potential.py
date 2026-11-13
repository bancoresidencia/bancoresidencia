import json

with open('data/diagnostico_todas_pendencias.json', 'r', encoding='utf-8') as f:
    diag = json.load(f)

byPrefix = diag['byPrefix']

# Check bancas with downloaded PDFs
downloaded_bancas = {
    'UERJ': ['UERJ', 'UERJHUPE'],
    'ABEM': ['ABEM', 'ABEMTESTEDEP'],
    'FUBOG': ['FUBOG'],
    'ENARE': ['ENARE'],
    'UNICAMP': ['UNICAMP', 'UNICAMPHC'],
    'PSU_MG': ['PSUMG', 'AREMG'],
    'USCS': ['USCS'],
    'HMG': ['HMG']
}

# Check bancas with ZERO PDFs
missing_bancas = {
    'AMRIGS': ['AMRIGS', 'COMPLEXOAMRI'],
    'SANTA_CASA_SP': ['SANTACASASP', 'SCMSP', 'ISCMSP'],
    'SES_DF': ['SESDF'],
    'SES_PE': ['SESPE'],
    'SUS_SP': ['SUSSP'],
    'USP_FUVEST': ['USP', 'FUVEST', 'FMUSP', 'FMRP']
}

print("=== PENDÊNCIAS EM BANCAS COM PDFS JÁ BAIXADOS (PRONTOS PARA PARSER/CRUZAMENTO) ===")
for b, pfxs in downloaded_bancas.items():
    total = sum(byPrefix.get(p, 0) for p in pfxs)
    print(f"  - {b}: {total} pendentes no banco")

print("\n=== PENDÊNCIAS EM BANCAS COM 0 PDFS (PRECISAM DE EXTRAÇÃO PELA WEB) ===")
for b, pfxs in missing_bancas.items():
    total = sum(byPrefix.get(p, 0) for p in pfxs)
    print(f"  - {b}: {total} pendentes no banco")

