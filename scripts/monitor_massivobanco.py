import os
import sys
import json
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
STATUS_FILE = os.path.join(DATA_DIR, 'pdf_massivobanco_status.json')

def show_monitor():
    if not os.path.exists(STATUS_FILE):
        print("Ainda não há dados de status do MassivoBanco. O processo está iniciando...")
        return

    try:
        with open(STATUS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Erro ao ler status: {e}")
        return

    total = data.get('total_pdfs', 0)
    done = data.get('processed_pdfs', 0)
    pct = data.get('percent', 0.0)
    gabs = data.get('gabaritos_extraidos_total', 0)
    matches = data.get('matches_total', 0)
    esp_matches = data.get('matches_by_esp', {})
    elapsed = data.get('elapsed_seconds', 0)
    last_up = data.get('last_update', '')

    print("="*75)
    print(" 📑 PAINEL DE MONITORAMENTO: EXTRAÇÃO DE GABARITOS (MASSIVOBANCO)")
    print(f" 🕒 Última atualização: {last_up} (Tempo decorrido: {round(elapsed/60, 1)} min)")
    print("="*75)
    print(f"📊 PROGRESSO DOS PDFs:")
    print(f"   • Total de PDFs no Acervo: {total:,}")
    print(f"   • PDFs Processados:        {done:,} ({pct}%)")
    print(f"   • PDFs Restantes:          {total - done:,}")
    print()
    print(f"📝 EXTRAÇÃO & GABARITOS:")
    print(f"   • PDFs com Gabarito:       {data.get('pdfs_com_gabarito', 0):,}")
    print(f"   • Gabaritos Extraídos:     {gabs:,}")
    print(f"   • 🎯 MATCHES NO SEU BANCO: {matches:,} questões resolvidas!")
    print()
    print(f"🏛️ GABARITOS APLICADOS POR ESPECIALIDADE:")
    for esp, cnt in esp_matches.items():
        print(f"   - {esp.capitalize():20}: +{cnt:,} gabaritos")
    print("="*75)

if __name__ == '__main__':
    show_monitor()
