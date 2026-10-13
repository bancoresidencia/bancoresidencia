import os
import time
import requests
import urllib3
from ..db.database import compute_sha256

urllib3.disable_warnings()

class DocumentDownloader:
    def __init__(self, output_base_dir="data/official_exams"):
        self.output_base_dir = output_base_dir
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        })
        self.session.verify = False

    def download_document(self, url, subfolder, preferred_filename=None, max_retries=3):
        """
        Baixa o documento idempotentemente. Retorna dict com:
        {
          'sucesso': bool,
          'caminho_local': str,
          'sha256': str,
          'tamanho_bytes': int,
          'ja_existia': bool,
          'erro': str
        }
        """
        dest_dir = os.path.join(self.output_base_dir, subfolder)
        os.makedirs(dest_dir, exist_ok=True)

        filename = preferred_filename or url.split('/')[-1].split('?')[0]
        if not filename.endswith('.pdf'):
            filename += '.pdf'
        dest_path = os.path.join(dest_dir, filename)

        # Se já existe no disco, calcula hash e valida
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
            file_hash = compute_sha256(dest_path)
            return {
                'sucesso': True,
                'caminho_local': dest_path,
                'sha256': file_hash,
                'tamanho_bytes': os.path.getsize(dest_path),
                'ja_existia': True,
                'erro': None
            }

        # Executa download com tentativas e backoff
        for attempt in range(1, max_retries + 1):
            try:
                r = self.session.get(url, timeout=20, stream=True)
                if r.status_code == 200:
                    with open(dest_path, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=65536):
                            if chunk:
                                f.write(chunk)
                    
                    file_size = os.path.getsize(dest_path)
                    if file_size < 500:
                        os.remove(dest_path)
                        raise ValueError(f"Arquivo corrompido ou vazio (tamanho: {file_size} bytes)")

                    file_hash = compute_sha256(dest_path)
                    return {
                        'sucesso': True,
                        'caminho_local': dest_path,
                        'sha256': file_hash,
                        'tamanho_bytes': file_size,
                        'ja_existia': False,
                        'erro': None
                    }
                else:
                    if attempt == max_retries:
                        return {
                            'sucesso': False,
                            'caminho_local': None,
                            'sha256': None,
                            'tamanho_bytes': 0,
                            'ja_existia': False,
                            'erro': f"HTTP {r.status_code}"
                        }
            except Exception as e:
                if attempt == max_retries:
                    return {
                        'sucesso': False,
                        'caminho_local': None,
                        'sha256': None,
                        'tamanho_bytes': 0,
                        'ja_existia': False,
                        'erro': str(e)
                    }
                time.sleep(2 * attempt)

        return {
            'sucesso': False,
            'caminho_local': None,
            'sha256': None,
            'tamanho_bytes': 0,
            'ja_existia': False,
            'erro': "Limite de tentativas excedido"
        }
