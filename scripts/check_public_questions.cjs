const fs = require('fs');

for (const f of ['d:/bancoresidencia/scripts/PublicQuestionPage.js', 'd:/bancoresidencia/scripts/usePublicSeoQuestions.js']) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  console.log(`=== File: ${f} ===`);
  const apis = content.match(/["'`]\/api\/[^"'`]+["'`]/g) || [];
  console.log('APIs:', [...new Set(apis)]);
  const gabarito = content.match(/(?:gabarito|answer|correta|solution)[^;{}]{0,80}/gi) || [];
  console.log('Keywords:', [...new Set(gabarito)].slice(0, 20));
}

