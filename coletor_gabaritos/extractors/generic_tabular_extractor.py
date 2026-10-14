import re
import pymupdf
import pdfplumber
from typing import List
from .base import ExtractedQuestion, ExtractionResult

class GenericTabularExtractor:
    """
    Extrator tabular universal de alta tolerância para bancas como:
    - UNIFESP / FAPUNIFESP
    - IAMSPE / Quadrix
    - FMABC (Faculdade de Medicina do ABC)
    Capaz de reconhecer sequências numéricas de 1 a 80, 100 ou 120 com alternativas A-E
    ou anulações (ANULADA, NULA, *, X, CANCELADA).
    """

    def extract(self, pdf_path: str, max_q: int = 120) -> List[ExtractionResult]:
        try:
            doc = pymupdf.open(pdf_path)
            full_txt = "\n".join([page.get_text() for page in doc])
        except Exception as e:
            return [ExtractionResult(sucesso=False, versao_caderno="Geral", questoes=[], mensagem_erro=f"Erro ao abrir PDF: {e}")]

        tipo = "definitivo" if any(k in full_txt.lower() for k in ["definitivo", "republicado", "oficial", "aps recurso", "após recurso", "homologado"]) else "preliminar"

        res_dict = {}

        # 1. Regex hifenizada ou pontuada: '1 - A', '01. B', '1) C'
        pairs = re.findall(r'\b(\d{1,3})\s*[-–.)\t ]{1,4}\s*([A-E]|\*|NULA|ANULADA|CANCELADA|X)\b', full_txt, re.IGNORECASE)
        for n_str, a_str in pairs:
            n = int(n_str)
            if 1 <= n <= max_q and n not in res_dict:
                res_dict[n] = a_str.upper()

        # 2. Se insuficiente, busca tabelas com pdfplumber
        if len(res_dict) < 40:
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        tables = page.extract_tables()
                        for table in tables:
                            for row in table:
                                for cell in row:
                                    if not cell:
                                        continue
                                    matches = re.findall(r'(\d{1,3})\s*[-–.)\t ]{1,4}\s*([A-E]|\*|NULA|ANULADA|CANCELADA|X)', cell, re.IGNORECASE)
                                    for num_s, ans_s in matches:
                                        num = int(num_s)
                                        if 1 <= num <= max_q and num not in res_dict:
                                            res_dict[num] = ans_s.upper()
            except Exception:
                pass

        # 3. Se ainda insuficiente, busca pares diretos numero espaço letra
        if len(res_dict) < 40:
            direct = re.findall(r'\b(\d{1,3})\s+([A-E]|\*|NULA|ANULADA|X)(?:\s|$)', full_txt, re.IGNORECASE)
            for num_str, ans in direct:
                num = int(num_str)
                if 1 <= num <= max_q and num not in res_dict:
                    res_dict[num] = ans.upper()

        if not res_dict:
            return [ExtractionResult(sucesso=False, versao_caderno="Geral", questoes=[], mensagem_erro="Nenhuma questão extraída no formato tabular")]

        questoes = []
        for qn in sorted(res_dict.keys()):
            ans_raw = res_dict[qn]
            status = 'valida'
            alternativa = ans_raw
            if ans_raw in ['*', 'ANULADA', 'NULA', 'CANCELADA', 'X']:
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
                metodo_extracao="generic_tabular_parser",
                confianca=0.98
            ))

        return [ExtractionResult(
            sucesso=len(questoes) >= 40,
            versao_caderno="Geral",
            questoes=questoes,
            tipo_gabarito=tipo,
            confianca_media=0.98
        )]
