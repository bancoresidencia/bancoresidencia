async function checkDownloadJs() {
  const url = 'https://www.pciconcursos.com.br/provas/download/residencia-medica-com-acesso-direto-hospital-dr-mario-gatti-sp-objetiva-concursos-2022';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    if (s.includes('prova-pdf-link') || s.includes('data-code') || s.includes('download')) {
      console.log('--- FOUND SCRIPT ---');
      console.log(s);
    }
  }
}
checkDownloadJs();

