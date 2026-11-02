import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def integrate():
    # 1. Integrar Resumo em src/data/studyMaterialsData.ts
    print("Injetando Resumo de HPP em src/data/studyMaterialsData.ts...")
    with open('docs/resumo_hemorragia_pos_parto_alto_rendimento.md', 'r', encoding='utf-8') as f:
        markdown_content = f.read()

    new_material = {
        "id": "mat-hpp-01",
        "focusId": "obs-hpp-emergencia",
        "title": "Hemorragia Pós-Parto (HPP) & Choque Obstétrico",
        "specialty": "Ginecologia e Obstetrícia",
        "theme": "Emergências Obstétricas",
        "focus": "Hemorragia Pós-Parto (HPP)",
        "readTimeMinutes": 10,
        "lastUpdatedYear": 2026,
        "guidelineBadge": "FEBRASGO / Ministério da Saúde / FIGO",
        "summarySnippet": "Definição funcional, índice de choque, profilaxia universal com ocitocina 10 UI IM, manejo escalonado dos 4 Ts, balão de Bakri e sutura de B-Lynch.",
        "keyPoints": [
            "Profilaxia universal mandatória em 100% dos partos: Ocitocina 10 UI IM logo após expulsão fetal + manobra de Brandt-Andrews.",
            "Atonia uterina responde por 70% a 80% das hemorragias pós-parto; conduta inicial combina massagem de Hamilton, Ocitocina IV e Ácido Tranexâmico IV precoce.",
            "Metilergometrina é formalmente contraindicada em pacientes hipertensas, coronariopatas ou com pré-eclâmpsia.",
            "Se o tratamento clínico falhar no parto vaginal, o próximo passo imediato é o Balão de Tamponamento Intrauterino de Bakri (teste do balão).",
            "Sutura compressiva de escolha na laparotomia para preservação uterina: Sutura de B-Lynch em suspensório.",
            "Índice de Choque (FC/PAS) >= 0,9 indica sangramento grave oculto; >= 1,4 exige ativação imediata do protocolo de transfusão maciça (1:1:1).",
            "Na inversão uterina aguda, suspenda a ocitocina imediatamente, realize a Manobra de Taxe / Johnson e só dequite a placenta após a reposição anatômica.",
            "Sangramento contínuo vermelho-vivo com útero perfeitamente contraído e duro é sinal de trauma de trajeto (revisar colo e vagina com valvas de peso)."
        ],
        "markdownContent": markdown_content
    }

    study_file_path = 'src/data/studyMaterialsData.ts'
    with open(study_file_path, 'r', encoding='utf-8') as f:
        study_content = f.read()

    if "'mat-hpp-01'" not in study_content and '"mat-hpp-01"' not in study_content:
        # Encontra o último ]; e injeta antes
        last_bracket_idx = study_content.rfind('];')
        if last_bracket_idx != -1:
            json_block = json.dumps(new_material, indent=4, ensure_ascii=False)
            updated_study = (
                study_content[:last_bracket_idx].rstrip()
                + ',\n  ' + json_block
                + '\n];\n'
            )
            with open(study_file_path, 'w', encoding='utf-8') as f:
                f.write(updated_study)
            print("✅ Resumo de HPP inserido com sucesso em src/data/studyMaterialsData.ts")
    else:
        print("ℹ️ Resumo de HPP já existe em src/data/studyMaterialsData.ts")

    # 2. Integrar Flashcards em src/data/flashcardsData.ts
    print("Injetando 80 Flashcards em src/data/flashcardsData.ts...")
    with open('data/flashcards_hemorragia_pos_parto.json', 'r', encoding='utf-8') as f:
        new_cards = json.load(f)

    flashcards_file_path = 'src/data/flashcardsData.ts'
    with open(flashcards_file_path, 'r', encoding='utf-8') as f:
        fc_content = f.read()

    if "'fc-hpp-01'" not in fc_content and '"fc-hpp-01"' not in fc_content:
        last_bracket_idx = fc_content.rfind('];')
        if last_bracket_idx != -1:
            cards_blocks = []
            for c in new_cards:
                # Converter para bloco de objeto TS compatível
                c_item = {
                    "id": c["id"],
                    "front": c["front"],
                    "back": c["back"],
                    "comment": c["comment"],
                    "specialty": c["specialty"],
                    "theme": c["theme"],
                    "focus": c["focus"],
                    "priority": c["priority"],
                    "tags": c["tags"]
                }
                cards_blocks.append(json.dumps(c_item, indent=4, ensure_ascii=False))

            all_new_cards_str = ',\n  ' + ',\n  '.join(cards_blocks)
            updated_fc = (
                fc_content[:last_bracket_idx].rstrip()
                + all_new_cards_str
                + '\n];\n'
            )
            with open(flashcards_file_path, 'w', encoding='utf-8') as f:
                f.write(updated_fc)
            print("✅ 80 Flashcards de HPP inseridos com sucesso em src/data/flashcardsData.ts")
    else:
        print("ℹ️ Flashcards de HPP já existem em src/data/flashcardsData.ts")

if __name__ == '__main__':
    integrate()
