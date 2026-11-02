import json
import os
import re
import sys
from collections import defaultdict

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def normalize_text(text):
    if not text:
        return ''
    text = text.lower()
    text = re.sub(r'[\s\r\n\t]+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

print("="*80)
print("🔍 ANÁLISE DE HARMONIZAÇÃO DE QUESTÕES GÊMEAS")
print("="*80)

with open(os.path.join(DATA_DIR, 'relatorio_mega_bateria_testes.json'), 'r', encoding='utf-8') as f:
    rep = json.load(f)

twin_conflicts = rep.get('twin_conflicts', [])
print(f"Total de conflitos entre gêmeas no relatório: {len(twin_conflicts):,}")

# Carregar todas as questões para acessar opções e textos
QUESTION_FILES = [
    ('cirurgia', 'Cirurgia', os.path.join(DATA_DIR, 'cirurgia_final_questions.json')),
    ('clinica_medica', 'Clínica Médica', os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')),
    ('ginecologia', 'Ginecologia', os.path.join(DATA_DIR, 'ginecologia_final_questions.json')),
    ('medicina_preventiva', 'Medicina Preventiva e Social', os.path.join(DATA_DIR, 'medicina_preventiva_final_questions.json')),
    ('obstetricia', 'Obstetrícia', os.path.join(DATA_DIR, 'obstetricia_final_questions.json')),
    ('pediatria', 'Pediatria', os.path.join(DATA_DIR, 'pediatria_final_questions.json')),
    ('urologia', 'Urologia', os.path.join(DATA_DIR, 'urologia_final_questions.json')),
    ('nefrologia', 'Nefrologia', os.path.join(DATA_DIR, 'nefrologia_final_questions.json')),
]

all_questions = {}
for key, name, fpath in QUESTION_FILES:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            for q in json.load(f):
                if q.get('id'):
                    q['_file'] = fpath
                    q['_spec'] = name
                    all_questions[q['id']] = q

# Carregar quarentena
quar_set = set()
quar_path = os.path.join(DATA_DIR, 'quarentena_questions.json')
if os.path.exists(quar_path):
    with open(quar_path, 'r', encoding='utf-8') as f:
        quar_set = {q['id'] for q in json.load(f) if 'id' in q}

harmonizable_twins = []
unresolvable_twins = []

for tc in twin_conflicts:
    q_objs = [all_questions[q['id']] for q in tc['questions'] if q['id'] in all_questions and q['id'] not in quar_set]
    if len(q_objs) < 2:
        continue
        
    # Verificar os textos das opções de cada questão
    # Para cada questão com gabarito definido, qual é o texto da opção correta?
    texts_per_q = {}
    for q in q_objs:
        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
        if ans in ['A','B','C','D','E']:
            opts = {o.get('letter'): normalize_text(o.get('text', '')) for o in q.get('options', [])}
            ans_text = opts.get(ans, '')
            if ans_text:
                texts_per_q[q['id']] = (ans, ans_text, q)
                
    if len(texts_per_q) >= 2:
        # Comparar se os textos das alternativas corretas são idênticos ou diferentes
        unique_texts = set(t[1] for t in texts_per_q.values())
        if len(unique_texts) == 1:
            # Todas as versões concordam no TEXTO da alternativa correta!
            # A divergência de letras era 100% permutação de caderno!
            # Nesse caso, cada questão já tem a letra correta correspondente ao seu próprio caderno!
            pass
        else:
            # Há divergência real sobre qual texto de alternativa é a resposta correta!
            # Ex: Uma versão diz que é "estenose hipertrófica", outra diz que é "atresia duodenal"
            harmonizable_twins.append({
                'norm': tc['norm_snippet'],
                'questions': [{'code': q['code'], 'spec': q['_spec'], 'ans': t[0], 'ans_text': t[1][:50]} for qid, t in texts_per_q.items()]
            })

print(f"Grupos onde as questões gêmeas já possuem a letra correspondente à sua própria opção (Caderno Próprio): {len(twin_conflicts) - len(harmonizable_twins)}")
print(f"Grupos com divergência real de texto de alternativa: {len(harmonizable_twins)}")
if harmonizable_twins:
    print(f"\nAmostra de divergência real:")
    print(json.dumps(harmonizable_twins[0], indent=2))
