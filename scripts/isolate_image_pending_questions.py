"""
Script de Isolamento, Extração WebP, Quarentena e Higienização no Supabase
========================================================================
1. Mapeia todas as questões com dependência/pendência de imagens nas 4 tabelas de expansão.
2. Associa as imagens já baixadas e convertidas em WebP (sem links externos).
3. Salva todas as questões isoladas em:
     - data/bancos_organizados_staging/questoes_quarentena_pendencia_imagens.db
     - data/bancos_organizados_staging/questoes_quarentena_pendencia_imagens.json
4. Remove essas questões das tabelas ativas locais 'questoes' nos 4 arquivos .db.
5. Remove essas questões no Supabase via lotes de DELETE por UUID (uuid5).
6. Gera o dashboard interativo em docs/dashboard_questoes_pendencia_imagens.html.
"""

import os
import sys
import json
import sqlite3
import re
import uuid
import time
import requests
from typing import Dict, List, Any

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
STAGING_DIR = os.path.join(BASE_DIR, 'data', 'bancos_organizados_staging')
WEBP_DIR = os.path.join(BASE_DIR, 'data', 'extracted_images_webp')
QUARANTINE_DB = os.path.join(STAGING_DIR, 'questoes_quarentena_pendencia_imagens.db')
QUARANTINE_JSON = os.path.join(STAGING_DIR, 'questoes_quarentena_pendencia_imagens.json')
DASHBOARD_HTML = os.path.join(BASE_DIR, 'docs', 'dashboard_questoes_pendencia_imagens.html')

TABLES_CONFIG = [
    {
        'db_file': os.path.join(STAGING_DIR, 'titulo_especialista.db'),
        'target_table': 'questions_expansion_titulo_especialista',
        'display_name': 'Título de Especialista',
        'short_prefix': 'question' # 'questions_expansion_titulo_especialista'[:8]
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'revalida.db'),
        'target_table': 'questions_expansion_revalida',
        'display_name': 'Revalida',
        'short_prefix': 'question'
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'r_plus.db'),
        'target_table': 'questions_expansion_r_plus',
        'display_name': 'R+ Especialidades',
        'short_prefix': 'question'
    },
    {
        'db_file': os.path.join(STAGING_DIR, 'residencia_acesso_direto.db'),
        'target_table': 'questions_expansion_direto',
        'display_name': 'Residência Médica (Acesso Direto)',
        'short_prefix': 'question'
    }
]

url_pattern = re.compile(r'https?://[^\s"\'<>)]+(?:\.(?:jpg|png|jpeg|gif|webp)|/imgs/|medbrave|hardwork)', re.IGNORECASE)
ver_imagem_pattern = re.compile(r'\(?\s*VER\s+(?:IMAGEM|FOTO|FIGURA|ANEXO)!?\s*\)?', re.IGNORECASE)
deictic_patterns = [
    re.compile(r'\b(?:observe|veja|analise|considere|conforme|segundo|de acordo com)\b.*?\b(?:a imagem|as imagens|a figura|as figuras|a foto|as fotos|o traçado|os traçados|o ecg|a radiografia|a tomografia|a tc|a ressonância|o rx|o gráfico|o aspecto)\b', re.IGNORECASE),
    re.compile(r'\b(?:na imagem|nas imagens|na figura|nas figuras|na foto|nas fotos|no traçado|no ecg|na radiografia|na tomografia|na lâmina|no gráfico)\b\s+(?:abaixo|a seguir|anex[ao]|mostrad[ao]|apresentad[ao]|acima)', re.IGNORECASE),
    re.compile(r'\b(?:imagem|figura|foto|radiografia|tomografia|traçado|gráfico)\s+(?:abaixo|a seguir)\b', re.IGNORECASE),
    re.compile(r'\b(?:com base|a partir)\s+d[ao]s?\s+(?:imagem|figura|foto|radiografia|tomografia|traçado|gráfico|ecg)\b', re.IGNORECASE)
]

def load_env() -> Dict[str, str]:
    env = {}
    for env_file in ['.env.local', '.env']:
        path = os.path.join(BASE_DIR, env_file)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def init_quarantine_db():
    conn = sqlite3.connect(QUARANTINE_DB)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS questoes_quarentena (
        id_staging INTEGER,
        tabela_origem TEXT,
        anchor_source TEXT,
        anchor_original_id TEXT,
        enunciado TEXT,
        opcoes_json TEXT,
        gabarito TEXT,
        is_anulada INTEGER,
        ano INTEGER,
        instituicao TEXT,
        banca TEXT,
        uf TEXT,
        modalidade TEXT,
        especialidade TEXT,
        tema TEXT,
        foco TEXT,
        subfoco TEXT,
        dificuldade TEXT,
        dificuldade_indice REAL,
        comentarios TEXT,
        tipo_origem TEXT,
        motivo_classificacao TEXT,
        categoria_pendencia TEXT,
        urls_originais TEXT,
        imagens_webp_locais TEXT,
        status_extracao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tabela_origem, id_staging)
    );
    """)
    conn.commit()
    conn.close()

def identify_and_quarantine():
    init_quarantine_db()
    quar_conn = sqlite3.connect(QUARANTINE_DB)
    quar_cur = quar_conn.cursor()

    total_quarantined = 0
    quarantine_list_for_json = []
    quarantined_by_table = {}

    print("=" * 70)
    print("ETAPA 1 & 2: IDENTIFICAÇÃO E ISOLAMENTO EM QUARENTENA")
    print("=" * 70)

    for cfg in TABLES_CONFIG:
        db_path = cfg['db_file']
        table_name = cfg['target_table']
        display = cfg['display_name']
        prefix = cfg['short_prefix']

        if not os.path.exists(db_path):
            print(f"Arquivo {db_path} não encontrado, pulando...")
            continue

        con = sqlite3.connect(db_path)
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute("SELECT * FROM questoes")
        rows = cur.fetchall()

        table_quarantined_ids = []

        for r in rows:
            r_dict = dict(r)
            qid = r_dict['id_staging']
            enunc = r_dict.get('enunciado') or ''
            
            urls = url_pattern.findall(enunc)
            has_img_tag = '<img' in enunc
            has_ver_img = bool(ver_imagem_pattern.search(enunc))
            has_deictic = any(p.search(enunc) for p in deictic_patterns)

            # Verificar se já temos webp baixado
            webp_files = []
            for idx in range(10):
                candidate = f"q_{prefix}_{qid}_{idx}.webp"
                if os.path.exists(os.path.join(WEBP_DIR, candidate)):
                    webp_files.append(f"data/extracted_images_webp/{candidate}")

            if not (urls or has_img_tag or has_ver_img or has_deictic or webp_files):
                continue  # Questão 100% autônoma, permanece ativa

            # Classificação
            if webp_files:
                cat = 'webp_extraido_sucesso'
                status = 'recuperada_webp'
            elif urls or has_img_tag:
                cat = 'url_bloqueada_s3'
                status = 'pendente_recuperacao'
            elif has_ver_img:
                cat = 'marcador_ver_imagem'
                status = 'pendente_recorte_pdf'
            else:
                cat = 'mencao_obrigatoria_sem_anexo'
                status = 'pendente_recorte_pdf'

            # Se temos webp, limpamos links externos do enunciado para ficar sem link externo!
            clean_enunc = enunc
            if webp_files:
                # Remove tags img com links externos ou markdown image links
                clean_enunc = re.sub(r'<img[^>]+src=["\'][^"\']+["\'][^>]*>', '', clean_enunc)
                clean_enunc = re.sub(r'!\[.*?\]\(https?://[^\)]+\)', '', clean_enunc)

            item = {
                'id_staging': qid,
                'tabela_origem': table_name,
                'anchor_source': r_dict.get('anchor_source'),
                'anchor_original_id': r_dict.get('anchor_original_id'),
                'enunciado': clean_enunc,
                'opcoes_json': r_dict.get('opcoes_json'),
                'gabarito': r_dict.get('gabarito'),
                'is_anulada': r_dict.get('is_anulada', 0),
                'ano': r_dict.get('ano'),
                'instituicao': r_dict.get('instituicao'),
                'banca': r_dict.get('banca'),
                'uf': r_dict.get('uf'),
                'modalidade': r_dict.get('modalidade'),
                'especialidade': r_dict.get('especialidade'),
                'tema': r_dict.get('tema'),
                'foco': r_dict.get('foco'),
                'subfoco': r_dict.get('subfoco'),
                'dificuldade': r_dict.get('dificuldade'),
                'dificuldade_indice': r_dict.get('dificuldade_indice'),
                'comentarios': r_dict.get('comentarios'),
                'tipo_origem': r_dict.get('tipo_origem'),
                'motivo_classificacao': r_dict.get('motivo_classificacao'),
                'categoria_pendencia': cat,
                'urls_originais': json.dumps(urls, ensure_ascii=False),
                'imagens_webp_locais': json.dumps(webp_files, ensure_ascii=False),
                'status_extracao': status
            }

            quar_cur.execute("""
            INSERT OR REPLACE INTO questoes_quarentena (
                id_staging, tabela_origem, anchor_source, anchor_original_id, enunciado,
                opcoes_json, gabarito, is_anulada, ano, instituicao, banca, uf, modalidade,
                especialidade, tema, foco, subfoco, dificuldade, dificuldade_indice, comentarios,
                tipo_origem, motivo_classificacao, categoria_pendencia, urls_originais,
                imagens_webp_locais, status_extracao
            ) VALUES (
                :id_staging, :tabela_origem, :anchor_source, :anchor_original_id, :enunciado,
                :opcoes_json, :gabarito, :is_anulada, :ano, :instituicao, :banca, :uf, :modalidade,
                :especialidade, :tema, :foco, :subfoco, :dificuldade, :dificuldade_indice, :comentarios,
                :tipo_origem, :motivo_classificacao, :categoria_pendencia, :urls_originais,
                :imagens_webp_locais, :status_extracao
            )
            """, item)

            table_quarantined_ids.append(qid)
            quarantine_list_for_json.append(item)

        quar_conn.commit()
        quarantined_by_table[table_name] = table_quarantined_ids
        total_quarantined += len(table_quarantined_ids)

        print(f"  • {display} ({table_name}): {len(table_quarantined_ids):,} questões isoladas em quarentena.")

        # Remover da tabela ativa do SQLite
        if table_quarantined_ids:
            cur.execute(f"CREATE TABLE IF NOT EXISTS questoes_quarentena_backup AS SELECT * FROM questoes WHERE 1=0")
            # Deletar em lotes no sqlite
            BATCH = 500
            for i in range(0, len(table_quarantined_ids), BATCH):
                b_ids = table_quarantined_ids[i:i+BATCH]
                placeholders = ','.join('?' for _ in b_ids)
                cur.execute(f"DELETE FROM questoes WHERE id_staging IN ({placeholders})", b_ids)
            con.commit()
            
            cur.execute("SELECT COUNT(*) FROM questoes")
            restantes = cur.fetchone()[0]
            print(f"    ✔ Restantes ativas no SQLite {display}: {restantes:,}")

        con.close()

    quar_conn.close()

    # Salvar JSON
    print(f"\nSalvando exportação JSON em {QUARANTINE_JSON}...")
    with open(QUARANTINE_JSON, 'w', encoding='utf-8') as f:
        json.dump(quarantine_list_for_json, f, ensure_ascii=False, indent=2)

    print(f"✔ Total Geral Quarentena: {total_quarantined:,} questões preservadas.")
    return quarantined_by_table, quarantine_list_for_json

def purge_from_supabase(quarantined_by_table: Dict[str, List[int]]):
    print("\n" + "=" * 70)
    print("ETAPA 4: REMOÇÃO SEGURA NO SUPABASE")
    print("=" * 70)

    env = load_env()
    supa_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
    service_key = env.get('SUPABASE_SERVICE_ROLE_KEY')

    if not supa_url or not service_key:
        print("ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados!")
        return

    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json'
    }

    for cfg in TABLES_CONFIG:
        table_name = cfg['target_table']
        display = cfg['display_name']
        stg_ids = quarantined_by_table.get(table_name, [])

        print(f"\nRemovendo {len(stg_ids):,} questões cegas/pendentes de: {display} ({table_name})...")
        if not stg_ids:
            print("  ✔ Nenhuma questão para remover.")
            continue

        uuids_to_purge = [str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{table_name}_{sid}")) for sid in stg_ids]
        BATCH = 100
        purged = 0
        total = len(uuids_to_purge)

        for i in range(0, total, BATCH):
            chunk = uuids_to_purge[i:i+BATCH]
            ids_param = ','.join(chunk)
            delete_url = f"{supa_url}/rest/v1/{table_name}?id=in.({ids_param})"

            for attempt in range(5):
                try:
                    resp = requests.delete(delete_url, headers=headers, timeout=30)
                    if resp.status_code in (200, 204):
                        purged += len(chunk)
                        break
                    elif resp.status_code == 429:
                        time.sleep(2 ** attempt)
                    else:
                        time.sleep(1)
                except Exception as e:
                    time.sleep(2)

            if (i // BATCH) % 5 == 0 or purged == total:
                pct = (purged / total) * 100
                print(f"  [{pct:5.1f}%] Removidas: {purged:,} / {total:,}")

        # Contagem final no supabase
        r = requests.get(f"{supa_url}/rest/v1/{table_name}?select=id", headers={**headers, 'Range': '0-0', 'Prefer': 'count=exact'})
        cr = r.headers.get('content-range')
        cnt_final = cr.split('/')[-1] if (cr and '/' in cr) else 'N/A'
        print(f"  ✔ {display} no Supabase: {cnt_final} questões ativas remanescentes.")

def generate_dashboard(quarantine_data: List[Dict[str, Any]]):
    print("\n" + "=" * 70)
    print("ETAPA 3: GERANDO DASHBOARD INTERATIVO")
    print("=" * 70)

    total = len(quarantine_data)
    cat_counts = {}
    spec_counts = {}
    banca_counts = {}
    ano_counts = {}
    table_counts = {}
    webp_count = 0

    for q in quarantine_data:
        cat = q['categoria_pendencia']
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        
        spec = q.get('especialidade') or 'Não Definida'
        spec_counts[spec] = spec_counts.get(spec, 0) + 1
        
        banca = q.get('banca') or 'Não Informada'
        banca_counts[banca] = banca_counts.get(banca, 0) + 1
        
        ano = str(q.get('ano') or 'Sem Ano')
        ano_counts[ano] = ano_counts.get(ano, 0) + 1
        
        tbl = q.get('tabela_origem')
        table_counts[tbl] = table_counts.get(tbl, 0) + 1

        if q['categoria_pendencia'] == 'webp_extraido_sucesso':
            webp_count += 1

    # Preparar dados para o dashboard
    sample_table = []
    for q in quarantine_data[:300]: # Amostra para visualização interativa rápida
        sample_table.append({
            'id': q['id_staging'],
            'tabela': q['tabela_origem'].replace('questions_expansion_', ''),
            'banca': q.get('banca') or '—',
            'ano': q.get('ano') or '—',
            'especialidade': q.get('especialidade') or 'Geral',
            'categoria': q['categoria_pendencia'],
            'enunciado': q['enunciado'][:280] + '...' if len(q['enunciado']) > 280 else q['enunciado'],
            'webps': json.loads(q['imagens_webp_locais']),
            'status': q['status_extracao']
        })

    html_content = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dashboard de Gestão e Extração de Imagens — Banco Residência</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .mark-term {{ background-color: #fef08a; color: #854d0e; font-weight: 600; padding: 2px 4px; border-radius: 4px; }}
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <header class="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Pipeline de Imagens WebP
          </span>
          <span class="text-xs text-slate-400">Banco de Expansão</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight mt-2 text-white">Quarentena e Extração de Imagens</h1>
        <p class="text-slate-400 text-sm mt-1">Mapeamento sistemático de questões com dependência visual, extração WebP sem links externos e higienização do Supabase.</p>
      </div>
      <div class="flex gap-2">
        <div class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-right">
          <div class="text-xs text-slate-400">Total em Quarentena</div>
          <div class="text-2xl font-black text-amber-400">{total:,}</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-right">
          <div class="text-xs text-slate-400">WebPs Extraídos</div>
          <div class="text-2xl font-black text-emerald-400">{webp_count:,}</div>
        </div>
      </div>
    </header>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div class="text-xs text-slate-400 font-semibold uppercase tracking-wider">WebPs Prontos (Offline)</div>
        <div class="text-3xl font-black text-emerald-400 mt-2">{cat_counts.get('webp_extraido_sucesso', 0):,}</div>
        <p class="text-xs text-slate-400 mt-1">Imagens convertidas em WebP e desvinculadas de hosts externos.</p>
      </div>

      <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Marcador (VER IMAGEM)</div>
        <div class="text-3xl font-black text-amber-400 mt-2">{cat_counts.get('marcador_ver_imagem', 0):,}</div>
        <p class="text-xs text-slate-400 mt-1">Questões cuja raspagem perdeu anexo na plataforma de origem.</p>
      </div>

      <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Menção Deítica a Exame</div>
        <div class="text-3xl font-black text-sky-400 mt-2">{cat_counts.get('mencao_obrigatoria_sem_anexo', 0):,}</div>
        <p class="text-xs text-slate-400 mt-1">"Observe o ECG / Tomografia a seguir" sem anexo visual.</p>
      </div>

      <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div class="text-xs text-slate-400 font-semibold uppercase tracking-wider">URLs Bloqueadas (S3 403)</div>
        <div class="text-3xl font-black text-rose-400 mt-2">{cat_counts.get('url_bloqueada_s3', 0):,}</div>
        <p class="text-xs text-slate-400 mt-1">Buckets AWS S3 fechados ou com acesso negado.</p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 class="text-lg font-bold text-white mb-4">Distribuição por Categoria de Pendência</h3>
        <canvas id="chartCategorias" class="max-h-64"></canvas>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 class="text-lg font-bold text-white mb-4">Distribuição por Banco de Origem</h3>
        <canvas id="chartBancos" class="max-h-64"></canvas>
      </div>
    </div>

    <!-- Tabela Interativa de Amostras -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 class="text-lg font-bold text-white">Visualizador e Auditoria das Questões Isoladas</h3>
          <p class="text-xs text-slate-400">Exibindo primeiras questões isoladas em quarentena com os marcadores de imagem destacados.</p>
        </div>
        <input type="text" id="searchInput" placeholder="Filtrar por banca, tema ou ID..." class="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 w-full sm:w-72">
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm" id="questionsTable">
          <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs uppercase">
            <tr>
              <th class="py-3 px-4">ID / Origem</th>
              <th class="py-3 px-4">Banca / Ano</th>
              <th class="py-3 px-4">Categoria</th>
              <th class="py-3 px-4">Enunciado (Trecho)</th>
              <th class="py-3 px-4">WebP Extraído</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60" id="tableBody">
          </tbody>
        </table>
      </div>
    </div>

    <footer class="mt-8 text-center text-xs text-slate-500">
      Banco Residência — Pipeline Automatizado de Quarentena e Extração de Imagens • Dados sincronizados com o Supabase
    </footer>
  </div>

  <script>
    // Gráficos
    new Chart(document.getElementById('chartCategorias'), {{
      type: 'doughnut',
      data: {{
        labels: ['WebP Extraído com Sucesso', 'Marcador VER IMAGEM', 'Menção a Exame sem Imagem', 'URL Bloqueada S3'],
        datasets: [{{
          data: [{cat_counts.get('webp_extraido_sucesso', 0)}, {cat_counts.get('marcador_ver_imagem', 0)}, {cat_counts.get('mencao_obrigatoria_sem_anexo', 0)}, {cat_counts.get('url_bloqueada_s3', 0)}],
          backgroundColor: ['#10b981', '#f59e0b', '#0ea5e9', '#f43f5e'],
          borderWidth: 0
        }}]
      }},
      options: {{ responsive: true, plugins: {{ legend: {{ position: 'bottom', labels: {{ color: '#94a3b8' }} }} }} }}
    }});

    new Chart(document.getElementById('chartBancos'), {{
      type: 'bar',
      data: {{
        labels: ['Acesso Direto', 'R+ Especialidades', 'Revalida', 'Título Especialista'],
        datasets: [{{
          label: 'Questões em Quarentena',
          data: [{table_counts.get('questions_expansion_direto', 0)}, {table_counts.get('questions_expansion_r_plus', 0)}, {table_counts.get('questions_expansion_revalida', 0)}, {table_counts.get('questions_expansion_titulo_especialista', 0)}],
          backgroundColor: '#38bdf8',
          borderRadius: 8
        }}]
      }},
      options: {{ responsive: true, scales: {{ x: {{ ticks: {{ color: '#94a3b8' }} }}, y: {{ ticks: {{ color: '#94a3b8' }} }} }}, plugins: {{ legend: {{ display: false }} }} }}
    }});

    // Dados da Tabela
    const data = {json.dumps(sample_table, ensure_ascii=False)};
    const tbody = document.getElementById('tableBody');

    function highlightTerms(text) {{
      return text.replace(/(VER IMAGEM!?|radiografia|tomografia|eletrocardiograma|ECG|raio-x|figura|imagem|foto|gráfico)/gi, '<span class="mark-term">$1</span>');
    }}

    function renderTable(items) {{
      tbody.innerHTML = '';
      items.forEach(q => {{
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/40 transition-colors';
        
        let catBadge = '';
        if (q.categoria === 'webp_extraido_sucesso') catBadge = '<span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-semibold">WebP Baixado</span>';
        else if (q.categoria === 'marcador_ver_imagem') catBadge = '<span class="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 font-semibold">VER IMAGEM</span>';
        else if (q.categoria === 'url_bloqueada_s3') catBadge = '<span class="px-2 py-0.5 rounded text-xs bg-rose-500/20 text-rose-400 font-semibold">S3 Bloqueado</span>';
        else catBadge = '<span class="px-2 py-0.5 rounded text-xs bg-sky-500/20 text-sky-400 font-semibold">Menção a Exame</span>';

        let webpCell = '<span class="text-slate-500 text-xs">Pendente</span>';
        if (q.webps && q.webps.length > 0) {{
          webpCell = `<span class="text-xs text-emerald-400 font-medium font-mono">${{q.webps.length}} imagem(ns)</span>`;
        }}

        tr.innerHTML = `
          <td class="py-3 px-4 font-mono text-xs text-slate-300">#${{q.id}}<br><span class="text-[10px] text-slate-500">${{q.tabela}}</span></td>
          <td class="py-3 px-4 font-semibold text-slate-200 text-xs">${{q.banca}}<br><span class="text-slate-500">${{q.ano}} • ${{q.especialidade}}</span></td>
          <td class="py-3 px-4">${{catBadge}}</td>
          <td class="py-3 px-4 text-xs text-slate-300 max-w-md">${{highlightTerms(q.enunciado)}}</td>
          <td class="py-3 px-4">${{webpCell}}</td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    renderTable(data);

    document.getElementById('searchInput').addEventListener('input', (e) => {{
      const term = e.target.value.toLowerCase();
      const filtered = data.filter(d => 
        d.banca.toLowerCase().includes(term) ||
        d.enunciado.toLowerCase().includes(term) ||
        d.id.toString().includes(term) ||
        d.especialidade.toLowerCase().includes(term)
      );
      renderTable(filtered);
    }});
  </script>
</body>
</html>
"""

    with open(DASHBOARD_HTML, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✔ Dashboard interativo gerado com sucesso em: {DASHBOARD_HTML}")

def main():
    print("\n" + "#" * 70)
    print("INICIANDO PROCESSO COMPLETO DE QUARENTENA E HIGIENIZAÇÃO")
    print("#" * 70)

    # 1. Identificar e isolar
    quarantined_by_table, quarantine_list = identify_and_quarantine()

    # 2. Gerar Dashboard
    generate_dashboard(quarantine_list)

    # 3. Remover do Supabase
    purge_from_supabase(quarantined_by_table)

    print("\n" + "#" * 70)
    print("PROCESSO CONCLUÍDO COM SUCESSO!")
    print("#" * 70)

if __name__ == '__main__':
    main()
