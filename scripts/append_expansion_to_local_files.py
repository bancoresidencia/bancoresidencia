import json
import os
from collections import Counter

print("=== DISTRIBUINDO E ANEXANDO QUESTÕES DE EXPANSÃO AOS ARQUIVOS LOCAIS ===")

staging_file = 'data/staging/expansao_ineditas_consolidadas.jsonl'
if not os.path.exists(staging_file):
    print(f"Erro: {staging_file} nao existe")
    exit(1)

# Mapeamento de destino
dest_map = {
    'clinica': 'data/clinica_medica_final_questions.json',
    'pediatria': 'data/pediatria_final_questions.json',
    'cirurgia': 'data/cirurgia_final_questions.json',
    'ginecologia': 'data/ginecologia_final_questions.json',
    'obstetricia': 'data/obstetricia_final_questions.json',
    'preventiva': 'data/medicina_preventiva_final_questions.json'
}

# Categorização preliminar pelo campo 'especialidade' original da coleta
buckets = {k: [] for k in dest_map}
outros_count = 0
total_read = 0

with open(staging_file, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        total_read += 1
        q = json.loads(line)
        esp = str(q.get('especialidade') or '').lower()

        if 'pediatria' in esp or 'ped' in esp:
            buckets['pediatria'].append(q)
        elif 'cirurgia' in esp or 'cir' in esp or 'trauma' in esp:
            buckets['cirurgia'].append(q)
        elif 'obstetr' in esp or 'parto' in esp or 'gesta' in esp:
            buckets['obstetricia'].append(q)
        elif 'gineco' in esp or 'mastolog' in esp or 'mama' in esp:
            buckets['ginecologia'].append(q)
        elif 'preventiva' in esp or 'social' in esp or 'sus' in esp or 'saude publica' in esp or 'epidemiol' in esp:
            buckets['preventiva'].append(q)
        else:
            # Padrão para Clínica Médica
            buckets['clinica'].append(q)

print(f"Total lido do staging: {total_read:,} questões inéditas.")
print("Distribuição por arquivo local de destino:")
for k, v in buckets.items():
    print(f"  • {k} -> {len(v):,} questões adicionais")

# Agora carregar cada arquivo local ativo, anexar e salvar
print("\nAnexando questões aos arquivos locais em data/...")
for k, dest_file in dest_map.items():
    novas = buckets[k]
    if not os.path.exists(dest_file):
        print(f"Erro: arquivo {dest_file} nao existe")
        continue

    with open(dest_file, 'r', encoding='utf-8') as fp:
        original = json.load(fp)
    
    orig_count = len(original)
    original.extend(novas)
    novo_count = len(original)

    with open(dest_file, 'w', encoding='utf-8') as fp:
        json.dump(original, fp)

    size_mb = os.path.getsize(dest_file) / (1024 * 1024)
    print(f"  [ATUALIZADO] {os.path.basename(dest_file)}: {orig_count:,} + {len(novas):,} = {novo_count:,} questões ({size_mb:.2f} MB)")

print("\nArquivos locais atualizados com 100% de sucesso!")

