const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/resify_bundle.js', 'utf8');

const apis = content.match(/["'`]\/api\/[^"'`\s]+["'`]/g) || [];
console.log('Total APIs in main bundle:', apis.length);
console.log([...new Set(apis)].sort());

