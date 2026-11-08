# Relatório Técnico de Reavaliação e Auditoria: Isolamento das Modalidades (Staging Unificado)

**Data da Auditoria:** 2026-11-07 18:48:51  
**Banco Auditado:** `data/staging_expansion_unified.db`  
**Escopo:** Diagnóstico da discrepância anterior de R+, identificação da causa raiz e normalização determinística das 4 modalidades.

---

## 1. Diagnóstico da Discrepância de R+ (57.296 vs. 23.741)

Uma investigação forense detalhada nos arquivos históricos e nos metadados brutos identificou **a causa exata da diferença**:

### A. Origem do número 57.296 no Relatório Anterior (`RELATORIO_CLASSIFICACAO_INSTITUICOES_MODALIDADES.md`):
No relatório anterior, a análise contemplava o banco consolidado completo de **258.953 questões**:
* **12.954 questões R+** já existentes na Base Ativa Original (`data/*_final_questions.json`);
* **44.342 questões R+** presentes no arquivo anterior de expansão (`expansao_ineditas_consolidadas.jsonl`, que incluía QuestMed, ProvasRes e Hardwork).
* **Soma:** 12.954 + 44.342 = **57.296 questões de R+**.

### B. A Causa Raiz do número 23.741 no Staging Recém-Criado:
No primeiro pipeline de unificação recém-executado, **ocorreram duas falhas de atribuição de modalidade**:
1. **Ocultação de R3CG no Hardwork:**  
   No Hardwork existem **24.912 questões de R3 de Cirurgia Geral (`grupo: R3CG`)**. No entanto, dentro do objeto JSON de cada questão, o campo `modalidade` vinha preenchido genericamente como `"Residência Médica"`. Como o script de ingestão anterior priorizou `q.get('modalidade')`, o metadado oficial da prova (`grupo: R3CG`) foi ignorado, jogando todas as 24.912 questões de Cirurgia R+ para Acesso Direto!
2. **Sobrescrita pelo Anchor do QuestoesDeResidencia:**  
   O `questoesderesidencia` (Prioridade 1) possui todo o seu acervo rotulado genericamente como `"R1 - ACESSO DIRETO"`. Quando uma questão de R3 de Cirurgia ou Clínica coincidia com uma questão do QuestoesDeResidencia, a regra de âncora do primeiro teste manteve `"R1 - ACESSO DIRETO"`, apagando a modalidade específica de subespecialidade.

---

## 2. Correção Implementada e Resultado Auditado

Com a correção definitiva:
1. O metadado oficial do catálogo de provas (`provaMeta.grupo == 'R3CG'` e `R3CM`) foi devidamente resgatado;
2. Aplicou-se o princípio do **Filtro Mais Significativo em Nível de Cluster**: se **qualquer** fonte do cluster demonstrar que a questão pertenceu a um concurso de R3/R4/R-sub, a questão é classificada como **`R+`**;
3. O mesmo princípio foi estendido para **`Título de Especialista`** (TEGO, TECM) e **`Revalida`** (INEP, UFMT).

### Balanço Final Corrigido (220.751 Questões Unificadas):

| Modalidade Canônica | Tabela Física Dedicada | Volume Corrigido | Participação (%) | Variação vs. Teste Prévio |
| :--- | :--- | :---: | :---: | :---: |
| **Residência Médica (Acesso Direto)** | `staging_residencia_acesso_direto` | **164.870** | **74,69%** | -26.788 (reclassificadas corretamente para R+) |
| **R+ (Pré-Requisito / Especialidades)** | `staging_r_plus` | **50.582** | **22,91%** | **+26.841 questões (saltou de 23,7k para 50,5k!)** |
| **Revalida** | `staging_revalida` | **4.429** | **2,01%** | Auditado (INEP, UFMT, UEPA, USP Revalida) |
| **Título de Especialista** | `staging_titulo_especialista` | **870** | **0,39%** | TEGO (824) e TECM (46) |
| **TOTAL CONSOLIDADO** | — | **220.751** | **100,00%** | **Divergência: ZERO** |

> [!IMPORTANT]
> **Conclusão:**  
> O volume real e auditado de questões únicas de **R+ no novo banco de expansão unificado é de exatamente 50.582 questões** (22,91% de todo o acervo).  
> Ao somarmos essas 50.582 questões inéditas de expansão às ~13.000 questões de R+ já existentes na base ativa, o Banco Residência ultrapassará **63.500 questões de R+**, superando com folga o marco histórico anterior de 57.296!

---

## 3. Top Instituições Mapeadas em R+ (50.582 Questões)

* **USP - Universidade de São Paulo:** 3.824 questões de R+
* **UNICAMP - Universidade Estadual de Campinas:** 3.298 questões de R+
* **UNESP - Universidade Estadual Paulista:** 2.949 questões de R+
* **IAMSPE - Hospital do Servidor Estadual:** 2.768 questões de R+
* **UNIFESP - Universidade Federal de São Paulo:** 2.227 questões de R+
* **FMABC - Faculdade de Medicina do ABC:** 1.842 questões de R+
* **SES-RJ - Secretaria Estadual do Rio de Janeiro:** 1.705 questões de R+
* **SES-PE - Secretaria Estadual de Pernambuco:** 1.542 questões de R+
* **AMP - Associação Médica do Paraná:** 1.487 questões de R+
* **ENARE R+ - Exame Nacional:** 785 questões de R+
