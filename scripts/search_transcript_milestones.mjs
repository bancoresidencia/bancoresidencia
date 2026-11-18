import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\froge\\.gemini\\antigravity\\brain\\53fe36b5-65e0-478d-9b80-253fa376182b\\.system_generated\\logs\\transcript.jsonl';

async function searchTranscript() {
  if (!fs.existsSync(transcriptPath)) {
    console.log('Transcript not found');
    return;
  }

  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const milestones = [];
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    try {
      const step = JSON.parse(line);
      const content = step.content || '';
      const createdAt = step.created_at || '';
      
      // Look for user prompts or model responses with numbers, dates, or progress
      if (step.type === 'USER_INPUT') {
        milestones.push({ time: createdAt, type: 'USER', text: content.slice(0, 100) });
      } else if (content.includes('Padrão-Ouro') || content.includes('ESTEIRA DE PRODUÇÃO') || content.includes('FINALIZADA') || content.includes('Cirurgia') || content.includes('Pediatria') || content.includes('Obstetrícia')) {
        // match key stats
        const match = content.match(/(\d+[\.\d]*)\s*(questões|Ouro|conclu|finaliz)/i);
        if (match) {
          milestones.push({ time: createdAt, type: 'MODEL', snippet: content.slice(0, 200).replace(/\n/g, ' ') });
        }
      }
    } catch {}
  }

  console.log(`Read ${lineCount} lines. Found ${milestones.length} milestones.`);
  milestones.forEach(m => {
    console.log(`[${m.time}] [${m.type}] ${m.text || m.snippet}`);
  });
}

searchTranscript();
