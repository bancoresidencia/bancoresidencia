import fs from 'fs';

const html = fs.readFileSync('data/sanar_sample_q.html', 'utf8');

// Find all script tags or JSON blocks
const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
console.log(`Found ${scriptMatches.length} script tags.`);

for (const sm of scriptMatches) {
  const content = sm[1];
  if (content.includes('"correct": true') || content.includes('"correct":true')) {
    console.log('FOUND SCRIPT WITH correct: true!');
    console.log(content.slice(0, 500));
    // Let's see if it's JSON
    try {
      const parsed = JSON.parse(content);
      console.log('Parsed successfully! Keys:', Object.keys(parsed));
      fs.writeFileSync('data/sanar_extracted_data.json', JSON.stringify(parsed, null, 2), 'utf8');
      console.log('Saved to data/sanar_extracted_data.json');
    } catch (e) {
      // Maybe inside a variable assignment or window object
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
          const sub = content.slice(jsonStart, jsonEnd + 1);
          const p = JSON.parse(sub);
          console.log('Parsed sub-object! Keys:', Object.keys(p));
          fs.writeFileSync('data/sanar_extracted_data.json', JSON.stringify(p, null, 2), 'utf8');
          console.log('Saved sub to data/sanar_extracted_data.json');
        } catch (err) {
          console.log('Sub parse err:', err.message);
        }
      }
    }
    break;
  }
}
