"""Build a review-only report from a pending Supabase sample and official PDFs."""

import argparse
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from hashlib import sha256
from html import unescape
import json
from pathlib import Path
import re
import sqlite3
import unicodedata

from pymupdf import FileDataError
from pypdf.errors import PdfReadError

from official_answer_key_pdfs import fetch_sources, parse_booklet, parse_key


VISUAL = re.compile(
    r"!\[|\[imagem\b|<(?:img|table)\b|"
    r"\b(?:imagem|figura|gráfico|tabela|quadro|radiografia|traçado)"
    r"\s+(?:abaixo|acima|a seguir|apresentad[oa]|aqui|\d+)\b",
    re.I,
)
ORDER_DEPENDENT = re.compile(
    r"\b(?:todas|nenhuma|ambas)\s+(?:d[aeo]s?\s+)?(?:as\s+)?(?:alternativas\s+)?"
    r"(?:anteriores|acima|abaixo)\b|"
    r"\b(?:alternativas?|opções?)\s+[\x22“(]?[A-E]\b|"
    r"\b[A-E]\s+(?:e|ou)\s+[A-E]\s+(?:est[aã]o|são|corretas?)\b",
    re.I,
)
STATUS_LABELS = {
    "alternativas_divergentes": "Alternativas divergentes",
    "conferencia_visual": "Conferência visual ou de texto compartilhado",
    "dependencia_da_ordem": "Alternativas dependentes da ordem",
    "divergencia_com_extracao_local": "Divergência com a extração local",
    "divergencia_entre_cadernos": "Divergência entre cadernos ou edições",
    "documento_definitivo_nao_verificado": "Documento definitivo sem verificação",
    "enunciado_sem_equivalencia_exata": "Enunciado sem equivalência exata",
    "gabarito_incompativel": "Gabarito incompatível",
    "multiplos_impedimentos": "Múltiplos impedimentos",
    "proposta_para_revisao": "Proposta para revisão",
    "sem_alternativas_completas": "Sem alternativas completas",
    "sem_caderno_catalogado": "Sem caderno catalogado",
    "sem_caderno_extraido": "Sem extração do caderno",
    "sem_enunciado": "Sem enunciado",
    "sem_gabarito_definitivo": "Sem gabarito definitivo",
}


def canonical(raw):
    return " ".join(unicodedata.normalize("NFC", unescape(raw)).split())


def decode_options(value):
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return {}
    if not isinstance(value, list) or len(value) not in {4, 5}:
        return {}
    options = {}
    for option in value:
        if not isinstance(option, dict):
            return {}
        letter, raw = option.get("letter"), option.get("text")
        if not isinstance(letter, str) or not isinstance(raw, str) or not canonical(raw) or letter in options:
            return {}
        if any(option.get(key) for key in ("image_url", "imageUrl", "images", "image")):
            return {}
        options[letter] = raw
    return options if set(options) == set("ABCDE"[:len(value)]) else {}


def content_map(official, platform):
    official_text = {letter: canonical(raw) for letter, raw in official.items()}
    platform_text = {canonical(raw): letter for letter, raw in platform.items()}
    if (len(set(official_text.values())) != len(official) or len(platform_text) != len(platform)
            or "" in platform_text or set(official_text.values()) != set(platform_text)):
        return None
    return {letter: platform_text[raw] for letter, raw in official_text.items()}


def same_scope(question, source):
    return all(question[field] == source[key] for field, key in (
        ("banca", "board"), ("institution", "institution"), ("year", "year"), ("modalidade", "modality")
    ))


def digest_content(question):
    fields = [question.get(key) for key in ("statement", "options", "images")]
    return sha256(json.dumps(fields, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def read_internal_keys(path):
    with sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True) as connection:
        return connection.execute("""
            SELECT d.sha256, g.versao_caderno, q.numero_questao, UPPER(q.alternativa)
            FROM questoes_gabarito AS q
            JOIN gabaritos AS g ON g.id = q.gabarito_id
            JOIN documentos AS d ON d.id = g.documento_id
            WHERE g.valido = 1 AND g.tipo_gabarito = 'definitivo' AND q.status_validacao = 'validado'
        """).fetchall()


def read_bank_clues(path, questions):
    aliases = {"UNICAMP/HC": "UNICAMP"}
    scopes = {(aliases.get(q["banca"], q["banca"]), q["year"]) for q in questions}
    index = defaultdict(list)
    with sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True) as connection:
        for board, year in sorted(scopes):
            for row in connection.execute("""
                SELECT id, tipo_prova, numero, enunciado, opcoes_json, gabarito FROM questmed_questions
                WHERE banca = ? AND ano = ?
            """, (board, year)):
                item_id, modality, number, statement, options, answer = row
                if statement and modality:
                    if modality.startswith("R+ "):
                        modality = "R+"
                    try:
                        options = json.loads(options or "null")
                    except json.JSONDecodeError:
                        continue
                    if isinstance(options, dict):
                        options = [{"letter": letter, "text": raw} for letter, raw in options.items()]
                    index[board, year, modality, canonical(statement)].append((item_id, number, options, answer))
    result = {}
    for question in questions:
        board = aliases.get(question["banca"], question["banca"])
        options = decode_options(question["options"])
        scope = (board, question["year"], question["modalidade"], canonical(question["statement"] or ""))
        result[question["id"]] = []
        for item_id, number, raw_options, answer in index.get(scope, []):
            mapping = content_map(decode_options(raw_options), options) if options else None
            if mapping:
                result[question["id"]].append({"fonte": "questmed_extracted_exams.db", "id": item_id,
                                                "numero": number, "letra_candidata": mapping.get(answer)})
    return result


def load_catalog(catalog, documents):
    entries = []
    for source in catalog:
        evidence = {}
        parsed = {}
        for kind, parser in (("exam", parse_booklet), ("key", parse_key)):
            document, download_issue = documents[source["id"], kind]
            summary = {"url": source[kind]["url"], "itens": 0}
            if kind == "key":
                summary["status"] = source[kind]["status"]
            if download_issue:
                summary["falha_online"] = download_issue
            if document:
                summary.update(document.evidence())
                try:
                    parsed[kind] = parser(document, source)
                    summary["itens"] = len(parsed[kind])
                    if kind == "exam":
                        summary["itens_com_alternativas"] = sum(bool(item.options) for item in parsed[kind])
                except (FileDataError, PdfReadError, ValueError) as error:
                    summary["falha_extracao"] = str(error)
            evidence[kind] = summary
        entries.append((source, parsed.get("exam", []), parsed.get("key", {}), evidence))
    return entries


def closest_item(statement, entries):
    words = statement.split()
    candidates = (
        (SequenceMatcher(None, words, canonical(item.statement).split()).ratio(), source, item)
        for source, items, _, _ in entries for item in items
    )
    closest = max(candidates, key=lambda result: result[0], default=None)
    if closest and closest[0] >= 0.70:
        score, source, item = closest
        return {"fonte": source["id"], "numero": item.number, "paginas": item.pages,
                "similaridade_enunciado": round(score, 4)}
    return None


def audit_question(question, entries, local_by_sha, bank_clues):
    result = {key: question[key] for key in (
        "id", "code", "institution", "banca", "year", "modalidade", "especialidade", "table", "updated_at"
    )}
    result.update({"sha256_conteudo_supabase": digest_content(question), "proposta": None,
                   "evidencias": [], "pistas_banco_local": bank_clues.get(question["id"], [])})

    def finish(status):
        return {**result, "situacao": status}

    platform = decode_options(question["options"])
    if question["type"] != "Múltipla escolha" or not platform:
        return finish("sem_alternativas_completas")
    statement = canonical(question["statement"] or "")
    all_text = "\n".join([statement, *platform.values()])
    if not statement:
        return finish("sem_enunciado")
    images = question.get("images")
    if images not in (None, "", "[]", []) or VISUAL.search(all_text):
        return finish("conferencia_visual")
    if ORDER_DEPENDENT.search(all_text):
        return finish("dependencia_da_ordem")

    scoped = [entry for entry in entries if same_scope(question, entry[0])]
    if not scoped:
        return finish("sem_caderno_catalogado")
    if not any(items for _, items, _, _ in scoped):
        return finish("sem_caderno_extraido")
    matching_statement = False
    blockers = set()
    for source, items, answers, documents in scoped:
        for item in items:
            if statement != canonical(item.statement):
                continue
            matching_statement = True
            mapping = content_map(item.options, platform)
            if not mapping:
                continue
            key = answers.get(item.number, {})
            answer = key.get("letra")
            status = "definitivo"
            if item.visual_or_shared or VISUAL.search("\n".join([item.statement, *item.options.values()])):
                status = "conferencia_visual"
            elif source["key"]["status"] != "definitivo":
                status = "sem_gabarito_definitivo"
            elif not answer or not all(documents[kind].get("origem_verificada") for kind in ("exam", "key")):
                status = "documento_definitivo_nao_verificado"
            elif answer != "ANULADA" and answer not in mapping:
                status = "gabarito_incompativel"
            cached = local_by_sha.get(documents["key"].get("sha256"), [])
            local = [letter for version, number, letter in cached
                     if version == source["booklet"] and number == item.number]
            if status == "definitivo" and any(letter != answer for letter in local):
                status = "divergencia_com_extracao_local"
            mapped = answer if answer == "ANULADA" else mapping.get(answer)
            result["evidencias"].append({
                "fonte": source["id"], "publicacao": source["publication"],
                "edicao": source["edition"], "caderno": source["booklet"], "numero": item.number,
                "paginas_prova": item.pages, "pagina_gabarito": key.get("pagina"), "documentos": documents,
                "letra_oficial": answer, "letra_supabase": mapped,
                "alternativa_oficial": item.options.get(answer), "alternativa_supabase": platform.get(mapped),
                "mapeamento_completo": mapping, "respostas_indice_local": local, "situacao": status,
            })
            if status != "definitivo":
                blockers.add(status)

    if not result["evidencias"]:
        result["pista_caderno"] = closest_item(statement, scoped)
        return finish("alternativas_divergentes" if matching_statement else "enunciado_sem_equivalencia_exata")
    if blockers:
        return finish(sorted(blockers)[0] if len(blockers) == 1 else "multiplos_impedimentos")
    proposals = {entry["letra_supabase"] for entry in result["evidencias"]}
    editions = {entry["edicao"] for entry in result["evidencias"]}
    if len(proposals) != 1 or len(editions) != 1:
        return finish("divergencia_entre_cadernos")
    result["proposta"] = proposals.pop()
    return finish("proposta_para_revisao")


def write_report(path, sample, entries, results, indexed_keys):
    status = Counter(q["situacao"] for q in results)
    proposed = [q for q in results if q["proposta"]]
    remapped = sum(
        any(e["letra_oficial"] != e["letra_supabase"] for e in q["evidencias"]) for q in proposed
    )
    document_summary = {source["id"]: evidence for source, _, _, evidence in entries}
    report = {
        "amostra_capturada_em": sample["captured_at"], "recorte": sample["cohorts"],
        "total": len(results), "situacoes": dict(status), "propostas_com_remapeamento": remapped,
        "gabaritos_definitivos_validados_no_indice_local": indexed_keys,
        "pistas_banco_local": sum(bool(q["pistas_banco_local"]) for q in results),
        "fontes": document_summary, "questoes": results,
    }
    path.with_suffix(".json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    title = "Coleta de gabaritos oficiais" if sample.get("mode") == "integral" else "Piloto de homologação oficial de gabaritos"
    lines = [f"# {title}", "",
             f"{len(results)} questões consultadas. {len(proposed)} propostas para revisão humana. "
             f"{remapped} propostas com remapeamento em pelo menos um caderno.", "",
             "Consulta ao Supabase em modo somente leitura.", "",
             "| Banca | Questões | Propostas | Pendentes |", "|---|---:|---:|---:|"]
    accepted_by_board = Counter(q["banca"] for q in proposed)
    for board, count in Counter(q["banca"] for q in results).most_common():
        accepted = accepted_by_board[board]
        lines.append(f"| {board} | {count} | {accepted} | {count - accepted} |")
    by_specialty = Counter(q["especialidade"] for q in results)
    lines.extend(["", "## Resultado por especialidade", "",
                  "| Especialidade | Amostra | Propostas | Pendentes |", "|---|---:|---:|---:|"])
    for specialty, count in by_specialty.most_common():
        accepted = sum(q["especialidade"] == specialty for q in proposed)
        lines.append(f"| {specialty or 'Sem especialidade'} | {count} | {accepted} | {count - accepted} |")
    lines.extend(["", "## Motivos das pendências", ""])
    lines.extend(f"- {STATUS_LABELS[label]}: {count}"
                 for label, count in status.most_common() if label != "proposta_para_revisao")
    lines.extend(["", "## Resultado por questão", "",
                  "| Código | Banca | Situação | Proposta | Caderno e questão |",
                  "|---|---|---|---|---|"])
    for q in results:
        evidence = ", ".join(f'{e["edicao"]} {e["caderno"]} · Q{e["numero"]}'
                             for e in q["evidencias"])
        lines.append(f'| {q["code"]} | {q["banca"]} | {STATUS_LABELS[q["situacao"]]} | '
                     f'{q["proposta"] or "—"} | {evidence or "—"} |')
    path.with_suffix(".md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in ("total", "situacoes", "propostas_com_remapeamento")},
                     ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sample", required=True, type=Path)
    parser.add_argument("--catalog", type=Path, default=Path(__file__).with_name("official_answer_key_pilot.json"))
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--internal-keys", type=Path, default=Path("data/gabaritos_nacional.db"))
    parser.add_argument("--question-bank", type=Path, default=Path("data/questmed_extracted_exams.db"))
    args = parser.parse_args()
    sample = json.loads(args.sample.read_text(encoding="utf-8"))
    questions = sample["questions"]
    if len({q["id"] for q in questions}) != len(questions) or any(
        q.get("has_gabarito") is not False or q.get("is_anulada") is True for q in questions
    ):
        parser.error("A amostra precisa conter somente questões pendentes e sem IDs repetidos")
    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    sources = [source for source in catalog if any(same_scope(q, source) for q in questions)]
    key_rows = read_internal_keys(args.internal_keys)
    local_by_sha = defaultdict(list)
    for digest, *row in key_rows:
        local_by_sha[digest].append(row)
    clues = read_bank_clues(args.question_bank, questions)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    entries = load_catalog(sources, fetch_sources(sources, args.output.parent / "pdfs"))
    results = [audit_question(q, entries, local_by_sha, clues) for q in questions]
    write_report(args.output, sample, entries, results, len(key_rows))


if __name__ == "__main__":
    main()
