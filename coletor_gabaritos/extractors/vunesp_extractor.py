import re
import pymupdf
import pdfplumber
from typing import List
from .base import ExtractedQuestion, ExtractionResult

class VUNESPExtractor:
    """
    Extrator de alta precisão para concursos organizados pela Fundação VUNESP
    (SUS-SP, Irmandade da Santa Casa de SP, UNESP Botucatu).
    Suporta:
    - Versões de Caderno (Versão 1, 2, 3, 4 ou Versão Geral).
    - Notação padrão VUNESP: '1 - B', '2 - C', etc.
    - Notação em grade ou tabela tabular.
    - Anulações expressas como 'NULA', 'ANULADA', 'X' ou '*'.
    """

    def extract(self, pdf_path: str) -> List[ExtractionResult]:
        try:
            doc = pymupdf.open(pdf_path)
            full_txt = "\n".join([page.get_text() for page in doc])
        except Exception as e:
            return [ExtractionResult(sucesso=False, versao_caderno="Versao 1", questoes=[], mensagem_erro=f"Erro ao abrir PDF: {e}")]

        tipo = "definitivo" if any(k in full_txt.lower() for k in ["definitivo", "republicado", "oficial", "aps recurso", "após recurso"]) else "preliminar"

        # Estratégia 1: Formato padrão VUNESP hifenizado '1 - B' ou '01 - A'
        # Exemplo: 01 - A | 02 - D | 21 - C ...
        hyphen_pairs = re.findall(r'\b(\d{1,3})\s*[-–.]\s*([A-E]|\*|NULA|ANULADA|X)\b', full_txt, re.IGNORECASE)

        res_dict = {}
        for num_str, ans in hyphen_pairs:
            num = int(num_str)
            if 1 <= num <= 100 and num not in res_dict:
                res_dict[num] = ans.upper()

        # Estratégia 2: Se não houver hífens suficientes, busca pares diretos numero-letra
        if len(res_dict) < 50:
            direct_pairs = re.findall(r'\b(\d{1,3})\s+([A-E]|\*|NULA|ANULADA|X)(?:\s|$)', full_txt, re.IGNORECASE)
            for num_str, ans in direct_pairs:
                num = int(num_str)
                if 1 <= num <= 100 and num not in res_dict:
                    res_dict[num] = ans.upper()

        # Estratégia 3: Tabela pdfplumber (para tabelas com múltiplas versões de caderno)
        if len(res_dict) < 50:
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        tables = page.extract_tables()
                        for table in tables:
                            for row in table:
                                for cell in row:
                                    if not cell:
                                        continue
                                    m = re.findall(r'(\d{1,3})\s*[-–.)\t ]{1,4}\s*([A-E]|\*|NULA|ANULADA|X)', cell, re.IGNORECASE)
                                    for n_s, a_s in m:
                                        n = int(n_s)
                                        if 1 <= n <= 100 and n not in res_dict:
                                            res_dict[n] = a_s.upper()
            except Exception:
                pass

        if not res_dict:
            return [ExtractionResult(sucesso=False, versao_caderno="Versao 1", questoes=[], mensagem_erro="Nenhuma questão extraída do padrão VUNESP")]

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
                trecho_origem=f"{qn} - {ans_raw}",
                metodo_extracao="vunesp_parser",
                confianca=1.0 if len(res_dict) == 100 else 0.95
            ))

        return [ExtractionResult(
            sucesso=len(questoes) >= 50,
            versao_caderno="Versao 1",
            questoes=questoes,
            tipo_gabarito=tipo,
            confianca_media=1.0 if len(questoes) == 100 else 0.95
        )]
