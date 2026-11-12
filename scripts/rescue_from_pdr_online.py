import sys
import os
sys.path.append('scripts/coletor_provaderesidencia')
import config
import requests
from bs4 import BeautifulSoup
import re
import json
import sqlite3
import io
from PIL import Image

print("=" * 80)
print("🚀 RESGATE DE IMAGENS DE PROVAS ONLINE ACESSÍVEIS NA PROVADERESIDENCIA.COM.BR")
print("=" * 80)

# 1. Carregar catálogo de faltantes
with open('data/supabase_tables/gate6_missing_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f).get('catalog', [])

print(f"Total de questões pendentes no catálogo do Gate 6: {len(catalog)}")

# Criar dicionário indexado para busca rápida
# Extrair 30 caracteres centrais/significativos do enunciado para matching
missing_by_banca_year = {}
for q in catalog:
    b = (q.get('banca') or q.get('institution') or 'OUTROS').strip().lower()
    y = str(q.get('year') or 0)
    key = f"{b}_{y}"
    if key not in missing_by_banca_year:
        missing_by_banca_year[key] = []
    missing_by_banca_year[key].append(q)

# 2. Carregar exames mapeados
with open('data/supabase_tables/pdr_online_matched_exams.json', 'r', encoding='utf-8') as f:
    matched_data = json.load(f)

# Obter lista de exames únicos com seus grupos
unique_exams_to_process = {}
for g in matched_data['matched_groups']:
    banca_norm = g['banca'].lower()
    year_str = g['year']
    for exam in g['candidate_online_exams']:
        eid = exam['id']
        if eid not in unique_exams_to_process:
            unique_exams_to_process[eid] = {
                "id": eid,
                "title": exam['title'],
                "banca": g['banca'],
                "year": year_str,
                "missing_questions": g['questions']
            }
        else:
            unique_exams_to_process[eid]["missing_questions"].extend(g['questions'])

print(f"Total de provas online candidatas para verificar: {len(unique_exams_to_process)}")

s = requests.Session()
s.headers.update(config.HEADERS)
s.cookies.update(config.COOKIES)

def normalize_text(txt):
    if not txt: return ""
    txt = txt.lower()
    txt = re.sub(r'[^\w\s]', ' ', txt)
    return " ".join(txt.split())

os.makedirs('data/imagens_resgatadas_gate6', exist_ok=True)
db_staging = sqlite3.connect('data/supabase_tables/supabase_tables.db')
db_staging.row_factory = sqlite3.Row

# Pre-carregar todos os enunciados completos das questões faltantes
staging_missing_records = {}
cur = db_staging.cursor()
for q in catalog:
    cur.execute("SELECT id, code, banca, institution, year, statement, options, images FROM questions_curated_staging WHERE id = ?", (q['id'],))
    row = cur.fetchone()
    if row:
        stmt = row['statement'] or ""
        stmt_norm = normalize_text(stmt)
        # 40 chars significativos
        sig = stmt_norm[:120]
        staging_missing_records[q['id']] = {
            "id": row['id'],
            "code": row['code'],
            "banca": row['banca'],
            "year": row['year'],
            "statement": stmt,
            "statement_norm": stmt_norm,
            "signature": sig,
            "options": row['options'],
            "images": row['images']
        }

print(f"Registros completos de faltantes carregados da staging: {len(staging_missing_records)}")

rescued_count = 0
rescued_items = []
tested_exams_count = 0
accessible_exams_count = 0

for eid, edata in unique_exams_to_process.items():
    tested_exams_count += 1
    exam_url = f"https://provaderesidencia.com.br/premium/prova/{eid}/"
    try:
        r = s.get(exam_url, timeout=12)
        if 'escolher-plano' in r.url or r.status_code != 200:
            # Prova restrita ao plano pago
            continue
        
        accessible_exams_count += 1
        print(f"\n🔎 [{tested_exams_count}/{len(unique_exams_to_process)}] Prova #{eid}: {edata['title']} -> ACESSÍVEL!")
        
        soup = BeautifulSoup(r.text, 'html.parser')
        q_links = soup.find_all('a', href=re.compile(r'/premium/questao/(\d+)/'))
        print(f"   Total de links de questões na prova: {len(q_links)}")
        
        for ql in q_links:
            m_qid = re.search(r'/premium/questao/(\d+)/', ql['href'])
            if not m_qid: continue
            qid = m_qid.group(1)
            q_url = f"https://provaderesidencia.com.br/premium/questao/{qid}/"
            
            try:
                rq = s.get(q_url, timeout=10)
                if rq.status_code != 200: continue
                
                sq = BeautifulSoup(rq.text, 'html.parser')
                # Verificar se tem imagens S3
                s3_imgs = []
                for img in sq.find_all('img'):
                    src = img.get('src') or ''
                    if 's3.amazonaws.com' in src and 'logox' not in src:
                        s3_imgs.append(src)
                
                if not s3_imgs:
                    # Não tem imagem relevante
                    continue
                
                # Extrair texto do enunciado
                form = sq.find('form')
                if not form: continue
                h3 = form.parent.find('h3')
                if not h3: continue
                
                parts = []
                for sib in h3.next_siblings:
                    if sib == form: break
                    txt = sib.get_text(strip=True) if hasattr(sib, 'get_text') else str(sib).strip()
                    if txt: parts.append(txt)
                online_stmt = " ".join(parts)
                online_stmt_norm = normalize_text(online_stmt)
                
                if len(online_stmt_norm) < 20: continue
                
                # Cruzar com faltantes candidatos
                matched_staging_id = None
                for mid, mdata in staging_missing_records.items():
                    # Verificar se banca/ano batem ou se snippet exato está no enunciado
                    if mdata["statement_norm"][:80] in online_stmt_norm or online_stmt_norm[:80] in mdata["statement_norm"]:
                        matched_staging_id = mid
                        break
                    # Alternativa: overlap de palavras
                    if len(mdata["signature"]) > 40 and mdata["signature"][:60] in online_stmt_norm:
                        matched_staging_id = mid
                        break
                
                if matched_staging_id:
                    target_rec = staging_missing_records[matched_staging_id]
                    print(f"   🎯 MATCH ENCONTRADO! Questão Staging {target_rec['id']}")
                    print(f"      Imagens S3 ({len(s3_imgs)}): {s3_imgs}")
                    
                    # Baixar e converter imagens para WebP
                    saved_webp_paths = []
                    for idx, img_url in enumerate(s3_imgs, 1):
                        res_img = s.get(img_url, timeout=15)
                        if res_img.status_code == 200:
                            img_obj = Image.open(io.BytesIO(res_img.content))
                            if img_obj.mode in ('RGBA', 'LA') or (img_obj.mode == 'P' and 'transparency' in img_obj.info):
                                pass
                            elif img_obj.mode != 'RGB':
                                img_obj = img_obj.convert('RGB')
                            
                            filename = f"q_online_{qid}_{idx}.webp"
                            local_path = f"data/imagens_resgatadas_gate6/{filename}"
                            img_obj.save(local_path, format='WEBP', quality=88, method=6)
                            storage_path = f"/storage/questoes/imagens_resgatadas_gate6/{filename}"
                            saved_webp_paths.append(storage_path)
                    
                    if saved_webp_paths:
                        # Injetar tags [IMAGEM 1] no enunciado
                        orig_stmt = target_rec['statement']
                        new_stmt = orig_stmt
                        for i in range(1, len(saved_webp_paths) + 1):
                            if f"[IMAGEM {i}]" not in new_stmt:
                                new_stmt += f"\n\n[IMAGEM {i}]"
                        
                        images_json = json.dumps(saved_webp_paths)
                        
                        # Atualizar banco staging
                        with db_staging:
                            db_staging.execute("""
                                UPDATE questions_curated_staging
                                SET images = ?, statement = ?
                                WHERE id = ?
                            """, (images_json, new_stmt, matched_staging_id))
                        
                        rescued_count += 1
                        rescued_items.append({
                            "staging_id": matched_staging_id,
                            "online_qid": qid,
                            "exam_id": eid,
                            "images": saved_webp_paths
                        })
                        # Remover do cache em memória para não duplicar
                        del staging_missing_records[matched_staging_id]
                        print(f"      ✅ Sucesso! Questão atualizada na staging com {len(saved_webp_paths)} imagem(ns) WebP.")
                        
            except Exception as eq:
                pass
                
    except Exception as ee:
        pass

print("\n" + "=" * 80)
print(f"🏁 RESGATE ONLINE FINALIZADO:")
print(f"Provas testadas: {tested_exams_count}")
print(f"Provas acessíveis: {accessible_exams_count}")
print(f"Questões resgatadas e atualizadas: {rescued_count}")
print("=" * 80)

# Salvar relatório do resgate online
with open('data/supabase_tables/pdr_online_rescue_log.json', 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": "2026-11-12",
        "rescued_count": rescued_count,
        "rescued_items": rescued_items
    }, f, indent=2, ensure_ascii=False)

