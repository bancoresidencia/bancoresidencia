const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/PublicQuestionPage.js', 'utf8');

const pos = content.indexOf('PublicQuestionPage');
console.log(content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 600)));

