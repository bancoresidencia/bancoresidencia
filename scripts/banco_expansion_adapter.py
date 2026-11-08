"""
Banco Expansão Staging Adapter
Módulo de interface e utilitários para consulta, filtragem e exportação 
dos 4 bancos isolados de expansão do Banco Residência.

Bancos suportados:
  - 'residencia_acesso_direto' (data/bancos_organizados_staging/residencia_acesso_direto.db)
  - 'r_plus'                   (data/bancos_organizados_staging/r_plus.db)
  - 'revalida'                 (data/bancos_organizados_staging/revalida.db)
  - 'titulo_especialista'      (data/bancos_organizados_staging/titulo_especialista.db)
"""

import sqlite3
import json
import os
from typing import Dict, List, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGING_DIR = os.path.join(BASE_DIR, 'data', 'bancos_organizados_staging')

DB_MAP = {
    'residencia_acesso_direto': os.path.join(STAGING_DIR, 'residencia_acesso_direto.db'),
    'r_plus': os.path.join(STAGING_DIR, 'r_plus.db'),
    'revalida': os.path.join(STAGING_DIR, 'revalida.db'),
    'titulo_especialista': os.path.join(STAGING_DIR, 'titulo_especialista.db')
}

def get_connection(modalidade_key: str) -> sqlite3.Connection:
    if modalidade_key not in DB_MAP:
        raise ValueError(f"Modalidade desconhecida: {modalidade_key}. Válidas: {list(DB_MAP.keys())}")
    db_path = DB_MAP[modalidade_key]
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Arquivo de banco não encontrado em: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_manifest() -> Dict[str, Any]:
    manifest_path = os.path.join(STAGING_DIR, 'manifesto_geral_bancos.json')
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def row_to_canonical_question(row: sqlite3.Row, modalidade_canonical: str) -> Dict[str, Any]:
    """Converte uma linha bruta de staging no padrão Question do Banco Residência (src/types/index.ts)."""
    options = []
    if row['opcoes_json']:
        try:
            options = json.loads(row['opcoes_json'])
        except Exception:
            options = []

    return {
        'id': f"exp_{row['id_staging']}",
        'code': f"EXP-{row['id_staging']}",
        'institution': row['instituicao'] or 'Não informada',
        'banca': row['banca'] or row['instituicao'] or 'Não informada',
        'year': row['ano'] or 0,
        'modalidade': modalidade_canonical,
        'especialidade': row['especialidade'] or 'Não classificada',
        'tema': row['tema'] or 'Geral',
        'foco': row['foco'] or 'Geral',
        'subfoco': row['subfoco'] or 'Geral',
        'difficulty': row['dificuldade'] or 'Médio',
        'type': 'Múltipla escolha',
        'isAnulada': bool(row['is_anulada']),
        'statement': row['enunciado'] or '',
        'options': options,
        'correctAnswer': row['gabarito'] or '',
        'commentary': row['comentarios'] or '',
        'sources_merged': row['sources_merged'] or '',
        'anchor_source': row['anchor_source'] or ''
    }

def query_questions(
    modalidade_key: str,
    ano: Optional[int] = None,
    instituicao: Optional[str] = None,
    especialidade: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Dict[str, Any]]:
    conn = get_connection(modalidade_key)
    cur = conn.cursor()
    
    query = "SELECT * FROM questoes WHERE 1=1"
    params = []
    
    if ano:
        query += " AND ano = ?"
        params.append(ano)
    if instituicao:
        query += " AND instituicao LIKE ?"
        params.append(f"%{instituicao}%")
    if especialidade:
        query += " AND especialidade LIKE ?"
        params.append(f"%{especialidade}%")
        
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    rows = cur.fetchall()
    
    manifest = get_manifest()
    modalidade_canonical = manifest.get('databases', {}).get(modalidade_key, {}).get('modalidade_canonical', modalidade_key)
    
    results = [row_to_canonical_question(r, modalidade_canonical) for r in rows]
    conn.close()
    return results

if __name__ == '__main__':
    print("Banco Expansão Staging Adapter carregado com sucesso.")
