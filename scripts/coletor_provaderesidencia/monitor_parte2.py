import sqlite3
import os
import json
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta_parte2.db')
STATUS_FILE = os.path.join(DATA_DIR, 'coleta_provaderesidencia_parte2_status.json')

def main():
    if not os.path.exists(DB_PATH):
        print(f"❌ Banco de dados {DB_PATH} não encontrado.")
        return

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT status, count(*) FROM provas GROUP BY status")
    provas_status = dict(c.fetchall())

    c.execute("SELECT count(*) FROM questoes")
    total_q = c.fetchone()[0]

    c.execute("SELECT count(*) FROM questoes WHERE gabarito_oficial != ''")
    com_gab = c.fetchone()[0]

    c.execute("SELECT count(*) FROM questoes WHERE imagens_json != '[]' AND imagens_json IS NOT NULL")
    com_img = c.fetchone()[0]

    c.execute("SELECT count(*) FROM questoes WHERE filtros_json != '{}' AND filtros_json IS NOT NULL")
    com_filtros = c.fetchone()[0]

    c.execute("SELECT count(*) FROM questoes WHERE is_anulada = 1")
    anuladas = c.fetchone()[0]

    total_provas = sum(provas_status.values())
    concluidas = provas_status.get('concluida', 0)
    pendentes = provas_status.get('pendente', 0)
    erros = provas_status.get('erro', 0)
    em_progresso = provas_status.get('em_progresso', 0)

    pct = (concluidas / total_provas * 100) if total_provas > 0 else 0

    status_data = {}
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                status_data = json.load(f)
        except:
            pass

    print("\n" + "=" * 80)
    print(" 🏥 PAINEL DE MONITORAMENTO: PARTE 2 (EXPANSÃO & FILTROS)")
    print(f" 🕒 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Banco: provaderesidencia_coleta_parte2.db")
    print("=" * 80)
    print(f"\n📊 PROGRESSO DAS PROVAS PENDENTES (TOTAL: {total_provas:,}):")
    print(f"   • Concluídas:          {concluidas:,} ({pct:.1f}%)")
    print(f"   • Em Andamento:        {em_progresso:,}")
    print(f"   • Pendentes na Fila:   {pendentes:,}")
    print(f"   • Com Erro/Falha:      {erros:,}")

    print(f"\n📝 QUESTÕES EXTRAÍDAS COM METADADOS RICOS:")
    print(f"   • Total de Questões Salvas:     {total_q:,}")
    print(f"   • Com Gabarito Oficial:         {com_gab:,}")
    print(f"   • Com Imagens Estruturadas:     {com_img:,}")
    print(f"   • Com Filtros/Tags Mapeados:    {com_filtros:,}")
    print(f"   • Questões Anuladas:            {anuladas:,}")

    if status_data:
        print(f"\n⚡ ÚLTIMO EVENTO: [{status_data.get('stage')}] {status_data.get('details')}")

    print("=" * 80 + "\n")
    conn.close()

if __name__ == '__main__':
    main()
