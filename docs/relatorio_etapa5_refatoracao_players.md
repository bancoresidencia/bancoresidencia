# Relatório Técnico — Etapa 5: Refatoração dos Players e Desvinculação de Mocks

**Data:** 23 de Novembro de 2026  
**Status:** Concluído com 100% de Precisão  
**Componentes Impactados:**
- [src/components/PracticeExam.tsx](file:///d:/bancoresidencia/src/components/PracticeExam.tsx) (Player de Simulado Oficial com Cronômetro)
- [src/components/QuestoesView.tsx](file:///d:/bancoresidencia/src/components/QuestoesView.tsx) (Player de Estudo Comentado e Banco de Questões)
- [src/data/officialExamsData.json](file:///d:/bancoresidencia/src/data/officialExamsData.json) (Catálogo front-end sincronizado com 2.093 cadernos reais)
- [src/app/(platform)/provas/page.tsx](file:///d:/bancoresidencia/src/app/(platform)/provas/page.tsx) (Roteador da aba de provas)

---

## 1. Diagnóstico dos Problemas Críticos Resolvidos

Antes da execução da Etapa 5, os players da plataforma apresentavam fragilidades que limitavam o uso das provas oficiais:

1. **Mock Rígido no `PracticeExam.tsx`:**
   - O player possuía apenas 4 registros estáticos hardcoded (`ex-1` a `ex-4`).
   - Qualquer outra prova caía em um fallback arbitrário de 200 questões e 240 minutos, ignorando o tamanho nominal e a duração real do edital.
2. **Ordem Aleatória vs. Ordem Sequencial do Caderno:**
   - As questões eram trazidas por filtros gerais (`instituicao`, `ano`), sem garantia da ordem sequencial (Questão 1 a $N$) do caderno original.
3. **Bloqueio de Modalidades no `QuestoesView.tsx`:**
   - `QuestoesView.tsx` inicializava com `modalidades: ['Acesso Direto']` fixo, impedindo que cadernos de R+ (204 cadernos) ou Revalida fossem resolvidos corretamente.
4. **Desconexão de Slugs no Catálogo do Front-End:**
   - `officialExamsData.json` utilizava identificadores genéricos (`exam_1`, `exam_2`) em vez dos slugs canônicos certificados.

---

## 2. Refatorações Executadas

### 2.1 Player de Simulado Oficial (`src/components/PracticeExam.tsx`)
- **Remoção Integral dos Mocks:** O dicionário `catalog: Record<string, ...>` com `ex-1` a `ex-4` foi completamente eliminado.
- **Conexão com `/api/exams/[id]`:** O componente consulta o endpoint do caderno oficial certificado, obtendo:
  - `title`: Título formal da prova (ex: `UNICAMP 2024 (Acesso Direto) - Caderno 1`).
  - `duration_minutes`: Tempo exato calculado por regra de edital (ex: 270 min para 100 questões, 300 min para 120 questões).
  - `question_ids`: Lista canônica e ordenada de IDs.
- **Ordem Sequencial do Edital:** As questões são carregadas passando explicitamente `targetQuestionIds` para a API, garantindo a correspondência 1..N com o cartão de respostas.
- **Fallback Resiliente:** Caso um exame seja aberto sem `examId` ou com slug não catalogado, o componente utiliza `getSupabaseInstitutionName(institution)` para garantir que a consulta ao Supabase nunca retorne zero questões por discrepância de sigla.

### 2.2 Player de Estudo Comentado (`src/components/QuestoesView.tsx`)
- **Suporte Nativo a Todas as Modalidades:** O estado inicial de filtros agora lê `searchParams.get('modalidade')` e converte para o tipo estrito `StudyModalidade` (`'Acesso Direto'`, `'R+'`, `'Revalida'`, `'Título de Especialista'`), desbloqueando todos os certames de especialidades.
- **Resolução Automática de Instituição:** Aplica `getSupabaseInstitutionName(instParam)` diretamente na inicialização do filtro, mapeando siglas como `HCFMUSP`, `SUS-SP` ou `UNICAMP` para os nomes formais do banco.
- **Injeção Automática de Caderno (`examId`):** Quando a URL possui `?examId=...`, o componente consome a API de cadernos e injeta os `question_ids` ordenados como `sessionQuestionIds` e `sessionQuestionLimit`, iniciando a sessão no modo de resolução sequencial.

### 2.3 Sincronização do Catálogo Front-end (`src/data/officialExamsData.json`)
- O arquivo de catálogo do front-end foi 100% sincronizado com os 2.093 cadernos certificados:
  - `id`: Slug canônico certificado (ex: `hcfmusp-2024-acesso_direto`, `unicamp-2024-acesso_direto-caderno-1`).
  - `questionCount`: Total nominal exato do caderno.
  - `modality`: Chave canônica (`acesso_direto`, `r_plus`, `revalida`, `titulo`).
  - Cobertura global: **331 instituições**, **2.093 cadernos**, **169.275 questões**.

---

## 3. Validação e Qualidade dos Dados

### 3.1 Baterias de Testes Automatizados Executadas
1. **Rotas de API (`tests/exams_api.test.ts`):** 5/5 (100%) aprovados.
2. **Serviço de Cadernos Certificados (`test_certified_exams_service.mjs`):** 15/15 (100%) aprovados.
3. **Resolução de Instituições (`test_institution_resolver.mjs`):** 20/20 (100%) aprovados.

### 3.2 Checagem Estática de Tipagem (TypeScript)
- Execução: `npx tsc --noEmit`
- Resultado: **0 erros** de compilação em todo o repositório.

---

## 4. Próximo Passo: Etapa 6 (Quality Gate e Validação Ponta a Ponta)

Com os players 100% integrados e desvinculados de mocks, avançaremos para o Quality Gate final:
- Validação ponta a ponta dos fluxos de navegação `/provas` -> `/questoes`.
- Auditoria de integridade de dados e conformidade estrita com o Definition of Done (`npm run lint`, `npm run build`, `npm test`, `npm run test:security`).
