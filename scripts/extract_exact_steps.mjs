import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\froge\\.gemini\\antigravity\\brain\\53fe36b5-65e0-478d-9b80-253fa376182b\\.system_generated\\logs\\transcript.jsonl';

async function extractKeySteps() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const targetTimes = [
    '2026-11-15T17:37:57Z',
    '2026-11-16T15:11:26Z',
    '2026-11-16T23:06:01Z',
    '2026-11-17T11:54:47Z',
    '2026-11-17T18:10:22Z'
  ];

  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      const createdAt = step.created_at || '';
      for (const t of targetTimes) {
        if (createdAt.startsWith(t.slice(0, 16))) {
          console.log(`\n================== [${createdAt}] ==================`);
          console.log(step.content);
        }
      }
    } catch {}
  }
}

extractKeySteps();
