import os
import json
import re
import unicodedata
from .config import QUESTION_FILES, DATA_DIR
from .db import record_match, save_nova_questao

def norm_hash(text):
    if not text:
        return ''
    # Remove acentos
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    # Minúsculas
    text = text.lower()
    # Apenas alfanuméricos
    text = re.sub(r'[^a-z0-9]', ' ', text)
    # Colapsa espaços
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:90]

def norm_hash_long(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn').lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:200]

class BankMatcher:
    def __init__(self):
        self.inventory = self._load_inventory()
        self.user_questions = {}      # {especialidade: list_of_questions}
        self.missing_index = {}       # {norm_hash: [(esp, index, q_obj)]}
        self.total_loaded = 0
        self.total_missing = 0
        self.dirty_specialties = set()
        self.matches_count = 0
        self._load_user_bank()

    def _load_inventory(self):
        inv_path = os.path.join(DATA_DIR, 'all_institutions_inventory.json')
        if os.path.exists(inv_path):
            try:
                with open(inv_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return [i['name'] for i in data]
            except Exception as e:
                print(f"Aviso ao carregar inventário de instituições: {e}")
        return []

    def match_institution(self, raw_name):
        if not raw_name:
            return None
        raw_clean = re.sub(r'[^a-zA-Z0-9]', '', raw_name).upper()
        if not raw_clean:
            return None
            
        # Mapeamentos diretos conhecidos para precisão máxima
        direct_map = {
            'ABC': 'Centro Universitário FMABC',
            'CERMAM': 'CERMAM - Comissão Estadual de Residência Médica do Amazonas',
            'AMRIGS': 'AMRIGS - Associação Médica do Rio Grande do Sul',
            'ENARE': 'ENARE/ENAMED',
            'SUS-SP': 'SUS-SP - Sistema Único de Saúde de São Paulo',
            'SUSSP': 'SUS-SP - Sistema Único de Saúde de São Paulo',
            'USP': 'USP/HCFMUSP - Hospital das Clínicas da FMUSP (SP)',
            'USP-RP': 'USP/HCRP - Hospital das Clínicas de Ribeirão Preto (SP)',
            'UNIFESP': 'UNIFESP/EPM - Universidade Federal de São Paulo - Escola Paulista de Medicina (SP)',
            'UNICAMP': 'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)',
            'UEL': 'UEL - Hospital Universitário de Londrina (PR)',
            'SES-PE': 'SES-PE - Secretaria de Estado de Saúde de Pernambuco',
            'SESPE': 'SES-PE - Secretaria de Estado de Saúde de Pernambuco',
            'SES-DF': 'SES-DF - Secretaria de Estado de Saúde do Distrito Federal',
            'SESDF': 'SES-DF - Secretaria de Estado de Saúde do Distrito Federal',
            'SES-GO': 'SES-GO - Secretaria de Estado de Saúde de Goiás',
            'SESGO': 'SES-GO - Secretaria de Estado de Saúde de Goiás',
            'SES-SC': 'SES-SC - Secretaria de Estado da Saúde de Santa Catarina',
            'SESSC': 'SES-SC - Secretaria de Estado da Saúde de Santa Catarina',
            'SES-RJ': 'SES-RJ - Secretaria de Estado de Saúde do Rio de Janeiro',
            'SESRJ': 'SES-RJ - Secretaria de Estado de Saúde do Rio de Janeiro',
            'SES-PB': 'SES-PB - Secretaria de Estado de Saúde da Paraíba',
            'SESPB': 'SES-PB - Secretaria de Estado de Saúde da Paraíba',
            'UERJ': 'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)',
            'UFRJ': 'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)',
            'UNESP': 'UNESP/HCFMB - Hospital das Clínicas de Botucatu (SP)',
            'AMP': 'AMP - Associação Médica do Paraná',
            'IAMSPE': 'IAMSPE/HSPE - Instituto de Assistência Médica ao Servidor Público - Hospital do Servidor (SP)',
            'FMJ': 'HU-FMJ - Hospital Universitário da Faculdade de Medicina de Jundiaí (SP)',
            'HIAE': 'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)',
            'EINSTEIN': 'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)',
            'INEP': 'INEP Revalida - Exame Nacional de Revalidação de Diplomas Médicos',
            'REVALIDA': 'INEP Revalida - Exame Nacional de Revalidação de Diplomas Médicos'
        }

        if raw_name.upper().strip() in direct_map:
            return direct_map[raw_name.upper().strip()]

        for name in self.inventory:
            name_clean = re.sub(r'[^a-zA-Z0-9]', '', name).upper()
            if raw_clean == name_clean or raw_clean in name_clean or name_clean.startswith(raw_clean):
                return name
        return None

    def _load_user_bank(self):
        print("Indexando questões do banco do usuário que necessitam de gabarito...")
        # Carrega gabaritos históricos homologados do SQLite (drive_matches e matches_banco)
        sql_matches = {}
        try:
            from .db import get_connection
            conn = get_connection()
            c = conn.cursor()
            for qid, gab in c.execute("SELECT questao_banco_id, gabarito FROM drive_matches WHERE questao_banco_id IS NOT NULL AND gabarito IS NOT NULL"):
                if gab and gab.strip():
                    sql_matches[qid] = gab.strip().upper()
            for qid, gab in c.execute("SELECT questao_banco_id, gabarito FROM matches_banco WHERE questao_banco_id IS NOT NULL AND gabarito IS NOT NULL"):
                if gab and gab.strip():
                    sql_matches[qid] = gab.strip().upper()
            conn.close()
            print(f"Carregados {len(sql_matches):,} gabaritos homologados históricos do SQLite.")
        except Exception as e:
            print(f"Aviso ao consultar gabaritos do SQLite: {e}")

        for esp, filepath in QUESTION_FILES.items():
            if not os.path.exists(filepath):
                continue
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    questions = json.load(f)
                    self.user_questions[esp] = questions
                    self.total_loaded += len(questions)

                    for idx, q in enumerate(questions):
                        qid = q.get('id')
                        if qid and qid in sql_matches:
                            gab = sql_matches[qid]
                            if gab in ['!', 'X', 'ANULADA', '*', '#']:
                                q['isAnulada'] = True
                                q['is_anulada'] = True
                                q['correctAnswer'] = 'ANULADA'
                                q['correct_answer'] = 'ANULADA'
                            else:
                                q['correctAnswer'] = gab
                                q['correct_answer'] = gab
                                q['isAnulada'] = False
                                q['is_anulada'] = False

                        ans = (q.get('correctAnswer') or q.get('correct_answer') or '').strip()
                        is_anulada = bool(q.get('isAnulada') or q.get('is_anulada'))
                        
                        # Indexa se não tiver gabarito preenchido
                        if not ans and not is_anulada:
                            self.total_missing += 1
                            stmt = q.get('statement') or q.get('enunciado') or ''
                            h = norm_hash(stmt)
                            if len(h) >= 20:
                                if h not in self.missing_index:
                                    self.missing_index[h] = []
                                self.missing_index[h].append((esp, idx, q))
            except Exception as e:
                print(f"Erro ao carregar {filepath}: {e}")

        print(f"Total de questões no banco: {self.total_loaded:,} | Pendentes de gabarito: {self.total_missing:,} | Chaves indexadas: {len(self.missing_index):,}")

    def process_collected_question(self, q_data, prova_meta):
        """
        Verifica se a questão coletada pertence ao banco do usuário:
        - Se SIM: Adiciona o gabarito à questão existente sem criar duplicatas.
        - Se NÃO: Salva na tabela novas_questoes_categorizadas com a instituição mapeada.
        """
        statement = q_data.get('enunciado') or ''
        gabarito = q_data.get('gabarito_oficial') or ''
        is_anulada = bool(q_data.get('is_anulada'))
        
        if not gabarito and not is_anulada:
            return False

        h = norm_hash(statement)
        matched_any = False

        if h and h in self.missing_index:
            candidates = self.missing_index[h]
            for esp, idx, bank_q in candidates:
                # Confirmação adicional de segurança
                bank_ans = (bank_q.get('correctAnswer') or bank_q.get('correct_answer') or '').strip()
                if not bank_ans:
                    # Injeta o gabarito sem alterar nenhuma outra propriedade
                    if is_anulada:
                        bank_q['isAnulada'] = True
                        bank_q['is_anulada'] = True
                        bank_q['correct_answer'] = 'ANULADA'
                        bank_q['correctAnswer'] = 'ANULADA'
                    else:
                        bank_q['correctAnswer'] = gabarito
                        bank_q['correct_answer'] = gabarito
                        bank_q['is_anulada'] = False
                        bank_q['isAnulada'] = False
                    
                    self.dirty_specialties.add(esp)
                    self.matches_count += 1
                    matched_any = True

                    # Grava auditoria do casamento
                    record_match({
                        'questao_banco_id': bank_q.get('id') or f"{esp}_{idx}",
                        'especialidade': esp,
                        'questao_provaderesidencia_id': q_data['id'],
                        'prova_id': q_data['prova_id'],
                        'instituicao': prova_meta.get('instituicao_banco') or prova_meta.get('instituicao_raw'),
                        'ano': prova_meta.get('ano'),
                        'numero_questao': q_data.get('numero'),
                        'gabarito': 'ANULADA' if is_anulada else gabarito,
                        'match_hash': h
                    })
                    break

        if not matched_any:
            # Não faz parte do banco existente -> categoriza e salva como nova questão
            save_nova_questao({
                'id': q_data['id'],
                'prova_id': q_data['prova_id'],
                'instituicao_banco': prova_meta.get('instituicao_banco'),
                'instituicao_raw': prova_meta.get('instituicao_raw'),
                'uf': prova_meta.get('uf'),
                'ano': prova_meta.get('ano'),
                'modalidade': prova_meta.get('modalidade'),
                'numero': q_data.get('numero'),
                'enunciado': statement,
                'imagem_url': q_data.get('imagem_url'),
                'opcoes_json': q_data.get('opcoes_json'),
                'gabarito_oficial': 'ANULADA' if is_anulada else gabarito
            })

        return matched_any

    def flush_updates(self):
        """Salva com segurança atômica os arquivos JSON das especialidades alteradas"""
        if not self.dirty_specialties:
            return 0
            
        saved_count = 0
        for esp in list(self.dirty_specialties):
            filepath = QUESTION_FILES.get(esp)
            if not filepath or esp not in self.user_questions:
                continue
                
            tmp_path = f"{filepath}.tmp"
            try:
                with open(tmp_path, 'w', encoding='utf-8') as f:
                    json.dump(self.user_questions[esp], f, ensure_ascii=False, indent=2)
                # Substituição atômica no Windows
                if os.path.exists(filepath):
                    os.replace(tmp_path, filepath)
                else:
                    os.rename(tmp_path, filepath)
                saved_count += 1
            except Exception as e:
                print(f"Erro ao salvar atualizações de {esp}: {e}")
                if os.path.exists(tmp_path):
                    try: os.remove(tmp_path)
                    except: pass

        self.dirty_specialties.clear()
        return saved_count
