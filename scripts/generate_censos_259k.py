import json
import os
from collections import defaultdict

def generate_censos():
    print("=" * 70)
    print("[CENSO] GERANDO CENSOS MESTRES CONSOLIDADOS - 258.953 QUESTOES")
    print("=" * 70)

    files = [
        ('Medicina Preventiva e Social', 'data/medicina_preventiva_final_questions.json'),
        ('Pediatria', 'data/pediatria_final_questions.json'),
        ('Cirurgia Geral', 'data/cirurgia_final_questions.json'),
        ('Ginecologia e Obstetricia (G)', 'data/ginecologia_final_questions.json'),
        ('Ginecologia e Obstetricia (O)', 'data/obstetricia_final_questions.json'),
        ('Clinica Medica', 'data/clinica_medica_final_questions.json')
    ]

    # Estrutura: especialidade -> tema -> foco -> { "total": int, "subfocos": { subfoco: int } }
    censo = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {'total': 0, 'subfocos': defaultdict(int)})))
    
    total_questions = 0
    modalidade_dist = defaultdict(int)

    for label, path in files:
        if not os.path.exists(path):
            print(f"[ERRO] Arquivo nao encontrado: {path}")
            continue
        print(f"Carregando {label} ({path})...")
        with open(path, 'r', encoding='utf-8') as fp:
            questions = json.load(fp)
        
        for q in questions:
            total_questions += 1
            esp = q.get('especialidade') or 'Clínica Médica'
            tema = q.get('tema') or 'Geral'
            foco = q.get('foco') or 'Geral'
            subfoco = q.get('subfoco') or 'Geral'
            mod = q.get('modalidade') or 'Residência Médica (Acesso Direto)'

            modalidade_dist[mod] += 1
            node = censo[esp][tema][foco]
            node['total'] += 1
            node['subfocos'][subfoco] += 1

    print(f"\nTotal consolidado: {total_questions:,} questoes.")

    # Converter defaultdict para dict serializável
    serializable_censo = {}
    for esp, temas in sorted(censo.items()):
        serializable_censo[esp] = {}
        for tema, focos in sorted(temas.items()):
            serializable_censo[esp][tema] = {}
            for foco, data in sorted(focos.items(), key=lambda x: -x[1]['total']):
                serializable_censo[esp][tema][foco] = {
                    'total': data['total'],
                    'subfocos': dict(sorted(data['subfocos'].items(), key=lambda x: -x[1]))
                }

    os.makedirs('.reports/recategorizacao', exist_ok=True)
    os.makedirs('.reports/recategorizacao/harmonizada', exist_ok=True)

    out_file1 = '.reports/recategorizacao/censo_mestre_consolidado_259k.json'
    with open(out_file1, 'w', encoding='utf-8') as fp:
        json.dump(serializable_censo, fp, ensure_ascii=False, indent=2)
    print(f"[OK] Salvo: {out_file1}")

    out_file2 = '.reports/recategorizacao/harmonizada/censo_mestre_harmonizado_259k.json'
    with open(out_file2, 'w', encoding='utf-8') as fp:
        json.dump(serializable_censo, fp, ensure_ascii=False, indent=2)
    print(f"[OK] Salvo: {out_file2}")

    # Relatório resumido
    print("\n" + "=" * 70)
    print("DISTRIBUICAO CONSOLIDADA POR GRANDE AREA (5 CANONICAS):")
    print("=" * 70)
    for esp, temas in serializable_censo.items():
        esp_total = sum(f_data['total'] for t in temas.values() for f_data in t.values())
        print(f"* {esp:35s}: {esp_total:7,d} questoes ({len(temas)} temas)")

    print("\n" + "=" * 70)
    print("DISTRIBUICAO POR MODALIDADE:")
    print("=" * 70)
    for mod, count in sorted(modalidade_dist.items(), key=lambda x: -x[1]):
        pct = (count / total_questions) * 100
        print(f"* {mod:35s}: {count:7,d} ({pct:5.1f}%)")
    print("=" * 70)

if __name__ == '__main__':
    generate_censos()
