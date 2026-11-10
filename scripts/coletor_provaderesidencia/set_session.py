import sys
import re
import os

CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.py')

def parse_cookie_string(raw):
    cookies = {}
    for part in raw.split(';'):
        if '=' in part:
            k, v = part.strip().split('=', 1)
            cookies[k.strip()] = v.strip()
    return cookies

def update_config(sessionid, csrftoken=None, cf_clearance=None):
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    if sessionid:
        content = re.sub(r"'sessionid':\s*'.*?'", f"'sessionid': '{sessionid}'", content)
    if csrftoken:
        content = re.sub(r"'csrftoken':\s*'.*?'", f"'csrftoken': '{csrftoken}'", content)
    if cf_clearance:
        content = re.sub(r"'cf_clearance':\s*'.*?'", f"'cf_clearance': '{cf_clearance}'", content)

    with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print("===============================================================")
    print("✅ CREDENCIAIS ATUALIZADAS COM SUCESSO EM config.py!")
    print(f"🔑 sessionid: {sessionid[:25]}... (len={len(sessionid)})")
    if csrftoken:
        print(f"🛡️ csrftoken: {csrftoken[:15]}...")
    if cf_clearance:
        print(f"☁️ cf_clearance: {cf_clearance[:15]}...")
    print("===============================================================")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python scripts/coletor_provaderesidencia/set_session.py \"sessionid=...; csrftoken=...; cf_clearance=...\"")
        print("ou:")
        print("  python scripts/coletor_provaderesidencia/set_session.py <sessionid> [csrftoken] [cf_clearance]")
        sys.exit(1)

    arg = sys.argv[1].strip()
    if ';' in arg or '=' in arg:
        cookies = parse_cookie_string(arg)
        sessionid = cookies.get('sessionid')
        csrftoken = cookies.get('csrftoken')
        cf_clearance = cookies.get('cf_clearance')
        if not sessionid:
            print("❌ Erro: 'sessionid' não encontrado na string de cookies fornecida.")
            sys.exit(1)
        update_config(sessionid, csrftoken, cf_clearance)
    else:
        sessionid = arg
        csrftoken = sys.argv[2] if len(sys.argv) > 2 else None
        cf_clearance = sys.argv[3] if len(sys.argv) > 3 else None
        update_config(sessionid, csrftoken, cf_clearance)
