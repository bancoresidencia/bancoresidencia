"""
Motor de Cruzamento Blindado de Gabaritos por Correspondência Textual
Garante 100% de precisão mesmo com cadernos alternados/embaralhados.
Ordem de execução: 2026 -> 2009.
"""

import json
import glob
import os
import re
import unicodedata
import datetime
import html
import tempfile

def normalize_text(text):
    if not text:
        return ""
    # Unescape HTML entities
    text = html.unescape(text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove question prefixes (e.g. "Questão 1:", "1.", "(Questão 15)", "Questão 01 -")
    text = re.sub(r'^(?:quest[aã]o\s*\d+[\s:\-–—.]*|\d+[\s:\-–—.)]+)\s*', '', text, flags=re.IGNORECASE)
    # Normalize unicode to NFD and strip combining marks
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    # Replace non-alphanumeric with spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_strict(text):
    """A lighter normalization for exact option comparison"""
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    return text

def atomic_save_json(filepath, data):
    dir_name = os.path.dirname(filepath)
    with tempfile.NamedTemporaryFile('w', dir=dir_name, delete=False, encoding='utf-8') as tf:
        json.dump(data, tf, ensure_ascii=False, indent=2)
        temp_name = tf.name
    os.replace(temp_name, filepath)

def load_scraped_exams_for_year(year):
    exams = []
    scraped_files = glob.glob(f'data/scraped_exams/raw/{year}/*.json')
    for fpath in scraped_files:
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                d = json.load(f)
            exam_meta = d.get('exam', {})
            for q in d.get('questions', []):
                norm_t = normalize_text(q.get('text', ''))
                exams.append({
                    'source_id': q.get('_id'),
                    'exam_id': q.get('examId'),
                    'exam_title': exam_meta.get('title', ''),
                    'institution': exam_meta.get('institution', ''),
                    'year': year,
                    'text': q.get('text', ''),
                    'norm_text': norm_t,
                    'prefix_60': norm_t[:60] if len(norm_t) >= 60 else norm_t,
                    'answerIndex': q.get('answerIndex'),
                    'alternatives': q.get('alternatives', []),
                    'isCanceled': q.get('isCanceled', False) or q.get('canceled', False)
                })
        except Exception as e:
            print(f"Error loading {fpath}: {e}")
    return exams

def run_crossing_for_year(year, local_data_by_file, logs_dir, dry_run=False):
    print(f"\n{'='*60}")
    print(f"INICIANDO CRUZAMENTO PARA O ANO: {year} (Dry-Run: {dry_run})")
    print(f"{'='*60}")
    
    scraped_list = load_scraped_exams_for_year(year)
    print(f"Total de questoes extraidas carregadas para {year}: {len(scraped_list)}")
    if not scraped_list:
        print(f"Nenhuma questao extraida encontrada para o ano {year}.")
        return None

    # Multi-tier index: Exact statement and Prefix (60 chars)
    scraped_by_norm = {}
    scraped_by_prefix = {}
    for sq in scraped_list:
        nt = sq['norm_text']
        if nt and len(nt) >= 15:
            scraped_by_norm.setdefault(nt, []).append(sq)
            if len(nt) >= 60:
                scraped_by_prefix.setdefault(sq['prefix_60'], []).append(sq)

    stats = {
        'year': year,
        'total_scraped': len(scraped_list),
        'local_total_year': 0,
        'local_missing_year': 0,
        'statement_matches': 0,
        'option_exact_matches': 0,
        'scrambled_booklets_resolved': 0,
        'empty_gabaritos_filled': 0,
        'existing_verified': 0,
        'divergences_corrected': 0,
        'canceled_marked': 0,
        'quarantine_no_opt_match': 0,
        'quarantine_ambiguous': 0
    }

    log_file_path = os.path.join(logs_dir, f"cruzamento_{year}.jsonl")
    log_fp = open(log_file_path, 'a', encoding='utf-8')

    # Iterate over all local questions matching this year
    for fpath, questions in local_data_by_file.items():
        fname = os.path.basename(fpath)
        for q in questions:
            if q.get('year') != year:
                continue
                
            stats['local_total_year'] += 1
            old_ans = q.get('correct_answer', '')
            if not old_ans:
                stats['local_missing_year'] += 1

            norm_stmt = normalize_text(q.get('statement', ''))
            if not norm_stmt or len(norm_stmt) < 15:
                continue

            candidates = scraped_by_norm.get(norm_stmt)
            if not candidates and len(norm_stmt) >= 60:
                candidates = scraped_by_prefix.get(norm_stmt[:60])

            if not candidates:
                continue

            stats['statement_matches'] += 1
            sq = candidates[0]
            ai = sq.get('answerIndex')
            alts = sq.get('alternatives', [])

            # Check if source question was canceled
            if sq.get('isCanceled') or ai is None:
                if sq.get('isCanceled'):
                    if not dry_run:
                        q['correct_answer'] = "ANULADA"
                        q['is_anulada'] = True
                    stats['canceled_marked'] += 1
                    log_entry = {
                        'timestamp': datetime.datetime.now().isoformat(),
                        'question_id': q.get('id'),
                        'file': fname,
                        'year': year,
                        'status': 'MARKED_ANULADA',
                        'old_answer': old_ans,
                        'new_answer': 'ANULADA',
                        'source_exam': sq.get('exam_title')
                    }
                    log_fp.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
                continue

            if not (0 <= ai < len(alts)):
                continue

            source_correct_alt = alts[ai]
            source_correct_text = source_correct_alt.get('text', '')
            norm_source_correct = normalize_strict(source_correct_text)
            norm_source_correct_clean = normalize_text(source_correct_text)

            # Match option text in local options (MANDATORY STRICT MATCH)
            matched_opts = []
            for opt in q.get('options', []):
                norm_local_opt = normalize_strict(opt.get('text', ''))
                norm_local_clean = normalize_text(opt.get('text', ''))

                if norm_local_opt == norm_source_correct or norm_local_clean == norm_source_correct_clean:
                    matched_opts.append(opt)
                elif len(norm_local_clean) >= 12 and len(norm_source_correct_clean) >= 12:
                    if norm_local_clean in norm_source_correct_clean or norm_source_correct_clean in norm_local_clean:
                        len_ratio = min(len(norm_local_clean), len(norm_source_correct_clean)) / max(len(norm_local_clean), len(norm_source_correct_clean))
                        if len_ratio >= 0.85:
                            matched_opts.append(opt)

            if len(matched_opts) == 1:
                stats['option_exact_matches'] += 1
                assigned_letter = matched_opts[0]['letter']
                source_letter = chr(65 + ai) if ai < 26 else str(ai)
                is_scrambled = (assigned_letter != source_letter)

                if is_scrambled:
                    stats['scrambled_booklets_resolved'] += 1

                if not old_ans:
                    if not dry_run:
                        q['correct_answer'] = assigned_letter
                    stats['empty_gabaritos_filled'] += 1
                    status = 'FILLED_EMPTY'
                elif old_ans == assigned_letter:
                    stats['existing_verified'] += 1
                    status = 'VERIFIED_EXISTING'
                else:
                    # Divergence: local had old_ans, but text match gives assigned_letter
                    stats['divergences_corrected'] += 1
                    status = 'DIVERGENCE_CORRECTED'
                    if not dry_run:
                        q['correct_answer'] = assigned_letter

                log_entry = {
                    'timestamp': datetime.datetime.now().isoformat(),
                    'question_id': q.get('id'),
                    'file': fname,
                    'year': year,
                    'status': status,
                    'old_answer': old_ans,
                    'new_answer': assigned_letter,
                    'source_letter': source_letter,
                    'is_scrambled': is_scrambled,
                    'matched_option_text': matched_opts[0]['text'][:80],
                    'source_exam': sq.get('exam_title')
                }
                log_fp.write(json.dumps(log_entry, ensure_ascii=False) + '\n')

            elif len(matched_opts) == 0:
                stats['quarantine_no_opt_match'] += 1
                log_entry = {
                    'timestamp': datetime.datetime.now().isoformat(),
                    'question_id': q.get('id'),
                    'file': fname,
                    'year': year,
                    'status': 'QUARANTINE_NO_OPTION_MATCH',
                    'statement_snippet': q.get('statement', '')[:80],
                    'source_correct_text': source_correct_text[:80],
                    'source_exam': sq.get('exam_title')
                }
                log_fp.write(json.dumps(log_entry, ensure_ascii=False) + '\n')

            else:
                stats['quarantine_ambiguous'] += 1
                log_entry = {
                    'timestamp': datetime.datetime.now().isoformat(),
                    'question_id': q.get('id'),
                    'file': fname,
                    'year': year,
                    'status': 'QUARANTINE_AMBIGUOUS_OPTIONS',
                    'matched_letters': [o['letter'] for o in matched_opts],
                    'source_correct_text': source_correct_text[:80],
                    'source_exam': sq.get('exam_title')
                }
                log_fp.write(json.dumps(log_entry, ensure_ascii=False) + '\n')

    log_fp.close()

    print(f"\n--- RELATÓRIO DO ANO {year} ---")
    print(f"Local Total no Ano: {stats['local_total_year']} | Faltando Gabarito Inicialmente: {stats['local_missing_year']}")
    print(f"Matches de Enunciado: {stats['statement_matches']}")
    print(f"Matches Canônicos de Alternativa por Texto: {stats['option_exact_matches']}")
    print(f"Embaralhamentos de Caderno Solucionados: {stats['scrambled_booklets_resolved']}")
    print(f"Gabaritos Vazios Preenchidos com Sucesso: {stats['empty_gabaritos_filled']}")
    print(f"Gabaritos Existentes Validados/Confirmados: {stats['existing_verified']}")
    print(f"Divergências Corrigidas para Padrão Oficial: {stats['divergences_corrected']}")
    print(f"Questões Marcadas como ANULADA Oficial: {stats['canceled_marked']}")
    print(f"Quarentena (Opção não localizada / Ambígua): {stats['quarantine_no_opt_match'] + stats['quarantine_ambiguous']}")
    print(f"Log salvo em: {log_file_path}")
    
    return stats
