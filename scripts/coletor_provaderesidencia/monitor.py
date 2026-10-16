import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import json
from datetime import datetime

# Garante path do projeto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from scripts.coletor_provaderesidencia.config import STATUS_FILE, DB_PATH
from scripts.coletor_provaderesidencia.db import get_stats

def print_dashboard():
    if not os.path.exists(DB_PATH):
        print("❌ Banco de dados ainda não inicializado. A coleta ainda não foi iniciada.")
        return

    stats = get_stats()

    # Ler status live se existir
    live_details = "Aguardando início..."
    live_timestamp = "-"
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                live_details = data.get('details', live_details)
                live_timestamp = data.get('timestamp', live_timestamp)
        except:
            pass

    total_p = stats['total_provas']
    conc_p = stats['provas_concluidas']
    pct_p = ((conc_p / total_p) * 100) if total_p > 0 else 0

    print("\n" + "=" * 80)
    print(" 🏥 PAINEL DE MONITORAMENTO: COLETA DE PROVAS & GABARITOS NACIONAIS")
    print(f" 🕒 Última atualização: {live_timestamp}")
    print("=" * 80)

    print(f"\n📊 PROGRESSO DAS PROVAS LIBERADAS (1.563 PROVAS):")
    print(f"   • Total de Provas Catalogadas: {total_p:,}")
    print(f"   • Provas Concluídas:          {conc_p:,} ({pct_p:.1f}%)")
    print(f"   • Provas em Andamento:        {stats['provas_em_progresso']}")
    print(f"   • Provas Pendentes na Fila:   {stats['provas_pendentes']:,}")
    print(f"   • Provas com Erro/Falha:      {stats['provas_erro']}")

    print(f"\n📝 QUESTÕES & GABARITOS EXTRAÍDOS:")
    print(f"   • Total de Questões Coletadas:   {stats['total_questoes']:,}")
    print(f"   • Gabaritos Oficiais Obtidos:    {stats['questoes_com_gabarito']:,}")
    print(f"   • Questões Anuladas Detectadas:  {stats['questoes_anuladas']:,}")

    print(f"\n🎯 INTEGRAÇÃO COM O SEU BANCO DE QUESTÕES:")
    print(f"   • Gabaritos Aplicados no seu Banco: {stats['total_matches_banco']:,} questões resolvidas!")
    
    matches_esp = stats['matches_por_especialidade']
    if matches_esp:
        print("   • Gabaritos adicionados por Especialidade:")
        for esp, qtd in sorted(matches_esp.items(), key=lambda x: x[1], reverse=True):
            print(f"     - {esp.replace('_', ' ').title():<22}: +{qtd:,} gabaritos")

    print(f"\n📚 NOVAS QUESTÕES CATEGORIZADAS POR INSTITUIÇÃO:")
    print(f"   • Total armazenado no SQLite: {stats['novas_questoes_categorizadas']:,} novas questões")

    print(f"\n⚡ STATUS ATUAL: {live_details}")
    print("=" * 80 + "\n")

if __name__ == '__main__':
    print_dashboard()
