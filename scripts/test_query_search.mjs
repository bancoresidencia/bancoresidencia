import fs from 'fs';

async function testQuerySearch() {
  const statement = 'Além da triagem específica por meio do M-CHAT-R/F, quais os achados de anamnese que indicam investigação diagnóstica para transtorno de espectro autista?';
  const optA = 'Irmãos ou pais com TEA';
  
  // 1. Query com Enunciado + Alternativa
  const query1 = `${statement.slice(0, 80)} ${optA}`;
  console.log('Query 1:', query1);
  
  const url1 = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query1)}`;
  const res1 = await fetch(url1, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    }
  });
  const html1 = await res1.text();
  
  const regex = /<div class="result results_links[^"]*">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  let count = 0;
  while ((m = regex.exec(html1)) !== null && count < 3) {
    count++;
    let targetUrl = m[1];
    try {
      const uddg = new URL(m[1], 'https://duckduckgo.com').searchParams.get('uddg');
      if (uddg) targetUrl = decodeURIComponent(uddg);
    } catch (e) {}
    console.log(`[Result ${count}]`);
    console.log('Title:', m[2].replace(/<[^>]+>/g, '').trim());
    console.log('URL:', targetUrl);
    console.log('Snippet:', m[3].replace(/<[^>]+>/g, '').trim(), '\n');
  }
}

testQuerySearch();
