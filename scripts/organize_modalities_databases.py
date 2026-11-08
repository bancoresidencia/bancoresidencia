import sqlite3
import os
import json
import time

SOURCE_DB = 'data/staging_expansion_unified.db'
OUTPUT_DIR = 'data/bancos_organizados_staging'
os.makedirs(OUTPUT_DIR, exist_ok=True)

MODALITIES = [
    {
        'key': 'residencia_acesso_direto',
        'table_source': 'staging_residencia_acesso_direto',
        'file_name': 'residencia_acesso_direto.db',
        'display_name': 'Residência Médica (Acesso Direto)',
        'modalidade_canonical': 'Residência Médica'
    },
    {
        'key': 'r_plus',
        'table_source': 'staging_r_plus',
        'file_name': 'r_plus.db',
        'display_name': 'Residência Médica (R+ / Especialidades com Pré-Requisito)',
        'modalidade_canonical': 'R+ Cirurgia / Clínica / Pediatria / GO'
    },
    {
        'key': 'revalida',
        'table_source': 'staging_revalida',
        'file_name': 'revalida.db',
        'display_name': 'Revalida (INEP / UFMT / USP)',
        'modalidade_canonical': 'Revalida'
    },
    {
        'key': 'titulo_especialista',
        'table_source': 'staging_titulo_especialista',
        'file_name': 'titulo_especialista.db',
        'display_name': 'Título de Especialista (TEGO / TECM / Sociedades AMB)',
        'modalidade_canonical': 'Título de Especialista'
    }
]

print("=== INICIANDO ORGANIZAÇÃO FÍSICA DOS 4 BANCOS MODULARES ===")
start_time = time.time()

source_conn = sqlite3.connect(SOURCE_DB)
source_conn.row_factory = sqlite3.Row
source_cur = source_conn.cursor()

manifest = {
    'created_at': time.strftime('%Y-%m-%d %H:%M:%S'),
    'source_master_db': SOURCE_DB,
    'total_global_questions': 0,
    'databases': {}
}

for mod in MODALITIES:
    target_path = os.path.join(OUTPUT_DIR, mod['file_name'])
    print(f"\n[+] Processando: {mod['display_name']} -> {target_path}")
    
    # Check if table in source
    source_cur.execute(f"SELECT COUNT(*) FROM {mod['table_source']}")
    count = source_cur.fetchone()[0]
    
    already_done = False
    if os.path.exists(target_path):
        try:
            check_c = sqlite3.connect(target_path)
            check_cur = check_c.cursor()
            check_cur.execute("SELECT COUNT(*) FROM questoes;")
            existing_count = check_cur.fetchone()[0]
            check_c.close()
            if existing_count == count:
                print(f"    Arquivo já existe com {existing_count:,} questões! Pulando recriação...")
                already_done = True
        except Exception:
            pass

    if not already_done:
        if os.path.exists(target_path):
            os.remove(target_path)
            
        target_conn = sqlite3.connect(target_path)
        target_cur = target_conn.cursor()
        
        target_cur.execute("PRAGMA journal_mode = WAL;")
        target_cur.execute("PRAGMA synchronous = NORMAL;")
        
        target_cur.execute("""
            CREATE TABLE questoes (
                id_staging INTEGER PRIMARY KEY,
                anchor_source TEXT,
                anchor_original_id TEXT,
                cluster_id INTEGER,
                cluster_size INTEGER,
                enunciado TEXT,
                opcoes_json TEXT,
                gabarito TEXT,
                is_anulada INTEGER,
                ano INTEGER,
                instituicao TEXT,
                banca TEXT,
                uf TEXT,
                modalidade TEXT,
                especialidade TEXT,
                tema TEXT,
                foco TEXT,
                subfoco TEXT,
                dificuldade TEXT,
                dificuldade_indice REAL,
                comentarios TEXT,
                sources_merged TEXT,
                filters_enriched_log TEXT,
                created_at TIMESTAMP
            );
        """)
        
        source_cur.execute(f"SELECT * FROM {mod['table_source']}")
        rows = source_cur.fetchall()
        print(f"    Copiando {count:,} questões...")
        
        insert_sql = "INSERT INTO questoes VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
        batch_size = 5000
        for i in range(0, count, batch_size):
            batch = [tuple(r) for r in rows[i:i+batch_size]]
            target_cur.executemany(insert_sql, batch)
            target_conn.commit()
            
        print("    Criando índices de alta performance...")
        target_cur.execute("CREATE INDEX idx_ano ON questoes(ano);")
        target_cur.execute("CREATE INDEX idx_instituicao ON questoes(instituicao);")
        target_cur.execute("CREATE INDEX idx_banca ON questoes(banca);")
        target_cur.execute("CREATE INDEX idx_especialidade ON questoes(especialidade);")
        target_cur.execute("CREATE INDEX idx_tema ON questoes(tema);")
        target_cur.execute("CREATE INDEX idx_foco ON questoes(foco);")
        target_cur.execute("CREATE INDEX idx_gabarito ON questoes(gabarito);")
        target_cur.execute("CREATE INDEX idx_is_anulada ON questoes(is_anulada);")
        target_cur.execute("CREATE INDEX idx_anchor_source ON questoes(anchor_source);")
        
        target_conn.commit()
        target_cur.execute("PRAGMA optimize;")
        target_conn.close()
        
        # Checkpoint into clean single file
        cleanup_conn = sqlite3.connect(target_path)
        cleanup_conn.execute("PRAGMA journal_mode = DELETE;")
        cleanup_conn.execute("VACUUM;")
        cleanup_conn.close()

    file_size_mb = os.path.getsize(target_path) / (1024 * 1024)
    print(f"    Tamanho do arquivo: {file_size_mb:.2f} MB")
    
    # Gather stats for manifest
    stats_conn = sqlite3.connect(target_path)
    stats_conn.row_factory = sqlite3.Row
    stats_cur = stats_conn.cursor()
    
    stats_cur.execute("SELECT MIN(ano), MAX(ano) FROM questoes WHERE ano IS NOT NULL AND ano > 1900;")
    ano_min, ano_max = stats_cur.fetchone()
    
    stats_cur.execute("SELECT COUNT(DISTINCT instituicao) FROM questoes WHERE instituicao IS NOT NULL AND instituicao != '';")
    qtd_inst = stats_cur.fetchone()[0]
    
    stats_cur.execute("SELECT instituicao, COUNT(*) FROM questoes GROUP BY instituicao ORDER BY COUNT(*) DESC LIMIT 5;")
    top_instituicoes = [{'instituicao': r[0], 'questoes': r[1]} for r in stats_cur.fetchall()]
    
    stats_cur.execute("SELECT especialidade, COUNT(*) FROM questoes WHERE especialidade IS NOT NULL GROUP BY especialidade ORDER BY COUNT(*) DESC LIMIT 5;")
    top_especialidades = [{'especialidade': r[0], 'questoes': r[1]} for r in stats_cur.fetchall()]
    
    stats_cur.execute("SELECT COUNT(*) FROM questoes WHERE instituicao IS NOT NULL AND instituicao != '';")
    with_inst = stats_cur.fetchone()[0]
    
    stats_cur.execute("SELECT COUNT(*) FROM questoes WHERE ano IS NOT NULL AND ano > 1900;")
    with_ano = stats_cur.fetchone()[0]
    
    stats_cur.execute("SELECT COUNT(*) FROM questoes WHERE gabarito IN ('A', 'B', 'C', 'D', 'E');")
    with_gab = stats_cur.fetchone()[0]
    
    stats_cur.execute("SELECT * FROM questoes ORDER BY RANDOM() LIMIT 1;")
    sample_row = dict(stats_cur.fetchone())
    
    sample_options = []
    try:
        sample_options = json.loads(sample_row['opcoes_json']) if sample_row['opcoes_json'] else []
    except Exception:
        pass
        
    sample_question_mapped = {
        'id': f"exp_{sample_row['id_staging']}",
        'code': f"EXP-{mod['key'].upper()[:4]}-{sample_row['id_staging']}",
        'institution': sample_row['instituicao'],
        'banca': sample_row['banca'] or sample_row['instituicao'],
        'year': sample_row['ano'],
        'modalidade': mod['modalidade_canonical'],
        'especialidade': sample_row['especialidade'] or 'Não classificada',
        'tema': sample_row['tema'] or 'Geral',
        'foco': sample_row['foco'] or 'Geral',
        'subfoco': sample_row['subfoco'] or 'Geral',
        'difficulty': sample_row['dificuldade'] or 'Médio',
        'type': 'Múltipla escolha',
        'isAnulada': bool(sample_row['is_anulada']),
        'statement': sample_row['enunciado'][:200] + '...',
        'options': sample_options[:2],
        'correctAnswer': sample_row['gabarito'],
        'commentary': sample_row['comentarios'] or ''
    }
    
    stats_conn.close()
    
    manifest['total_global_questions'] += count
    manifest['databases'][mod['key']] = {
        'display_name': mod['display_name'],
        'modalidade_canonical': mod['modalidade_canonical'],
        'file_name': mod['file_name'],
        'file_path': target_path.replace('\\', '/'),
        'file_size_mb': round(file_size_mb, 2),
        'total_questions': count,
        'ano_min': ano_min,
        'ano_max': ano_max,
        'qtd_instituicoes': qtd_inst,
        'top_instituicoes': top_instituicoes,
        'top_especialidades': top_especialidades,
        'taxa_instituicao_preenchida': round(with_inst / count * 100, 2),
        'taxa_ano_valido': round(with_ano / count * 100, 2),
        'taxa_gabarito_valido': round(with_gab / count * 100, 2),
        'sample_schema_mapped': sample_question_mapped
    }

source_conn.close()

# Save manifest
manifest_path = os.path.join(OUTPUT_DIR, 'manifesto_geral_bancos.json')
with open(manifest_path, 'w', encoding='utf-8') as fp:
    json.dump(manifest, fp, ensure_ascii=False, indent=2)

print(f"\n[OK] Manifesto gravado com sucesso em: {manifest_path}")
print(f"Total global de questões organizadas: {manifest['total_global_questions']:,}")
print(f"Tempo total de execução: {time.time() - start_time:.2f} segundos.")
