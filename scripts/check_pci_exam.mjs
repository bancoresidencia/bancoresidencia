async function checkPciExam() {
  const url = 'https://www.pciconcursos.com.br/provas/download/residencia-medica-com-acesso-direto-hospital-dr-mario-gatti-sp-objetiva-concursos-2022';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    // Find download links
    const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    for (const l of links) {
      if (l.includes('.pdf') || l.includes('download') || l.includes('arquivo') || l.includes('gabarito')) {
        console.log(' ->', l);
      }
    }
  }
}
checkPciExam();

