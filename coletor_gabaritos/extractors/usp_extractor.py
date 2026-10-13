import pdfplumber
import pymupdf
import re
from .base import ExtractedQuestion, ExtractionResult

class USPExtractor:
    """
    Extrator de alta precisão para a FUVEST / USP (Residência Médica).
    Extrai gabaritos de múltiplos cadernos (Prova A1, A2, A3) com desduplicação e alinhamento de colunas.
    Suporta anulações marcadas com '*' ou 'ANULADA' e respostas compostas (ex: 'A B').
    """
    def extract(self, pdf_path: str) -> list[ExtractionResult]:
        results = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                if len(pdf.pages) == 0:
                    return [ExtractionResult(sucesso=False, versao_caderno="A1", questoes=[], mensagem_erro="PDF vazio")]

                p0 = pdf.pages[0]
                tables = p0.extract_tables()
                if tables and len(tables[0]) > 5:
                    table = tables[0]
                    provas_dict = {'Prova A1': {}, 'Prova A2': {}, 'Prova A3': {}}

                    for row in table[1:]:
                        items = [c.strip() for c in row if c and c.strip()]
                        if len(items) == 18:
                            # 9 pares por linha (3 para cada caderno)
                            for q_idx, a_idx in [(0, 1), (2, 3), (4, 5)]:
                                provas_dict['Prova A1'][int(items[q_idx])] = items[a_idx]
                            for q_idx, a_idx in [(6, 7), (8, 9), (10, 11)]:
                                provas_dict['Prova A2'][int(items[q_idx])] = items[a_idx]
                            for q_idx, a_idx in [(12, 13), (14, 15), (16, 17)]:
                                provas_dict['Prova A3'][int(items[q_idx])] = items[a_idx]

                    for prova_nome, q_dict in provas_dict.items():
                        if not q_dict:
                            continue
                        q_list = []
                        for num in sorted(q_dict.keys()):
                            ans_raw = q_dict[num].upper()
                            status = 'valida'
                            alternativa = ans_raw
                            if ans_raw in ['*', 'ANULADA', 'NULA', 'X']:
                                status = 'anulada'
                                alternativa = 'ANULADA'
                            elif ' ' in ans_raw or '/' in ans_raw:
                                status = 'alterada'
                                alternativa = ans_raw

                            q_list.append(ExtractedQuestion(
                                numero_questao=num,
                                alternativa=alternativa,
                                status=status,
                                pagina_pdf=1,
                                trecho_origem=f"{num} {ans_raw}",
                                metodo_extracao="usp_table_plumber_positional",
                                confianca=1.0
                            ))
                        results.append(ExtractionResult(
                            sucesso=len(q_list) >= 50,
                            versao_caderno=prova_nome,
                            questoes=q_list,
                            tipo_gabarito="definitivo",
                            confianca_media=1.0
                        ))
        except Exception as e:
            # Fallback PyMuPDF caso pdfplumber falhe
            doc = pymupdf.open(pdf_path)
            txt = doc[0].get_text()
            pattern = r'(\b(?:120|1[0-1]\d|[1-9]\d?))\s*\n\s*([A-E]|\*|ANULADA|NULA)\b'
            matches = list(re.finditer(pattern, txt, re.IGNORECASE))
            q_list = []
            seen = set()
            for m in matches:
                num = int(m.group(1))
                if num not in seen:
                    seen.add(num)
                    ans = m.group(2).upper()
                    status = 'anulada' if ans in ['*', 'ANULADA', 'NULA'] else 'valida'
                    q_list.append(ExtractedQuestion(
                        numero_questao=num,
                        alternativa='ANULADA' if status == 'anulada' else ans,
                        status=status,
                        pagina_pdf=1,
                        trecho_origem=m.group(0).strip(),
                        metodo_extracao="usp_pymupdf_fallback",
                        confianca=0.9
                    ))
            q_list.sort(key=lambda x: x.numero_questao)
            results.append(ExtractionResult(
                sucesso=len(q_list) >= 50,
                versao_caderno="Prova A1 (Fallback)",
                questoes=q_list,
                tipo_gabarito="definitivo",
                confianca_media=0.9
            ))

        return results if results else [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro="Falha ao extrair tabela USP")]
