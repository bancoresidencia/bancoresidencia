#!/usr/bin/env python3
"""
Fase 6 — Frontend Hierarchy & Homologated Facets Baseline Generator (v3)
Reads `data/taxonomia_autoral_v3_completa.json`, `data/supabase_v3_classifications.json`,
and the live Supabase metadata to regenerate:
  - src/data/hierarquiaCompletaFiltros.json
  - src/data/clinicaMedicaData.ts
  - src/data/cirurgiaData.ts
  - src/data/pediatriaData.ts
  - src/data/obstetriciaData.ts
  - src/data/ginecologiaData.ts
  - src/data/preventivaData.ts
  - src/data/hierarchyCounts.ts
  - src/data/homologatedFacetsBaseline.ts
"""
import collections
import json
import os
import sqlite3

SCRATCH = r"C:\Users\froge\.gemini\antigravity\brain\94e81f8f-586e-45f3-9db2-d3e5fed2ce14\scratch"

TS_TARGETS = {
    "Clínica Médica": ("src/data/clinicaMedicaData.ts", "clinicaMedicaHierarchy"),
    "Cirurgia Geral": ("src/data/cirurgiaData.ts", "cirurgiaHierarchy"),
    "Pediatria": ("src/data/pediatriaData.ts", "pediatriaHierarchy"),
    "Obstetrícia": ("src/data/obstetriciaData.ts", "obstetriciaHierarchy"),
    "Ginecologia": ("src/data/ginecologiaData.ts", "ginecologiaHierarchy"),
    "Medicina Preventiva e Social": ("src/data/preventivaData.ts", "preventivaHierarchy"),
}


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


def main():
    tax_v3 = json.load(open("data/taxonomia_autoral_v3_completa.json", encoding="utf-8"))
    classifications = json.load(open("data/supabase_v3_classifications.json", encoding="utf-8"))
    live_manifest = json.load(open(os.path.join(SCRATCH, "supabase_live_ids_manifest.json"), encoding="utf-8"))
    extra_live = json.load(open(os.path.join(SCRATCH, "supabase_extra_live_rows.json"), encoding="utf-8"))

    # Load difficulty, type, year metadata by clean_id from SSOT + extra_live
    meta_by_id = {}
    conn = sqlite3.connect("data/supabase_tables/supabase_tables.db")
    cur = conn.cursor()
    for sid, diff, qtype, yr in cur.execute("SELECT id, difficulty, type, year FROM questions_curated_staging"):
        meta_by_id[get_clean_id(sid)] = (diff or "Médio", qtype or "Múltipla escolha", yr or 2024)
    conn.close()
    for item in extra_live:
        meta_by_id[item["id"]] = (
            item.get("difficulty") or "Médio",
            item.get("type") or "Múltipla escolha",
            item.get("year") or 2024,
        )

    # 1. Write the 6 *Data.ts files and src/data/hierarquiaCompletaFiltros.json
    hierarquia_padrao = []
    for esp_obj in tax_v3["hierarquia"]:
        esp_name = esp_obj["especialidade"]
        clean_temas = []
        for t_obj in esp_obj["temas"]:
            clean_focos = []
            for f_obj in t_obj["focos"]:
                clean_sfs = []
                for sf_obj in f_obj["subfocos"]:
                    clean_sfs.append({
                        "subfoco": sf_obj["subfoco"],
                        "sub_subfocos": [ss["sub_subfoco"] for ss in sf_obj["sub_subfocos"]],
                    })
                clean_focos.append({
                    "foco": f_obj["foco"],
                    "subfocos": clean_sfs,
                })
            clean_temas.append({
                "tema": t_obj["tema"],
                "focos": clean_focos,
            })

        spec_clean = {
            "especialidade": esp_name,
            "temas": clean_temas,
        }
        hierarquia_padrao.append(spec_clean)

        ts_path, var_name = TS_TARGETS[esp_name]
        ts_content = (
            'import { SpecialtyHierarchy } from "@/types";\n\n'
            f"export const {var_name}: SpecialtyHierarchy = "
            + json.dumps(spec_clean, ensure_ascii=False, indent=2)
            + ";\n"
        )
        with open(ts_path, "w", encoding="utf-8") as fp:
            fp.write(ts_content)
        print(f"Wrote {ts_path}")

    hcf_payload = {
        "metadata": {
            "version": "3.0.0",
            "source": "Taxonomia Autoral Canônica de 5 Níveis — Banco Residência",
            "counts": tax_v3["counts"],
        },
        "hierarquia_padrao": hierarquia_padrao,
        "hierarquia_enriquecida": hierarquia_padrao,
    }
    with open("src/data/hierarquiaCompletaFiltros.json", "w", encoding="utf-8") as fp:
        json.dump(hcf_payload, fp, ensure_ascii=False, indent=2)
    print("Wrote src/data/hierarquiaCompletaFiltros.json")

    # 2. Compute exact counts per modality table AND globally across all 257,090 live questions!
    table_to_key = [
        ("questions_direto", "homologatedDiretoBaseline"),
        ("questions_revalida", "homologatedRevalidaBaseline"),
        ("questions_rplus", "homologatedRPlusBaseline"),
        ("questions_titulo", "homologatedTituloBaseline"),
    ]

    global_esp = collections.Counter()
    global_tema = collections.Counter()
    global_foco = collections.Counter()
    global_sub = collections.Counter()
    global_subsub = collections.Counter()

    baselines_out = {}

    for tbl, var_name in table_to_key:
        ids = live_manifest[tbl]
        b_esp = collections.Counter()
        b_tema = collections.Counter()
        b_foco = collections.Counter()
        b_sub = collections.Counter()
        b_subsub = collections.Counter()
        b_diff = {"Fácil": 0, "Médio": 0, "Difícil": 0}
        b_tipos = collections.Counter()
        b_anos = collections.Counter()

        for qid in ids:
            c = classifications.get(qid)
            if c:
                e, t, f, sf, ss = c["e"], c["t"], c["f"], c["sf"], c["ss"]
                b_esp[e] += 1
                b_tema[t] += 1
                b_foco[f] += 1
                b_sub[sf] += 1
                b_subsub[ss] += 1

                global_esp[e] += 1
                global_tema[t] += 1
                global_foco[f] += 1
                global_sub[sf] += 1
                global_subsub[ss] += 1

            diff, qtype, yr = meta_by_id.get(qid, ("Médio", "Múltipla escolha", 2024))
            if diff in b_diff:
                b_diff[diff] += 1
            else:
                b_diff["Médio"] += 1
            b_tipos[qtype] += 1
            if yr:
                b_anos[int(yr)] += 1

        # Add legacy alias keys for compatibility
        b_esp_dict = dict(b_esp.most_common())
        b_esp_dict["Cirurgia"] = b_esp_dict.get("Cirurgia Geral", 0)
        b_esp_dict["Medicina Preventiva"] = b_esp_dict.get("Medicina Preventiva e Social", 0)
        b_esp_dict["Ginecologia e Obstetrícia"] = b_esp_dict.get("Ginecologia", 0) + b_esp_dict.get("Obstetrícia", 0)

        baselines_out[var_name] = {
            "total": len(ids),
            "uncategorized": 0,
            "dificuldades": b_diff,
            "tipos": dict(b_tipos),
            "anos": {str(k): v for k, v in sorted(b_anos.items(), key=lambda x: -x[0])},
            "especialidades": b_esp_dict,
            "temas": dict(b_tema.most_common()),
            "focos": dict(b_foco.most_common()),
            "subfocos": dict(b_sub.most_common()),
            "subSubfocos": dict(b_subsub.most_common()),
        }

    global_esp_dict = dict(global_esp.most_common())
    global_esp_dict["Cirurgia"] = global_esp_dict.get("Cirurgia Geral", 0)
    global_esp_dict["Medicina Preventiva"] = global_esp_dict.get("Medicina Preventiva e Social", 0)
    global_esp_dict["Ginecologia e Obstetrícia"] = global_esp_dict.get("Ginecologia", 0) + global_esp_dict.get("Obstetrícia", 0)

    hc_ts = (
        "// Generated automatically from Canonical Taxonomy v3 (5 levels — 257.090 questions)\n"
        "export const hierarchyQuestionCounts = {\n"
        f"  especialidades: {json.dumps(global_esp_dict, ensure_ascii=False, indent=2)},\n"
        f"  temas: {json.dumps(dict(global_tema.most_common()), ensure_ascii=False, indent=2)},\n"
        f"  focos: {json.dumps(dict(global_foco.most_common()), ensure_ascii=False, indent=2)},\n"
        f"  subfocos: {json.dumps(dict(global_sub.most_common()), ensure_ascii=False, indent=2)},\n"
        f"  subSubfocos: {json.dumps(dict(global_subsub.most_common()), ensure_ascii=False, indent=2)}\n"
        "};\n\n"
        "export function getQuestionCount(\n"
        "  type: 'especialidades' | 'temas' | 'focos' | 'subfocos' | 'subSubfocos',\n"
        "  name: string\n"
        "): number {\n"
        "  const map = hierarchyQuestionCounts[type];\n"
        "  if (!map) return 0;\n"
        "  return (map as Record<string, number>)[name] || 0;\n"
        "}\n"
    )
    with open("src/data/hierarchyCounts.ts", "w", encoding="utf-8") as fp:
        fp.write(hc_ts)
    print("Wrote src/data/hierarchyCounts.ts")

    # Write homologatedFacetsBaseline.ts
    hfb_lines = [
        "// Arquivo canônico gerado automaticamente — Taxonomia Autoral v3 (5 níveis com sub_subfoco)",
        "import { StudyModalidade } from '@/types';",
        "",
        "export interface HomologatedBaseline {",
        "  total: number;",
        "  uncategorized: number;",
        "  especialidades: Record<string, number>;",
        "  temas: Record<string, number>;",
        "  focos: Record<string, number>;",
        "  subfocos: Record<string, number>;",
        "  subSubfocos?: Record<string, number>;",
        "  dificuldades: Record<'Fácil' | 'Médio' | 'Difícil', number>;",
        "  tipos: Record<string, number>;",
        "  anos: Record<number, number>;",
        "}",
        "",
    ]
    for _, var_name in table_to_key:
        hfb_lines.append(
            f"export const {var_name}: HomologatedBaseline = "
            + json.dumps(baselines_out[var_name], ensure_ascii=False, indent=2)
            + ";\n"
        )

    hfb_footer = """
export function getHomologatedBaseline(modalidades?: StudyModalidade[]): HomologatedBaseline {
  if (!modalidades || modalidades.length === 0) {
    return combineBaselines([
      homologatedDiretoBaseline,
      homologatedRevalidaBaseline,
      homologatedRPlusBaseline,
      homologatedTituloBaseline
    ]);
  }

  const selectedBaselines: HomologatedBaseline[] = [];
  for (const m of modalidades) {
    if (m === 'Acesso Direto' || m === 'Residência Médica') {
      selectedBaselines.push(homologatedDiretoBaseline);
    } else if (m === 'Revalida') {
      selectedBaselines.push(homologatedRevalidaBaseline);
    } else if (m === 'R+' || (typeof m === 'string' && m.startsWith('R+'))) {
      selectedBaselines.push(homologatedRPlusBaseline);
    } else if (m === 'Título de Especialista' || (typeof m === 'string' && m.startsWith('Título'))) {
      selectedBaselines.push(homologatedTituloBaseline);
    }
  }

  if (selectedBaselines.length === 0) {
    return homologatedDiretoBaseline;
  }
  if (selectedBaselines.length === 1) {
    return selectedBaselines[0];
  }
  return combineBaselines(selectedBaselines);
}

function combineBaselines(baselines: HomologatedBaseline[]): HomologatedBaseline {
  let total = 0;
  let uncategorized = 0;
  const especialidades: Record<string, number> = {};
  const temas: Record<string, number> = {};
  const focos: Record<string, number> = {};
  const subfocos: Record<string, number> = {};
  const subSubfocos: Record<string, number> = {};
  const dificuldades: Record<'Fácil' | 'Médio' | 'Difícil', number> = { 'Fácil': 0, 'Médio': 0, 'Difícil': 0 };
  const tipos: Record<string, number> = {};
  const anos: Record<number, number> = {};

  for (const b of baselines) {
    total += b.total;
    uncategorized += b.uncategorized || 0;
    for (const [k, v] of Object.entries(b.especialidades)) {
      especialidades[k] = (especialidades[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.temas)) {
      temas[k] = (temas[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.focos)) {
      focos[k] = (focos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.subfocos)) {
      subfocos[k] = (subfocos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.subSubfocos || {})) {
      subSubfocos[k] = (subSubfocos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.dificuldades || {})) {
      dificuldades[k as 'Fácil' | 'Médio' | 'Difícil'] = (dificuldades[k as 'Fácil' | 'Médio' | 'Difícil'] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.tipos || {})) {
      tipos[k] = (tipos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.anos || {})) {
      anos[Number(k)] = (anos[Number(k)] || 0) + v;
    }
  }

  return { total, uncategorized, especialidades, temas, focos, subfocos, subSubfocos, dificuldades, tipos, anos };
}
"""
    with open("src/data/homologatedFacetsBaseline.ts", "w", encoding="utf-8") as fp:
        fp.write("\n".join(hfb_lines) + hfb_footer)
    print("Wrote src/data/homologatedFacetsBaseline.ts")


if __name__ == "__main__":
    main()

