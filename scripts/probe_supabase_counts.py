import httpx
import json

env = {}
with open(".env.local", encoding="utf-8") as f:
    for line in f:
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("'\"")

url = env["NEXT_PUBLIC_SUPABASE_URL"]
key = env["SUPABASE_SERVICE_ROLE_KEY"]
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Prefer": "count=exact"
}

# Check count of rows in view_questions_all or the 4 tables
tables = ["questions_direto", "questions_rplus", "questions_revalida", "questions_titulo", "questions"]
print("--- Probing Supabase live tables ---")
for t in tables:
    try:
        r = httpx.get(f"{url}/rest/v1/{t}?select=id&limit=1", headers=headers, timeout=10.0)
        cr = r.headers.get("content-range")
        print(f"Table {t:22}: {r.status_code} | content-range: {cr}")
    except Exception as e:
        print(f"Table {t:22}: Error {e}")

# Check specialty counts in live questions_direto as sample
try:
    r = httpx.get(f"{url}/rest/v1/questions_direto?select=especialidade&limit=10", headers=headers, timeout=10.0)
    print("Sample especialidades from questions_direto:", r.json())
except Exception as e:
    print("Error querying questions_direto:", e)
