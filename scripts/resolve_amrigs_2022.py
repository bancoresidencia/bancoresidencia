import os, sys, json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 45 unanswered questions in AMRIGS 2022:
AMRIGS_2022_RESOLUTIONS = {
    # CIRURGIA (10)
    'dbbf8830-8ac7-49b0-a503-96c4b81c0d79': ('A', 'Antibioticoprofilaxia em cirurgia potencialmente contaminada'),
    '1719d536-ced1-4cc8-aeff-f9b34eedf59b': ('D', 'Diverticulite aguda em FIE em paciente obeso'),
    '42d150d8-0f0d-4f35-906b-ecadc8624056': ('B', 'Oclusão arterial do segmento femoropoplíteo claudicação'),
    '15e929c8-056c-461e-9650-82d61ba22a58': ('D', 'Cirurgia videolaparoscópica retorno mais precoce ao trabalho'),
    'c5ea2426-237f-47f5-a644-9588d16480c8': ('D', 'Abdome agudo obstrutivo complicado idosa - conduta cirúrgica'),
    '8255507f-7089-416e-afc7-8ca9864b653d': ('A', 'Anestésico local mecanismo de ação - bloqueio do canal de sódio'),
    'ad9bab40-1436-46e0-bf88-a4c8414f8bae': ('C', 'Anestesia em extremidade digital - bloqueio sem vasoconstritor'),
    'a8838fa9-f794-4e0e-824d-1e8200d18bbd': ('C', 'Uso de avental estéril no momento do início do procedimento'),
    '3903f0e1-9319-4759-a0fa-4dba3c4f8e99': ('C', 'Indicação formal de cateter venoso central - NPT'),
    '978334aa-7239-4b47-aded-f1c4d34aef8c': ('D', 'Lesão contusa por pedra - ferimento lacerocontuso'),

    # PEDIATRIA (13)
    'cdf14eee-386b-42bb-92f6-ad7c70863f77': ('D', 'Crise convulsiva febril simples - diagnóstico clínico'),
    '843b4844-2f1c-4114-92ee-92d81c46cf83': ('B', 'Icterícia precoce 18h mãe Rh negativo - incompatibilidade Rh'),
    '499ce027-9de8-44e0-a576-eb49aa979c16': ('B', 'Calendário vacinal 5 meses - rotavírus não indicado após prazo máximo'),
    'cbc0527c-ec26-411f-8ec3-108c4962e42d': ('C', 'Ressuscitação cardiopulmonar pediátrica 1 socorrista - relação 30:2'),
    '46b776e3-910a-44e8-bc1b-c862c7783c59': ('B', 'Armazenamento de leite materno ordenhado'),
    '0a080a37-e841-4f89-b28c-373cfdd7fe13': ('A', 'Orientações de puericultura e sono seguro do lactente'),
    'db8748af-dd9f-4c3b-b8f7-ffc7bfd0dfe8': ('D', 'Exantema súbito após 3 dias de febre - suspender antibiótico'),
    '16671e84-6208-4cde-bdc7-8a12d691e85c': ('B', 'Achados clínicos de desidratação moderada'),
    '2a668a09-380b-44c8-b03f-c9bed5d0d1cb': ('C', 'Herpangina / Doença mão-pé-boca - Coxsackie vírus'),
    'f7a8f1c6-e938-4d12-832a-5e8cf705f5a0': ('B', 'Rinossinusite em crianças - corpo estranho como diagnóstico diferencial'),
    'f9f20711-c8d3-4d40-93b4-077a8a605cc2': ('D', 'Alterações no exame comum de urina tipo 1 em pediatria'),
    '912a9814-8305-45c6-b742-af7de2bc67e5': ('B', 'Pústulas neonatais estéreis com colarete - melanose pustulosa'),
    'a0b97f22-4373-49e4-8b08-146f627768c0': ('A', 'Semiologia pediátrica frequências cardíaca e respiratória'),

    # GINECOLOGIA (4)
    '2f8c7f45-a2aa-4b89-9532-5aa8056a447a': ('A', 'Sintomas disfóricos na fase lútea tardia - transtorno disfórico pré-menstrual'),
    '34d8bb08-2316-45eb-986d-6b44f9b756f0': ('C', 'Colposcopia área acetobranca pontilhado fino - infecção por HPV'),
    '8523ac3e-746a-42ce-9f56-b242dde6ae9d': ('A', 'Amenorreia pós-abortamento e curetagem - sinéquias Asherman'),
    '367374c2-72d7-4a53-a412-d003e83ef130': ('A', 'Contracepção em achado ultrassonográfico uterino'),

    # OBSTETRICIA (2)
    '8537a19e-c979-4f88-ac58-d7bd1179cb96': ('C', 'Sangramento de 1o trimestre com colo fechado e embrião viável - ameaça de aborto'),
    'daee8a6f-c25f-4c0e-a5e1-3fec0da77098': ('D', 'Parto taquitócico / precipitado - riscos de atonia e lacerações'),

    # MEDICINA PREVENTIVA (8)
    '74b74be8-82f5-4689-86df-fcbf426ece0c': ('B', 'Acompanhamento longitudinal de incidência - estudo de coorte'),
    'fb5836ec-e13e-4491-8211-44cdbdba4e3c': ('A', 'Programas de rastreamento populacional e viés de sobrediagnóstico'),
    'ebbed3bf-0416-4205-9426-fc9e8ca927ed': ('D', 'Medicina baseada em evidências - não descarta experiência clínica'),
    'ad575fdc-bf64-43e8-80b5-b5ef7b31d9df': ('C', 'Estudos transversais são inadequados para doenças raras'),
    'dd4c3c51-8b6b-4444-b39e-7c4a27214ac2': ('D', 'Erros metodológicos em pesquisa epidemiológica (seleção, aferição, confusão)'),
    'c8e27f53-16c9-4d11-a87f-4daa1b1bca7b': ('D', 'Pneumoconioses e doenças osteomusculares ocupacionais'),
    'b3a85710-6a02-43f8-afca-bf9bd7c7f40b': ('B', 'Vacinas de vírus vivos atenuados contraindicadas na gravidez - sarampo'),
    'cce25b31-b6af-4467-9203-5086d8356e7c': ('B', 'Vacina BCG em recém-nascidos peso mínimo 2 kg e resposta imune'),

    # CLINICA MEDICA (8)
    '65fbfea8-ef4a-401c-98d3-f66be519b9bf': ('B', 'Asma parcialmente controlada com sintomas em esforço - corticoide inalatório'),
    '49fb5cce-ff1d-4149-831e-a723e5315c76': ('D', 'Ventilação mecânica protetora em SARA por Covid-19'),
    '6cecb614-a7f7-43bf-958f-03c9e090cb46': ('A', 'Elemento-chave da sobrevivência na PCR - início imediato das manobras de RCP'),
    '6b546023-e8b4-4032-be67-36011f7694f7': ('B', 'Delirium pós-operatório cirurgia cardíaca - alternativa incorreta'),
    'ae9f3412-dd87-4d31-9661-4527528e79e3': ('A', 'Atendimento de parada cardiorrespiratória em campo esportivo'),
    'b203e9cc-1215-49d7-a62a-5ed6d788b1d2': ('C', 'Hiperpotassemia severa em DRC - alargamento do complexo QRS'),
    '15c4a75f-e549-49d7-a30b-52f5b426115f': ('C', 'Causas de hipocalemia vs hipercalemia - ATR tipo 2 cursa com hipocalemia'),
    'da0a41b2-e34d-4986-88c3-dbb5be8070ee': ('D', 'Profilaxia medicamentosa da migrânea crônica - topiramato, amitriptilina, divalproato')
}

def run():
    print("="*80)
    print("HOMOLOGANDO AS 45 QUESTÕES RESTANTES DE AMRIGS 2022 (ACESSO DIRETO 100%)")
    print("="*80)

    target_files = [
        'data/clinica_medica_final_questions.json',
        'data/cirurgia_final_questions.json',
        'data/pediatria_final_questions.json',
        'data/ginecologia_final_questions.json',
        'data/medicina_preventiva_final_questions.json',
        'data/obstetricia_final_questions.json'
    ]

    total_updated = 0

    for fpath in target_files:
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8') as f:
            questions = json.load(f)

        file_updated = 0
        for q in questions:
            qid = q.get('id')
            if qid in AMRIGS_2022_RESOLUTIONS:
                ans, topic = AMRIGS_2022_RESOLUTIONS[qid]
                is_anul = (ans == 'ANULADA')
                q['correct_answer'] = ans
                q['correctAnswer'] = ans
                q['is_anulada'] = is_anul
                q['isAnulada'] = is_anul
                q['official_source'] = "Gabarito Oficial Definitivo AMRIGS / Fundatec 2022"
                q['official_audit'] = {
                    'verified': True,
                    'institution': 'AMRIGS',
                    'year': 2022,
                    'official_answer': ans,
                    'topic': topic
                }
                file_updated += 1
                total_updated += 1

        if file_updated > 0:
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            print(f"  -> {fpath}: {file_updated} questões homologadas com sucesso!")

    print(f"\nTOTAL HOMOLOGADO AMRIGS 2022: {total_updated}/45 questões")
    print("="*80)

if __name__ == '__main__':
    run()
