from typing import List, Dict, Any
from ..extractors.base import ExtractedQuestion

class GabaritoValidator:
    """
    Módulo de validação de qualidade e integridade dos gabaritos extraídos.
    """
    VALID_ALTERNATIVES = {'A', 'B', 'C', 'D', 'E', 'ANULADA', 'NULA', 'X'}

    def validate_gabarito(self, questoes: List[ExtractedQuestion], expected_max: int = None) -> Dict[str, Any]:
        """
        Executa bateria de testes de integridade sobre as questões de um gabarito.
        """
        erros = []
        alertas = []

        if not questoes:
            return {
                'valido': False,
                'erros': ["Gabarito vazio, nenhuma questão extraída"],
                'alertas': [],
                'total_questoes': 0,
                'anuladas': 0,
                'alteradas': 0,
                'faltantes': []
            }

        nums = [q.numero_questao for q in questoes]
        total = len(questoes)
        max_num = max(nums)
        min_num = min(nums)

        # 1. Checagem de numeração inicial
        if min_num != 1:
            alertas.append(f"Gabarito inicia no número {min_num} em vez de 1")

        # 2. Checagem de questões duplicadas
        duplicadas = [n for n in set(nums) if nums.count(n) > 1]
        if duplicadas:
            erros.append(f"Questões duplicadas detectadas: {sorted(duplicadas)}")

        # 3. Checagem de buracos / continuidade
        target_max = expected_max or max_num
        faltantes = [i for i in range(1, target_max + 1) if i not in nums]
        if faltantes and len(faltantes) <= 10:
            alertas.append(f"Questões faltantes na sequência: {faltantes}")
        elif len(faltantes) > 10:
            erros.append(f"Sequência gravemente fragmentada, faltam {len(faltantes)} questões")

        # 4. Checagem de alternativas válidas
        invalidas = []
        anuladas = 0
        alteradas = 0

        for q in questoes:
            if q.alternativa.upper() not in self.VALID_ALTERNATIVES:
                invalidas.append((q.numero_questao, q.alternativa))
            if q.status == 'anulada':
                anuladas += 1
            if q.status == 'alterada':
                alteradas += 1

        if invalidas:
            erros.append(f"Alternativas fora do padrão [A-E, ANULADA]: {invalidas}")

        valido = len(erros) == 0

        return {
            'valido': valido,
            'erros': erros,
            'alertas': alertas,
            'total_questoes': total,
            'anuladas': anuladas,
            'alteradas': alteradas,
            'faltantes': faltantes,
            'taxa_integridade': round((total - len(erros) * 5) / total * 100, 1) if total > 0 else 0
        }

    def compare_preliminar_vs_definitivo(self, prelim_questoes: List[ExtractedQuestion], def_questoes: List[ExtractedQuestion]) -> List[Dict[str, Any]]:
        """
        Detecta anulações e alterações de gabarito entre versões preliminar e definitiva.
        """
        divergencias = []
        map_prelim = {q.numero_questao: q.alternativa for q in prelim_questoes}
        map_def = {q.numero_questao: q.alternativa for q in def_questoes}

        all_keys = sorted(set(map_prelim.keys()) | set(map_def.keys()))
        for qn in all_keys:
            ans_p = map_prelim.get(qn)
            ans_d = map_def.get(qn)
            if ans_p and ans_d and ans_p != ans_d:
                tipo = 'anulacao' if ans_d == 'ANULADA' else 'alteracao_gabarito'
                divergencias.append({
                    'numero_questao': qn,
                    'alternativa_preliminar': ans_p,
                    'alternativa_definitiva': ans_d,
                    'tipo_divergencia': tipo
                })
        return divergencias
