import csv
import json
import sqlite3
import os

def main():
    # 1. Carregar CSV de provas
    csv_path = 'data/relatorio_provas_instituicoes_ano.csv'
    provas = []
    institutions = set()
    by_year = {}
    
    with open(csv_path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ano = int(row['ano']) if row['ano'] else 0
            inst = row['instituicao']
            banca = row['banca']
            tipo = row['tipo_prova']
            institutions.add(inst)
            total = int(row['total_questoes_unicas'])
            gab = int(row['com_gabarito_valido'])
            anul = int(row['anuladas_oficiais'])
            disc = int(row['discursivas_segunda_fase'])
            audit = int(row['total_auditadas_resolvidas'])
            faltam = int(row['faltam_gabaritos'])
            
            if ano not in by_year:
                by_year[ano] = {'provas': 0, 'total': 0, 'gab': 0, 'anul': 0, 'disc': 0, 'faltam': 0}
            by_year[ano]['provas'] += 1
            by_year[ano]['total'] += total
            by_year[ano]['gab'] += gab
            by_year[ano]['anul'] += anul
            by_year[ano]['disc'] += disc
            by_year[ano]['faltam'] += faltam
            
            provas.append({
                'instituicao': inst,
                'banca': banca,
                'ano': ano,
                'tipo_prova': tipo,
                'total': total,
                'gab': gab,
                'anul': anul,
                'disc': disc,
                'audit': audit,
                'faltam': faltam,
                'pct': row['percentual_cobertura']
            })

    # Provas com >= 20 faltantes
    provas_gt20 = [p for p in provas if p['faltam'] >= 20]
    # Ordenar por faltam descendente
    provas_gt20.sort(key=lambda x: x['faltam'], reverse=True)
    
    print(f"Total de provas unicas: {len(provas)}")
    print(f"Total de instituicoes unicas: {len(institutions)}")
    print(f"Provas com >= 20 questoes faltantes: {len(provas_gt20)}")
    total_faltam = sum(p['faltam'] for p in provas_gt20)
    print(f"Total de questoes faltantes nessas {len(provas_gt20)} provas: {total_faltam}")
    
    # 2. Conectar ao SQLite de provaderesidencia_coleta.db para ver o que temos catalogado/coletado de provaderesidencia.com.br
    db_path = 'data/provaderesidencia_coleta.db'
    pdr_provas = []
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("""
            SELECT id, titulo, badge, instituicao_raw, uf, ano, modalidade, instituicao_banco, total_questoes, status 
            FROM provas
        """)
        rows = c.fetchall()
        for r in rows:
            pdr_provas.append({
                'id': r[0],
                'titulo': r[1],
                'badge': r[2],
                'instituicao_raw': r[3],
                'uf': r[4],
                'ano': r[5],
                'modalidade': r[6],
                'instituicao_banco': r[7],
                'total_questoes': r[8],
                'status': r[9]
            })
        conn.close()
    print(f"Total de provas catalogadas em provaderesidencia: {len(pdr_provas)}")

    # 3. Cruzamento / Matching entre provas_gt20 e pdr_provas
    # Vamos criar heurísticas de correspondência (ano, instituição / título)
    import re
    def normalize(text):
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r'[\(\)\-\/\.\,\_\:\;]', ' ', text)
        return " ".join(text.split())

    matched_pdr = []
    unmatched_pdr = []

    for p in provas_gt20:
        inst_norm = normalize(p['instituicao'])
        banca_norm = normalize(p['banca'])
        ano = p['ano']
        
        best_match = None
        # Procurar correspondências no pdr_provas
        candidates = []
        for pdr in pdr_provas:
            if pdr['ano'] == ano:
                # Checar se instituicao bate
                pdr_title_norm = normalize(pdr['titulo'])
                pdr_inst_norm = normalize(pdr['instituicao_raw'] or '')
                pdr_badge_norm = normalize(pdr['badge'] or '')
                pdr_banco_norm = normalize(pdr['instituicao_banco'] or '')
                
                # Regras de correspondência
                score = 0
                tokens_inst = set(t for t in inst_norm.split() if len(t) > 2)
                pdr_all_tokens = set((pdr_title_norm + ' ' + pdr_inst_norm + ' ' + pdr_badge_norm + ' ' + pdr_banco_norm).split())
                
                common = tokens_inst.intersection(pdr_all_tokens)
                if len(common) >= 1:
                    # Checagens adicionais por siglas fortes
                    siglas = ['usp', 'unicamp', 'unesp', 'enare', 'revalida', 'amrigs', 'amp', 'sespe', 'ses-pe', 'sesdf', 'ses-df', 'sesgo', 'ses-go', 'psu', 'aremg', 'uerj', 'ufrj', 'einstein', 'iamspe', 'sus-sp', 'santacasa', 'sc', 'fmusp', 'unifesp', 'sms', 'abem']
                    for sig in siglas:
                        if sig in inst_norm or sig in banca_norm:
                            if sig in pdr_title_norm or sig in pdr_inst_norm or sig in pdr_badge_norm or sig in pdr_banco_norm:
                                score += 5
                    score += len(common)
                    candidates.append((score, pdr))
        
        if candidates:
            candidates.sort(key=lambda x: x[0], reverse=True)
            best_match = candidates[0][1]
            matched_pdr.append({
                'banco_prova': p,
                'pdr_prova': best_match,
                'score': candidates[0][0]
            })
        else:
            unmatched_pdr.append(p)

    output = {
        'total_provas_gt20': len(provas_gt20),
        'total_questoes_faltantes_gt20': total_faltam,
        'matched_count': len(matched_pdr),
        'unmatched_count': len(unmatched_pdr),
        'by_year': by_year,
        'provas_gt20': provas_gt20,
        'matched_pdr': matched_pdr,
        'unmatched_pdr': unmatched_pdr
    }
    
    with open('data/analise_provas_gt20.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
        
    print(f"Salvo data/analise_provas_gt20.json com sucesso!")
    print(f"Matched preliminar com provaderesidencia: {len(matched_pdr)}")
    print(f"Nao matched com provaderesidencia: {len(unmatched_pdr)}")

if __name__ == '__main__':
    main()
