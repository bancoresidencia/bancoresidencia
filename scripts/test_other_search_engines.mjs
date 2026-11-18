async function testOtherEngines() {
  const query = 'Mulher de 45 anos procura atendimento relatando tonturas rotatórias há quinze dias Hospital São Camilo';

  // 1. Ecosia
  try {
    const res = await fetch(`https://www.ecosia.org/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    console.log('Ecosia status:', res.status);
    const html = await res.text();
    console.log('Ecosia len:', html.length);
    const hasResults = html.includes('result__title') || html.includes('mainline__result') || html.includes('estrategia') || html.includes('sanar');
    console.log('Ecosia has results:', hasResults);
  } catch (e) {
    console.log('Ecosia err:', e.message);
  }

  // 2. Qwant
  try {
    const res = await fetch(`https://api.qwant.com/v3/search/web?q=${encodeURIComponent(query)}&count=10&locale=pt_BR&offset=0&device=desktop`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    console.log('Qwant status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Qwant items count:', data.data?.result?.items?.mainline?.length || data.data?.result?.items?.length || 0);
    }
  } catch (e) {
    console.log('Qwant err:', e.message);
  }

  // 3. Mojeek
  try {
    const res = await fetch(`https://www.mojeek.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    console.log('Mojeek status:', res.status);
    const html = await res.text();
    console.log('Mojeek len:', html.length);
  } catch (e) {
    console.log('Mojeek err:', e.message);
  }
}
testOtherEngines();
