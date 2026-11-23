import fs from 'fs';
import path from 'path';

function checkDir(d) {
  if (!fs.existsSync(d)) {
    console.log('Dir does not exist:', d);
    return;
  }
  const items = fs.readdirSync(d, { withFileTypes: true });
  console.log(`Directory ${d} has ${items.length} items:`);
  for (const item of items) {
    if (item.isDirectory()) {
      const sub = path.join(d, item.name);
      const subItems = fs.readdirSync(sub);
      console.log(`  Subdir ${item.name}: ${subItems.length} files`);
      console.log(`    Sample:`, subItems.slice(0, 5));
    } else {
      console.log(`  File: ${item.name} (${fs.statSync(path.join(d, item.name)).size} bytes)`);
    }
  }
}

checkDir('public/images/questoes');
checkDir('public/images');
