#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ferramenta automatizada de busca, curadoria, download e conversão para WebP
de imagens médicas de Domínio Público e Licenças Livres (CC0 / CC-BY).

Fontes Exclusivas Autorizadas:
1. Wikimedia Commons (inclui CDC PHIL, MedPix público, anatomia e lâminas)
2. ISIC Archive (Dermatologia, lesões de pele, dermatoscopia - CC0)
"""

import argparse
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from typing import Dict, List, Optional
from PIL import Image

USER_AGENT = "BancoResidenciaMedicalBot/1.0 (medicina@bancoresidencia.med.br)"
DEFAULT_OUTPUT_DIR = os.path.join("public", "images", "medical")

ALLOWED_LICENSES = [
    "public domain",
    "cc0",
    "cc-zero",
    "cc by",
    "cc-by",
    "cc by 3.0",
    "cc by 4.0",
    "cc by-sa 3.0",
    "cc by-sa 4.0",
    "open access",
]


def clean_html(raw_html: str) -> str:
    """Remove tags HTML simples de descrições e autores."""
    if not raw_html:
        return ""
    clean = re.sub(r"<[^>]+>", "", raw_html)
    return " ".join(clean.split())


def search_wikimedia(query: str, limit: int = 5) -> List[Dict]:
    """Busca imagens médicas no Wikimedia Commons (incluindo espelhos CDC PHIL e MedPix)."""
    search_term = f"{query} filetype:bitmap"
    params = {
        "action": "query",
        "generator": "search",
        "gsrnamespace": "6",  # Namespace File:
        "gsrsearch": search_term,
        "gsrlimit": str(limit * 2),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "format": "json",
    }
    url = f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    results = []
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for pid, page in pages.items():
                imageinfo = page.get("imageinfo", [{}])[0]
                meta = imageinfo.get("extmetadata", {})
                license_name = meta.get("LicenseShortName", {}).get("value", "")
                license_lower = license_name.lower()

                # Valida apenas licenças 100% livres
                is_allowed = any(al in license_lower for al in ALLOWED_LICENSES)
                if not is_allowed and "pd" not in license_lower:
                    continue

                artist = clean_html(meta.get("Artist", {}).get("value", "Autor desconhecido"))
                credit = clean_html(meta.get("Credit", {}).get("value", ""))
                description = clean_html(meta.get("ImageDescription", {}).get("value", ""))
                if not description:
                    description = page.get("title", "").replace("File:", "").replace(".jpg", "").replace(".png", "")

                source_name = "Wikimedia Commons"
                if "PHIL" in page.get("title", "") or "CDC" in credit or "CDC" in artist:
                    source_name = "CDC / PHIL (Public Health Image Library)"
                elif "MedPix" in page.get("title", "") or "MedPix" in credit:
                    source_name = "MedPix / NLM"

                results.append({
                    "source": source_name,
                    "title": page.get("title", "").replace("File:", ""),
                    "image_url": imageinfo.get("url"),
                    "page_url": imageinfo.get("descriptionurl", ""),
                    "width": imageinfo.get("width"),
                    "height": imageinfo.get("height"),
                    "license": license_name or "Domínio Público / CC",
                    "author": artist or "Desconhecido",
                    "credit": credit,
                    "description": description[:180] + ("..." if len(description) > 180 else "")
                })
                if len(results) >= limit:
                    break
    except Exception as e:
        print(f"[Aviso] Erro ao consultar Wikimedia: {e}", file=sys.stderr)

    return results


def search_isic(query: str, limit: int = 5) -> List[Dict]:
    """Busca lesões de pele e dermatoscopia no ISIC Archive (CC0)."""
    # Mapeia termos comuns para queries de diagnóstico do ISIC
    query_clean = query.lower().strip()
    isic_query = query_clean
    if "melanoma" in query_clean:
        isic_query = "diagnosis:melanoma"
    elif "carcinoma" in query_clean or "cbc" in query_clean:
        isic_query = "diagnosis:basal cell carcinoma"
    elif "nevo" in query_clean or "nevus" in query_clean:
        isic_query = "diagnosis:nevus"

    url = f"https://api.isic-archive.com/api/v2/images/?query={urllib.parse.quote(isic_query)}&limit={limit}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    results = []
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
            for item in data.get("results", []):
                isic_id = item.get("isic_id")
                img_url = item.get("files", {}).get("full", {}).get("url")
                clinical = item.get("metadata", {}).get("clinical", {})
                diag = clinical.get("diagnosis_5") or clinical.get("diagnosis_4") or clinical.get("diagnosis_3") or clinical.get("diagnosis_1") or "Lesão cutânea"
                site = clinical.get("anatom_site_1", "Localização cutânea")

                results.append({
                    "source": "ISIC Archive (International Skin Imaging Collaboration)",
                    "title": f"Dermatoscopia - {diag} ({isic_id})",
                    "image_url": img_url,
                    "page_url": f"https://www.isic-archive.com/image/{isic_id}",
                    "width": item.get("metadata", {}).get("pixels_x"),
                    "height": item.get("metadata", {}).get("pixels_y"),
                    "license": item.get("copyright_license", "CC-0"),
                    "author": item.get("attribution", "ISIC Archive Collaborators"),
                    "credit": f"ISIC ID: {isic_id} - Região: {site}",
                    "description": f"Dermatoscopia de {diag} em {site}. ISIC ID {isic_id}."
                })
    except Exception as e:
        print(f"[Aviso] Erro ao consultar ISIC: {e}", file=sys.stderr)

    return results


def download_and_convert_to_webp(image_url: str, output_path: str, quality: int = 88) -> bool:
    """Baixa a imagem da URL oficial e converte diretamente para WebP otimizado."""
    try:
        req = urllib.request.Request(image_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=20) as resp:
            image_data = resp.read()

        image = Image.open(io.BytesIO(image_data))

        # Trata modos de cor para salvar em WebP com fidelidade diagnóstica
        if image.mode in ("RGBA", "LA"):
            # Mantém alpha se for transparente ou converte fundo branco
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode != "RGB":
            image = image.convert("RGB")

        # Garante diretório pai
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        image.save(output_path, "WEBP", quality=quality, method=6)
        return True
    except Exception as e:
        print(f"[Erro] Falha ao baixar ou converter imagem: {e}", file=sys.stderr)
        return False


def build_markdown_citation(img_meta: Dict, local_rel_path: str) -> str:
    """Gera a citação normativa completa em Markdown compatível com a plataforma."""
    # Para o Next.js, arquivos dentro de public/ são acessados a partir da raiz '/'
    norm_path = local_rel_path.replace("\\", "/").lstrip("/")
    if norm_path.startswith("public/"):
        web_path = "/" + norm_path[len("public/"):]
    else:
        web_path = "/" + norm_path

    title = img_meta.get("title", "Imagem médica")
    desc = img_meta.get("description", title)
    source = img_meta.get("source", "Domínio Público")
    author = img_meta.get("author", "Autor não especificado")
    license_str = img_meta.get("license", "Livre / Domínio Público")
    orig_url = img_meta.get("page_url") or img_meta.get("image_url")

    md = (
        f"![{title}]({web_path})\n\n"
        f"*{desc}*\n\n"
        f"**Fonte:** {source} | **Autor:** {author} | **Licença:** {license_str} | [Ver registro original]({orig_url})"
    )
    return md


def build_flashcard_citation(img_meta: Dict, local_rel_path: str) -> Dict[str, str]:
    """Formata os campos de imagem e citação compacta para a interface FlashcardItem."""
    norm_path = local_rel_path.replace("\\", "/").lstrip("/")
    web_path = "/" + (norm_path[len("public/"):] if norm_path.startswith("public/") else norm_path)
    source = img_meta.get("source", "Domínio Público")
    license_str = img_meta.get("license", "CC / DP")
    author = img_meta.get("author", "Autor desconhecido")

    return {
        "imageUrl": web_path,
        "imageFrontUrl": web_path,
        "compact_citation": f"Fonte: {source} ({author}) | Licença: {license_str}"
    }


def build_dica_do_dia_format(img_meta: Dict, local_rel_path: str, query: str) -> str:
    """Gera um bloco formatado para a Dica do Dia com ênfase semiológica e retenção rápida."""
    norm_path = local_rel_path.replace("\\", "/").lstrip("/")
    web_path = "/" + (norm_path[len("public/"):] if norm_path.startswith("public/") else norm_path)
    title = img_meta.get("title", query.title())
    source = img_meta.get("source", "Domínio Público")
    author = img_meta.get("author", "Autor não especificado")
    license_str = img_meta.get("license", "Livre / Domínio Público")
    orig_url = img_meta.get("page_url") or img_meta.get("image_url")

    return (
        f"> [!TIP] **Pérola Médica / Dica do Dia: {query.title()}**\n"
        f">\n"
        f"> ![{title}]({web_path})\n"
        f">\n"
        f"> *Achado Semiológico de Alto Rendimento para Provas.*\n"
        f">\n"
        f"> <small>**Crédito:** {source} | **Autor:** {author} | **Licença:** {license_str} | [Registro]({orig_url})</small>"
    )


def main():
    parser = argparse.ArgumentParser(description="Busca e download de imagens médicas de domínio público / CC-BY.")
    parser.add_argument("--search", "-s", type=str, help="Termo de busca em inglês ou português (ex: pneumothorax, melanoma, appendicitis)")
    parser.add_argument("--source", choices=["wikimedia", "isic", "all"], default="all", help="Fonte da busca")
    parser.add_argument("--limit", "-l", type=int, default=5, help="Quantidade máxima de resultados")
    parser.add_argument("--download-url", "-d", type=str, help="URL direta da imagem para baixar e converter")
    parser.add_argument("--meta-json", type=str, help="JSON com metadados para gerar a citação")
    parser.add_argument("--output", "-o", type=str, help="Caminho de saída para o arquivo .webp (relativo a public/)")
    parser.add_argument("--quick", "-q", type=str, help="Busca o melhor resultado, baixa, converte para WebP e cospe o formato desejado")
    parser.add_argument("--context", choices=["resumo", "flashcard", "dica", "raw"], default="resumo", help="Contexto de uso para formatar a saída")

    args = parser.parse_args()

    if args.search:
        results = []
        if args.source in ("wikimedia", "all"):
            results.extend(search_wikimedia(args.search, limit=args.limit))
        if args.source in ("isic", "all"):
            results.extend(search_isic(args.search, limit=args.limit))

        print(json.dumps(results, indent=2, ensure_ascii=False))
        return

    if args.quick:
        query = args.quick
        results = []
        # Tenta ISIC se for tema dermatológico, senão Wikimedia
        if any(d in query.lower() for d in ["melanoma", "carcinoma", "nevo", "nevus", "dermatoscop"]):
            results.extend(search_isic(query, limit=1))
        if not results:
            results.extend(search_wikimedia(query, limit=2))

        if not results:
            print(json.dumps({"error": f"Nenhuma imagem livre encontrada para '{query}'"}, ensure_ascii=False))
            sys.exit(1)

        best = results[0]
        safe_name = re.sub(r"[^a-zA-Z0-9_-]", "_", query.lower())[:30] + ".webp"
        out_rel = os.path.join(DEFAULT_OUTPUT_DIR, safe_name)
        if args.output:
            out_rel = args.output if args.output.endswith(".webp") else args.output + ".webp"

        success = download_and_convert_to_webp(best["image_url"], out_rel)
        if success:
            citation_md = build_markdown_citation(best, out_rel)
            dica_md = build_dica_do_dia_format(best, out_rel, query)
            flashcard_data = build_flashcard_citation(best, out_rel)

            output = {
                "success": True,
                "local_path": out_rel,
                "context": args.context,
                "citation_markdown": citation_md,
                "dica_do_dia_markdown": dica_md,
                "flashcard_fields": flashcard_data,
                "metadata": best
            }
            print(json.dumps(output, indent=2, ensure_ascii=False))
        else:
            print(json.dumps({"error": "Falha no download/conversão"}, ensure_ascii=False))
            sys.exit(1)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
