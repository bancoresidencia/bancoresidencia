const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/AppQuestionsPage.js', 'utf8');

function findContext(needle) {
  let pos = 0;
  while ((pos = content.indexOf(needle, pos)) !== -1) {
    console.log(`\n=================== Found "${needle}" at ${pos} ===================`);
    const start = Math.max(0, pos - 400);
    const end = Math.min(content.length, pos + 800);
    console.log(content.slice(start, end));
    pos += needle.length;
  }
}

findContext('/api/questions/answer');
findContext('/api/questions/hydrate');

