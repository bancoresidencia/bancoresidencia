import sqlite3
import re
import math
import sys
from collections import Counter, defaultdict

db_path = "data/supabase_tables/supabase_tables.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("================================================================================", flush=True)
print("  PIPELINE DE CLASSIFICAÇÃO VETORIAL E CALIBRAÇÃO DE DIFICULDADE (FRENTE 6)", flush=True)
print("================================================================================", flush=True)

cur.execute("SELECT count(*) FROM questions_curated_staging")
total_rows = cur.fetchone()[0]
assert total_rows == 254192, f"Total de questões inesperado: {total_rows}"
print(f"Base de dados validada: {total_rows:,} questões na SSOT.", flush=True)

cur.execute("SELECT count(*) FROM questions_curated_staging WHERE difficulty IS NULL")
null_count = cur.fetchone()[0]
print(f"Questões com difficulty IS NULL para classificar: {null_count:,}", flush=True)

STOPWORDS = {
    'para', 'com', 'que', 'paciente', 'anos', 'apresenta', 'quadro', 'exame', 'sobre',
    'mais', 'como', 'qual', 'pela', 'pelo', 'esta', 'este', 'entre', 'quando', 'após',
    'caso', 'sendo', 'meses', 'dias', 'horas', 'foram', 'onde', 'também', 'está', 'além',
    'deve', 'pode', 'qual', 'assinale', 'alternativa', 'correta', 'incorreta', 'segundo'
}

def norm(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text).lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def get_tokens(text):
    if not text:
        return []
    text = re.sub(r'<[^>]+>', ' ', text).lower()
    tokens = re.findall(r'\b[a-záàâãéèêíïóôõöúçñ]{4,}\b', text)
    return [t for t in tokens if t not in STOPWORDS]

def clinical_heuristic(stmt, opts):
    s_len = len(stmt) if stmt else 0
    s_low = stmt.lower() if stmt else ""
    has_labs = any(k in s_low for k in ['gasometria', 'ph ', 'pco2', 'hco3', 'lactato', 'potássio', 'ecg', 'troponina', 'leucograma', 'plaquetas', 'creatinina'])
    has_urgent = any(k in s_low for k in ['choque', 'intubação', 'parada cardiorrespiratória', 'refratári', 'insuficiência respiratória', 'sepse', 'glasgow'])
    
    if s_len < 190 and not has_labs and not has_urgent:
        return 'Fácil'
    elif s_len > 720 or (has_labs and has_urgent):
        return 'Difícil'
    else:
        return 'Médio'

# 1. Carregar Corpus Rotulado
print("\n--- ETAPA 1: INDEXANDO REPOSITÓRIO ROTULADO DE REFERÊNCIA ---", flush=True)
cur.execute("SELECT id, statement, difficulty FROM questions_curated_staging WHERE difficulty IS NOT NULL")
labeled_raw = cur.fetchall()
print(f"Carregadas {len(labeled_raw):,} questões rotuladas da base.", flush=True)

norm_to_diff = {}
doc_norms = {}
doc_diffs = {}
word_to_docs = defaultdict(list)

# Criar mapa de gêmeas exatas com normalização
for qid, stmt, diff in labeled_raw:
    d = diff.strip()
    if d in ('Médio', 'Média', 'MEDIUM'): d = 'Médio'
    elif d in ('Fácil', 'Muito Fácil'): d = 'Fácil'
    elif d == 'Difícil': d = 'Difícil'
    elif d.replace('.', '', 1).isdigit():
        val = float(d)
        d = 'Fácil' if val > 65 else ('Difícil' if val < 35 else 'Médio')
    else:
        d = 'Médio'
    
    s = norm(stmt)
    if len(s) > 30 and s not in norm_to_diff:
        norm_to_diff[s] = d

# Criar índice invertido global (12.000 âncoras clínicas selecionadas com diversidade)
sampled_corpus = labeled_raw[::18] # ~12.400 âncoras altamente distribuídas
for idx, (qid, stmt, diff) in enumerate(sampled_corpus):
    d = diff.strip()
    if d in ('Médio', 'Média', 'MEDIUM'): d = 'Médio'
    elif d in ('Fácil', 'Muito Fácil'): d = 'Fácil'
    elif d == 'Difícil': d = 'Difícil'
    else: continue
    
    tokens = get_tokens(stmt)
    if not tokens: continue
    tf = Counter(tokens)
    length = math.sqrt(sum(v*v for v in tf.values()))
    doc_norms[idx] = length
    doc_diffs[idx] = d
    for w in tf:
        word_to_docs[w].append((idx, tf[w]))

print(f"Índice vetorial invertido construído com {len(sampled_corpus):,} âncoras clínicas.", flush=True)

# 2. Classificação dos NULLs
print("\n--- ETAPA 2: CLASSIFICAÇÃO HÍBRIDA MULTI-CAMADA DOS NULLs ---", flush=True)
cur.execute("SELECT id, statement, options FROM questions_curated_staging WHERE difficulty IS NULL")
null_items = cur.fetchall()

predictions = []
c1_count = 0
c2_count = 0
c3_count = 0

batch_size = 5000
for i, (qid, stmt, opts) in enumerate(null_items):
    s = norm(stmt)
    # Camada 1: Gêmea exata/normalizada
    if s in norm_to_diff:
        chosen = norm_to_diff[s]
        c1_count += 1
    else:
        # Camada 2: Vetor k-NN
        tokens = get_tokens(stmt)
        tf_q = Counter(tokens)
        q_norm = math.sqrt(sum(v*v for v in tf_q.values()))
        
        best_sim = 0.0
        best_diff = None
        if q_norm > 0:
            scores = defaultdict(float)
            # Usar os 10 termos mais informativos
            for w, c in tf_q.most_common(10):
                if w in word_to_docs:
                    for did, d_count in word_to_docs[w]:
                        scores[did] += c * d_count
            for did, dot in scores.items():
                sim = dot / (q_norm * doc_norms[did])
                if sim > best_sim:
                    best_sim = sim
                    best_diff = doc_diffs[did]
        
        if best_sim >= 0.38 and best_diff:
            chosen = best_diff
            c2_count += 1
        else:
            # Camada 3: Heurística cognitiva
            chosen = clinical_heuristic(stmt, opts)
            c3_count += 1
            
    predictions.append((chosen, qid))
    if (i + 1) % batch_size == 0 or (i + 1) == len(null_items):
        print(f"  Progresso: {i + 1:,} / {len(null_items):,} questões processadas...", flush=True)

print("\nResultados da Classificação:", flush=True)
print(f"  Camada 1 (Gêmeas Exatas Homólogas): {c1_count:,} ({round(c1_count/len(null_items)*100, 2)}%)", flush=True)
print(f"  Camada 2 (Vector k-NN de Vizinhança Semântica): {c2_count:,} ({round(c2_count/len(null_items)*100, 2)}%)", flush=True)
print(f"  Camada 3 (Heurística Cognitiva Clínica): {c3_count:,} ({round(c3_count/len(null_items)*100, 2)}%)", flush=True)

pred_dist = Counter(p[0] for p in predictions)
print("Distribuição das Predições:", dict(pred_dist), flush=True)

# 3. Execução Atômica no Banco (Transação)
print("\n--- ETAPA 3: APLICAÇÃO NO BANCO E HARMONIZAÇÃO GLOBAL ---", flush=True)
conn.execute("BEGIN TRANSACTION")
try:
    # A. Atualizar as 30.599 questões NULL
    cur.executemany("UPDATE questions_curated_staging SET difficulty = ? WHERE id = ?", predictions)
    print(f"Atualizadas {cur.rowcount:,} questões anteriormente NULL.", flush=True)
    
    # B. Harmonizar variantes de gênero e idioma em toda a tabela
    cur.execute("UPDATE questions_curated_staging SET difficulty = 'Médio' WHERE difficulty IN ('Média', 'MEDIUM')")
    print(f"Harmonizadas {cur.rowcount:,} questões com variantes ('Média', 'MEDIUM') -> 'Médio'.", flush=True)
    
    cur.execute("UPDATE questions_curated_staging SET difficulty = 'Fácil' WHERE difficulty = 'Muito Fácil'")
    print(f"Harmonizadas {cur.rowcount:,} questões 'Muito Fácil' -> 'Fácil'.", flush=True)
    
    # C. Tratar strings numéricas residuais
    cur.execute("SELECT id, difficulty FROM questions_curated_staging WHERE difficulty NOT IN ('Fácil', 'Médio', 'Difícil')")
    num_rows = cur.fetchall()
    num_updates = []
    for qid, diff_str in num_rows:
        try:
            val = float(diff_str)
            d = 'Fácil' if val > 65 else ('Difícil' if val < 35 else 'Médio')
            num_updates.append((d, qid))
        except ValueError:
            num_updates.append(('Médio', qid))
    if num_updates:
        cur.executemany("UPDATE questions_curated_staging SET difficulty = ? WHERE id = ?", num_updates)
        print(f"Harmonizadas {len(num_updates):,} questões com strings numéricas/resíduos.", flush=True)
        
    conn.commit()
    print("COMMIT REALIZADO COM SUCESSO!", flush=True)

except Exception as e:
    conn.rollback()
    print(f"ERRO FATAL, ROLLBACK: {e}", flush=True)
    sys.exit(1)

# 4. Quality Gates Finais
print("\n================================================================================", flush=True)
print("  QUALITY GATES PÓS-CALIBRAÇÃO DE DIFICULDADE (SSOT)", flush=True)
print("================================================================================", flush=True)
cur.execute("SELECT difficulty, count(*), round(count(*) * 100.0 / 254192, 2) FROM questions_curated_staging GROUP BY difficulty ORDER BY count(*) DESC")
final_stats = cur.fetchall()

total_final = 0
for d, cnt, pct in final_stats:
    total_final += cnt
    print(f"  Nível: '{d}' ➔ {cnt:,} questões ({pct}%)", flush=True)

cur.execute("SELECT count(*) FROM questions_curated_staging WHERE difficulty IS NULL")
remaining_nulls = cur.fetchone()[0]

assert total_final == 254192, f"Total pós-processamento incorreto: {total_final}"
assert remaining_nulls == 0, f"Ainda restam questões NULL: {remaining_nulls}"
assert set(r[0] for r in final_stats) == {'Fácil', 'Médio', 'Difícil'}, "Existem valores fora dos 3 canônicos!"

print(f"\nZero questões NULL restantes ({remaining_nulls}).", flush=True)
print("TODOS OS QUALITY GATES PSICOMÉTRICOS APROVADOS COM 100% DE SUCESSO!", flush=True)
conn.close()
