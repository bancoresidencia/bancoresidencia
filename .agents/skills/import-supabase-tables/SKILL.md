---
name: import-supabase-tables
description: Importa ou sincroniza diretamente para o ambiente local as tabelas canônicas do Supabase (questions, questions_expansion_r_plus, questions_expansion_direto, questions_expansion_revalida e questions_expansion_titulo_especialista) e integra o banco local de expansão provaderesidencia_coleta_parte2.db em formatos JSON e SQLite relacional unificado.
---

# Importação Canônica de Tabelas do Supabase

Use esta skill ou execute este comando imediatamente sempre que o usuário solicitar:
- "importe as tabelas do supabase"
- "/import-tables"
- "sincronize as questões do supabase"
- "atualize a base local com o supabase"

## Procedimento de Execução Imediata

Quando o usuário enviar a solicitação, acione a ferramenta `run_command` com o comando:

```bash
node scripts/import_supabase_target_tables.mjs
```

### Tabelas Alvo Exportadas & Integradas:
1. `questions_expansion_titulo_especialista` (Supabase)
2. `questions_expansion_revalida` (Supabase)
3. `questions_expansion_r_plus` (Supabase)
4. `questions_expansion_direto` (Supabase)
5. `questions` (Supabase)
6. `provaderesidencia_coleta_parte2.db` (Provas, questões e imagens da coleta local)

### Saídas Geradas Automaticamente:
- **Diretório Canônico:** `data/supabase_tables/` contendo cada tabela em `.json` e `.db`
- **Banco Relacional:** `data/supabase_tables/supabase_tables.db` com índices otimizados (incluindo tabelas `provaderesidencia_questoes`, `provaderesidencia_provas`, `provaderesidencia_imagens_arquivo`)
- **Base Prova de Residência:** `data/supabase_tables/provaderesidencia_coleta_parte2.db`, `provaderesidencia_questoes.json` e `provaderesidencia_provas.json`
- **Links Rápidos:** `data/tables/` e `data/`
- **Manifesto Criptográfico:** `data/supabase_tables/manifest.json` com contagens exatas e hashes SHA-256.

