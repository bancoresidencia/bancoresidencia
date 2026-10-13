import os
import sqlite3
import hashlib
from datetime import datetime

DEFAULT_DB_PATH = os.path.join(os.getcwd(), 'data', 'gabaritos_nacional.db')

def get_connection(db_path=DEFAULT_DB_PATH):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path=DEFAULT_DB_PATH):
    conn = get_connection(db_path)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS fontes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_instituicao TEXT NOT NULL,
        sigla TEXT,
        banca TEXT NOT NULL,
        uf TEXT NOT NULL,
        abrangencia TEXT DEFAULT 'Estadual',
        url_oficial TEXT,
        status TEXT DEFAULT 'ativa',
        total_documentos INTEGER DEFAULT 0,
        ultima_verificacao TIMESTAMP,
        observacoes TEXT
    );

    CREATE TABLE IF NOT EXISTS documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fonte_id INTEGER,
        nome_arquivo TEXT NOT NULL,
        url_origem TEXT,
        sha256 TEXT UNIQUE NOT NULL,
        ano INTEGER,
        processo_seletivo TEXT,
        modalidade TEXT,
        tipo_documento TEXT, -- 'gabarito_preliminar', 'gabarito_definitivo', 'retificacao', 'caderno_prova'
        caminho_local TEXT NOT NULL,
        tamanho_bytes INTEGER,
        data_publicacao TEXT,
        data_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status_processamento TEXT DEFAULT 'pendente', -- 'pendente', 'processado', 'falha'
        mensagem_erro TEXT,
        FOREIGN KEY (fonte_id) REFERENCES fontes(id)
    );

    CREATE TABLE IF NOT EXISTS gabaritos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        documento_id INTEGER NOT NULL,
        versao_caderno TEXT DEFAULT 'Unico', -- 'Tipo 1', 'Tipo 2', 'Prova A1', etc.
        tipo_gabarito TEXT DEFAULT 'definitivo', -- 'preliminar', 'definitivo', 'retificado'
        total_questoes INTEGER NOT NULL,
        confianca_media REAL DEFAULT 1.0,
        valido BOOLEAN DEFAULT 1,
        data_extracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (documento_id) REFERENCES documentos(id)
    );

    CREATE TABLE IF NOT EXISTS questoes_gabarito (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gabarito_id INTEGER NOT NULL,
        numero_questao INTEGER NOT NULL,
        alternativa TEXT NOT NULL, -- 'A', 'B', 'C', 'D', 'E', 'ANULADA', etc.
        status TEXT DEFAULT 'valida', -- 'valida', 'anulada', 'alterada', 'indeterminada'
        especialidade TEXT, -- 'Clínica Médica', 'Cirurgia Geral', etc., se informado no gabarito
        pagina_pdf INTEGER,
        trecho_origem TEXT,
        metodo_extracao TEXT, -- 'regex_text', 'table_plumber', 'pymupdf_column', 'ocr'
        confianca REAL DEFAULT 1.0,
        status_validacao TEXT DEFAULT 'validado', -- 'validado', 'pendente_revisao', 'divergente'
        FOREIGN KEY (gabarito_id) REFERENCES gabaritos(id),
        UNIQUE(gabarito_id, numero_questao)
    );

    CREATE TABLE IF NOT EXISTS divergencias_historico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        documento_preliminar_id INTEGER,
        documento_definitivo_id INTEGER,
        numero_questao INTEGER NOT NULL,
        alternativa_preliminar TEXT,
        alternativa_definitiva TEXT,
        tipo_divergencia TEXT, -- 'anulacao', 'alteracao_gabarito'
        data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logs_execucao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fase TEXT NOT NULL, -- 'descoberta', 'coleta', 'extracao', 'validacao'
        fonte_sigla TEXT,
        nivel TEXT DEFAULT 'INFO',
        mensagem TEXT NOT NULL,
        detalhes TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    return db_path

def compute_sha256(filepath):
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()
