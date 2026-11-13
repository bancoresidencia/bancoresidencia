import assert from 'node:assert';

async function verifyAllFilters() {
  const url = 'http://localhost:3000/api/questions';
  console.log('=== VERIFICAÇÃO FINAL: FILTROS E VINCULAÇÃO SUPABASE ===\n');

  // 1. Dificuldade Fácil (deve retornar contagem precisa de 57.171 em Acesso Direto)
  console.log('[1] Testando contagem de Dificuldade Fácil...');
  const resFacil = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        dificuldade: 'Fácil'
      }
    })
  });
  const dataFacil = await resFacil.json();
  console.log(`    Total retornado para Fácil: ${dataFacil.total}`);
  assert.strictEqual(dataFacil.total, 57171, 'Total de Fácil deve ser 57.171');
  assert(dataFacil.questions.every(q => q.difficulty === 'Fácil'), 'Todas as questões retornadas devem ser Fácil');
  console.log('    ✓ Dificuldade Fácil validada com exatidão!');

  // 2. Dificuldade Médio (deve retornar 124.667)
  console.log('\n[2] Testando contagem de Dificuldade Médio...');
  const resMedio = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        dificuldade: 'Médio'
      }
    })
  });
  const dataMedio = await resMedio.json();
  console.log(`    Total retornado para Médio: ${dataMedio.total}`);
  assert.strictEqual(dataMedio.total, 124667, 'Total de Médio deve ser 124.667');
  console.log('    ✓ Dificuldade Médio validada com exatidão!');

  // 3. Dificuldade Difícil (deve retornar 24.761)
  console.log('\n[3] Testando contagem de Dificuldade Difícil...');
  const resDificil = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        dificuldade: 'Difícil'
      }
    })
  });
  const dataDificil = await resDificil.json();
  console.log(`    Total retornado para Difícil: ${dataDificil.total}`);
  assert.strictEqual(dataDificil.total, 24761, 'Total de Difícil deve ser 24.761');
  console.log('    ✓ Dificuldade Difícil validada com exatidão!');

  // 4. Especialidade "Outras / Em Curadoria" (28.945 em Acesso Direto)
  console.log('\n[4] Testando nó "Outras / Em Curadoria"...');
  const resOutras = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        especialidades: ['Outras / Em Curadoria']
      }
    })
  });
  const dataOutras = await resOutras.json();
  console.log(`    Total retornado para Outras / Em Curadoria: ${dataOutras.total}`);
  assert.strictEqual(dataOutras.total, 28945, 'Total de Outras deve ser 28.945');
  console.log('    ✓ Questões não categorizadas (28.945) agora 100% acessíveis e mapeadas!');

  // 5. Anos Históricos (2005 e 2004)
  console.log('\n[5] Testando filtro de anos históricos (2005 e 2004)...');
  const res2005 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        anos: [2005]
      }
    })
  });
  const data2005 = await res2005.json();
  console.log(`    Total retornado para ano 2005: ${data2005.total}`);
  assert.strictEqual(data2005.total, 350, 'Total de 2005 deve ser 350');

  const res2004 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Revalida'],
        anos: [2004]
      }
    })
  });
  const data2004 = await res2004.json();
  console.log(`    Total retornado para Revalida ano 2004: ${data2004.total}`);
  assert.strictEqual(data2004.total, 15, 'Total de Revalida 2004 deve ser 15');
  console.log('    ✓ Anos históricos 2005 e 2004 validados com exatidão!');

  // 6. Bancas Canônicas (SES-PE, AMRIGS, TEGO)
  console.log('\n[6] Testando filtro de bancas do novo catálogo canônico...');
  const resBanca = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        instituicoes: ['SES-PE']
      }
    })
  });
  const dataBanca = await resBanca.json();
  console.log(`    Total retornado para banca SES-PE: ${dataBanca.total}`);
  assert(dataBanca.total > 0, 'Deve retornar questões para SES-PE');
  console.log('    ✓ Busca e filtragem por banca validada!');

  console.log('\n============================================================');
  console.log('🎉 TODAS AS VERIFICAÇÕES FORAM CONCLUÍDAS COM 100% DE SUCESSO!');
  console.log('============================================================\n');
}

verifyAllFilters().catch(console.error);

