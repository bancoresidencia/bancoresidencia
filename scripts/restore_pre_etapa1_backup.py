import os
import shutil
import hashlib
import json
import sys

backup_dir = 'data/backups/pre_etapa1_expansao_20261106'
manifest_path = os.path.join(backup_dir, 'manifest_backup.json')

if not os.path.exists(manifest_path):
    print(f"Erro: manifesto de backup nao encontrado em {manifest_path}")
    sys.exit(1)

with open(manifest_path, 'r', encoding='utf-8') as fp:
    manifest = json.load(fp)

print("Iniciando restauracao do backup pre-etapa 1...")
for orig_path, info in manifest.items():
    src = info['backup_path']
    if not os.path.exists(src):
        print(f"Erro: arquivo de backup ausente: {src}")
        sys.exit(1)
    
    # verificar hash
    with open(src, 'rb') as fp:
        md5 = hashlib.md5(fp.read()).hexdigest()
    if md5 != info['md5']:
        print(f"Erro: checksum de {src} corrompido! Esperado: {info['md5']}, Obtido: {md5}")
        sys.exit(1)

    shutil.copy2(src, orig_path)
    print(f"  [RESTAURADO COM SUCESSO] {orig_path} ({info['size_mb']} MB)")

print("\nRestauracao concluida com 100% de integridade!")

