import fs from 'fs';

const contentPath = 'C:\\Users\\cnath\\.gemini\\antigravity-ide\\brain\\9f322e60-cbeb-45b4-83e0-4839d8124267\\.system_generated\\steps\\304\\content.md';
if (fs.existsSync(contentPath)) {
  const txt = fs.readFileSync(contentPath, 'utf8');
  const regex = /https?:\/\/[^\s\)\"]+/gi;
  const matches = Array.from(new Set(txt.match(regex) || []));
  console.log(`Total URLs encontradas: ${matches.length}`);
  
  const years = ['2011', '2012', '2013', '2014', '2015', '2016', '2017'];
  for (const y of years) {
    const forYear = matches.filter(m => m.includes(y) && !m.includes('/search?') && !m.includes('SearchableText'));
    console.log(`\nAno ${y} (${forYear.length} links):`);
    forYear.slice(0, 10).forEach(l => console.log('  ', l));
  }
}
