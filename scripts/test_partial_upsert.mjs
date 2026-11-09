import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testPartialUpsert() {
  // Pegar 1 questão existente
  const { data: rows } = await client
    .from('questions')
    .select('id, statement, tema, foco, subfoco')
    .limit(1);

  if (!rows || rows.length === 0) {
    console.log('Nenhuma linha encontrada');
    return;
  }

  const q = rows[0];
  console.log('Linha antes do teste:', { id: q.id, tema: q.tema, foco: q.foco, subfoco: q.subfoco });

  // Tentar upsert com APENAS id, tema, foco, subfoco
  const { error } = await client
    .from('questions')
    .upsert([{ id: q.id, tema: q.tema, foco: q.foco, subfoco: q.subfoco }], { onConflict: 'id' });

  console.log('Resultado do upsert parcial:', error ? `Erro: ${error.message}` : 'SUCESSO! PostgREST aceita upsert parcial.');

  // Conferir se o statement continua intacto
  const { data: after } = await client
    .from('questions')
    .select('id, statement')
    .eq('id', q.id)
    .single();

  console.log('Statement preservado intacto?', Boolean(after?.statement && after.statement === q.statement));
}

testPartialUpsert().catch(console.error);
