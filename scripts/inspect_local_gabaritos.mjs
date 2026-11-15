import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/questoes_132k.db');
const res = db.prepare(`
  SELECT 
    count(*) as total,
    sum(case when correct_answer is not null and trim(correct_answer) != '' then 1 else 0 end) as com_gabarito,
    sum(case when correct_answer is null or trim(correct_answer) = '' then 1 else 0 end) as sem_gabarito
  FROM questions
`).get();

console.log('Result in local questoes_132k.db:', res);
