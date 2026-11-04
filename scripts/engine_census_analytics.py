#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motor Censitário e Analisador de Recorrência de Bancas (Fase 1)
Skill: census-statistician

Executa mineração determinística em 100% do acervo de 130k+ questões.
Garante fechamento matemático de 100,0% no Donut, clustering de subfocos,
ponderação temporal recente (2024-2026) e rastreabilidade total por IDs.
"""

import os
import sys
import json
import re
import unicodedata
from collections import defaultdict
from typing import Dict, List, Any, Tuple

# Forçar stdout UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PALETTE = [
    '#3B82F6',  # Blue
    '#10B981',  # Emerald
    '#EC4899',  # Pink
    '#8B5CF6',  # Purple
    '#F59E0B',  # Amber
    '#06B6D4',  # Cyan
    '#6366F1',  # Indigo
    '#64748B',  # Slate (para "Demais Critérios")
]

CANDIDATE_DATA_PATHS = [
    'data/ginecologia_final_questions.json',
    'data/urologia_final_questions.json',
    'data/backups_pre_correcao/obstetricia_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/cirurgia_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/pediatria_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/clinica_medica_final_questions.json.bak_phase3',
    'data/backups_pre_correcao/medicina_preventiva_final_questions.json.bak_phase3',
    'data/all_homologated_questions_gold.json'
]

def slugify(text: str) -> str:
    """Gera um slug canônico URL-friendly a partir do texto."""
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def clean_subfoco_name(raw: str) -> str:
    """Higieniza variações e formatações de subfoco com reparo de acentuação."""
    if not raw or not raw.strip():
        return "Manejo Geral & Diagnóstico"
    s = raw.strip()
    s = re.sub(r'\s+', ' ', s)
    s_lower = slugify(s).replace('-', ' ')
    
    # Mapeamento canônico para infecção puerperal
    if 'antibiotico' in s_lower:
        return 'Antibioticoterapia na Infecção Puerperal'
    elif 'endometrite' in s_lower or 'quadro clinico' in s_lower or 'etiologia' in s_lower:
        return 'Endometrite Puerperal: Diagnóstico & Clínica'
    elif 'fatores de risco' in s_lower or 'preven' in s_lower:
        return 'Fatores de Risco & Profilaxia na Cesárea'
    elif 'definicao' in s_lower or 'classificao' in s_lower or 'morbidade febril' in s_lower:
        return 'Morbidade Febril Puerperal & Critérios'
    elif 'tromboflebite' in s_lower:
        return 'Tromboflebite Pélvica Séptica & Complicações'
    elif 'mastite' in s_lower:
        return 'Mastite Puerperal: Diagnóstico & Conduta'
    elif 'sepse' in s_lower:
        return 'Sepse Materna & Choque Séptico Puerperal'
    
    # Correções fonéticas gerais
    s = s.replace('Infeco', 'Infecção').replace('infeco', 'infecção')
    s = s.replace('Diagnstico', 'Diagnóstico').replace('diagnstico', 'diagnóstico')
    s = s.replace('Preveno', 'Prevenção').replace('preveno', 'prevenção')
    s = s.replace('Definio', 'Definição').replace('definio', 'definição')
    s = s.replace('Classificao', 'Classificação').replace('classificao', 'classificação')
    s = s.replace('Complicaes', 'Complicações').replace('complicaes', 'complicações')
    s = s.replace('Puerprio', 'Puerpério').replace('puerprio', 'puerpério')
    return s

def calculate_temporal_weight(year_val: Any) -> float:
    """Aplica peso bayesiano baseado na recência da prova."""
    try:
        yr = int(year_val)
    except (ValueError, TypeError):
        yr = 2022
    if yr >= 2024:
        return 3.0  # Perfil contemporâneo das bancas líderes (FGV/ENARE, USP)
    elif yr >= 2021:
        return 2.0  # Ciclo pós-pandemia consolidado
    else:
        return 1.0  # Histórico tradicional de base

def load_all_questions(base_path: str = ".") -> List[Dict[str, Any]]:
    """Carrega todas as questões disponíveis nos arquivos de dados."""
    all_q = []
    loaded_files = set()
    for rel_path in CANDIDATE_DATA_PATHS:
        full_path = os.path.join(base_path, rel_path)
        if os.path.exists(full_path):
            norm_key = os.path.basename(full_path).split('.')[0]
            if norm_key in loaded_files:
                continue
            loaded_files.add(norm_key)
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    q_list = json.load(f)
                    if isinstance(q_list, list):
                        all_q.extend(q_list)
                        print(f"📦 Carregado {len(q_list)} questões de {rel_path}")
            except Exception as e:
                print(f"⚠️ Erro ao ler {full_path}: {e}")
    return all_q

def is_matching_focus(target_focus: str, q_foco: str, q_tema: str, q_subfoco: str = '') -> bool:
    """Verificação flexível de correspondência semântica de foco."""
    t_slug = slugify(target_focus).replace('-', ' ')
    f_slug = slugify(q_foco or '').replace('-', ' ')
    tema_slug = slugify(q_tema or '').replace('-', ' ')
    sub_slug = slugify(q_subfoco or '').replace('-', ' ')

    # 1. Correspondência exata de slug
    if t_slug == f_slug:
        return True

    # 2. Sinônimos canônicos conhecidos
    synonyms = {
        'hemorragia pos parto': ['hpp', 'hemorragia pos parto', 'atonia uterina', 'hemorragias obstetricas'],
        'miomatose uterina': ['miomas uterinos', 'leiomioma', 'miomatose', 'mioma'],
        'miomas uterinos': ['miomatose uterina', 'leiomioma', 'miomas', 'mioma'],
        'infeccao puerperal': ['infeccao puerperal', 'infeco puerperal', 'endometrite puerperal', 'infeccoes puerperais', 'endometrite']
    }

    for main_k, syn_list in synonyms.items():
        if main_k in t_slug:
            for s in syn_list:
                if s in f_slug:
                    return True

    # 3. Subfocos infecciosos dentro de complicações puerperais
    if 'infeccao puerperal' in t_slug and ('complicac' in f_slug or 'complicac' in tema_slug):
        if any(term in sub_slug for term in ['tromboflebite', 'mastite', 'sepse', 'infecc', 'endometrite', 'febre']):
            return True

    # 4. Substring bidirecional se tiver comprimento significativo
    if len(t_slug) > 4 and len(f_slug) > 4 and (t_slug in f_slug or f_slug in t_slug):
        return True

    return False

def process_focus_census(
    focus_name: str,
    questions: List[Dict[str, Any]],
    specialty_hint: str = "",
    theme_hint: str = ""
) -> Dict[str, Any]:
    """Processa o censo determinístico completo para um foco médico."""
    slug = slugify(focus_name)
    matched_questions = []

    for q in questions:
        q_foco = q.get('foco') or q.get('focus') or ''
        q_tema = q.get('tema') or q.get('theme') or ''
        q_sub = q.get('subfoco') or q.get('subfocus') or ''
        if is_matching_focus(focus_name, q_foco, q_tema, q_sub):
            matched_questions.append(q)

    total_count = len(matched_questions)
    if total_count == 0:
        return {
            "focusSlug": slug,
            "focus": focus_name,
            "totalQuestions": 0,
            "error": "Nenhuma questão encontrada para este foco"
        }

    # Detectar especialidade e tema reais da amostra
    specialty_counts = defaultdict(int)
    theme_counts = defaultdict(int)
    for q in matched_questions:
        esp = q.get('especialidade') or q.get('specialty') or specialty_hint
        if esp: specialty_counts[esp] += 1
        t = q.get('tema') or q.get('theme') or theme_hint
        if t: theme_counts[t] += 1

    final_specialty = max(specialty_counts.items(), key=lambda x: x[1])[0] if specialty_counts else specialty_hint
    final_theme = max(theme_counts.items(), key=lambda x: x[1])[0] if theme_counts else theme_hint

    # 1. Agrupar por subfoco com contagem e peso temporal
    subfoco_data = defaultdict(lambda: {"count": 0, "weighted_score": 0.0, "recent_count": 0, "ids": []})
    banca_data = defaultdict(lambda: defaultdict(int))
    difficulty_counts = defaultdict(int)

    for i, q in enumerate(matched_questions):
        raw_sub = q.get('subfoco') or q.get('subfocus')
        clean_sub = clean_subfoco_name(raw_sub)
        qid = str(q.get('id') or f"q-{slug}-{i+1}")
        yr = q.get('year') or q.get('ano') or 2022
        w = calculate_temporal_weight(yr)
        banca = (q.get('banca') or 'Outras').strip()

        subfoco_data[clean_sub]["count"] += 1
        subfoco_data[clean_sub]["weighted_score"] += w
        subfoco_data[clean_sub]["ids"].append(qid)
        if yr and int(yr) >= 2024:
            subfoco_data[clean_sub]["recent_count"] += 1

        banca_data[banca][clean_sub] += 1
        diff = q.get('difficulty') or 'Médio'
        difficulty_counts[diff] += 1

    # 2. Ordenar subfocos por peso e volume
    sorted_subfocos = sorted(
        subfoco_data.items(),
        key=lambda item: (item[1]["weighted_score"], item[1]["count"]),
        reverse=True
    )

    # 3. Selecionar Top 4 a 6 e fechar em 100,0%
    MAX_TOP = 5
    top_items = sorted_subfocos[:MAX_TOP]
    tail_items = sorted_subfocos[MAX_TOP:]

    tail_count = sum(item[1]["count"] for item in tail_items)
    tail_ids = [qid for item in tail_items for qid in item[1]["ids"]]

    slices = []
    accumulated_percent = 0.0

    for idx, (sub_name, data) in enumerate(top_items):
        cnt = data["count"]
        pct = round((cnt / total_count) * 100.0, 1)
        accumulated_percent += pct

        recent_ratio = (data["recent_count"] / cnt) if cnt > 0 else 0
        if recent_ratio >= 0.25:
            trend = "alta"
            trend_label = "🔥 Em Alta (2024-2026)"
        elif recent_ratio <= 0.05:
            trend = "queda"
            trend_label = "📉 Em Queda"
        else:
            trend = "estavel"
            trend_label = "🏛️ Clássico Estável"

        priority = "Crítica" if pct >= 30 else "Alta" if pct >= 15 else "Média"
        short_name = sub_name if len(sub_name) <= 22 else sub_name[:20] + "..."

        slices.append({
            "id": idx + 1,
            "name": sub_name,
            "shortName": short_name,
            "percentage": pct,
            "questionCount": cnt,
            "priority": priority,
            "color": PALETTE[idx % (len(PALETTE) - 1)],
            "trend": trend,
            "trendLabel": trend_label,
            "takeaway": f"Foco de alta incidência nas provas da residência médica.",
            "auditQuestionIds": data["ids"]
        })

    if tail_count > 0:
        residual_pct = round(100.0 - accumulated_percent, 1)
        if residual_pct < 0:
            residual_pct = 0.0
        slices.append({
            "id": len(slices) + 1,
            "name": "Demais Critérios & Diagnósticos Menores",
            "shortName": "Demais Aspectos",
            "percentage": residual_pct,
            "questionCount": tail_count,
            "priority": "Média",
            "color": PALETTE[-1],
            "trend": "estavel",
            "trendLabel": "🏛️ Tópicos Secundários",
            "takeaway": "Aspectos conceituais e variantes de menor frequência em provas",
            "auditQuestionIds": tail_ids
        })

    # Ajuste fino para soma fechar exatamente em 100.0%
    total_slice_pct = round(sum(s["percentage"] for s in slices), 1)
    if total_slice_pct != 100.0 and len(slices) > 0:
        diff = round(100.0 - total_slice_pct, 1)
        slices[0]["percentage"] = round(slices[0]["percentage"] + diff, 1)

    # 4. Decomposição por Banca
    banca_breakdown = {}
    for banca_name, sub_counts in banca_data.items():
        b_total = sum(sub_counts.values())
        if b_total >= 5:
            sorted_b_subs = sorted(sub_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            banca_breakdown[banca_name] = {
                "banca": banca_name,
                "totalQuestions": b_total,
                "topSubfocos": [
                    {
                        "subfoco": s_name,
                        "questionCount": s_cnt,
                        "percentageInBanca": round((s_cnt / b_total) * 100.0, 1)
                    }
                    for s_name, s_cnt in sorted_b_subs
                ],
                "predominantDifficulty": max(difficulty_counts.items(), key=lambda x: x[1])[0] if difficulty_counts else "Médio"
            }

    return {
        "focusSlug": slug,
        "specialty": final_specialty,
        "theme": final_theme,
        "focus": focus_name,
        "totalQuestions": total_count,
        "timeframeRange": "2017-2026",
        "version": 1,
        "donutSlices": slices,
        "bancaBreakdown": banca_breakdown,
        "topTraps": [
            {
                "subfoco": slices[0]["name"] if slices else "Manejo Geral",
                "trapTitle": "Distrator de Conduta Invertida",
                "trapDescription": "Alternativas com condutas corretas na patologia porém indicadas em momento cronológico trocado."
            }
        ],
        "needsRecalc": False,
        "status": "draft"
    }

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 60)
    print("📊 MOTOR CENSITÁRIO ESTATÍSTICO DE QUESTÕES (FASE 1)")
    print("=" * 60)

    questions = load_all_questions(base_dir)
    print(f"✅ Total de questões carregadas em memória: {len(questions)}")

    pilot_focos = [
        ("Miomas Uterinos", "Ginecologia e Obstetrícia", "Fundamentos de Ginecologia"),
        ("Hemorragia Pós-Parto (HPP)", "Ginecologia e Obstetrícia", "Emergências Obstétricas"),
        ("Infecção Puerperal", "Ginecologia e Obstetrícia", "Puerpério & Complicações Puerperais")
    ]

    out_dir = os.path.join(base_dir, "data", "analytics")
    os.makedirs(out_dir, exist_ok=True)

    for foco_name, esp, tema in pilot_focos:
        print(f"\n🔍 Processando Censo para: {foco_name}...")
        result = process_focus_census(foco_name, questions, esp, tema)
        print(f"  • Total auditado: {result.get('totalQuestions')} questões")
        print(f"  • Fatias geradas: {len(result.get('donutSlices', []))} fatias")
        sum_pct = sum(s['percentage'] for s in result.get('donutSlices', []))
        print(f"  • Soma percentual: {sum_pct:.1f}%")

        out_file = os.path.join(out_dir, f"{result['focusSlug']}.json")
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"  💾 Salvo em: {out_file}")

if __name__ == '__main__':
    main()
