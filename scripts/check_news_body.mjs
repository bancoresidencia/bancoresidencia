async function checkNewsBody() {
  const url = 'https://www.amp.org.br/web/noticias/exame-amp-2024-realizado-com-sucesso-gabaritos-j-est-o-dispon-veis-2024-11-04';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 3000));
}
checkNewsBody();
