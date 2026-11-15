import pypdf
import re

def parse_prova_flexible(txt):
    # Try QUESTÃO first
    chunks = re.split(r'\n\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\b', txt)
    if len(chunks) < 10:
        # Try "01. " or "1. "
        chunks = re.split(r'\n\s*(\d{1,3})\.\s+', txt)
    
    questions = []
    for i in range(1, len(chunks), 2):
        num = int(chunks[i])
        raw_content = chunks[i+1].strip()
        
        alt_pattern = r'\(([A-E])\)\s*([\s\S]*?)(?=\([A-E]\)|$)'
        alt_matches = list(re.finditer(alt_pattern, raw_content))
        
        if alt_matches:
            statement = raw_content[:alt_matches[0].start()].strip()
            options = []
            for m in alt_matches:
                letter = m.group(1).upper()
                opt_text = m.group(2).strip()
                options.append({'letter': letter, 'text': opt_text})
            questions.append({
                'number': num,
                'statement': statement,
                'options': options
            })
        else:
            questions.append({
                'number': num,
                'statement': raw_content,
                'options': []
            })
    return questions

reader = pypdf.PdfReader('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf')
txt = '\n'.join([p.extract_text() for p in reader.pages])
qs = parse_prova_flexible(txt)
print(f"FUBOG V1A Questions Extracted: {len(qs)}")
if qs:
    print("Sample Q1:")
    print(" Num:", qs[0]['number'])
    print(" Stmt:", qs[0]['statement'][:120])
    print(" Options:", len(qs[0]['options']), [o['letter'] for o in qs[0]['options']])
    print(" Q100:")
    print(" Num:", qs[-1]['number'])
    print(" Stmt:", qs[-1]['statement'][:120])
    print(" Options:", len(qs[-1]['options']), [o['letter'] for o in qs[-1]['options']])
