import os
import pymupdf
from .base import ExtractionResult
from .usp_extractor import USPExtractor
from .psu_extractor import PSUExtractor
from .ufpa_extractor import UFPAExtractor
from .iaupe_extractor import IAUPEExtractor
from .amrigs_extractor import AMRIGSExtractor
from .vunesp_extractor import VUNESPExtractor
from .generic_tabular_extractor import GenericTabularExtractor

class SmartDispatcher:
    """
    Roteador inteligente de extratores baseado em heurísticas de cabeçalho,
    nome do arquivo, banca ou instituição de origem.
    """
    def __init__(self):
        self.usp_extractor = USPExtractor()
        self.psu_extractor = PSUExtractor()
        self.ufpa_extractor = UFPAExtractor()
        self.iaupe_extractor = IAUPEExtractor()
        self.amrigs_extractor = AMRIGSExtractor()
        self.vunesp_extractor = VUNESPExtractor()
        self.generic_extractor = GenericTabularExtractor()

    def dispatch(self, pdf_path: str, hint_sigla: str = "") -> list[ExtractionResult]:
        """
        Seleciona o extrator ideal com base no nome do arquivo, metadados ou conteúdo textual.
        """
        if not os.path.exists(pdf_path):
            return [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro="Arquivo não encontrado")]

        # Inspeciona cabeçalho do PDF
        try:
            doc = pymupdf.open(pdf_path)
            header_text = doc[0].get_text()[:1200].lower() if len(doc) > 0 else ""
        except Exception as e:
            return [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro=f"Erro ao abrir PDF: {e}")]

        sigla_upper = hint_sigla.upper()
        fn_upper = os.path.basename(pdf_path).upper()

        # 1. Rota IAUPE / SES-PE
        if 'SES_PE' in sigla_upper or 'SES-PE' in sigla_upper or 'IAUPE' in sigla_upper or 'UPENET' in sigla_upper or 'pernambuco' in header_text or 'iaupe' in header_text or 'upenet' in header_text or 'ses_pe' in fn_upper:
            res = self.iaupe_extractor.extract(pdf_path)
            if res and res[0].sucesso:
                return res

        # 2. Rota AMRIGS
        if 'AMRIGS' in sigla_upper or 'amrigs' in header_text or 'amrigs' in fn_upper or 'fundatec' in header_text:
            res = self.amrigs_extractor.extract(pdf_path)
            if res and res[0].sucesso:
                return res

        # 3. Rota VUNESP (SUS-SP, Santa Casa SP, UNESP)
        if any(k in sigla_upper for k in ['VUNESP', 'SUS_SP', 'SUS-SP', 'SANTA_CASA', 'UNESP']) or any(k in header_text for k in ['vunesp', 'sus-sp', 'santa casa de são paulo', 'unesp']):
            res = self.vunesp_extractor.extract(pdf_path)
            if res and res[0].sucesso:
                return res

        # 4. Rota USP / FUVEST
        if 'USP' in sigla_upper or 'FUVEST' in sigla_upper or 'fuvest' in header_text or 'universidade de são paulo' in header_text:
            res = self.usp_extractor.extract(pdf_path)
            if res and res[0].sucesso:
                return res

        # 5. Rota UFPA
        if 'UFPA' in sigla_upper or 'ufpa' in header_text or 'universidade federal do pará' in header_text or 'psrm' in header_text:
            res = self.ufpa_extractor.extract(pdf_path)
            if res and res[0].sucesso:
                return res

        # 6. Rota PSU-MG / AREMG / FHEMIG
        if 'PSU' in sigla_upper or 'AREMG' in sigla_upper or 'FHEMIG' in sigla_upper or 'aremg' in header_text or 'processo seletivo unificado de residência médica de minas gerais' in header_text:
            res = self.psu_extractor.extract(pdf_path)
            if res and res[0].sucesso:
                return res

        # 7. Fallback inteligente: tenta extratores ordenados por especificidade
        for ext in [self.iaupe_extractor, self.amrigs_extractor, self.vunesp_extractor, self.psu_extractor, self.generic_extractor]:
            try:
                res = ext.extract(pdf_path)
                if res and res[0].sucesso and len(res[0].questoes) >= 20:
                    return res
            except Exception:
                continue

        return [ExtractionResult(sucesso=False, versao_caderno="Unico", questoes=[], mensagem_erro="Falha ao extrair por qualquer extrator conhecido")]
