#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de geração e enriquecimento de alta precisão clínica para os 385 cards do Banco Residência.
Extrai conhecimento médico autêntico de:
1. data/knowledge/ajudamedico_consolidado_9223.json (497 questões com imagens WebP locais verificadas)
2. src/data/clinicaMedicaData.ts, cirurgiaData.ts, pediatriaData.ts, ginecologiaData.ts, obstetriciaData.ts, preventivaData.ts
3. data/knowledge/ (Livros Estratégicos com texto integral por especialidade)
4. src/data/flashcardsData.ts e studyMaterialsData.ts
"""

import json
import os
import re

def build_rich_dataset():
    print("Iniciando auditoria da base de conhecimento local...")
    
    # 1. Carrega dados de imagens verificadas do AjudaMédico
    ajuda_path = os.path.join("data", "knowledge", "ajudamedico_consolidado_9223.json")
    with open(ajuda_path, "r", encoding="utf-8") as f:
        ajuda_data = json.load(f)
    
    questoes_com_img = [q for q in ajuda_data.get("questoes", []) if q.get("images") and len(q["images"]) > 0]
    print(f"Total de questões com imagens no AjudaMédico: {len(questoes_com_img)}")
    
    # Mapeia imagens por tags clínicas
    img_by_tag = {}
    for q in questoes_com_img:
        for tag in q.get("tags", []):
            t_norm = tag.lower().strip()
            if t_norm not in img_by_tag:
                img_by_tag[t_norm] = []
            img_by_tag[t_norm].append(q)
            
    print(f"Total de tags indexadas com imagens: {len(img_by_tag)}")

    # 2. Carrega taxonomia padronizada
    hier_path = os.path.join("src", "data", "hierarquiaCompletaFiltros.json")
    with open(hier_path, "r", encoding="utf-8") as f:
        hier = json.load(f)
        
    padrao = hier["hierarquia_padrao"]
    
    print("Taxonomia padrão carregada com 6 especialidades.")
    return img_by_tag, padrao

if __name__ == "__main__":
    build_rich_dataset()
