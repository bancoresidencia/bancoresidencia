import json
import os
import re
import unicodedata
from collections import defaultdict

def strip_urls(text):
    text = re.sub(r'https?://\S+', '', text)
    return text

def norm(text):
    if not text:
        return ''
    text = strip_urls(text)
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def fingerprint(text):
    words = [w for w in norm(text).split() if len(w) >= 3]
    return ' '.join(words[:18])

# 1. Carregar base ativa
backup_dir = 'data/backups/pre_etapa1_expansao_20261106'
ativa_fps = {}
for fname in os.listdir(backup_dir):
    if not fname.endswith('.json') or fname == 'manifest_backup.json':
        continue
    with open(f'{backup_dir}/{fname}', 'r', encoding='utf-8') as fp:
        for q in json.load(fp):
            inst = norm(q.get('institution') or '')
            if 'inep' in inst or 'revalida' in inst:
                fp_clean = fingerprint(q.get('statement') or '')
                if fp_clean:
                    ativa_fps[fp_clean] = q

# 2. Carregar exatamente as questões com institution = "INEP - Revalida (Exame Nacional de Revalidação)"
staging_file = 'data/staging/expansao_ineditas_consolidadas.jsonl'
target_inst_questions = []

with open(staging_file, 'r', encoding='utf-8') as fp:
    for line in fp:
        if not line.strip():
            continue
        q = json.loads(line)
        inst = q.get('institution') or ''
        if 'inep - revalida (exame nacional de revalida' in inst.lower():
            target_inst_questions.append(q)

print(f"[ALVO] Total de questões com a instituição citada pelo usuário: {len(target_inst_questions)}")

by_year = defaultdict(int)
matches_sem_url = 0
matches_com_diferenca = 0
realmente_novas = 0

sample_matches = []

for q in target_inst_questions:
    yr = str(q.get('year') or 'N/A')
    by_year[yr] += 1
    
    fp_clean = fingerprint(q.get('statement') or '')
    stmt_clean = norm(q.get('statement') or '')
    
    if fp_clean in ativa_fps:
        matches_sem_url += 1
        at_q = ativa_fps[fp_clean]
        if len(sample_matches) < 5:
            sample_matches.append({
                'exp_id': q.get('id'),
                'exp_year': yr,
                'exp_code': q.get('code'),
                'at_id': at_q.get('id'),
                'at_year': at_q.get('year'),
                'at_code': at_q.get('code'),
                'exp_stmt': (q.get('statement') or '')[:100],
                'at_stmt': (at_q.get('statement') or '')[:100]
            })
    else:
        # Checar se tem overlap alto
        found = False
        for at_fp, at_q in ativa_fps.items():
            at_stmt_clean = norm(at_q.get('statement') or '')
            if len(stmt_clean) >= 60 and len(at_stmt_clean) >= 60:
                if stmt_clean[:50] == at_stmt_clean[:50]:
                    matches_com_diferenca += 1
                    found = True
                    break
        if not found:
            realmente_novas += 1

print("\n--- DISTRIBUIÇÃO DAS 712 QUESTÕES POR ANO ---")
for y, c in sorted(by_year.items()):
    print(f"Ano {y}: {c} questões")

print("\n--- RESULTADO DA COMPARACAO REMOVENDO URLS E FORMATACAO ---")
print(f"• Repetidas identificadas (mesmo enunciado sem URLs): {matches_sem_url} ({matches_sem_url/len(target_inst_questions)*100:.1f}%)")
print(f"• Repetidas com pequenas diferencas de texto          : {matches_com_diferenca} ({matches_com_diferenca/len(target_inst_questions)*100:.1f}%)")
print(f"• Total de questoes REPETIDAS com a base ativa        : {matches_sem_url + matches_com_diferenca} ({(matches_sem_url + matches_com_diferenca)/len(target_inst_questions)*100:.1f}%)")
print(f"• Questoes REALMENTE NOVAS / INEDITAS                 : {realmente_novas} ({realmente_novas/len(target_inst_questions)*100:.1f}%)")

print("\n--- AMOSTRA DE CONFRONTOS ---")
for sm in sample_matches:
    print(f"Expansao: {sm['exp_year']} [{sm['exp_code']}] vs Ativa: {sm['at_year']} [{sm['at_code']}]")
    print(f"  Expansao: \"{sm['exp_stmt']}...\"")
    print(f"  Ativa   : \"{sm['at_stmt']}...\"\n")
