import glob
import json

local_by_year = {}
for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        y = q.get('year', 'Unknown')
        ca = q.get('correct_answer')
        is_anulada = q.get('is_anulada', False)
        st = local_by_year.setdefault(y, {'total': 0, 'missing': 0, 'has_gabarito': 0, 'anulada': 0})
        st['total'] += 1
        if not ca:
            st['missing'] += 1
        elif is_anulada or ca == 'ANULADA':
            st['anulada'] += 1
        else:
            st['has_gabarito'] += 1

print("--- LOCAL BANK BY YEAR ---")
for y in sorted([y for y in local_by_year if isinstance(y, int)], reverse=True):
    s = local_by_year[y]
    pct = (s['missing'] / s['total']) * 100 if s['total'] > 0 else 0
    print(f"Ano {y:4d}: Total {s['total']:5d} | Com Gabarito {s['has_gabarito']:5d} | Anulada {s['anulada']:4d} | Faltante {s['missing']:5d} ({pct:4.1f}%)")

