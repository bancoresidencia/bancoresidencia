<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Banco Residência — Guia Rápido de Contexto para Agentes (Token-Optimized)

Plataforma médica de alto desempenho para preparação a Residência Médica, Revalida e Especialidades (R+/Títulos), combinando banco de questões, métricas psicométricas (TRI/IRT), provas oficiais na íntegra, curadoria de gabaritos e base de conhecimento clínico.

---

## ⚡ Stack Tecnológico

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.8 + React 19.2.8 | App Router, Turbopack |
| **Estilos** | Tailwind CSS v4 | `@tailwindcss/postcss`, PostCSS |
| **Visualização** | Recharts 3.10.1 | Gráficos de evolução, radar e distribuição |
| **Ícones** | Lucide React | Biblioteca padrão de ícones |
| **Backend & Storage**| Supabase (`@supabase/supabase-js`)| Auth, Postgres, Storage (`medical-knowledge`) |
| **Automação/ETL** | Node.js (ESM), Python 3, Playwright | Crawlers, parsing de PDFs de bancas, sync de gabaritos |

---

## 📁 Estrutura Essencial do Projeto

```
bancoresidencia/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Orquestrador SPA (Dashboard, Questões, Provas, Ranking, Curadoria)
│   │   ├── layout.tsx             # Root layout (Auth & Theme providers, fontes)
│   │   └── globals.css            # Variáveis CSS e estilos base Tailwind v4
│   ├── components/                # Componentes modulares
│   │   ├── QuestionCard.tsx       # Renderizador de questão, alternativas, comentários e gabarito
│   │   ├── AdvancedQuestionFilters.tsx # Filtros multicritério (banca, área, ano, foco)
│   │   ├── StatsDashboard.tsx     # Métricas, KPIs, Recharts, TRI e percentil
│   │   ├── OfficialExams.tsx      # Visualizador de provas oficiais na íntegra
│   │   ├── ListManager.tsx        # Gestão de cadernos de questões e pastas
│   │   ├── AdminCuradoriaGabaritos.tsx # Painel de homologação de gabaritos
│   │   └── StudentHomeDashboard.tsx # Home personalizada do estudante
│   ├── context/
│   │   ├── AuthContext.tsx        # Sessão do usuário (Supabase / local fallback)
│   │   └── ThemeContext.tsx       # Gerenciamento de tema (Dark/Light/Accent)
│   ├── data/                      # Catálogos estáticos e dados médicos locais
│   │   ├── medicalKnowledgeCatalog.json # Índice dos 341 livros / 15k chunks
│   │   ├── hierarchyCounts.ts     # Contadores da árvore de especialidades
│   │   └── officialExamsData.json # Provas oficiais mapeadas
│   ├── services/
│   │   ├── questionService.ts     # Busca, filtros e paginação de questões
│   │   ├── officialExamsService.ts# Recuperação de exames na íntegra
│   │   └── medicalKnowledgeService.ts # Acesso à base de livros no Supabase
│   ├── types/
│   │   ├── index.ts               # Tipos centrais: Question, AdvancedFilterState, UserStats
│   │   ├── auth.ts                # Tipagens de usuário e sessão
│   │   └── officialExams.ts       # Estruturas de prova e caderno oficial
│   └── utils/
│       ├── irtModel.ts            # Teoria de Resposta ao Item (TRI) e score de proficiência
│       ├── percentile.ts          # Normalização e cálculo de percentil comparativo
│       └── modalidades.ts         # Agrupamentos de Residência / Revalida / R+
├── scripts/                       # Pipelines de coleta, OCR, parsing e upload de gabaritos
│   ├── safe-pull.mjs              # Pull seguro com auto-stash
│   ├── safe-submit.mjs            # Push seguro com validações
│   └── sync_knowledge_from_supabase.mjs # Sincronização da base médica
└── docs/                          # Documentação técnica e arquitetura de dados
```

---

## 🧬 Domínio e Regras de Negócio

1. **Hierarquia Clínica**:
   - `Especialidade` → `Tema` → `Foco` → `Subfoco`.
   - 21 Especialidades com 341 livros estruturados no Supabase Storage (`medical-knowledge`).
2. **Modelo de Resolução de Questões**:
   - Alternativas A-E com justificativas específicas por opção.
   - Explicação padrão-ouro: fisiopatologia, conduta, referências e mensagem "take home".
3. **Métricas Psicométricas**:
   - `irtModel.ts`: estima proficiência com base no parâmetro de discriminação ($a$), dificuldade ($b$) e acerto ao acaso ($c$).
   - `percentile.ts`: classifica desempenho relativo em faixas visuais de percentile.
4. **Curadoria de Gabaritos**:
   - Status de homologação por banca/ano (ENARE, USP, AMRIGS, PSU-MG, SES-PE, etc.).
   - Processamento contínuo em `scripts/` para resolução de gabaritos anulados ou divergentes.

---

## 🛠️ Comandos Principais

| Ação | Comando |
| :--- | :--- |
| **Iniciar Dev** | `npm run dev` (porta 3000 com Turbopack) |
| **Lint** | `npm run lint` |
| **Testar Modelo TRI** | `npm run test:irt` |
| **Git Pull Seguro** | `npm run pull` ou `pull.bat` (executa `safe-pull.mjs`) |
| **Git Push Seguro** | `npm run submit` ou `submit.bat` (executa `safe-submit.mjs`) |
| **Sync Base Médica** | `npm run pull:knowledge` (baixa chunks do Supabase Storage) |
| **Status Gabaritos** | `npm run status:gabaritos` |

---

## 🤖 Diretrizes Críticas para Agentes (Token Optimization)

- **Leituras Cirúrgicas**: O arquivo `src/app/page.tsx` possui ~2.000 linhas e arquivos em `src/data/` possuem dezenas de milhares de linhas. **Nunca carregue arquivos inteiros quando apenas trechos específicos forem necessários**. Use `view_file` com `StartLine` e `EndLine`, ou `grep_search`.
- **Edições Modulares**: Prefira editar subcomponentes dedicados em `src/components/` ou utilitários em `src/utils/` antes de inflar o `page.tsx`.
- **Preserve o Bloco Next.js**: Não remova o bloco `<!-- BEGIN:nextjs-agent-rules -->` deste arquivo; ele é sincronizado automaticamente pelo Next.js.
- **Segurança de Git**: Ao sugerir ou executar sincronizações no repositório, utilize sempre `safe-pull.mjs` e `safe-submit.mjs` para evitar perdas em arquivos de curadoria não versionados.
- **Tipagem Estrita**: Respeite os tipos em `src/types/index.ts`. Qualquer campo adicionado a `Question` ou `AdvancedFilterState` deve ser tipado e propagado de forma retrocompatível.
