import json
import glob
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ids = {
    'd91f4c09-8f54-4e3f-9ddc-c60e8fc8e7ec': 'd91f',
    'b76136a5-fd8b-4ba4-b54b-9d01de69eb1e': 'b761',
    '11955789-6270-43c4-95bf-aa36478a8ffd': '1195',
    '59b8c8a9-5708-497e-bfa6-5205e4187f6b': '59b8',
    '99dae9e0-0ab6-45e6-b46d-570c63dd862e': '99da',
    'c7ab4922-51bb-46ab-9b8d-a70b5ef97678': 'c7ab',
    '1ae26aad-e266-422a-8296-684af7c295e8': '1ae2',
    '4332659d-6466-4ddd-a9c9-fc4f9fb21686': '4332',
    'b2ab7de7-9d7d-4b7d-aac4-845c2655ab23': 'b2ab'
}

for fpath in glob.glob('data/*_final_questions.json'):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        qid = q.get('id')
        if qid in ids:
            stmt = " ".join((q.get('statement') or q.get('text') or '').split())
            opts = [o.get('letter') + ') ' + o.get('text', '')[:30] for o in q.get('options', [])]
            print(f"ID: {qid} | File: {fpath}")
            print(f"  Stmt end: ...{stmt[-120:]}")
            print(f"  Opts: {opts[:2]}")
