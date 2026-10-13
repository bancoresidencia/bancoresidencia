import os
import pymupdf
from .base import ExtractionResult
from .usp_extractor import USPExtractor
from .psu_extractor import PSUExtractor
from .ufpa_extractor import UFPAExtractor

class SmartDispatcher:
    def __init__(self):
        self.usp_extractor = USPExtractor()
        self.psu_extractor = PSUExtractor()
        self.ufpa_extractor = UFPAExtractor()

    def dispatch(self, pdf_path: str, hint_sigla: str = "") -> list[ExtractionResult]:
        """
        Seleciona o extrator ideal com base no nome do arquivo, metadados ou conteúdo textual.
        """
        if not os.path.exists(pdf_path):
            return [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro="Arquivo não encontrado")]

        # Inspeciona cabeçalho do PDF
        try:
            doc = pymupdf.open(pdf_path)
            header_text = doc[0].get_text()[:1000].lower() if len(doc) > 0 else ""
        except Exception as e:
            return [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro=f"Erro ao abrir PDF: {e}")]

        sigla_upper = hint_sigla.upper()
        fn_upper = os.path.basename(pdf_path).upper()

        # 1. Rota USP / FUVEST
        if 'USP' in sigla_upper or 'FUVEST' in sigla_upper or 'fuvest' in header_text or 'universidade de são paulo' in header_text:
            return self.usp_extractor.extract(pdf_path)

        # 2. Rota UFPA
        if 'UFPA' in sigla_upper or 'ufpa' in header_text or 'universidade federal do pará' in header_text or 'psrm' in header_text:
            return self.ufpa_extractor.extract(pdf_path)

        # 3. Rota PSU-MG / AREMG / FHEMIG
        if 'PSU' in sigla_upper or 'AREMG' in sigla_upper or 'FHEMIG' in sigla_upper or 'aremg' in header_text or 'processo seletivo unificado de residência médica de minas gerais' in header_text:
            return self.psu_extractor.extract(pdf_path)

        # Fallback inteligente: tenta PSU primeiro (linear), se vier pouca questão, tenta UFPA
        res_psu = self.psu_extractor.extract(pdf_path)
        if res_psu and res_psu[0].sucesso and len(res_psu[0].questoes) >= 20:
            return res_psu

        res_ufpa = self.ufpa_extractor.extract(pdf_path)
        if res_ufpa and res_ufpa[0].sucesso and len(res_ufpa[0].questoes) >= 20:
            return res_ufpa

        return res_psu
