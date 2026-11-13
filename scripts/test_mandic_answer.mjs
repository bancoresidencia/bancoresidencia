import fs from 'fs';

async function inspect(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const ld = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (ld) {
    const data = JSON.parse(ld[1]);
    console.log(url);
    console.log('Accepted answer:', data.mainEntity?.acceptedAnswer?.text?.slice(0, 100));
  }
}

async function main() {
  await inspect('https://sanarmed.com/q/durante-uma-consulta-de-rotina-voce/');
  await inspect('https://sanarmed.com/q/um-menino-de-6-anos-previamente/');
}

main();
