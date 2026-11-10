import sqlite3
import os
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
OLD_DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')
NEW_DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta_parte2.db')

def init_parte2_db():
    print(f"📦 Inicializando Novo Banco de Dados: {NEW_DB_PATH}")
    os.makedirs(DATA_DIR, exist_ok=True)
    
    conn = sqlite3.connect(NEW_DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS provas (
            id INTEGER PRIMARY KEY,
            titulo TEXT NOT NULL,
            badge TEXT NOT NULL,
            instituicao_raw TEXT,
            uf TEXT,
            ano INTEGER,
            modalidade TEXT,
            instituicao_banco TEXT,
            total_questoes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pendente', -- 'pendente', 'em_progresso', 'concluida', 'erro'
            erro_msg TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS questoes (
            id INTEGER PRIMARY KEY,
            prova_id INTEGER NOT NULL,
            numero INTEGER NOT NULL,
            enunciado TEXT,
            imagem_url TEXT,
            imagens_json TEXT, -- Lista completa de URLs de imagens detectadas
            opcoes_json TEXT,  -- Alternativas estruturadas (letra, texto, value, imagens)
            gabarito_oficial TEXT,
            texto_gabarito TEXT,
            is_anulada INTEGER DEFAULT 0,
            filtros_json TEXT, -- Todos os metadados/filtros encontrados na página (tags, badges, breadcrumbs)
            especialidade TEXT,
            tema TEXT,
            subtema TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prova_id) REFERENCES provas(id),
            UNIQUE(prova_id, numero)
        );

        CREATE TABLE IF NOT EXISTS matches_banco (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            questao_banco_id TEXT NOT NULL,
            especialidade TEXT NOT NULL,
            questao_provaderesidencia_id INTEGER NOT NULL,
            prova_id INTEGER NOT NULL,
            instituicao TEXT,
            ano INTEGER,
            numero_questao INTEGER,
            gabarito TEXT NOT NULL,
            match_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(questao_banco_id)
        );

        CREATE TABLE IF NOT EXISTS novas_questoes_categorizadas (
            id INTEGER PRIMARY KEY,
            prova_id INTEGER NOT NULL,
            instituicao_banco TEXT,
            instituicao_raw TEXT,
            uf TEXT,
            ano INTEGER,
            modalidade TEXT,
            numero INTEGER,
            enunciado TEXT,
            imagem_url TEXT,
            imagens_json TEXT,
            opcoes_json TEXT,
            gabarito_oficial TEXT,
            filtros_json TEXT,
            especialidade TEXT,
            tema TEXT,
            subtema TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prova_id) REFERENCES provas(id)
        );

        CREATE INDEX IF NOT EXISTS idx_provas_status ON provas(status);
        CREATE INDEX IF NOT EXISTS idx_questoes_prova ON questoes(prova_id);
        CREATE INDEX IF NOT EXISTS idx_matches_banco_id ON matches_banco(questao_banco_id);
        """)
    
    # Migrar provas restantes do banco antigo
    old_conn = sqlite3.connect(OLD_DB_PATH)
    old_conn.row_factory = sqlite3.Row
    
    # Seleciona pendentes, em_progresso e erros do banco antigo
    remaining = old_conn.execute("""
        SELECT id, titulo, badge, instituicao_raw, uf, ano, modalidade, instituicao_banco, total_questoes
        FROM provas
        WHERE status IN ('pendente', 'em_progresso', 'erro')
        ORDER BY ano DESC, id ASC
    """).fetchall()
    old_conn.close()
    
    print(f"🔄 Migrando {len(remaining)} provas pendentes/restantes do banco original...")
    
    with conn:
        for r in remaining:
            conn.execute("""
                INSERT INTO provas (id, titulo, badge, instituicao_raw, uf, ano, modalidade, instituicao_banco, total_questoes, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
                ON CONFLICT(id) DO UPDATE SET
                    titulo=excluded.titulo,
                    badge=excluded.badge,
                    instituicao_raw=excluded.instituicao_raw,
                    uf=excluded.uf,
                    ano=excluded.ano,
                    modalidade=excluded.modalidade,
                    instituicao_banco=excluded.instituicao_banco,
                    total_questoes=excluded.total_questoes
            """, (
                r['id'], r['titulo'], r['badge'], r['instituicao_raw'],
                r['uf'], r['ano'], r['modalidade'], r['instituicao_banco'],
                r['total_questoes']
            ))
            
    total_new = conn.execute("SELECT count(*) FROM provas").fetchone()[0]
    conn.close()
    print(f"✅ Novo banco inicializado com sucesso! Total de provas na fila da Parte 2: {total_new}")

if __name__ == '__main__':
    init_parte2_db()
