import glob, json

files = glob.glob('data/*_final_questions.json')

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
        for q in qs:
            inst = q.get('institution') or ''
            if 'psu-mg' in inst.lower():
                print(f"Code: {q.get('code')} | TipoProva: {q.get('tipoProva')} | Year: {q.get('year')} | OfficialBook: {q.get('official_book')} | Provenance: {q.get('provenance')}")
                print(f"  Commentary: {q.get('commentary')}")
                print(f"  Correct: {q.get('correct_answer')}")
                break
