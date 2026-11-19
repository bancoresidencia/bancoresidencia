import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const card = readFileSync('src/components/QuestionCard.tsx', 'utf8');
const solve = readFileSync('src/app/api/questions/solve/route.ts', 'utf8');
const confirmation = card.slice(card.indexOf('const submitAnswer ='), card.indexOf('const handleConfirmAnswer ='));

assert.match(card, /readResolution: true/);
assert.match(confirmation, /attemptId: attemptRef\.current\.id/);
assert.match(confirmation, /await fetch\('\/api\/questions\/solve'/);
assert(confirmation.indexOf('if (!data.success)') < confirmation.indexOf('syncedRemotely: true'));
assert.match(solve, /rpc\('persist_study_answer'/);
assert.match(solve, /if \(error \|\| !persisted\)/);
console.log('Respostas só são confirmadas após persistência e releitura não grava tentativas.');
