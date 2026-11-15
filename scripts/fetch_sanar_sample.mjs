import fs from 'fs';

async function fetchSanarPage() {
  const url = 'https://sanarmed.com/q/alem-da-triagem-especifica-por-meio-do-m-chat-rf-quais-os-achados-de-anamnese/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  console.log('Sanar status:', res.status);
  const html = await res.text();
  console.log('Length:', html.length);
  fs.writeFileSync('data/sanar_sample_q.html', html, 'utf8');
}

fetchSanarPage();
