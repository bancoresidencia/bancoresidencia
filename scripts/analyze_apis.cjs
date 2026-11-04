const fs = require('fs');

const files = [
  'd:/bancoresidencia/scripts/QuestionCard.js',
  'd:/bancoresidencia/scripts/question-utils.js',
  'd:/bancoresidencia/scripts/AppQuestionsRoute.js'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  console.log(`=== File: ${f} (${content.length} bytes) ===`);
  const apiMatches = content.match(/["'`]\/api\/[^"'`]+["'`]/g) || [];
  console.log('APIs found:', [...new Set(apiMatches)]);
  
  // Also search for words like gabarito, answer, responder, correta, hydrate
  const kwMatches = content.match(/[a-zA-Z0-9_$]+(?:gabarito|answer|responder|correta|hydrate|token|solution)[a-zA-Z0-9_$]*/gi) || [];
  console.log('Keywords:', [...new Set(kwMatches)].slice(0, 30));
}

