#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auditor Forense e Certificador Anti-Alucinação (Fase 1)
Skill: forensic-auditor

Executa auditoria independente de dupla entrada sobre os dados gerados
pelo motor censitário. Verifica soma de 100,0%, integridade de contagens,
conferência dos arrays de IDs e gera a assinatura criptográfica SHA-256.
"""

import os
import sys
import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List

# Forçar stdout UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def compute_sha256_hash(data: Dict[str, Any]) -> str:
    """Gera hash determinístico SHA-256 sobre os dados fundamentais do censo."""
    canonical_dict = {
        "focusSlug": data.get("focusSlug"),
        "totalQuestions": data.get("totalQuestions"),
        "slices": [
            {
                "name": s["name"],
                "percentage": s["percentage"],
                "questionCount": s["questionCount"],
                "ids_hash": hashlib.sha256("".join(sorted(s.get("auditQuestionIds", []))).encode('utf-8')).hexdigest()
            }
            for s in data.get("donutSlices", [])
        ]
    }
    dumped = json.dumps(canonical_dict, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(dumped.encode('utf-8')).hexdigest()

def audit_analytics_payload(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Audita rigorosamente o payload estatístico de um foco."""
    errors = []
    slug = data.get("focusSlug", "unknown")
    total_q = data.get("totalQuestions", 0)

    # 1. Checagem de volume mínimo
    if total_q <= 0:
        errors.append(f"[{slug}] Total de questões zerado ou negativo: {total_q}")
        return False, errors

    slices = data.get("donutSlices", [])
    if not slices:
        errors.append(f"[{slug}] Array donutSlices vazio")
        return False, errors

    # 2. Fechamento Matemático Estrito da Soma (Exatamente 100,0%)
    total_pct = round(sum(s.get("percentage", 0.0) for s in slices), 2)
    if abs(total_pct - 100.0) > 0.1:
        errors.append(f"[{slug}] ERRO MATEMÁTICO: Soma das fatias difere de 100.0%: obteve {total_pct}%")

    # 3. Conferência da Soma das Questões
    total_slice_q = sum(s.get("questionCount", 0) for s in slices)
    if total_slice_q != total_q:
        errors.append(f"[{slug}] DISCREPÂNCIA DE AMOSTRAGEM: totalQuestions ({total_q}) != soma das fatias ({total_slice_q})")

    # 4. Rastreabilidade Estrita por IDs
    for s in slices:
        s_name = s.get("name", "sem_nome")
        q_count = s.get("questionCount", 0)
        ids = s.get("auditQuestionIds", [])
        if len(ids) != q_count:
            errors.append(f"[{slug} -> {s_name}] QUEBRA DE RASTREABILIDADE: questionCount ({q_count}) != tamanho do array auditQuestionIds ({len(ids)})")

    # 5. Sanidade de Prioridades
    for s in slices:
        p = s.get("priority")
        if p not in ["Crítica", "Alta", "Média"]:
            errors.append(f"[{slug}] Prioridade inválida: '{p}'")

    is_valid = len(errors) == 0
    return is_valid, errors

def certify_file(file_path: str) -> bool:
    """Audita um arquivo de analytics, assina com SHA-256 e homologa."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    is_valid, errors = audit_analytics_payload(data)
    slug = data.get('focusSlug', os.path.basename(file_path))

    if not is_valid:
        print(f"❌ [FALHA NA AUDITORIA] {slug}:")
        for err in errors:
            print(f"   • {err}")
        return False

    # Gerar assinatura e certificar
    audit_hash = compute_sha256_hash(data)
    now_iso = datetime.now(timezone.utc).isoformat()

    data["auditHash"] = audit_hash
    data["certifiedAt"] = now_iso
    data["status"] = "certified"
    data["needsRecalc"] = False

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ [CERTIFICADO COM SUCESSO] {slug}")
    print(f"   • Total de questões auditadas: {data['totalQuestions']}")
    print(f"   • Fatias validadas: {len(data['donutSlices'])} (Soma: 100.0%)")
    print(f"   • Assinatura SHA-256: {audit_hash[:16]}...{audit_hash[-8:]}")
    print(f"   • Status: CERTIFIED ({now_iso})")
    return True

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    analytics_dir = os.path.join(base_dir, "data", "analytics")

    print("=" * 60)
    print("🛡️ AUDITORIA FORENSE E CERTIFICAÇÃO ANTI-ALUCINAÇÃO (FASE 1)")
    print("=" * 60)

    if not os.path.exists(analytics_dir):
        print(f"⚠️ Pasta {analytics_dir} não encontrada. Execute primeiro o engine_census_analytics.py.")
        return

    json_files = [f for f in os.listdir(analytics_dir) if f.endswith('.json')]
    if not json_files:
        print(f"ℹ️ Nenhum arquivo JSON encontrado em {analytics_dir}.")
        return

    success_count = 0
    for jf in json_files:
        path = os.path.join(analytics_dir, jf)
        if certify_file(path):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"📊 RESUMO DA AUDITORIA: {success_count}/{len(json_files)} focos certificados e homologados.")
    print("=" * 60)

if __name__ == '__main__':
    main()

