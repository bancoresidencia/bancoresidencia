import json
import os

for fname in ['data/lote2_resolved_matches.json', 'data/lote2_ultra_strict_matches.json', 'data/lote2_official_matches_ready.json', 'data/coleta_gabaritos_staging.json']:
    if os.path.exists(fname):
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
        hsc = [d for d in data if 'HSC' in str(d)]
        print(f"{fname}: total={len(data)}, HSC={len(hsc)}")
        if hsc:
            print("  Sample HSC in", fname, ":", str(hsc[0])[:200])
