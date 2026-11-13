async function inspectPciJs() {
  const url = 'https://www.pciconcursos.com.br/provas/download/residencia-medica-com-acesso-direto-hospital-dr-mario-gatti-sp-objetiva-concursos-2022';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const idx = html.indexOf('residencia-medica-com-acesso-direto.pdf');
  if (idx !== -1) {
    console.log(html.slice(Math.max(0, idx - 300), idx + 300));
  }
}
inspectPciJs();

