import json
import os
import unicodedata
import re

def norm_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def run_tests():
    print("=== EXECUTANDO BATERIA DE TESTES DA FASE 1.1 E 1.2 ===")
    
    shield_path = 'data/staging/banco_ativo_hashes_shield.json'
    with open(shield_path, 'r', encoding='utf-8') as fp:
        shield = json.load(fp)
    active_300 = shield.get('by_stmt_300', {})

    ineditas_path = 'data/staging/expansao_ineditas_consolidadas.jsonl'
    if not os.path.exists(ineditas_path):
        print(f"Erro: {ineditas_path} nao existe")
        return False

    total_ineditas = 0
    colisoes_com_ativo = 0
    colisoes_internas = 0
    sem_instituicao = 0
    gabaritos_invalidos = 0
    opcoes_invalidas = 0
    enunciados_curtos = 0

    seen_hashes = set()
    sample_institutions = set()

    with open(ineditas_path, 'r', encoding='utf-8') as fp:
        for idx, line in enumerate(fp):
            total_ineditas += 1
            q = json.loads(line)
            
            # 1. Teste de Colisão com Ativo
            stmt = q.get('statement') or ''
            h300 = norm_text(stmt)[:300]
            if h300 in active_300:
                colisoes_com_ativo += 1

            # 2. Teste de Colisão Interna
            if h300 in seen_hashes:
                colisoes_internas += 1
            else:
                seen_hashes.add(h300)

            # 3. Teste de Instituição Preservada
            inst = q.get('institution')
            if not inst or inst == 'N/A' or len(str(inst).strip()) == 0:
                # se for drive_livros pode ter nome do livro
                if q.get('provenance') != 'drive_livros':
                    sem_instituicao += 1
            else:
                if len(sample_institutions) < 15:
                    sample_institutions.add(str(inst))

            # 4. Teste de Gabarito
            gab = q.get('correct_answer')
            if str(gab).strip().upper() not in ['A', 'B', 'C', 'D', 'E', 'ANULADA']:
                gabaritos_invalidos += 1

            # 5. Teste de Enunciado
            if len(stmt.strip()) < 20:
                enunciados_curtos += 1

            if (idx + 1) % 40000 == 0:
                print(f"  Auditadas {idx + 1:,} questões inéditas...")

    print("\n--- RESULTADO DA BATERIA DE TESTES ---")
    t1_1_1 = (colisoes_com_ativo == 0)
    t1_1_2 = (colisoes_internas == 0)
    t1_2_1 = (sem_instituicao == 0)
    t1_2_2 = (enunciados_curtos == 0)
    t1_2_3 = (gabaritos_invalidos == 0)

    print(f"Total de questões inéditas auditadas: {total_ineditas:,}")
    print(f"TEST-1.1.1 (Anti-Colisão com Base Ativa 132k): {'APROVADO' if t1_1_1 else 'REPROVADO'} (Colisões: {colisoes_com_ativo})")
    print(f"TEST-1.1.2 (Anti-Colisão Interna Inter-Acervos): {'APROVADO' if t1_1_2 else 'REPROVADO'} (Colisões: {colisoes_internas})")
    print(f"TEST-1.2.1 (Preservação de Instituições): {'APROVADO' if t1_2_1 else 'REPROVADO'} (Sem instituição: {sem_instituicao})")
    print(f"TEST-1.2.2 (Integridade dos Enunciados): {'APROVADO' if t1_2_2 else 'REPROVADO'} (Curtos: {enunciados_curtos})")
    print(f"TEST-1.2.3 (Validade do Gabarito Oficial): {'APROVADO' if t1_2_3 else 'REPROVADO'} (Inválidos: {gabaritos_invalidos})")

    print(f"\nAmostra de Instituições/Bancas Preservadas ({len(sample_institutions)}):")
    for s in list(sample_institutions)[:10]:
        print(f"  • {s}")

    all_passed = t1_1_1 and t1_1_2 and t1_2_1 and t1_2_2 and t1_2_3
    print(f"\nSTATUS GERAL DA BATERIA DE TESTES: {'100% APROVADO' if all_passed else 'REPROVADO'}")
    return all_passed

if __name__ == '__main__':
    run_tests()

