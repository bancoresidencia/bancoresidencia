import sqlite3
from datetime import datetime
from .database import get_connection

class GabaritosRepository:
    def __init__(self, db_path=None):
        self.db_path = db_path

    def _conn(self):
        return get_connection(self.db_path) if self.db_path else get_connection()

    def upsert_fonte(self, nome_instituicao, sigla, banca, uf, abrangencia="Estadual", url_oficial="", observacoes=""):
        conn = self._conn()
        c = conn.cursor()
        c.execute("""
            SELECT id FROM fontes WHERE sigla = ? OR (nome_instituicao = ? AND banca = ?)
        """, (sigla, nome_instituicao, banca))
        row = c.fetchone()
        now = datetime.now().isoformat()
        if row:
            fonte_id = row['id']
            c.execute("""
                UPDATE fontes 
                SET url_oficial = ?, ultima_verificacao = ?, observacoes = ?
                WHERE id = ?
            """, (url_oficial, now, observacoes, fonte_id))
        else:
            c.execute("""
                INSERT INTO fontes (nome_instituicao, sigla, banca, uf, abrangencia, url_oficial, ultima_verificacao, observacoes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (nome_instituicao, sigla, banca, uf, abrangencia, url_oficial, now, observacoes))
            fonte_id = c.lastrowid
        conn.commit()
        conn.close()
        return fonte_id

    def upsert_documento(self, fonte_id, nome_arquivo, url_origem, sha256, ano, processo_seletivo, modalidade, tipo_documento, caminho_local, tamanho_bytes, data_publicacao=None):
        conn = self._conn()
        c = conn.cursor()
        c.execute("SELECT id FROM documentos WHERE sha256 = ?", (sha256,))
        row = c.fetchone()
        if row:
            doc_id = row['id']
            c.execute("""
                UPDATE documentos
                SET caminho_local = ?, status_processamento = 'pendente'
                WHERE id = ?
            """, (caminho_local, doc_id))
        else:
            c.execute("""
                INSERT INTO documentos (
                    fonte_id, nome_arquivo, url_origem, sha256, ano, processo_seletivo,
                    modalidade, tipo_documento, caminho_local, tamanho_bytes, data_publicacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                fonte_id, nome_arquivo, url_origem, sha256, ano, processo_seletivo,
                modalidade, tipo_documento, caminho_local, tamanho_bytes, data_publicacao
            ))
            doc_id = c.lastrowid
            # Incrementa contador na fonte
            c.execute("UPDATE fontes SET total_documentos = total_documentos + 1 WHERE id = ?", (fonte_id,))
        conn.commit()
        conn.close()
        return doc_id

    def registrar_gabarito_e_questoes(self, doc_id, versao_caderno, tipo_gabarito, questoes_list, confianca_media=1.0):
        """
        questoes_list: lista de dicionários com:
        numero_questao, alternativa, status, especialidade, pagina_pdf, trecho_origem, metodo_extracao, confianca
        """
        conn = self._conn()
        c = conn.cursor()
        
        # Verifica se já existe gabarito para este documento e versao de caderno
        c.execute("""
            SELECT id FROM gabaritos WHERE documento_id = ? AND versao_caderno = ?
        """, (doc_id, versao_caderno))
        row = c.fetchone()
        if row:
            gab_id = row['id']
            # limpa questoes antigas para atualizar
            c.execute("DELETE FROM questoes_gabarito WHERE gabarito_id = ?", (gab_id,))
            c.execute("""
                UPDATE gabaritos
                SET total_questoes = ?, confianca_media = ?, tipo_gabarito = ?, data_extracao = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (len(questoes_list), confianca_media, tipo_gabarito, gab_id))
        else:
            c.execute("""
                INSERT INTO gabaritos (documento_id, versao_caderno, tipo_gabarito, total_questoes, confianca_media)
                VALUES (?, ?, ?, ?, ?)
            """, (doc_id, versao_caderno, tipo_gabarito, len(questoes_list), confianca_media))
            gab_id = c.lastrowid

        for q in questoes_list:
            c.execute("""
                INSERT INTO questoes_gabarito (
                    gabarito_id, numero_questao, alternativa, status, especialidade,
                    pagina_pdf, trecho_origem, metodo_extracao, confianca, status_validacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                gab_id,
                q.get('numero_questao'),
                q.get('alternativa'),
                q.get('status', 'valida'),
                q.get('especialidade'),
                q.get('pagina_pdf', 1),
                q.get('trecho_origem', ''),
                q.get('metodo_extracao', 'text_regex'),
                q.get('confianca', 1.0),
                q.get('status_validacao', 'validado')
            ))

        c.execute("UPDATE documentos SET status_processamento = 'processado' WHERE id = ?", (doc_id,))
        conn.commit()
        conn.close()
        return gab_id

    def log_execucao(self, fase, mensagem, fonte_sigla="", nivel="INFO", detalhes=""):
        conn = self._conn()
        c = conn.cursor()
        c.execute("""
            INSERT INTO logs_execucao (fase, fonte_sigla, nivel, mensagem, detalhes)
            VALUES (?, ?, ?, ?, ?)
        """, (fase, fonte_sigla, nivel, mensagem, detalhes))
        conn.commit()
        conn.close()

    def get_documentos_pendentes(self):
        conn = self._conn()
        c = conn.cursor()
        c.execute("""
            SELECT d.*, f.sigla as fonte_sigla, f.nome_instituicao, f.banca
            FROM documentos d
            JOIN fontes f ON d.fonte_id = f.id
            WHERE d.status_processamento = 'pendente'
            ORDER BY d.id ASC
        """)
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return rows

    def get_estatisticas_cobertura(self):
        conn = self._conn()
        c = conn.cursor()
        
        c.execute("SELECT COUNT(*) as total FROM fontes")
        total_fontes = c.fetchone()['total']

        c.execute("SELECT COUNT(*) as total FROM documentos")
        total_docs = c.fetchone()['total']

        c.execute("SELECT COUNT(*) as total FROM gabaritos")
        total_gabs = c.fetchone()['total']

        c.execute("SELECT COUNT(*) as total FROM questoes_gabarito")
        total_questoes = c.fetchone()['total']

        c.execute("SELECT COUNT(*) as total FROM questoes_gabarito WHERE status = 'anulada'")
        total_anuladas = c.fetchone()['total']

        c.execute("""
            SELECT f.nome_instituicao, f.sigla, f.uf, f.banca,
                   COUNT(DISTINCT d.id) as docs_count,
                   COUNT(DISTINCT g.id) as gabs_count,
                   COUNT(q.id) as questoes_count
            FROM fontes f
            LEFT JOIN documentos d ON f.id = d.fonte_id
            LEFT JOIN gabaritos g ON d.id = g.documento_id
            LEFT JOIN questoes_gabarito q ON g.id = q.gabarito_id
            GROUP BY f.id
        """)
        fontes_detalhe = [dict(r) for r in c.fetchall()]

        conn.close()
        return {
            'total_fontes': total_fontes,
            'total_documentos': total_docs,
            'total_gabaritos': total_gabs,
            'total_questoes': total_questoes,
            'total_anuladas': total_anuladas,
            'fontes': fontes_detalhe
        }
