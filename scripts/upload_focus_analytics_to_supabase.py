#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import json
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_file = os.path.join(base_dir, '.env.local')

    env = {}
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"\'')

    supa_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
    supa_key = env.get('SUPABASE_SERVICE_ROLE_KEY')

    if not supa_url or not supa_key:
        print("❌ Credenciais do Supabase ausentes em .env.local")
        return

    analytics_dir = os.path.join(base_dir, 'data', 'analytics')
    if not os.path.exists(analytics_dir):
        print("❌ Diretório data/analytics não encontrado.")
        return

    files = [f for f in os.listdir(analytics_dir) if f.endswith('.json')]
    print(f"📦 Encontrados {len(files)} arquivos certificados em data/analytics")

    for fn in files:
        file_path = os.path.join(analytics_dir, fn)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        slug = data.get('focusSlug')
        print(f"\n🔄 Sincronizando foco: {slug} ({data.get('focus')})...")

        payload = {
            "focus_slug": slug,
            "specialty": data.get("specialty"),
            "theme": data.get("theme"),
            "focus": data.get("focus"),
            "total_questions": data.get("totalQuestions"),
            "timeframe_range": data.get("timeframeRange", "2017-2026"),
            "version": data.get("version", 1),
            "donut_slices": data.get("donutSlices", []),
            "banca_breakdown": data.get("bancaBreakdown", {}),
            "top_traps": data.get("topTraps", []),
            "audit_trail": {
                s.get("name"): s.get("auditQuestionIds", [])
                for s in data.get("donutSlices", [])
            },
            "audit_hash": data.get("auditHash", ""),
            "needs_recalc": False,
            "certified_at": data.get("certifiedAt"),
            "status": "certified"
        }

        # Upsert via Supabase REST API (on_conflict=focus_slug)
        req_url = f"{supa_url}/rest/v1/focus_exam_analytics?on_conflict=focus_slug"
        req_data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        req = urllib.request.Request(
            req_url,
            data=req_data,
            headers={
                'apikey': supa_key,
                'Authorization': f'Bearer {supa_key}',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            method='POST'
        )

        try:
            with urllib.request.urlopen(req) as resp:
                print(f"  ✅ [UPSERT OK] {slug} -> Status {resp.status}")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            print(f"  ⚠️ HTTP Error {e.code} para {slug}: {err_body}")
        except Exception as e:
            print(f"  ⚠️ Erro de conexão para {slug}: {e}")

if __name__ == '__main__':
    main()

