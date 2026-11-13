async function fetchEstrategiaQuestion() {
  const url = 'https://med.estrategia.com/public/questoes/Mulher-45-anos-procura64a862e1a7/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`[${res.status}] ${url}`);
  if (res.ok) {
    const html = await res.text();
    console.log('HTML length:', html.length);
    // Find metadata, answer, institution, etc.
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(text.slice(0, 1500));
  }
}
fetchEstrategiaQuestion();

