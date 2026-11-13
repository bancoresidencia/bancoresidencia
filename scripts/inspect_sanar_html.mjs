import fs from 'fs';

async function inspectHtml() {
  const url = 'https://sanarmed.com/q/laura-um-lactente-de-dois-anos/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('HTML length:', html.length);
  // check for correct answer or alternatives in html
  const idx = html.indexOf('Exantema');
  if (idx !== -1) {
    console.log('Found Exantema at', idx, ':\n', html.slice(idx - 200, idx + 400));
  } else {
    console.log('Exantema not found, checking keywords...');
    const m = html.match(/resposta|gabarito|correct/i);
    console.log('Match:', m);
  }
}

inspectHtml();
