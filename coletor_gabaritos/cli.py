import os
import sys
import json
import argparse
from datetime import datetime

# Garante suporte a UTF-8 no Windows
sys.stdout.reconfigure(encoding='utf-8')

from .db.database import init_db, DEFAULT_DB_PATH
from .db.repository import GabaritosRepository
from .discovery.crawler_ufpa import UFPACrawler
from .downloader.downloader import DocumentDownloader
from .extractors.dispatcher import SmartDispatcher
from .validator.validator import GabaritoValidator
from .exporters.exporter import GabaritosExporter

def cmd_init():
    init_db()
    repo = GabaritosRepository()
    reg_path = os.path.join(os.path.dirname(__file__), 'discovery', 'sources_registry.json')
    if os.path.exists(reg_path):
        with open(reg_path, 'r', encoding='utf-8') as f:
            sources = json.load(f)
        for s in sources:
            repo.upsert_fonte(
                nome_instituicao=s['nome_instituicao'],
                sigla=s['sigla'],
                banca=s['banca'],
                uf=s['uf'],
                abrangencia=s.get('abrangencia', 'Estadual'),
                url_oficial=s.get('url_oficial', ''),
                observacoes=s.get('observacoes', '')
            )
        print(f"✅ Banco inicializado e {len(sources)} fontes cadastradas no registro.")
    else:
        print("✅ Banco inicializado.")

def cmd_crawl_ufpa():
    print("🌐 Iniciando crawler automatizado para CEPS / UFPA...")
    crawler = UFPACrawler()
    downloader = DocumentDownloader()
    repo = GabaritosRepository()

    # Obtém ID da fonte UFPA
    conn = repo._conn()
    c = conn.cursor()
    c.execute("SELECT id FROM fontes WHERE sigla = 'UFPA_CEPS'")
    row = c.fetchone()
    fonte_id = row['id'] if row else 1
    conn.close()

    editions = crawler.discover_editions()
    print(f" • Edições localizadas no portal: {len(editions)}")

    total_baixados = 0
    for ed in editions:
        year = ed.get('year')
        docs = crawler.discover_pdfs_for_edition(ed['url'], default_year=year)
        # Filtra apenas gabaritos para foco imediato
        gabs = [d for d in docs if 'gabarito' in d['tipo_documento']]
        print(f" • Edição {ed['text'][:30]} ({year}): {len(gabs)} gabaritos localizados")

        for d in gabs:
            res = downloader.download_document(d['url_origem'], 'UFPA', preferred_filename=f"UFPA_{d['ano']}_{d['tipo_documento']}_{d['modalidade'].replace(' ', '_')}.pdf")
            if res['sucesso']:
                repo.upsert_documento(
                    fonte_id=fonte_id,
                    nome_arquivo=os.path.basename(res['caminho_local']),
                    url_origem=d['url_origem'],
                    sha256=res['sha256'],
                    ano=d['ano'],
                    processo_seletivo=d['processo_seletivo'],
                    modalidade=d['modalidade'],
                    tipo_documento=d['tipo_documento'],
                    caminho_local=res['caminho_local'],
                    tamanho_bytes=res['tamanho_bytes']
                )
                total_baixados += 1

    print(f"🎉 Crawl UFPA concluído: {total_baixados} gabaritos cadastrados/atualizados.")

def cmd_run_pilot():
    print("="*75)
    print("🚀 EXECUTANDO PROTÓTIPO PILOTO (3 FONTES OFICIAIS DE FORMATOS DISTINTOS)")
    print("Fontes: 1. FUVEST/USP (SP) | 2. FHEMIG / PSU-MG (MG) | 3. UFPA CEPS (PA)")
    print("="*75)

    cmd_init()
    repo = GabaritosRepository()
    dispatcher = SmartDispatcher()
    validator = GabaritoValidator()
    downloader = DocumentDownloader()

    # 1. Garante que UFPA tenha download ativo
    cmd_crawl_ufpa()

    # 2. Cataloga arquivos locais de USP e PSU_MG se ainda não catalogados
    conn = repo._conn()
    c = conn.cursor()

    # Fontes IDs
    c.execute("SELECT id, sigla FROM fontes")
    fontes_map = {r['sigla']: r['id'] for r in c.fetchall()}
    conn.close()

    # USP FUVEST
    usp_dir = os.path.join('data', 'official_exams', 'USP_FUVEST')
    if os.path.exists(usp_dir):
        for f in os.listdir(usp_dir):
            if f.endswith('.pdf') and any(k in f.lower() for k in ['gb', 'gabarito']):
                fp = os.path.join(usp_dir, f)
                sha = downloader.download_document(f"local://{f}", 'USP_FUVEST', preferred_filename=f)['sha256']
                ano = 2025 if '2025' in f else (2024 if '2024' in f else 2023)
                repo.upsert_documento(
                    fonte_id=fontes_map.get('USP_FUVEST', 1),
                    nome_arquivo=f,
                    url_origem="https://www.fuvest.br/residencia-medica/",
                    sha256=sha,
                    ano=ano,
                    processo_seletivo=f"USP Residência Médica {ano}",
                    modalidade="Acesso Direto",
                    tipo_documento="gabarito_definitivo",
                    caminho_local=fp,
                    tamanho_bytes=os.path.getsize(fp)
                )

    # PSU-MG / FHEMIG
    psumg_dir = os.path.join('data', 'official_exams', 'PSU_MG')
    if os.path.exists(psumg_dir):
        # Pega amostra representativa de Provas Gerais (Tipo 1..4) de anos 2024, 2025 e 2026
        count_psu = 0
        for f in os.listdir(psumg_dir):
            if f.endswith('.pdf') and 'provageral' in f.lower().replace(' ', ''):
                fp = os.path.join(psumg_dir, f)
                sha = downloader.download_document(f"local://{f}", 'PSU_MG', preferred_filename=f)['sha256']
                ano = 2026 if '2026' in f else (2025 if '2025' in f else 2024)
                repo.upsert_documento(
                    fonte_id=fontes_map.get('FHEMIG_PSUMG', 2),
                    nome_arquivo=f,
                    url_origem="https://www.aremg.org.br/processos-seletivos",
                    sha256=sha,
                    ano=ano,
                    processo_seletivo=f"PSU-MG / FHEMIG {ano}",
                    modalidade="Acesso Direto",
                    tipo_documento="gabarito_definitivo" if "definitivo" in f.lower() else "gabarito_preliminar",
                    caminho_local=fp,
                    tamanho_bytes=os.path.getsize(fp)
                )
                count_psu += 1
                if count_psu >= 8: # Amostra para o piloto
                    break

    # 3. Processa e Extrai
    pendentes = repo.get_documentos_pendentes()
    print(f"\n📄 Extraindo gabaritos de {len(pendentes)} documentos do lote piloto...")

    total_questoes_extraidas = 0
    total_gabaritos_criados = 0

    for doc in pendentes:
        sigla = doc['fonte_sigla']
        caminho = doc['caminho_local']
        resultados = dispatcher.dispatch(caminho, hint_sigla=sigla)

        for res in resultados:
            if res.sucesso:
                # Validação
                v_res = validator.validate_gabarito(res.questoes)
                if not v_res['valido']:
                    print(f"  ⚠️ Alerta de validação em {doc['nome_arquivo']} ({res.versao_caderno}): {v_res['erros']}")

                # Persistência
                questoes_data = [{
                    'numero_questao': q.numero_questao,
                    'alternativa': q.alternativa,
                    'status': q.status,
                    'especialidade': q.especialidade,
                    'pagina_pdf': q.pagina_pdf,
                    'trecho_origem': q.trecho_origem,
                    'metodo_extracao': q.metodo_extracao,
                    'confianca': q.confianca,
                    'status_validacao': 'validado' if v_res['valido'] else 'pendente_revisao'
                } for q in res.questoes]

                gab_id = repo.registrar_gabarito_e_questoes(
                    doc_id=doc['id'],
                    versao_caderno=res.versao_caderno,
                    tipo_gabarito=res.tipo_gabarito,
                    questoes_list=questoes_data,
                    confianca_media=res.confianca_media
                )
                total_gabaritos_criados += 1
                total_questoes_extraidas += len(res.questoes)
                print(f"  ✅ [{sigla}] {doc['nome_arquivo'][:38]} | {res.versao_caderno}: {len(res.questoes)} questões extraídas (Integridade: {v_res['taxa_integridade']}%)")
            else:
                print(f"  ❌ Falha ao extrair {doc['nome_arquivo']}: {res.mensagem_erro}")

    # 4. Exportação
    exporter = GabaritosExporter()
    csv_path, n_rows = exporter.export_csv_questoes()
    rep_path = exporter.generate_coverage_report()

    print("\n" + "="*75)
    print("📊 RESULTADOS DO PROTÓTIPO PILOTO:")
    print(f" • Total de Gabaritos/Cadernos Extraídos: {total_gabaritos_criados}")
    print(f" • Total de Questões Extraídas e Normalizadas: {total_questoes_extraidas:,}")
    print(f" • CSV Exportado: {csv_path} ({n_rows} linhas)")
    print(f" • Relatório Gerado: {rep_path}")
    print("="*75)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Coletor Nacional de Gabaritos de Residência Médica")
    parser.add_argument('--init-db', action='store_true', help="Inicializa o banco de dados e cadastro de fontes")
    parser.add_argument('--crawl-ufpa', action='store_true', help="Executa crawl da UFPA CEPS")
    parser.add_argument('--run-pilot', action='store_true', help="Executa protótipo piloto completo (USP, FHEMIG, UFPA)")
    parser.add_argument('--stats', action='store_true', help="Mostra estatísticas do banco de dados")

    args = parser.parse_args()

    if args.init_db:
        cmd_init()
    elif args.crawl_ufpa:
        cmd_crawl_ufpa()
    elif args.run_pilot:
        cmd_run_pilot()
    elif args.stats:
        repo = GabaritosRepository()
        stats = repo.get_estatisticas_cobertura()
        print(json.dumps(stats, indent=2, ensure_ascii=False))
    else:
        cmd_run_pilot()
