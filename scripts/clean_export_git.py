import subprocess
import json

# Obter o conteúdo de HEAD:src/data/hierarquiaCompletaFiltros.json via git show com bytes decodificados em utf-8
raw_bytes = subprocess.check_output(['git', 'show', 'HEAD:src/data/hierarquiaCompletaFiltros.json'])
content = raw_bytes.decode('utf-8', errors='replace')

with open('data/hierarquia_antiga_clean.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("Hierarquia antiga exportada com sucesso em UTF-8!")
