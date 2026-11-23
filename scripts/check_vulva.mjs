async function test() {
  const url = 'https://www.medbrave.com.br/questoes/mulher-de-72-anos-diabetica-procura-atendimento-de-E9PQNU';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
  const html = await res.text();
  const matches = html.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
  const qImgs = matches.filter(u => u.includes('questions'));
  console.log('Images:', qImgs);
}

test().catch(console.error);
