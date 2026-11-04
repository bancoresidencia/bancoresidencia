#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import json

def append_material():
    base_dir = r'C:\bancoresidencia\bancoresidencia'
    md_path = os.path.join(base_dir, 'docs', 'resumo_infeccao_puerperal_alto_rendimento.md')
    ts_path = os.path.join(base_dir, 'src', 'data', 'studyMaterialsData.ts')

    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    with open(ts_path, 'r', encoding='utf-8') as f:
        ts_code = f.read()

    if 'mat-inf-puerp-01' in ts_code:
        print("mat-inf-puerp-01 already in studyMaterialsData.ts!")
        return

    # Prepare item object
    new_item = {
        "id": "mat-inf-puerp-01",
        "focusId": "obs-inf-puerperal",
        "title": "Infecção Puerperal & Endometrite",
        "specialty": "Ginecologia e Obstetrícia",
        "theme": "Puerpério & Complicações Puerperais",
        "focus": "Infecção Puerperal",
        "readTimeMinutes": 8,
        "lastUpdatedYear": 2026,
        "guidelineBadge": "FEBRASGO / ACOG / CDC / Ministério da Saúde",
        "summarySnippet": "Tríade de Bumm, diagnóstico de morbidade febril puerperal, profilaxia cirúrgica na cesárea com cefazolina na indução, esquema de primeira linha com clindamicina + gentamicina e manejo da febre persistente.",
        "keyPoints": [
            "Morbidade febril puerperal: temperatura oral ≥ 38,0°C em 2 dias distintos entre o 2º e 10º dia (excluídas primeiras 24h).",
            "A cesariana é o principal fator de risco isolado, elevando em 10 a 30 vezes a incidência de endometrite em relação ao parto vaginal.",
            "Profilaxia cirúrgica mandatória: Cefazolina 2g IV (ou 3g se IMC ≥ 35 ou peso ≥ 120kg) administrada 30-60 min ANTES da incisão na indução anestésica.",
            "Endometrite puerperal: Tríade de Bumm clássica (febre persistente + útero doloroso/amolecido subinvoluído + lóquios fétidos achocolatados).",
            "Tratamento padrão-ouro hospitalar: Clindamicina (900mg IV 8/8h) + Gentamicina (5mg/kg IV dose única diária) até 48 horas afebril e assintomática.",
            "Não prescrever antibioticoterapia oral ambulatorial após alcance da cura clínica hospitalar (prática revogada).",
            "Febre persistente após 48-72h: investigar abscesso de parede, restos ovulares/hematoma ao USG, adicionar ampicilina e suspeitar de tromboflebite pélvica séptica (teste da heparina)."
        ],
        "markdownContent": md_content
    }

    # Serialized JSON
    serialized_item = json.dumps(new_item, indent=2, ensure_ascii=False)
    # Adjust indentation to match ts file
    indented_item = ",\n  " + "\n  ".join(serialized_item.splitlines())

    # Insert before the closing bracket of INITIAL_STUDY_MATERIALS
    last_bracket = ts_code.rfind('];')
    if last_bracket == -1:
        print("Closing bracket not found in studyMaterialsData.ts!")
        return

    new_ts_code = ts_code[:last_bracket].rstrip() + indented_item + "\n];\n"

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(new_ts_code)

    print("Successfully appended mat-inf-puerp-01 to studyMaterialsData.ts!")

if __name__ == '__main__':
    append_material()

