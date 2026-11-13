async function check18() {
  const url = `https://portal.concursos.selecting.com.br/edital/ver/18`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('HTML 18 length:', html.length);
  const links = [...html.matchAll(/arquivo\.php\?file=[^\s"']+/g)];
  console.log('Links in 18:', links.map(l => l[0]));
}
check18();
