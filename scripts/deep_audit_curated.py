import sqlite3
import json
import re
from collections import Counter, defaultdict

db_path = 'data/supabase_tables/supabase_tables.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("Iniciando auditoria profunda em questions_curated_staging...")

# 1. Total de questões
cur.execute("SELECT COUNT(*) FROM questions_curated_staging")
total_questions = cur.fetchone()[0]
print(f"Total de questões: {total_questions:,}")

# 2. Gabaritos (correct_answer e is_anulada)
cur.execute("SELECT correct_answer, is_anulada, count(*) FROM questions_curated_staging GROUP BY correct_answer, is_anulada")
gab_rows = cur.fetchall()

gab_summary = Counter()
correct_answer_dist = Counter()
anulada_count = 0

for ans, is_anul, count in gab_rows:
    ans_str = str(ans).strip() if ans is not None else "NULL"
    correct_answer_dist[ans_str] += count
    if is_anul == 1 or ans_str.upper() in ['ANULADA', 'ANULADO']:
        anulada_count += count
        gab_summary['ANULADA'] += count
    elif ans_str in ['A', 'B', 'C', 'D', 'E']:
        gab_summary['HOMOLOGADO_VALIDO'] += count
    elif ans_str in ['NULL', '', 'None', 'SEM_GABARITO']:
        gab_summary['SEM_GABARITO'] += count
    else:
        gab_summary['OUTROS_VALORES'] += count

# 3. Tipos (type)
cur.execute("SELECT type, count(*) FROM questions_curated_staging GROUP BY type")
type_dist = dict(cur.fetchall())

# 4. Auditoria de Alternativas (options) e Comentários (commentary)
# Vamos iterar em lotes para não estourar memória e analisar profundamente
cur.execute("""
    SELECT id, code, source_tables, type, options, correct_answer, is_anulada, commentary, 
           especialidade, tema, foco, subfoco, institution, banca, year
    FROM questions_curated_staging
""")

options_format_counter = Counter()
options_len_counter = Counter()
missing_letter_counter = Counter()
missing_letter_by_source = Counter()
missing_letter_with_valid_gab = Counter()
options_keys_sample = set()

# Análise de discrepâncias entre type e options
type_vs_options = defaultdict(Counter)

# Análise de Comentários
comm_stats = {
    'total_with_commentary': 0,
    'total_without_commentary': 0,
    'gold_full': 0,
    'gold_take_home': 0,
    'gold_structured_justifications': 0,
    'gold_armadilha_or_erro': 0,
    'legacy_commentary': 0,
    'short_commentary': 0, # < 150 chars
}

comm_by_spec = defaultdict(lambda: {'total': 0, 'with_comm': 0, 'gold': 0, 'homologated': 0})

# Exemplos de casos com erro
sample_missing_letters = []
sample_type_mismatch = []

batch_size = 20000
processed = 0

while True:
    rows = cur.fetchmany(batch_size)
    if not rows:
        break
    
    for row in rows:
        qid, code, src_tables, qtype, opts_raw, correct_ans, is_anul, comm, esp, tema, foco, subfoco, inst, banca, yr = row
        processed += 1
        
        esp_str = esp.strip() if esp else "Não definida"
        comm_by_spec[esp_str]['total'] += 1
        
        is_homologated = (correct_ans in ['A', 'B', 'C', 'D', 'E'])
        if is_homologated:
            comm_by_spec[esp_str]['homologated'] += 1
            
        # Parse options
        has_options = False
        opts_list = None
        has_letters = False
        opts_count = 0
        format_type = 'UNKNOWN'
        
        if not opts_raw or opts_raw.strip() in ['', 'null', 'None', '[]', '{}']:
            format_type = 'EMPTY_OR_NULL'
            options_format_counter['EMPTY_OR_NULL'] += 1
        else:
            try:
                parsed = json.loads(opts_raw)
                if isinstance(parsed, list):
                    opts_count = len(parsed)
                    options_len_counter[opts_count] += 1
                    
                    if opts_count == 0:
                        format_type = 'EMPTY_LIST'
                        options_format_counter['EMPTY_LIST'] += 1
                    else:
                        first = parsed[0]
                        if isinstance(first, dict):
                            keys = tuple(sorted(first.keys()))
                            options_keys_sample.add(str(keys))
                            
                            # Verifica se tem letter
                            has_let = any('letter' in item and item['letter'] in ['A','B','C','D','E','a','b','c','d','e'] for item in parsed if isinstance(item, dict))
                            if has_let:
                                format_type = 'LIST_OF_DICTS_WITH_LETTER'
                                options_format_counter['LIST_OF_DICTS_WITH_LETTER'] += 1
                                has_letters = True
                            else:
                                format_type = 'LIST_OF_DICTS_NO_LETTER'
                                options_format_counter['LIST_OF_DICTS_NO_LETTER'] += 1
                                missing_letter_counter['LIST_OF_DICTS_NO_LETTER'] += 1
                                
                                # Guarda amostragem
                                if len(sample_missing_letters) < 10:
                                    sample_missing_letters.append({
                                        'id': qid,
                                        'code': code,
                                        'src': src_tables,
                                        'type': qtype,
                                        'correct_answer': correct_ans,
                                        'keys': list(first.keys()),
                                        'options_preview': [str(x)[:80] for x in parsed[:3]]
                                    })
                                
                                # Rastreia fonte
                                src_key = src_tables or 'UNKNOWN'
                                missing_letter_by_source[src_key] += 1
                                if is_homologated:
                                    missing_letter_with_valid_gab[correct_ans] += 1
                        elif isinstance(first, str):
                            format_type = 'LIST_OF_STRINGS'
                            options_format_counter['LIST_OF_STRINGS'] += 1
                            missing_letter_counter['LIST_OF_STRINGS'] += 1
                            src_key = src_tables or 'UNKNOWN'
                            missing_letter_by_source[f"STRING_LIST: {src_key}"] += 1
                        else:
                            format_type = 'LIST_OF_OTHER'
                            options_format_counter['LIST_OF_OTHER'] += 1
                elif isinstance(parsed, dict):
                    format_type = 'DICT_KEY_VAL'
                    options_format_counter['DICT_KEY_VAL'] += 1
                else:
                    format_type = 'OTHER_JSON'
                    options_format_counter['OTHER_JSON'] += 1
            except Exception:
                format_type = 'RAW_STRING_NON_JSON'
                options_format_counter['RAW_STRING_NON_JSON'] += 1
        
        # Cruzamento type vs options
        qtype_str = qtype or 'NULL'
        type_vs_options[qtype_str][format_type] += 1
        
        # Casos de tipo incoerente
        if qtype_str in ['Discursiva', 'Dissertativa'] and opts_count >= 3:
            if len(sample_type_mismatch) < 10:
                sample_type_mismatch.append({
                    'id': qid,
                    'code': code,
                    'type': qtype,
                    'opts_count': opts_count,
                    'format': format_type,
                    'correct_answer': correct_ans
                })
        
        # Análise de Comentário
        if not comm or comm.strip() == '' or comm.strip() in ['null', 'None']:
            comm_stats['total_without_commentary'] += 1
        else:
            comm_stats['total_with_commentary'] += 1
            comm_by_spec[esp_str]['with_comm'] += 1
            comm_text = comm.strip()
            comm_len = len(comm_text)
            
            has_take_home = bool(re.search(r'take[- ]?home\s+message|pérola\s+do\s+preceptor', comm_text, re.IGNORECASE))
            has_armadilha = bool(re.search(r'principal\s+erro|armadilha\s+da\s+questão|pegadinha|cuidado\s+clínico', comm_text, re.IGNORECASE))
            has_justifications = bool(re.search(r'(alternativa\s+[a-e]|assertiva\s+[a-e]|\b[a-e]\)\s+|\*\*[a-e]\*\*|justificativa)', comm_text, re.IGNORECASE))
            has_resumo = bool(re.search(r'comentário\s+final|síntese|resumo\s+fisiopatológico', comm_text, re.IGNORECASE))
            
            if has_take_home:
                comm_stats['gold_take_home'] += 1
            if has_justifications:
                comm_stats['gold_structured_justifications'] += 1
            if has_armadilha:
                comm_stats['gold_armadilha_or_erro'] += 1
                
            # Classificação de ouro completa:
            if has_take_home and (has_justifications or has_resumo):
                comm_stats['gold_full'] += 1
                comm_by_spec[esp_str]['gold'] += 1
            elif comm_len < 150:
                comm_stats['short_commentary'] += 1
            else:
                comm_stats['legacy_commentary'] += 1

print(f"Auditoria concluída: {processed} questões processadas.")

results = {
    'total_questions': total_questions,
    'gabarito_summary': dict(gab_summary),
    'correct_answer_dist': dict(correct_answer_dist),
    'anulada_count': anulada_count,
    'type_distribution': type_dist,
    'options_format_counter': dict(options_format_counter),
    'options_len_counter': dict(options_len_counter),
    'missing_letter_counter': dict(missing_letter_counter),
    'missing_letter_by_source': dict(missing_letter_by_source),
    'missing_letter_with_valid_gab': dict(missing_letter_with_valid_gab),
    'options_keys_sample': list(options_keys_sample),
    'type_vs_options': {k: dict(v) for k, v in type_vs_options.items()},
    'sample_missing_letters': sample_missing_letters,
    'sample_type_mismatch': sample_type_mismatch,
    'commentary_stats': comm_stats,
    'commentary_by_spec': {k: dict(v) for k, v in comm_by_spec.items()}
}

with open('scripts/deep_audit_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Resultados salvos com sucesso em scripts/deep_audit_results.json")
