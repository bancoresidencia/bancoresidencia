import sqlite3

conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cur = conn.cursor()

# Precisamos checar todas as 33.746 que foram classificadas como LIST_OF_DICTS_NO_LETTER
# Vamos fazer uma varredura idêntica à do script de auditoria profunda
cur.execute("""
    SELECT id, options, correct_answer, is_anulada, source_tables
    FROM questions_curated_staging
""")

total_no_letter = 0
no_letter_homologadas = 0
no_letter_anuladas = 0
no_letter_sem_gabarito = 0
no_letter_anomalias = 0

import json

while True:
    rows = cur.fetchmany(20000)
    if not rows:
        break
    for r in rows:
        qid, opts_raw, correct_ans, is_anul, src = r
        if not opts_raw or opts_raw.strip() in ['', 'null', 'None', '[]', '{}']:
            continue
        try:
            parsed = json.loads(opts_raw)
            if isinstance(parsed, list) and len(parsed) > 0 and isinstance(parsed[0], dict):
                has_let = any('letter' in item and item['letter'] in ['A','B','C','D','E','a','b','c','d','e'] for item in parsed if isinstance(item, dict))
                if not has_let:
                    total_no_letter += 1
                    ans_str = str(correct_ans).strip() if correct_ans is not None else ""
                    if is_anul == 1 or ans_str.upper() == 'ANULADA':
                        no_letter_anuladas += 1
                    elif ans_str in ['A', 'B', 'C', 'D', 'E']:
                        no_letter_homologadas += 1
                    elif ans_str in ['', 'None', 'NULL']:
                        no_letter_sem_gabarito += 1
                    else:
                        no_letter_anomalias += 1
        except Exception:
            pass

print("=== TOTAL SEM LETRA (LIST_OF_DICTS_NO_LETTER) ===")
print("Total sem letra:", total_no_letter)
print("  - Homologadas Válidas (A-E):", no_letter_homologadas)
print("  - Anuladas:", no_letter_anuladas)
print("  - Sem Gabarito:", no_letter_sem_gabarito)
print("  - Anomalias (!, etc.):", no_letter_anomalias)
print("Soma:", no_letter_homologadas + no_letter_anuladas + no_letter_sem_gabarito + no_letter_anomalias)
