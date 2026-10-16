import sqlite3
import os
import json
from .config import DB_PATH

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_db():
    conn = get_connection()
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
            opcoes_json TEXT,
            gabarito_oficial TEXT,
            texto_gabarito TEXT,
            is_anulada INTEGER DEFAULT 0,
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
            id INTEGER PRIMARY KEY, -- id em provaderesidencia
            prova_id INTEGER NOT NULL,
            instituicao_banco TEXT,
            instituicao_raw TEXT,
            uf TEXT,
            ano INTEGER,
            modalidade TEXT,
            numero INTEGER,
            enunciado TEXT,
            imagem_url TEXT,
            opcoes_json TEXT,
            gabarito_oficial TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prova_id) REFERENCES provas(id)
        );

        CREATE INDEX IF NOT EXISTS idx_provas_status ON provas(status);
        CREATE INDEX IF NOT EXISTS idx_questoes_prova ON questoes(prova_id);
        CREATE INDEX IF NOT EXISTS idx_matches_banco_id ON matches_banco(questao_banco_id);
        """)
    conn.close()

def save_provas(provas_list):
    conn = get_connection()
    with conn:
        for p in provas_list:
            conn.execute("""
            INSERT INTO provas (id, titulo, badge, instituicao_raw, uf, ano, modalidade, instituicao_banco, status, updated_at)
            VALUES (:id, :titulo, :badge, :instituicao_raw, :uf, :ano, :modalidade, :instituicao_banco, 'pendente', CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                titulo=excluded.titulo,
                badge=excluded.badge,
                instituicao_raw=excluded.instituicao_raw,
                uf=excluded.uf,
                ano=excluded.ano,
                modalidade=excluded.modalidade,
                instituicao_banco=excluded.instituicao_banco,
                updated_at=CURRENT_TIMESTAMP
            WHERE status != 'concluida';
            """, p)
    conn.close()

def get_provas_pendentes():
    conn = get_connection()
    rows = conn.execute("""
        SELECT * FROM provas 
        WHERE status IN ('pendente', 'em_progresso', 'erro')
        ORDER BY 
            CASE WHEN instituicao_banco IS NOT NULL THEN 0 ELSE 1 END,
            ano DESC,
            id ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_prova_status(prova_id, status, total_questoes=None, erro_msg=None):
    conn = get_connection()
    with conn:
        if total_questoes is not None:
            conn.execute("""
                UPDATE provas 
                SET status = ?, total_questoes = ?, erro_msg = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, total_questoes, erro_msg, prova_id))
        else:
            conn.execute("""
                UPDATE provas 
                SET status = ?, erro_msg = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, erro_msg, prova_id))
    conn.close()

def save_questao(q_data):
    conn = get_connection()
    with conn:
        conn.execute("""
        INSERT INTO questoes (id, prova_id, numero, enunciado, imagem_url, opcoes_json, gabarito_oficial, texto_gabarito, is_anulada)
        VALUES (:id, :prova_id, :numero, :enunciado, :imagem_url, :opcoes_json, :gabarito_oficial, :texto_gabarito, :is_anulada)
        ON CONFLICT(prova_id, numero) DO UPDATE SET
            id=excluded.id,
            enunciado=excluded.enunciado,
            imagem_url=excluded.imagem_url,
            opcoes_json=excluded.opcoes_json,
            gabarito_oficial=excluded.gabarito_oficial,
            texto_gabarito=excluded.texto_gabarito,
            is_anulada=excluded.is_anulada;
        """, q_data)
    conn.close()

def record_match(match_data):
    conn = get_connection()
    with conn:
        conn.execute("""
        INSERT INTO matches_banco (questao_banco_id, especialidade, questao_provaderesidencia_id, prova_id, instituicao, ano, numero_questao, gabarito, match_hash)
        VALUES (:questao_banco_id, :especialidade, :questao_provaderesidencia_id, :prova_id, :instituicao, :ano, :numero_questao, :gabarito, :match_hash)
        ON CONFLICT(questao_banco_id) DO UPDATE SET
            gabarito=excluded.gabarito,
            questao_provaderesidencia_id=excluded.questao_provaderesidencia_id,
            prova_id=excluded.prova_id;
        """, match_data)
    conn.close()

def save_nova_questao(q_data):
    conn = get_connection()
    with conn:
        conn.execute("""
        INSERT INTO novas_questoes_categorizadas (id, prova_id, instituicao_banco, instituicao_raw, uf, ano, modalidade, numero, enunciado, imagem_url, opcoes_json, gabarito_oficial)
        VALUES (:id, :prova_id, :instituicao_banco, :instituicao_raw, :uf, :ano, :modalidade, :numero, :enunciado, :imagem_url, :opcoes_json, :gabarito_oficial)
        ON CONFLICT(id) DO UPDATE SET
            gabarito_oficial=excluded.gabarito_oficial,
            opcoes_json=excluded.opcoes_json;
        """, q_data)
    conn.close()

def get_stats():
    conn = get_connection()
    total_provas = conn.execute("SELECT count(*) FROM provas").fetchone()[0]
    provas_concluidas = conn.execute("SELECT count(*) FROM provas WHERE status = 'concluida'").fetchone()[0]
    provas_em_progresso = conn.execute("SELECT count(*) FROM provas WHERE status = 'em_progresso'").fetchone()[0]
    provas_erro = conn.execute("SELECT count(*) FROM provas WHERE status = 'erro'").fetchone()[0]
    provas_pendentes = conn.execute("SELECT count(*) FROM provas WHERE status = 'pendente'").fetchone()[0]
    
    total_questoes = conn.execute("SELECT count(*) FROM questoes").fetchone()[0]
    questoes_com_gabarito = conn.execute("SELECT count(*) FROM questoes WHERE gabarito_oficial IS NOT NULL AND gabarito_oficial != ''").fetchone()[0]
    questoes_anuladas = conn.execute("SELECT count(*) FROM questoes WHERE is_anulada = 1").fetchone()[0]
    
    total_matches = conn.execute("SELECT count(*) FROM matches_banco").fetchone()[0]
    matches_por_esp = dict(conn.execute("SELECT especialidade, count(*) FROM matches_banco GROUP BY especialidade").fetchall())
    
    novas_categorizadas = conn.execute("SELECT count(*) FROM novas_questoes_categorizadas").fetchone()[0]
    
    conn.close()
    return {
        'total_provas': total_provas,
        'provas_concluidas': provas_concluidas,
        'provas_em_progresso': provas_em_progresso,
        'provas_erro': provas_erro,
        'provas_pendentes': provas_pendentes,
        'total_questoes': total_questoes,
        'questoes_com_gabarito': questoes_com_gabarito,
        'questoes_anuladas': questoes_anuladas,
        'total_matches_banco': total_matches,
        'matches_por_especialidade': matches_por_esp,
        'novas_questoes_categorizadas': novas_categorizadas
    }
