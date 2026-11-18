from google import genai

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

client = genai.Client(api_key=env.get('GEMINI_API_KEY'))
for m in client.models.list():
    if 'flash' in m.name:
        print(m.name)
