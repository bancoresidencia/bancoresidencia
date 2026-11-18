import re

def test_match(pattern, text):
    return bool(re.search(rf'\b{pattern}\b', text, re.IGNORECASE))

print("Teste 'iam' em 'estadiamento':", test_match('iam', 'estadiamento')) # deve ser False
print("Teste 'iam' em 'IAM com supra':", test_match('iam', 'IAM com supra')) # deve ser True
print("Teste 'trn' em 'ttrn':", test_match('trn', 'ttrn')) # deve ser False
print("Teste 'pac' em 'participacao':", test_match('pac', 'participacao')) # deve ser False
print("Teste 'pac' em 'PAC grave':", test_match('pac', 'PAC grave')) # deve ser True
