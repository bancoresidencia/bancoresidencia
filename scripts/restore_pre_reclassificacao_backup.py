"""
Script de Restauracao dos Filtros Originais Pre-Reclassificacao
Restaura os 6 arquivos de data/ a partir de:
data/backups/pre_reclassificacao_filtros_originais_259k/
Reestabelecendo exatamente as especialidades, temas, focos e subfocos
que existiam antes da reclassificacao inicial.
"""

import os, sys, json, hashlib, shutil

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'd:\bancoresidencia'
DATA_DIR = os.path.join(BASE_DIR, 'data')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups', 'pre_reclassificacao_filtros_originais_259k')
MANIFEST_PATH = os.path.join(BACKUP_DIR, 'manifest_backup_pre_reclassificacao.json')

FILES = [
    'medicina_preventiva_final_questions.json',
    'pediatria_final_questions.json',
    'cirurgia_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'clinica_medica_final_questions.json'
]

def compute_md5(filepath):
    md5 = hashlib.md5()
    with open(filepath, 'rb') as f:
        while chunk := f.read(1024 * 1024 * 8):
            md5.update(chunk)
    return md5.hexdigest()

def main():
    print("=================================================================")
    print("[RESTAURACAO] REESTABELECENDO FILTROS PRE-RECLASSIFICACAO")
    print("=================================================================")

    if not os.path.exists(MANIFEST_PATH):
        print(f"Erro: {MANIFEST_PATH} nao encontrado!")
        sys.exit(1)

    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    print(f"Manifesto carregado. Criado em: {manifest.get('timestamp')}")
    print(f"Total esperado: {manifest.get('total_questoes'):,} questoes.\n")

    total_restored = 0
    for filename in FILES:
        src = os.path.join(BACKUP_DIR, filename)
        dst = os.path.join(DATA_DIR, filename)

        if not os.path.exists(src):
            print(f"Erro: Arquivo {src} nao encontrado!")
            sys.exit(1)

        src_md5 = compute_md5(src)
        expected_md5 = manifest['arquivos'][filename]['md5']
        if src_md5 != expected_md5:
            print(f"Erro de integridade em {filename}! MD5 divergente.")
            sys.exit(1)

        print(f"Restaurando {filename}...")
        shutil.copy2(src, dst)
        
        with open(dst, 'r', encoding='utf-8') as f:
            count = len(json.load(f))
            total_restored += count
        size_mb = os.path.getsize(dst) / (1024 * 1024)
        print(f"  [OK] {filename}: {count:,} questoes ({size_mb:.2f} MB)")

    print(f"\n[SUCESSO] Total de {total_restored:,} questoes restauradas com os filtros originais pre-reclassificacao!")

if __name__ == '__main__':
    main()

