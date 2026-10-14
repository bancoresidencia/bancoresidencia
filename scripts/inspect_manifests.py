import json, os

for fn in ['data/gabarito_das_questoes_manifest.json', 'data/medcurso_extracao_manifest.json']:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            d = json.load(f)
            print(f"\n=== {fn} ===")
            print(f"Total Unique Questions: {d.get('totalUniqueQuestions')}")
            specs = d.get('specialties', [])
            print(f"Specialties: {len(specs)}")
            for sp in specs[:3]:
                print(f"  - {sp.get('name')}: {sp.get('totalQuestions')} questoes, files: {len(sp.get('files', []))}")
                if sp.get('files'):
                    print(f"     ex file: {sp['files'][0]}")
