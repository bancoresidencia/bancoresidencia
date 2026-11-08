"""
Purga de Questões Não-Residência:
Remove as 642 questões classificadas como:
  - CONCURSO_PUBLICO_GERAL (548)
  - ORIGEM_INDEFINIDA (50)
  - AUTORAL_PLATAFORMA (44)
mantendo exclusivamente as 64.531 questões de:
  - OFICIAL_RESIDENCIA (63.162)
  - BANCA_ORGANIZADORA_RESIDENCIA (1.369)

Preserva os registros excluídos na tabela 'questoes_excluidas_nao_residencia'
para fins de rastreabilidade, executa VACUUM no SQLite e atualiza o manifesto mestre.
"""

import os
import sqlite3
import json
import time

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
STAGING_DIR = os.path.join(DATA_DIR, 'bancos_organizados_staging')
TARGET_DB = os.path.join(STAGING_DIR, 'residencia_acesso_direto.db')
MANIFEST_PATH = os.path.join(STAGING_DIR, 'manifesto_geral_bancos.json')

EXCLUDE_TYPES = ('CONCURSO_PUBLICO_GERAL', 'ORIGEM_INDEFINIDA', 'AUTORAL_PLATAFORMA')
KEEP_TYPES = ('OFICIAL_RESIDENCIA', 'BANCA_ORGANIZADORA_RESIDENCIA')

def main():
    print("=" * 70)
    print("PURGA DE QUESTÕES NÃO-RESIDÊNCIA E INTEGRAÇÃO PURA")
    print("=" * 70)
    t0 = time.time()

    conn = sqlite3.connect(TARGET_DB)
    cur = conn.cursor()

    # 1. Verificar contagens antes
    cur.execute("SELECT COUNT(*) FROM questoes;")
    total_before = cur.fetchone()[0]

    cur.execute(f"SELECT COUNT(*) FROM questoes WHERE tipo_origem IN {EXCLUDE_TYPES};")
    total_to_exclude = cur.fetchone()[0]

    cur.execute(f"SELECT COUNT(*) FROM questoes WHERE tipo_origem IN {KEEP_TYPES};")
    total_to_keep = cur.fetchone()[0]

    print(f"Total antes da purga: {total_before:,}")
    print(f"Total a excluir (Concursos Gerais, URLs, Plataformas): {total_to_exclude:,}")
    print(f"Total a manter (Oficiais + Bancas de Residência): {total_to_keep:,}")

    # 2. Arquivar os excluídos em tabela de auditoria dentro do banco
    print("\nArquivando questões excluídas em 'questoes_excluidas_nao_residencia'...")
    cur.execute("DROP TABLE IF EXISTS questoes_excluidas_nao_residencia;")
    cur.execute(f"""
        CREATE TABLE questoes_excluidas_nao_residencia AS
        SELECT * FROM questoes
        WHERE tipo_origem IN {EXCLUDE_TYPES};
    """)
    conn.commit()

    # 3. Purgar da tabela principal 'questoes'
    print("Removendo questões não-residência da tabela 'questoes'...")
    cur.execute(f"""
        DELETE FROM questoes
        WHERE tipo_origem IN {EXCLUDE_TYPES};
    """)
    conn.commit()

    # 4. Validar contagem final
    cur.execute("SELECT COUNT(*) FROM questoes;")
    total_after = cur.fetchone()[0]
    print(f"✔ Contagem final na tabela 'questoes': {total_after:,} (Esperado: {total_to_keep:,})")

    # 5. Otimização física (VACUUM & PRAGMA optimize)
    print("\nExecutando PRAGMA optimize e VACUUM para compactar o arquivo...")
    cur.execute("PRAGMA optimize;")
    conn.close()

    vacuum_conn = sqlite3.connect(TARGET_DB)
    vacuum_conn.execute("VACUUM;")
    vacuum_conn.close()

    final_size_mb = os.path.getsize(TARGET_DB) / (1024 * 1024)
    print(f"✔ Banco otimizado com sucesso! Novo tamanho físico: {final_size_mb:.2f} MB")

    # 6. Recalcular indicadores da base remanescente
    stats_conn = sqlite3.connect(TARGET_DB)
    stats_cur = stats_conn.cursor()

    stats_cur.execute("SELECT COUNT(*) FROM questoes WHERE instituicao IS NOT NULL AND instituicao != '';")
    with_inst = stats_cur.fetchone()[0]

    stats_cur.execute("SELECT COUNT(*) FROM questoes WHERE ano IS NOT NULL AND ano > 1990;")
    with_ano = stats_cur.fetchone()[0]

    stats_cur.execute("SELECT COUNT(*) FROM questoes WHERE gabarito IN ('A', 'B', 'C', 'D', 'E');")
    with_gab = stats_cur.fetchone()[0]

    stats_cur.execute("""
        SELECT instituicao, COUNT(*) 
        FROM questoes 
        WHERE instituicao IS NOT NULL AND instituicao != ''
        GROUP BY instituicao 
        ORDER BY COUNT(*) DESC 
        LIMIT 5;
    """)
    top_inst = [{'instituicao': r[0], 'questoes': r[1]} for r in stats_cur.fetchall()]

    stats_cur.execute("""
        SELECT especialidade, COUNT(*) 
        FROM questoes 
        WHERE especialidade IS NOT NULL 
        GROUP BY especialidade 
        ORDER BY COUNT(*) DESC 
        LIMIT 5;
    """)
    top_esp = [{'especialidade': r[0], 'questoes': r[1]} for r in stats_cur.fetchall()]

    stats_conn.close()

    # 7. Atualizar Manifesto Mestre
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
                man_data = json.load(f)

            db_entry = man_data.get('databases', {}).get('residencia_acesso_direto', {})
            db_entry['total_questions'] = total_after
            db_entry['file_size_mb'] = round(final_size_mb, 2)
            db_entry['questoes_excluidas_concurso_simulado'] = total_to_exclude
            db_entry['taxa_instituicao_preenchida'] = round(with_inst / total_after * 100, 2)
            db_entry['taxa_ano_valido'] = round(with_ano / total_after * 100, 2)
            db_entry['taxa_gabarito_valido'] = round(with_gab / total_after * 100, 2)
            db_entry['top_instituicoes'] = top_inst
            db_entry['top_especialidades'] = top_esp
            db_entry['composicao_origem'] = {
                'OFICIAL_RESIDENCIA': 63162,
                'BANCA_ORGANIZADORA_RESIDENCIA': 1369,
                'TOTAL_INTEGRADO': total_after
            }

            # Recalcular total global
            total_global = 0
            for k, d in man_data.get('databases', {}).items():
                total_global += d.get('total_questions', 0)
            man_data['total_global_questions'] = total_global
            man_data['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')

            with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
                json.dump(man_data, f, ensure_ascii=False, indent=2)

            print(f"\n✔ Manifesto mestre atualizado em: {MANIFEST_PATH}")
            print(f"Total global atualizado nos 4 bancos de expansão: {total_global:,} questões.")
        except Exception as e:
            print(f"⚠️ Erro ao atualizar manifesto: {e}")

    print(f"\n🎉 PURGA CONCLUÍDA COM SUCESSO EM {time.time() - t0:.2f} SEGUNDOS!")

if __name__ == '__main__':
    main()
