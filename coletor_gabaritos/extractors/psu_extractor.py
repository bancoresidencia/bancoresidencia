import re
import pymupdf
from .base import ExtractedQuestion, ExtractionResult

class PSUExtractor:
    """
    Extrator de alta precisão para o Processo Seletivo Unificado de MG (PSU-MG / AREMG / FHEMIG).
    Identifica tipo de caderno (Tipo 1, Tipo 2, Tipo 3, Tipo 4) e extrai lista linear de questões.
    """
    def extract(self, pdf_path: str) -> list[ExtractionResult]:
        doc = pymupdf.open(pdf_path)
        if len(doc) == 0:
            return [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro="PDF vazio")]

        full_text = "\n".join([p.get_text() for p in doc])
        
        # Identifica tipo de prova (caderno)
        versao_caderno = "Tipo 1"
        tipo_match = re.search(r'(TIPO\s*[1-4]|PROVA\s*GERAL\s*TIPO\s*[1-4])', full_text, re.IGNORECASE)
        if tipo_match:
            versao_caderno = tipo_match.group(0).strip().title()

        tipo_gab = 'preliminar' if 'preliminar' in full_text.lower() else 'definitivo'

        # Padrão: 1. B ou 1 - B ou 1 B
        pattern = r'(\b(?:120|1[0-1]\d|[1-9]\d?))\s*[\.\-\s]\s*([A-E]|NULA|ANULADA|X|\*)\b'
        matches = list(re.finditer(pattern, full_text, re.IGNORECASE))

        questoes = []
        seen = set()

        for m in matches:
            num = int(m.group(1))
            if num in seen:
                continue
            seen.add(num)

            ans_raw = m.group(2).upper()
            status = 'valida'
            alternativa = ans_raw
            if ans_raw in ['NULA', 'ANULADA', 'X', '*']:
                status = 'anulada'
                alternativa = 'ANULADA'

            questoes.append(ExtractedQuestion(
                numero_questao=num,
                alternativa=alternativa,
                status=status,
                pagina_pdf=1,
                trecho_origem=m.group(0).strip(),
                metodo_extracao="psu_regex_linear",
                confianca=1.0
            ))

        questoes.sort(key=lambda q: q.numero_questao)
        sucesso = len(questoes) >= 20

        return [ExtractionResult(
            sucesso=sucesso,
            versao_caderno=versao_caderno,
            questoes=questoes,
            tipo_gabarito=tipo_gab,
            confianca_media=1.0 if sucesso else 0.5
        )]
