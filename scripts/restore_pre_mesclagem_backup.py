"""
Script de Restauracao Atomica para o Backup Pre-Mesclagem (Fase 0)
Restaura os 6 arquivos de data/ a partir de data/backups/pre_mesclagem_focos_259k
validando MD5 e contagens.
"""

import os
import sys
import json
import hashlib
import shutil

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'd:\bancoresidencia'
DATA_DIR = os.path.join(BASE_DIR, 'data')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups', 'pre_mesclagem_focos_259k')
MANIFEST_PATH = os.path.join(BACKUP_DIR, 'manifest_backup_pre_mesclagem.json')

def compute_md5(filepath):
    md5 = hashlib.md5()
    with open(filepath, 'rb') as f:
        while chunk := f.read(1024 * 1024 * 8):
            md5.update(chunk)
    return md5.hexdigest()

def restore():
    print("=================================================================")
    print("[RESTAURACAO DE SEGURANCA] RESTAURANDO BACKUP PRE-MESCLAGEM")
    print("=================================================================")
    
    if not os.path.exists(MANIFEST_PATH):
        print(f"Erro critico: Manifesto {MANIFEST_PATH} nao encontrado!")
        sys.exit(1)
        
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
        
    print(f"Manifesto carregado. Criado em: {manifest['timestamp']}")
    print(f"Total esperado: {manifest['total_questoes']:,} questoes.\n")
    
    for filename, info in manifest['arquivos'].items():
        src = os.path.join(BACKUP_DIR, filename)
        dst = os.path.join(DATA_DIR, filename)
        
        if not os.path.exists(src):
            print(f"Erro: Arquivo de backup {src} nao encontrado!")
            sys.exit(1)
            
        src_md5 = compute_md5(src)
        if src_md5 != info['md5']:
            print(f"Erro: Corrupcao no backup para {filename}! Esperado MD5 {info['md5']}, obtido {src_md5}")
            sys.exit(1)
            
        print(f"Restaurando {filename} -> {info['questoes']:,} questoes...")
        shutil.copy2(src, dst)
        
    print("\n[SUCESSO] Todos os 6 arquivos foram restaurados e verificados com exito!")

if __name__ == '__main__':
    restore()

