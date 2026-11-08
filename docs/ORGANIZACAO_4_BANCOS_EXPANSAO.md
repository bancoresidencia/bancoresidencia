# Organização Arquitetural dos 4 Bancos Modulares de Expansão (Staging)

> **Status:** 100% Organizado, Isolado e Indexado  
> **Ambiente:** Staging Local (`data/bancos_organizados_staging/`)  
> **Integração Ativa:** NENHUMA (Banco ativo e Supabase mantidos 100% intocados)

---

## 1. Visão Geral da Arquitetura

Para viabilizar a futura implementação no **Banco Residência** sem sobrecarregar o banco de produção e permitindo curadoria cirúrgica por frente de estudo, o universo de **220.751 questões deduplicadas e higienizadas** foi organizado fisicamente em **4 bancos de dados SQLite independentes, autônomos e pré-indexados**.

```
data/
└── bancos_organizados_staging/
    ├── residencia_acesso_direto.db      # 164.870 questões (Acesso Direto R1)
    ├── r_plus.db                        # 50.582 questões (R+ / Especialidades Pré-Requisito)
    ├── revalida.db                      # 4.429 questões (INEP / Revalida Universidades)
    ├── titulo_especialista.db           # 870 questões (TEGO, TECM, Sociedades Médicas)
    └── manifesto_geral_bancos.json      # Catálogo e métricas de qualidade
```

---

## 2. Especificação dos 4 Bancos

| Banco / Arquivo | Modalidade Canônica | Volume Líquido | Faixa de Anos | Principais Instituições | Índices Ativos |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `residencia_acesso_direto.db` | `Residência Médica` | **64.531** | 2009 a 2027 | FAMERP, USP, UNICAMP, AMRIGS, PSU-MG, ENARE, SES-PE, SES-RJ, PUCPR, HCPA... | `ano`, `instituicao`, `banca`, `especialidade`, `tema`, `foco`, `gabarito`, `is_anulada`, `tipo_origem` |
| `r_plus.db` | `R+ Cirurgia / Clínica / Pediatria / GO` | **50.582** | 2009 a 2027 | USP, UNICAMP, IAMSPE, UNESP, FMABC, USP-RP, UNIFESP, AMP... | `ano`, `instituicao`, `banca`, `especialidade`, `tema`, `foco`, `gabarito`, `is_anulada` |
| `revalida.db` | `Revalida` | **4.429** | 2004 a 2026 | INEP (Revalida Nacional), UFMT, USP, UFES... | `ano`, `instituicao`, `banca`, `especialidade`, `tema`, `foco`, `gabarito`, `is_anulada` |
| `titulo_especialista.db` | `Título de Especialista` | **870** | 2011 a 2026 | TEGO (FEBRASGO), TECM (AMB/SBCM)... | `ano`, `instituicao`, `banca`, `especialidade`, `tema`, `foco`, `gabarito`, `is_anulada` |
| **TOTAL EXPANSÃO** | *4 modalidades 100% purificadas* | **120.412** | — | **Zero duplicatas com o banco ativo e zero concursos gerais** | *Pronto para consumo* |

---

## 3. Modelo Canônico e Compatibilidade com o Frontend

Todos os 4 bancos possuem o mesmo esquema padronizado na tabela `questoes`. Os campos mapeiam diretamente para a interface `Question` definida em [`src/types/index.ts`](file:///d:/bancoresidencia/src/types/index.ts):

| Campo SQLite | Tipo | Interface `Question` (Next.js) | Descrição |
| :--- | :--- | :--- | :--- |
| `id_staging` | INTEGER | `id: string` (ex: `"exp_129045"`) | Identificador único estável do staging |
| `enunciado` | TEXT | `statement: string` | Texto completo e limpo da questão |
| `opcoes_json` | TEXT (JSON) | `options: QuestionOption[]` | Lista estruturada `[{"letter": "A", "text": "..."}]` |
| `gabarito` | TEXT | `correctAnswer: 'A'\|'B'\|'C'\|'D'\|'E'` | Letra do gabarito homologado |
| `is_anulada` | INTEGER | `isAnulada: boolean` | Flag booleana de anulação |
| `ano` | INTEGER | `year: number` | Ano do concurso |
| `instituicao` | TEXT | `institution: string` | Nome da instituição médica |
| `banca` | TEXT | `banca: string` | Banca examinadora organizadora |
| `modalidade` | TEXT | `modalidade: StudyModalidade` | Modalidade de estudo isolada |
| `especialidade` | TEXT | `especialidade: string` | Especialidade clínica associada |
| `tema` | TEXT | `tema: string` | Tema médico |
| `foco` | TEXT | `foco: string` | Foco semiológico / cirúrgico |
| `subfoco` | TEXT | `subfoco: string` | Subfoco cirúrgico / diretriz |
| `dificuldade` | TEXT | `difficulty: 'Fácil'\|'Médio'\|'Difícil'` | Dificuldade da questão |
| `comentarios` | TEXT | `commentary: string` | Resolução padrão-ouro / justificativa |

---

## 4. Como Acessar e Consultar (Adapter Pronto)

Foi criado o módulo utilitário [`scripts/banco_expansion_adapter.py`](file:///d:/bancoresidencia/scripts/banco_expansion_adapter.py) para permitir consultas imediatas por qualquer script ou pipeline:

```python
from scripts.banco_expansion_adapter import query_questions, get_manifest

# 1. Ler o manifesto geral dos 4 bancos
manifest = get_manifest()
print(manifest['databases']['r_plus']['total_questions']) # 50,582

# 2. Consultar questões de R+ da USP em 2024
questoes_usp_2024 = query_questions(
    modalidade_key='r_plus',
    ano=2024,
    instituicao='USP',
    limit=10
)

# Cada questão já vem mapeada no formato idêntico ao Question do frontend
for q in questoes_usp_2024:
    print(q['code'], q['institution'], q['correctAnswer'], len(q['options']))
```

---

## 5. Garantia de Segurança e Isolamento

- **Banco de Produção Intocado:** Nenhum arquivo em `src/data/` foi alterado.
- **Supabase Intocado:** Nenhuma mutação de banco remoto ou Storage foi acionada.
- **Recuperabilidade Total:** O banco mestre original `data/staging_expansion_unified.db` permanece intacto como fonte primária com o pool bruto de 482k registros.
