import os, glob, json

print("=== AMOSTRA DAS FONTES LOCAIS ===")

# 1. gabarito_das_questoes
gq_files = glob.glob('data/knowledge/gabarito_das_questoes/**/*.json', recursive=True)
print(f"\n1. gabarito_das_questoes: {len(gq_files)} arquivos JSON encontrados.")
if gq_files:
    with open(gq_files[0], 'r', encoding='utf-8') as f:
        sample_gq = json.load(f)
        print("  Tipo do primeiro arquivo:", type(sample_gq))
        if isinstance(sample_gq, list) and len(sample_gq) > 0:
            print("  Item sample chaves:", list(sample_gq[0].keys()) if isinstance(sample_gq[0], dict) else sample_gq[0])
            print("  Gabarito presente?", sample_gq[0].get('gabarito') or sample_gq[0].get('correct_answer') or sample_gq[0].get('resposta'))
        elif isinstance(sample_gq, dict):
            print("  Dict chaves:", list(sample_gq.keys())[:10])

# 2. questoes_ineditas_livros_drive_7822.json
if os.path.exists('data/questoes_ineditas_livros_drive_7822.json'):
    with open('data/questoes_ineditas_livros_drive_7822.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
        print(f"\n2. questoes_ineditas_livros_drive_7822.json: tipo {type(d)}")
        if isinstance(d, list) and len(d) > 0:
            print(f"  Total itens: {len(d)}, Chaves item 0: {list(d[0].keys())}")
            print("  Gabarito presente?", d[0].get('gabarito') or d[0].get('correct_answer') or d[0].get('resposta'))
        elif isinstance(d, dict):
            print("  Dict chaves:", list(d.keys()))

# 3. abem_gabaritos_2024_2025_2026.json
if os.path.exists('data/abem_gabaritos_2024_2025_2026.json'):
    with open('data/abem_gabaritos_2024_2025_2026.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
        print(f"\n3. abem_gabaritos_2024_2025_2026.json: tipo {type(d)}")
        if isinstance(d, list) and len(d) > 0:
            print(f"  Total itens: {len(d)}, Chaves item 0: {list(d[0].keys())}")
        elif isinstance(d, dict):
            print("  Dict chaves:", list(d.keys())[:10])

# 4. archive/ginecologia_legacy_extracted.json
if os.path.exists('data/archive/ginecologia_legacy_extracted.json'):
    with open('data/archive/ginecologia_legacy_extracted.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
        print(f"\n4. ginecologia_legacy_extracted.json: tipo {type(d)}")
        if isinstance(d, list) and len(d) > 0:
            print(f"  Total itens: {len(d)}, Chaves item 0: {list(d[0].keys())}")
            print("  Gabarito presente?", d[0].get('gabarito') or d[0].get('correct_answer') or d[0].get('resposta'))
        elif isinstance(d, dict):
            print("  Dict chaves:", list(d.keys())[:10])
