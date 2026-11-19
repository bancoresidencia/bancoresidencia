"""Prioritize official portals and existing full-content gabarito records for review."""

import argparse
from collections import defaultdict
import json
from pathlib import Path
from urllib.parse import urlsplit

from audit_official_answer_keys import canonical, content_map, decode_options


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sample", type=Path)
    parser.add_argument("report", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    sample = read(args.sample)
    resolved = {q["id"] for q in read(args.report)["questoes"] if q["proposta"]}
    existing = defaultdict(list)
    for row in read(Path("data/all_homologated_questions_gold.json")):
        if isinstance(row.get("statement"), str):
            scope = (row["banca"], row["institution"], row["year"], row["modalidade"])
            existing[scope, canonical(row["statement"])].append(row)
    portals = defaultdict(set)
    for row in read(Path("data/fase2_motor_manifest.json")):
        url = row.get("portal_oficial")
        if isinstance(url, str) and urlsplit(url).scheme == "https" and urlsplit(url).hostname:
            portals[row["banca"], row["ano"]].add(url)

    groups = defaultdict(list)
    matches = []
    for question in sample["questions"]:
        if question["id"] in resolved:
            continue
        scope = (question["banca"], question["institution"], question["year"], question["modalidade"])
        groups[scope].append(question["id"])
        options = decode_options(question["options"])
        if not options or not question["statement"]:
            continue
        for row in existing.get((scope, canonical(question["statement"])), []):
            mapping = content_map(decode_options(row["options"]), options)
            if mapping and row.get("correct_answer") in mapping:
                matches.append({"id": question["id"], "code": question["code"], "id_acervo": row["id"],
                                "letra_candidata": mapping[row["correct_answer"]], "origem": row.get("official_audit")})
    backlog = [
        {"banca": board, "instituicao": institution, "ano": year, "modalidade": modality,
         "questoes": len(ids), "ids": ids, "portais_do_manifesto": sorted(portals[board, year])}
        for (board, institution, year, modality), ids in sorted(groups.items(), key=lambda item: -len(item[1]))
    ]
    result = {"grupos": backlog, "coincidencias_no_acervo_para_revisao": matches}
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(backlog)} grupos pendentes; {len({m['id'] for m in matches})} questões com pistas no manifesto de gabaritos.")


if __name__ == "__main__":
    main()
