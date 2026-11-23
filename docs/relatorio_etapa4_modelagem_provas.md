# Relatório Técnico — Etapa 4: Modelagem Relacional e Estrutural de Provas Oficiais (`official_exams`)

**Data:** 23 de Novembro de 2026  
**Status:** Concluído com 100% de Precisão  
**Componentes Criados e Impactados:**
- [supabase/migrations/20261123100000_create_official_exams_table.sql](file:///d:/bancoresidencia/supabase/migrations/20261123100000_create_official_exams_table.sql) (Migração canônica Supabase)
- [src/types/certifiedExam.ts](file:///d:/bancoresidencia/src/types/certifiedExam.ts) (Definições TypeScript estritas)
- [src/data/certifiedExamsCatalog.json](file:///d:/bancoresidencia/src/data/certifiedExamsCatalog.json) (Catálogo mestre estático de 2.093 provas)
- [src/services/certifiedExamsService.ts](file:///d:/bancoresidencia/src/services/certifiedExamsService.ts) (Serviço de consulta e filtros em memória O(1))
- [src/app/api/exams/route.ts](file:///d:/bancoresidencia/src/app/api/exams/route.ts) (Endpoint de listagem paginada e filtros)
- [src/app/api/exams/[id]/route.ts](file:///d:/bancoresidencia/src/app/api/exams/[id]/route.ts) (Endpoint atômico de caderno com `question_ids` ordenados)
- [tests/exams_api.test.ts](file:///d:/bancoresidencia/tests/exams_api.test.ts) (Suíte de testes de integração automatizada)

---

## 1. Objetivos da Etapa 4

1. **Superação do Mock no Front-End:**
   - O player de simulados (`PracticeExam.tsx`) operava com um catálogo estático restrito a apenas 4 provas (`ex-1` a `ex-4`), forçando um fallback genérico de 200 questões e 240 minutos sem respeito à ordem do edital.
2. **Modelagem Relacional de Cadernos no Supabase:**
   - Criar uma entidade persistente de primeira classe (`official_exams`) para governar os 2.093 cadernos certificados consolidados nas Etapas 1 e 2.
3. **API RESTful e Payloads Otimizados:**
   - Prover endpoints de alto desempenho (`/api/exams` e `/api/exams/[id]`) que entregam metadados leves na listagem e injetam a lista canônica e ordenada de `question_ids` (1..N) apenas no momento em que o aluno inicia a resolução.

---

## 2. Modelagem Relacional e Governança no Supabase

### 2.1 Esquema da Tabela `public.official_exams`
A migração `20261123100000_create_official_exams_table.sql` cria a estrutura:

```sql
CREATE TABLE IF NOT EXISTS public.official_exams (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  institution_slug text NOT NULL,
  institution_name text NOT NULL,
  banca text,
  year integer NOT NULL,
  modality text NOT NULL,
  modality_key text NOT NULL DEFAULT 'acesso_direto',
  booklet text,
  total_questions integer NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 240,
  question_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_certified boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'integral_certificada',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 2.2 Governança de RLS (Row Level Security) e Índices
- **RLS Ativo:** Políticas configuradas permitindo leitura pública (`SELECT`) para estudantes anônimos e autenticados, com escrita restrita a administradores e `service_role`.
- **Índices de Cobertura:** Criados em `institution_slug`, `year`, `modality_key` e `slug`.

---

## 3. Catálogo Canônico e Motor de Serviços

### 3.1 Catálogo Mestre (`src/data/certifiedExamsCatalog.json`)
- **Total de Provas Modeladas:** 2.093 cadernos integrais.
- **Total de Questões Cobertas:** 169.275 questões em ordem sequencial estrita de caderno.
- **Distribuição por Modalidade:**
  - *Acesso Direto:* 1.886 cadernos (90.1%)
  - *R+ (Especialidades):* 204 cadernos (9.7%)
  - *Revalida:* 3 cadernos (0.2%)

### 3.2 Serviço Especialista (`src/services/certifiedExamsService.ts`)
- **`getCertifiedExams(filters)`:** Filtra por instituição (integrado ao `institutionResolver` para aceitar qualquer sigla ou alias), ano, modalidade ou busca textual, retornando summaries leves (sem os arrays de IDs).
- **`getCertifiedExamById(idOrSlug)`:** Recupera instantaneamente via índice $O(1)$ os dados completos da prova, incluindo o array ordenado de `question_ids` e o tempo do simulado calculado pela regra de edital (2.5 a 3 minutos por questão: 180 min para 50q, 240 min para 80q, 270 min para 100q, 300 min para 120q).

---

## 4. Endpoints de API Criados

1. **`GET /api/exams`:**
   - Parâmetros: `instituicao`, `ano`, `modalidade`, `q`, `page`, `limit`, `action=stats`.
   - Resposta: `{ success: true, exams: [...], total, page, limit, totalPages }`.
2. **`GET /api/exams/[id]`:**
   - Resposta: `{ success: true, exam: { id, title, total_questions, duration_minutes, question_ids: [...] } }`.

---

## 5. Validação e Qualidade dos Dados

### 5.1 Testes Unitários do Serviço (`test_certified_exams_service.mjs`)
- 15/15 (100%) testes aprovados:
  - Validação de estatísticas globais (2.093 provas, 169.275 questões).
  - Resolução por alias de flagship: `HCFMUSP`, `UNICAMP`, `ENARE`, `SUS-SP`.
  - Integridade da contagem de `question_ids` igual a `total_questions`.
  - Paginação consistente entre páginas consecutivas.

### 5.2 Testes de Integração de Rotas API (`tests/exams_api.test.ts`)
- 5/5 (100%) testes aprovados:
  - Listagem paginada retorna status 200 e schema correto.
  - Filtro por instituição (`?instituicao=UNICAMP`) filtra apenas exames de `hc-unicamp`.
  - `action=stats` reporta estatísticas consolidadas.
  - `GET /api/exams/[id]` retorna caderno atômico com `question_ids`.
  - `GET /api/exams/inexistente` retorna 404 sem quebrar o servidor.

### 5.3 Checagem Estática de Tipagem (TypeScript)
- Execução: `npx tsc --noEmit`
- Resultado: **0 erros** de compilação em todo o repositório.

---

## 6. Próximo Passo: Etapa 5 (Refatoração dos Players)

Com a infraestrutura de dados e rotas 100% testada e operacional:
1. **Refatorar `PracticeExam.tsx`:** Conectar diretamente ao endpoint `/api/exams/[id]`, eliminando o catálogo mockado (`ex-1` a `ex-4`) e aplicando o cronômetro oficial e a ordem sequencial exata do caderno de edital.
2. **Refatorar `QuestoesView.tsx`:** Permitir carregamento via `examId` ou lista de `ids`, e desbloquear modalidades não-Acesso Direto (R+ e Revalida) para os cadernos oficiais.
3. **Refatorar `OfficialExams.tsx`:** Conectar os botões "Iniciar Prova" e "Simular Prova" diretamente aos slugs canônicos certificados.
