import csv
import json
import sqlite3
import re
import unicodedata
import os

def norm_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def build_mappings():
    # Mapeamento canônico entre nomes do banco e siglas/nomes no Prova de Residência
    return {
        'Centro Universitário FMABC': ['ABC', 'FMABC'],
        'CERMAM - Comissão Estadual de Residência Médica do Amazonas': ['CERMAM'],
        'AMRIGS - Associação Médica do Rio Grande do Sul': ['AMRIGS'],
        'ENARE/ENAMED': ['ENARE'],
        'SUS-SP - Sistema Único de Saúde de São Paulo': ['SUS-SP', 'SUSSP'],
        'USP/HCFMUSP - Hospital das Clínicas da FMUSP (SP)': ['USP', 'FUVEST', 'FMUSP'],
        'USP/HCRP - Hospital das Clínicas de Ribeirão Preto (SP)': ['USP-RP', 'HCRP'],
        'FMRP-USP - Revalidação de Diplomas de Medicina': ['USP-RP', 'REVALIDA-USP'],
        'UNIFESP/EPM - Universidade Federal de São Paulo - Escola Paulista de Medicina (SP)': ['UNIFESP'],
        'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)': ['UNICAMP'],
        'UEL - Hospital Universitário de Londrina (PR)': ['UEL', 'COPS'],
        'SES-PE - Secretaria de Estado de Saúde de Pernambuco': ['SES-PE', 'SESPE', 'UPENET'],
        'SES-DF - Secretaria de Estado de Saúde do Distrito Federal': ['SES-DF', 'SESDF', 'IADES'],
        'SES-GO - Secretaria de Estado de Saúde de Goiás': ['SES-GO', 'SESGO'],
        'SES-SC - Secretaria de Estado da Saúde de Santa Catarina': ['SES-SC', 'SESSC', 'FEPESE'],
        'SES-RJ - Secretaria de Estado de Saúde do Rio de Janeiro': ['SES-RJ', 'SESRJ'],
        'SES-PB - Secretaria de Estado de Saúde da Paraíba': ['SES-PB', 'SESPB'],
        'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)': ['UERJ', 'CEPUERJ'],
        'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)': ['UFRJ', 'PR4'],
        'UNESP/HCFMB - Hospital das Clínicas de Botucatu (SP)': ['UNESP', 'VUNESP'],
        'AMP - Associação Médica do Paraná': ['AMP'],
        'IAMSPE/HSPE - Instituto de Assistência Médica ao Servidor Público - Hospital do Servidor (SP)': ['IAMSPE'],
        'HU-FMJ - Hospital Universitário da Faculdade de Medicina de Jundiaí (SP)': ['FMJ', 'HU-FMJ'],
        'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)': ['HIAE', 'EINSTEIN'],
        'Hospital Sírio-Libanês (SP)': ['SIRIO', 'HSL'],
        'INEP Revalida - Exame Nacional de Revalidação de Diplomas Médicos': ['INEP', 'REVALIDA'],
        'PSU-MG - Processo Seletivo Unificado de Minas Gerais': ['PSU-MG', 'AREMG', 'PSU'],
        'PSU-AL - Processo Seletivo Unificado de Alagoas': ['PSU-AL'],
        'Santa Casa de Misericórdia de São Paulo (SP)': ['SCMSP', 'SANTA CASA SP'],
        'Santa Casa de Misericórdia de Belo Horizonte (MG)': ['SCMBH', 'SANTA CASA BH'],
        'Santa Casa de Misericórdia de Ribeirão Preto (SP)': ['SCMRP'],
        'Santa Casa de Misericórdia de Santos (SP)': ['SCMS'],
        'Santa Casa de São José dos Campos (SP)': ['SJC', 'SANTA CASA SJC'],
        'SURCE - Seleção Unificada para Residência Médica no Estado do Ceará': ['SURCE'],
        'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)': ['HCPA', 'UFRGS', 'FAURGS'],
        'Universidade Federal do Paraná - HC-UFPR': ['HC-UFPR', 'UFPR'],
        'Universidade Federal de Santa Catarina': ['UFSC'],
        'Universidade Federal de Pernambuco': ['UFPE'],
        'Universidade Federal da Bahia': ['UFBA'],
        'Universidade de Brasília - Hospital Universitário de Brasília (DF)': ['UNB', 'HUB'],
        'Universidade de Taubaté - UNITAU': ['UNITAU'],
        'Pontifícia Universidade Católica do Paraná - Campus Curitiba': ['PUC-PR', 'PUCPR'],
        'Pontifícia Universidade Católica do Rio Grande do Sul - PUC-RS': ['PUC-RS', 'PUCRS'],
        'Pontifícia Universidade Católica de Campinas - PUC-Campinas': ['PUC-CAMP', 'PUCCAMP'],
        'Pontifícia Universidade Católica de São Paulo - Campus Sorocaba': ['PUC-SP', 'PUCSP'],
        'Hospital Angelina Caron (PR)': ['HAC-PR', 'HAC'],
        'Hospital Universitário Onofre Lopes - UFRN': ['HUOL', 'UFRN'],
        'Fundação Hospitalar do Estado de Minas Gerais - FHEMIG': ['FHEMIG'],
        'Instituto de Previdência dos Servidores do Estado de Minas Gerais': ['IPSEMG'],
        'Instituto Nacional de Câncer - Ministério da Saúde': ['INCA'],
        'Universidade Federal de Uberlândia - HC-UFU': ['UFU'],
        'Universidade Federal do Maranhão - HU-UFMA': ['UFMA'],
        'Fundação João Goulart - Hospital Municipal Souza Aguiar (RJ)': ['FJG', 'SMS-RIO'],
        'Universidade Federal do Estado do Rio de Janeiro - HUGG-UNIRIO': ['UNIRIO'],
        'Universidade Federal Fluminense - HUAP-UFF': ['UFF'],
        'Fundação Centro Médico de Campinas': ['CMC'],
        'Hospital Municipal Dr. Mário Gatti - Campinas (SP)': ['HMG'],
        'Hospital de Olhos de Aparecida de Goiânia (GO)': ['HOA'],
        'Hospital São José do Avaí - Itaperuna (RJ)': ['HSJA'],
        'Faculdade de Medicina de Campos (RJ)': ['FMC'],
        'Faculdade de Medicina de Petrópolis': ['FMP'],
        'Centro Universitário Serra dos Órgãos - UNIFESO': ['FESO', 'UNIFESO'],
        'Universidade do Estado do Pará - Belém': ['UEPA'],
        'Universidade Federal do Tocantins': ['UFT'],
        'Universidade do Estado do Rio Grande do Norte': ['UERN'],
        'Faculdade de Medicina de Marília': ['FAMEMA'],
        'Faculdade de Medicina de São José do Rio Preto - Hospital de Base (SP)': ['FAMERP'],
        'Santa Casa de Misericórdia de Maceió (AL)': ['SANTA CASA MACEIO'],
        'Hospital Evangélico de Vila Velha (ES)': ['HEVV'],
        'Hospital Escola Jayme dos Santos Neves (ES)': ['HEJSN', 'HOSPITAL ESCOLA JAYME'],
        'Universidade Estadual do Piauí - Campus Teresina': ['UESPI'],
        'Universidade de Gurupi - Campus Gurupi': ['UNIRG'],
        'ABEM — Teste de Progresso Nacional': ['ABEM', 'TPN'],
        'Hospital Alemão Oswaldo Cruz (SP)': ['HAOC']
    }

def match_exam(inst, banca, ano, pdr_catalog, mapping):
    """
    Busca correspondência no catálogo do Prova de Residência.
    Retorna (match_dict, score) ou (None, 0).
    """
    inst_norm = norm_text(inst)
    banca_norm = norm_text(banca)
    
    # Siglas mapeadas
    siglas = []
    for k, v in mapping.items():
        if norm_text(k) in inst_norm or inst_norm in norm_text(k):
            for s in v:
                if s not in siglas:
                    siglas.append(s)
                    
    # Siglas conhecidas por extração direta de parênteses ou traços
    m_sigla = re.search(r'\((.*?)\)', inst)
    if m_sigla:
        s_cand = m_sigla.group(1).strip()
        if len(s_cand) <= 10 and s_cand not in siglas:
            siglas.append(s_cand)

    candidates = []
    for p in pdr_catalog:
        if p['ano'] != ano:
            continue
            
        p_inst = p['instituicao'].upper()
        p_title = p['titulo'].upper()
        p_title_norm = norm_text(p['titulo'])
        
        # 1. Correspondência exata por sigla
        for sig in siglas:
            sig_up = sig.upper()
            sig_norm = norm_text(sig)
            if sig_up == p_inst or sig_up in p_title or sig_norm in p_title_norm:
                score = 25
                # Bônus para R1 / Acesso Direto
                if 'R1' in p_title or 'ACESSO DIRETO' in p_title:
                    score += 5
                elif 'R3' in p_title or 'R4' in p_title:
                    score -= 5
                candidates.append((score, p))
                break
                
    if candidates:
        candidates.sort(key=lambda x: x[0], reverse=True)
        return candidates[0][1], candidates[0][0]
    return None, 0

def classify_banca_oficial(inst, banca):
    """
    Verifica se a prova possui banca oficial reconhecida na internet (Etapa 2).
    """
    comb = norm_text(inst + ' ' + banca)
    
    bancas_oficiais = {
        'fgv': 'FGV Conhecimento (ENARE 2025/2026)',
        'enare': 'Portal Oficial ENARE / FGV / AOCP',
        'inep': 'Portal INEP Revalida',
        'revalida': 'Portal INEP Revalida',
        'vunesp': 'Fundação VUNESP (UNESP, Albert Einstein, FMJ, etc.)',
        'fuvest': 'FUVEST / USP HCFMUSP',
        'fmusp': 'FUVEST / USP HCFMUSP',
        'unicamp': 'Comvest / Faculdade de Ciências Médicas UNICAMP',
        'aremg': 'AREMG / Processo Seletivo Unificado (PSU-MG)',
        'psu mg': 'AREMG / Processo Seletivo Unificado (PSU-MG)',
        'faurgs': 'FAURGS / HCPA',
        'amrigs': 'AMRIGS Oficial / Fundatec',
        'fundatec': 'Fundatec Concursos',
        'fepese': 'FEPESE (SES-SC)',
        'surce': 'Ares / SURCE Ceará',
        'cebraspe': 'Cebraspe / CESPE (UnB, HUB, SES-DF)',
        'iades': 'IADES (SES-DF histórico)',
        'instituto aocp': 'Instituto AOCP',
        'aocp': 'Instituto AOCP',
        'ibfc': 'IBFC Concursos',
        'quadrix': 'Instituto Quadrix',
        'idecan': 'IDECAN',
        'idib': 'IDIB',
        'cepuerj': 'CEPUERJ / UERJ',
        'uerj': 'CEPUERJ / UERJ',
        'ufrj': 'PR4 Concursos UFRJ',
        'pr4': 'PR4 Concursos UFRJ',
        'upenet': 'UPENET / IAUPE (SES-PE)',
        'iaupe': 'UPENET / IAUPE (SES-PE)',
        'verbena': 'Instituto Verbena / UFG (SES-GO)',
        'cs ufg': 'Centro de Seleção UFG',
        'cops': 'COPS / UEL Londrina',
        'instituto mais': 'Instituto Mais',
        'consulplan': 'Consulplan',
        'ibade': 'IBADE',
        'funcab': 'FUNCAB',
        'seprod': 'SEPROD Concursos',
        'objetiva': 'Objetiva Concursos'
    }
    
    for key, name in bancas_oficiais.items():
        if key in comb:
            return name
    return None

def main():
    print("Iniciando auditoria analítica e classificação das provas...")
    
    # 1. Carregar relatório CSV de provas
    csv_path = 'data/relatorio_provas_instituicoes_ano.csv'
    provas_gt20 = []
    
    with open(csv_path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            faltam = int(row['faltam_gabaritos'])
            if faltam >= 20:
                provas_gt20.append({
                    'instituicao': row['instituicao'],
                    'banca': row['banca'],
                    'ano': int(row['ano']) if row['ano'] else 0,
                    'tipo_prova': row['tipo_prova'],
                    'total_questoes': int(row['total_questoes_unicas']),
                    'com_gabarito': int(row['com_gabarito_valido']),
                    'anuladas': int(row['anuladas_oficiais']),
                    'discursivas': int(row['discursivas_segunda_fase']),
                    'faltam': faltam,
                    'pct': row['percentual_cobertura']
                })
                
    # Ordenar por faltantes descendente
    provas_gt20.sort(key=lambda x: x['faltam'], reverse=True)
    
    # 2. Carregar catálogo completo do Prova de Residência
    with open('data/catalogo_completo_provaderesidencia.json', encoding='utf-8') as f:
        all_pdr = json.load(f)
        
    # 3. Carregar SQLite local
    sqlite_provas_extraidas = {}
    db_path = 'data/provaderesidencia_coleta.db'
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        for row in c.execute("SELECT id, status, total_questoes FROM provas WHERE status = 'concluida'"):
            sqlite_provas_extraidas[row[0]] = {'status': row[1], 'questoes': row[2]}
        conn.close()

    mapping = build_mappings()
    
    # Classificação
    etapa1_disponivel_pdr = []
    etapa1_bloqueado_pago = []
    etapa2_oficial_banca = []
    etapa3_sites_avulsos = []
    
    classified_rows = []
    
    for p in provas_gt20:
        match, score = match_exam(p['instituicao'], p['banca'], p['ano'], all_pdr, mapping)
        portal_oficial = classify_banca_oficial(p['instituicao'], p['banca'])
        
        status_etapa = ''
        detalhe_etapa = ''
        pdr_id = ''
        pdr_titulo = ''
        pdr_badge = ''
        pdr_sqlite = 'Nao'
        
        if match:
            pdr_id = match['id']
            pdr_titulo = match['titulo']
            pdr_badge = match['badge']
            ja_no_sqlite = pdr_id in sqlite_provas_extraidas
            pdr_sqlite = f"Sim ({sqlite_provas_extraidas[pdr_id]['questoes']} qs)" if ja_no_sqlite else "Nao"
            
            p_entry = {
                **p,
                'pdr_id': pdr_id,
                'pdr_titulo': pdr_titulo,
                'pdr_badge': pdr_badge,
                'pdr_is_accessible': match['is_accessible'],
                'pdr_sqlite': pdr_sqlite,
                'portal_oficial': portal_oficial
            }
            
            if match['is_accessible']:
                status_etapa = 'Etapa 1 - Prova de Residencia (Liberada)'
                detalhe_etapa = f"Disponivel no site: [{pdr_badge}] ID {pdr_id}"
                etapa1_disponivel_pdr.append(p_entry)
            else:
                # Está no site, mas sob plano pago
                if portal_oficial:
                    status_etapa = 'Etapa 2 - Banca Oficial na Web (PDR Pago)'
                    detalhe_etapa = f"Banca Oficial: {portal_oficial} (No PDR consta sob {pdr_badge})"
                    etapa2_oficial_banca.append(p_entry)
                else:
                    status_etapa = 'Etapa 1 / Aguardando Plano (PDR Pago)'
                    detalhe_etapa = f"Presente no PDR como [{pdr_badge}] ID {pdr_id}"
                    etapa1_bloqueado_pago.append(p_entry)
        else:
            p_entry = {
                **p,
                'pdr_id': '',
                'pdr_titulo': '',
                'pdr_badge': 'Nao Encontrada no Site',
                'pdr_is_accessible': False,
                'pdr_sqlite': 'Nao',
                'portal_oficial': portal_oficial
            }
            if portal_oficial:
                status_etapa = 'Etapa 2 - Banca Oficial na Web'
                detalhe_etapa = f"Portal Oficial da Banca: {portal_oficial}"
                etapa2_oficial_banca.append(p_entry)
            else:
                status_etapa = 'Etapa 3 - Busca em Sites Avulsos'
                detalhe_etapa = "Sem portal centralizado. Buscar em sites institucionais / PCI / agregadores"
                etapa3_sites_avulsos.append(p_entry)
                
        classified_rows.append({
            'instituicao': p['instituicao'],
            'banca': p['banca'],
            'ano': p['ano'],
            'tipo_prova': p['tipo_prova'],
            'total_questoes': p['total_questoes'],
            'faltam_gabaritos': p['faltam'],
            'percentual_cobertura': p['pct'],
            'classificacao_etapa': status_etapa,
            'detalhes_estrategicos': detalhe_etapa,
            'pdr_prova_id': pdr_id,
            'pdr_titulo': pdr_titulo,
            'pdr_badge': pdr_badge,
            'pdr_sqlite_baixada': pdr_sqlite,
            'portal_oficial_identificado': portal_oficial or 'Nao mapeado'
        })

    # Exportar CSV Detalhado das 757 Provas
    csv_out_path = 'data/provas_faltantes_gt20_etapas.csv'
    headers = [
        'instituicao',
        'banca',
        'ano',
        'tipo_prova',
        'total_questoes',
        'faltam_gabaritos',
        'percentual_cobertura',
        'classificacao_etapa',
        'detalhes_estrategicos',
        'pdr_prova_id',
        'pdr_titulo',
        'pdr_badge',
        'pdr_sqlite_baixada',
        'portal_oficial_identificado'
    ]
    
    def escape_csv(val):
        if val is None: return ''
        s = str(val)
        if any(c in s for c in ['"', ',', '\n', '\r']):
            return f'"{s.replace("\"", "\"\"")}"'
        return s

    lines = [','.join(headers)]
    for r in classified_rows:
        lines.append(','.join([escape_csv(r[h]) for h in headers]))
        
    with open(csv_out_path, 'w', encoding='utf-8') as f:
        f.write('\ufeff' + '\n'.join(lines))
    print(f"CSV de etapas salvo com sucesso: {csv_out_path} ({len(classified_rows)} provas)")
    
    # Salvar JSON
    json_out = {
        'total_provas_gt20': len(provas_gt20),
        'total_questoes_gt20': sum(p['faltam'] for p in provas_gt20),
        'etapa1_disponivel_pdr': {
            'total_provas': len(etapa1_disponivel_pdr),
            'total_questoes': sum(p['faltam'] for p in etapa1_disponivel_pdr),
            'provas': etapa1_disponivel_pdr
        },
        'pdr_bloqueado_pago': {
            'total_provas': len(etapa1_bloqueado_pago),
            'total_questoes': sum(p['faltam'] for p in etapa1_bloqueado_pago),
            'provas': etapa1_bloqueado_pago
        },
        'etapa2_oficial_banca': {
            'total_provas': len(etapa2_oficial_banca),
            'total_questoes': sum(p['faltam'] for p in etapa2_oficial_banca),
            'provas': etapa2_oficial_banca
        },
        'etapa3_sites_avulsos': {
            'total_provas': len(etapa3_sites_avulsos),
            'total_questoes': sum(p['faltam'] for p in etapa3_sites_avulsos),
            'provas': etapa3_sites_avulsos
        }
    }
    
    with open('data/relatorio_precoleta_etapas.json', 'w', encoding='utf-8') as f:
        json.dump(json_out, f, ensure_ascii=False, indent=2)
        
    print("\n=== RESUMO ANALITICO CONSOLIDADO ===")
    print(f"Total de Provas Analisadas (>= 20 faltantes): {len(provas_gt20)}")
    print(f"Total de Questoes Faltantes Concentradas: {sum(p['faltam'] for p in provas_gt20):,}")
    print(f"Etapa 1 - Prova de Residencia (Liberadas na Conta): {len(etapa1_disponivel_pdr)} provas ({sum(p['faltam'] for p in etapa1_disponivel_pdr):,} questoes)")
    print(f"Etapa 1B - Prova de Residencia (Catalogadas sob Plano Pago): {len(etapa1_bloqueado_pago)} provas ({sum(p['faltam'] for p in etapa1_bloqueado_pago):,} questoes)")
    print(f"Etapa 2 - Portais Oficiais de Bancas Consolidadas na Web: {len(etapa2_oficial_banca)} provas ({sum(p['faltam'] for p in etapa2_oficial_banca):,} questoes)")
    print(f"Etapa 3 - Bancas Regionais / Sites Avulsos: {len(etapa3_sites_avulsos)} provas ({sum(p['faltam'] for p in etapa3_sites_avulsos):,} questoes)")

if __name__ == '__main__':
    main()
