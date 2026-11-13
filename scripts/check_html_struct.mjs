async function checkEditalHeader() {
  const url = `https://portal.concursos.selecting.com.br/edital/ver/32`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  // Find everything between <body and first file
  const bodyIdx = html.indexOf('<body');
  const fileIdx = html.indexOf('ec887262');
  console.log(html.slice(bodyIdx, bodyIdx + 1500).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}
checkEditalHeader();
