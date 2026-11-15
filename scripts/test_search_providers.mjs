import fs from 'fs';

async function testProviders() {
  const query = 'USCS residência médica 2025 gabarito';
  
  // 1. DuckDuckGo HTML
  try {
    const res1 = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html1 = await res1.text();
    console.log('DDG HTML status:', res1.status, 'Length:', html1.length);
  } catch (e) {
    console.log('DDG err:', e.message);
  }

  // 2. Bing
  try {
    const res2 = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html2 = await res2.text();
    console.log('Bing status:', res2.status, 'Length:', html2.length);
  } catch (e) {
    console.log('Bing err:', e.message);
  }
}

testProviders();
