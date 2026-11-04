const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/PublicQuestionPage.js', 'utf8');

const pos = content.indexOf('/api/questions/public-question-pages/');
console.log(content.slice(Math.max(0, pos - 400), Math.min(content.length, pos + 800)));

