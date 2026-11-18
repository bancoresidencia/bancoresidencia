import os
from google import genai
from google.genai import types

# Load GEMINI_API_KEY from .env.local
env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'\"")

api_key = env.get('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

prompt = """
Pesquise na web no Google por esta questão de residência médica:
"Além da triagem específica por meio do M-CHAT-R/F"

Retorne:
1. A banca e ano exatos da prova
2. O gabarito oficial definitivo (A, B, C, D ou E)
3. A alternativa correta por extenso
4. As fontes/links encontrados
"""

response = client.models.generate_content(
    model='gemini-flash-latest',
    contents=prompt,
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.0
    )
)

print("Texto gerado:")
print(response.text)
if response.candidates and response.candidates[0].grounding_metadata:
    gm = response.candidates[0].grounding_metadata
    print("\nGrounding chunks / fontes:")
    for chunk in gm.grounding_chunks or []:
        if chunk.web:
            print(f"- {chunk.web.title}: {chunk.web.uri}")
