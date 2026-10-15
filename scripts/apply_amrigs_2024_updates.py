import json
from datetime import datetime

# Load matches
with open('data/official_exams/AMRIGS/amrigs_2024_matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

# Fix Q46 for aa30b015-515d-448c-b371-a362c47e57ff
for m in matches:
    if m['id'] == 'aa30b015-515d-448c-b371-a362c47e57ff':
        m['q_num'] = 46
        m['ans'] = 'A'
        print("Fixed aa30b015-515d-448c-b371-a362c47e57ff to Q46 -> A")

match_by_id = {m['id']: m for m in matches}
files_to_update = set(m['file'] for m in matches)

total_updated = 0
for fpath in files_to_update:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated_in_file = 0
    for q in data:
        qid = q.get('id')
        if qid in match_by_id:
            m = match_by_id[qid]
            ans = m['ans']
            q_num = m['q_num']
            
            is_anulada = (ans == 'ANULADA')
            if is_anulada:
                q['is_anulada'] = True
                q['isAnulada'] = True
                q['correct_answer'] = None
                q['correctAnswer'] = None
            else:
                q['is_anulada'] = False
                q['isAnulada'] = False
                q['correct_answer'] = ans
                q['correctAnswer'] = ans
            
            q['official_audit'] = {
                'verified': True,
                'source': 'AMRIGS_2023_GABARITO.pdf',
                'banca': 'Fundatec / AMRIGS',
                'edital': 'Edital 02/2023 (Concurso AMB, AMRIGS, ACM, AMMS 2023/2024)',
                'exam_date': '19/11/2023',
                'prova_source': 'AMRIGS_2023_PROVA.pdf',
                'question_number': q_num,
                'official_gabarito': ans,
                'verified_at': datetime.now().isoformat()
            }
            updated_in_file += 1
            total_updated += 1
            print(f"Updated {qid} (Q{q_num} -> {ans}) in {fpath}")
    
    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {fpath} with {updated_in_file} updates.")

print(f"\nTOTAL UPDATED: {total_updated} / {len(matches)}")
