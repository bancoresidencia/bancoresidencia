import copy
import hashlib
import io
import json
import tempfile
import unittest
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw

from scripts.extract_official_question_images import run_plan


class OfficialQuestionImagesTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        self.pdf = self.root / "source.pdf"
        self.plan = self.root / "plan.json"
        self.output = self.root / "output"
        figure = Image.new("RGB", (160, 120), "white")
        ImageDraw.Draw(figure).line((10, 100, 150, 20), fill="black", width=4)
        encoded = io.BytesIO()
        figure.save(encoded, "PNG")

        with pymupdf.open() as doc:
            page = doc.new_page(width=400, height=360)
            page.insert_text((20, 35), "12. Este enunciado possui palavras suficientes para identificar a questao")
            page.insert_text((25, 68), "(A)")
            xref = page.insert_image(pymupdf.Rect(35, 76, 195, 196), stream=encoded.getvalue())
            page.insert_text((20, 233), "13. Outra questao abaixo deve ficar fora da regiao da figura")
            doc.save(self.pdf)

        self.entry = {
            "source_id": "pilot", "question_id": "c1220be0-9320-4d04-a930-710d1cbbdf01",
            "code": "TESTE-12", "page": 1, "question_number": 12,
            "question_bounds": [15, 20, 396, 220],
            "anchor": "Este enunciado possui palavras suficientes para identificar a questao",
            "crop": [34, 75, 196, 197], "xrefs": [xref], "figure": 1,
            "review_note": "Traçado íntegro dentro da questão.",
        }
        self.source = {
            "id": "pilot", "board": "Banca de teste", "year": 2026, "pdf": "source.pdf",
            "source_url": "https://example.com/source.pdf",
            "pdf_sha256": hashlib.sha256(self.pdf.read_bytes()).hexdigest(),
        }

    def run_entries(self, *entries):
        self.plan.write_text(json.dumps({
            "modality": "Acesso Direto", "sources": [self.source], "entries": entries,
        }), encoding="utf-8")
        return run_plan(self.plan, self.output)

    def test_extracts_decodable_webp_and_repeats_same_plan(self):
        records = self.run_entries(self.entry)
        self.assertEqual(records, self.run_entries(self.entry))
        record = records[0]
        data = (self.output / record["arquivo"]).read_bytes()
        self.assertEqual(hashlib.sha256(data).hexdigest(), record["sha256_webp"])
        self.assertEqual(record["numero_no_caderno"], 12)
        with Image.open(io.BytesIO(data)) as image:
            image.load()
            self.assertEqual(image.format, "WEBP")
            self.assertEqual(image.size, (648, 488))

    def test_uses_the_pdf_letter_and_requires_answer_key(self):
        alternative = dict(self.entry, letter="A", slot_bounds=[20, 54, 198, 199],
                           label_bounds=[20, 54, 52, 74],
                           answer_key_url="https://example.com/key.pdf", official_answer="A")
        self.assertEqual(self.run_entries(alternative)[0]["posicao"], "alternativa-A")
        with self.assertRaisesRegex(ValueError, "disagrees with the selected letter"):
            self.run_entries(dict(alternative, letter="B"))
        with self.assertRaisesRegex(ValueError, "answer key evidence"):
            self.run_entries(dict(alternative, answer_key_url=""))

    def test_refuses_wrong_pdf_hash(self):
        self.source["pdf_sha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "SHA-256 mismatch"):
            self.run_entries(self.entry)
        self.assertFalse(self.output.exists())

    def test_binds_ocr_evidence_to_the_exact_rendered_region(self):
        phrase = "O texto desta pagina foi identificado apos o reconhecimento optico"
        with pymupdf.open(self.pdf) as doc:
            rendered = doc[0].get_pixmap(
                matrix=pymupdf.Matrix(2.1, 2.1), clip=pymupdf.Rect(self.entry["question_bounds"]),
                alpha=False, colorspace=pymupdf.csRGB,
            )
        evidence = {"text": phrase, "region_sha256": hashlib.sha256(rendered.samples).hexdigest()}
        entry = dict(self.entry, anchor=phrase, ocr=evidence)
        self.assertEqual(len(self.run_entries(entry)), 1)
        evidence["region_sha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "different rendered region"):
            self.run_entries(entry)

    def test_refuses_text_from_a_different_question(self):
        wrong = dict(self.entry, anchor="Outra questao abaixo deve ficar fora da regiao da figura")
        with self.assertRaisesRegex(ValueError, "anchor absent"):
            self.run_entries(wrong)
        with self.assertRaisesRegex(ValueError, "Printed question number"):
            self.run_entries(dict(self.entry, question_number=13))

    def test_refuses_outside_crop_or_crop_missing_image(self):
        with self.assertRaisesRegex(ValueError, "Rectangle outside"):
            self.run_entries(dict(self.entry, crop=[15, 40, 180, 235]))
        with self.assertRaisesRegex(ValueError, "indicated image"):
            self.run_entries(dict(self.entry, crop=[40, 80, 160, 181]))

    def test_refuses_duplicate_slot_before_writing(self):
        with self.assertRaisesRegex(ValueError, "Duplicate question image"):
            self.run_entries(self.entry, copy.deepcopy(self.entry))
        self.assertFalse(self.output.exists())

    def test_preserves_output_with_different_content(self):
        [record] = self.run_entries(self.entry)
        existing = self.output / record["arquivo"]
        existing.write_bytes(b"existing artwork")
        with self.assertRaisesRegex(ValueError, "different content"):
            self.run_entries(self.entry)
        self.assertEqual(existing.read_bytes(), b"existing artwork")


if __name__ == "__main__":
    unittest.main()
