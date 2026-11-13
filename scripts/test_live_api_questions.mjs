async function testLiveApi() {
  const url = 'http://localhost:3000/api/questions';

  console.log('=== TESTANDO API LIVE (http://localhost:3000/api/questions) ===\n');

  // 1. Facets com Acesso Direto
  const resFacets = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'facets',
      filters: { modalidades: ['Acesso Direto'] }
    })
  });
  const dataFacets = await resFacets.json();
  console.log('[1] Facets Acesso Direto:');
  console.log('    Total Right Card:', dataFacets.facets?.totalRightCardCount);
  console.log('    Especialidades:', Object.keys(dataFacets.facets?.especialidades || {}).length);

  // 2. Busca de Questões: Dificuldade Fácil em Acesso Direto
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
  console.log('\n[2] Busca Dificuldade Fácil (Acesso Direto):');
  console.log('    Status:', resFacil.status);
  console.log('    Total retornado:', dataFacil.total);
  console.log('    Amostra de dificuldades das questões retornadas:', dataFacil.questions?.map(q => q.difficulty));

  // 3. Busca de Questões: Ano 2005 em Acesso Direto
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
  console.log('\n[3] Busca Ano 2005 (Acesso Direto):');
  console.log('    Status:', res2005.status);
  console.log('    Total retornado:', data2005.total);
  console.log('    Amostra de anos retornados:', data2005.questions?.map(q => q.year));

  // 4. Busca de Questões: Tipo 'Certo ou errado'
  const resCertoErrado = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        tipoQuestao: 'Certo ou errado'
      }
    })
  });
  const dataCertoErrado = await resCertoErrado.json();
  console.log('\n[4] Busca Tipo Certo ou errado:');
  console.log('    Status:', resCertoErrado.status);
  console.log('    Total retornado:', dataCertoErrado.total);
  console.log('    Amostra de tipos retornados:', dataCertoErrado.questions?.map(q => q.type));

  // 5. Teste de Status da Questão: Resolvidas sem userSolvedIds
  const resResolvidasVazio = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        status: 'Resolvidas',
        userSolvedIds: []
      }
    })
  });
  const dataResolvidasVazio = await resResolvidasVazio.json();
  console.log('\n[5] Busca Status Resolvidas com userSolvedIds=[] (Visitante ou recém logado):');
  console.log('    Status:', resResolvidasVazio.status);
  console.log('    Total retornado:', dataResolvidasVazio.total);

  // 6. Teste de Status da Questão: Não vistas
  const resNaoVistas = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      pageSize: 5,
      filters: {
        modalidades: ['Acesso Direto'],
        status: 'Não vistas'
      }
    })
  });
  const dataNaoVistas = await resNaoVistas.json();
  console.log('\n[6] Busca Status Não vistas:');
  console.log('    Status:', resNaoVistas.status);
  console.log('    Total retornado:', dataNaoVistas.total);
}

testLiveApi().catch(console.error);

