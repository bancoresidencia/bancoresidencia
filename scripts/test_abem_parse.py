import pypdf
import re
import json
import sys
import os
sys.path.append(os.getcwd())

pv_path = 'data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf'
gb_path = 'data/official_exams/ABEM/TPN25_Gabarito_Prova_09h00.pdf'

from scripts.run_fase1_pdf_universal import parse_gabarito, parse_prova

gb = parse_gabarito(gb_path)
print(f"ABEM Gabarito extraído: {len(gb)} questões")
print("Primeiras 10 respostas:", dict(list(gb.items())[:10]))

pv = parse_prova(pv_path)
print(f"ABEM Prova extraída: {len(pv)} questões")
if pv:
    first_key = list(pv.keys())[0]
    print(f"Exemplo Questão {first_key}:")
    print("Enunciado:", pv[first_key]['statement'][:150])
    print("Opções:", len(pv[first_key]['options']))
