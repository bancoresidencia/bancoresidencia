<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Banco Residência — Diretrizes para Agentes

## Propósito
Plataforma de preparação de alto padrão para Residência Médica, Revalida e Especialidades (R+).
Combina banco de questões com resoluções comentadas, psicometria (TRI/IRT), flashcards (repetição espaçada), resumos teóricos oficiais e métricas analíticas de estudo.

## Mapa do Projeto
- `src/app/(platform)`, `(admin)` e `(checkout)` são route groups com regras de acesso e layouts distintos.
- O modelo psicométrico da TRI fica em `src/utils/irtModel.ts` (qualquer alteração exige `npm run test:irt`).
- Documentação técnica e especificações de arquitetura estão em `docs/`.

## Limites Críticos e Segurança

### Banco de Dados e Supabase
- **Migrações e RLS:** Mudanças de schema ocorrem exclusivamente via migrações (`npx supabase migration new <nome>` em `supabase/migrations/`). Nunca edite migrações já aplicadas. Nunca desabilite Row Level Security (RLS) nas tabelas.
- **Separação de Clientes:**
  - `src/lib/supabase/client.ts` (`createClient`): exclusivo para Client Components (`'use client'`). Usa apenas `NEXT_PUBLIC_` keys.
  - `src/lib/supabase/server.ts`: para Server Components e rotas normais de estudante (mantém RLS sob o token de sessão do usuário).
  - `src/lib/supabase/adminClient.ts` (`getSupabaseAdmin`): restrito a jobs/webhooks internos e rotas administrativas protegidas (`isPrivilegedRole`). Nunca importe em Client Components nem use em rotas públicas.
- **Variáveis de Ambiente:** Ver `.env.example`. Nenhuma variável privada pode ter prefixo `NEXT_PUBLIC_`; as chaves `SERVICE_ROLE`, `ACCESS_TOKEN`, `WEBHOOK_SECRET` e `GEMINI` são sempre server-only e nunca devem ser versionadas.

### Alunos, Pagamentos e IA
- **Dados do Aluno e BOLA/IDOR:** O `userId` deve ser extraído sempre da sessão autenticada (`supabase.auth.getUser()`), nunca aceito cegamente do payload ou query do cliente. Nunca logue PII (CPF, senhas, e-mails).
- **Ativação de Assinaturas (Mercado Pago):** Ao receber notificação no webhook, valide a assinatura HMAC `x-signature` com `crypto.timingSafeEqual`. Nunca desative, comente ou crie bypass para essa verificação (nem para testes). Busque o pagamento diretamente na API do Mercado Pago pelo ID, confirme status `approved`, valide o valor esperado e vincule o plano ao aluno via `external_reference`/`metadata` gravado na criação da preferência — nunca por dados não verificados do corpo do webhook. Garanta idempotência via restrição única de `payment_id` no banco.
- **Rotas de IA (`/api/ai/*`):** Autenticação de sessão obrigatória. Valide tamanho máximo de input e aplique rate limit via `isAiRateLimited` (`src/lib/aiProtection.ts`) para mitigar DoS e abuso de custos. A saída do modelo nunca deve ser executada nem renderizada como HTML sem sanitização estrita.
- **Proteção de Questões:** Em listagens públicas (`/api/questions`), omita `correct_answer` e `commentary` para usuários sem papel de curador/admin (`SAFE_QUESTION_COLUMNS`). Sanitize buscas dinâmicas com `sanitizePostgrestTerm` (`src/utils/security.ts`).
- **Conteúdo Médico:** Nunca altere gabaritos, assertivas ou comentários médicos em massa sem validação e curadoria humana explícita.

## Comandos Operacionais

- **Dev:** `npm run dev`
- **Definição de Pronto (Definition of Done):** `npm run lint && npm run build && npm test && npm run test:security`
- **Rodar Teste Único:** `npx tsx tests/<arquivo>.test.ts`
- **Tipos do Banco:** `npm run db:types`
- **Importar Tabelas do Supabase:** `npm run db:import` (ou comando no chat: `/import-tables`)
- **Git Seguro:** `npm run pull` e `npm run submit`. Nunca execute `git push` manual nem utilize `--no-verify`.

## Regras de Engenharia

- **Dependências:** Pergunte ao usuário antes de adicionar qualquer dependência nova ao projeto.
- **Tipagem Estrita:** Sem `any`, `as any`, `@ts-ignore` ou `@ts-expect-error` para mascarar erros.
- **Arquitetura Modular:** Mantenha arquivos sob ~350 linhas. Isole interface em `src/components/`, lógica de negócio em `src/services/` e cálculos puros em `src/utils/`. Rotas de API devem tratar erros com `try/catch` e responder JSON com status HTTP semânticos.
- **KaTeX / Fórmulas:** Delimitadores válidos obrigatórios (`$...$` inline, `$$...$$` em blocos isolados), prevenindo sintaxe crua.
- **Idioma e Convenções:**
  - UI, feedbacks e conteúdo médico: `pt-BR`.
  - Código novo (funções, componentes, tipos, variáveis genéricas e commits): `inglês`.
  - Exceção de domínio: termos médicos e colunas de banco permanecem em português para preservar fidelidade às bancas (`especialidade`, `tema`, `foco`, `subfoco`, `banca`, `gabarito`, `anulada`, `simulado`, `caderno`).
- **Preservação de Blocos:** O cabeçalho `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->` é mandatório e nunca deve ser removido.

## Stack Tecnológico

- **Frontend:** Next.js (App Router, Turbopack), React, Tailwind CSS
- **Linguagem:** TypeScript
- **Backend & Dados:** Supabase (PostgreSQL, Auth, Row Level Security, Storage)
- **Visualização & UI:** Recharts, Mermaid, Lucide React
- **Pagamentos & Automação:** Mercado Pago SDK, Playwright
