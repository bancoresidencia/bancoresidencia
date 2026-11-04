const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/QuestionCard.js', 'utf8');

function findContext(needle) {
  let pos = 0;
  while ((pos = content.indexOf(needle, pos)) !== -1) {
    console.log(`\n=================== Found "${needle}" at ${pos} ===================`);
    const start = Math.max(0, pos - 200);
    const end = Math.min(content.length, pos + 500);
    console.log(content.slice(start, end));
    pos += needle.length;
  }
}

findContext('/details');
findContext('/commentary');
findContext('X-Question-Access-Token');

