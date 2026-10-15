import json
from datetime import datetime

# Updates for USP 2024:
# 1. 5a7ce349-9e15-4f87-8e61-890e9339dbeb -> clinica_medica, Q48, ans='A'
# 2. 6f64be42-cd37-4420-ad85-2b61db67bbe3 -> clinica_medica, Q58, ans='A'
# 3. 1233dbea-1273-430a-a2a4-c775ccb137a6 -> ginecologia, Q114, ans='A'
# Updates for USP 2025:
# 4. 7c6f54f6-96d9-4ae0-9a60-98abb1848e11 -> clinica_medica, Q11, ans='C'

updates_cm = {
    '5a7ce349-9e15-4f87-8e61-890e9339dbeb': (48, 'A', 'USP_FUVEST_2024', 'COREME/FM/AD Nº 01/2023', 'PROVA A1'),
    '6f64be42-cd37-4420-ad85-2b61db67bbe3': (58, 'A', 'USP_FUVEST_2024', 'COREME/FM/AD Nº 01/2023', 'PROVA A1'),
    '7c6f54f6-96d9-4ae0-9a60-98abb1848e11': (11, 'C', 'USP_FUVEST_2025', 'COREME/FM/ Nº 01/2024', 'PROVA A1')
}

updates_gin = {
    '1233dbea-1273-430a-a2a4-c775ccb137a6': (114, 'A', 'USP_FUVEST_2024', 'COREME/FM/AD Nº 01/2023', 'PROVA A1')
}

def apply_updates(filepath, update_dict):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    count = 0
    for q in data:
        qid = q.get('id')
        if qid in update_dict:
            num, ans, exam_id, edital, caderno = update_dict[qid]
            q['question_number'] = num
            q['number'] = num
            q['correct_answer'] = ans
            q['correctAnswer'] = ans
            q['is_anulada'] = False
            q['isAnulada'] = False
            
            q['official_audit'] = {
                "verified": True,
                "exam_id": exam_id,
                "concurso": edital,
                "caderno": caderno,
                "question_number": num,
                "official_answer": ans,
                "is_anulada": False,
                "timestamp": datetime.now().isoformat()
            }
            
            if 'audit_trail' not in q or not isinstance(q['audit_trail'], list):
                q['audit_trail'] = []
            q['audit_trail'].append({
                "action": "homologate_official_gabarito",
                "source": f"{exam_id}_GB.pdf / {exam_id}_PV.pdf ({caderno})",
                "question_number": num,
                "official_answer": ans,
                "is_anulada": False,
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            count += 1
            print(f"Updated {qid} in {filepath} -> Q{num} = {ans}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {count} updates to {filepath}")

apply_updates('data/clinica_medica_final_questions.json', updates_cm)
apply_updates('data/ginecologia_final_questions.json', updates_gin)
print("\nAll 4 residual questions updated successfully!")
