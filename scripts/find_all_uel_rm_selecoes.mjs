import https from 'https';
import fs from 'fs';

async function checkSelecao(id) {
  return new Promise(resolve => {
    const postData = `action=gerarDetalhesSelecao&Selecao=${id}`;
    const req = https.request('https://www.cops.uel.br/v2/Selecao/execute/', {
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const html = json.mensagem || '';
          if (html.match(/RESID.*?NCIA\s+M.*?DICA/i)) {
            const titleMatch = html.match(/SELEÇÃO PÚBLICA[^\<]+/i) || 
                               html.match(/SELE&Ccedil;&Atilde;O P&Uacute;BLICA[^\<]+/i) ||
                               html.match(/PROGRAMA DE RESID[^\<]+/i);
            const title = titleMatch ? titleMatch[0].replace(/&[a-zA-Z]+;/g, ' ').replace(/\s+/g, ' ').trim() : `Seleção ${id}`;
            resolve({ id, title, html });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('🔍 Varrendo IDs de seleção na COPS UEL com regex flexível...');
  const found = [];

  // Testa IDs de 415 para trás (cobrir anos recentes)
  for (let id = 415; id >= 200; id--) {
    const res = await checkSelecao(id);
    if (res) {
      console.log(`  🎯 Encontrada Seleção ${res.id}: ${res.title}`);
      
      // Procura links de download
      const regex = /href=(https:\/\/www\.cops\.uel\.br\/v2\/download\.php\?Acesso=[^ >]+)[^>]*>([^<]+)/gi;
      let m;
      const docs = [];
      while ((m = regex.exec(res.html)) !== null) {
        const link = m[1];
        const docTitle = m[2].replace(/&[a-zA-Z]+;/g, ' ').replace(/\s+/g, ' ').trim();
        if (docTitle.toLowerCase().includes('prova') || docTitle.toLowerCase().includes('gabarito')) {
          console.log(`     📄 ${docTitle}`);
          docs.push({ docTitle, link });
        }
      }
      found.push({ id: res.id, title: res.title, docs });
    }
  }

  fs.writeFileSync('data/cops_uel_residencia_all.json', JSON.stringify(found, null, 2), 'utf8');
  console.log(`\nSalvo em data/cops_uel_residencia_all.json (${found.length} seleções encontradas)`);
}

run();
