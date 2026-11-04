const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/AppQuestionsPage.js', 'utf8');

// Find all API endpoints
const apiMatches = content.match(/["'`]\/api\/[^"'`]+["'`]/g) || [];
console.log('=== All APIs in AppQuestionsPage.js ===');
console.log([...new Set(apiMatches)]);

// Search for functions that handle answering or revealing gabarito
console.log('\n=== Answer / Gabarito snippets ===');
const regex = /(?:gabarito|answer|responder|resposta|reveal)[^;{}]{0,100}/gi;
const matches = content.match(regex) || [];
console.log([...new Set(matches)].slice(0, 40));

