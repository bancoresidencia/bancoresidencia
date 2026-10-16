import os
import sys
import json
import re
import unicodedata
import sqlite3
import time
from datetime import datetime
import fitz

# Garante saída UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DRIVE_DIR = os.path.join(BASE_DIR, 'docs', 'driveprojetorapido')
DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')

QUESTION_FILES = {
    'urologia': os.path.join(DATA_DIR, 'urologia_final_questions.json'),
    'ginecologia': os.path.join(DATA_DIR, 'ginecologia_final_questions.json'),
    'cirurgia': os.path.join(DATA_DIR, 'cirurgia_final_questions.json'),
    'obstetricia': os.path.join(DATA_DIR, 'obstetricia_final_questions.json'),
    'pediatria': os.path.join(DATA_DIR, 'pediatria_final_questions.json'),
    'medicina_preventiva': os.path.join(DATA_DIR, 'medicina_preventiva_final_questions.json'),
    'clinica_medica': os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')
}

def norm_hash(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:90]

def norm_hash_long(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:160]

def init_drive_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS drive_matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            questao_banco_id TEXT,
            especialidade TEXT,
            pdf_path TEXT,
            pdf_name TEXT,
            uf TEXT,
            numero INTEGER,
            gabarito TEXT,
            matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS drive_novas_questoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pdf_path TEXT,
            pdf_name TEXT,
            uf TEXT,
            numero INTEGER,
            enunciado TEXT,
            gabarito TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def extract_gabaritos_from_page(page):
    words = page.get_text('words')
    num_tokens = [w for w in words if w[4].isdigit() and 1 <= int(w[4]) <= 250]
    ans_tokens = [w for w in words if w[4] in ['A', 'B', 'C', 'D', 'E', '!']]
    
    gabaritos = {}
    for n in num_tokens:
        num = int(n[4])
        # Alinhamento horizontal no grid MedGrupo
        matching_ans = [a for a in ans_tokens if abs(a[1] - n[1]) < 9 and 10 < (a[0] - n[0]) < 45]
        if matching_ans:
            best = min(matching_ans, key=lambda a: a[0] - n[0])
            gabaritos[num] = best[4]
            
    # Se método por grid falhou ou extraiu pouco, tenta regex linha a linha
    if len(gabaritos) < 5:
        text = page.get_text('text')
        # Procura linhas tipo: 1 - A, 1. A, 1) A
        for m in re.finditer(r'(?:^|\n)\s*(\d{1,3})\s*[-.)]\s*([A-E!])(?:\s|$)', text, re.MULTILINE):
            num = int(m.group(1))
            gabaritos[num] = m.group(2)
            
    return gabaritos

def parse_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        return None, []
        
    total_pages = len(doc)
    if total_pages < 2:
        doc.close()
        return None, []
        
    # Testa última página e depois penúltima
    gabaritos = extract_gabaritos_from_page(doc[-1])
    gabarito_page_idx = total_pages - 1
    
    if not gabaritos and total_pages > 2:
        gabaritos = extract_gabaritos_from_page(doc[-2])
        if gabaritos:
            gabarito_page_idx = total_pages - 2
            
    if not gabaritos:
        doc.close()
        return None, []
        
    # Extrai o texto de todas as páginas de questões (antes da página de gabarito)
    full_text = ''
    for i in range(gabarito_page_idx):
        text = doc[i].get_text('text')
        lines = text.split('\n')
        clean_lines = []
        for line in lines:
            if 'Impress' in line or 'arearestrita' in line or 'provaimpressa.aspx' in line:
                continue
            if re.match(r'^\d+/\d+$', line.strip()):
                continue
            clean_lines.append(line)
        full_text += '\n'.join(clean_lines) + '\n'
        
    doc.close()
    
    # Extrai questões
    pattern = re.compile(r'(?:\n|^)(\d{1,3})\)\s*')
    matches = list(pattern.finditer(full_text))
    
    questions = []
    for i in range(len(matches)):
        start = matches[i].end()
        end = matches[i+1].start() if i + 1 < len(matches) else len(full_text)
        q_num = int(matches[i].group(1))
        q_body = full_text[start:end].strip()
        
        # Isola enunciado antes da opção A
        m_a = re.search(r'(?:\n|^)[A-E]\)\s*', q_body)
        statement = q_body[:m_a.start()].strip() if m_a else q_body
        
        gab = gabaritos.get(q_num)
        questions.append({
            'numero': q_num,
            'enunciado': statement,
            'gabarito': gab
        })
        
    return gabaritos, questions

def main():
    print("=" * 80)
    print(" 🚀 PROCESSADOR EM MASSA: DRIVE PROJETO RÁPIDO -> BANCO DE QUESTÕES")
    print(f" 🕒 Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    init_drive_db()
    
    # 1. Carrega todas as questões do banco do usuário e indexa as pendentes
    print("\n📂 Carregando banco de questões e indexando pendências...")
    user_bank = {}
    missing_index_short = {}
    missing_index_long = {}
    total_bank_questions = 0
    total_missing_before = 0
    
    for esp, filepath in QUESTION_FILES.items():
        if not os.path.exists(filepath):
            continue
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                questions = json.load(f)
                user_bank[esp] = questions
                total_bank_questions += len(questions)
                
                for idx, q in enumerate(questions):
                    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
                    is_anulada = bool(q.get('isAnulada') or q.get('is_anulada'))
                    
                    if not ans and not is_anulada:
                        total_missing_before += 1
                        st = q.get('statement') or q.get('enunciado') or ''
                        h_short = norm_hash(st)
                        h_long = norm_hash_long(st)
                        
                        if len(h_short) >= 20:
                            if h_short not in missing_index_short:
                                missing_index_short[h_short] = []
                            missing_index_short[h_short].append((esp, idx, q))
                            
                        if len(h_long) >= 40:
                            if h_long not in missing_index_long:
                                missing_index_long[h_long] = []
                            missing_index_long[h_long].append((esp, idx, q))
        except Exception as e:
            print(f"❌ Erro ao carregar {filepath}: {e}")
            
    print(f"📊 Banco carregado: {total_bank_questions:,} questões.")
    print(f"🎯 Pendentes de gabarito antes do processamento: {total_missing_before:,}")
    print(f"🔑 Chaves indexadas: {len(missing_index_short):,} curtas / {len(missing_index_long):,} longas.")
    
    # 2. Localiza todos os arquivos PDF
    pdf_list = []
    for root, dirs, files in os.walk(DRIVE_DIR):
        for f in files:
            if f.lower().endswith('.pdf'):
                rel_root = os.path.relpath(root, DRIVE_DIR)
                parts = rel_root.split(os.sep)
                uf = parts[0] if parts and len(parts[0]) == 2 else 'BR'
                pdf_list.append({
                    'path': os.path.join(root, f),
                    'name': f,
                    'uf': uf
                })
                
    print(f"\n📚 Total de PDFs encontrados no drive: {len(pdf_list)}")
    
    # 3. Processamento
    t_start = time.time()
    matches_by_esp = {esp: 0 for esp in QUESTION_FILES}
    total_gabs_found = 0
    total_questions_parsed = 0
    successful_pdfs = 0
    failed_pdfs = 0
    
    db_conn = sqlite3.connect(DB_PATH)
    cur = db_conn.cursor()
    
    print("\n⚡ Iniciando varredura e cruzamento ultrarrápido...")
    
    for idx_pdf, p_info in enumerate(pdf_list, 1):
        gabaritos, questions = parse_pdf(p_info['path'])
        if not gabaritos or not questions:
            failed_pdfs += 1
            continue
            
        successful_pdfs += 1
        total_gabs_found += len(gabaritos)
        total_questions_parsed += len(questions)
        
        pdf_matched = 0
        for q in questions:
            gab = q['gabarito']
            if not gab:
                continue
                
            statement = q['enunciado']
            h_short = norm_hash(statement)
            h_long = norm_hash_long(statement)
            
            candidates = missing_index_short.get(h_short) or missing_index_long.get(h_long)
            if not candidates:
                # Salva no SQLite como nova questão para não perder
                cur.execute('''
                    INSERT INTO drive_novas_questoes (pdf_path, pdf_name, uf, numero, enunciado, gabarito)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (p_info['path'], p_info['name'], p_info['uf'], q['numero'], statement[:1500], gab))
                continue
                
            # Cruza com os candidatos do banco
            for esp, q_idx, bank_q in candidates:
                ans_check = (bank_q.get('correctAnswer') or bank_q.get('correct_answer') or '').strip()
                is_anulada_check = bool(bank_q.get('isAnulada') or bank_q.get('is_anulada'))
                
                if not ans_check and not is_anulada_check:
                    # Aplica o gabarito
                    if gab == '!':
                        bank_q['isAnulada'] = True
                        bank_q['is_anulada'] = True
                    else:
                        bank_q['correctAnswer'] = gab
                        bank_q['correct_answer'] = gab
                        
                    matches_by_esp[esp] += 1
                    pdf_matched += 1
                    
                    cur.execute('''
                        INSERT INTO drive_matches (questao_banco_id, especialidade, pdf_path, pdf_name, uf, numero, gabarito)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (bank_q.get('id') or f"{esp}_{q_idx}", esp, p_info['path'], p_info['name'], p_info['uf'], q['numero'], gab))
                    break
                    
        if idx_pdf % 50 == 0 or idx_pdf == len(pdf_list):
            total_matches_now = sum(matches_by_esp.values())
            print(f"[{idx_pdf}/{len(pdf_list)}] PDFs processados | Gabaritos no Drive: {total_gabs_found:,} | Gabaritos Aplicados no Banco: {total_matches_now:,}")
            db_conn.commit()
            
    db_conn.commit()
    db_conn.close()
    
    elapsed = time.time() - t_start
    total_matches = sum(matches_by_esp.values())
    
    print("\n" + "=" * 80)
    print(f" ✅ VARREDURA CONCLUÍDA EM {elapsed:.2f}s ({elapsed/len(pdf_list):.3f}s por prova)")
    print("=" * 80)
    print(f"📄 Provas analisadas com sucesso: {successful_pdfs}/{len(pdf_list)}")
    print(f"📝 Total de questões extraídas dos PDFs: {total_questions_parsed:,}")
    print(f"🎯 Total de gabaritos oficiais extraídos: {total_gabs_found:,}")
    print(f"⭐ NOVO TOTAL DE GABARITOS APLICADOS NO SEU BANCO: {total_matches:,} questões!")
    
    print("\n📊 DISTRIBUIÇÃO DOS GABARITOS POR ESPECIALIDADE:")
    for esp, count in matches_by_esp.items():
        print(f"   • {esp.replace('_', ' ').title():<25}: +{count:,} gabaritos")
        
    # 4. Salva os arquivos JSON atualizados no disco de forma atômica
    print("\n💾 Salvando arquivos JSON atualizados com substituição atômica...")
    for esp, questions in user_bank.items():
        if matches_by_esp[esp] == 0:
            continue
        filepath = QUESTION_FILES[esp]
        tmp_path = f"{filepath}.drive_tmp"
        try:
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            os.replace(tmp_path, filepath)
            print(f"   ✓ {os.path.basename(filepath)} salvo com sucesso!")
        except Exception as e:
            print(f"   ❌ Erro ao salvar {filepath}: {e}")
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    print("\n🎉 Todas as provas do Drive foram integradas ao seu banco de questões!")

if __name__ == '__main__':
    main()
