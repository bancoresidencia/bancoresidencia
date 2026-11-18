import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\froge\\.gemini\\antigravity\\brain\\53fe36b5-65e0-478d-9b80-253fa376182b\\.system_generated\\logs\\transcript.jsonl';

async function extractSpecific() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      const createdAt = step.created_at || '';
      if (createdAt === '2026-11-16T15:11:26Z' || createdAt === '2026-11-16T23:06:01Z') {
        console.log(`\n================== [${createdAt}] ==================`);
        console.log(step.content);
      }
    } catch {}
  }
}

extractSpecific();
