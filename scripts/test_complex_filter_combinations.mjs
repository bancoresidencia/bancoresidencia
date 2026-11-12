import fs from 'fs';

const BASE_URL = 'http://localhost:3000/api/questions';

// Dicionário de testes de combinações complexas
const COMPLEX_SCENARIOS = [
  {
    id: 'CENARIO_1_EXEMPLO_USUARIO',
    titulo: 'Exemplo do Usuário: PSU-MG + Ginecologia + Câncer de Colo + Múltipla Escolha + Ocultar Anuladas',
    filters: {
      modalidades: ['Residência Médica'],
      instituicoes: ['PSU-MG'],
      especialidades: ['Ginecologia'],
      temas: ['Cânceres Ginecológicos e Lesões Precursoras'],
      focos: ['Câncer de Colo do Útero e Lesões Precursoras (NIC)'],
      tipoQuestao: 'Múltipla escolha',
      ocultarAnuladasErro: true
    }
  },
  {
    id: 'CENARIO_2_ELITE_PAULISTA',
    titulo: 'Elite Paulista: USP + UNICAMP + SUS-SP + Cardiologia + Difícil + Últimos 3 Anos (2022-2024)',
    filters: {
      modalidades: ['Residência Médica'],
      instituicoes: ['USP-SP', 'UNICAMP', 'SUS-SP'],
      especialidades: ['Clínica Médica'],
      temas: ['Cardiologia'],
      dificuldade: 'Difícil',
      anos: [2024, 2023, 2022],
      ocultarAnuladasErro: true
    }
  },
  {
    id: 'CENARIO_3_ENARE_PEDIATRIA',
    titulo: 'ENARE Nacional: Pediatria + Emergências e UTI Pediátrica + Múltipla Escolha + Sem Anuladas',
    filters: {
      modalidades: ['Residência Médica'],
      instituicoes: ['ENARE'],
      especialidades: ['Pediatria'],
      temas: ['Emergências e Terapia Intensiva Pediátrica'],
      tipoQuestao: 'Múltipla escolha',
      ocultarAnuladasErro: true
    }
  },
  {
    id: 'CENARIO_4_CIRURGIA_BUSCA',
    titulo: 'Cirurgia Focada: Cirurgia Geral + Abdome Agudo + Busca "Apendicite" + Média/Difícil + 2021-2024',
    filters: {
      modalidades: ['Residência Médica'],
      especialidades: ['Cirurgia Geral'],
      temas: ['Abdome Agudo Cirúrgico'],
      search: 'apendicite',
      dificuldade: 'Média',
      anos: [2024, 2023, 2022, 2021],
      ocultarAnuladasErro: true
    }
  },
  {
    id: 'CENARIO_5_RIO_PREVENTIVA_SUS',
    titulo: 'Bancas do Rio de Janeiro: UFRJ + UERJ + SES-RJ + Medicina Preventiva + Legislação do SUS',
    filters: {
      modalidades: ['Residência Médica'],
      instituicoes: ['UFRJ', 'UERJ', 'SES-RJ'],
      especialidades: ['Medicina Preventiva e Social'],
      temas: ['Sistema Único de Saúde (SUS): Princípios e Legislação'],
      ocultarAnuladasErro: true
    }
  },
  {
    id: 'CENARIO_6_REVALIDA_OBSTETRICIA',
    titulo: 'Revalida INEP Oficial: Revalida + Obstetrícia + Hemorragias da Primeira Metade (Abortamento / Ectópica)',
    filters: {
      modalidades: ['Revalida'],
      instituicoes: ['INEP Revalida'],
      especialidades: ['Obstetrícia'],
      temas: ['Hemorragias da Primeira Metade da Gravidez'],
      ocultarAnuladasErro: true
    }
  },
  {
    id: 'CENARIO_7_MULTI_ESPECIALIDADE_AMRIGS',
    titulo: 'Sul AMRIGS: AMRIGS + Multi-Especialidades (Cirurgia Geral + Pediatria) + Anos Recentes',
    filters: {
      modalidades: ['Residência Médica'],
      instituicoes: ['AMRIGS'],
      especialidades: ['Cirurgia Geral', 'Pediatria'],
      anos: [2024, 2023],
      ocultarAnuladasErro: true
    }
  },
  {
    id: 'CENARIO_8_DEEP_SUBFOCO_NEFRO',
    titulo: 'Filtro em 4 Níveis (Subfoco Clínico Específico): Clínica Médica -> Nefrologia -> Glomerulopatias -> Síndrome Nefrótica',
    filters: {
      modalidades: ['Residência Médica'],
      especialidades: ['Clínica Médica'],
      temas: ['Nefrologia'],
      focos: ['Glomerulopatias e Doenças Renais Intrínsecas'],
      subfocos: ['Síndrome Nefrótica no Adulto e Criança (GMN Membranosa, LES, Glomeruloesclerose)'],
      ocultarAnuladasErro: true
    }
  }
];

async function runCombinationsTest() {
  console.log('========================================================================');
  console.log('🔬 AUDITORIA DE COMBINAÇÕES COMPLEXAS DE FILTROS (3 A 6 FILTROS CRUZADOS)');
  console.log('========================================================================\n');

  const results = [];

  for (const c of COMPLEX_SCENARIOS) {
    console.log(`>>> Testando [${c.id}]`);
    console.log(`    ${c.titulo}`);

    const start = performance.now();
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: c.filters,
          page: 1,
          pageSize: 5
        })
      });

      const latencyMs = Math.round(performance.now() - start);
      if (!res.ok) {
        console.log(`    ❌ Erro HTTP ${res.status}: ${await res.text()}\n`);
        results.push({ id: c.id, titulo: c.titulo, status: 'ERROR', error: `HTTP ${res.status}`, latencyMs });
        continue;
      }

      const data = await res.json();
      const total = data.total || 0;
      const count = data.questions?.length || 0;
      const questions = data.questions || [];

      console.log(`    ✅ Sucesso (${latencyMs}ms) | Total de Questões encontradas: ${total.toLocaleString('pt-BR')}`);
      if (questions.length > 0) {
        const q1 = questions[0];
        console.log(`    Exemplo Q1: [${q1.banca || 'N/A'} ${q1.year || ''}] [${q1.especialidade}] -> ${q1.tema} -> ${q1.foco || ''}`);
        console.log(`    Enunciado: "${(q1.statement || '').slice(0, 95).replace(/\n/g, ' ')}..."`);
        if (q1.subfoco) console.log(`    Subfoco: "${q1.subfoco}"`);
      } else {
        console.log(`    ℹ️ Nenhuma questão para essa combinação hiper-específica.`);
      }
      console.log('');

      results.push({
        id: c.id,
        titulo: c.titulo,
        status: 'SUCCESS',
        totalFound: total,
        latencyMs,
        sample: questions.slice(0, 2).map(q => ({
          banca: q.banca,
          year: q.year,
          especialidade: q.especialidade,
          tema: q.tema,
          foco: q.foco,
          subfoco: q.subfoco,
          difficulty: q.difficulty,
          statementSnippet: (q.statement || '').slice(0, 120)
        }))
      });
    } catch (err) {
      console.log(`    ❌ Falha de Conexão: ${err.message}\n`);
      results.push({ id: c.id, titulo: c.titulo, status: 'NETWORK_ERROR', error: err.message });
    }
  }

  fs.writeFileSync('data/relatorio_combinacoes_complexas.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('========================================================================');
  console.log('🎉 Auditoria concluída! Relatório salvo em data/relatorio_combinacoes_complexas.json');
  console.log('========================================================================\n');
}

runCombinationsTest();

