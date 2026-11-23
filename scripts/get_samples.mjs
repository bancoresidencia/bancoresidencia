import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const log = fs.readFileSync('C:/Users/froge/.gemini/antigravity/brain/241d0a0c-24d3-4f04-ad3f-8a9b9550575e/.system_generated/tasks/task-1823.log', 'utf8');
const lines = log.split('\n');

const gptQuestions = [];
const qwenQuestions = [];

lines.forEach(l => {
  const m = l.match(/\[\d+\/100\]\s+(EXP-DIR-\d+)\s+\|\s+🤖\s+([^\s|]+)\s+\|\s+⚡\s+[\d.]+s\s+\|\s+✅\s+Supabase\s+OK/);
  if (m) {
    const code = m[1];
    const model = m[2];
    if (model.includes('gpt-oss-120b') && gptQuestions.length < 3) gptQuestions.push(code);
    if (model.includes('qwen') && qwenQuestions.length < 3) qwenQuestions.push(code);
  }
});

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const samples = {
  gpt: [],
  qwen: []
};

gptQuestions.forEach(code => {
  const row = db.prepare('SELECT code, statement, options, commentary, correct_answer, tema FROM questions_curated_staging WHERE code = ?').get(code);
  let opts = [];
  try { opts = JSON.parse(row.options); } catch {}
  samples.gpt.push({
    code: row.code,
    tema: row.tema,
    ans: row.correct_answer,
    statement: row.statement,
    options: opts,
    commentary: row.commentary
  });
});

qwenQuestions.forEach(code => {
  const row = db.prepare('SELECT code, statement, options, commentary, correct_answer, tema FROM questions_curated_staging WHERE code = ?').get(code);
  let opts = [];
  try { opts = JSON.parse(row.options); } catch {}
  samples.qwen.push({
    code: row.code,
    tema: row.tema,
    ans: row.correct_answer,
    statement: row.statement,
    options: opts,
    commentary: row.commentary
  });
});

console.log(JSON.stringify(samples, null, 2));
