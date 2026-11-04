const fs = require('fs');
const list = JSON.parse(fs.readFileSync('d:/bancoresidencia/scripts/all_chunks.json', 'utf8'));

const interesting = list.filter(c => 
  /exam|simula|prova|admin|export|caderno|question|feed|answer|diagnostic/i.test(c)
);

console.log('Interesting chunks:', interesting);

