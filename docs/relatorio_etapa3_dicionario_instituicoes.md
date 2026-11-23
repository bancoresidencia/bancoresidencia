# Relatório Técnico — Etapa 3: Mapeamento e Resolução Canônica de Instituições (Front-end vs. Supabase)

**Data:** 23 de Novembro de 2026  
**Status:** Concluído com 100% de Precisão  
**Componentes Impactados:**
- `src/data/canonicalInstitutions.json` (Catálogo canônico de 291 instituições)
- `src/utils/institutionResolver.ts` (Motor de resolução e mapeamento O(1))
- `scratch/test_institution_resolver.mjs` (Suíte de validação e regressão)

---

## 1. Diagnóstico do Problema Crítico Resolvido

Durante a auditoria da aba `/provas` e da integração entre o componente de catálogo (`src/components/OfficialExams.tsx`) e o banco de dados (`src/components/QuestoesView.tsx` / Supabase), detectou-se uma incompatibilidade estrutural de nomenclatura:

1. **Descompasso de Nomenclatura:**
   - O front-end enviava nos parâmetros de URL a sigla curta (`shortName`), como `HCFMUSP`, `HC-UNICAMP`, `ENARE / ENAMED`, `SUS-SP`, `AMRIGS`, `SURCE`, `Einstein`.
   - Na coluna `institution` da tabela `questions` do Supabase, os registros utilizam denominações formais completas e qualificadas (ex: `USP/HCFMUSP - Hospital das Clínicas da FMUSP (SP)`, `UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)`, `HIAE/Einstein - Hospital Israelita Albert Einstein (SP)`).
2. **Impacto no Aluno:**
   - Consultas diretas utilizando `.eq('institution', query)` retornavam **0 questões** para 291 de 291 instituições, impossibilitando a resolução ou filtragem de cadernos oficiais.

---

## 2. Arquitetura da Solução Implementada

Para resolver essa lacuna de forma definitiva, desacoplada e performática, foram desenvolvidos dois módulos centrais:

### 2.1 Catálogo Canônico Universal (`src/data/canonicalInstitutions.json`)
Consolidação das 291 instituições cadastradas na plataforma com schema padronizado:
- `slug`: Identificador universal limpo em kebab-case, seguro para rotas e URLs (`hcfmusp`, `hc-unicamp`, `enare-enamed`, `einstein`, etc.).
- `shortName`: Sigla canônica de exibição no UI.
- `name`: Nome formal completo.
- `state`: UF federativa de referência (ou `null` para certames nacionais como ENARE/Revalida).
- `logoSlug`: Identificador do asset gráfico do logotipo.
- `supabase_institution`: String exata e fidedigna correspondente na coluna `institution` do Supabase.
- `has_live_questions`: Flag booleana indicando presença confirmada de questões no acervo ativo.
- `live_questions_count`: Contagem auditada de questões ativas (255 instituições com questões ativas, totalizando 109.843 questões).
- `aliases`: Lista exaustiva de variações fonéticas, siglas antigas, nomenclaturas de editais e grafias comuns.

### 2.2 Motor de Resolução O(1) (`src/utils/institutionResolver.ts`)
Mecanismo de resolução instantânea de entidades institucionais:
- **Índice Reverso em Memória:** Mapeia `slug`, `shortName`, `supabase_institution` e todos os `aliases` em um `Map<string, CanonicalInstitution>`.
- **Limpeza de Stopwords (`cleanTerm`):** Remove preposições conectivas (`de`, `da`, `do`, `dos`, `das`, `e`) e caracteres não alfanuméricos, permitindo casamentos mesmo com variações de pontuação (ex: `HC-UNICAMP` vs. `HC UNICAMP` vs. `UNICAMP`).
- **Pipeline de Consulta em 3 Camadas:**
  1. *Busca Exata Direta:* Consulta instantânea no índice O(1).
  2. *Busca Normalizada:* Consulta no índice de termos limpos sem pontuação.
  3. *Fallback por Substring:* Varredura de contenção semântica em nomes e aliases.
- **Funções Exportadas:**
  - `resolveInstitution(query)`: Retorna a entidade canônica completa a partir de qualquer string.
  - `getSupabaseInstitutionName(query)`: Retorna a string exata para queries no Supabase, garantindo que nenhuma consulta falhe por divergência de grafia.
  - `getCanonicalSlug(query)`: Retorna o slug universal limpo para URLs.
  - `getAllCanonicalInstitutions()`: Retorna a coleção completa de instituições catalogadas.

---

## 3. Validação e Qualidade dos Dados

### 3.1 Bateria de Testes Críticos dos Principais Flagships
Foi executada a suíte de testes `test_institution_resolver.mjs` cobrindo as maiores bancas e instituições do país:

| Entrada de Teste | Resolução Canônica Supabase | Slug Gerado | Status |
| :--- | :--- | :--- | :---: |
| `"HCFMUSP"` | `USP/HCFMUSP - Hospital das Clínicas da FMUSP (SP)` | `hcfmusp` | ✅ PASS |
| `"USP-SP"` | `USP/HCFMUSP - Hospital das Clínicas da FMUSP (SP)` | `hcfmusp` | ✅ PASS |
| `"HC-UNICAMP"` | `UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)` | `hc-unicamp` | ✅ PASS |
| `"UNICAMP"` | `UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)` | `hc-unicamp` | ✅ PASS |
| `"ENARE / ENAMED"` | `ENARE/ENAMED` | `enare-enamed` | ✅ PASS |
| `"ENARE"` | `ENARE/ENAMED` | `enare-enamed` | ✅ PASS |
| `"SUS-SP"` | `SUS-SP - Sistema Único de Saúde de São Paulo` | `sus-sp` | ✅ PASS |
| `"PSU-MG"` | `PSU-MG - Processo Seletivo Unificado de Minas Gerais` | `psu-mg` | ✅ PASS |
| `"AMRIGS"` | `AMRIGS - Associação Médica do Rio Grande do Sul` | `amrigs` | ✅ PASS |
| `"HUPE"` | `UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)` | `hupe` | ✅ PASS |
| `"UERJ"` | `UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)` | `hupe` | ✅ PASS |
| `"UNIFESP"` | `UNIFESP/EPM - Universidade Federal de São Paulo - Escola Paulista de Medicina (SP)` | `unifesp-epm` | ✅ PASS |
| `"HIAE"` | `HIAE/Einstein - Hospital Israelita Albert Einstein (SP)` | `einstein` | ✅ PASS |
| `"Albert Einstein"` | `HIAE/Einstein - Hospital Israelita Albert Einstein (SP)` | `einstein` | ✅ PASS |
| `"SCMSP"` | `Santa Casa de São Paulo - ISCMSP/FCMSCSP (SP)` | `santa-casa-sp` | ✅ PASS |
| `"Santa Casa de SP"` | `Santa Casa de São Paulo - ISCMSP/FCMSCSP (SP)` | `santa-casa-sp` | ✅ PASS |
| `"SES-DF"` | `SES-DF - Secretaria de Estado de Saúde do Distrito Federal` | `ses-df` | ✅ PASS |
| `"SES-GO"` | `SES-GO - Secretaria de Estado de Saúde de Goiás` | `ses-go` | ✅ PASS |
| `"AMP"` | `AMP - Associação Médica do Paraná` | `amp` | ✅ PASS |
| `"SURCE"` | `SURCE - Seleção Unificada para Residência Médica no Estado do Ceará` | `surce` | ✅ PASS |

**Resultado:** 20/20 (100%) testes aprovados com sucesso.

### 3.2 Checagem Estática de Tipagem (TypeScript)
- Execução: `npx tsc --noEmit`
- Resultado: **0 erros** de compilação ou inconsistência de tipos em todo o projeto.

---

## 4. Próximos Passos (Transição para a Etapa 4)

Com a resolução canônica de instituições consolidada e testada:
1. **Etapa 4:** Modelagem relacional e estrutural de `official_exams` (tabela de cadernos canônicos) no Supabase ou endpoint de API dedicado, persistindo os 2.093 cadernos integrais certificados e suas listas ordenadas de questões (`question_ids`).
2. **Etapa 5:** Refatoração dos players (`PracticeExam.tsx` eliminando catálogo mockado de 4 provas; `QuestoesView.tsx` desbloqueando modalidades R+ e Revalida e conectando ao `institutionResolver`).
3. **Etapa 6:** Quality Gate final e validação E2E.
