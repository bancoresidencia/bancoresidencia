import json
import sqlite3
import os
import re
import sys
from collections import defaultdict, Counter

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

print("="*90)
print("🔬 MEGA BATERIA DE TESTES FORENSES AVANÇADOS: RASTREAMENTO DE ANOMALIAS OCULTAS")
print("="*90)

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

# Carregar quarentena
quar_set = set()
quar_path = os.path.join(DATA_DIR, 'quarentena_questions.json')
if os.path.exists(quar_path):
    with open(quar_path, 'r', encoding='utf-8') as f:
        quar_set = {q['id'] for q in json.load(f) if 'id' in q}

all_questions = []
by_id = {}
by_norm_stmt = defaultdict(list)

for key, name, fpath in QUESTION_FILES:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data:
                qid = q.get('id')
                if not qid:
                    continue
                q['_spec'] = name
                all_questions.append(q)
                by_id[qid] = q
                
                stmt = q.get('statement') or ''
                norm = normalize_text(stmt)[:120]
                if len(norm) >= 35:
                    by_norm_stmt[norm].append(q)

print(f"📦 Total de questões analisadas: {len(all_questions):,}")
print(f"🛡️ Quarentena ativa: {len(quar_set):,}")

# -------------------------------------------------------------
# TESTE 1: QUESTÕES GÊMEAS COM GABARITOS DIVERGENTES (CONFLITO INTER-ESPECIALIDADES)
# -------------------------------------------------------------
print("\n" + "-"*70)
print("TESTE 1: Detecção de Questões Gêmeas (Duplicadas) com Gabaritos Conflitantes")
print("-"*70)

twin_conflicts = []
twin_matches = 0

for norm, qlist in by_norm_stmt.items():
    if len(qlist) > 1:
        # Verificar se as questões têm o mesmo ano/banca ou enunciado longo
        valid_q = [q for q in qlist if q['id'] not in quar_set]
        if len(valid_q) > 1:
            answers = set()
            for q in valid_q:
                ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
                is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
                if is_anul:
                    answers.add('ANULADA')
                elif ans:
                    answers.add(ans)
                    
            if len(answers) > 1:
                twin_conflicts.append({
                    'norm_snippet': norm[:80],
                    'questions': [{'id': q['id'], 'code': q.get('code'), 'spec': q['_spec'], 'ans': (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper(), 'banca': q.get('banca'), 'year': q.get('year')} for q in valid_q],
                    'divergent_answers': list(answers)
                })
            elif len(answers) == 1:
                twin_matches += 1

print(f"   • Grupos de questões gêmeas com gabarito idêntico (Consistentes): {twin_matches:,}")
print(f"   • Grupos de questões gêmeas com GABARITOS DIVERGENTES: {len(twin_conflicts):,}")
if twin_conflicts:
    print(f"   • Exemplo de conflito entre gêmeas:")
    tc = twin_conflicts[0]
    print(f"     Enunciado: \"{tc['norm_snippet']}...\"")
    for q in tc['questions']:
        print(f"       -> [{q['spec']}] {q['code']} (Gabarito: {q['ans']})")

# -------------------------------------------------------------
# TESTE 2: QUESTÕES QUE EXIGEM IMAGEM MAS NÃO POSSUEM URL DE IMAGEM
# -------------------------------------------------------------
print("\n" + "-"*70)
print("TESTE 2: Questões Dependentes de Imagem Sem Anexo Visual (ECG, Tomografia, Raio-X)")
print("-"*70)

image_trigger_words = [
    r'\bimagem\s+(?:abaixo|acima|a\s+seguir|anexa)\b',
    r'\bfigura\s+(?:abaixo|acima|a\s+seguir|anexa)\b',
    r'\bfotografia\s+(?:abaixo|acima|a\s+seguir)\b',
    r'\btomografia\s+(?:abaixo|acima|a\s+seguir|anexa)\b',
    r'\bradiografia\s+(?:abaixo|acima|a\s+seguir|anexa)\b',
    r'\braio-?x\s+(?:abaixo|acima|a\s+seguir|anexo)\b',
    r'\beletrocardiograma\s+(?:abaixo|acima|a\s+seguir|anexo)\b',
    r'\becg\s+(?:abaixo|acima|a\s+seguir|anexo)\b',
    r'\bultrassonografia\s+(?:abaixo|acima|a\s+seguir|anexa)\b',
    r'\bobservando\s+a\s+imagem\b',
    r'\bcom\s+base\s+na\s+imagem\b',
    r'\ba\s+imagem\s+demonstra\b',
    r'\bo\s+traçado\s+(?:abaixo|a\s+seguir)\b'
]
re_img_trigger = re.compile('|'.join(image_trigger_words), re.IGNORECASE)

missing_image_questions = []

for q in all_questions:
    if q['id'] in quar_set:
        continue
    stmt = q.get('statement') or ''
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    if is_anul:
        continue
        
    imgs = q.get('images') or []
    img_url = q.get('imageUrl') or ''
    has_image = bool(len(imgs) > 0 or (img_url and img_url.strip()))
    
    if not has_image:
        m = re_img_trigger.search(stmt)
        if m:
            missing_image_questions.append({
                'id': q['id'],
                'code': q.get('code'),
                'spec': q['_spec'],
                'trigger': m.group(0),
                'banca': q.get('banca'),
                'year': q.get('year')
            })

print(f"   • Questões ativas que citam explicitamente imagem/ECG/TC ausente: {len(missing_image_questions):,}")
if missing_image_questions:
    print(f"   • Amostra: [{missing_image_questions[0]['spec']}] {missing_image_questions[0]['code']} -> Gatilho: \"{missing_image_questions[0]['trigger']}\"")

# -------------------------------------------------------------
# TESTE 3: ALTERNATIVAS COM DEFEITO DE FORMATAÇÃO / LETRAS FUNDIDAS
# -------------------------------------------------------------
print("\n" + "-"*70)
print("TESTE 3: Integridade das Alternativas (Letras Fundidas, Falhas de Prefixo)")
print("-"*70)

option_formatting_defects = []

for q in all_questions:
    if q['id'] in quar_set:
        continue
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    if is_anul:
        continue
        
    opts = q.get('options') or []
    if not opts and (q.get('type') == 'DISCURSIVA' or 'DISCURSIVA' in (q.get('tipo_prova') or '')):
        continue
        
    letters = [o.get('letter') for o in opts if o.get('letter')]
    
    # 1. Menos de 3 opções em questão de múltipla escolha
    if len(opts) > 0 and len(opts) < 3:
        option_formatting_defects.append({
            'id': q['id'],
            'code': q.get('code'),
            'spec': q['_spec'],
            'issue': f'POUCAS_OPCOES_{len(opts)}'
        })
        continue
        
    # 2. Letra da opção colada dentro do texto (Ex: Texto da alternativa A começa com "B)")
    for o in opts:
        txt = (o.get('text') or '').strip()
        let = o.get('letter')
        # Verificar se texto começa com outra letra e parênteses
        m_fund = re.match(r'^([B-E])\s*[\)\.\-]\s*', txt)
        if m_fund and m_fund.group(1) != let:
            option_formatting_defects.append({
                'id': q['id'],
                'code': q.get('code'),
                'spec': q['_spec'],
                'issue': f'TEXTO_COM_LETRA_FUNDIDA_({let}_contem_{m_fund.group(1)})',
                'snippet': txt[:60]
            })
            break

print(f"   • Questões com defeitos de parsing nas opções (poucas opções ou letras coladas): {len(option_formatting_defects):,}")

# -------------------------------------------------------------
# TESTE 4: QUESTÕES DO TIPO "INCORRETA / EXCETO" E ALINHAMENTO COM COMENTÁRIO
# -------------------------------------------------------------
print("\n" + "-"*70)
print("TESTE 4: Detecção de Questões Negativas ('INCORRETA / EXCETO') vs Justificativa")
print("-"*70)

re_negativa = re.compile(r'\b(?:assinale\s+a\s+(?:alternativa\s+)?(?:incorreta|falsa|errada)|est[aá]o\s+corretas?,\s*exceto|todas\s+est[aá]o\s+corretas?,\s*exceto|marque\s+a\s+(?:alternativa\s+)?(?:incorreta|falsa)|n[aã]o\s+[eé]\s+correto\s+afirmar)\b', re.IGNORECASE)

negativas_count = 0
negativas_suspect = []

for q in all_questions:
    if q['id'] in quar_set:
        continue
    stmt = q.get('statement') or ''
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    is_anul = bool(q.get('isAnulada') or q.get('is_anulada') or ans == 'ANULADA')
    if is_anul or not ans:
        continue
        
    if re_negativa.search(stmt):
        negativas_count += 1
        comm = q.get('commentary') or ''
        # Se o comentário diz explicitamente "A alternativa X é correta" no mesmo gabarito
        # Ex: Gabarito A, mas comentário diz "A alternativa A está correta porque o paciente..."
        # Isso pode sugerir que a questão foi resolvida como afirmativa em vez de negativa
        if comm:
            m_aff = re.search(rf'alternativa\s+{ans}\s+est[aá]\s+(?:absolutamente\s+)?correta\b', comm, re.IGNORECASE)
            if m_aff:
                # Verificar se não há "O enunciado pede a incorreta, logo a alternativa..."
                if not re.search(r'pede\s+a\s+(?:alternativa\s+)?incorreta|enunciado\s+solicita\s+a\s+falsa', comm, re.IGNORECASE):
                    negativas_suspect.append({
                        'id': q['id'],
                        'code': q.get('code'),
                        'spec': q['_spec'],
                        'ans': ans,
                        'comm_snippet': comm[max(0, m_aff.start()-20):min(len(comm), m_aff.end()+60)].replace('\n', ' ')
                    })

print(f"   • Questões com comando negativo ('INCORRETA / EXCETO'): {negativas_count:,}")
print(f"   • Questões negativas com suspeita de inversão semântica no comentário: {len(negativas_suspect):,}")

# -------------------------------------------------------------
# TESTE 5: DESVIO ESTATÍSTICO DE DISTRIBUIÇÃO DE GABARITOS POR BANCA / ANO
# -------------------------------------------------------------
print("\n" + "-"*70)
print("TESTE 5: Análise de Desvio Estatístico e Anomalias de Sequência por Prova")
print("-"*70)

# Agrupar questões por banca e ano
by_exam = defaultdict(list)
for q in all_questions:
    if q['id'] in quar_set:
        continue
    banca = (q.get('banca') or q.get('institution') or '').strip().upper()
    ano = str(q.get('year') or '')
    ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip().upper()
    if banca and ano and ans in ['A','B','C','D','E']:
        by_exam[(banca, ano)].append((q.get('code'), ans, q['id']))

anomalous_exams = []

for (banca, ano), qlist in by_exam.items():
    if len(qlist) >= 20: # Provas com pelo menos 20 questões mapeadas
        ans_counts = Counter(ans for code, ans, qid in qlist)
        total = len(qlist)
        # Se uma única letra tiver mais de 55% de frequência numa prova inteira (altamente improvável em provas oficiais)
        for let, count in ans_counts.items():
            pct = count / total
            if pct >= 0.55:
                anomalous_exams.append({
                    'banca': banca,
                    'ano': ano,
                    'total_questoes': total,
                    'anomalous_letter': let,
                    'count': count,
                    'pct': f"{pct*100:.1f}%"
                })

print(f"   • Total de provas avaliadas (≥ 20 questões): {len([k for k, v in by_exam.items() if len(v) >= 20]):,}")
print(f"   • Provas com distribuição hiper-anômala (> 55% na mesma letra): {len(anomalous_exams):,}")
for ae in anomalous_exams[:5]:
    print(f"     -> {ae['banca']} ({ae['ano']}): {ae['count']}/{ae['total_questoes']} questões ({ae['pct']}) com letra '{ae['anomalous_letter']}'")

# -------------------------------------------------------------
# SALVAR RELATÓRIO DA MEGA BATERIA
# -------------------------------------------------------------
out_file = os.path.join(DATA_DIR, 'relatorio_mega_bateria_testes.json')
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump({
        'summary': {
            'total_questions_analyzed': len(all_questions),
            'twin_conflicts': len(twin_conflicts),
            'missing_image_questions': len(missing_image_questions),
            'option_formatting_defects': len(option_formatting_defects),
            'negativas_count': negativas_count,
            'negativas_suspect': len(negativas_suspect),
            'anomalous_exams': len(anomalous_exams)
        },
        'twin_conflicts': twin_conflicts[:100],
        'missing_image_questions': missing_image_questions[:100],
        'option_formatting_defects': option_formatting_defects[:100],
        'negativas_suspect': negativas_suspect[:100],
        'anomalous_exams': anomalous_exams
    }, f, indent=2)

print("\n" + "="*90)
print(f"📊 RELATÓRIO DA MEGA BATERIA DE TESTES SALVO EM: {out_file}")
print("="*90)
