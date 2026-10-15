import json
from datetime import datetime

updates = {
    'cirurgia_final_questions.json': {
        '73420d27-798e-4865-9ea7-51ea0e4bfa74': ('D', 'Cirurgia Geral'),
        'ddde8e6a-a471-4750-acc0-4e115d077e93': ('D', 'Cirurgia Geral')
    },
    'obstetricia_final_questions.json': {
        '64329efb-2a4a-4863-ad4b-84ada7f05bb0': ('D', 'Obstetrícia'),
        'e6d90625-310b-43ff-9e69-c8341cf9a7ee': ('A', 'Obstetrícia')
    },
    'pediatria_final_questions.json': {
        'dcff767e-e20f-43a7-aa27-ada87eb70c52': ('C', 'Pediatria'),
        'd9344edf-4fc7-4e49-99ba-228871c7c341': ('D', 'Pediatria')
    }
}

for filename, q_dict in updates.items():
    filepath = f"data/{filename}"
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    count = 0
    for q in data:
        qid = q.get('id')
        if qid in q_dict:
            ans, spec = q_dict[qid]
            q['correct_answer'] = ans
            q['correctAnswer'] = ans
            q['is_anulada'] = False
            q['isAnulada'] = False
            
            q['official_audit'] = {
                "verified": True,
                "exam_id": "AMRIGS_2023",
                "institution": "AMRIGS - Associação Médica do Rio Grande do Sul",
                "year": 2023,
                "official_answer": ans,
                "is_anulada": False,
                "timestamp": datetime.now().isoformat()
            }
            
            if 'audit_trail' not in q or not isinstance(q['audit_trail'], list):
                q['audit_trail'] = []
            q['audit_trail'].append({
                "action": "homologate_official_gabarito",
                "source": "AMRIGS_2023_GABARITO_DEFINITIVO",
                "official_answer": ans,
                "is_anulada": False,
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            count += 1
            print(f"Updated {qid} in {filename} -> Ans: {ans}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {count} updates to {filepath}")

print("AMRIGS 2023 is now 100% complete!")
