import csv
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUESTION_FILES = {
    'cirurgia': 'data/cirurgia_final_questions.json',
    'clinica_medica': 'data/clinica_medica_final_questions.json',
    'ginecologia': 'data/ginecologia_final_questions.json',
    'obstetricia': 'data/obstetricia_final_questions.json',
    'pediatria': 'data/pediatria_final_questions.json',
    'medicina_preventiva': 'data/medicina_preventiva_final_questions.json',
    'urologia': 'data/urologia_final_questions.json'
}

def main():
    # 1. Carregar lista das 43 provas da Etapa 2
    with open('data/relatorio_precoleta_etapas.json', encoding='utf-8') as f:
        d = json.load(f)
        
    p2_list = d['etapa2_oficial_banca']['provas']
    target_exams = set()
    for p in p2_list:
        target_exams.add((p['instituicao'].strip(), p['banca'].strip(), int(p['ano']), p['tipo_prova'].strip()))

    print(f"Total de provas alvo da Etapa 2: {len(target_exams)}")

    # 2. Varrer os arquivos JSON do banco e coletar todas as questões pendentes dessas 43 provas
    missing_by_exam = {}
    total_found = 0

    for esp, filepath in QUESTION_FILES.items():
        with open(filepath, encoding='utf-8') as f:
            questions = json.load(f)

        for idx, q in enumerate(questions):
            ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
            is_anul = bool(q.get('isAnulada') or q.get('is_anulada'))
            if ans or is_anul:
                continue

            inst = (q.get('institution') or 'Não informada').strip()
            banca = (q.get('banca') or inst).strip()
            ano = int(q.get('year') or 0)
            tipo = (q.get('tipo_prova') or q.get('tipoProva') or 'Prova 1 / Regular').strip()
            if tipo == 'Prova 1': tipo = 'Prova 1 / Regular'

            exam_key = (inst, banca, ano, tipo)
            if exam_key in target_exams:
                if exam_key not in missing_by_exam:
                    missing_by_exam[exam_key] = []
                missing_by_exam[exam_key].append({
                    'esp': esp,
                    'idx': idx,
                    'id': q.get('id'),
                    'code': q.get('code'),
                    'num': q.get('numero') or q.get('number'),
                    'statement': q.get('statement') or q.get('enunciado') or '',
                    'options': q.get('options') or []
                })
                total_found += 1

    print(f"Total de questões pendentes encontradas nas 43 provas: {total_found}")

    # Salva json estruturado das pendências da Etapa 2
    output = []
    for (inst, banca, ano, tipo), q_list in missing_by_exam.items():
        output.append({
            'instituicao': inst,
            'banca': banca,
            'ano': ano,
            'tipo_prova': tipo,
            'total_pendentes': len(q_list),
            'questoes': q_list
        })

    output.sort(key=lambda x: x['total_pendentes'], reverse=True)

    with open('data/etapa2_pendencias_detalhadas.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("Salvo data/etapa2_pendencias_detalhadas.json com sucesso!")
    print("\nResumo por Prova:")
    for item in output[:15]:
        print(f"  • {item['ano']} | {item['instituicao'][:40]} | {item['total_pendentes']} pendências")

if __name__ == '__main__':
    main()
