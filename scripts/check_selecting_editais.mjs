async function checkSelectingEditais() {
  const ids = [47, 46, 45, 44, 43, 42, 41, 39, 38, 37, 36, 35, 32, 30, 27];
  for (const id of ids) {
    const u = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const text = await res.text();
        const titleM = text.match(/<title>([^<]+)<\/title>/i) || text.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i);
        const title = titleM ? titleM[1].trim() : 'Unknown';
        console.log(`[${id}] ${title}`);
        
        // Find links to provas and gabaritos
        const pdfMatches = [...text.matchAll(/href=["']([^"']+\.pdf)["'][^>]*>(.*?)<\/a>/gi)];
        pdfMatches.forEach(m => {
          const href = m[1];
          const label = m[2].replace(/<[^>]+>/g, '').trim();
          if (label.toLowerCase().includes('prova') || label.toLowerCase().includes('gabarito') || href.toLowerCase().includes('prova') || href.toLowerCase().includes('gabarito')) {
            console.log(`   -> [${label}] => ${href}`);
          }
        });
      }
    } catch (e) {
      console.error(id, e.message);
    }
  }
}
checkSelectingEditais();

