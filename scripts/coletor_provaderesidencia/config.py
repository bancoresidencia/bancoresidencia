import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'provaderesidencia_coleta.db')
STATUS_FILE = os.path.join(DATA_DIR, 'coleta_provaderesidencia_status.json')
LOG_FILE = os.path.join(DATA_DIR, 'coleta_provaderesidencia.log')

# Sessão autenticada ativa no Chromium (Plano GRATUITO até 22/10/2026)
COOKIES = {
    'sessionid': '.eJxVjDsOwjAQBe_iGlnxJ7s2JT1nsHb9wQHkSHFSIe4OkVJA-2bmvUSgba1h63kJUxJnYdFoK06_O1N85LbDdKd2m2Wc27pMLHdFHrTL65zy83K4fweVev3WyM4QsGLyxZnCjFi0A0Q1WF9GZZPOOmXFkWCAZCK4OGr2HoGdBSfeH4PaOI0:1xQSZA:reX8OnIcFpAqQLYrIqF1fVsCAuSGhv9to9hWUYzb83k',
    'csrftoken': 'PBzgjKxzTaVG6utOpqFNehA8a76sBVIz',
    'cf_clearance': 'CtmMXrHmx72cnPkgMBUA56UKuISkBkZDsoIv_opOW2RVTQO4nxyv_XHCiD7-zTDWiSSS0R5RD_JBfLKOH88yRRngtBUOEnb2edhAuyYQ63I2km5_Sna2KFkxRVaa4VdeMl1EHVlDLgu1mPIAsatvH_XDE_H60lggjIRExhLHlAayq1J4AL1OhJ843b5b4DHJf0N3PCsgQB9a2WqIk9yVsqfxI-ZtQVQ3YwAaZpUhgde26Pu3IQJZPZeQlqaGdpL8d5-CPjb1vb5Zidwaid2bQ0Ws4dmMm0JcV5ShmXxQ3JhGn19rKXTsCiuctzwlQ6w3_nCkBntjiTdacw'
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
