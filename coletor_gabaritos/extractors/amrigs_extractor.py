import re
import pymupdf
import pypdf
from typing import List
from .base import ExtractedQuestion, ExtractionResult

class AMRIGSExtractor:
    """
    Extrator de alta precisão para a prova AMRIGS / Fundatec (Residência Médica).
    Suporta tabelas alternadas (linha de números / linha de respostas) e tabelas lineares.
    Trata anulações marcadas por '*', 'ANULADA', 'NULA' ou 'X'.
    """

    def extract(self, pdf_path: str) -> List[ExtractionResult]:
        try:
            reader = pypdf.PdfReader(pdf_path)
            full_txt = "\n".join([page.extract_text() or '' for page in reader.pages])
        except Exception as e:
            return [ExtractionResult(sucesso=False, versao_caderno="Acesso Direto", questoes=[], mensagem_erro=f"Erro ao abrir PDF: {e}")]

        tipo = "definitivo" if any(k in full_txt.lower() for k in ["definitivo", "oficial", "após recurso", "apos recurso"]) else "preliminar"

        res_dict = {}

        # 1. Método de linhas alternadas (Grade Fundatec AMRIGS: números seguidos de letras)
        lines = [l.strip() for l in full_txt.split('\n') if l.strip()]
        for i in range(len(lines) - 1):
            num_tokens = lines[i].split()
            ans_tokens = lines[i+1].split()
            if len(num_tokens) >= 5 and len(num_tokens) == len(ans_tokens):
                all_nums = all(t.isdigit() for t in num_tokens)
                all_letters = all(t.upper() in ['A','B','C','D','E','*','X','ANULADA','NULA'] for t in ans_tokens)
                if all_nums and all_letters:
                    for n_str, a_str in zip(num_tokens, ans_tokens):
                        n_int = int(n_str)
                        if 1 <= n_int <= 100 and n_int not in res_dict:
                            res_dict[n_int] = a_str.upper()

        # 2. Método linear/colunar (Ex: "1 C", "41 *")
        if len(res_dict) < 50:
            for line in lines:
                m = re.match(r'^\s*(\d{1,3})\s+([A-E]|\*|ANULADA|NULA|X)(?:\s|$)', line, re.IGNORECASE)
                if m:
                    num = int(m.group(1))
                    ans = m.group(2).upper()
                    if 1 <= num <= 100 and num not in res_dict:
                        res_dict[num] = ans

        # 3. Fallback de regex global de pares
        if len(res_dict) < 50:
            pairs = re.findall(r'\b(\d{1,3})\s+([A-E]|\*|ANULADA|NULA|X)(?:\s|$)', full_txt, re.IGNORECASE)
            for num_str, ans in pairs:
                num = int(num_str)
                if 1 <= num <= 100 and num not in res_dict:
                    res_dict[num] = ans.upper()

        if not res_dict:
            return [ExtractionResult(sucesso=False, versao_caderno="Acesso Direto", questoes=[], mensagem_erro="Nenhuma questão extraída do padrão AMRIGS")]

        questoes = []
        for qn in sorted(res_dict.keys()):
            ans_raw = res_dict[qn]
            status = 'valida'
            alternativa = ans_raw
            if ans_raw in ['*', 'ANULADA', 'NULA', 'X']:
                status = 'anulada'
                alternativa = 'ANULADA'
            elif ' ' in ans_raw or '/' in ans_raw:
                status = 'alterada'

            questoes.append(ExtractedQuestion(
                numero_questao=qn,
                alternativa=alternativa,
                status=status,
                pagina_pdf=1,
                trecho_origem=f"{qn} {ans_raw}",
                metodo_extracao="amrigs_table_parser",
                confianca=1.0 if len(res_dict) >= 95 else 0.95
            ))

        return [ExtractionResult(
            sucesso=len(questoes) >= 50,
            versao_caderno="Acesso Direto",
            questoes=questoes,
            tipo_gabarito=tipo,
            confianca_media=1.0 if len(questoes) >= 95 else 0.95
        )]
