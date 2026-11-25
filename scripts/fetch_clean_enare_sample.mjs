import fs from 'fs';

async function main() {
  const url = 'https://www.medbrave.com.br/questoes/mulher-de-72-anos-diabetica-procura-atendimento-de-E9PQNU';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  const matches = [...html.matchAll(/https?:\/\/[^"'\s<>]+?\.(?:png|jpg|jpeg|webp)(?:\?[^"'\s<>]*)?/gi)].map(m => m[0]);
  const qImgs = matches.filter(m => m.includes('/questions/'));
  console.log('Clean Question Images found:', qImgs);
}

main().catch(console.error);
