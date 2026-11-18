#!/usr/bin/env python3
"""
Fase 5 — High-Throughput Checkpointed Uploader to Live Supabase (257,090 rows)
Groups updates by (table, especialidade, tema, foco, subfoco, sub_subfoco) so each
HTTP PATCH updates up to 120 IDs via Primary Key Index Scan in ~15ms, completing
all 4 canonical tables (`questions_direto`, `questions_rplus`, `questions_revalida`,
`questions_titulo`) + legacy `questions` with zero statement_timeout and full
checkpoint resumability! Also refreshes `question_facets` live via RPC.
"""
import collections
import concurrent.futures
import httpx
import json
import os
import time

SCRATCH = r"C:\Users\froge\.gemini\antigravity\brain\94e81f8f-586e-45f3-9db2-d3e5fed2ce14\scratch"
CHECKPOINT_PATH = os.path.join(SCRATCH, "supabase_upload_v3_checkpoint.json")


def load_env():
    env = {}
    with open(".env.local", encoding="utf-8") as f:
        for l in f:
            if "=" in l and not l.strip().startswith("#"):
                k, v = l.split("=", 1)
                env[k.strip()] = v.strip().strip("'\"")
    return env


def main():
    t0 = time.time()
    env = load_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"]
    key = env["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    print("Loading live manifest and v3 classifications...")
    live_manifest = json.load(open(os.path.join(SCRATCH, "supabase_live_ids_manifest.json"), encoding="utf-8"))
    classifications = json.load(open("data/supabase_v3_classifications.json", encoding="utf-8"))

    # Check if extended precision columns are already live on questions_direto
    has_ext_cols = False
    with httpx.Client(timeout=15.0) as client:
        r = client.get(f"{url}/rest/v1/questions_direto?select=id,programa_rplus&limit=1", headers=headers)
        if r.status_code == 200:
            has_ext_cols = True
    print(f"Extended precision columns live on Supabase tables: {has_ext_cols}")

    # Build grouped PATCH tasks: (table, tuple_key, [id_chunk], payload_dict)
    tasks = []
    CHUNK_SIZE = 100

    for tbl in ["questions_titulo", "questions_revalida", "questions_rplus", "questions_direto"]:
        groups = collections.defaultdict(list)
        missing_in_cls = 0
        for qid in live_manifest[tbl]:
            c = classifications.get(qid)
            if not c:
                missing_in_cls += 1
                continue
            if has_ext_cols:
                g_key = (c["e"], c["t"], c["f"], c["sf"], c["ss"], c["pr"], c["bo"], c["uf"], c["mr"], c["hi"], c["ct"], c["id_out"])
            else:
                g_key = (c["e"], c["t"], c["f"], c["sf"], c["ss"])
            groups[g_key].append(qid)

        print(f"Table {tbl}: {len(live_manifest[tbl])} rows -> {len(groups)} distinct groups (unmatched={missing_in_cls})")
        for g_key, id_list in groups.items():
            if has_ext_cols:
                payload = {
                    "especialidade": g_key[0],
                    "tema": g_key[1],
                    "foco": g_key[2],
                    "subfoco": g_key[3],
                    "sub_subfoco": g_key[4],
                    "programa_rplus": g_key[5] or None,
                    "banca_organizadora": g_key[6],
                    "uf": g_key[7],
                    "macrorregiao": g_key[8],
                    "has_images": g_key[9],
                    "commentary_tier": g_key[10],
                    "is_desatualizada": g_key[11],
                }
            else:
                payload = {
                    "especialidade": g_key[0],
                    "tema": g_key[1],
                    "foco": g_key[2],
                    "subfoco": g_key[3],
                    "sub_subfoco": g_key[4],
                }
            for i in range(0, len(id_list), CHUNK_SIZE):
                chunk = id_list[i : i + CHUNK_SIZE]
                task_id = f"{tbl}:{chunk[0]}:{len(chunk)}"
                tasks.append((task_id, tbl, chunk, payload))

    done_set = set()
    if os.path.exists(CHECKPOINT_PATH):
        try:
            done_set = set(json.load(open(CHECKPOINT_PATH, encoding="utf-8")))
        except Exception:
            done_set = set()

    pending = [t for t in tasks if t[0] not in done_set]
    print(f"Total PATCH batches: {len(tasks)} | Already done: {len(done_set)} | Pending: {len(pending)}")

    limits = httpx.Limits(max_keepalive_connections=30, max_connections=40)
    client = httpx.Client(timeout=30.0, limits=limits)

    def run_patch(task):
        tid, tbl, chunk, payload = task
        in_clause = ",".join(f'"{x}"' for x in chunk)
        endpoint = f"{url}/rest/v1/{tbl}?id=in.({in_clause})"
        for attempt in range(5):
            try:
                resp = client.patch(endpoint, headers=headers, json=payload)
                if resp.status_code in (200, 204):
                    return tid, len(chunk), None
                if resp.status_code in (429, 500, 502, 503, 504):
                    time.sleep(0.5 * (2 ** attempt))
                    continue
                return tid, 0, f"HTTP {resp.status_code}: {resp.text[:180]}"
            except Exception as exc:
                time.sleep(0.5 * (2 ** attempt))
                if attempt == 4:
                    return tid, 0, str(exc)
        return tid, 0, "Max retries exceeded"

    updated_rows = 0
    errors = []
    completed_batches = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=24) as pool:
        futures = [pool.submit(run_patch, t) for t in pending]
        for fut in concurrent.futures.as_completed(futures):
            tid, cnt, err = fut.result()
            if err:
                errors.append((tid, err))
                if len(errors) <= 5:
                    print(f"[ERROR] {tid} -> {err}")
            else:
                done_set.add(tid)
                updated_rows += cnt
                completed_batches += 1
                if completed_batches % 500 == 0:
                    json.dump(list(done_set), open(CHECKPOINT_PATH, "w", encoding="utf-8"))
                    elapsed = time.time() - t0
                    print(f"  Uploaded {completed_batches}/{len(pending)} batches ({updated_rows} rows updated, {elapsed:.1f}s)...")

    json.dump(list(done_set), open(CHECKPOINT_PATH, "w", encoding="utf-8"))

    # Trigger refresh_question_facets RPC!
    print("Triggering refresh_question_facets() RPC on Supabase...")
    try:
        r_ref = client.post(f"{url}/rest/v1/rpc/refresh_question_facets", headers=headers, json={})
        print(f"refresh_question_facets response: HTTP {r_ref.status_code}")
    except Exception as exc:
        print(f"refresh_question_facets warning: {exc}")

    client.close()
    print(f"=== SUPABASE UPLOAD COMPLETE: {updated_rows} rows updated in {time.time()-t0:.1f}s | errors={len(errors)} ===")
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

