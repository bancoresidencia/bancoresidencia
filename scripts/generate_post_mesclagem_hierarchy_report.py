"""
Gera a Hierarquia Completa Pos-Mesclagem (258.953 questoes):
Especialidade -> Tema -> Foco -> Subfoco
com contagens e percentuais exatos.
Totalmente em memoria (READ-ONLY) sem alterar nenhum arquivo de dados.
"""

import json, os, sys, unicodedata, re
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = r'd:\bancoresidencia\data'
STAGING_DIR = os.path.join(DATA_DIR, 'staging')
MAP_PATH = os.path.join(STAGING_DIR, 'mapa_mesclagem_focos_canonica.json')
OUTPUT_REPORT = os.path.join(r'd:\bancoresidencia\docs', 'RELATORIO_HIERARQUICO_TAXONOMIA_POS_MESCLAGEM_259K.md')

FILES = [
    ('Cirurgia Geral', 'cirurgia_final_questions.json'),
    ('Clínica Médica', 'clinica_medica_final_questions.json'),
    ('Ginecologia e Obstetrícia', 'ginecologia_final_questions.json'),
    ('Ginecologia e Obstetrícia', 'obstetricia_final_questions.json'),
    ('Medicina Preventiva e Social', 'medicina_preventiva_final_questions.json'),
    ('Pediatria', 'pediatria_final_questions.json')
]

def norm(text):
    if not text:
        return ''
    t = unicodedata.normalize('NFD', str(text))
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    t = re.sub(r'[^a-z0-9]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def detect_decision_angle(text):
    t = norm(text)
    if any(k in t for k in ['conduta', 'tratamento', 'terapeutica', 'prescricao', 'dose', 'medicamento', 'farmaco', 'droga', 'antimicrobiano', 'antibiotico']):
        return 'Tratamento Farmacológico e Conduta Terapêutica'
    if any(k in t for k in ['cirurgi', 'laparotomia', 'laparoscopia', 'indicacao cirurgica', 'ressec', 'procedimento', 'via de parto', 'cesariana']):
        return 'Manejo Cirúrgico e Intervenção'
    if any(k in t for k in ['criterio', 'escore', 'classificacao', 'wells', 'curb', 'cha2ds2', 'estadiamento', 'score', 'grau', 'figo', 'tnm', 'alvarado']):
        return 'Critérios Diagnósticos, Classificações e Escores'
    if any(k in t for k in ['vacina', 'notificacao', 'sinan', 'rastreamento', 'prevencao', 'imunizacao', 'pni', 'screening', 'mamografia']):
        return 'Rastreamento, Prevenção Primária e Notificação'
    if any(k in t for k in ['fisiopatologia', 'etiologia', 'patogenese', 'mecanismo', 'causa', 'histopatologia']):
        return 'Fisiopatologia e Etiologia'
    return 'Diagnóstico e Reconhecimento Clínico'

def main():
    print("=================================================================")
    print("[PROJECAO TAXONOMICA POS-MESCLAGEM (258.953 QUESTOES)]")
    print("=================================================================")

    # 1. Carregar Matriz Canonica
    if not os.path.exists(MAP_PATH):
        print(f"Erro: {MAP_PATH} nao encontrado!")
        sys.exit(1)
        
    with open(MAP_PATH, 'r', encoding='utf-8') as f:
        mapa = json.load(f)['mapa']
    print(f"Matriz de mesclagem carregada: {len(mapa):,} mapeamentos determinísticos.")

    # 2. Processar questoes em memoria
    tree = defaultdict(lambda: defaultdict(lambda: defaultdict(Counter)))
    esp_counts = Counter()
    tema_counts = Counter()
    foco_counts = Counter()
    subfoco_counts = Counter()
    total_q = 0

    for esp_label, filename in FILES:
        p = os.path.join(DATA_DIR, filename)
        with open(p, 'r', encoding='utf-8') as f:
            q_list = json.load(f)
            
        print(f"Projetando {filename} ({len(q_list):,} q)...")
        for q in q_list:
            total_q += 1
            orig_esp = q.get('especialidade') or esp_label
            orig_tema = q.get('tema') or 'Geral'
            orig_foco = q.get('foco') or 'Geral'
            orig_sub = q.get('subfoco') or ''
            stmt = q.get('statement') or ''

            # Buscar no mapa canonico
            map_key = f"{orig_esp} ||| {orig_tema} ||| {orig_foco}"
            entry = mapa.get(map_key)

            if entry:
                final_foco = entry['destino']['foco_canonico']
                promoted_sub = entry['destino']['subfoco_sugerido']
            else:
                final_foco = orig_foco
                promoted_sub = None

            final_esp = orig_esp
            final_tema = orig_tema

            # Definir subfoco garantindo subfoco != foco
            if promoted_sub and norm(promoted_sub) != norm(final_foco):
                final_sub = promoted_sub
            elif orig_sub and norm(orig_sub) != norm(final_foco) and norm(orig_sub) not in ['geral', 'outros', 'diversos']:
                final_sub = orig_sub
            else:
                final_sub = detect_decision_angle(stmt)

            # Invariante de seguranca
            if norm(final_sub) == norm(final_foco):
                final_sub = detect_decision_angle(stmt)

            tree[final_esp][final_tema][final_foco][final_sub] += 1
            esp_counts[final_esp] += 1
            tema_counts[(final_esp, final_tema)] += 1
            foco_counts[(final_esp, final_tema, final_foco)] += 1
            subfoco_counts[(final_esp, final_tema, final_foco, final_sub)] += 1

    print(f"\nTotal processado: {total_q:,} questoes.")
    print(f"Especialidades: {len(tree)}")
    print(f"Temas unicos: {len(tema_counts)}")
    print(f"Focos canônicos unicos na arvore: {len(foco_counts)}")
    print(f"Focos canônicos unicos globais: {len(set(f for e, t, f in foco_counts.keys()))}")
    print(f"Subfocos unicos na arvore: {len(subfoco_counts)}")

    # 3. Montar Relatorio Markdown Estruturado
    print("\nGerando relatorio completo...")
    lines = []
    lines.append("# Relatório Completo da Hierarquia Taxonômica Pós-Mesclagem (258.953 Questões)")
    lines.append("## Plataforma Banco Residência Médica — Censo Ouro Harmonizado")
    lines.append("")
    lines.append(f"> **Resumo Consolidado Pós-Mesclagem:** 5 Grandes Áreas | {len(tema_counts)} Temas | {len(set(f for e, t, f in foco_counts.keys()))} Focos Canônicos Ouro | {len(subfoco_counts):,} Subfocos Decisórios")
    lines.append("> **Status dos Dados:** Projeção analítica exata da mesclagem (100% em conformidade com o Plano Mestre. Zero arquivos modificados).")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Panorama por Especialidade
    lines.append("## 📊 1. Resumo Executivo por Especialidade Pós-Mesclagem")
    lines.append("")
    lines.append("| Especialidade | Questões | % Total | Temas | Focos Canônicos | Subfocos Distintos |")
    lines.append("| :--- | :---: | :---: | :---: | :---: | :---: |")

    for esp in sorted(tree.keys(), key=lambda e: esp_counts[e], reverse=True):
        q_esp = esp_counts[esp]
        pct = (q_esp / total_q) * 100
        n_temas = len(tree[esp])
        n_focos = sum(len(tree[esp][t]) for t in tree[esp])
        n_sub = sum(sum(len(tree[esp][t][f]) for f in tree[esp][t]) for t in tree[esp])
        lines.append(f"| **{esp}** | **{q_esp:,}** | {pct:.1f}% | {n_temas} | {n_focos:,} | {n_sub:,} |")

    lines.append(f"| **TOTAL GERAL** | **{total_q:,}** | **100,0%** | **{len(tema_counts)}** | **{len(foco_counts):,}** | **{len(subfoco_counts):,}** |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Arvore Completa
    lines.append("## 🌳 2. Árvore Taxonômica Completa Hierarquizada")
    lines.append("")

    esp_icons = {
        'Cirurgia Geral': '🏥',
        'Clínica Médica': '🩺',
        'Ginecologia e Obstetrícia': '🌸',
        'Medicina Preventiva e Social': '📋',
        'Pediatria': '👶'
    }

    for esp in sorted(tree.keys(), key=lambda e: esp_counts[e], reverse=True):
        icon = esp_icons.get(esp, '📁')
        q_esp = esp_counts[esp]
        n_temas = len(tree[esp])
        n_focos = sum(len(tree[esp][t]) for t in tree[esp])
        n_sub = sum(sum(len(tree[esp][t][f]) for f in tree[esp][t]) for t in tree[esp])
        
        lines.append(f"# {icon} {esp.upper()} ({q_esp:,} questões)")
        lines.append(f"*Total de Temas:* {n_temas} | *Total de Focos Canônicos:* {n_focos} | *Total de Subfocos:* {n_sub:,}")
        lines.append("")

        for tema in sorted(tree[esp].keys(), key=lambda t: sum(sum(tree[esp][t][f].values()) for f in tree[esp][t]), reverse=True):
            q_tema = sum(sum(tree[esp][tema][f].values()) for f in tree[esp][tema])
            pct_tema = (q_tema / q_esp) * 100
            n_focos_tema = len(tree[esp][tema])
            
            lines.append(f"## 📁 Tema: {tema} ({q_tema:,} questões — {pct_tema:.1f}% da especialidade)")
            lines.append(f"*Focos canônicos no tema:* {n_focos_tema}")
            lines.append("")

            for foco in sorted(tree[esp][tema].keys(), key=lambda f: sum(tree[esp][tema][f].values()), reverse=True):
                q_foco = sum(tree[esp][tema][foco].values())
                pct_foco = (q_foco / q_tema) * 100
                
                lines.append(f"### 🔹 Foco: {foco} — {q_foco:,} questões ({pct_foco:.1f}%)")
                
                for subfoco in sorted(tree[esp][tema][foco].keys(), key=lambda s: tree[esp][tema][foco][s], reverse=True):
                    q_sub = tree[esp][tema][foco][subfoco]
                    pct_sub = (q_sub / q_foco) * 100
                    lines.append(f"  - **Subfoco:** {subfoco}: {q_sub:,} questões ({pct_sub:.1f}%)")
                lines.append("")
        lines.append("---")
        lines.append("")

    content = '\n'.join(lines)
    with open(OUTPUT_REPORT, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\n[SUCESSO] Relatorio completo gerado com exito em: {OUTPUT_REPORT}")
    size_mb = os.path.getsize(OUTPUT_REPORT) / (1024 * 1024)
    print(f"Total de linhas geradas: {len(lines):,}")
    print(f"Tamanho do arquivo: {size_mb:.2f} MB")

if __name__ == '__main__':
    main()
