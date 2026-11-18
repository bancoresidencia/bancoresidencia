#!/usr/bin/env python3
"""
Fase 2, 3 & 4 — Master Classification & Precision Filter Enrichment Engine (v3)
Processes:
  - Onda 1: All ~132,945 MedEvo-anchored questions (100% exact UUID link to raw MedEvo JSONs)
  - Empirical Centroid Training: Builds 65k-vocab Unigram+Bigram Log-TF-IDF + Expert Keyword
    centroids across all 5 levels from the 132,945 Onda 1 questions
  - Onda 2: All ~124,166 expansion questions (Acesso Direto, R+, Revalida, Título)
  - Fase 4: Computes all Precision Search Filters (programa_rplus, banca_organizadora, uf,
    macrorregiao, has_images, image_types, commentary_tier, is_desatualizada, multi_tags)
  - Persists to local SSOT (`questions_curated_staging`) AND exports compact upload manifest
    for all 257,090 live Supabase questions.
"""
import collections
import glob
import json
import math
import os
import re
import sqlite3
import time
import unicodedata

SCRATCH = r"C:\Users\froge\.gemini\antigravity\brain\94e81f8f-586e-45f3-9db2-d3e5fed2ce14\scratch"

STOPWORDS = {
    "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
    "em", "no", "na", "nos", "nas", "por", "pelo", "pela", "pelos", "pelas", "para",
    "com", "sem", "sob", "sobre", "entre", "ate", "apos", "ante", "contra", "desde",
    "e", "ou", "mas", "porem", "contudo", "todavia", "que", "se", "como", "quando",
    "onde", "qual", "quais", "quem", "cujo", "cuja", "este", "esta", "esse", "essa",
    "aquele", "aquela", "isto", "isso", "aquilo", "seu", "sua", "seus", "suas",
    "foi", "era", "sao", "ser", "estar", "esta", "estao", "tem", "tinha", "ter",
    "ha", "houve", "pode", "podem", "deve", "devem", "mais", "menos", "muito", "pouco",
    "ja", "nao", "sim", "tambem", "apenas", "so", "ao", "aos", "as", "pelo",
    "assinale", "alternativa", "correta", "incorreta", "correto", "incorreto",
    "errada", "falsa", "verdadeira", "questao", "abaixo", "acima", "seguir", "seguinte",
    "seguintes", "relacao", "respeito", "acordo", "base", "quadro", "caso", "clinico",
    "paciente", "anos", "idade", "apresenta", "apresentando", "procura", "atendimento",
    "exame", "fisico", "conduta", "diagnostico", "tratamento", "principal", "provavel",
    "adequada", "adequado", "indicada", "indicado", "melhor", "opcao", "afirmativa",
    "afirmativas", "itens", "item", "marque", "julgue", "analise", "assertivas",
    "dia", "dias", "horas", "hora", "mes", "meses", "semana", "semanas", "ano",
}

TOKEN_RE = re.compile(r"[a-z0-9]{2,}")
CAMEL_RE = re.compile(r"([a-z])([A-Z])")


def strip_accents(s: str) -> str:
    if not s:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn"
    )


def de_camelcase(s: str) -> str:
    if not s:
        return ""
    return CAMEL_RE.sub(r"\1 \2", s)


def extract_tokens(text: str, include_bigrams: bool = True) -> list[str]:
    if not text:
        return []
    norm = strip_accents(text).lower()
    raw = TOKEN_RE.findall(norm)
    unigrams = [w for w in raw if w not in STOPWORDS and not (w.isdigit() and len(w) < 4)]
    if not include_bigrams or len(unigrams) < 2:
        return unigrams
    bigrams = [f"{unigrams[i]}_{unigrams[i+1]}" for i in range(len(unigrams) - 1)]
    return unigrams + bigrams


def weighted_question_tokens(statement: str, options_raw, correct_answer: str, commentary: str) -> collections.Counter:
    counts = collections.Counter()
    stmt = statement or ""
    # Body vs terminal command
    if len(stmt) > 200:
        body, cmd = stmt[:-200], stmt[-200:]
    else:
        body, cmd = "", stmt

    for t in extract_tokens(body, True):
        counts[t] += 1.2
    for t in extract_tokens(cmd, True):
        counts[t] += 2.8

    # Extract ONLY the correct answer option text (weight 6.0x! Distractors = 0x!)
    gab = (correct_answer or "").strip().upper()
    if gab in ("A", "B", "C", "D", "E") and options_raw:
        opts = options_raw
        if isinstance(opts, str):
            try:
                opts = json.loads(opts)
            except Exception:
                opts = []
        if isinstance(opts, list):
            letters = ["A", "B", "C", "D", "E"]
            for idx, opt in enumerate(opts):
                if isinstance(opt, dict):
                    let = (opt.get("letter") or (letters[idx] if idx < 5 else "")).strip().upper()
                    if let == gab:
                        for t in extract_tokens(opt.get("text") or "", True):
                            counts[t] += 6.0
                        break

    if commentary:
        comm_head = commentary[:600]
        for t in extract_tokens(comm_head, True):
            counts[t] += 1.5

    return counts


def infer_programa_rplus(modalidade: str, banca: str, institution: str, tipo_prova: str, titulo_caderno: str, code: str) -> str:
    if modalidade not in ("R+", "Título de Especialista"):
        return ""
    blob = strip_accents(f"{banca} {institution} {tipo_prova} {titulo_caderno} {code}").upper()
    if "TEGO" in blob or "FEBRASGO" in blob:
        return "TEGO (Ginecologia e Obstetrícia)"
    if "TECM" in blob or "SBC" in blob and modalidade == "Título de Especialista":
        return "TECM (Clínica Médica)"
    if "TEP" in blob and modalidade == "Título de Especialista":
        return "TEP (Pediatria)"
    if "SBOT" in blob:
        return "SBOT (Ortopedia)"
    if "CBO" in blob or "OFTALMO" in blob:
        return "Oftalmologia / CBO"
    if "MASTOLOGIA" in blob:
        return "R+ Mastologia"
    if "NEONATOLOGIA" in blob:
        return "R+ Neonatologia"
    if "INTENSIVA PEDIATRICA" in blob or "UTI PEDIATRICA" in blob:
        return "R+ UTI Pediátrica"
    if "MEDICINA INTENSIVA" in blob or "TERAPIA INTENSIVA" in blob:
        return "R+ Medicina Intensiva"
    if "GERIATRIA" in blob:
        return "R+ Geriatria"
    if "ENDOSCOPIA" in blob:
        return "R+ Endoscopia"
    if "UROLOGIA" in blob:
        return "R+ Urologia"
    if "CARDIOLOGIA" in blob:
        return "R+ Cardiologia"
    if "PEDIATRIA" in blob:
        return "R+ Pediatria"
    if "GINECOLOGIA" in blob or "OBSTETRICIA" in blob:
        return "R+ Ginecologia e Obstetrícia"
    if "CIRURGIA" in blob or "CBC" in blob:
        return "R+ Cirurgia Geral"
    if "CLINICA MEDICA" in blob or "CLINICA" in blob:
        return "R+ Clínica Médica"
    return "Título de Especialista (Geral)" if modalidade == "Título de Especialista" else "R+ Especialidades"


def classify_images_and_tags(statement: str, commentary: str, images_raw, esp: str, foco: str) -> tuple[bool, list[str], str, bool, list[str]]:
    # 1. Images
    has_img = False
    if images_raw:
        if isinstance(images_raw, list) and len(images_raw) > 0:
            has_img = True
        elif isinstance(images_raw, str) and images_raw.strip() not in ("", "[]", "null", "None"):
            has_img = True

    s_norm = strip_accents((statement or "")[:1200]).lower()
    c_norm = strip_accents((commentary or "")[:1200]).lower()
    img_types = []
    if has_img:
        if any(w in s_norm for w in ("eletrocardiograma", "ecg", "tracado eletro", "derivacoes")):
            img_types.append("ECG")
        if any(w in s_norm for w in ("radiografia", "raio-x", "raios-x", "rx de torax", "rx de abdome", "mamografia", "esofagograma")):
            img_types.append("Radiografia")
        if any(w in s_norm for w in ("tomografia", "angiotomografia", "tc de ", "ressonancia", "rm de ")):
            img_types.append("TC/RM")
        if any(w in s_norm for w in ("ultrassonografia", "ultrassom", "usg", "ecografia", "doppler", "fast")):
            img_types.append("Ultrassom")
        if any(w in s_norm for w in ("cardiotocografia", "partograma", "ctg")):
            img_types.append("CTG/Partograma")
        if esp == "Clínica Médica" and ("lesao cutanea" in s_norm or "dermatoscop" in s_norm or "placa eritematosa" in s_norm):
            img_types.append("Dermatologia")
        if not img_types:
            img_types.append("Exame Visual")

    # 2. Commentary tier & outdated flag
    comm_len = len((commentary or "").strip())
    if comm_len > 350 and ("take-home" in c_norm or "alternativa" in c_norm or "**" in (commentary or "")):
        comm_tier = "padrao_ouro"
    elif comm_len > 30:
        comm_tier = "comentada"
    else:
        comm_tier = "sem_comentario"

    is_desat = any(w in c_norm for w in ("questao desatualizada", "diretriz antiga", "atualmente a diretriz mudou"))

    # 3. Multi-tags 4D (concise canonical tags)
    tags = []
    cmd_tail = s_norm[-220:]
    # Competence
    if any(w in cmd_tail for w in ("conduta", "tratamento", "manejo", "prescrever", "indicar", "droga de escolha", "terapia")):
        tags.append("#Conduta")
    elif any(w in cmd_tail for w in ("rastreamento", "prevencao", "vacina", "profilaxia", "notificacao")):
        tags.append("#Prevenção/Rastreio")
    elif any(w in cmd_tail for w in ("escore", "classificacao", "estadiamento", "criterio", "calculo")):
        tags.append("#Critérios/Escores")
    elif any(w in cmd_tail for w in ("fisiopatologia", "etiologia", "mecanismo", "agente etiologico")):
        tags.append("#Fisiopatologia")
    else:
        tags.append("#Diagnóstico")

    # Setting
    if any(w in s_norm for w in ("pronto-socorro", "emergencia", "sala vermelha", "upa ", "politrauma", "samu", "parada cardiorrespiratoria")):
        tags.append("#Pronto-Socorro")
    elif any(w in s_norm for w in ("uti ", "terapia intensiva", "ventilacao mecanica", "intubado", "noradrenalina")):
        tags.append("#UTI")
    elif any(w in s_norm for w in ("ubs ", "unidade basica", "saude da familia", "esf ", "ambulatorio", "puericultura", "consulta de rotina")):
        tags.append("#UBS/Ambulatório")
    elif any(w in s_norm for w in ("intraoperatorio", "centro cirurgico", "laparotomia", "videolaparoscopia")):
        tags.append("#Centro Cirúrgico")
    elif any(w in s_norm for w in ("sala de parto", "trabalho de parto", "parturiente", "expulsivo")):
        tags.append("#Sala de Parto")

    # Population
    if esp == "Obstetrícia" or any(w in s_norm for w in ("gestante", "primigesta", "secundigesta", "multigesta", "puerpera", "semanas de gestacao")):
        tags.append("#Gestante")
    elif any(w in s_norm for w in ("recem-nascido", "rn ", "neonato", "horas de vida", "dias de vida")):
        tags.append("#Recém-Nascido")
    elif any(w in s_norm for w in ("lactente", "meses de vida", "meses de idade")):
        tags.append("#Lactente")
    elif any(w in s_norm for w in ("idoso", "idosa", "75 anos", "80 anos", "82 anos", "85 anos", "demencia")):
        tags.append("#Idoso")

    return has_img, img_types, comm_tier, is_desat, tags


def main():
    t0 = time.time()
    print("=== LOADING CANONICAL TAXONOMY V3 & MEDEVO MAP ===")
    tax_v3 = json.load(open("data/taxonomia_autoral_v3_completa.json", encoding="utf-8"))
    medevo_map_raw = json.load(open("data/mapa_medevo_para_autoral_v3.json", encoding="utf-8"))
    medevo_de_para = {}
    for k_str, val in medevo_map_raw.items():
        parts = tuple(k_str.split("|||"))
        medevo_de_para[parts] = val

    # Index canonical tree structures
    focos_list = []  # list of dicts with index, esp, tema, foco, subfocos_objs, keywords_tokens
    foco_by_esp_name = {}  # (esp, foco) -> foco_idx
    subfoco_lookup = {}  # (esp, foco, subfoco) -> sf_obj

    for esp_obj in tax_v3["hierarquia"]:
        esp = esp_obj["especialidade"]
        for tema_obj in esp_obj["temas"]:
            tema = tema_obj["tema"]
            for foco_obj in tema_obj["focos"]:
                foco = foco_obj["foco"]
                f_idx = len(focos_list)
                # Pre-extract tokens for foco, subfocos, and sub_subfocos
                f_kw_text = f"{tema} {foco} " + " ".join(foco_obj.get("keywords", []))
                sf_entries = []
                for sf_obj in foco_obj["subfocos"]:
                    sf_name = sf_obj["subfoco"]
                    sf_kw_text = f"{sf_name} " + " ".join(sf_obj.get("keywords", []))
                    ss_entries = []
                    for ss_obj in sf_obj["sub_subfocos"]:
                        ss_name = ss_obj["sub_subfoco"]
                        ss_kw_raw = [strip_accents(k).lower().strip() for k in ss_obj.get("keywords", [])]
                        ss_tokens = set(extract_tokens(f"{ss_name} " + " ".join(ss_kw_raw), True))
                        ss_entries.append({
                            "name": ss_name,
                            "phrases": [p for p in ss_kw_raw if " " in p and len(p) >= 5],
                            "tokens": ss_tokens,
                        })
                        sf_kw_text += " " + ss_name + " " + " ".join(ss_kw_raw)
                    sf_kw_raw = [strip_accents(k).lower().strip() for k in sf_obj.get("keywords", [])]
                    sf_entry = {
                        "name": sf_name,
                        "phrases": [p for p in sf_kw_raw if " " in p and len(p) >= 5],
                        "tokens": set(extract_tokens(sf_kw_text, True)),
                        "sub_subfocos": ss_entries,
                    }
                    sf_entries.append(sf_entry)
                    subfoco_lookup[(esp, foco, sf_name)] = sf_entry
                    f_kw_text += " " + sf_kw_text

                f_kw_raw = [strip_accents(k).lower().strip() for k in foco_obj.get("keywords", [])]
                focos_list.append({
                    "idx": f_idx,
                    "esp": esp,
                    "tema": tema,
                    "foco": foco,
                    "phrases": [p for p in f_kw_raw if " " in p and len(p) >= 5],
                    "tokens": collections.Counter(extract_tokens(f_kw_text, True)),
                    "subfocos": sf_entries,
                })
                foco_by_esp_name[(esp, foco)] = f_idx

    print(f"Indexed {len(focos_list)} canonical focos across 6 specialties in {time.time()-t0:.1f}s.")

    # Load bancas directory for fast uf/regiao/banca_organizadora lookup
    bancas_txt = open("src/data/canonicalBancasDirectory.ts", encoding="utf-8").read()
    bancas_arr = json.loads(bancas_txt[bancas_txt.index("= [") + 2 : bancas_txt.rindex("]") + 1])
    banca_meta = {}
    for b in bancas_arr:
        banca_meta[b["sigla"].upper().strip()] = (
            b.get("uf", "Nacional"),
            b.get("macrorregiao", "Nacional"),
            b.get("bancaOrganizadora", "Comissão Própria"),
        )
        if b.get("key"):
            banca_meta[b["key"].upper().strip()] = banca_meta[b["sigla"].upper().strip()]

    # Load raw MedEvo UUID -> (old_spec, old_theme, old_focus, old_subfocus, alert_type)
    print("=== LOADING RAW MEDEVO UUID ANCHORS ===")
    medevo_uuid_map = {}
    for mf in sorted(glob.glob("data/*_medevo_extracted.json")):
        d = json.load(open(mf, encoding="utf-8"))
        for q in d.get("questions", []):
            qid = q.get("id")
            if qid not in medevo_uuid_map:
                medevo_uuid_map[qid] = (
                    (q.get("specialty_v2") or {}).get("name"),
                    (q.get("theme_v2") or {}).get("name"),
                    (q.get("focus_v2") or {}).get("name"),
                    (q.get("subfocus_v2") or {}).get("name"),
                    q.get("question_alert_type"),
                )
    print(f"Loaded {len(medevo_uuid_map)} unique MedEvo UUID anchors.")

    # Helper to score child subfocos and sub_subfocos inside a chosen foco
    def pick_sub_and_subsub(f_entry, q_toks: collections.Counter, norm_blob: str, chosen_sf_entry=None):
        if chosen_sf_entry is None:
            best_sf = f_entry["subfocos"][0]
            best_sf_score = -1.0
            for idx_sf, sf_e in enumerate(f_entry["subfocos"]):
                sc = sum(w for tok, w in q_toks.items() if tok in sf_e["tokens"])
                for ph in sf_e["phrases"]:
                    if ph in norm_blob:
                        sc += 7.5
                # Slight deterministic tie-break favoring general clinical/diagnostic axis first
                sc += 0.001 * (10 - idx_sf)
                if sc > best_sf_score:
                    best_sf_score = sc
                    best_sf = sf_e
            chosen_sf_entry = best_sf

        best_ss = chosen_sf_entry["sub_subfocos"][0]
        best_ss_score = -1.0
        for idx_ss, ss_e in enumerate(chosen_sf_entry["sub_subfocos"]):
            sc = sum(w for tok, w in q_toks.items() if tok in ss_e["tokens"])
            for ph in ss_e["phrases"]:
                if ph in norm_blob:
                    sc += 8.0
            sc += 0.001 * (10 - idx_ss)
            if sc > best_ss_score:
                best_ss_score = sc
                best_ss = ss_e

        return chosen_sf_entry["name"], best_ss["name"]

    # Load all rows from SSOT + extra live rows
    print("=== READING ALL QUESTIONS FROM LOCAL SSOT + LIVE EXTRA MANIFEST ===")
    conn = sqlite3.connect("data/supabase_tables/supabase_tables.db")
    cur = conn.cursor()

    ssot_rows = cur.execute("""
        SELECT id, code, institution, banca, year, tipo_prova, modalidade,
               especialidade, tema, foco, subfoco, statement, options,
               correct_answer, commentary, images, titulo_caderno
        FROM questions_curated_staging
    """).fetchall()
    print(f"Loaded {len(ssot_rows)} rows from questions_curated_staging.")

    extra_live_rows = json.load(open(os.path.join(SCRATCH, "supabase_extra_live_rows.json"), encoding="utf-8"))
    print(f"Loaded {len(extra_live_rows)} extra live rows from Supabase.")

    def get_clean_id(raw_id: str) -> str:
        for pref in (
            "questions_expansion_titulo_especialista_",
            "questions_expansion_revalida_",
            "questions_expansion_r_plus_",
            "questions_expansion_direto_",
            "questions_",
        ):
            if raw_id.startswith(pref):
                return raw_id[len(pref):]
        return raw_id

    # Unified list of records to classify
    records = []
    for r in ssot_rows:
        (sid, code, inst, banca, year, tp, mod, esp, tema, foco, subfoco, stmt, opts, gab, comm, imgs, tc) = r
        records.append({
            "ssot_id": sid,
            "clean_id": get_clean_id(sid),
            "code": code or "",
            "institution": inst or "",
            "banca": banca or "",
            "year": year or 2024,
            "tipo_prova": tp or "",
            "modalidade": mod or "Acesso Direto",
            "old_esp": esp or "",
            "old_tema": tema or "",
            "old_foco": foco or "",
            "old_subfoco": subfoco or "",
            "statement": stmt or "",
            "options": opts,
            "correct_answer": gab or "",
            "commentary": comm or "",
            "images": imgs,
            "titulo_caderno": tc or "",
            "is_ssot": True,
        })

    for item in extra_live_rows:
        records.append({
            "ssot_id": None,
            "clean_id": item["id"],
            "code": item.get("code") or "",
            "institution": item.get("institution") or "",
            "banca": item.get("banca") or "",
            "year": item.get("year") or 2024,
            "tipo_prova": item.get("tipo_prova") or "",
            "modalidade": item.get("modalidade") or "Revalida",
            "old_esp": item.get("especialidade") or "",
            "old_tema": item.get("tema") or "",
            "old_foco": item.get("foco") or "",
            "old_subfoco": item.get("subfoco") or "",
            "statement": item.get("statement") or "",
            "options": item.get("options"),
            "correct_answer": item.get("correct_answer") or "",
            "commentary": item.get("commentary") or "",
            "images": item.get("images"),
            "titulo_caderno": "",
            "is_ssot": False,
        })

    print(f"Total unified records to classify & enrich: {len(records)}")

    # =========================================================================
    # PHASE A: ONDA 1 — CLASSIFY MEDEVO-ANCHORED QUESTIONS & ACCUMULATE TF-IDF
    # =========================================================================
    print("=== PHASE A: ONDA 1 (MEDEVO ROOT RECATEGORIZATION) ===")
    onda1_count = 0
    onda2_indices = []

    doc_freq = collections.Counter()
    foco_term_sums = [collections.Counter() for _ in range(len(focos_list))]
    foco_doc_counts = [0] * len(focos_list)

    for idx, rec in enumerate(records):
        cid = rec["clean_id"]
        m_anchor = medevo_uuid_map.get(cid)
        if m_anchor and m_anchor[2]:  # has non-null old_focus in MedEvo!
            old_s, old_t, old_fo, old_sf, alert_type = m_anchor
            sf_key = old_sf if old_sf else "__NULL__"
            rule = (
                medevo_de_para.get((old_s, old_t, old_fo, sf_key))
                or medevo_de_para.get((old_s, old_t, old_fo, "*"))
                or medevo_de_para.get((old_s, old_t, old_fo, "__NULL__"))
            )
            if rule:
                q_toks = weighted_question_tokens(
                    rec["statement"], rec["options"], rec["correct_answer"], rec["commentary"]
                )
                if old_sf:
                    for t in extract_tokens(old_sf, True):
                        q_toks[t] += 3.0
                norm_blob = strip_accents(f"{rec['statement']} {old_sf or ''}").lower()

                if rule["mode"] == "DIRECT_SUBFOCO":
                    t_esp = rule["target_especialidade"]
                    t_foco = rule["target_foco"]
                    t_sf = rule["target_subfoco"]
                    f_idx = foco_by_esp_name[(t_esp, t_foco)]
                    f_entry = focos_list[f_idx]
                    sf_entry = subfoco_lookup.get((t_esp, t_foco, t_sf))
                    chosen_sf, chosen_ss = pick_sub_and_subsub(f_entry, q_toks, norm_blob, sf_entry)
                else:
                    t_esp = rule["target_especialidade"]
                    cand_focos = rule["candidate_focos"]
                    best_f_idx = foco_by_esp_name[(t_esp, cand_focos[0])]
                    best_f_sc = -1.0
                    for cf in cand_focos:
                        fi = foco_by_esp_name[(t_esp, cf)]
                        fe = focos_list[fi]
                        sc = sum(w * min(fe["tokens"][tok], 4) for tok, w in q_toks.items() if tok in fe["tokens"])
                        for ph in fe["phrases"]:
                            if ph in norm_blob:
                                sc += 10.0
                        if sc > best_f_sc:
                            best_f_sc = sc
                            best_f_idx = fi
                    f_entry = focos_list[best_f_idx]
                    chosen_sf, chosen_ss = pick_sub_and_subsub(f_entry, q_toks, norm_blob, None)

                rec["new_esp"] = f_entry["esp"]
                rec["new_tema"] = f_entry["tema"]
                rec["new_foco"] = f_entry["foco"]
                rec["new_subfoco"] = chosen_sf
                rec["new_sub_subfoco"] = chosen_ss
                rec["medevo_alert"] = alert_type
                onda1_count += 1

                # Accumulate empirical statistics for Onda 2 centroid model!
                f_idx_win = f_entry["idx"]
                foco_doc_counts[f_idx_win] += 1
                for tok, w in q_toks.items():
                    doc_freq[tok] += 1
                    foco_term_sums[f_idx_win][tok] += w
                continue

        onda2_indices.append(idx)

    print(f"Onda 1 completed: {onda1_count} MedEvo questions recategorized! Remaining for Onda 2: {len(onda2_indices)} ({time.time()-t0:.1f}s)")

    # =========================================================================
    # PHASE B: BUILD EMPIRICAL + EXPERT INVERTED INDEX CENTROIDS FOR ONDA 2
    # =========================================================================
    print("=== PHASE B: TRAINING EMPIRICAL + EXPERT CENTROIDS ON 132K LABELED QUESTIONS ===")
    N_docs = max(onda1_count, 1)
    max_df = int(0.28 * N_docs)

    # Inject expert keywords into every foco's term sum so even new/rare focos have strong centroids
    for f_idx, f_entry in enumerate(focos_list):
        boost_scale = max(25.0, 0.35 * foco_doc_counts[f_idx])
        for tok, cnt in f_entry["tokens"].items():
            foco_term_sums[f_idx][tok] += boost_scale * min(cnt, 3)
            if doc_freq[tok] == 0:
                doc_freq[tok] = 2

    # Compute IDF & L2-normalized sparse centroids + inverted index
    idf_map = {}
    for tok, df in doc_freq.items():
        if df >= 2 and df <= max_df:
            idf_map[tok] = math.log((N_docs + 1.0) / (df + 1.0)) + 1.0

    inverted_index = collections.defaultdict(list)  # tok -> list of (f_idx, weight)
    for f_idx, term_counts in enumerate(foco_term_sums):
        vec = {}
        norm_sq = 0.0
        for tok, raw_w in term_counts.items():
            idf = idf_map.get(tok)
            if idf is None:
                continue
            val = (1.0 + math.log(1.0 + raw_w)) * idf
            vec[tok] = val
            norm_sq += val * val
        norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
        # Keep top 220 discriminative terms per foco centroid for ultra-fast dot products
        top_terms = sorted(vec.items(), key=lambda x: -x[1])[:220]
        top_norm = math.sqrt(sum(v * v for _, v in top_terms)) or 1.0
        for tok, v in top_terms:
            inverted_index[tok].append((f_idx, v / top_norm))

    print(f"Trained {len(focos_list)} centroids over {len(inverted_index)} informative medical terms ({time.time()-t0:.1f}s).")

    # =========================================================================
    # PHASE C: ONDA 2 — CLASSIFY ALL 124K EXPANSION QUESTIONS
    # =========================================================================
    print(f"=== PHASE C: ONDA 2 (CLASSIFYING {len(onda2_indices)} EXPANSION QUESTIONS) ===")
    num_focos = len(focos_list)
    esp_of_foco = [fe["esp"] for fe in focos_list]
    tema_of_foco_low = [strip_accents(fe["tema"]).lower() for fe in focos_list]

    for step_n, idx in enumerate(onda2_indices):
        rec = records[idx]
        q_toks = weighted_question_tokens(
            rec["statement"], rec["options"], rec["correct_answer"], rec["commentary"]
        )

        # Incorporate informative non-generic legacy tema/foco hints (de-CamelCased!)
        for old_lbl in (rec["old_tema"], rec["old_foco"], rec["old_subfoco"]):
            if old_lbl and old_lbl.strip() not in ("", "Geral", "Não informado", "Não classificada", "__NULL__"):
                dec = de_camelcase(old_lbl)
                for t in extract_tokens(dec, True):
                    q_toks[t] += 2.2

        scores = [0.0] * num_focos
        for tok, w in q_toks.items():
            idf = idf_map.get(tok)
            if idf is None:
                continue
            qw = (1.0 + math.log(1.0 + w)) * idf
            for f_idx, fw in inverted_index.get(tok, ()):
                scores[f_idx] += qw * fw

        # Contextual & Booklet Priors
        prog = infer_programa_rplus(
            rec["modalidade"], rec["banca"], rec["institution"],
            rec["tipo_prova"], rec["titulo_caderno"], rec["code"]
        )
        rec["_prog_cache"] = prog
        s_low = strip_accents(rec["statement"][:700]).lower()

        allowed_esps = None
        boost_tema = None
        if prog == "TEGO (Ginecologia e Obstetrícia)" or prog == "R+ Ginecologia e Obstetrícia":
            allowed_esps = {"Ginecologia", "Obstetrícia"}
        elif prog in ("TECM (Clínica Médica)", "R+ Clínica Médica"):
            allowed_esps = {"Clínica Médica"}
        elif prog in ("TEP (Pediatria)", "R+ Pediatria"):
            allowed_esps = {"Pediatria"}
        elif prog == "R+ Neonatologia":
            allowed_esps = {"Pediatria"}
            boost_tema = "neonatologia"
        elif prog == "R+ Mastologia":
            allowed_esps = {"Ginecologia"}
            boost_tema = "mastologia"
        elif prog == "R+ Geriatria":
            allowed_esps = {"Clínica Médica"}
            boost_tema = "geriatria"
        elif prog == "R+ Medicina Intensiva":
            allowed_esps = {"Clínica Médica"}
            boost_tema = "intensiva"
        elif prog == "SBOT (Ortopedia)":
            allowed_esps = {"Cirurgia Geral"}
            boost_tema = "ortopedia"
        elif prog == "R+ Urologia":
            allowed_esps = {"Cirurgia Geral"}
            boost_tema = "urologia"
        elif prog == "Oftalmologia / CBO":
            allowed_esps = {"Clínica Médica"}
            boost_tema = "oftalmologia"
        elif prog == "R+ Cirurgia Geral":
            allowed_esps = {"Cirurgia Geral"}

        # Clinical age / gestational soft discriminators
        is_gest = any(w in s_low for w in ("gestante", "primigesta", "secundigesta", "semanas de gestacao", "parturiente", "bcf ", "pre-natal"))
        is_ped = any(w in s_low for w in ("recem-nascido", "lactente", "meses de vida", "dias de vida", "puericultura", "escolar de "))

        best_f_idx = 0
        best_sc = -1e9
        for fi in range(num_focos):
            sc = scores[fi]
            fe_esp = esp_of_foco[fi]
            if allowed_esps and fe_esp not in allowed_esps:
                sc *= 0.25
            if boost_tema and boost_tema in tema_of_foco_low[fi]:
                sc *= 1.45
            if is_gest and fe_esp == "Obstetrícia":
                sc *= 1.22
            if is_ped and not is_gest and fe_esp == "Pediatria":
                sc *= 1.20
            if sc > best_sc:
                best_sc = sc
                best_f_idx = fi

        f_entry = focos_list[best_f_idx]
        chosen_sf, chosen_ss = pick_sub_and_subsub(f_entry, q_toks, s_low, None)
        rec["new_esp"] = f_entry["esp"]
        rec["new_tema"] = f_entry["tema"]
        rec["new_foco"] = f_entry["foco"]
        rec["new_subfoco"] = chosen_sf
        rec["new_sub_subfoco"] = chosen_ss

        if (step_n + 1) % 25000 == 0:
            print(f"  Classified {step_n + 1}/{len(onda2_indices)} expansion questions ({time.time()-t0:.1f}s)...")

    print(f"Onda 2 completed! 100% of {len(records)} questions classified ({time.time()-t0:.1f}s).")

    # =========================================================================
    # PHASE D: PRECISION SEARCH FILTERS ENRICHMENT FOR ALL RECORDS
    # =========================================================================
    print("=== PHASE D: ENRICHING PRECISION SEARCH FILTERS ===")
    for rec in records:
        prog = rec.get("_prog_cache")
        if prog is None:
            prog = infer_programa_rplus(
                rec["modalidade"], rec["banca"], rec["institution"],
                rec["tipo_prova"], rec["titulo_caderno"], rec["code"]
            )
        b_key = rec["banca"].upper().strip()
        uf, regiao, org = banca_meta.get(b_key, ("Nacional", "Nacional", "Comissão Própria"))
        has_img, img_types, comm_tier, is_desat, m_tags = classify_images_and_tags(
            rec["statement"], rec["commentary"], rec["images"], rec["new_esp"], rec["new_foco"]
        )
        if rec.get("medevo_alert") == "desatualizada":
            is_desat = True

        rec["programa_rplus"] = prog
        rec["banca_organizadora"] = org
        rec["uf"] = uf
        rec["macrorregiao"] = regiao
        rec["has_images"] = has_img
        rec["image_types"] = img_types
        rec["commentary_tier"] = comm_tier
        rec["is_desatualizada"] = is_desat
        rec["multi_tags"] = m_tags

    # =========================================================================
    # PHASE E: PERSIST TO LOCAL SSOT SQLITE & EXPORT SUPABASE UPLOAD PAYLOAD
    # =========================================================================
    print("=== PHASE E: PERSISTING TO LOCAL SSOT & WRITING SUPABASE PAYLOAD ===")
    existing_cols = {c[1] for c in cur.execute("PRAGMA table_info(questions_curated_staging)").fetchall()}
    new_sqlite_cols = [
        ("sub_subfoco", "TEXT"),
        ("antigo_especialidade", "TEXT"),
        ("antigo_tema", "TEXT"),
        ("antigo_foco", "TEXT"),
        ("antigo_subfoco", "TEXT"),
        ("programa_rplus", "TEXT"),
        ("banca_organizadora", "TEXT"),
        ("uf", "TEXT"),
        ("macrorregiao", "TEXT"),
        ("has_images", "INTEGER"),
        ("image_types", "TEXT"),
        ("commentary_tier", "TEXT"),
        ("is_desatualizada", "INTEGER"),
        ("multi_tags", "TEXT"),
    ]
    for col_name, col_type in new_sqlite_cols:
        if col_name not in existing_cols:
            cur.execute(f"ALTER TABLE questions_curated_staging ADD COLUMN {col_name} {col_type}")

    # Backup original columns once (idempotent!)
    cur.execute("""
        UPDATE questions_curated_staging
        SET antigo_especialidade = COALESCE(antigo_especialidade, especialidade),
            antigo_tema = COALESCE(antigo_tema, tema),
            antigo_foco = COALESCE(antigo_foco, foco),
            antigo_subfoco = COALESCE(antigo_subfoco, subfoco)
        WHERE antigo_especialidade IS NULL AND antigo_foco IS NULL
    """)

    ssot_updates = []
    by_clean_id = {}
    esp_dist = collections.Counter()

    for rec in records:
        esp_dist[rec["new_esp"]] += 1
        by_clean_id[rec["clean_id"]] = {
            "e": rec["new_esp"],
            "t": rec["new_tema"],
            "f": rec["new_foco"],
            "sf": rec["new_subfoco"],
            "ss": rec["new_sub_subfoco"],
            "pr": rec["programa_rplus"],
            "bo": rec["banca_organizadora"],
            "uf": rec["uf"],
            "mr": rec["macrorregiao"],
            "hi": rec["has_images"],
            "it": rec["image_types"],
            "ct": rec["commentary_tier"],
            "id_out": rec["is_desatualizada"],
            "mt": rec["multi_tags"],
        }
        if rec["is_ssot"]:
            ssot_updates.append((
                rec["new_esp"],
                rec["new_tema"],
                rec["new_foco"],
                rec["new_subfoco"],
                rec["new_sub_subfoco"],
                rec["programa_rplus"],
                rec["banca_organizadora"],
                rec["uf"],
                rec["macrorregiao"],
                1 if rec["has_images"] else 0,
                json.dumps(rec["image_types"], ensure_ascii=False),
                rec["commentary_tier"],
                1 if rec["is_desatualizada"] else 0,
                json.dumps(rec["multi_tags"], ensure_ascii=False),
                rec["ssot_id"],
            ))

    cur.executemany("""
        UPDATE questions_curated_staging
        SET especialidade = ?,
            tema = ?,
            foco = ?,
            subfoco = ?,
            sub_subfoco = ?,
            programa_rplus = ?,
            banca_organizadora = ?,
            uf = ?,
            macrorregiao = ?,
            has_images = ?,
            image_types = ?,
            commentary_tier = ?,
            is_desatualizada = ?,
            multi_tags = ?
        WHERE id = ?
    """, ssot_updates)
    conn.commit()
    conn.close()

    with open("data/supabase_v3_classifications.json", "w", encoding="utf-8") as fp:
        json.dump(by_clean_id, fp, ensure_ascii=False)

    print("Specialty distribution across all 257k questions:", dict(esp_dist))
    print(f"ALL DONE in {time.time()-t0:.1f}s! Saved SSOT & data/supabase_v3_classifications.json.")


if __name__ == "__main__":
    main()

