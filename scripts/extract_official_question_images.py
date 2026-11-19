"""Export reviewed crops from official Acesso Direto PDFs to local WebP files."""

import argparse
import hashlib
import io
import json
import math
import os
import re
import tempfile
import unicodedata
from contextlib import ExitStack
from pathlib import Path
from urllib.parse import urlsplit
from uuid import UUID

import pymupdf
from PIL import Image


def normalize(text):
    joined = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", text)
    plain = unicodedata.normalize("NFKD", joined.casefold())
    return re.findall(r"[a-z0-9]+", "".join(c for c in plain if not unicodedata.combining(c)))


def contains_words(text, phrase):
    return f" {' '.join(phrase)} " in f" {' '.join(text)} "


def checked_rect(values, parent):
    if not isinstance(values, list) or len(values) != 4:
        raise ValueError("Expected four PDF coordinates")
    if not all(type(number) in (int, float) and math.isfinite(number) for number in values):
        raise ValueError("Invalid PDF coordinates")
    rect = pymupdf.Rect(values)
    if rect.is_empty or not parent.contains(rect):
        raise ValueError("Rectangle outside its parent")
    return rect


def is_https(value):
    parsed = urlsplit(value)
    return parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username and not parsed.password


def export_crop(document, entry, source):
    page_number = entry["page"]
    number = entry["question_number"]
    if type(page_number) is not int or not 1 <= page_number <= len(document):
        raise ValueError("Invalid source page")
    if type(number) is not int or not 1 <= number <= 300:
        raise ValueError("Invalid printed question number")
    page = document[page_number - 1]
    question = checked_rect(entry["question_bounds"], page.rect)
    region_text = normalize(page.get_text(clip=question, sort=True))
    title = next((token for token in region_text[:3] if token.isdigit()), "")
    if not title or int(title) != number:
        raise ValueError("Printed question number disagrees with the selected region")
    anchor = normalize(entry["anchor"])
    if len(anchor) < 9:
        raise ValueError("Question anchor is too short")
    if not contains_words(region_text, anchor):
        ocr = entry.get("ocr")
        if not ocr or not contains_words(normalize(ocr["text"]), anchor):
            raise ValueError("Question anchor absent from the selected region")
        pixels = page.get_pixmap(matrix=pymupdf.Matrix(2.1, 2.1), clip=question, alpha=False,
                                 colorspace=pymupdf.csRGB)
        if hashlib.sha256(pixels.samples).hexdigest() != ocr["region_sha256"]:
            raise ValueError("OCR evidence belongs to a different rendered region")
    if not entry["review_note"].strip():
        raise ValueError("A visual review note is required")

    letter = entry.get("letter")
    placement = question
    if letter is not None:
        if letter not in ("A", "B", "C", "D", "E"):
            raise ValueError("Invalid alternative letter")
        placement = checked_rect(entry["slot_bounds"], question)
        label = checked_rect(entry["label_bounds"], placement)
        labels = normalize(page.get_text(clip=label))
        if not labels or labels[0] != letter.lower():
            raise ValueError("Printed alternative disagrees with the selected letter")
        slot_labels = re.findall(r"^\s*\(?([A-E])[).]\s*$", page.get_text(clip=placement), flags=re.M)
        if slot_labels != [letter]:
            raise ValueError("Alternative region must contain only its own label")
        if not is_https(entry["answer_key_url"]) or entry["official_answer"] not in ("A", "B", "C", "D", "E", "ANULADA"):
            raise ValueError("Official answer key evidence is required")
        slot = f"alternativa-{letter}"
    else:
        index = entry["figure"]
        if type(index) is not int or not 1 <= index <= 30:
            raise ValueError("Invalid figure index")
        slot = f"figura-{index:02}"

    crop = checked_rect(entry["crop"], placement)
    images = page.get_image_info(xrefs=True)
    for xref in entry.get("xrefs", []):
        if type(xref) is not int or xref < 1 or not any(
            image["xref"] == xref and crop.contains(pymupdf.Rect(image["bbox"]))
            for image in images
        ):
            raise ValueError("Crop does not contain the indicated image")
    if crop.width < 16 or crop.height < 16:
        raise ValueError("Crop is too small")
    scale = min(4, 3000 / max(crop.width, crop.height))
    raster = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), clip=crop, alpha=False, colorspace=pymupdf.csRGB)
    image = Image.frombytes("RGB", (raster.width, raster.height), raster.samples)
    if all(low == high for low, high in image.getextrema()):
        raise ValueError("Crop contains no visible detail")
    result = io.BytesIO()
    image.save(result, "WEBP", lossless=True, method=5)
    data = result.getvalue()
    with Image.open(io.BytesIO(data)) as decoded:
        if decoded.format != "WEBP" or decoded.convert("RGB").tobytes() != raster.samples:
            raise ValueError("Lossless WebP round trip failed")

    record = {
        "id_questao": str(UUID(entry["question_id"])),
        "codigo": entry["code"],
        "banca": source["board"],
        "ano": source["year"],
        "numero_no_caderno": number,
        "pagina": page_number,
        "posicao": slot,
        "fonte": source["source_url"],
        "sha256_pdf": source["pdf_sha256"],
        "recorte_pontos_pdf": list(crop),
        "largura": raster.width,
        "altura": raster.height,
        "sha256_webp": hashlib.sha256(data).hexdigest(),
        "content_type": "image/webp",
        "conferencia_visual": entry["review_note"],
        "referencia_existente": entry.get("original_reference"),
        "situacao": "extraido_localmente",
    }
    if letter is not None:
        record["gabarito_oficial"] = entry["official_answer"]
        record["fonte_gabarito"] = entry["answer_key_url"]
    elif "official_answer" in entry:
        if not is_https(entry["answer_key_url"]) or entry["official_answer"] not in ("A", "B", "C", "D", "E", "ANULADA"):
            raise ValueError("Invalid official answer evidence")
        record["gabarito_oficial"] = entry["official_answer"]
        record["fonte_gabarito"] = entry["answer_key_url"]
    return record, data


def write_new_or_identical(path, data):
    if path.exists() and path.read_bytes() == data:
        return
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        temp_path = Path(stream.name)
    try:
        temp_path.write_bytes(data)
        os.link(temp_path, path)
    except FileExistsError:
        if path.read_bytes() != data:
            raise ValueError(f"Output already exists with different content: {path}") from None
    finally:
        temp_path.unlink()


def run_plan(plan_path, output):
    plan = json.loads(plan_path.read_text(encoding="utf-8-sig"))
    if plan["modality"] != "Acesso Direto" or not plan["entries"]:
        raise ValueError("The plan must contain Acesso Direto entries")
    artifacts = {}
    manifest = []
    with ExitStack() as stack:
        sources = {}
        for source in plan["sources"]:
            if source["id"] in sources or not is_https(source["source_url"]):
                raise ValueError("Invalid or duplicate source")
            local = plan_path.parent / source["pdf"]
            with local.open("rb") as stream:
                digest = hashlib.file_digest(stream, "sha256").hexdigest()
            if digest != source["pdf_sha256"]:
                raise ValueError(f"Source SHA-256 mismatch: {source['id']}")
            sources[source["id"]] = source, stack.enter_context(pymupdf.open(local))
        for entry in plan["entries"]:
            source, document = sources[entry["source_id"]]
            record, data = export_crop(document, entry, source)
            filename = f"{record['id_questao']}_{record['posicao']}.webp"
            if filename in artifacts:
                raise ValueError(f"Duplicate question image slot: {filename}")
            record["arquivo"] = filename
            artifacts[filename] = data
            manifest.append(record)
    artifacts["manifesto.json"] = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
    output.mkdir(parents=True, exist_ok=True)
    for name, data in artifacts.items():
        path = output / name
        if path.exists() and path.read_bytes() != data:
            raise ValueError(f"Output already exists with different content: {path}")
    for name, data in artifacts.items():
        write_new_or_identical(output / name, data)
    return manifest


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("plan", type=Path)
    cli.add_argument("output", type=Path)
    args = cli.parse_args()
    try:
        records = run_plan(args.plan, args.output)
    except (ValueError, KeyError, OSError) as exc:
        cli.exit(1, f"{exc}\n")
    print(f"{len(records)} arquivos WebP extraídos para {args.output}")


if __name__ == "__main__":
    main()
