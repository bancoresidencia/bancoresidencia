import fs from 'fs';
import path from 'path';

const base = 'data';
const entries = fs.readdirSync(base, { withFileTypes: true });

for (const e of entries) {
  if (e.isDirectory()) {
    const p = path.join(base, e.name);
    try {
      const files = fs.readdirSync(p);
      console.log(`${e.name}: ${files.length} items`);
    } catch {
      console.log(`${e.name}: error reading`);
    }
  }
}
