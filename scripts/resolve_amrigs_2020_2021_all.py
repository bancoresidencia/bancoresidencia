import os, sys, json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# ==============================================================================
# RESOLUÇÕES HOMOLOGADAS: AMRIGS 2020 (48 questões)
# ==============================================================================
AMRIGS_2020_RESOLUTIONS = {
    # CIRURGIA (8)
    '68f9bad5-ca10-442a-929d-425c3c1a6c5e': ('A', 'Antibioticoprofilaxia cirurgias limpas-contaminadas'),
    'cfe5f7b9-153e-4f57-9a9e-58364cd7bfcf': ('B', 'DRGE indicação cirúrgica absoluta - pneumonia aspirativa'),
    '8ae4bab8-d3f6-4a55-a5c9-4fda32b69b56': ('A', 'Hérnia inguinoescrotal defeito no anel inguinal profundo'),
    '278fb10a-0bf1-4def-ae06-5c42760e3890': ('C', 'Regra dos nove queimados cabeça inteira e tronco anterior - 27%'),
    '25e260b9-8a89-459c-b709-111d516161a9': ('B', 'Pré-operatório de colecistectomia exame indispensável - bilirrubinas'),
    'e1d87ce1-76a6-442b-93f2-d11948a7f56d': ('C', 'Classificação ASA doença sistêmica grave funcional - ASA IV'),
    'd391173d-d94f-400c-b4e5-f2add4c8990d': ('A', 'Fístula colovesical etiologia mais frequente - diverticulite aguda'),
    '363bc1e5-406f-4635-b16e-b2bf9ddf7f03': ('C', 'Origem da Artéria Hepática Comum - tronco celíaco'),

    # CLÍNICA MÉDICA (11)
    'bd2a53cc-e982-461b-ad14-47b5b69738f2': ('C', 'SARA incorreta sobre ventilação não invasiva'),
    '84c64621-206e-4dbd-9548-4a967e480cbd': ('B', 'Critérios de gravidade da pancreatite - amilase não faz parte'),
    '8bd0371a-e9fd-406e-994f-0d661c5141a0': ('C', 'Escore de Wells critérios avaliados - taquipneia súbita não faz parte'),
    'ccaf2fa8-80d3-45ef-9ebf-44ff9fb16aa2': ('B', 'Pancreatite por hipertrigliceridemia diagnóstico diferencial colelitíase'),
    'ba6be286-b52d-4587-a3d7-765c4c4b99cd': ('B', 'Suspeição clínica tosse 6 semanas sudorese perda ponderal - tuberculose'),
    '10e8d3eb-5ac3-403c-b6bc-8b393b8064c4': ('A', 'Exame padrão-ouro Doença de Caroli - CPRE'),
    'cece4f36-7939-4a8a-8b14-45eb5ce33211': ('A', 'Alimentação de idosos nutrientes e fontes - 1 2 3'),
    '07a72c5d-b65e-4a96-97cf-1c4cea899fe8': ('D', 'Ajuste de metformina diarreia TFG 25 e tosse enalapril - I, II e III corretas'),
    '91308ba5-7b5b-4c15-b1ad-10221d1d1fb1': ('A', 'Triângulo de Koch anatomia cardíaca folheto septal Todaro seio coronário'),
    '9fd870d1-b750-46d9-8f4d-cfcdd0e7c060': ('C', 'Evitar delirium tremens benzodiazepínicos e barbitúricos - Apenas I e III'),
    'f7b2e8aa-c868-41dc-b235-6e467e4a4e4e': ('B', 'Intoxicação aguda por álcool incorreta prescrição imediata glicose sem tiamina'),

    # GINECOLOGIA (5)
    'b0863c5e-74e3-4fb2-b00e-adeb5db0f211': ('C', 'Amenorreia primária Morris insensibilidade androgênica - Apenas II e III'),
    'da2ae490-5323-4f19-b158-f3c76f18b023': ('A', 'Dismenorreia primária tratamento inicial - AINE VO'),
    'c25d7a1f-c3c5-452f-8c87-9f2e5b749a64': ('C', 'LIEBG LSIL com corrimento tratar infecção e repetir CP em 6 meses'),
    '5ac89a61-c753-4b76-83c8-a67886015437': ('D', 'Contraceptivo injetável trimestral contraindicação sangramento indeterminado'),
    '0f9cbf10-1384-440a-8af0-0b20be44c385': ('D', 'Estrogênio na pós-menopausa suprarrenal periférica estrona'),

    # MEDICINA PREVENTIVA (6)
    '6bcfb5e7-3521-4c2c-b435-2adf5c36ecab': ('D', 'Código de Ética Médica princípios fundamentais - V V V'),
    '7252db49-a17b-416e-b1eb-d7c33e90fd2f': ('D', 'Eventos adversos pós-vacinação classificação - I, II e III corretas'),
    '3be5a13e-a82b-4ce0-be4d-3ec145a6e0a5': ('C', 'Vacinação pré-esplenectomia pneumococo haemophilus meningococo'),
    'e30fc5a5-548a-42d6-aef5-5984a1c7229c': ('A', 'Sarampo calendário vacinal gravidade e contraindicação gestante - I e II'),
    '9096c343-843a-41c5-91eb-15dbe8a5f0c4': ('A', 'Tuberculose BCG vulnerabilidade e forma pulmonar - I e II'),
    '6bf63bff-956a-40a4-a235-6064f2c104a4': ('D', 'Prontuário regras básicas incorreta anotações não pertinentes'),

    # OBSTETRÍCIA (7)
    '6b12d762-9b6c-4f78-b8cc-c3a5b550dad8': ('A', 'Gestação ectópica hCG 5250 conduta tratamento cirúrgico'),
    '54c5ad6c-d4fe-4564-a7ea-337a5fdc9afc': ('D', 'Beta-hCG na gestação detecção e evolução - I, II e III corretas'),
    '61858a85-96cd-4d2b-a0b8-460e9f5a8501': ('C', 'Doença trofoblástica gestacional incorreta vitalidade embrionária mola parcial'),
    'a406ed02-0349-40ed-bc98-028fc408fc35': ('D', 'Cardiopatia e gravidez incorreta parto vaginal sob anticoagulação oral plena'),
    'bece18b9-8f78-4e8e-9781-58cdeb7d9c56': ('D', 'Pré-eclâmpsia hemoconcentração e complicações - I, II e III corretas'),
    '6b33533e-6f2a-49c0-8145-2375c7d24285': ('B', 'Pré-natal sexualidade e vacinas vírus vivos contraindicadas - I e III'),
    'c8a4586a-e998-4c19-b4f0-99e00d5899df': ('C', 'Fórcipe de Piper e manobras manejo da cabeça derradeira no parto pélvico'),

    # PEDIATRIA (11)
    'e53d18f7-689d-4af0-a04b-496d598b624e': ('B', 'Sopro inocente sistólico e redução na posição sentada - I e III'),
    '9dd06303-dc83-4c04-860d-e53c065d20da': ('D', 'RN coabitante caso índice TB quimioprofilaxia 3 meses e PT antes de BCG'),
    '5415e478-b2cd-41a5-9af5-ceed15e83d92': ('B', 'ITU pediátrica sinais E. coli febre lactente - V V F V V'),
    '4707d097-2e83-4a58-bedb-131afbece214': ('A', 'Lactente 2 meses marcos do desenvolvimento - Adequado'),
    '63d4d8c5-0fbb-499f-ac2c-d1135871dd26': ('C', 'Febre alta 3 dias que cede em crise e exantema rosado em tronco - Exantema súbito'),
    'f84c60f3-ba82-4019-9a0f-883bc8398f3d': ('B', 'Anemia ferropriva aumento de hemoglobina em 7 a 10 dias de ferro oral'),
    '41b9a71e-ae90-4ad5-a21f-63f26dc4d30b': ('D', 'Teste do pezinho MS fibrose cística hiperplasia adrenal falciforme - I, II e III'),
    'c60eb010-2f36-421b-9fd8-faef58aa4de9': ('B', 'Crescimento infantil comprimento ao nascer e velocidade - I e III'),
    '0cf8fbfe-c316-4e87-814d-1c683fe70271': ('B', 'Boa pega RN mais aréola acima boca aberta lábio evertido queixo tocando mama'),
    'f9c86779-60e3-401c-ace1-161ea857f3bd': ('B', 'Higiene oral lactentes escova e pasta fluoretada grão de arroz desde 1o dente decíduo'),
    '0902d0fd-087d-454d-93f6-660f3d302fe8': ('D', 'Complicação mais frequente de sarampo em imunossuprimido - pneumonia')
}

# ==============================================================================
# RESOLUÇÕES HOMOLOGADAS: AMRIGS 2021 (44 questões)
# ==============================================================================
AMRIGS_2021_RESOLUTIONS = {
    # CIRURGIA (10)
    '2cddd02b-2cbf-40d8-a9b6-6ca3f0670889': ('D', 'Hernioplastia inguinal incorreta Lichtenstein sem tela'),
    '368d97d7-55fa-4505-b755-18f7723aecba': ('A', 'Epididimite adulto jovem agente mais comum Chlamydia trachomatis'),
    '5182891e-6362-4c59-b6d7-7f226f4db037': ('B', 'Pseudo-obstrução intestinal causas exceto íleo biliar mecânico'),
    '6222d859-60c2-484b-b299-a74ef53ba547': ('D', 'Icterícia obstrutiva papilite estenosante complicação de coledocolitíase'),
    '7d5e6065-52b1-47d6-87db-e1c60c31aeec': ('C', 'Divertículo de Meckel borda antimesentérica íleo 45 a 60 cm da válvula'),
    'a42557d4-8b45-4e8f-88d8-b7c3663e6d7a': ('D', 'Complicações pulmonares pós-operatórias idade >60 emergência creatinina >1.5'),
    'c00fcdcc-dc70-4c2c-b850-6df4070e2aa0': ('B', 'Escala de coma de Glasgow somatório 3 + 4 + 5 = 12'),
    'f074bb02-8d84-423e-bf70-055b08861c85': ('C', 'Sinais clínicos de apendicite aguda exceto sinal de McBurney'),
    'f6b3c061-aeda-4f62-a080-d5f0f4b9c79b': ('D', 'Apendicite aguda não relacionada a ingestão de fibras vegetais'),
    'f9135999-ef02-4e5f-99a9-77e486e02b92': ('B', 'Ferimento em região lombar direita tomografia com contraste IV e VO'),

    # CLÍNICA MÉDICA (9)
    '0484d260-e974-42b0-a2ca-1b50a5a23b88': ('A', 'Nódulo pulmonar suspeito 10 cm próximo passo biópsia da lesão'),
    '0f53eb16-6040-486b-8c6f-93439458b745': ('D', 'Medicina transfusional incorreta anticorpos irregulares e compatibilidade'),
    '33ba8650-1cb0-4522-9c0b-21ca47683cc2': ('B', 'ICFER dosagem de NT-ProBNP auxilia diagnóstico e severidade'),
    '74d6b934-ec31-42d2-afe7-94ee8ca9ca47': ('B', 'AVCi agudo em uso de varfarina contraindica trombólise se anticoagulado'),
    '7c61aee6-53d3-48a9-a9a0-7edea1e93a63': ('D', 'Descontrole de asma motivo mais comum não adesão ao tratamento'),
    '7ed85435-40ce-4fb9-8a87-e9943d4dfcba': ('D', 'Cuidados paliativos incorreta laxante apenas se houver constipação por opioide'),
    '97540fe4-48a2-4c51-90f5-e4b76b381bba': ('B', 'Doença renal associada à Hepatite C nefropatia membranoproliferativa'),
    'c15fdd4f-19fd-4d24-9247-498f326e5189': ('B', 'Humor crônico flutuante hipomania e depressão menor transtorno ciclotímico'),
    'edc13f60-99c5-457b-9025-05a230f33547': ('D', 'DPOC tratamentos recomendados I, II e III corretas'),

    # GINECOLOGIA (3)
    'abdb94b9-90bc-4c12-bf33-4aa317fb2421': ('A', 'Falência ovariana prematura cariótipo idade e transitoriedade - V F V V'),
    'bb82cc5b-db4f-4026-907b-b4e500010317': ('A', 'Violência contra mulher incorreta não perguntar diretamente'),
    'ff528f49-d501-4720-823d-b5e3085c4d30': ('B', 'Critérios DSM-5 para TDPM labilidade afetiva acentuada'),

    # MEDICINA PREVENTIVA (4)
    '04910a74-4812-4110-ad22-da066282be80': ('D', 'Visita domiciliar comunicação significado e empatia - V V V'),
    '1c852156-947a-4ac9-8a41-553fe262e3d6': ('D', 'Atenção Primária à Saúde exceto atendimento focal'),
    '1def74a1-72dd-40e0-9790-410a33f39432': ('D', 'Código de Ética Médica regramento deontológico - V V V'),
    '88cacd6c-15c4-4fb7-9271-d53b570d82ca': ('A', 'Envelhecimento multimorbidade condições crônicas - I e II corretas'),

    # OBSTETRÍCIA (5)
    '0509d518-9f53-47d8-a9ca-1891d448c9f8': ('A', 'Ingurgitamento mamário ordenha manual leite de copinho e correção da pega'),
    '09b421c2-cf96-4103-aa88-012f3292151e': ('A', 'Gestação gemelar mortalidade morbidade materna e idade - I e II'),
    '2ca8a6c2-2198-4414-8777-40774801e7b4': ('C', 'Glicemia de jejum 93 no 1o tri diagnóstico DMG dieta e atividade física'),
    '8803e1f9-04dd-46b3-952b-618256945749': ('D', 'Modificações respiratórias na gestação diminuição do volume residual'),
    'd39c709f-e8cc-4c7f-97ff-89d2fa9eb3f4': ('C', 'Transtornos psiquiátricos puerperais baby blues e depressão'),

    # PEDIATRIA (13)
    '32e1afa8-37dc-46c5-b4a8-e55d690a80f4': ('C', 'Curva de crescimento peso e altura 3a4m IMC 18 - Sobrepeso'),
    '3427e7d8-cf95-41f5-969d-5acc4c201b70': ('C', 'Adolescente 13 anos faringite adenomegalia e esplenomegalia - Mononucleose'),
    '511c8774-c633-48da-a15d-ddd6f7f6b64e': ('B', 'Depressão infantil e recuperação de problemas de aprendizagem'),
    '6970cd03-2d2a-4a25-832a-126281b04cac': ('D', 'Traqueíte bacteriana aguda agente etiológico S. aureus'),
    '83da23a1-10cd-46d6-b8c2-93f6add10646': ('B', 'Doença mão-pé-boca antitérmico VO e cuidados domiciliares'),
    '84c1efe7-78ee-45ef-9ec9-02513587aa9a': ('B', 'Estágios G2 G3 G4 de Tanner testículos comprimento e diâmetro peniano'),
    '88ac3fe3-70c3-4feb-acca-648407a0e0bd': ('D', 'Alimentação complementar necessidade de múltiplas exposições para aceitação'),
    '8f7ccd93-54be-401f-a1f9-5e3883f9e7d2': ('A', 'Acidente ofídico dor edema rápido equimoses e bolhas - Botrópico'),
    '9639f8e0-3b60-4874-ba6c-71f632b8bd3d': ('A', 'Síndrome nefrótica controle do edema restrição salina'),
    '97ea00b6-109f-4b27-9755-77bc15a4a331': ('C', 'Parto a fórceps braço aduzido em pronação paralisia de Erb-Duchenne'),
    'a12148f7-14ea-47ab-bb65-e5bc36fe2d0e': ('C', 'Caderneta da Criança alerta para o desenvolvimento e provável atraso'),
    'a6b0158e-47a7-44ce-a435-9fd6e76cdfea': ('C', 'Teste do coraçãozinho diferença 4% repetir em 1h e se persistir ECO'),
    'c738c5a8-3de5-4567-a720-2fec3786ff90': ('C', 'Varicela materna no 10o dia de vida cuidados de rotina e manter amamentação')
}

def apply_resolutions():
    print("="*80)
    print("HOMOLOGAÇÃO AMRIGS 2020 E 2021 (ACESSO DIRETO 100%)")
    print("="*80)

    files = [
        'data/clinica_medica_final_questions.json',
        'data/cirurgia_final_questions.json',
        'data/pediatria_final_questions.json',
        'data/ginecologia_final_questions.json',
        'data/medicina_preventiva_final_questions.json',
        'data/obstetricia_final_questions.json',
        'data/urologia_final_questions.json'
    ]

    total_2020 = 0
    total_2021 = 0

    for fpath in files:
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8') as fp:
            questions = json.load(fp)

        file_updated = 0
        for q in questions:
            qid = q.get('id')
            if qid in AMRIGS_2020_RESOLUTIONS:
                ans, topic = AMRIGS_2020_RESOLUTIONS[qid]
                q['correct_answer'] = ans
                q['correctAnswer'] = ans
                q['is_anulada'] = False
                q['isAnulada'] = False
                q['official_source'] = "Gabarito Oficial Definitivo AMRIGS / Fundatec 2020 (Concurso 594)"
                q['official_audit'] = {
                    'verified': True,
                    'institution': 'AMRIGS',
                    'year': 2020,
                    'topic': topic,
                    'official_answer': ans,
                    'source': 'Fundatec 594'
                }
                total_2020 += 1
                file_updated += 1
            elif qid in AMRIGS_2021_RESOLUTIONS:
                ans, topic = AMRIGS_2021_RESOLUTIONS[qid]
                q['correct_answer'] = ans
                q['correctAnswer'] = ans
                q['is_anulada'] = False
                q['isAnulada'] = False
                q['official_source'] = "Gabarito Oficial Definitivo AMRIGS / Fundatec 2021 (Concurso 647)"
                q['official_audit'] = {
                    'verified': True,
                    'institution': 'AMRIGS',
                    'year': 2021,
                    'topic': topic,
                    'official_answer': ans,
                    'source': 'Fundatec 647'
                }
                total_2021 += 1
                file_updated += 1

        if file_updated > 0:
            with open(fpath, 'w', encoding='utf-8') as fp:
                json.dump(questions, fp, ensure_ascii=False, indent=2)
            print(f"Atualizado: {fpath} ({file_updated} questões homologadas)")

    print(f"\nTOTAL HOMOLOGADO AMRIGS 2020: {total_2020}/48")
    print(f"TOTAL HOMOLOGADO AMRIGS 2021: {total_2021}/44")
    print(f"TOTAL GERAL HOMOLOGADO: {total_2020 + total_2021}/92 questões")

if __name__ == '__main__':
    apply_resolutions()
