import fs from 'fs';

async function findEnare() {
  const res = await fetch('https://institutoaocp.org.br/api/concursos');
  const data = await res.json();
  const enareList = data.filter(c => {
    const s = (c.nome + ' ' + (c.chamada || '') + ' ' + (c.edital || '')).toLowerCase();
    return s.includes('enare') || s.includes('exame nacional de residência') || s.includes('exame nacional de residencia');
  });

  console.log(`Found ${enareList.length} ENARE concursos:`);
  enareList.forEach(c => {
    console.log(`ID: ${c.id} | Edital: ${c.edital} | Nome: ${c.nome} | Chamada: ${c.chamada?.slice(0, 100)}`);
  });

  fs.writeFileSync('d:/bancoresidencia/data/enare_test/aocp_enare_list.json', JSON.stringify(enareList, null, 2));
}

findEnare();
