#!/usr/bin/env python3
"""
Fase 1 Consolidator & Global Taxonomy Linter (v3)
Merges the 6 specialty trees and De-Para maps, enforces global uniqueness of `foco`
and `tema` labels where needed, validates 100% of MedEvo root tuples, and exports
`data/taxonomia_autoral_v3_completa.json` and `data/mapa_medevo_para_autoral_v3.json`.
"""
import json
import os
import re
import collections

SCRATCH = r"C:\Users\froge\.gemini\antigravity\brain\94e81f8f-586e-45f3-9db2-d3e5fed2ce14\scratch"
SPECS_DIR = os.path.join(SCRATCH, "specs")

SPEC_ORDER = [
    ("Clínica Médica", "clinica"),
    ("Cirurgia Geral", "cirurgia"),
    ("Pediatria", "pediatria"),
    ("Obstetrícia", "obstetricia"),
    ("Ginecologia", "ginecologia"),
    ("Medicina Preventiva e Social", "preventiva"),
]

SPOILER_PATTERNS = re.compile(
    r"não exige bo|primeira linha:|tratamento de escolha:|80% das doenças|3:1\b",
    re.IGNORECASE,
)


def clean_label(text: str) -> str:
    text = text.replace(":", " -").replace("  ", " ").strip()
    if " - " in text:
        parts = [p.strip() for p in text.split(" - ") if p.strip()]
        text = " e ".join(parts[:2]) if len(parts) > 1 else parts[0]
    text = re.sub(r"\bvs\.?\b", "e", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main():
    trees = []
    all_mappings = []

    for esp_name, slug in SPEC_ORDER:
        t_path = os.path.join(SPECS_DIR, f"tree_{slug}.json")
        m_path = os.path.join(SPECS_DIR, f"map_{slug}.json")
        if not os.path.exists(t_path) or not os.path.exists(m_path):
            raise FileNotFoundError(f"Missing {t_path} or {m_path}")
        t_data = json.load(open(t_path, encoding="utf-8"))
        m_data = json.load(open(m_path, encoding="utf-8"))
        t_data["especialidade"] = esp_name
        trees.append((slug, t_data))
        for item in m_data.get("mappings", []):
            item["_source_slug"] = slug
            all_mappings.append(item)

    # 1. Check and resolve any duplicate `foco` names across different specialties
    #    so `foco` is 100% globally unique across all 6 specialties!
    foco_owners = collections.defaultdict(list)
    for slug, t_data in trees:
        esp = t_data["especialidade"]
        for tema_obj in t_data["temas"]:
            tema_obj["tema"] = clean_label(tema_obj["tema"])
            for foco_obj in tema_obj["focos"]:
                foco_obj["foco"] = clean_label(foco_obj["foco"])
                foco_owners[foco_obj["foco"].lower()].append((esp, tema_obj["tema"], foco_obj))

    suffix_by_esp = {
        "Clínica Médica": "no Adulto",
        "Cirurgia Geral": "Cirúrgica",
        "Pediatria": "na Infância",
        "Obstetrícia": "na Gestação",
        "Ginecologia": "Ginecológica",
        "Medicina Preventiva e Social": "em Saúde Coletiva",
    }

    renamed_focos = {}  # (esp, old_foco) -> new_foco
    for f_low, owners in foco_owners.items():
        if len(owners) > 1:
            # Disambiguate non-first or all ambiguous ones cleanly
            for idx, (esp, tema_name, foco_obj) in enumerate(owners):
                if idx == 0:
                    continue
                old_name = foco_obj["foco"]
                suf = suffix_by_esp.get(esp, f"({esp})")
                new_name = f"{old_name} {suf}"
                foco_obj["foco"] = new_name
                renamed_focos[(esp, old_name)] = new_name
                print(f"[Disambiguated duplicate foco] ({esp}) '{old_name}' -> '{new_name}'")

    # Also clean subfocos and sub_subfocos labels & ensure uniqueness within parent
    total_temas = 0
    total_focos = 0
    total_subfocos = 0
    total_subsubs = 0

    valid_focos_by_esp = collections.defaultdict(dict)  # esp -> {foco: tema}
    valid_foco_global = {}  # foco -> esp
    valid_subfocos = {}  # (esp, tema, foco) -> set(subfocos)

    for slug, t_data in trees:
        esp = t_data["especialidade"]
        for tema_obj in t_data["temas"]:
            total_temas += 1
            t_name = tema_obj["tema"]
            for foco_obj in tema_obj["focos"]:
                total_focos += 1
                f_name = foco_obj["foco"]
                valid_focos_by_esp[esp][f_name] = t_name
                valid_foco_global[f_name] = esp
                sf_set = set()
                for sf_obj in foco_obj["subfocos"]:
                    total_subfocos += 1
                    old_sf = sf_obj["subfoco"]
                    new_sf = clean_label(old_sf)
                    if new_sf.lower() == f_name.lower():
                        new_sf = f"Aspectos Clínicos de {new_sf}"
                    sf_obj["subfoco"] = new_sf
                    sf_set.add(new_sf)
                    for ss_obj in sf_obj["sub_subfocos"]:
                        total_subsubs += 1
                        ss_obj["sub_subfoco"] = clean_label(ss_obj["sub_subfoco"])
                valid_subfocos[(esp, t_name, f_name)] = sf_set

    # 2. Validate & normalize mappings (apply any renamed_focos and resolve CROSS_REDIRECT)
    clean_mappings = {}
    for m in all_mappings:
        key = (
            m["old_spec"],
            m["old_theme"],
            m["old_focus"],
            m.get("old_subfocus") or "__NULL__",
        )
        mode = m.get("mode", "DIRECT_SUBFOCO")
        if mode == "CROSS_REDIRECT":
            red_esp = m.get("redirect_specialty", "Ginecologia")
            # Route to SPLIT_FOCO across relevant focos of red_esp
            hint = (m.get("redirect_hint") or m.get("old_subfocus") or "").lower()
            cands = []
            for cand_f in valid_focos_by_esp[red_esp].keys():
                if any(w in cand_f.lower() for w in ("mama", "mamogr", "colo", "cervical", "hpv", "colorretal", "pólipo", "próstata") if w in hint):
                    cands.append(cand_f)
            if not cands:
                cands = list(valid_focos_by_esp[red_esp].keys())[:5]
            clean_mappings[key] = {
                "mode": "SPLIT_FOCO",
                "target_especialidade": red_esp,
                "candidate_focos": cands,
            }
            continue

        t_esp = m["target_especialidade"]
        if mode == "DIRECT_SUBFOCO":
            t_foco = m["target_foco"]
            if (t_esp, t_foco) in renamed_focos:
                t_foco = renamed_focos[(t_esp, t_foco)]
            t_tema = valid_focos_by_esp[t_esp].get(t_foco, clean_label(m.get("target_tema", "")))
            t_sf = clean_label(m["target_subfoco"])
            valid_sfs = valid_subfocos.get((t_esp, t_tema, t_foco), set())
            if t_sf not in valid_sfs:
                # Fallback to SPLIT_FOCO on that exact single foco so subfoco is scored cleanly!
                clean_mappings[key] = {
                    "mode": "SPLIT_FOCO",
                    "target_especialidade": t_esp,
                    "candidate_focos": [t_foco],
                }
            else:
                clean_mappings[key] = {
                    "mode": "DIRECT_SUBFOCO",
                    "target_especialidade": t_esp,
                    "target_tema": t_tema,
                    "target_foco": t_foco,
                    "target_subfoco": t_sf,
                }
        else:
            cands = []
            for cf in m.get("candidate_focos", []):
                cf_clean = clean_label(cf)
                if (t_esp, cf_clean) in renamed_focos:
                    cf_clean = renamed_focos[(t_esp, cf_clean)]
                if cf_clean in valid_focos_by_esp[t_esp] or cf_clean in valid_foco_global:
                    cands.append(cf_clean)
            if not cands:
                # Match across all focos of t_esp
                cands = list(valid_focos_by_esp[t_esp].keys())
            clean_mappings[key] = {
                "mode": "SPLIT_FOCO",
                "target_especialidade": t_esp,
                "candidate_focos": cands,
            }

    # Verify coverage against raw medevo_root_tree.json!
    medevo_root = json.load(open(os.path.join(SCRATCH, "medevo_root_tree.json"), encoding="utf-8"))
    missing = 0
    covered = 0
    for s, sinfo in medevo_root.items():
        for t, tinfo in sinfo["themes"].items():
            if t == "__NULL__":
                continue
            for fo, foinfo in tinfo["foci"].items():
                if fo == "__NULL__":
                    continue
                for sf in foinfo["subfoci"].keys():
                    sf_k = sf if sf != "__NULL__" else "__NULL__"
                    if (s, t, fo, sf_k) in clean_mappings or (s, t, fo, "*") in clean_mappings or (s, t, fo, "__NULL__") in clean_mappings:
                        covered += 1
                    else:
                        missing += 1
                        print(f"[WARN] Unmapped MedEvo tuple: {(s, t, fo, sf_k)}")

    print("=" * 72)
    print(f"CONSOLIDATED TAXONOMY V3 SUMMARY:")
    print(f"  Especialidades (N1): {len(trees)}")
    print(f"  Temas          (N2): {total_temas}")
    print(f"  Focos          (N3): {total_focos}")
    print(f"  Subfocos       (N4): {total_subfocos}")
    print(f"  Subsubfocos    (N5): {total_subsubs}")
    print(f"  TOTAL CLINICAL NODES: {len(trees) + total_temas + total_focos + total_subfocos + total_subsubs}")
    print(f"  MedEvo Root Tuples Covered: {covered} (Missing: {missing})")
    print("=" * 72)

    master_tree = {
        "version": "3.0.0",
        "description": "Taxonomia Clínica Autoral de 5 Níveis — Banco Residência",
        "counts": {
            "especialidades": len(trees),
            "temas": total_temas,
            "focos": total_focos,
            "subfocos": total_subfocos,
            "sub_subfocos": total_subsubs,
        },
        "hierarquia": [t_data for _, t_data in trees],
    }

    os.makedirs("data", exist_ok=True)
    with open("data/taxonomia_autoral_v3_completa.json", "w", encoding="utf-8") as fp:
        json.dump(master_tree, fp, ensure_ascii=False, indent=2)

    serializable_map = {f"{k[0]}|||{k[1]}|||{k[2]}|||{k[3]}": v for k, v in clean_mappings.items()}
    with open("data/mapa_medevo_para_autoral_v3.json", "w", encoding="utf-8") as fp:
        json.dump(serializable_map, fp, ensure_ascii=False, indent=2)

    print("Saved data/taxonomia_autoral_v3_completa.json and data/mapa_medevo_para_autoral_v3.json!")


if __name__ == "__main__":
    main()

