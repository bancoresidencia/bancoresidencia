"""
Script de Backup Duplo Rigoroso:
1. data/backups/pre_reclassificacao_filtros_originais_259k:
   Estado das 258.953 questoes antes da reclassificacao da Etapa 2 (132k originais + 125k expansao com filtros brutos).
2. data/backups/pre_mesclagem_focos_259k:
   Estado das 258.953 questoes agora, reclassificadas na Etapa 2, imediatamente antes da mesclagem de focos (Fase 0).
"""

import os
import sys
import json
import hashlib
import shutil
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'd:\bancoresidencia'
DATA_DIR = os.path.join(BASE_DIR, 'data')
BACKUP_BASE = os.path.join(DATA_DIR, 'backups')
STAGING_DIR = os.path.join(DATA_DIR, 'staging')

FILES = [
    'medicina_preventiva_final_questions.json',
    'pediatria_final_questions.json',
    'cirurgia_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'clinica_medica_final_questions.json'
]

def compute_checksums(filepath):
    md5 = hashlib.md5()
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(1024 * 1024 * 8):
            md5.update(chunk)
            sha256.update(chunk)
    return md5.hexdigest(), sha256.hexdigest()

def backup_pre_mesclagem():
    print("\n=======================================================")
    print("[FASE 0] CRIANDO BACKUP PRE-MESCLAGEM (ESTADO ATUAL 259K)")
    print("=======================================================")
    
    target_dir = os.path.join(BACKUP_BASE, 'pre_mesclagem_focos_259k')
    os.makedirs(target_dir, exist_ok=True)
    
    manifest = {
        "timestamp": datetime.now().isoformat(),
        "descricao": "Backup de seguranca absoluto antes da mesclagem e harmonizacao canonica de focos (Fase 0 do Plano Mestre)",
        "total_questoes": 0,
        "arquivos": {}
    }
    
    total_q = 0
    for filename in FILES:
        src = os.path.join(DATA_DIR, filename)
        dst = os.path.join(target_dir, filename)
        
        print(f"Copiando {filename}...")
        shutil.copy2(src, dst)
        
        with open(dst, 'r', encoding='utf-8') as f:
            data = json.load(f)
            count = len(data)
            total_q += count
            
        md5, sha256 = compute_checksums(dst)
        size_mb = os.path.getsize(dst) / (1024 * 1024)
        
        manifest["arquivos"][filename] = {
            "questoes": count,
            "tamanho_mb": round(size_mb, 2),
            "md5": md5,
            "sha256": sha256
        }
        print(f"  -> {filename}: {count:,} questoes ({size_mb:.2f} MB) | MD5: {md5[:12]}...")
        
    manifest["total_questoes"] = total_q
    
    manifest_path = os.path.join(target_dir, 'manifest_backup_pre_mesclagem.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    print(f"\n[OK] Backup pre-mesclagem concluido com exito em: {target_dir}")
    print(f"Total de questoes preservadas: {total_q:,}")
    return target_dir, manifest

def backup_pre_reclassificacao():
    print("\n=========================================================================")
    print("[BACKUP ADICIONAL] RECRIANDO E VALIDANDO ESTADO PRE-RECLASSIFICACAO 259K")
    print("=========================================================================")
    
    target_dir = os.path.join(BACKUP_BASE, 'pre_reclassificacao_filtros_originais_259k')
    os.makedirs(target_dir, exist_ok=True)
    
    pre_etapa1_dir = os.path.join(BACKUP_BASE, 'pre_etapa1_expansao_20261106')
    staging_file = os.path.join(STAGING_DIR, 'expansao_ineditas_consolidadas.jsonl')
    
    if not os.path.exists(pre_etapa1_dir):
        print(f"Erro: {pre_etapa1_dir} nao existe!")
        return None
    if not os.path.exists(staging_file):
        print(f"Erro: {staging_file} nao existe!")
        return None
        
    # Carregar buckets de expansao
    print("Carregando 125.988 questoes originais de expansao...")
    dest_map = {
        'clinica': 'clinica_medica_final_questions.json',
        'pediatria': 'pediatria_final_questions.json',
        'cirurgia': 'cirurgia_final_questions.json',
        'ginecologia': 'ginecologia_final_questions.json',
        'obstetricia': 'obstetricia_final_questions.json',
        'preventiva': 'medicina_preventiva_final_questions.json'
    }
    buckets = {k: [] for k in dest_map}
    
    with open(staging_file, 'r', encoding='utf-8') as fp:
        for line in fp:
            if not line.strip():
                continue
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
                buckets['clinica'].append(q)
                
    manifest = {
        "timestamp": datetime.now().isoformat(),
        "descricao": "Backup de preservacao do acervo integrado com os filtros originais (pre-reclassificacao Etapa 2)",
        "total_questoes": 0,
        "arquivos": {}
    }
    
    total_q = 0
    for k, filename in dest_map.items():
        src_orig = os.path.join(pre_etapa1_dir, filename)
        dst_file = os.path.join(target_dir, filename)
        
        with open(src_orig, 'r', encoding='utf-8') as f:
            questions = json.load(f)
            
        orig_count = len(questions)
        novas = buckets[k]
        questions.extend(novas)
        total_file = len(questions)
        total_q += total_file
        
        with open(dst_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False)
            
        md5, sha256 = compute_checksums(dst_file)
        size_mb = os.path.getsize(dst_file) / (1024 * 1024)
        
        manifest["arquivos"][filename] = {
            "questoes": total_file,
            "originais_132k": orig_count,
            "expansao_adicionada": len(novas),
            "tamanho_mb": round(size_mb, 2),
            "md5": md5,
            "sha256": sha256
        }
        print(f"  -> {filename}: {orig_count:,} + {len(novas):,} = {total_file:,} q ({size_mb:.2f} MB)")
        
    manifest["total_questoes"] = total_q
    manifest_path = os.path.join(target_dir, 'manifest_backup_pre_reclassificacao.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    print(f"\n[OK] Backup pre-reclassificacao concluido com exito em: {target_dir}")
    print(f"Total de questoes preservadas: {total_q:,}")
    return target_dir, manifest

if __name__ == '__main__':
    # 1. Backup pre-reclassificacao (filtros originais 259k)
    backup_pre_reclassificacao()
    # 2. Backup pre-mesclagem (filtros etapa 2 atuais 259k - Fase 0)
    backup_pre_mesclagem()

