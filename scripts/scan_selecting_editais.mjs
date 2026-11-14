async function scanEditais() {
  const ids = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47];
  for (const id of ids) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      // Encontra o nome do edital / concurso no corpo
      const m = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || 
                html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || 
                html.match(/class="[^"]*card-title[^"]*"[^>]*>([\s\S]*?)<\//i) ||
                html.match(/<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
      const name = m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : 'Nenhum título encontrado';
      console.log(`[EDITAL ${id}] ${name}`);
    } catch (e) {}
  }
}
scanEditais();
