import os
import csv
import json
from ..db.database import get_connection

class GabaritosExporter:
    def __init__(self, db_path=None):
        self.db_path = db_path

    def _conn(self):
        return get_connection(self.db_path) if self.db_path else get_connection()

    def export_csv_questoes(self, output_path="data/export_gabaritos_questoes.csv"):
        """Exporta todas as questões cadastradas com informações da instituição e caderno para CSV"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        conn = self._conn()
        c = conn.cursor()
        c.execute("""
            SELECT 
                f.nome_instituicao, f.sigla as instituicao_sigla, f.banca, f.uf,
                d.ano, d.processo_seletivo, d.modalidade, d.tipo_documento,
                d.nome_arquivo, d.sha256 as arquivo_sha256, d.url_origem,
                g.versao_caderno, g.tipo_gabarito,
                q.numero_questao, q.alternativa, q.status, q.especialidade,
                q.pagina_pdf, q.metodo_extracao, q.confianca, q.status_validacao
            FROM questoes_gabarito q
            JOIN gabaritos g ON q.gabarito_id = g.id
            JOIN documentos d ON g.documento_id = d.id
            JOIN fontes f ON d.fonte_id = f.id
            ORDER BY f.uf, f.sigla, d.ano DESC, g.versao_caderno, q.numero_questao
        """)
        rows = c.fetchall()

        if rows:
            keys = rows[0].keys()
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(keys)
                for r in rows:
                    writer.writerow([r[k] for k in keys])
        conn.close()
        return output_path, len(rows)

    def generate_coverage_report(self, output_md="data/relatorio_cobertura_gabaritos.md"):
        """Gera relatório completo em Markdown sobre a cobertura das instituições"""
        os.makedirs(os.path.dirname(output_md), exist_ok=True)
        conn = self._conn()
        c = conn.cursor()

        c.execute("""
            SELECT 
                f.nome_instituicao, f.sigla, f.uf, f.banca, f.url_oficial,
                COUNT(DISTINCT d.id) as total_docs,
                COUNT(DISTINCT g.id) as total_cadernos,
                COUNT(q.id) as total_questoes,
                SUM(CASE WHEN q.status = 'anulada' THEN 1 ELSE 0 END) as total_anuladas,
                SUM(CASE WHEN q.status = 'alterada' THEN 1 ELSE 0 END) as total_alteradas,
                MIN(d.ano) as ano_inicial,
                MAX(d.ano) as ano_final
            FROM fontes f
            LEFT JOIN documentos d ON f.id = d.fonte_id
            LEFT JOIN gabaritos g ON d.id = g.documento_id
            LEFT JOIN questoes_gabarito q ON g.id = q.gabarito_id
            GROUP BY f.id
            ORDER BY f.uf, f.sigla
        """)
        fontes_data = c.fetchall()

        c.execute("SELECT COUNT(*) FROM questoes_gabarito")
        total_q = c.fetchone()[0]

        c.execute("SELECT COUNT(*) FROM documentos")
        total_d = c.fetchone()[0]

        conn.close()

        md = []
        md.append("# 📋 Relatório Nacional de Cobertura de Gabaritos Oficiais\n")
        md.append(f"**Data da Geração:** {os.popen('date /t').read().strip()} | **Status:** Pipeline Ativo\n")
        md.append(f"* **Total de Documentos Catalogados:** {total_d:,}\n")
        md.append(f"* **Total de Questões Extraídas:** {total_q:,}\n\n")
        md.append("| UF | Instituição | Banca | Anos | Documentos | Cadernos | Questões | Anuladas | Retificadas |")
        md.append("| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |")

        for r in fontes_data:
            anos_str = f"{r['ano_inicial']}–{r['ano_final']}" if r['ano_inicial'] else "Pendente"
            md.append(f"| {r['uf']} | **{r['sigla']}** - {r['nome_instituicao'][:28]} | {r['banca']} | {anos_str} | {r['total_docs']} | {r['total_cadernos']} | {r['total_questoes']} | {r['total_anuladas']} | {r['total_alteradas']} |")

        md.append("\n---\n*Gerado automaticamente pelo Coletor Nacional de Gabaritos.*")

        with open(output_md, 'w', encoding='utf-8') as f:
            f.write('\n'.join(md))

        return output_md
