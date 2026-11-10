import sqlite3
import os

CORRECOES_MAPEAMENTO = {
    # Erros de substring conhecidos
    ('UFC', 'CE'): 'SURCE / UFC/HUWC - Universidade Federal do Ceará (CE)',
    ('CRER', 'GO'): 'CRER - Centro de Reabilitação Dr. Henrique Santillo (GO)',
    ('HEA', 'AC'): 'FUNDHACRE/HEA - Fundação Hospital Estadual do Acre (AC)',
    ('ISA', 'SP'): 'ISA - Instituto Santo André (SP)',
    ('IO', 'GO'): 'IOG - Instituto de Olhos de Goiânia (GO)',
    ('UEVA', 'GO'): 'UniEVANGÉLICA / Hospital Evangélico Goiano - HEG (GO)',
    
    # Siglas de Parte 1 com divergência de UF
    ('HCP', 'RJ'): 'HCP - Hospital Central da Polícia Militar / Criança de Petrópolis (RJ)',
    ('HSI', 'SC'): 'Hospital Santa Isabel - Blumenau (SC)',
    ('UFS', 'SE'): 'UFS/HU - Hospital Universitário de Sergipe - Aracaju (SE)',
    ('SMSC', 'MA'): 'SMS Caxias - Secretaria Municipal de Saúde (MA)',
    ('HC', 'PR'): 'UFPR/HC - Complexo Hospital de Clínicas da UFPR (PR)',
    ('HUC', 'PR'): 'Hospital Universitário Cajuru - PUC-PR (PR)',
    ('HED', 'RS'): 'Hospital Ernesto Dornelles - Porto Alegre (RS)',
    ('HSAN', 'SC'): 'Hospital Santo Antônio - Blumenau (SC)',
    ('PMF', 'SP'): 'Prefeitura Municipal de Franca (SP)',
    
    # Siglas sem mapeamento mais frequentes
    ('SEMAD', 'RJ'): 'SMS-Rio / FJG / SEMAD - Residência Médica da Cidade do Rio de Janeiro (RJ)',
    ('HCV-PR', 'PR'): 'HCV - Hospital da Cruz Vermelha Brasileira (PR)',
    ('HCV', 'PR'): 'HCV - Hospital da Cruz Vermelha Brasileira (PR)',
    ('ICRS', 'RS'): 'IC-FUC - Instituto de Cardiologia do Rio Grande do Sul (RS)',
    ('IJF', 'CE'): 'IJF - Instituto Doutor José Frota (CE)',
    ('HMMG', 'SP'): 'HMU/HMMG - Hospital Municipal Maternidade de Guarulhos (SP)',
    ('HSJJ', 'SC'): 'HMSJ - Hospital Municipal São José de Joinville (SC)',
    ('APCC', 'PI'): 'APCC - Associação Piauiense de Combate ao Câncer / Hospital São Marcos (PI)',
    ('HA-AL', 'AL'): 'HA-AL - Hospital do Açúcar de Alagoas / Hospital Veredas (AL)',
    ('HTLF', 'MA'): 'HTLF - Hospital Geral Dr. Tarquínio Lopes Filho (MA)',
    ('HC-UFPR', 'PR'): 'UFPR/HC - Complexo Hospital de Clínicas da UFPR (PR)',
    ('HCG', 'GO'): 'UFG/HC - Hospital das Clínicas da UFG - Goiânia (GO)',
    ('SCMGO', 'GO'): 'Santa Casa de Goiânia (GO)',
    ('SMS-SJP', 'PR'): 'SMS São José dos Pinhais - Secretaria Municipal de Saúde (PR)',
    ('RMEAP', 'AP'): 'COREME-AP - Comissão Estadual de Residência Médica do Amapá (AP)',
    ('HNSG', 'PR'): 'HNSG - Hospital Nossa Senhora das Graças (PR)',
    ('PASTEUR', 'RJ'): 'Hospital Pasteur - Rio de Janeiro (RJ)'
}

dbs = ['data/provaderesidencia_coleta_parte2.db', 'data/provaderesidencia_coleta.db']

total_atualizacoes = 0

for db_path in dbs:
    if not os.path.exists(db_path):
        continue
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    print(f"\n==================== PROCESSANDO {db_path} ====================")
    
    db_updated = 0
    for (raw, uf), novo_nome in CORRECOES_MAPEAMENTO.items():
        # Contar quantos serao atualizados
        c.execute("SELECT count(*) FROM provas WHERE instituicao_raw = ? AND uf = ?", (raw, uf))
        count = c.fetchone()[0]
        if count > 0:
            c.execute("""
            UPDATE provas 
            SET instituicao_banco = ? 
            WHERE instituicao_raw = ? AND uf = ?
            """, (novo_nome, raw, uf))
            print(f"  Atualizado: '{raw}' ({uf}) -> '{novo_nome}' ({count} provas)")
            db_updated += count

    conn.commit()
    conn.close()
    print(f"Total atualizado em {db_path}: {db_updated} provas.")
    total_atualizacoes += db_updated

print(f"\n Concluído! Total global de provas corrigidas: {total_atualizacoes}")

