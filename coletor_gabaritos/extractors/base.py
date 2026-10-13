from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ExtractedQuestion:
    numero_questao: int
    alternativa: str # 'A', 'B', 'C', 'D', 'E', 'ANULADA', etc.
    status: str = 'valida' # 'valida', 'anulada', 'alterada', 'indeterminada'
    especialidade: Optional[str] = None
    pagina_pdf: int = 1
    trecho_origem: str = ''
    metodo_extracao: str = 'regex'
    confianca: float = 1.0

@dataclass
class ExtractionResult:
    sucesso: bool
    versao_caderno: str
    questoes: List[ExtractedQuestion]
    tipo_gabarito: str = 'definitivo'
    mensagem_erro: Optional[str] = None
    confianca_media: float = 1.0
