import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');

function getLatestTranscriptPath(targetId) {
  if (!fs.existsSync(BRAIN_DIR)) return null;

  if (targetId) {
    const directPath = path.join(BRAIN_DIR, targetId, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(directPath)) return { id: targetId, file: directPath };
  }

  const dirs = fs.readdirSync(BRAIN_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const transcript = path.join(BRAIN_DIR, d.name, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(transcript)) {
        const stat = fs.statSync(transcript);
        return { id: d.name, file: transcript, mtime: stat.mtimeMs };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.mtime - a.mtime);

  return dirs[0] || null;
}

const targetArg = process.argv.find(arg => !arg.startsWith('-') && arg.endsWith('.mjs') === false);
const active = getLatestTranscriptPath(targetArg);
if (!active) {
  console.log('Nenhuma sessão encontrada em:', BRAIN_DIR);
  process.exit(1);
}

console.log(`\x1b[36m============================================================\x1b[0m`);
console.log(`\x1b[1m\x1b[32m🚀 MONITOR EM TEMPO REAL DE TOKENS — ANTIGRAVITY\x1b[0m`);
console.log(`\x1b[36mSessão ativa:\x1b[0m ${active.id}`);
console.log(`\x1b[36mMonitorando:\x1b[0m ${active.file}`);
console.log(`\x1b[36m============================================================\x1b[0m\n`);

let processedLines = 0;
let totalInput = 0;
let totalCached = 0;
let totalOutput = 0;

function formatNum(n) {
  return (n || 0).toLocaleString('pt-BR');
}

function processTranscript() {
  if (!fs.existsSync(active.file)) return;

  const content = fs.readFileSync(active.file, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  if (lines.length <= processedLines) return;

  for (let i = processedLines; i < lines.length; i++) {
    try {
      const data = JSON.parse(lines[i]);
      if (data.type === 'USER_INPUT') {
        const preview = (data.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70);
        console.log(`\x1b[33m[Passo ${data.step_index}] 👤 USUÁRIO:\x1b[0m "${preview}..."`);
      } else if (data.type === 'PLANNER_RESPONSE') {
        const inp = data.input_tokens || 0;
        const cache = data.cache_read_tokens || 0;
        const out = data.output_tokens || 0;
        const stepTotal = inp + cache + out;

        totalInput += inp;
        totalCached += cache;
        totalOutput += out;

        let toolInfo = '';
        if (data.tool_calls && data.tool_calls.length > 0) {
          toolInfo = ` 🔧 ` + data.tool_calls.map(t => t.name).join(', ');
        }

        const cachePercent = stepTotal > 0 ? ((cache / (inp + cache)) * 100).toFixed(1) : '0';

        console.log(`\x1b[34m[Passo ${data.step_index}] 🤖 MODELO${toolInfo}\x1b[0m`);
        console.log(`   ├─ \x1b[35mNovo Input:\x1b[0m ${formatNum(inp).padStart(7)}  │  \x1b[32mCache (Reaproveitado):\x1b[0m ${formatNum(cache).padStart(7)} (${cachePercent}% cache hit)`);
        console.log(`   ├─ \x1b[36mOutput:\x1b[0m     ${formatNum(out).padStart(7)}  │  \x1b[1mTotal deste passo:\x1b[0m    ${formatNum(stepTotal).padStart(7)}`);
        console.log(`   └─ \x1b[33mAcumulado na Sessão:\x1b[0m Input: ${formatNum(totalInput)} | Cache: ${formatNum(totalCached)} | Saída: ${formatNum(totalOutput)} | Geral: ${formatNum(totalInput + totalCached + totalOutput)}\n`);
      }
    } catch {
      // Ignora linhas incompletas durante gravação
    }
  }

  processedLines = lines.length;
}

// Primeira leitura
processTranscript();

// Modo watch contínuo se executado via CLI
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  console.log(`\x1b[90m[Aguardando novas ações em tempo real... (Pressione Ctrl+C para sair)]\x1b[0m\n`);
  fs.watchFile(active.file, { interval: 800 }, () => {
    processTranscript();
  });
}
