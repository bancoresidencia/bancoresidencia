import sqlite3
import json
import re

print("=" * 70)
print("DRY RUN DE REORGANIZAÇÃO: CARDIOLOGIA (CLÍNICA MÉDICA)")
print("=" * 70)

# 1. Carregar a estrutura atual do front-end em src/data/clinicaMedicaData.ts
with open('src/data/clinicaMedicaData.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Extrair o bloco de Cardiologia
eq_idx = ts_content.indexOf('= {') if hasattr(ts_content, 'indexOf') else ts_content.find('= {')
json_str = ts_content[eq_idx + 2 : ts_content.rfind('}') + 1]
data = json.loads(json_str)

cardio_tema = next((t for t in data['temas'] if 'Cardio' in t['tema']), None)

print("\n--- 1. DIAGNÓSTICO DO FRONT-END ATUAL (clinicaMedicaData.ts) ---")
print(f"Tema atual: '{cardio_tema['tema']}'")
print(f"Total de focos: {len(cardio_tema['focos'])}")

anomalias = []
for foco in cardio_tema['focos']:
    for sub in foco['subfocos']:
        sub_name = sub if isinstance(sub, str) else sub.get('subfoco')
        sub_subs = sub.get('sub_subfocos', []) if isinstance(sub, dict) else []
        if len(sub_subs) > 0:
            print(f"  * Subfoco com sub-subfocos: '{sub_name}' -> {len(sub_subs)} itens!")
            if len(sub_subs) > 5:
                anomalias.append((foco['foco'], sub_name, sub_subs))

print(f"\nAnomalia encontrada: {len(anomalias)} subfoco(s) acumulando sub-subfocos.")
for foco_name, sub_name, subs in anomalias:
    print(f"  Foco: '{foco_name}'")
    print(f"  Subfoco anômalo: '{sub_name}' contendo {len(subs)} itens misturados!")
    has_padrao = any('Padrão-Ouro' in s for s in subs)
    print(f"  Contém 'Padrão-Ouro de Preparação Médica': {'SIM (será removido)' if has_padrao else 'NÃO'}")

# 2. Investigar no SQLite data/questoes_132k.db
conn = sqlite3.connect('data/questoes_132k.db')
cur = conn.cursor()

cur.execute("""
    SELECT COUNT(*) 
    FROM questions 
    WHERE especialidade = 'Clínica Médica' 
      AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
""")
total_cardio_db = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) 
    FROM questions 
    WHERE especialidade = 'Clínica Médica' 
      AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
      AND novo_sub_subfoco IS NOT NULL 
      AND novo_sub_subfoco != '' 
      AND novo_sub_subfoco != 'None'
""")
cardio_com_subsub = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) 
    FROM questions 
    WHERE especialidade = 'Clínica Médica' 
      AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
      AND novo_sub_subfoco LIKE '%Padrão-Ouro%'
""")
cardio_padrao_ouro = cur.fetchone()[0]

print("\n--- 2. SITUAÇÃO NO SQLITE (data/questoes_132k.db) ---")
print(f"Total de questões de Cardiologia: {total_cardio_db}")
print(f"Questões com novo_sub_subfoco preenchido hoje: {cardio_com_subsub}")
print(f"Questões contaminadas com 'Padrão-Ouro...': {cardio_padrao_ouro}")

# Distribuição atual de focos no banco
cur.execute("""
    SELECT novo_foco, COUNT(*) 
    FROM questions 
    WHERE especialidade = 'Clínica Médica' 
      AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
    GROUP BY novo_foco 
    ORDER BY COUNT(*) DESC
""")
focos_dist = cur.fetchall()
print("\nDistribuição por Foco no Banco:")
for f_name, count in focos_dist:
    print(f"  - {f_name or '[SEM FOCO]'}: {count} questões")

# 3. Modelagem da Nova Estrutura Reorganizada de Cardiologia
nova_estrutura_cardio = {
    "tema": "Cardiologia",
    "focos": [
        {
            "foco": "Síndromes Coronarianas Isquêmicas",
            "subfocos": [
                {
                    "subfoco": "IAM com Supradesnivelamento de ST (IAMCSST)",
                    "sub_subfocos": [
                        "Eletrocardiograma e Localização da Parede Infartada (Anterior, Inferior com VD, Lateral)",
                        "Terapia de Reperfusão Imediata: Angioplastia Primária (< 90-120 min) vs Fibrinólise (< 30 min e até 12h)",
                        "Terapia Farmacológica Coadjuvante (Dupla Antiagregação, Anticoagulação, Estatina e Betabloqueador)",
                        "Complicações Mecânicas (Rotura de Parede Livre, Septo Interventricular e Músculo Papilar) e Elétricas"
                    ]
                },
                {
                    "subfoco": "Síndrome Coronariana Aguda sem Supra de ST (SCASST) e Angina Instável",
                    "sub_subfocos": [
                        "Estratificação de Risco (Escores TIMI e GRACE) e Biomarcadores de Necrose (Troponina Ultrassensível)",
                        "Estratégia Invasiva Precoce (< 24h) vs Imediata (< 2h) vs Seletiva"
                    ]
                },
                {
                    "subfoco": "Doença Arterial Coronariana Crônica e Angina Estável",
                    "sub_subfocos": [
                        "Investigação Diagnóstica não Invasiva (Teste Ergométrico, Angio-TC Coronariana e Cintilografia)",
                        "Otimização da Terapia Antianginosa e Modificação de Estilo de Vida"
                    ]
                }
            ]
        },
        {
            "foco": "Insuficiência Cardíaca e Cardiomiopatias",
            "subfocos": [
                {
                    "subfoco": "Insuficiência Cardíaca com Fração de Ejeção Reduzida (ICFER)",
                    "sub_subfocos": [
                        "Critérios Diagnósticos de Framingham e Papel dos Peptídeos Natriuréticos (BNP / NT-proBNP)",
                        "O \"Quarteto Fantástico\" Modificador de Sobrevida (iSGLT2, iECA/BRA/ARNI, Betabloqueador e Antagonista da Aldosterona)",
                        "Indicações de Dispositivos (Cardiodesfibrilador Implantável - CDI e Terapia de Ressincronização Cardíaca)"
                    ]
                },
                {
                    "subfoco": "Insuficiência Cardíaca Agudamente Descompensada",
                    "sub_subfocos": [
                        "Perfil Hemodinâmico de Stevenson (Perfil A Quente/Seco, B Quente/Úmido, L Frio/Seco, C Frio/Úmido)",
                        "Edema Agudo de Pulmão Cardiogênico (Furosemida EV, Vasodilatador EV e VNI com CPAP/BIPAP)",
                        "Choque Cardiogênico e Uso Racional de Inotrópicos (Dobutamina) e Vasopressores (Noradrenalina)"
                    ]
                },
                {
                    "subfoco": "Cardiomiopatia Hipertrófica e Cardiomiopatia Chagásica",
                    "sub_subfocos": [
                        "Cardiomiopatia Hipertrófica: Sopro Sistólico que Aumenta com Valsalva e Manejo com Betabloqueador",
                        "Cardiopatia Chagásica: Aneurisma de Ponta do VE, Bloqueio de Ramo Direito + BDAS e Arritmias Ventriculares"
                    ]
                }
            ]
        },
        {
            "foco": "Arritmias Cardíacas",
            "subfocos": [
                {
                    "subfoco": "Fibrilação Atrial e Flutter Atrial",
                    "sub_subfocos": [
                        "Avaliação de Risco Tromboembólico pelo Escore CHA2DS2-VASc e Indicação de Anticoagulação Oral (DOACs vs Varfarina)",
                        "Escore HAS-BLED para Risco de Sangramento",
                        "Controle de Ritmo (Cardioversão Química/Elétrica) vs Controle de Frequência Cardíaca (Betabloqueador / Bloqueador de Canal de Cálcio)",
                        "Conduta na Instabilidade Hemodinâmica (Cardioversão Elétrica Sincronizada Imediata)"
                    ]
                },
                {
                    "subfoco": "Taquicardias Supraventriculares Paroxísticas",
                    "sub_subfocos": [
                        "Taquicardia por Reentrada Nodal (TRN): Manobras Vagais e Adenosina EV em Bolus Rápido",
                        "Síndrome de Wolff-Parkinson-White (Pré-Excitação: Onda Delta e Intervalo PR Curto)"
                    ]
                },
                {
                    "subfoco": "Bradiarritmias e Bloqueios Atrioventriculares",
                    "sub_subfocos": [
                        "Bloqueio Atrioventricular de 1º Grau e 2º Grau Mobitz I (Wenckebach) - Geralmente Benignos",
                        "BAV de 2º Grau Mobitz II e BAV de 3º Grau / Total (Indicação Mandatória de Marcapasso Provisório e Definitivo)",
                        "Manejo Agudo da Bradicardia Instável: Atropina EV, Marcapasso Transcutâneo e Adrenalina/Dopamina"
                    ]
                }
            ]
        },
        {
            "foco": "Doenças Valvares Cardíacas",
            "subfocos": [
                {
                    "subfoco": "Estenose Aórtica",
                    "sub_subfocos": [
                        "Tríade Clássica de Gravidade: Angina, Síncope e Dispneia aos Esforços",
                        "Exame Físico: Sopro Mesossistólico em Diamante com Irradiação para Carótidas e Pulso Parvus et Tardus",
                        "Tratamento Cirúrgico: Troca Valvar Aórtica Cirúrgica vs TAVI (Transcatheter Aortic Valve Implantation)"
                    ]
                },
                {
                    "subfoco": "Insuficiência Mitral e Estenose Mitral",
                    "sub_subfocos": [
                        "Estenose Mitral Reumática: Ruflar Diastólico com Estalido de Abertura, Reforço Pré-Sistólico e Hipertensão Pulmonar",
                        "Insuficiência Mitral Crônica e Aguda (Sopro Holossistólico em Ápice com Irradiação para Axila)"
                    ]
                }
            ]
        },
        {
            "foco": "Hipertensão Arterial Sistêmica",
            "subfocos": [
                {
                    "subfoco": "Diagnóstico e Manejo Ambulatorial da Hipertensão",
                    "sub_subfocos": [
                        "Critérios da Diretriz Brasileira de HAS: Classificação em Estágios 1, 2 e 3 e Metas Pressóricas",
                        "Papel do MAPA e MRPA (Fenômeno do Avental Branco e Hipertensão Mascarada)",
                        "Escolha de Anti-hipertensivos de 1ª Linha (Tiazídicos, Bloqueadores de Canal de Cálcio, iECA/BRA) e Associações"
                    ]
                },
                {
                    "subfoco": "Crise Hipertensiva",
                    "sub_subfocos": [
                        "Emergência Hipertensiva: Lesão Aguda e Progressiva de Órgãos-Alvo (Redução com Nitroprussiato ou Nitroglicerina EV)",
                        "Urgência Hipertensiva: Elevação Pressórica sem Lesão de Órgão-Alvo (Anti-hipertensivos Orais e Alta Programada)",
                        "Encefalopatia Hipertensiva e Dissecção Aguda de Aorta (Meta de PAS < 120 mmHg e FC < 60 bpm com Esmolol + Nitroprussiato)"
                    ]
                }
            ]
        },
        {
            "foco": "Doenças do Pericárdio e Endocardite Infecciosa",
            "subfocos": [
                {
                    "subfoco": "Pericardite Aguda e Tamponamento Cardíaco",
                    "sub_subfocos": [
                        "Pericardite: Dor Torácica Pleurítica que Melhora ao Inclinar o Tronco para Frente, Atrito Pericárdico e Supra de ST Côncavo Difuso",
                        "Tamponamento Cardíaco: Tríade de Beck (Hipotensão, Hipofonese de Bulhas e Turgência Jugular) + Pulso Paradoxal",
                        "Conduta Imediata no Tamponamento: Pericardiocentese de Urgência (Manobra de Marfan)"
                    ]
                },
                {
                    "subfoco": "Endocardite Infecciosa",
                    "sub_subfocos": [
                        "Critérios Modificados de Duke (Critérios Maiores: Hemoculturas Típicas e Vegetação no Ecocardiograma)",
                        "Fenômenos Vasculares e Imunológicos (Nódulos de Osler, Lesões de Janeway, Manchas de Roth)",
                        "Profilaxia de Endocardite para Procedimentos Odontológicos em Pacientes de Alto Risco (Amoxicilina 2g 1h antes)"
                    ]
                }
            ]
        },
        {
            "foco": "Parada Cardiorrespiratória e Ressuscitação (ACLS)",
            "subfocos": [
                {
                    "subfoco": "Ritmos Chocáveis e Não Chocáveis",
                    "sub_subfocos": [
                        "Ritmos Chocáveis: Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP) - Choque Imediato + RCP",
                        "Ritmos Não Chocáveis: Assistolia e Atividade Elétrica sem Pulso (AESP) - RCP Imediata + Adrenalina 1 mg precoce",
                        "Drogas no Suporte Avançado de Vida (Adrenalina a cada 3-5 min e Amiodarona / Lidocaína para Ritmos Chocáveis)",
                        "Causas Reversíveis de PCR: Mnemônicos dos 5 Hs e 5 Ts"
                    ]
                },
                {
                    "subfoco": "Cuidados Pós-Parada Cardiorrespiratória",
                    "sub_subfocos": [
                        "Controle Direcionado de Temperatura (32 a 36°C) em Pacientes Comatosos",
                        "Coronariografia de Emergência e Otimização Hemodinâmica"
                    ]
                }
            ]
        }
    ]
}

print("\n--- 3. SIMULACAO DO PLANO DE REESTRUTURACAO (DRY RUN) ---")
print("A nova estrutura redistribui os itens desalinhados nos 7 Focos e 16 Subfocos legitimos.")
for f in nova_estrutura_cardio['focos']:
    print(f"\n[FOCO] {f['foco']}")
    for s in f['subfocos']:
        print(f"   [SUBFOCO] {s['subfoco']} ({len(s['sub_subfocos'])} sub-subfocos atribuidos)")

# 4. Simulacao da reclassificacao no SQLite
print("\n--- 4. SIMULACAO DA RECLASSIFICACAO NO SQLITE (Dry-Run de Queries) ---")

# Regra 1: Purgar Padrao-Ouro
print(f"Passo 1 (Purga do Lixo): {cardio_padrao_ouro} questoes de Cardiologia com 'Padrao-Ouro...' terao novo_sub_subfoco = NULL")

# Regra 2: Realocacao deterministica das questoes com sub_subfoco valido
cur.execute("""
    SELECT novo_sub_subfoco, COUNT(*) 
    FROM questions 
    WHERE especialidade = 'Clínica Médica' 
      AND (tema LIKE '%Cardio%' OR novo_tema LIKE '%Cardio%')
      AND novo_sub_subfoco IS NOT NULL 
      AND novo_sub_subfoco != '' 
      AND novo_sub_subfoco != 'None'
      AND novo_sub_subfoco NOT LIKE '%Padrão-Ouro%'
    GROUP BY novo_sub_subfoco
    ORDER BY COUNT(*) DESC
""")
subsubs_no_db = cur.fetchall()

print(f"\nPasso 2 (Mapeamento das questoes ja com sub-subfoco): {len(subsubs_no_db)} tipos de sub_subfocos encontrados no banco:")
matched_count = 0
for ss_name, count in subsubs_no_db:
    # Encontrar em qual foco/subfoco da nova estrutura ele se encaixa
    found = False
    for f in nova_estrutura_cardio['focos']:
        for s in f['subfocos']:
            if any(ss_name.strip() in target or target in ss_name.strip() for target in s['sub_subfocos']):
                print(f"   [OK] [{count} q.] '{ss_name[:45]}...' -> Foco: '{f['foco']}' | Subfoco: '{s['subfoco']}'")
                found = True
                matched_count += count
                break
        if found:
            break
    if not found:
        print(f"   [PENDENTE] [{count} q.] '{ss_name[:45]}...'")

print(f"\nTotal de questoes reassociadas deterministicamente: {matched_count} de {cardio_com_subsub - cardio_padrao_ouro}")
print("=" * 70)
print("FIM DO DRY RUN (Nenhuma alteracao foi gravada no SQLite nem no front-end)")
print("=" * 70)

