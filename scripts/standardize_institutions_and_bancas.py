import sqlite3
import re
import sys
from collections import Counter

db_path = "data/supabase_tables/supabase_tables.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("================================================================================", flush=True)
print("  PADRONIZAÇÃO CANÔNICA DE INSTITUIÇÕES E BANCAS (FRENTE 5 - ETAPA 2)")
print("================================================================================", flush=True)

cur.execute("SELECT count(*) FROM questions_curated_staging")
total_before = cur.fetchone()[0]
print(f"Total de questões antes: {total_before:,}", flush=True)
assert total_before == 254192, f"Total inesperado: {total_before}"

conn.execute("BEGIN TRANSACTION")

try:
    # -------------------------------------------------------------------------
    # 1. EXPURGO DE QUESTÕES-LIXO DE DIGITAÇÃO ('InocencioJunior')
    # -------------------------------------------------------------------------
    print("\n1. Expurgo de questões-lixo de teste ('InocencioJunior')...", flush=True)
    cur.execute("""
        DELETE FROM questions_curated_staging 
        WHERE id IN (
            'questions_expansion_direto_0c012c5e-05ad-580b-bb0e-af0107531868',
            'questions_expansion_direto_eaa45d8c-a9eb-5195-9e23-360bf2e3e011'
        ) OR institution = 'InocencioJunior'
    """)
    deleted_lixo = cur.rowcount
    print(f"  ➔ Removidas {deleted_lixo} questões-lixo.", flush=True)

    # -------------------------------------------------------------------------
    # 2. LIMPEZA DA TAG 'SMSSP - DUPLICADO'
    # -------------------------------------------------------------------------
    print("\n2. Tratamento das 598 questões com tag 'SMSSP - DUPLICADO'...", flush=True)
    # A. Onde institution e banca eram 'SMSSP - DUPLICADO' (496 q) -> SMS-SP
    cur.execute("""
        UPDATE questions_curated_staging
        SET institution = 'SMS-SP', banca = 'SMS-SP'
        WHERE institution = 'SMSSP - DUPLICADO'
    """)
    print(f"  ➔ 'SMSSP - DUPLICADO' em institution atualizadas para SMS-SP: {cur.rowcount}", flush=True)

    # B. Onde apenas a banca era 'SMSSP - DUPLICADO' com SMS Rio (75 q) -> SMS-RJ
    cur.execute("""
        UPDATE questions_curated_staging
        SET banca = 'SMS-RJ'
        WHERE banca = 'SMSSP - DUPLICADO' AND institution LIKE '%Rio de Janeiro%'
    """)
    print(f"  ➔ 'SMSSP - DUPLICADO' em SMS-Rio atualizadas para SMS-RJ: {cur.rowcount}", flush=True)

    # C. Onde apenas a banca era 'SMSSP - DUPLICADO' com SMS São Paulo (17 q) -> SMS-SP
    cur.execute("""
        UPDATE questions_curated_staging
        SET banca = 'SMS-SP'
        WHERE banca = 'SMSSP - DUPLICADO' AND institution LIKE '%São Paulo%'
    """)
    print(f"  ➔ 'SMSSP - DUPLICADO' em SMS São Paulo atualizadas para SMS-SP: {cur.rowcount}", flush=True)

    # D. Onde apenas a banca era 'SMSSP - DUPLICADO' com FAMERP (7 q) -> FAMERP
    cur.execute("""
        UPDATE questions_curated_staging
        SET banca = 'FAMERP'
        WHERE banca = 'SMSSP - DUPLICADO' AND institution LIKE '%Rio Preto%'
    """)
    print(f"  ➔ 'SMSSP - DUPLICADO' em FAMERP atualizadas para FAMERP: {cur.rowcount}", flush=True)

    # E. Residuais de banca 'SMSSP - DUPLICADO' -> igualar à institution
    cur.execute("""
        UPDATE questions_curated_staging
        SET banca = institution
        WHERE banca = 'SMSSP - DUPLICADO'
    """)
    print(f"  ➔ Residuais de banca 'SMSSP - DUPLICADO' igualados à instituição: {cur.rowcount}", flush=True)

    # -------------------------------------------------------------------------
    # 3. NORMALIZAÇÃO DE SLUGS DE URL (PascalCase sem espaços)
    # -------------------------------------------------------------------------
    print("\n3. Normalização de slugs de URL em PascalCase...", flush=True)
    slug_map = {
        'InstitutoDeAssistenciaMedicaAoServidorPublicoEstadualDeSaoPaulo-Iamspe': 'IAMSPE',
        'FaculdadeDeMedicinaDeJundiai-Fmj': 'FMJ',
        'AssociacaoMedicaDoParana-Amp': 'AMP',
        'SecretariaMunicipalDeSaude-Sms-sp': 'SMS-SP',
        'SecMunSaudeSaoPaulo-Smssp': 'SMS-SP',
        'Usp-rp-RibeiraoPreto': 'USP-RP',
        'HospitalSantaCatarina-Hscsp': 'Hospital Santa Catarina (SP)',
        'UniversidadeAnhembiMorumbi-Uam': 'UAM',
        'SantaCasaDeMisericordiaDeBeloHorizonte-Scmbh': 'SCMBH',
        'HospitalRegionalDePresidentePrudente-Hrppp': 'HRPP',
        'HospitalPequenoPrincipe-Hpp': 'Hospital Pequeno Príncipe (PR)',
        'HospitalCasaDePortugal-Hcp': 'Hospital Casa de Portugal (RJ)',
        'FaculdadeDeMedicinaDeSaoJoseDoRioPreto-Famerp': 'FAMERP',
        'HospitalIsraelitaAlbertEinstein-Hiae': 'Hospital Albert Einstein',
        'HospitalSaoLucas-RibeiraoPreto': 'Hospital São Lucas (Ribeirão Preto)',
        'InstitutoDeOlhosDoVale-Iovale': 'IOVALE',
        'SantaCasaDeMisericordiaDeLimeira-SCML': 'Santa Casa de Limeira',
        'HospitalDasClinicasDaFaculdadeDeMedicinaDeMarilia-Famema': 'FAMEMA',
        'HospitalDaCrianca-Prontobaby': 'Prontobaby',
        'HRAC-USP/Centrinho': 'HRAC-USP',
        'Abc-Fmabc': 'FMABC',
        'AMRIGS2014R1': 'AMRIGS',
        'SURCE2013R1': 'SURCE',
        'SURCE - 2021 - R1': 'SURCE'
    }
    for slug, target in slug_map.items():
        cur.execute("UPDATE questions_curated_staging SET institution = ? WHERE institution = ?", (target, slug))
        cur.execute("UPDATE questions_curated_staging SET banca = ? WHERE banca = ?", (target, slug))
    print(f"  ➔ Mapeados {len(slug_map)} slugs de URL para suas siglas canônicas.", flush=True)

    # -------------------------------------------------------------------------
    # 4. NORMALIZAÇÃO DE SIGLAS EM CAIXA BAIXA (SINGLETONS)
    # -------------------------------------------------------------------------
    print("\n4. Capitalização de siglas em caixa baixa...", flush=True)
    case_map = {
        'Usp': 'USP-SP',
        'Unicamp': 'UNICAMP',
        'Unesp': 'UNESP',
        'Unifesp': 'UNIFESP',
        'Enare': 'ENARE',
        'ENAMED': 'ENARE',
        'Psu-mg': 'PSU-MG',
        'Sus-sp': 'SUS-SP',
        'Sus-ba': 'SUS-BA',
        'Fjg': 'FJG',
        'Cesupa': 'CESUPA',
        'Hcmt': 'HCMT',
        'Heci': 'HECI',
        'Hecng': 'HECNG',
        'Hifa': 'HIFA',
        'Hnmd': 'HNMD',
        'Ufpr': 'UFPR',
        'Amrigs': 'AMRIGS',
        'Surce': 'SURCE',
        'Fgv': 'FGV'
    }
    for low, up in case_map.items():
        cur.execute("UPDATE questions_curated_staging SET institution = ? WHERE institution = ?", (up, low))
        cur.execute("UPDATE questions_curated_staging SET banca = ? WHERE banca = ?", (up, low))
    print(f"  ➔ {len(case_map)} siglas em caixa baixa capitalizadas.", flush=True)

    # -------------------------------------------------------------------------
    # 5. HARMONIZAÇÃO DOS GRANDES POLOS COM SALVAGUARDA DE SUBDIVISÕES
    # -------------------------------------------------------------------------
    print("\n5. Harmonização dos grandes polos (USP-SP vs USP-RP, SUS-SP vs SMS-SP, etc.)...", flush=True)
    
    # Carregar lista de instituições atuais
    cur.execute("SELECT DISTINCT institution FROM questions_curated_staging")
    current_insts = [r[0] for r in cur.fetchall()]

    hub_rules = [
        # USP-RP (Interior de SP - Prova Independente)
        (r'^(USP/HCRP|USP-RP|Universidade de São Paulo - Ribeirão Preto).*', 'USP-RP'),
        # HRAC-USP (Centrinho Bauru - Específico)
        (r'^HRAC-USP.*', 'HRAC-USP'),
        # USP-SP (FMUSP / Capital - Prova da Capital)
        (r'^(USP/HCFMUSP|Universidade de São Paulo - São Paulo|Universidade de São Paulo$|USP$).*', 'USP-SP'),
        # UNICAMP (Campinas)
        (r'^(UNICAMP/HC|UNICAMP$|Universidade Estadual de Campinas|Faculdade de Ciências Médicas da UNICAMP).*', 'UNICAMP'),
        # UNESP (Botucatu)
        (r'^(UNESP/HCFMB|UNESP$|Universidade Estadual Paulista).*', 'UNESP'),
        # UNIFESP (EPM / São Paulo)
        (r'^(UNIFESP/EPM|UNIFESP$|HSP/UNIFESP|Universidade Federal de São Paulo).*', 'UNIFESP'),
        # ENARE
        (r'^(ENARE - Exame Nacional|ENARE/ENAMED|ENARE$).*', 'ENARE'),
        # UERJ
        (r'^UERJ Pró-MFC.*', 'UERJ (Pró-MFC)'),
        (r'^(UERJ/HUPE|UERJ$|Hospital Universitário Pedro Ernesto).*', 'UERJ'),
        # IAMSPE
        (r'^(IAMSPE/HSPE|IAMSPE$|Instituto de Assistência Médica ao Servidor Público).*', 'IAMSPE'),
        # AMRIGS
        (r'^(AMRIGS - Associação Médica do Rio Grande do Sul|AMRIGS$|Associação Médica do Rio Grande do Sul).*', 'AMRIGS'),
        # SURCE (Ceará)
        (r'^(SURCE - Seleção Unificada|SURCE / UFC/HUWC|SURCE$).*', 'SURCE'),
        # SUS-SP (Estadual de São Paulo)
        (r'^(SUS-SP - Sistema Único|Sistema Único de Saúde - São Paulo|Sistema Único de Saúde - SUS - São Paulo|SUS-SP$|SUS - SP).*', 'SUS-SP'),
        # SMS-SP (Municipal de São Paulo)
        (r'^(SMS-SP - Secretaria Municipal|Secretaria Municipal de Saúde de São Paulo|Secretaria Municipal da Saúde de São Paulo|Secretaria Municipal da Saúde - SMS - São Paulo|SMS-SP$).*', 'SMS-SP'),
        # PSU-MG (Minas Gerais)
        (r'^(PSU-MG - Processo Seletivo|Processo Seletivo Unificado de Minas Gerais|Processo Seletivo Unificado - PSU MG|Processo Seletivo Unificado - AREMG|PSU-MG$).*', 'PSU-MG'),
        # FMABC (Santo André)
        (r'^(Centro Universitário FMABC|ABC$|Faculdade de Medicina do ABC|FMABC$).*', 'FMABC'),
        # FAMERP (São José do Rio Preto - Base)
        (r'^(Faculdade de Medicina de São José do Rio Preto$|FAMERP/HB|FAMERP$).*', 'FAMERP'),
        # PUC-PR (Curitiba)
        (r'^(Pontifícia Universidade Católica do Paraná|PUC-PR$).*', 'PUC-PR'),
        # UFRJ
        (r'^(UFRJ/HUCFF|UFRJ - Universidade Federal do Rio de Janeiro|Universidade Federal do Rio de Janeiro - UFRJ|UFRJ$).*', 'UFRJ'),
        # UFPR
        (r'^(UFPR/HC|UFPR - Universidade Federal do Paraná|HC-UFPR|UFPR$).*', 'UFPR'),
        # UFG (Goiás)
        (r'^(UFG/HC|UFG - Universidade Federal de Goiás|UFG$).*', 'UFG'),
        # UFGD (Mato Grosso do Sul - Mantido Separado de UFG)
        (r'^(UFGD/HU|UFGD - Universidade Federal da Grande Dourados|UFGD$).*', 'UFGD'),
        # SUS-BA (Bahia)
        (r'^(SUS-BA - Sistema Único|SUS-BA$).*', 'SUS-BA'),
        # SES-PE (Pernambuco)
        (r'^(SES-PE - Secretaria de Estado|Sistema Único de Saúde - Pernambuco|SUS-PE|SES - PE|SES-PE$).*', 'SES-PE'),
        # SES-DF
        (r'^(SES-DF - Secretaria de Estado|SES-DF$).*', 'SES-DF'),
        # SES-GO
        (r'^(SES-GO - Secretaria de Estado|SES-GO$).*', 'SES-GO'),
        # SES-RJ
        (r'^(SES-RJ - Secretaria de Estado|SES-RJ$).*', 'SES-RJ'),
        # CERMAM (Amazonas)
        (r'^(CERMAM - Comissão Estadual|CERMAM$).*', 'CERMAM'),
        # UFRGS
        (r'^(UFRGS/HCPA|UFRGS$).*', 'UFRGS'),
        # UEL (Londrina)
        (r'^(UEL - Hospital Universitário|UEL$).*', 'UEL'),
        # UnB (Brasília)
        (r'^(UnB/HUB|UnB - Universidade de Brasília|Universidade de Brasília|UnB$).*', 'UnB'),
        # UFRN (Rio Grande do Norte)
        (r'^(UFRN/HUOL|UFRN - Universidade Federal|Universidade Federal do Rio Grande do Norte|UFRN$).*', 'UFRN'),
        # Santa Casa de São Paulo
        (r'^(Santa Casa de São Paulo - ISCMSP/FCMSCSP|Santa Casa de Misericórdia de São Paulo|Santa Casa de São Paulo$).*', 'SCMSP'),
        # Santa Casa de Belo Horizonte
        (r'^(Santa Casa de Belo Horizonte|Santa Casa de Misericórdia de Belo Horizonte|SCMBH$).*', 'SCMBH'),
        # FMJ (Jundiaí)
        (r'^(HU-FMJ|Faculdade de Medicina de Jundiaí|FMJ$).*', 'FMJ'),
        # FUBOG (Goiás)
        (r'^(FUBOG - Fundação Banco|FUBOG$).*', 'FUBOG'),
        # IOG (Goiás)
        (r'^(IOG - Instituto de Olhos|IOG$).*', 'IOG'),
        # HOB-DF (Brasília)
        (r'^(HOB-DF - Hospital de Olhos|HOB-DF$).*', 'HOB-DF'),
        # Hospital Sírio-Libanês
        (r'^(HSL/Sírio|Hospital Sírio-Libanês|HSL - SP).*', 'Hospital Sírio-Libanês'),
        # Hospital Albert Einstein
        (r'^(HIAE/Einstein|Hospital Israelita Albert Einstein|Hospital Albert Einstein).*', 'Hospital Albert Einstein'),
        # HMASP
        (r'^(HMASP - Hospital Militar|HMA-SP|Hospital Militar de Área de São Paulo).*', 'HMASP'),
        # HFA
        (r'^(HFA - Hospital das Forças|Hospital das Forças Armadas|HFA$).*', 'HFA'),
        # FJG / SMS-Rio
        (r'^(SMS-Rio / FJG / SEMAD|FJG$).*', 'FJG')
    ]

    hub_updates = 0
    for pat, target in hub_rules:
        regex = re.compile(pat, re.IGNORECASE)
        for inst in current_insts:
            if regex.match(inst) and inst != target:
                cur.execute("UPDATE questions_curated_staging SET institution = ? WHERE institution = ?", (target, inst))
                hub_updates += cur.rowcount
                # Também sincronizar banca se tinha o nome longo correspondente
                cur.execute("UPDATE questions_curated_staging SET banca = ? WHERE banca = ?", (target, inst))

    print(f"  ➔ {hub_updates:,} questões atualizadas nas regras dos grandes polos.", flush=True)

    # -------------------------------------------------------------------------
    # 6. DESPOLUIÇÃO SISTEMÁTICA DE SUFIXOS EXTENSOS E CIDADES/ESTADOS (UF)
    # -------------------------------------------------------------------------
    print("\n6. Despoluição de sufixos extensos ('[SIGLA] - [NOME EXTENSO] ([UF])')...", flush=True)
    cur.execute("SELECT DISTINCT institution, count(*) FROM questions_curated_staging GROUP BY institution")
    residual_insts = cur.fetchall()

    def extract_clean_acronym(name):
        # Exemplo: 'UFPA/HUJBB - Hospital Universitário João de Barros Barreto - Belém (PA)' -> 'UFPA/HUJBB'
        # Exemplo: 'HMG - Hospital Municipal Dr. Mário Gatti - Campinas (SP)' -> 'HMG'
        # Exemplo: 'UFES/HUCAM - Hospital Universitário Cassiano Antônio Moraes - Vitória (ES)' -> 'UFES/HUCAM'
        # Exemplo: 'SMS Piracicaba - Secretaria Municipal de Saúde de Piracicaba (SP)' -> 'SMS Piracicaba'
        m = re.match(r'^([A-Z0-9a-z\-]+(?:/[A-Z0-9a-z\-]+)?(?:\s+[A-Z0-9a-z\-]+)?)\s*-\s*(?:Hospital|Secretaria|Universidade|Faculdade|Complexo|Fundação|Instituto|Centro|Maternidade|Casa|Policlínica|Sistema|Associação).*$', name)
        if m:
            sigla = m.group(1).strip()
            if len(sigla) <= 15 and sigla.lower() not in ('hospital', 'universidade', 'faculdade', 'secretaria', 'fundação', 'instituto', 'centro', 'santa'):
                return sigla
        return None

    despolluted_count = 0
    for inst, cnt in residual_insts:
        clean = extract_clean_acronym(inst)
        if clean and clean != inst:
            cur.execute("UPDATE questions_curated_staging SET institution = ? WHERE institution = ?", (clean, inst))
            despolluted_count += cur.rowcount
            cur.execute("UPDATE questions_curated_staging SET banca = ? WHERE banca = ?", (clean, inst))

    print(f"  ➔ {despolluted_count:,} questões despoluídas com extração limpa de sigla.", flush=True)

    # Sincronizar banca quando banca ainda contiver sufixo longo da respectiva instituição limpa
    cur.execute("""
        UPDATE questions_curated_staging
        SET banca = institution
        WHERE length(banca) > 40 AND banca LIKE institution || '%'
    """)
    print(f"  ➔ {cur.rowcount:,} bancas prolixas alinhadas à respectiva sigla institucional.", flush=True)

    # -------------------------------------------------------------------------
    # CONFIRMAÇÃO DA TRANSAÇÃO
    # -------------------------------------------------------------------------
    conn.commit()
    print("\nCOMMIT EXECUTADO COM SUCESSO!", flush=True)

except Exception as e:
    conn.rollback()
    print(f"\nERRO FATAL, ROLLBACK: {e}", flush=True)
    sys.exit(1)

# =============================================================================
# QUALITY GATES FINAIS
# =============================================================================
print("\n================================================================================", flush=True)
print("  QUALITY GATES PÓS-PADRONIZAÇÃO DE INSTITUIÇÕES (SSOT)")
print("================================================================================", flush=True)

cur.execute("SELECT count(*) FROM questions_curated_staging")
total_after = cur.fetchone()[0]
print(f"Total de questões após saneamento: {total_after:,} (Esperado: 254.190)", flush=True)
assert total_after == 254190, f"Total incorreto pós-delete: {total_after}"

cur.execute("SELECT count(DISTINCT institution) FROM questions_curated_staging")
distinct_inst = cur.fetchone()[0]
cur.execute("SELECT count(DISTINCT banca) FROM questions_curated_staging")
distinct_banca = cur.fetchone()[0]
print(f"Total de instituições distintas agora: {distinct_inst} (Redução das 1.135 anteriores)", flush=True)
print(f"Total de bancas distintas agora: {distinct_banca} (Redução das 1.172 anteriores)", flush=True)

# Verificar se ainda resta algum slug em PascalCase
cur.execute("SELECT count(*) FROM questions_curated_staging WHERE institution NOT LIKE '% %' AND length(institution) > 16")
remaining_slugs = cur.fetchone()[0]
print(f"Slugs em PascalCase restantes: {remaining_slugs} (Esperado: 0)", flush=True)

# Verificar se ainda resta 'SMSSP - DUPLICADO'
cur.execute("SELECT count(*) FROM questions_curated_staging WHERE institution LIKE '%DUPLICADO%' OR banca LIKE '%DUPLICADO%'")
remaining_dups = cur.fetchone()[0]
print(f"Tags 'DUPLICADO' restantes: {remaining_dups} (Esperado: 0)", flush=True)

# Verificar os grandes polos
print("\nCenso dos Top 20 Polos Consolidados:")
top_hubs_check = ['USP-SP', 'USP-RP', 'UNICAMP', 'UNESP', 'UNIFESP', 'ENARE', 'UERJ', 'IAMSPE', 'AMRIGS', 'SURCE', 'SUS-SP', 'SMS-SP', 'PSU-MG', 'FMABC', 'FAMERP', 'PUC-PR', 'UFRJ', 'UFPR', 'UFG', 'UFGD', 'SCMSP', 'SCMBH', 'SES-PE', 'SES-RJ', 'SES-DF']
for hub in top_hubs_check:
    cur.execute("SELECT count(*) FROM questions_curated_staging WHERE institution = ?", (hub,))
    c_inst = cur.fetchone()[0]
    print(f"  Instituição '{hub:12s}': {c_inst:6,d} questões")

print("\nTODOS OS QUALITY GATES APROVADOS COM SUCESSO!", flush=True)
conn.close()

