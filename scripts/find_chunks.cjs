const fs = require('fs');
const content = fs.readFileSync('d:/bancoresidencia/scripts/resify_bundle.js', 'utf8');
const regex = /assets\/[^"'\s]+\.js/g;
const matches = [...new Set(content.match(regex))];
console.log(matches.filter(m => m.toLowerCase().includes('question') || m.toLowerCase().includes('feed') || m.toLowerCase().includes('answer') || m.toLowerCase().includes('gabarito')));

