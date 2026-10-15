import json
from datetime import datetime

updates = {
    'cirurgia_final_questions.json': {
        '9cfe9f01-f541-4695-8aaa-7d2c9f11cea5': ('D', 'Cirurgia Geral')
    },
    'ginecologia_final_questions.json': {
        '83aade1d-aab7-4810-b355-32af8ee0ac83': ('D', 'Ginecologia')
    },
    'pediatria_final_questions.json': {
        '30589ed3-bda6-4c54-80db-3429316c0fb3': ('D', 'Pediatria')
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
                "exam_id": "USP_HCRP_2024",
                "institution": "USP/HCRP - Hospital das Clínicas de Ribeirão Preto (SP)",
                "year": 2024,
                "official_answer": ans,
                "is_anulada": False,
                "timestamp": datetime.now().isoformat()
            }
            
            if 'audit_trail' not in q or not isinstance(q['audit_trail'], list):
                q['audit_trail'] = []
            q['audit_trail'].append({
                "action": "homologate_official_gabarito",
                "source": "USP_HCRP_2024_GABARITO_DEFINITIVO",
                "official_answer": ans,
                "is_anulada": False,
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            count += 1
            print(f"Updated {qid} in {filename} -> Ans: {ans}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {count} updates to {filepath}")

print("HCRP 2024 100% completed!")
