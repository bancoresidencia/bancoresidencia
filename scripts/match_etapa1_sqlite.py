import sqlite3
import json
import os
import re
import sys
import unicodedata

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def norm_hash(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()[:90]

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
    apply_changes = '--apply' in sys.argv
    print(f"=== ETAPA 1: CASAMENTO E HOMOLOGACAO DE GABARITOS (Modo: {'APLICAR' if apply_changes else 'SIMULACAO'}) ===")
    
    missing_by_hash = {}
    total_missing = 0
    all_questions_bank = {}

    for esp, path in QUESTION_FILES.items():
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        all_questions_bank[esp] = data
        for idx, q in enumerate(data):
            ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
            is_anulada = bool(q.get('isAnulada') or q.get('is_anulada'))
            if not ans and not is_anulada:
                total_missing += 1
                stmt = q.get('statement') or q.get('enunciado') or ''
                h = norm_hash(stmt)
                if len(h) >= 20:
                    if h not in missing_by_hash:
                        missing_by_hash[h] = []
                    missing_by_hash[h].append((esp, idx, q))

    print(f"Total de questoes pendentes no banco: {total_missing:,}")
    print(f"Hashes unicos de enunciados: {len(missing_by_hash):,}")

    conn = sqlite3.connect('data/provaderesidencia_coleta.db')
    c = conn.cursor()
    
    matches = []
    matched_qids = set()
    dirty_specialties = set()

    query = "SELECT id, prova_id, numero, enunciado, gabarito_oficial, is_anulada FROM questoes WHERE gabarito_oficial IS NOT NULL AND gabarito_oficial != ''"
    
    for row in c.execute(query):
        pdr_id, prova_id, num, stmt, gab, is_anul = row
        h = norm_hash(stmt)
        if h in missing_by_hash:
            for esp, idx, bank_q in missing_by_hash[h]:
                qid = bank_q.get('id')
                if qid and qid not in matched_qids:
                    matched_qids.add(qid)
                    final_ans = 'ANULADA' if is_anul else gab.strip().upper()
                    
                    matches.append({
                        'esp': esp,
                        'qid': qid,
                        'pdr_id': pdr_id,
                        'prova_id': prova_id,
                        'num': num,
                        'gabarito': final_ans,
                        'is_anulada': bool(is_anul or final_ans == 'ANULADA')
                    })
                    
                    if apply_changes:
                        bank_q['correctAnswer'] = final_ans
                        bank_q['correct_answer'] = final_ans
                        bank_q['isAnulada'] = bool(is_anul or final_ans == 'ANULADA')
                        bank_q['is_anulada'] = bool(is_anul or final_ans == 'ANULADA')
                        bank_q['source'] = 'provaderesidencia'
                        bank_q['commentary'] = f"Gabarito Oficial Homologado - Prova de Residencia [Prova {prova_id}, Q#{num}]."
                        dirty_specialties.add(esp)

    print(f"\n-> Total de questoes do banco que deram MATCH: {len(matches):,}")
    
    from collections import Counter
    cnt_esp = Counter(m['esp'] for m in matches)
    for esp, c_val in cnt_esp.items():
        print(f"   • {esp}: {c_val:,} questoes")

    if apply_changes and dirty_specialties:
        print("\nGravando alteracoes nos arquivos JSON locais com substituicao segura...")
        for esp in dirty_specialties:
            path = QUESTION_FILES[esp]
            tmp_path = path + ".tmp"
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump(all_questions_bank[esp], f, ensure_ascii=False, indent=2)
            os.replace(tmp_path, path)
            print(f"   [OK] Atualizado {path}")

        # Salva manifesto dos matches para sincronizacao direta no Supabase
        manifest_path = 'data/etapa1_matches_manifest.json'
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(matches, f, ensure_ascii=False, indent=2)
        print(f"Manifesto de matches salvo em {manifest_path}")

        # Registrar no SQLite de auditoria
        c.executemany("""
            INSERT OR REPLACE INTO matches_banco 
            (questao_banco_id, especialidade, questao_provaderesidencia_id, prova_id, numero_questao, gabarito)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [(m['qid'], m['esp'], m['pdr_id'], m['prova_id'], m['num'], m['gabarito']) for m in matches])
        conn.commit()
        print("Matches gravados em matches_banco no SQLite.")

    conn.close()

if __name__ == '__main__':
    main()
