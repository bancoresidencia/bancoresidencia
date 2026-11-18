import json, glob

gf = glob.glob('data/knowledge/gabarito_das_questoes/**/*.json', recursive=True)[0]
with open(gf, 'r', encoding='utf-8') as f:
    d = json.load(f)
    print("Keys:", list(d.keys()))
    print("questionsFoundInBook:", d.get('questionsFoundInBook'))
    print("chunks count:", len(d.get('chunks', [])))
    if d.get('chunks'):
        print("chunk 0 keys:", list(d['chunks'][0].keys()))
        print("chunk 0 preview:", d['chunks'][0].get('text', '')[:200])
