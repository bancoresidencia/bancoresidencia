"""Collect the official FAUSCS 2026 key while its matching booklet is missing."""

import argparse
from io import BytesIO
import json
from pathlib import Path
import re

from pypdf import PdfReader

from official_answer_key_pdfs import load_document


PUBLICATION = "https://fauscs.selecao.net.br/informacoes/29/"
URL = "https://anexos.cdn.selecao.net.br/uploads/325/concursos/29/anexos/92914b52-fc7a-4fd1-86f5-24bdad4c5164.pdf"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    document, issue = load_document({"url": URL}, args.output.parent / "pdfs")
    if not document or not document.verified:
        parser.error(f"Falha na coleta do gabarito oficial: {issue}")
    source = PdfReader(BytesIO(document.data)).pages[0].extract_text(extraction_mode="layout")
    if "GABARITO DEFINITIVO DA PROVA OBJETIVA" not in source or "2026" not in source:
        parser.error("Cabeçalho oficial divergente")
    rows = []
    for line in source.splitlines():
        if re.fullmatch(r"\s*(?:\d{1,3}\s+[A-DX]\s+){3}\d{1,3}\s+[A-DX]\s*", line):
            rows.append([(int(number), answer) for number, answer in re.findall(r"(\d+)\s+([A-DX])", line)])
    if [[number for number, _ in row] for row in rows] != [
        [i, i + 25, i + 50, i + 75] for i in range(1, 26)
    ]:
        parser.error("A numeração da grade não corresponde ao formato oficial")
    report = {
        "publicacao": PUBLICATION,
        "edicao": 2026,
        "documento": document.evidence(),
        "situacao": "gabarito_definitivo_sem_caderno_correspondente",
        "respostas": dict(sorted(pair for row in rows for pair in row)),
    }
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(report['respostas'])} respostas oficiais extraídas do gabarito FAUSCS.")


if __name__ == "__main__":
    main()
