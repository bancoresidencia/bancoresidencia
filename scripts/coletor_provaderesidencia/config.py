import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')
STATUS_FILE = os.path.join(DATA_DIR, 'coleta_provaderesidencia_status.json')
LOG_FILE = os.path.join(DATA_DIR, 'coleta_provaderesidencia.log')

# Sessão autenticada ativa no Chromium (Plano GRATUITO até 22/10/2026)
COOKIES = {
    'sessionid': '.eJxVjDkOwjAUBe_iGlnenVDScwbrLzYOIEeKkwpxd4iUAto3M-8lEmxrTVvPS5pYnIWLWg3i9Lsj0CO3HfId2m2WNLd1mVDuijxol9eZ8_NyuH8HFXr91h5QkSYLDnPAMUKwCKOL3qDSDCYy2-w9l-INa1OsQ4pYCOKQOTgr3h-dFDmx:1xHUc8:2pInqEwVXt982s6si648MntLcVi7MgIyEmG9TBWdcw4',
    'csrftoken': 'AwVZsJBC7lWmlpKtUVu3ZOJy1UCOpI1J',
    'cf_clearance': 'cwMcOUhz2mRLBbtDF760Il6xkGRWipArPB0wt5QXYPk-1792106276-1.2.1.1-om1JQdfQhj5b0os4f01pdvjgOwiLIwHqEhDVEdZr3HC10IsxALveFgkPzGG8t92F8pzIsCYXKZLoo3T1q_T5PLz5Be4S1HKWXjgpQrOzMxIfb.ToM482eRZsXh8bIR6ML6FmJbbg1HiarOfHFx8d0mCeK3XBAMC5P81BNR9Ni87tQ_HFG3LklNl9HuAVjLZ31E.8a.cJsjxj9X2ef4WPRAojGERbu3el.8tbpLdBHRkaCGAwKM5PFyx6pZa6_yr89kx6_RZ5S676mB1URsLI4rPrKHzgTSa32ZZerC0arGMpZf.68Xku_Viw1N0s5ix7QJfL0gUNJ3GODdMe.wTbTDyVXZ595lWKXjTzMtoVgCY'
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://provaderesidencia.com.br/premium/banco-de-provas'
}

URL_BANCO_PROVAS = 'https://provaderesidencia.com.br/premium/banco-de-provas'
URL_BASE_PROVA = 'https://provaderesidencia.com.br/premium/prova/{id}/'
URL_BASE_QUESTAO = 'https://provaderesidencia.com.br/premium/questao/{id}/'

# Arquivos de questões do banco do usuário para sincronização e atualização de gabaritos
QUESTION_FILES = {
    'urologia': os.path.join(DATA_DIR, 'urologia_final_questions.json'),
    'ginecologia': os.path.join(DATA_DIR, 'ginecologia_final_questions.json'),
    'cirurgia': os.path.join(DATA_DIR, 'cirurgia_final_questions.json'),
    'obstetricia': os.path.join(DATA_DIR, 'obstetricia_final_questions.json'),
    'pediatria': os.path.join(DATA_DIR, 'pediatria_final_questions.json'),
    'medicina_preventiva': os.path.join(DATA_DIR, 'medicina_preventiva_final_questions.json'),
    'clinica_medica': os.path.join(DATA_DIR, 'clinica_medica_final_questions.json')
}
