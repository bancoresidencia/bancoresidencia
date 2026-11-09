import re
import json

with open('src/data/clinicaMedicaData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

temas = re.findall(r'name:\s*"([^"]+)",\s*focos:', content)
focos = re.findall(r'name:\s*"([^"]+)",\s*subfocos:', content)
subfocos = re.findall(r'name:\s*"([^"]+)",\s*sub_subfocos:', content)

# Count all sub_subfocos items inside arrays
all_sub_subs = []
for block in re.findall(r'sub_subfocos:\s*\[(.*?)\]', content, re.DOTALL):
    items = [x.strip().strip('"') for x in block.split(',') if x.strip().strip('"')]
    all_sub_subs.extend(items)

padrao_ouro = [x for x in all_sub_subs if 'Padrão-Ouro' in x or 'Padrao-Ouro' in x]

print(f"Total Temas: {len(temas)}")
print(f"Total Focos: {len(focos)}")
print(f"Total Subfocos: {len(subfocos)}")
print(f"Total Sub-subfocos únicos cadastrados: {len(all_sub_subs)}")
print(f"Ocorrências de 'Padrão-Ouro': {len(padrao_ouro)}")

print("\n--- AMOSTRA DE TEMAS E FOCOS ---")
for t in temas[:5]:
    print(f"Tema: {t}")

print("\n--- AMOSTRA CARDIOLOGIA (IAM) ---")
iam_idx = content.find("IAM com Supradesnivelamento")
if iam_idx != -1:
    snippet = content[iam_idx:iam_idx+800]
    print(snippet)

print("\n--- AMOSTRA TRATAMENTO COM GLICOCORTICOIDES (O BUG DO USUÁRIO) ---")
glico_idx = content.find("Tratamento com Glicocorticoides")
if glico_idx != -1:
    snippet = content[glico_idx:glico_idx+600]
    print(snippet)
else:
    print("Tratamento com Glicocorticoides não encontrado textualmente ou foi renomeado/reorganizado.")
