import re
import pymupdf
from .base import ExtractedQuestion, ExtractionResult

class UFPAExtractor:
    """
    Extrator de alta precisão para os gabaritos da UFPA / CEPS.
    Detecta divisão por especialidades (Clínica Médica, Cirurgia Geral, Pediatria, GO, Preventiva),
    questões NULAS/ANULADAS e questões Retificadas.
    """
    def extract(self, pdf_path: str) -> list[ExtractionResult]:
        doc = pymupdf.open(pdf_path)
        if len(doc) == 0:
            return [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro="PDF vazio")]

        # UFPA normalmente tem 1 página por gabarito
        page_idx = 0
        txt = doc[page_idx].get_text()

        # Determina tipo de gabarito
        tipo_gab = 'definitivo' if 'definitivo' in txt.lower() else 'preliminar'

        # Mapeamento de especialidades por faixa de questão no Acesso Direto
        def get_especialidade(num: int) -> str:
            if 1 <= num <= 20: return "Clínica Médica"
            elif 21 <= num <= 40: return "Cirurgia Geral"
            elif 41 <= num <= 60: return "Pediatria"
            elif 61 <= num <= 80: return "Ginecologia e Obstetrícia"
            elif 81 <= num <= 100: return "Medicina Preventiva e Social"
            return "Geral"

        # Padrão: número, quebra/espaço, letra/NULA, opcional (Retificada)
        pattern = r'(\b(?:100|[1-9]\d?))\s*\n\s*([A-E]|NULA|ANULADA|X)\b(?:\s*\n\s*(\(Retificada\)))?'
        matches = list(re.finditer(pattern, txt, re.IGNORECASE))

        # Se não encontrou quebras com \n, tenta inline
        if len(matches) < 20:
            pattern_inline = r'(\b(?:100|[1-9]\d?))\s*[\.\-\s]\s*([A-E]|NULA|ANULADA|X)\b(?:\s*(\(Retificada\)))?'
            matches = list(re.finditer(pattern_inline, txt, re.IGNORECASE))

        questoes = []
        seen = set()

        for m in matches:
            num = int(m.group(1))
            if num in seen:
                continue
            seen.add(num)

            ans_raw = m.group(2).upper()
            is_retificada = bool(m.group(3))

            status = 'valida'
            alternativa = ans_raw
            if ans_raw in ['NULA', 'ANULADA', 'X']:
                status = 'anulada'
                alternativa = 'ANULADA'
            elif is_retificada:
                status = 'alterada'

            snippet = m.group(0).replace('\n', ' ')

            questoes.append(ExtractedQuestion(
                numero_questao=num,
                alternativa=alternativa,
                status=status,
                especialidade=get_especialidade(num),
                pagina_pdf=page_idx + 1,
                trecho_origem=snippet,
                metodo_extracao="ufpa_regex_specialty",
                confianca=1.0
            ))

        questoes.sort(key=lambda q: q.numero_questao)

        sucesso = len(questoes) >= 20
        return [ExtractionResult(
            sucesso=sucesso,
            versao_caderno="Acesso Direto",
            questoes=questoes,
            tipo_gabarito=tipo_gab,
            confianca_media=1.0 if sucesso else 0.5
        )]
