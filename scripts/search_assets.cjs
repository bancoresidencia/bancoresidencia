const fs = require('fs');
const content = fs.readFileSync('d:/bancoresidencia/scripts/resify_bundle.js', 'utf8');

// Find all asset filenames
const allAssets = [...new Set(content.match(/assets\/[a-zA-Z0-9_-]+\.js/g))];
console.log('Total assets in bundle index:', allAssets.length);

// Let's find chunks that mention "AppQuestions" or "QuestionFeed" or "questions"
console.log('Matching assets:', allAssets.filter(a => 
  /question|feed|quiz|exam/i.test(a)
));

