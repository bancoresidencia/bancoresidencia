import os
import sys
import json
import sqlite3
import shutil

sys.path.append('scripts')
from batch_inpaint_all_medq import make_side_by_side

qid = 'questions_24d172fe-88a7-4916-ae8d-89799efd4832'
orig_url = 'https://api.medevo.com.br/storage/v1/object/public/questoes/revalida/2026/apos-6-horas-de-trabalho-de-parto-a-paciente-apresentava-dil-01.webp'
base_name = 'apos-6-horas-de-trabalho-de-parto-a-paciente-apresentava-dil-01.webp'

orig_saved = f'data/imagens_medq_originais/orig_{qid}_{base_name}'
clean_saved = f'data/imagens_higienizadas_medq/clean_{qid}_{base_name}'
comp_saved = f'data/comparacoes_antes_depois_medq/comp_{qid}_{base_name}'

shutil.copy('data/test_user_question_24d1.webp', orig_saved)
shutil.copy('data/test_user_question_24d1_perfect.webp', clean_saved)
make_side_by_side(orig_saved, clean_saved, comp_saved, f"USP/HCFMUSP 2026 | {qid}")

new_storage_url = f"/storage/questoes/imagens_higienizadas_medq/clean_{qid}_{base_name}"
comp_storage_url = f"/storage/questoes/comparacoes_medq/comp_{qid}_{base_name}"

# Update SQLite
conn = sqlite3.connect('data/supabase_tables/supabase_tables.db')
cursor = conn.cursor()
cursor.execute("UPDATE questions_curated_staging SET images = ? WHERE id = ?", (json.dumps([new_storage_url]), qid))
conn.commit()
conn.close()

# Update decisions JSON
dec_path = 'data/supabase_tables/image_watermark_decisions.json'
with open(dec_path, 'r', encoding='utf-8') as f:
    dec_data = json.load(f)

dec_data.setdefault('medq_actions', {})[qid] = {
    'action': 'inpainted',
    'original_url': orig_url,
    'cleaned_url': new_storage_url,
    'comparison_url': comp_storage_url,
    'acted_at': '2026-11-12T22:40:00Z'
}

with open(dec_path, 'w', encoding='utf-8') as f:
    json.dump(dec_data, f, indent=2)

print(f"✅ Questão {qid} atualizada com sucesso no banco de dados!")

