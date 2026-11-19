import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const view = readFileSync('src/components/QuestoesView.tsx', 'utf8');
const client = readFileSync('src/services/studyQuestionClient.ts', 'utf8');
const migration = readFileSync('supabase/migrations/20261119154449_exact_study_question_catalog.sql', 'utf8');

assert.match(view, /const filteredAnswerRevision = bancoMode === 'filtros'/);
assert.match(view, /sessionQuestionIds,\s*filteredAnswerRevision,/);
assert.match(view, /controller\.abort\(\)/);
for (const field of ['userSolvedIds', 'userCorrectIds', 'userWrongIds']) {
  assert.match(client, new RegExp('delete filters\\.' + field));
}
assert.match(migration, /auth\.uid\(\) AS student_id/);
console.log('Histórico vinculado à sessão e consultas de filtros canceláveis.');
