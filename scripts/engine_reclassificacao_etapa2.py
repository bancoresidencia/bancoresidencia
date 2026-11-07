import json
import os
import unicodedata
import re
from collections import Counter

def norm_text(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def normalize_modalidade(q):
    raw = f"{q.get('modalidade') or ''} {q.get('tipo_prova') or ''} {q.get('code') or ''}".lower()
    if 'revalida' in raw or 'inep' in raw:
        return 'Revalida'
    if any(k in raw for k in ['r+', 'r3', 'r4', 'r-3', 'r-4', 'mastologia', 'endoscopia', 'pre-requisito', 'especialidades', 'subespecialidade']):
        return 'R+ Especialidades'
    if 'titulo' in raw or 'especialista' in raw or 'sb' in raw:
        return 'Títulos de Especialista'
    return 'Residência Médica (Acesso Direto)'

def detect_decision_angle(text):
    t = norm_text(text)
    if any(k in t for k in ['conduta', 'tratamento', 'terapeutica', 'prescricao', 'dose', 'medicamento', 'farmaco', 'droga', 'antimicrobiano', 'antibiotico']):
        return 'Tratamento Farmacológico e Conduta Terapêutica'
    if any(k in t for k in ['cirurgi', 'laparotomia', 'laparoscopia', 'indicacao cirurgica', 'ressec']):
        return 'Manejo Cirúrgico e Intervenção'
    if any(k in t for k in ['criterio', 'escore', 'classificacao', 'wells', 'curb', 'cha2ds2', 'estadiamento', 'score', 'grau']):
        return 'Critérios Diagnósticos, Classificações e Escores'
    if any(k in t for k in ['vacina', 'notificacao', 'sinan', 'rastreamento', 'prevencao', 'imunizacao', 'pni']):
        return 'Rastreamento, Prevenção Primária e Notificação'
    if any(k in t for k in ['fisiopatologia', 'etiologia', 'patogenese', 'mecanismo', 'causa']):
        return 'Fisiopatologia e Etiologia'
    return 'Diagnóstico e Reconhecimento Clínico'

def run_fase_2_1_preventiva():
    print("=================================================================")
    print("[FASE 2.1: RECLASSIFICACAO TAXONOMICA OURO - MEDICINA PREVENTIVA]")
    print("=================================================================")
    
    file_path = 'data/medicina_preventiva_final_questions.json'
    if not os.path.exists(file_path):
        print(f"Erro: {file_path} nao existe")
        return False

    with open(file_path, 'r', encoding='utf-8') as fp:
        questions = json.load(fp)

    total_orig = len(questions)
    print(f"Total de questões a reclassificar: {total_orig:,}")

    # Carregar Matriz Canônica de Preventiva do Censo Harmonizado
    with open('.reports/recategorizacao/harmonizada/censo_mestre_harmonizado_132k.json', 'r', encoding='utf-8') as fp:
        c_mestre = json.load(fp)
    tax_prev = c_mestre.get('Medicina Preventiva e Social', {})
    temas_canonicos = list(tax_prev.keys())
    print(f"6 Temas Canônicos da Matriz Ouro: {temas_canonicos}")

    # Mapeamento de termos antigos para os 6 temas canônicos
    tema_mapping = {
        'epidemiologia': 'Epidemiologia',
        'estudos epidemiologicos': 'Epidemiologia',
        'estudos epidemiologicos e medidas de associacao': 'Epidemiologia',
        'medidas de associacao': 'Epidemiologia',
        'bioestatistica': 'Bioestatística',
        'testes diagnosticos': 'Bioestatística',
        'testes diagnosticos e rastreamento': 'Bioestatística',
        'sistema unico de saude': 'Sistema Único de Saúde',
        'sus': 'Sistema Único de Saúde',
        'politicas publicas': 'Sistema Único de Saúde',
        'politicas publicas de saude': 'Sistema Único de Saúde',
        'legislacao': 'Sistema Único de Saúde',
        'atencao primaria': 'Atenção Primária à Saúde',
        'atencao primaria a saude': 'Atenção Primária à Saúde',
        'estrategia saude da familia': 'Atenção Primária à Saúde',
        'esf': 'Atenção Primária à Saúde',
        'saude da familia': 'Atenção Primária à Saúde',
        'vigilancia': 'Vigilância em Saúde',
        'vigilancia em saude': 'Vigilância em Saúde',
        'vigilancia epidemiologica': 'Vigilância em Saúde',
        'vigilancia sanitaria': 'Vigilância em Saúde',
        'saude do trabalhador': 'Saúde do Trabalhador',
        'medicina do trabalho': 'Saúde do Trabalhador',
        'doencas ocupacionais': 'Saúde do Trabalhador',
        'etica medica': 'Sistema Único de Saúde',
        'bioetica': 'Sistema Único de Saúde'
    }

    duplicatas_corrigidas = 0
    lixeiras_expurgadas = 0
    patches = []

    for q in questions:
        # 1. Modalidade Canônica
        nova_mod = normalize_modalidade(q)
        q['modalidade'] = nova_mod

        # 2. Especialidade Canônica
        q['especialidade'] = 'Medicina Preventiva e Social'

        # 3. Tema Canônico
        t_orig = str(q.get('tema') or '').strip()
        t_norm = norm_text(t_orig)
        novo_tema = 'Sistema Único de Saúde' # fallback
        for k, v in tema_mapping.items():
            if k in t_norm:
                novo_tema = v
                break
        
        # se ainda não bateu, analisa enunciado
        if novo_tema not in temas_canonicos:
            stmt_norm = norm_text(q.get('statement') or '')
            if 'trabalhador' in stmt_norm or 'ocupacional' in stmt_norm or 'cat' in stmt_norm:
                novo_tema = 'Saúde do Trabalhador'
            elif 'sensibilidade' in stmt_norm or 'especificidade' in stmt_norm or 'amostra' in stmt_norm:
                novo_tema = 'Bioestatística'
            elif 'coorte' in stmt_norm or 'caso controle' in stmt_norm or 'risco relativo' in stmt_norm:
                novo_tema = 'Epidemiologia'
            elif 'notificacao' in stmt_norm or 'surto' in stmt_norm or 'epidemia' in stmt_norm:
                novo_tema = 'Vigilância em Saúde'
            elif 'estrategia saude da familia' in stmt_norm or 'ubs' in stmt_norm or 'unidade basica' in stmt_norm:
                novo_tema = 'Atenção Primária à Saúde'
            else:
                novo_tema = 'Sistema Único de Saúde'
        
        q['tema'] = novo_tema

        # 4. Foco Canônico
        f_orig = str(q.get('foco') or '').strip()
        f_norm = norm_text(f_orig)
        
        # Eliminar lixeiras
        if not f_orig or f_norm in ['geral', 'outros', 'diversos', 'sem foco', 'n a', 'none', '']:
            lixeiras_expurgadas += 1
            # Inferir foco clínico do tema
            if novo_tema == 'Sistema Único de Saúde':
                novo_foco = 'Princípios Doutrinários e Organizacionais do SUS'
            elif novo_tema == 'Epidemiologia':
                novo_foco = 'Estudos Epidemiológicos e Delineamentos de Pesquisa'
            elif novo_tema == 'Bioestatística':
                novo_foco = 'Avaliação de Testes Diagnósticos e Rastreamento'
            elif novo_tema == 'Vigilância em Saúde':
                novo_foco = 'Doenças de Notificação Compulsória e Vigilância Epidemiológica'
            elif novo_tema == 'Atenção Primária à Saúde':
                novo_foco = 'Estratégia Saúde da Família e Atributos da APS'
            else:
                novo_foco = 'Saúde do Trabalhador e Patologias Ocupacionais'
        else:
            novo_foco = f_orig
        
        q['foco'] = novo_foco

        # 5. Subfoco Canônico (Invariante Anti-Duplicação)
        sf_orig = str(q.get('subfoco') or '').strip()
        
        # Se for duplicado com o foco ou vazio ou lixeira
        if not sf_orig or norm_text(sf_orig) == norm_text(novo_foco) or norm_text(sf_orig) in ['geral', 'outros', 'n a', 'none']:
            duplicatas_corrigidas += 1
            # Inferir o ângulo da decisão médica cobrada a partir de enunciado + gabarito
            texto_decisao = f"{q.get('statement') or ''} {q.get('commentary') or ''}"
            novo_subfoco = detect_decision_angle(texto_decisao)
        else:
            novo_subfoco = sf_orig
        
        q['subfoco'] = novo_subfoco

        # Guardar patch para o Supabase
        patches.append({
            'id': q.get('id'),
            'modalidade': nova_mod,
            'especialidade': 'Medicina Preventiva e Social',
            'tema': novo_tema,
            'foco': novo_foco,
            'subfoco': novo_subfoco
        })

    # Salvar arquivo local atualizado com a taxonomia ouro
    with open(file_path, 'w', encoding='utf-8') as fp:
        json.dump(questions, fp)

    # Salvar patches da Fase 2.1 para o deploy
    os.makedirs('data/staging/patches_etapa2', exist_ok=True)
    patch_file = 'data/staging/patches_etapa2/patches_fase_2_1_preventiva.json'
    with open(patch_file, 'w', encoding='utf-8') as fp:
        json.dump(patches, fp)

    print(f"\nReclassificação de Preventiva Concluída!")
    print(f"  • Total Questões Processadas: {len(questions):,}")
    print(f"  • Duplicações Subfoco == Foco Corrigidas: {duplicatas_corrigidas:,}")
    print(f"  • Lixeiras/Vazios Expurgados: {lixeiras_expurgadas:,}")
    print(f"  • Patches gerados em: {patch_file}")

    # BATERIA DE TESTES DA FASE 2.1
    print("\n--- EXECUTANDO BATERIA DE TESTES DA FASE 2.1 ---")
    subfoco_dups = sum(1 for q in questions if norm_text(q.get('foco')) == norm_text(q.get('subfoco')))
    lixeiras_restantes = sum(1 for q in questions if norm_text(q.get('foco')) in ['geral', 'outros', 'none', 'n a'] or norm_text(q.get('subfoco')) in ['geral', 'outros', 'none', 'n a'])
    temas_invalidos = sum(1 for q in questions if q.get('tema') not in temas_canonicos)
    volume_conservado = (len(questions) == total_orig)

    t2_1_1 = (subfoco_dups == 0)
    t2_1_2 = (lixeiras_restantes == 0 and temas_invalidos == 0)
    t2_1_3 = volume_conservado

    print(f"TEST-2.1.1 (Invariante Anti-Duplicação Subfoco != Foco): {'APROVADO' if t2_1_1 else 'REPROVADO'} (Duplicações: {subfoco_dups})")
    print(f"TEST-2.1.2 (Erradicação de Lixeiras e 100% Temas Canônicos): {'APROVADO' if t2_1_2 else 'REPROVADO'} (Lixeiras: {lixeiras_restantes}, Temas inválidos: {temas_invalidos})")
    print(f"TEST-2.1.3 (Conservação Volumétrica Absoluta): {'APROVADO' if t2_1_3 else 'REPROVADO'} ({len(questions)} / {total_orig})")

    status_fase = t2_1_1 and t2_1_2 and t2_1_3
    print(f"\nSTATUS FASE 2.1: {'100% APROVADO' if status_fase else 'REPROVADO'}")
    return status_fase

if __name__ == '__main__':
    run_fase_2_1_preventiva()
