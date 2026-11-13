import fs from 'fs';

function slugify(text, maxWords = 6) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join('-');
}

async function testSanarLaura() {
  const stmt = "Laura um lactente de dois anos e levada ao consultorio por historia de febre alta";
  const slugs = [
    'laura-um-lactente-de-dois-anos',
    'laura-um-lactente-de-dois-anos-e-levada',
    'laura-um-lactente-de-dois-anos-e-levada-ao-consultorio',
    slugify(stmt, 5),
    slugify(stmt, 6),
    slugify(stmt, 8)
  ];

  for (const s of slugs) {
    const url = `https://sanarmed.com/q/${s}/`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${res.status}] ${url}`);
      if (res.ok) {
        const text = await res.text();
        const m = text.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
        if (m) console.log('Found LD+JSON:\n', m[1].slice(0, 500));
        return;
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

testSanarLaura();
