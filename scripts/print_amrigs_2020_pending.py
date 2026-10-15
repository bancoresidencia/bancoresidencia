import json, sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/amrigs_2020_pending.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

by_spec = {}
for q in qs:
    by_spec.setdefault(q['spec'], []).append(q)

out = [f"Total pending AMRIGS 2020: {len(qs)}"]
for spec, items in sorted(by_spec.items()):
    out.append(f"\n==================== {spec} ({len(items)} questions) ====================")
    for i, q in enumerate(items):
        out.append(f"\n[{i+1}] ID: {q['id']} | Code: {q['code']}")
        out.append(f"STMT: {q['statement']}")
        out.append("OPTIONS:")
        opts = q.get('options')
        if isinstance(opts, dict):
            for k, v in sorted(opts.items()):
                out.append(f"  {k}: {v}")
        elif isinstance(opts, list):
            for idx, item in enumerate(opts):
                out.append(f"  [{idx}] {item}")

with open('data/amrigs_2020_inspect.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(out))

print("Wrote UTF-8 data/amrigs_2020_inspect.txt successfully")
