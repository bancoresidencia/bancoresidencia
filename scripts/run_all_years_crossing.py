"""
Executor Mestre do Cruzamento Blindado de Gabaritos (2026 -> 2009)
"""

import os
import glob
import json
import time
import datetime
from cross_exams_engine import run_crossing_for_year, atomic_save_json

def main():
    start_time = time.time()
    logs_dir = os.path.join('data', 'logs_cruzamento')
    os.makedirs(logs_dir, exist_ok=True)
    
    # 1. Carregar os 8 arquivos locais em memória
    print("Carregando os 8 arquivos locais em memória...")
    local_files = glob.glob('data/*_final_questions.json')
    local_data = {}
    total_local_questions = 0
    
    for f in local_files:
        print(f"  Carregando {os.path.basename(f)}...")
        with open(f, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            local_data[f] = data
            total_local_questions += len(data)
            
    print(f"Total de questões locais em memória: {total_local_questions:,}")
    
    # 2. Obter lista de anos em ordem decrescente (2026 -> 2009)
    available_years = sorted(
        [int(os.path.basename(p)) for p in glob.glob('data/scraped_exams/raw/*') if os.path.isdir(p)],
        reverse=True
    )
    print(f"Anos a processar ({len(available_years)} anos): {available_years}")
    
    all_stats = []
    
    # 3. Processar ano a ano
    for y in available_years:
        year_start = time.time()
        stats = run_crossing_for_year(y, local_data, logs_dir, dry_run=False)
        if stats:
            all_stats.append(stats)
            
        # Salvar atomicamente os arquivos locais atualizados após cada ano
        print(f"Salvando arquivos locais com atualizações do ano {y}...")
        for fpath, questions in local_data.items():
            atomic_save_json(fpath, questions)
            
        print(f"Ano {y} concluído e salvo em {time.time() - year_start:.1f}s")
        
    total_duration = time.time() - start_time
    
    # 4. Compilar Resumo Geral
    summary_path = os.path.join(logs_dir, "resumo_geral_cruzamento.json")
    summary = {
        'timestamp': datetime.datetime.now().isoformat(),
        'duration_seconds': total_duration,
        'years_processed': len(all_stats),
        'total_empty_gabaritos_filled': sum(s['empty_gabaritos_filled'] for s in all_stats),
        'total_scrambled_resolved': sum(s['scrambled_booklets_resolved'] for s in all_stats),
        'total_existing_verified': sum(s['existing_verified'] for s in all_stats),
        'total_divergences_corrected': sum(s['divergences_corrected'] for s in all_stats),
        'total_canceled_marked': sum(s['canceled_marked'] for s in all_stats),
        'total_quarantine': sum(s['quarantine_no_opt_match'] + s['quarantine_ambiguous'] for s in all_stats),
        'year_by_year': all_stats
    }
    
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
        
    print("\n" + "="*70)
    print("CRUZAMENTO COMPLETO CONCLUÍDO COM SUCESSO!")
    print(f"Tempo total: {total_duration/60:.2f} minutos")
    print(f"Total de Gabaritos Vazios Preenchidos: {summary['total_empty_gabaritos_filled']:,}")
    print(f"Total de Cadernos Embaralhados Resolvidos com Precisão: {summary['total_scrambled_resolved']:,}")
    print(f"Total de Gabaritos Existentes Validados/Confirmados: {summary['total_existing_verified']:,}")
    print(f"Total de Divergências Corrigidas: {summary['total_divergences_corrected']:,}")
    print(f"Total de Anulações Oficiais Marcadas: {summary['total_canceled_marked']:,}")
    print(f"Casos em Quarentena (Preservados Sem Alteração): {summary['total_quarantine']:,}")
    print(f"Resumo salvo em: {summary_path}")
    print("="*70)

if __name__ == '__main__':
    main()

