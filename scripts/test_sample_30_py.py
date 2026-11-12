import json
import requests
from test_detector_benchmark import detect_medq_watermark

with open('data/test_supabase_sample_30.json') as f:
    items = json.load(f)

detected_count = 0
for i, item in enumerate(items, 1):
    try:
        r = requests.get(item['url'], timeout=5)
        if r.status_code == 200:
            fname = f'data/temp_test_sub_{i}.webp'
            with open(fname, 'wb') as f_out:
                f_out.write(r.content)
            res = detect_medq_watermark(fname)
            if res['detected']:
                detected_count += 1
                print(f"Detected #{i} ({item['banca']} {item['year']}): {res['score']}% - {res['reasons']}")
    except Exception as e:
        pass

print(f"Total in sample 30: {detected_count}/30 detected")

