import fs from 'fs';

const queue = JSON.parse(fs.readFileSync('data/clean_unsynced_queue.json', 'utf8'));
console.log('Queue length:', queue.length);
console.log('First 10 items:');
queue.slice(0, 10).forEach((q, i) => {
  console.log(`[${i + 1}] ${q.id} -> ${JSON.stringify(q.images)}`);
});
