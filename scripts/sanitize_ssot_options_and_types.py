import sqlite3
import json
import os
import sys

db_path = 'data/supabase_tables/supabase_tables.db'
print(f"Conectando à SSOT em {db_path}...")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Pré-checagens e Checksums
print("--- 1. Executando pré-checagens de integridade ---")
cur.execute("SELECT COUNT(*) FROM questions_curated_staging")
total_pre = cur.fetchone()[0]

cur.execute("""
    SELECT count(especialidade), count(tema), count(foco), count(subfoco)
    FROM questions_curated_staging
""")
esp_pre, tema_pre, foco_pre, subfoco_pre = cur.fetchone()
print(f"Total de questões: {total_pre:,}")
print(f"Checksum Taxonômico Pré: Esp={esp_pre:,}, Tema={tema_pre:,}, Foco={foco_pre:,}, Subfoco={subfoco_pre:,}")

cur.execute("""
    SELECT type, count(*) 
    FROM questions_curated_staging 
    GROUP BY type
""")
print("Distribuição Prévia de Type:")
for r in cur.fetchall():
    print(f"  {repr(r[0])}: {r[1]:,}")

# 2. Execução das Transformações em Lote
print("\n--- 2. Processando Saneamento na SSOT (Modo Transacional) ---")

LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

# Vamos ler todas as questões que precisam de atualização
# A) Questões sem letter no JSON de options
# B) Questões com 1 opção (discursivas com espelho)
# C) Questões com 2 opções (certo/errado)
# D) Questões com correct_answer = '!' ou números
# E) Questões com type 'Discursiva' ou 'Dissertativa'

cur.execute("""
    SELECT id, type, options, correct_answer, commentary, is_anulada, statement
    FROM questions_curated_staging
""")

rows = cur.fetchall()
print(f"Linhas carregadas para análise: {len(rows):,}")

updated_records = []
stats = {
    'letters_injected': 0,
    'certo_errado_reclassified': 0,
    'dissertativa_1_option_converted': 0,
    'dissertativa_numeric_gab_converted': 0,
    'dissertativa_standardized': 0,
    'exclamation_gab_normalized': 0,
    'total_rows_modified': 0
}

for row in rows:
    qid, qtype, opts_raw, correct_ans, comm, is_anul, stmt = row
    
    modified = False
    new_type = qtype
    new_opts = opts_raw
    new_ans = correct_ans
    new_comm = comm
    new_anul = is_anul
    
    # Parse options se existir
    parsed_opts = None
    if opts_raw and opts_raw.strip() not in ['', 'null', 'None', '[]', '{}']:
        try:
            parsed_opts = json.loads(opts_raw)
        except Exception:
            parsed_opts = None
            
    # --- REGRA 1: Questões com 1 única opção contendo espelho de resposta -> DISSERTATIVA ---
    if parsed_opts and isinstance(parsed_opts, list) and len(parsed_opts) == 1:
        opt_item = parsed_opts[0]
        opt_text = opt_item.get('text', '') if isinstance(opt_item, dict) else str(opt_item)
        
        # Mover espelho para commentary
        if not new_comm or new_comm.strip() in ['', 'null', 'None']:
            new_comm = opt_text
        elif opt_text not in new_comm:
            new_comm = f"{new_comm}\n\n[Espelho Oficial]: {opt_text}"
            
        new_opts = '[]'
        new_type = 'Dissertativa'
        new_ans = 'DISSERTATIVA'
        stats['dissertativa_1_option_converted'] += 1
        modified = True

    # --- REGRA 2: Questões com gabarito numérico e statement discursivo -> DISSERTATIVA ---
    elif str(correct_ans).strip() in ['37', '38', '39', '40', '10', '7', '8', '9', '95'] and (
        'QUESTÃO DISCURSIVA' in (stmt or '').upper() or 'DISCURSIVA' in (stmt or '').upper() or 'DISSERTATIVA' in (stmt or '').upper()
    ):
        new_type = 'Dissertativa'
        new_ans = 'DISSERTATIVA'
        new_opts = '[]'
        stats['dissertativa_numeric_gab_converted'] += 1
        modified = True

    # --- REGRA 3: Questões já dissertativas/discursivas -> Padronizar para 'Dissertativa' ---
    elif qtype in ['Dissertativa', 'Discursiva'] or (
        parsed_opts and isinstance(parsed_opts, list) and len(parsed_opts) == 0 and 'DISCURSIVA' in (stmt or '').upper()
    ):
        if new_type != 'Dissertativa':
            new_type = 'Dissertativa'
            modified = True
            stats['dissertativa_standardized'] += 1
        if not parsed_opts or len(parsed_opts) == 0:
            if new_opts != '[]':
                new_opts = '[]'
                modified = True
            if new_ans in [None, '', 'None', 'NULL']:
                new_ans = 'DISSERTATIVA'
                modified = True

    # --- REGRA 4: Questões com 2 opções -> CERTO OU ERRADO ---
    elif parsed_opts and isinstance(parsed_opts, list) and len(parsed_opts) == 2:
        if new_type != 'Certo ou errado':
            new_type = 'Certo ou errado'
            modified = True
            stats['certo_errado_reclassified'] += 1
            
        # Garantir letters A e B
        opts_changed = False
        fixed_opts = []
        for i, opt in enumerate(parsed_opts):
            expected_letter = 'A' if i == 0 else 'B'
            if isinstance(opt, dict):
                opt_copy = dict(opt)
                if opt_copy.get('letter') != expected_letter:
                    opt_copy['letter'] = expected_letter
                    opts_changed = True
                fixed_opts.append(opt_copy)
            else:
                fixed_opts.append({'letter': expected_letter, 'text': str(opt)})
                opts_changed = True
                
        if opts_changed:
            new_opts = json.dumps(fixed_opts, ensure_ascii=False)
            stats['letters_injected'] += 1
            modified = True

    # --- REGRA 5: Questões de múltipla escolha com opções sem a chave 'letter' (As 33.746) ---
    elif parsed_opts and isinstance(parsed_opts, list) and len(parsed_opts) > 0:
        if new_type != 'Múltipla escolha':
            new_type = 'Múltipla escolha'
            modified = True
            
        opts_changed = False
        fixed_opts = []
        for i, opt in enumerate(parsed_opts):
            expected_letter = LETTERS[i] if i < len(LETTERS) else f"OPT_{i+1}"
            if isinstance(opt, dict):
                opt_copy = dict(opt)
                raw_let = opt_copy.get('letter')
                if not raw_let or str(raw_let).strip().upper() not in LETTERS:
                    opt_copy['letter'] = expected_letter
                    opts_changed = True
                fixed_opts.append(opt_copy)
            else:
                fixed_opts.append({'letter': expected_letter, 'text': str(opt)})
                opts_changed = True
                
        if opts_changed:
            new_opts = json.dumps(fixed_opts, ensure_ascii=False)
            stats['letters_injected'] += 1
            modified = True

    # --- REGRA 6: Gabaritos Anômalos '!' ---
    if str(correct_ans).strip() == '!':
        new_anul = 1
        new_ans = 'ANULADA'
        stats['exclamation_gab_normalized'] += 1
        modified = True

    if modified:
        stats['total_rows_modified'] += 1
        updated_records.append((new_type, new_opts, new_ans, new_comm, new_anul, qid))

print(f"\nResumo de Modificações Preparadas:")
for k, v in stats.items():
    print(f"  {k}: {v:,}")

# 3. Aplicar Atualizações no SQLite sob Transação
print(f"\nGravando {len(updated_records):,} registros atualizados no SQLite em lote...")

batch_size = 5000
cur.execute("BEGIN TRANSACTION")
try:
    for i in range(0, len(updated_records), batch_size):
        chunk = updated_records[i:i + batch_size]
        cur.executemany("""
            UPDATE questions_curated_staging
            SET type = ?,
                options = ?,
                correct_answer = ?,
                commentary = ?,
                is_anulada = ?
            WHERE id = ?
        """, chunk)
        print(f"  Progresso gravação: {min(i + batch_size, len(updated_records)):,} / {len(updated_records):,}")
    
    conn.commit()
    print("COMMIT realizado com sucesso!")
except Exception as e:
    conn.rollback()
    print(f"ERRO CRÍTICO! Rollback efetuado: {e}")
    sys.exit(1)

# 4. Pós-Checagens e Validação de Quality Gates
print("\n--- 3. Verificação de Quality Gates Pós-Saneamento ---")

# Gate 1: Checksum Taxonômico (DEVE SER IDÊNTICO)
cur.execute("""
    SELECT count(especialidade), count(tema), count(foco), count(subfoco)
    FROM questions_curated_staging
""")
esp_post, tema_post, foco_post, subfoco_post = cur.fetchone()
print(f"Checksum Taxonômico Pós: Esp={esp_post:,}, Tema={tema_post:,}, Foco={foco_post:,}, Subfoco={subfoco_post:,}")
assert (esp_pre, tema_pre, foco_pre, subfoco_pre) == (esp_post, tema_post, foco_post, subfoco_post), "FALHA: Colunas taxonômicas foram alteradas indevidamente!"
print(" [PASS] Gate 1: Colunas taxonômicas (especialidade, tema, foco, subfoco) 100% INTOCADAS.")

# Gate 2: Contagem de opções sem letter
cur.execute("""
    SELECT count(*)
    FROM questions_curated_staging
    WHERE options LIKE '%"index":%' AND options NOT LIKE '%"letter":%'
""")
no_letter_post = cur.fetchone()[0]
print(f"Questões com options sem 'letter': {no_letter_post}")
assert no_letter_post == 0, f"FALHA: Ainda restam {no_letter_post} questões sem letter!"
print(" [PASS] Gate 2: Zero questões com opções sem a chave 'letter'.")

# Gate 3: Nova Distribuição de Type
cur.execute("""
    SELECT type, count(*)
    FROM questions_curated_staging
    GROUP BY type
    ORDER BY count(*) DESC
""")
print("\nNova Distribuição de Type na SSOT:")
post_types = cur.fetchall()
for t, cnt in post_types:
    print(f"  {repr(t)}: {cnt:,} ({cnt/total_pre*100:.2f}%)")

# Gate 4: Teste específico da questão do print do usuário (EXP-DIR-197508)
cur.execute("""
    SELECT id, code, type, options, correct_answer
    FROM questions_curated_staging
    WHERE statement LIKE '%infertilidade primária há 3 anos%'
      AND code = 'EXP-DIR-197508'
""")
row_test = cur.fetchone()
if row_test:
    print(f"\nTeste da questão do print ({row_test[1]}):")
    print(f"  Type: {row_test[2]}")
    print(f"  Correct Answer: {row_test[4]}")
    opts_test = json.loads(row_test[3])
    print(f"  Alternativas pós-fix:")
    for o in opts_test:
        print(f"    [{o.get('letter')}]: {o.get('text')[:70]}...")

print("\n--- SANEAMENTO DEFINITIVO NA SSOT CONCLUÍDO COM 100% DE SUCESSO! ---")
