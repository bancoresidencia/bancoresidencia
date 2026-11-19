"""Fetch and parse the supported official booklet and answer-key layouts."""

from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
from pathlib import Path
import json
import re
from shutil import which
from subprocess import TimeoutExpired, run
from urllib.parse import urljoin, urlsplit

import pymupdf
from pypdf import PdfReader
import requests


OFFICIAL_HOSTS = {"sistemas.institutoverbena.ufg.br", "download.inep.gov.br", "anexos.cdn.selecao.net.br"}
MAX_PDF_BYTES = 32 * 1024 * 1024
HEADING = re.compile(r"^QUESTÃO\s+(\d{1,3})\s*$")
OPTION = re.compile(r"(?m)^\s*\(([A-E])\)\s*")
SHARED = re.compile(r"\b(?:questões|itens)\s+(?:de\s+)?\d+\s*(?:a|e|até|–|-)\s*\d+", re.I)
FOOTER = re.compile(r"(?:CADERNO\s+0[12]|Revalida\s+20\d\d/[12]|ÁREA LIVRE|"
                    r"COREME SES.+PROCESSO SELETIVO|IV/UFG|"
                    r"Áreas Básicas e Especialidades de Acesso Direto \(R1\)\s*[–-]\s*Tipo [ABC])")


@dataclass
class Document:
    data: bytes
    url: str
    origin: str
    verified: bool

    @property
    def digest(self):
        return sha256(self.data).hexdigest()

    def evidence(self):
        return {"url": self.url, "sha256": self.digest, "origem": self.origin,
                "origem_verificada": self.verified}


@dataclass
class Item:
    number: int
    statement: str
    options: dict[str, str]
    pages: list[int]
    visual_or_shared: bool


def download_pdf(url):
    target = url
    for _ in range(4):
        parsed = urlsplit(target)
        if (parsed.scheme != "https" or parsed.hostname not in OFFICIAL_HOSTS
                or parsed.username or parsed.password or parsed.port not in (None, 443)):
            raise ValueError("URL de PDF fora dos domínios oficiais cadastrados")
        try:
            response = requests.get(target, timeout=(5, 12), stream=True, allow_redirects=False)
        except requests.RequestException:
            # Use the system TLS stack as a fallback without following redirects.
            curl = which("curl")
            if not curl:
                raise
            result = run([
                curl, "--disable", "--proto", "=https", "--silent", "--fail",
                "--connect-timeout", "5", "--max-time", "15", "--max-filesize", str(MAX_PDF_BYTES), target,
            ], capture_output=True, check=False, timeout=17)
            if result.returncode or not result.stdout.startswith(b"%PDF-") or len(result.stdout) > MAX_PDF_BYTES:
                raise
            return result.stdout
        with response:
            if response.is_redirect:
                target = urljoin(target, response.headers["Location"])
                continue
            if response.status_code != 200:
                raise ValueError(f"HTTP {response.status_code}")
            data = bytearray()
            for chunk in response.iter_content(65536):
                data.extend(chunk)
                if len(data) > MAX_PDF_BYTES:
                    raise ValueError("PDF acima do limite de tamanho")
            if not data.startswith(b"%PDF-"):
                raise ValueError("Resposta sem assinatura de PDF")
            return bytes(data)
    raise ValueError("Excesso de redirecionamentos")


def load_document(spec, cache):
    url = spec["url"]
    stem = sha256(url.encode()).hexdigest()
    cached_pdf = cache / f"{stem}.pdf"
    metadata = cached_pdf.with_suffix(".json")
    local = Path(spec["local"]) if spec.get("local") else None
    if metadata.exists() and cached_pdf.exists():
        data = cached_pdf.read_bytes()
        record = json.loads(metadata.read_text(encoding="utf-8"))
        if record == {"url": url, "sha256": sha256(data).hexdigest()} and data.startswith(b"%PDF-"):
            origin = ("acervo_confirmado_por_cache_oficial"
                      if local and local.is_file() and data == local.read_bytes() else "cache_oficial")
            return Document(data, url, origin, True), None

    try:
        data = download_pdf(url)
    except (requests.RequestException, TimeoutExpired, ValueError) as error:
        issue = str(error) if isinstance(error, ValueError) else type(error).__name__
        if local and local.is_file():
            return Document(local.read_bytes(), url, "acervo_sem_conferencia_online", False), issue
        return None, issue

    cache.mkdir(parents=True, exist_ok=True)
    cached_pdf.write_bytes(data)
    metadata.write_text(json.dumps({"url": url, "sha256": sha256(data).hexdigest()}), encoding="utf-8")
    origin = "acervo_confirmado_online" if local and local.is_file() and local.read_bytes() == data else "download_oficial"
    return Document(data, url, origin, True), None


def fetch_sources(catalog, cache):
    with ThreadPoolExecutor(max_workers=6) as executor:
        jobs = {
            (source["id"], kind): executor.submit(load_document, source[kind], cache)
            for source in catalog for kind in ("exam", "key")
        }
        return {key: job.result() for key, job in jobs.items()}


def page_lines(page):
    for block in page.get_text("dict", flags=pymupdf.TEXTFLAGS_TEXT)["blocks"]:
        for line in block["lines"]:
            raw = "".join(span["text"] for span in line["spans"]).strip()
            box = pymupdf.Rect(line["bbox"])
            if not raw or FOOTER.fullmatch(raw) or (raw.isdecimal() and (
                box.y0 < 45 or box.y1 > page.rect.height - 45
            )):
                continue
            yield raw, box


def parse_booklet(document, source):
    parts = {}
    regions = defaultdict(list)
    images = {}
    shared_pages = set()
    current = None
    with pymupdf.open(stream=document.data, filetype="pdf") as pdf:
        cover = " ".join(pdf[0].get_text().split())
        header = "TIPO " + source["booklet"] if source["layout"] == "verbena" else "CADERNO " + source["booklet"]
        if header not in cover.upper():
            raise ValueError("Identificação do caderno ausente da capa")
        if source["layout"] == "verbena":
            if not all(text in cover.upper() for text in ("ACESSO DIRETO", "GOIÁS – " + str(source["year"]))):
                raise ValueError("Modalidade ou ano ausente da capa")
            if ("SUPLEMENTAR" in cover.upper()) != source["edition"].endswith("suplementar"):
                raise ValueError("Processo regular ou suplementar divergente na capa")
        for page_index, page in enumerate(pdf, 1):
            page_text = page.get_text()
            if source["layout"] == "inep":
                if re.search(r"(?m)^QUESTIONÁRIO DE PERCEPÇÃO DA PROVA\s*$", page_text):
                    break
                if source["edition"] in page_text and source["edition"] not in cover:
                    cover += " " + source["edition"]
            if SHARED.search(page_text):
                shared_pages.add(page_index)
            images[page_index] = [pymupdf.Rect(image["bbox"]) for image in page.get_image_info()]
            for line, box in page_lines(page):
                heading = HEADING.fullmatch(line)
                if heading:
                    number = int(heading[1])
                    current = number if 1 <= number <= source["expected"] else None
                    if current is not None:
                        if current in parts:
                            raise ValueError(f"Número repetido no caderno: {current}")
                        parts[current] = []
                        regions[current].append((page_index, box))
                    continue
                if current is None or re.fullmatch(r"(?:\d+\.\s*)?ITEM \d+\s*-\s*V\.\s*\d+", line):
                    continue
                parts[current].append(line)
                regions[current].append((page_index, box))
    september_2026 = source["edition"] == "2026/2" and re.search(r"\bSetembro\s*\|\s*26\b", cover)
    if source["layout"] == "inep" and source["edition"] not in cover and not september_2026:
        raise ValueError("Edição do Revalida ausente no caderno")
    if set(parts) != set(range(1, source["expected"] + 1)):
        raise ValueError(f"Numeração incompleta do caderno: {len(parts)} questões")
    return [make_item(number, lines, regions[number], images, shared_pages) for number, lines in parts.items()]


def make_item(number, lines, regions, images, shared_pages):
    text = "\n".join(lines)
    matches = list(OPTION.finditer(text))
    labels = [match[1] for match in matches]
    options = {}
    if "".join(labels) in {"ABCD", "ABCDE"}:
        stops = [match.start() for match in matches[1:]] + [len(text)]
        options = {match[1]: text[match.end():stop].strip() for match, stop in zip(matches, stops)}
    bounds = {}
    for page, box in regions:
        bounds[page] = bounds[page] | box if page in bounds else pymupdf.Rect(box)
    visual = any(page in shared_pages or any(
        (box + (-3, -6, 3, 6)).intersects(image) for image in images[page]
    ) for page, box in bounds.items())
    return Item(number, text[:matches[0].start()].strip() if matches else text,
                options, list(bounds), visual)


def grid_pairs(text):
    tokens = [line.strip() for line in text.split("\n") if line.strip()]
    for start in range(len(tokens) - 9):
        numbers = tokens[start:start + 5]
        letters = tokens[start + 5:start + 10]
        if all(re.fullmatch(r"\d{1,3}", number) for number in numbers) and all(
            letter in {"A", "B", "C", "D", "E", "X"} for letter in letters
        ):
            sequence = [int(number) for number in numbers]
            if sequence == list(range(sequence[0], sequence[0] + 5)):
                yield from zip(sequence, letters)


def verify_grid_layout(document, answers):
    by_position = {}
    for page_number, page in enumerate(PdfReader(BytesIO(document.data)).pages, 1):
        lines = [line.strip() for line in page.extract_text(extraction_mode="layout").splitlines() if line.strip()]
        for numbers, letters in zip(lines, lines[1:]):
            if not re.fullmatch(r"\d{1,3}(?:\s+\d{1,3}){4}", numbers):
                continue
            if not re.fullmatch(r"[A-EX](?:\s+[A-EX]){4}", letters):
                continue
            for number, letter in zip(numbers.split(), letters.split()):
                number = int(number)
                if number in by_position:
                    raise ValueError(f"Resposta duplicada na leitura por posição: {number}")
                by_position[number] = {"letra": "ANULADA" if letter == "X" else letter, "pagina": page_number}
    if by_position != answers:
        raise ValueError("As duas leituras da grade oficial divergem")


def parse_inep_final(document, source, pages):
    if document.digest != source["key"].get("reviewed_encoding_sha256") or len(pages) != 2:
        raise ValueError("A codificação do gabarito definitivo do Inep requer revisão visual")
    # The reviewed PDFs have an incorrect ToUnicode mapping for their table font.
    glyphs = str.maketrans("ϬϭϮϯϰϱϲϳϴϵ\x04\x11\x12\x18", "0123456789ABCD")
    fields = r"(\d{1,3})[ \t]*(?:\x03[ \t]*)*([A-D])"
    reader = PdfReader(BytesIO(document.data))
    result = {}
    for index, (raw, page) in enumerate(zip(pages, reader.pages), 1):
        data = raw.translate(glyphs)
        stream = [(int(number), answer) for number, answer in re.findall(
            r"(?m)^(\d{1,3})[ \t]*\n[ \t]*(?:\x03[ \t]*)*([A-D])[ \t]*$", data
        )]
        rows = []
        for line in page.extract_text().translate(glyphs).split("\n"):
            cells = [(int(number), answer) for number, answer in re.findall(fields, line)]
            if cells:
                rows.append(cells)
        layout = [cell for row in rows for cell in row]
        expected = [start + row for row in range(20) for start in ((1, 21, 41) if index == 1 else (61, 81))]
        if stream != layout or [number for number, _ in stream] != expected:
            raise ValueError("As leituras da grade definitiva do Inep divergem")
        result.update({number: {"letra": answer, "pagina": index} for number, answer in stream})
    return result


def parse_key(document, source):
    answers = {}
    with pymupdf.open(stream=document.data, filetype="pdf") as pdf:
        pages = [page.get_text() for page in pdf]
    text = " ".join(" ".join(pages).split())
    if source["layout"] == "verbena":
        if not all(marker in text.upper() for marker in (
            "GABARITO FINAL", "PROVA TIPO " + source["booklet"], "ACESSO DIRETO", str(source["year"])
        )):
            raise ValueError("Cabeçalho de gabarito final ou tipo de caderno não confirmado")
        if ("SUPLEMENTAR" in text.upper()) != source["edition"].endswith("suplementar"):
            raise ValueError("Processo regular ou suplementar divergente no gabarito")
    elif source["key"]["status"] == "definitivo":
        return parse_inep_final(document, source, pages)
    for page, raw in enumerate(pages, 1):
        if source["layout"] == "verbena":
            pairs = grid_pairs(raw)
        else:
            if "Gabarito Preliminar" not in text:
                raise ValueError("Cabeçalho de gabarito preliminar não confirmado")
            pairs = ((int(number), answer) for number, answer in
                     re.findall(r"(?m)^(\d{1,3})[ \t]*\n([A-E])[ \t]*$", raw))
        for number, answer in pairs:
            if number in answers:
                raise ValueError(f"Resposta duplicada no gabarito: {number}")
            answers[number] = {"letra": "ANULADA" if answer == "X" else answer, "pagina": page}
    if set(answers) != set(range(1, source["expected"] + 1)):
        raise ValueError(f"Numeração incompleta do gabarito: {len(answers)} respostas")
    if source["layout"] == "verbena":
        if any(key["letra"] == "ANULADA" for key in answers.values()) and not re.search(
            r"\bX\s*[–-]\s*Questão anulada", text, re.I
        ):
            raise ValueError("Gabarito contém X sem legenda de anulação")
        verify_grid_layout(document, answers)
    return answers
