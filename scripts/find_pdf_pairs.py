import os
import glob
import re

def find_pairs():
    base_dir = 'data/official_exams'
    subdirs = [os.path.join(base_dir, d) for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]
    
    pairs = []
    for sdir in subdirs:
        banca = os.path.basename(sdir)
        pdfs = [os.path.join(sdir, f) for f in os.listdir(sdir) if f.lower().endswith('.pdf')]
        
        provas = [p for p in pdfs if 'PV_' in os.path.basename(p) or 'PROVA' in os.path.basename(p).upper()]
        gabaritos = [g for g in pdfs if 'GB_' in os.path.basename(g) or 'GABARITO' in os.path.basename(g).upper()]
        
        print(f"[{banca}] Provas: {len(provas)}, Gabaritos: {len(gabaritos)}")
        
        # Try to pair them up
        for pv in provas:
            pv_name = os.path.basename(pv)
            # Find matching gb
            # E.g. PV_ACESSO_DIRETO_A.pdf -> GB_ACESSO_DIRETO_A.pdf
            clean_tag = pv_name.replace('PV_', '').replace('PROVA_', '').replace('.pdf', '')
            match_gb = None
            for gb in gabaritos:
                gb_name = os.path.basename(gb)
                if clean_tag in gb_name or clean_tag.replace('_PROVA', '') in gb_name:
                    match_gb = gb
                    break
            if match_gb:
                pairs.append({'banca': banca, 'prova': pv, 'gabarito': match_gb})
            else:
                # If only 1 prova and 1 gabarito in folder
                if len(provas) == 1 and len(gabaritos) == 1:
                    pairs.append({'banca': banca, 'prova': pv, 'gabarito': gabaritos[0]})

    print(f"\nTotal Matched Pairs Found: {len(pairs)}")
    for p in pairs[:10]:
        print(f" - [{p['banca']}] {os.path.basename(p['prova'])} <---> {os.path.basename(p['gabarito'])}")

find_pairs()
