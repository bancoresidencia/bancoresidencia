import re
import pymupdf
import pdfplumber
from typing import List
from .base import ExtractedQuestion, ExtractionResult

class IAUPEExtractor:
    """
    Extrator de alta precisão para a banca IAUPE / UPENET (SES-PE - Residência Médica).
    Extrai as 100 questões divididas nas 5 especialidades básicas:
    - Clínica Médica (01-20)
    - Cirurgia Geral (21-40)
    - Obstetrícia e Ginecologia (41-60)
    - Pediatria (61-80)
    - Medicina Preventiva e Social (81-100)
    Suporta anulações explícitas ('NULA', 'ANULADA', 'X', '*') e retificações pós-recurso.
    """

    AREAS = {
        (1, 20): "Clínica Médica",
        (21, 40): "Cirurgia Geral",
        (41, 60): "Ginecologia e Obstetrícia",
        (61, 80): "Pediatria",
        (81, 100): "Medicina Preventiva e Social"
    }

    def _get_area(self, qn: int) -> str:
        for (start, end), area in self.AREAS.items():
            if start <= qn <= end:
                return area
        return "Geral"

    def extract(self, pdf_path: str) -> List[ExtractionResult]:
        try:
            doc = pymupdf.open(pdf_path)
            full_txt = "\n".join([page.get_text() for page in doc])
        except Exception as e:
            return [ExtractionResult(sucesso=False, versao_caderno="Acesso Direto", questoes=[], mensagem_erro=f"Erro ao abrir PDF com PyMuPDF: {e}")]

        tipo = "definitivo" if any(k in full_txt.lower() for k in ["definitivo", "republicado", "final", "aps recursos"]) else "preliminar"

        # Regex busca pares de numero (01 a 100) e alternativa (A-E ou marcadores de anulacao)
        pairs = re.findall(r'\b(\d{1,3})\s+([A-E]|\*|NULA|ANULADA|X)(?:\s|$)', full_txt, re.IGNORECASE)

        res_dict = {}
        for num_str, ans in pairs:
            num = int(num_str)
            if 1 <= num <= 100 and num not in res_dict:
                ans_up = ans.upper()
                res_dict[num] = ans_up

        if len(res_dict) < 40:
            # Fallback com pdfplumber para tabelas complexas
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        tables = page.extract_tables()
                        for t in tables:
                            for row in t:
                                for cell in row:
                                    if not cell:
                                        continue
                                    m = re.findall(r'(\d{1,3})\s*[-–.)\t ]{1,4}\s*([A-E]|\*|NULA|ANULADA|X)', cell, re.IGNORECASE)
                                    for num_s, ans_s in m:
                                        n = int(num_s)
                                        if 1 <= n <= 100 and n not in res_dict:
                                            res_dict[n] = ans_s.upper()
            except Exception:
                pass

        if not res_dict:
            return [ExtractionResult(sucesso=False, versao_caderno="Acesso Direto", questoes=[], mensagem_erro="Nenhuma questão extraída do padrão IAUPE")]

        questoes = []
        for qn in sorted(res_dict.keys()):
            ans_raw = res_dict[qn]
            status = 'valida'
            alternativa = ans_raw
            if ans_raw in ['NULA', 'ANULADA', 'X', '*']:
                status = 'anulada'
                alternativa = 'ANULADA'
            elif ' ' in ans_raw or '/' in ans_raw:
                status = 'alterada'

            questoes.append(ExtractedQuestion(
                numero_questao=qn,
                alternativa=alternativa,
                status=status,
                especialidade=self._get_area(qn),
                pagina_pdf=1,
                trecho_origem=f"{qn} {ans_raw}",
                metodo_extracao="iaupe_columnar_pairs",
                confianca=1.0 if len(res_dict) == 100 else 0.95
            ))

        return [ExtractionResult(
            sucesso=len(questoes) >= 50,
            versao_caderno="Acesso Direto",
            questoes=questoes,
            tipo_gabarito=tipo,
            confianca_media=1.0 if len(questoes) == 100 else 0.95
        )]
