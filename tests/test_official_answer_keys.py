import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from audit_official_answer_keys import audit_question
from official_answer_key_pdfs import Item, grid_pairs


class OfficialAnswerKeyTest(unittest.TestCase):
    def setUp(self):
        self.source = {
            "id": "teste-a", "board": "Banca de teste", "institution": "Instituição de teste",
            "year": 2026, "modality": "Acesso Direto", "edition": "2026", "booklet": "A",
            "key": {"status": "definitivo"}, "publication": "https://example.com/publicacao",
        }
        self.statement = "Qual valor corresponde ao item descrito?"
        self.official = {"A": "10 mg", "B": "20 mg", "C": "30 mg", "D": "40 mg"}
        self.question = {
            "id": "teste", "code": "TESTE", "institution": self.source["institution"],
            "banca": self.source["board"], "year": self.source["year"],
            "modalidade": self.source["modality"], "especialidade": "Clínica Médica",
            "table": "questions_direto", "updated_at": None, "statement": self.statement,
            "type": "Múltipla escolha", "images": [],
            "options": [{"letter": letter, "text": raw}
                        for letter, raw in zip("ABCD", ("30 mg", "10 mg", "40 mg", "20 mg"))],
        }
        self.documents = {kind: {"origem_verificada": True} for kind in ("exam", "key")}

    def evidence(self, letter="C", source=None, visual=False):
        return (
            source or self.source, [Item(10, self.statement, self.official, [3], visual)],
            {10: {"letra": letter, "pagina": 1}}, self.documents,
        )

    def audit(self, *entries):
        return audit_question(self.question, entries, {}, {})

    def test_maps_official_c_to_platform_a_with_all_options_preserved(self):
        result = self.audit(self.evidence())
        self.assertEqual(result["proposta"], "A")
        self.assertEqual(result["evidencias"][0]["mapeamento_completo"], {
            "A": "B", "B": "D", "C": "A", "D": "C",
        })

    def test_rejects_changed_dosage_even_when_correct_option_is_unchanged(self):
        self.question["options"][1]["text"] = "10 µg"
        self.assertEqual(self.audit(self.evidence())["situacao"], "alternativas_divergentes")

    def test_rejects_different_year_and_institution(self):
        for field, value in (("year", 2025), ("institution", "Outra instituição")):
            with self.subTest(field=field):
                self.assertIsNone(self.audit(self.evidence(source={**self.source, field: value}))["proposta"])

    def test_rejects_preliminary_key_even_with_exact_full_match(self):
        source = {**self.source, "key": {"status": "preliminar"}}
        self.assertEqual(self.audit(self.evidence(source=source))["situacao"], "sem_gabarito_definitivo")

    def test_rejects_unverified_local_document(self):
        self.documents["key"]["origem_verificada"] = False
        self.assertEqual(self.audit(self.evidence())["situacao"], "documento_definitivo_nao_verificado")

    def test_requires_visual_review(self):
        self.assertEqual(self.audit(self.evidence(visual=True))["situacao"], "conferencia_visual")

    def test_blocks_conflicting_versions_after_remapping(self):
        variant = {**self.source, "id": "teste-b", "booklet": "B"}
        self.assertEqual(self.audit(self.evidence(), self.evidence("A", variant))["situacao"],
                         "divergencia_entre_cadernos")

    def test_recognizes_an_explicit_official_annulment(self):
        self.assertEqual(self.audit(self.evidence("ANULADA"))["proposta"], "ANULADA")

    def test_blocks_duplicate_options_even_if_both_versions_duplicate_them(self):
        self.official["B"] = "10 mg"
        self.question["options"][3]["text"] = "10 mg"
        self.assertIsNone(self.audit(self.evidence())["proposta"])

    def test_reads_numbered_grid_without_silently_shifting_answers(self):
        self.assertEqual(list(grid_pairs("1\n2\n3\n4\n5\nD\nC\nX\nA\nB")), [
            (1, "D"), (2, "C"), (3, "X"), (4, "A"), (5, "B"),
        ])
        self.assertEqual(list(grid_pairs("1\n2\n3\n5\n6\nD\nC\nX\nA\nB")), [])


if __name__ == "__main__":
    unittest.main()
