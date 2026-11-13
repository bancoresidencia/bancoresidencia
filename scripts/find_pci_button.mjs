async function findPciDownloadButton() {
  const url = 'https://www.pciconcursos.com.br/provas/download/residencia-medica-com-acesso-direto-hospital-dr-mario-gatti-sp-objetiva-concursos-2022';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const matches = [...html.matchAll(/href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const m of matches) {
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text.toLowerCase().includes('baixar') || text.toLowerCase().includes('download') || text.toLowerCase().includes('prova') || text.toLowerCase().includes('gabarito')) {
      console.log(`[${text}] -> ${m[1]}`);
    }
  }
}
findPciDownloadButton();

