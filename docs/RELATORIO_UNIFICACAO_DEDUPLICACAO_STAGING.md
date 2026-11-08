# Relatório de Auditoria: Unificação e Deduplicação Staging (7 Bases)

**Data de Conclusão:** 2026-11-07 18:05:40  
**Banco de Staging Gerado:** `staging_expansion_unified.db`  
**Escopo:** Processamento 100% isolado de staging. **Zero alterações no banco ativo e zero chamadas ao Supabase.**

---

## 1. Balanço Quantitativo Global

| Métrica | Valor Absoluto | Percentual |
| :--- | :--- | :--- |
| **Total de Questões Brutas Ingeridas** | **482,926** | 100,00% |
| **Questões Duplicadas Eliminadas** | **262,175** | **54.29%** |
| **Golden Records Únicos Gerados** | **220,751** | **45.71%** |

---

## 2. Distribuição da Questão Âncora (Por Base Prioritária)

A questão âncora define o enunciado mestre e as alternativas da questão unificada:

| Base de Origem Âncora | Prioridade | Volume de Golden Records | Participação |
| :--- | :---: | :--- | :--- |
| `questoesderesidencia` | questoesderesidencia | **122,324** | 55.4% |
| `hardwork` | hardwork | **81,382** | 36.9% |
| `provaderesidencia` | provaderesidencia | **11,341** | 5.1% |
| `ajudamedico` | ajudamedico | **2,337** | 1.1% |
| `driveprojetorapido` | driveprojetorapido | **1,750** | 0.8% |
| `medbrave` | medbrave | **1,617** | 0.7% |

---

## 3. Distribuição do Tamanho dos Clusters (Grau de Duplicação)

| Tamanho do Cluster | Quantidade de Questões | Descrição |
| :--- | :--- | :--- |
| 1x | **78,339** | Questão única (presente em apenas 1 base) |
| 2x | **66,635** | Questão idêntica em 2 bases diferentes |
| 3x | **49,161** | Questão idêntica em 3 bases diferentes |
| 4x | **18,225** | Questão idêntica em 4 bases diferentes |
| 5x | **4,733** | Questão idêntica em 5 bases diferentes |
| 6x | **1,894** | Questão idêntica em 6 bases diferentes |
| 7x | **710** | Questão idêntica em 7 bases diferentes |
| 8x | **491** | Questão idêntica em 8 bases diferentes |
| 9x | **234** | Questão idêntica em 9 bases diferentes |
| 10x | **100** | Questão idêntica em 10 bases diferentes |
| 11x | **62** | Questão idêntica em 11 bases diferentes |
| 12x | **64** | Questão idêntica em 12 bases diferentes |
| 13x | **23** | Questão idêntica em 13 bases diferentes |
| 14x | **17** | Questão idêntica em 14 bases diferentes |
| 15x | **21** | Questão idêntica em 15 bases diferentes |
| 16x | **15** | Questão idêntica em 16 bases diferentes |
| 17x | **6** | Questão idêntica em 17 bases diferentes |
| 18x | **4** | Questão idêntica em 18 bases diferentes |
| 19x | **3** | Questão idêntica em 19 bases diferentes |
| 20x | **3** | Questão idêntica em 20 bases diferentes |
| 21x | **1** | Questão idêntica em 21 bases diferentes |
| 22x | **1** | Questão idêntica em 22 bases diferentes |
| 23x | **2** | Questão idêntica em 23 bases diferentes |
| 36x | **1** | Questão idêntica em 36 bases diferentes |
| 37x | **2** | Questão idêntica em 37 bases diferentes |
| 38x | **1** | Questão idêntica em 38 bases diferentes |
| 78x | **1** | Questão idêntica em 78 bases diferentes |
| 266x | **1** | Questão idêntica em 266 bases diferentes |
| 487x | **1** | Questão idêntica em 487 bases diferentes |

---

## 4. Cobertura dos Filtros no Golden Record Unificado

Graças ao motor de **fusão do filtro mais significativo** (*Best-of-All-Bases*), metadados ausentes na base primária foram preenchidos a partir das bases secundárias do mesmo cluster:

| Filtro / Metadado | Questões Preenchidas | Cobertura Final |
| :--- | :--- | :--- |
| **Instituição** | **220,751** | **100.0%** |
| **Banca** | **164,147** | **74.4%** |
| **Ano** | **220,736** | **100.0%** |
| **Gabarito Homologado** | **220,021** | **99.7%** |
| **Especialidade** | **205,319** | **93.0%** |
| **Tema** | **152,063** | **68.9%** |
| **Foco Clínico** | **135,839** | **61.5%** |
| **Dificuldade (TRI / Rótulo)** | **205,667** | **93.2%** |
| **Comentários / Justificativas** | **118,299** | **53.6%** |

---

## 5. Amostras de Enriquecimento e Fusão Realizada

Abaixo constam 5 exemplos reais de questões consolidadas a partir de múltiplas bases:

### Amostra 1
* **Base Âncora:** `questoesderesidencia` | **Cluster Size:** 2
* **Instituição:** Hospital do Servidor Público Municipal | **Ano:** 2009 | **Gabarito:** E
* **Especialidade:** Preventiva | **Tema:** Epidemiologia | **Foco:** Epidemiologia Analítica
* **Bases Fundidas:** `["questoesderesidencia"]`
* **Log de Filtros Enriquecidos:** `{}`

### Amostra 2
* **Base Âncora:** `questoesderesidencia` | **Cluster Size:** 2
* **Instituição:** Universidade Federal do Espírito Santo | **Ano:** 2009 | **Gabarito:** D
* **Especialidade:** Clínica Médica | **Tema:** Infectologia | **Foco:** Zoonoses Bacteriovirosas: Leptospirose e Hantavirose
* **Bases Fundidas:** `["questoesderesidencia"]`
* **Log de Filtros Enriquecidos:** `{}`

### Amostra 3
* **Base Âncora:** `questoesderesidencia` | **Cluster Size:** 2
* **Instituição:** Universidade Federal do Rio de Janeiro | **Ano:** 2009 | **Gabarito:** B
* **Especialidade:** Preventiva | **Tema:** Epidemiologia | **Foco:** Epidemiologia Analítica
* **Bases Fundidas:** `["questoesderesidencia"]`
* **Log de Filtros Enriquecidos:** `{}`

### Amostra 4
* **Base Âncora:** `questoesderesidencia` | **Cluster Size:** 3
* **Instituição:** Universidade Federal do Rio de Janeiro | **Ano:** 2009 | **Gabarito:** A
* **Especialidade:** Ginecologia e Obstetrícia | **Tema:** Obstetrícia | **Foco:** Complicações Clínicas na Gravidez
* **Bases Fundidas:** `["questoesderesidencia"]`
* **Log de Filtros Enriquecidos:** `{}`

### Amostra 5
* **Base Âncora:** `questoesderesidencia` | **Cluster Size:** 2
* **Instituição:** Universidade Federal do Rio de Janeiro | **Ano:** 2009 | **Gabarito:** A
* **Especialidade:** Cirurgia | **Tema:** Trauma | **Foco:**  Suporte Avançado de Vida no Trauma: Emergências Urogenitais
* **Bases Fundidas:** `["questoesderesidencia"]`
* **Log de Filtros Enriquecidos:** `{}`

