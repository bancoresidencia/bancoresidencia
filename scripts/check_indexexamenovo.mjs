async function checkIndexExameNovo() {
  const url = 'https://amp.org.br/residencia-medica/exameamp/indexexamenovo.php';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log(html);
}
checkIndexExameNovo();
