async function test() {
  const url = 'https://www.medbrave.com.br/questoes/recem-nascido-a-termo-masculino-apgar-9-9-peso-com-XD9UGS';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  const matches = html.match(/https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi) || [];
  const qImgs = matches.filter(u => u.includes('questions'));
  console.log('Question images:', qImgs);
}

test().catch(console.error);
