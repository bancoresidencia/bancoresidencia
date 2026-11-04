const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/PublicQuestionPage.js', 'utf8');

const pos = content.indexOf('function ee(');
console.log(content.slice(pos, pos + 800));

