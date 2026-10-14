import os
import sys
sys.path.insert(0, os.path.abspath('.'))
import unittest
from coletor_gabaritos.extractors.usp_extractor import USPExtractor
from coletor_gabaritos.extractors.ufpa_extractor import UFPAExtractor
from coletor_gabaritos.extractors.psu_extractor import PSUExtractor
from coletor_gabaritos.extractors.iaupe_extractor import IAUPEExtractor
from coletor_gabaritos.extractors.amrigs_extractor import AMRIGSExtractor
from coletor_gabaritos.validator.validator import GabaritoValidator

class TestExtractorsAndValidation(unittest.TestCase):

    def setUp(self):
        self.validator = GabaritoValidator()

    def test_usp_extractor_format(self):
        usp_pdf = os.path.join('data', 'official_exams', 'USP_FUVEST', 'USP_FUVEST_2025_GB.pdf')
        if not os.path.exists(usp_pdf):
            self.skipTest("Arquivo USP não encontrado")

        extractor = USPExtractor()
        results = extractor.extract(usp_pdf)

        self.assertGreaterEqual(len(results), 3, "USP deve extrair ao menos 3 versões de prova (A1, A2, A3)")
        for res in results:
            self.assertTrue(res.sucesso)
            self.assertEqual(len(res.questoes), 120, f"{res.versao_caderno} deve ter 120 questões")
            v_res = self.validator.validate_gabarito(res.questoes, expected_max=120)
            self.assertTrue(v_res['valido'], f"Validação falhou para {res.versao_caderno}: {v_res['erros']}")
            self.assertEqual(len(v_res['faltantes']), 0)

    def test_ufpa_extractor_format(self):
        ufpa_pdf = os.path.join('data', 'official_exams', 'UFPA', 'UFPA_2024_GB_Definitivo_Acesso_Direto.pdf')
        if not os.path.exists(ufpa_pdf):
            self.skipTest("Arquivo UFPA não encontrado")

        extractor = UFPAExtractor()
        results = extractor.extract(ufpa_pdf)

        self.assertEqual(len(results), 1)
        res = results[0]
        self.assertTrue(res.sucesso)
        self.assertEqual(len(res.questoes), 100, "UFPA Acesso Direto deve conter 100 questões")

        # Verifica especialidades
        q_map = {q.numero_questao: q for q in res.questoes}
        self.assertEqual(q_map[1].especialidade, "Clínica Médica")
        self.assertEqual(q_map[21].especialidade, "Cirurgia Geral")
        self.assertEqual(q_map[41].especialidade, "Pediatria")
        self.assertEqual(q_map[61].especialidade, "Ginecologia e Obstetrícia")
        self.assertEqual(q_map[81].especialidade, "Medicina Preventiva e Social")

        # Verifica anulações e retificações oficiais
        self.assertEqual(q_map[25].status, "anulada")
        self.assertEqual(q_map[57].status, "anulada")
        self.assertEqual(q_map[41].status, "alterada")

        v_res = self.validator.validate_gabarito(res.questoes, expected_max=100)
        self.assertTrue(v_res['valido'])
        self.assertEqual(len(v_res['faltantes']), 0)

    def test_iaupe_extractor_format(self):
        iaupe_pdf = os.path.join('data', 'official_exams', 'SES_PE', 'SES_PE_2024_GABARITO_DEFINITIVO_ACESSO_DIRETO_2024_Repub.pdf')
        if not os.path.exists(iaupe_pdf):
            self.skipTest("Arquivo SES-PE não encontrado")

        extractor = IAUPEExtractor()
        results = extractor.extract(iaupe_pdf)

        self.assertEqual(len(results), 1)
        res = results[0]
        self.assertTrue(res.sucesso)
        self.assertEqual(len(res.questoes), 100, "SES-PE Acesso Direto deve conter exatamente 100 questões")

        q_map = {q.numero_questao: q for q in res.questoes}
        self.assertEqual(q_map[1].especialidade, "Clínica Médica")
        self.assertEqual(q_map[21].especialidade, "Cirurgia Geral")
        self.assertEqual(q_map[41].especialidade, "Ginecologia e Obstetrícia")
        self.assertEqual(q_map[61].especialidade, "Pediatria")
        self.assertEqual(q_map[81].especialidade, "Medicina Preventiva e Social")

        # Anulações oficiais confirmadas
        self.assertEqual(q_map[20].status, "anulada")
        self.assertEqual(q_map[82].status, "anulada")
        self.assertEqual(q_map[87].status, "anulada")

        v_res = self.validator.validate_gabarito(res.questoes, expected_max=100)
        self.assertTrue(v_res['valido'])
        self.assertEqual(len(v_res['faltantes']), 0)

    def test_amrigs_extractor_format(self):
        amrigs_pdf = os.path.join('data', 'official_exams', 'AMRIGS', 'AMRIGS_Gabarito_Definitivo_Acesso_Direto.pdf')
        if not os.path.exists(amrigs_pdf):
            self.skipTest("Arquivo AMRIGS não encontrado")

        extractor = AMRIGSExtractor()
        results = extractor.extract(amrigs_pdf)

        self.assertEqual(len(results), 1)
        res = results[0]
        self.assertTrue(res.sucesso)
        self.assertEqual(len(res.questoes), 100, "AMRIGS Acesso Direto deve conter exatamente 100 questões")

        q_map = {q.numero_questao: q for q in res.questoes}
        self.assertEqual(q_map[41].status, "anulada")
        self.assertEqual(q_map[66].status, "anulada")

        v_res = self.validator.validate_gabarito(res.questoes, expected_max=100)
        self.assertTrue(v_res['valido'])
        self.assertEqual(len(v_res['faltantes']), 0)

if __name__ == '__main__':
    unittest.main()
