import os, sys, json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

UNESP_2023_MAP = {
    # Clinica Medica (13)
    '78cea6c3-cf6e-4b09-ad39-89638be106d5': ('C', 8, 'Derrame parapneumônico complicado - drenagem torácica'),
    '8df037f5-2abd-4346-b903-bc70f42c72f7': ('C', 9, 'DPOC pós-exacerbação - associar tiotrópio (LAMA)'),
    'f49f469b-a17f-459d-8d29-8d16acbc9f3b': ('B', 10, 'Asma leve - budesonida + formoterol SOS'),
    '12846224-6721-46eb-b2e1-a85750d5ddd6': ('D', 11, 'Cirrose hepática ascite refratária - paracentese com reposição de albumina'),
    'c0f76e87-7fc8-42a8-b58a-0b6584b7864f': ('D', 12, 'TVP em anticoagulação com varfarina - ponte com heparina até INR alvo'),
    '3c66d5f2-a723-4869-a131-5c0ee24bf1b9': ('B', 13, 'Icterícia obstrutiva neoplasia periampular - TC abdome com contraste'),
    'b79b5cbf-3d65-4ee5-a393-cb08c9ddfc7f': ('D', 14, 'Profilaxia de endocardite infecciosa em procedimento dentário - Amoxicilina'),
    '3e3db12e-0e6d-47c2-be1e-fb9f1a9a2667': ('C', 15, 'Estado hiperosmolar hiperglicêmico - hidratação venosa cristaloide'),
    '28b8351b-53d7-4ea4-a5a7-c22f3d19af60': ('D', 16, 'Emergências hipertensivas - lesão aguda de órgão-alvo'),
    'e5b2b59b-bceb-47d3-b41f-3673c303c9e2': ('C', 17, 'Tuberculose pulmonar cavitária - necrose caseosa'),
    '93647e70-7e7e-4394-bcf5-68bfb68e7150': ('C', 18, 'Esclera azul - osteogênese imperfeita'),
    '650e274d-795f-4f30-9d66-1e74f8d7c3dc': ('A', 19, 'Oxigenoterapia em insuficiência respiratória - máscara de Venturi'),
    '5911ba4d-4a71-4642-aaae-385768438bea': ('D', 20, 'Úlcera mucosa intranasal rural - leishmaniose tegumentar'),

    # Cirurgia (7)
    'f06b3ff2-84c0-4fa7-a76c-043395be0063': ('C', 23, 'Hemorroidas grau IV - tratamento cirúrgico'),
    '1b0102bc-28fe-4f3e-aec6-4c4bfcdc47c9': ('B', 29, 'Hérnias inguinocrurais - técnica videolaparoscópica com prótese'),
    '619e0ff8-aced-4901-b9fc-e02547779356': ('A', 22, 'Aneurisma de aorta abdominal roto com choque - laparotomia imediata'),
    'c2c4d5a7-66e8-49f5-b9d1-5b14941e436d': ('A', 28, 'Anestesia infiltrativa lidocaína 2% 70kg - dose máxima 17,5 ml'),
    '3f41dcf1-2cdc-42fe-9415-a2a0b116a869': ('B', 34, 'Colecistite aguda litiásica em criança - internação e hidratação/antibiótico'),
    'd5debd3c-abb6-4059-862a-5975dd73c326': ('B', 30, 'Trauma ocular perfurante por arame - jejum, curativo oclusivo e avaliação oftalmo'),
    '7c2ab584-ab5f-4882-886c-8ed7fc7f8fbc': ('D', 27, 'Anatomia vascular abdominal - veia mesentérica inferior drena na veia esplênica'),

    # Pediatria (6)
    '8a5ff52c-a5dc-4535-bf16-447dfa9d2651': ('A', 56, 'Bronquiolite viral aguda - sintomas gastrintestinais vômito/diarreia associados'),
    '12766fb1-229e-4241-aca8-b948e5a49540': ('D', 51, 'Hipotireoidismo congênito PCDT MS 2021 - reavaliação de prematuros extremos/MBP'),
    '9625a00e-2673-4e68-9157-45bff3c87a9a': ('B', 52, 'Hiperbilirrubinemia neonatal significante - história de irmão com fototerapia'),
    '5dca39de-d7a5-462c-89e0-0a0ccbdd357d': ('A', 53, 'RN 9 dias com esforço e gemência - internação, jejum, monitorização e HV'),
    '1fffa15a-4a81-40da-b5ad-cf3848f6e224': ('A', 58, 'ECG em criança de 1 ano assintomática - arritmia sinusal respiratória fisiológica'),
    'a4b783ae-9bfd-49d1-aba5-d0601aac4302': ('D', 54, 'Comunicação interatrial CIA - tipo ostium secundum na fossa oval'),

    # Medicina Preventiva (9)
    '546cb9bf-6d33-4b9d-b9d0-1996be278d38': ('D', 81, 'Princípios do SUS Lei 8080 art 7 - descentralização político-administrativa'),
    '53ef077e-e199-4634-a5a5-955457a97ad3': ('D', 82, 'Ensaio clínico randomizado - randomização controla confundimento'),
    'f4575c9b-a558-4baf-be20-9f387e8dbf91': ('B', 84, 'Ensaio clínico de fase IV - farmacovigilância e detecção de novas RAMs'),
    '3e32eb7a-c9bf-4193-a877-8f7961f2ef97': ('C', 83, 'Dieta mediterrânea e AVC acompanhamento temporal - estudo de coorte'),
    '1cc58322-539c-40de-ad00-82039998a444': ('C', 87, 'Vacinas covid-19 - esquemas heterólogos de reforço'),
    '7d8ab0a0-dbf1-4484-bb9e-421ab8334fee': ('B', 89, 'Dispositivos eletrônicos para fumar DEFs - risco de tabagismo em não fumantes'),
    'd0835846-f89a-451e-a0e5-28f5ee993ba2': ('A', 85, 'Covid-19 em profissionais de saúde - jornada exaustiva, privação sono e burnout'),
    '5d62a330-8a56-48cd-937a-94502148dee1': ('C', 90, 'Estudo de agregado populacional municípios Lancet - estudo ecológico'),
    'fa9649be-fbee-4c17-afd5-e3817298b018': ('A', 86, 'Evolução Covid-19 Ômicron países 1 e 2 - cobertura alta vs baixa'),

    # Obstetricia (3)
    'b4aea96a-ec6c-434d-a786-ea97858a775d': ('C', 74, 'Pré-eclâmpsia grave iminente - sulfato de magnésio e hidralazina IV'),
    '3faa4d96-ba65-42bc-b6a5-13b21f0dc775': ('A', 75, 'Parturiente multípara expulsivo há 30 min sem distócia - aguardar evolução'),
    'fc30b941-624a-4488-b0aa-7cc5dbc81698': ('A', 79, 'Gestante 20 sem AgHBs negativo sem comprovação vacinal - iniciar vacinação hepatite B')
}

def run():
    print("="*80)
    print("RESOLVENDO 38 QUESTÕES PENDENTES - UNESP BOTUCATU 2023 (100% GABARITO OFICIAL)")
    print("="*80)

    target_files = [
        'data/clinica_medica_final_questions.json',
        'data/cirurgia_final_questions.json',
        'data/pediatria_final_questions.json',
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
            if qid in UNESP_2023_MAP:
                ans, qnum, desc = UNESP_2023_MAP[qid]
                q['correct_answer'] = ans
                q['correctAnswer'] = ans
                q['is_anulada'] = False
                q['isAnulada'] = False
                q['official_source'] = f"Gabarito Oficial Definitivo UNESP Botucatu 2023 Questão {qnum}"
                q['official_audit'] = {
                    'verified': True,
                    'institution': 'UNESP Botucatu',
                    'year': 2023,
                    'question_number': qnum,
                    'official_answer': ans,
                    'topic': desc
                }
                file_updated += 1
                total_updated += 1

        if file_updated > 0:
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            print(f"  -> {fpath}: {file_updated} questões homologadas com sucesso!")

    print(f"\nTOTAL HOMOLOGADO UNESP BOTUCATU 2023: {total_updated}/38 questões")
    print("="*80)

if __name__ == '__main__':
    run()
