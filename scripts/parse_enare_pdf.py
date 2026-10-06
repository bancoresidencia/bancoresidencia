
"""
Parser v2 do PDF do ENARE para extrair questões.
Usa pypdf com extração de layout para melhor qualidade.
"""
import pypdf, re, json, uuid
from pathlib import Path
from collections import Counter

def clean_text(text):
    """Remove quebras de linha e normaliza espaços"""
    text = text.replace('\xa0', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_enare_text(text, year, banca='AOCP', exam_type='ACESSO DIRETO'):
    """
    Parseia o texto extraído de um PDF do ENARE.
    """
    lines = text.split('\n')
    lines = [l.rstrip() for l in lines]
    
    questions = []
    current_specialty = 'Clínica Médica'
    
    # Especialidades conhecidas do ENARE
    KNOWN_SPECIALTIES = {
        'Cirurgia Geral', 'Clínica Médica', 'Ginecologia e Obstetrícia', 'Pediatria',
        'Medicina de Família e Comunidade', 'Psiquiatria', 'Medicina Preventiva',
        'Saúde Coletiva', 'Cardiologia', 'Neurologia', 'Nefrologia', 'Pneumologia',
        'Gastroenterologia', 'Endocrinologia', 'Reumatologia', 'Hematologia',
        'Infectologia', 'Ortopedia', 'Urologia', 'Oftalmologia', 'Otorrinolaringologia',
        'Dermatologia', 'Anestesiologia', 'Radiologia', 'Patologia', 'Oncologia',
        'Medicina do Trabalho', 'Medicina Legal', 'Medicina de Emergência',
        'Cirurgia Cardiovascular', 'Cirurgia Torácica', 'Cirurgia Pediátrica',
        'Medicina Intensiva', 'Neonatologia', 'Mastologia', 'Geriatria',
    }
    
    # Padrões
    question_num_pattern = re.compile(r'^\s*(\d{1,3})\s*$')
    alt_pattern = re.compile(r'^\s*\(([A-E])\)\s*(.+)')
    # Cabeçalho de página do AOCP
    header_pattern = re.compile(r'(AOCP|ACESSO DIRETO|Tipo\s+\d+|Página \d+|EBSERH|INSTITUTO|PRM -)', re.IGNORECASE)
    # Linha vazia
    empty_pattern = re.compile(r'^\s*$')
    
    def is_specialty_line(line):
        """Verifica se a linha pode ser uma especialidade"""
        stripped = line.strip()
        if not stripped or len(stripped) < 3 or len(stripped) > 60:
            return False
        if re.match(r'^[\(\d\-]', stripped):
            return False
        if stripped in KNOWN_SPECIALTIES:
            return True
        # Verifica padrões de especialidade (começa com maiúscula, sem pontuação especial)
        if re.match(r'^[A-ZÁÉÍÓÚÃÕÂÊÎÔÛÇ][a-záéíóúãõâêîôûçA-ZÁÉÍÓÚÃÕÂÊÎÔÛÇ ]+$', stripped):
            words = stripped.split()
            if len(words) <= 5 and not any(w.lower() in ['sobre', 'em', 'de', 'para', 'que', 'com', 'uma', 'um'] for w in words):
                return True
        return False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Pula linhas vazias
        if empty_pattern.match(line):
            i += 1
            continue
        
        # Pula cabeçalhos de página
        if header_pattern.search(line) and len(line.strip()) < 80:
            stripped = line.strip()
            # Verifica se é APENAS um cabeçalho (não tem conteúdo real)
            if re.match(r'^(Exame|PRM|ENARE|INSTITUTO|Tipo\s+\d+|Página)', stripped, re.IGNORECASE):
                i += 1
                continue
        
        # Detecta número de questão
        m_num = question_num_pattern.match(line)
        if m_num:
            q_num = int(m_num.group(1))
            if 1 <= q_num <= 200:
                # Verifica se linha anterior é especialidade
                prev_non_empty = None
                for back in range(1, 5):
                    if i - back >= 0 and not empty_pattern.match(lines[i - back]):
                        prev_non_empty = lines[i - back].strip()
                        break
                
                if prev_non_empty and is_specialty_line(prev_non_empty):
                    current_specialty = prev_non_empty
                
                # Coleta enunciado e alternativas
                j = i + 1
                enunciado_lines = []
                alternatives = {}
                current_alt = None
                current_alt_lines = []
                
                while j < len(lines):
                    jline = lines[j]
                    jstripped = jline.strip()
                    
                    # Para se encontrar próxima questão numerada
                    m_next = question_num_pattern.match(jline)
                    if m_next:
                        next_num = int(m_next.group(1))
                        if 1 <= next_num <= 200 and next_num != q_num:
                            break
                    
                    # Alternativa?
                    m_alt = alt_pattern.match(jstripped)
                    if m_alt:
                        # Salva alternativa anterior
                        if current_alt and current_alt_lines:
                            alternatives[current_alt] = clean_text(' '.join(current_alt_lines))
                        current_alt = m_alt.group(1)
                        current_alt_lines = [m_alt.group(2).strip()]
                    elif current_alt:
                        # Continuação da alternativa atual
                        if jstripped and not header_pattern.match(jstripped):
                            current_alt_lines.append(jstripped)
                    else:
                        # Parte do enunciado
                        if jstripped and not header_pattern.match(jstripped):
                            enunciado_lines.append(jstripped)
                    
                    j += 1
                
                # Salva última alternativa
                if current_alt and current_alt_lines:
                    alternatives[current_alt] = clean_text(' '.join(current_alt_lines))
                
                # Cria questão se válida
                enunciado = clean_text(' '.join(enunciado_lines))
                if enunciado and len(alternatives) >= 4:
                    q = {
                        'id': str(uuid.uuid4()),
                        'year': year,
                        'question_number': q_num,
                        'exam': f'ENARE {year}',
                        'banca': banca,
                        'exam_type': exam_type,
                        'specialty': current_specialty,
                        'tema': current_specialty,
                        'foco': '',
                        'subfoco': '',
                        'statement': enunciado,
                        'alternatives': [
                            {'letter': 'A', 'text': alternatives.get('A', ''), 'explanation': ''},
                            {'letter': 'B', 'text': alternatives.get('B', ''), 'explanation': ''},
                            {'letter': 'C', 'text': alternatives.get('C', ''), 'explanation': ''},
                            {'letter': 'D', 'text': alternatives.get('D', ''), 'explanation': ''},
                            {'letter': 'E', 'text': alternatives.get('E', ''), 'explanation': ''},
                        ],
                        'answer': '',
                        'comentario': '',
                        'images': [],
                        'source': 'ENARE_OFICIAL'
                    }
                    questions.append(q)
                
                i = j
                continue
        
        i += 1
    
    return questions


def parse_enare_gabarito(pdf_path):
    """
    Parseia o PDF de gabarito do ENARE.
    Retorna dict: {questao_num: letra_correta}
    """
    reader = pypdf.PdfReader(pdf_path)
    full_text = ''
    for page in reader.pages:
        try:
            full_text += page.extract_text() + '\n'
        except:
            pass
    
    gabarito = {}
    # Padrões de gabarito: "1 B", "01 B", "1. B", etc.
    patterns = [
        re.compile(r'\b(\d{1,3})\s+([A-E])\b'),
        re.compile(r'\b(\d{1,3})\.\s*([A-E])\b'),
        re.compile(r'(\d{1,3})\s*[-–]\s*([A-E])\b'),
    ]
    
    for pattern in patterns:
        matches = pattern.findall(full_text)
        if len(matches) > len(gabarito):
            for num_str, letra in matches:
                num = int(num_str)
                if 1 <= num <= 200:
                    gabarito[num] = letra
    
    return gabarito


def apply_gabarito(questions, gabarito):
    """Aplica o gabarito às questões"""
    applied = 0
    for q in questions:
        num = q['question_number']
        if num in gabarito:
            q['answer'] = gabarito[num]
            applied += 1
    return applied


# === MAIN ===
if __name__ == '__main__':
    import sys
    
    # Testa com o PDF 2021 (Acesso Direto)
    pdf_path = 'data/enare_raw/enare_2021_prova.pdf'
    gabarito_path = 'data/enare_raw/enare_2021_gabarito.pdf'
    
    print(f'Lendo texto do PDF: {pdf_path}')
    reader = pypdf.PdfReader(pdf_path)
    full_text = ''
    for page in reader.pages:
        try:
            full_text += page.extract_text() + '\n'
        except:
            pass
    
    print(f'Texto extraído: {len(full_text)} chars, {full_text.count(chr(10))} linhas')
    
    # Parseia questões
    questions = parse_enare_text(full_text, '2021')
    print(f'Questões extraídas: {len(questions)}')
    
    # Parseia gabarito
    if Path(gabarito_path).exists():
        gabarito = parse_enare_gabarito(gabarito_path)
        print(f'Gabarito: {len(gabarito)} respostas')
        applied = apply_gabarito(questions, gabarito)
        print(f'Gabarito aplicado em: {applied} questões')
    
    if questions:
        print('\nPrimeiras 3 questões:')
        for q in questions[:3]:
            print(f"\n  Q{q['question_number']} [{q['specialty']}]:")
            print(f"  Enunciado ({len(q['statement'])} chars): {q['statement'][:120]}...")
            for alt in q['alternatives'][:2]:
                print(f"  ({alt['letter']}) {alt['text'][:80]}")
            if q['answer']:
                print(f"  → Resposta: {q['answer']}")
        
        # Especialidades
        spec_count = Counter(q['specialty'] for q in questions)
        print('\nQuestões por especialidade:')
        for spec, count in spec_count.most_common(15):
            print(f'  {spec}: {count}')
        
        # Salva
        with open('data/enare_raw/enare_2021_questions.json', 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f'\nSalvo: {len(questions)} questões')
    else:
        print('\nNenhuma questão extraída. Debugando...')
        # Mostra as primeiras 30 linhas do texto
        lines = full_text.split('\n')
        print('Primeiras 30 linhas não-vazias:')
        count = 0
        for i, line in enumerate(lines):
            if line.strip():
                print(f'  {i}: {repr(line)}')
                count += 1
                if count >= 30:
                    break
