# 📊 Relatório Estratégico de Provas, Instituições e Cobertura de Gabaritos

> **Data de Atualização:** 20 de Outubro de 2026  
> **Universo Analisado:** Base canônica consolidada das 7 grandes áreas médicas (`cirurgia`, `clinica_medica`, `ginecologia`, `obstetricia`, `pediatria`, `medicina_preventiva`, `urologia`).  
> **Status de Execução:** ✅ **Etapa QuestMed Concluída & Homologada** (+9.781 gabaritos oficiais homologados em ordem decrescente de 2026 a 2011 e 36.538 novas questões preservadas em Staging).  
> **Arquivos Exportados:**
> * 📄 Planilha Geral de Provas: [`relatorio_provas_instituicoes_ano.csv`](file:///d:/bancoresidencia/data/relatorio_provas_instituicoes_ano.csv) (1.624 provas mapeadas)
> * 📄 Mapeamento Estratégico de Faltantes $\ge 20$: [`provas_faltantes_gt20_etapas.csv`](file:///d:/bancoresidencia/data/provas_faltantes_gt20_etapas.csv) (570 provas restantes classificadas)
> * 📄 Relatório Estruturado JSON: [`relatorio_precoleta_etapas.json`](file:///d:/bancoresidencia/data/relatorio_precoleta_etapas.json)
> * 📄 Banco de Staging para Próxima Expansão: [`data/questmed_extracted_exams.db`](file:///d:/bancoresidencia/data/questmed_extracted_exams.db) (36.538 novas questões com filtros e comentários)
> * 📄 Caderno de Questões Rápidas ($\le 10$ pendências): [`questoes_faltantes_max10.csv`](file:///d:/bancoresidencia/data/questoes_faltantes_max10.csv) (2.035 questões em 707 provas)

---

## 🎯 1. Sumário Executivo & Grandes Números

| Indicador | Quantidade | Evolução Pós-QuestMed |
| :--- | :---: | :--- |
| **Total de Questões Únicas no Banco** | **132.965** | Desduplicação estrita por UUID / Código |
| **Total de Provas Distintas Identificadas** | **1.624** | Agrupamento por Instituição × Banca × Ano × Caderno |
| **Total de Instituições Mapeadas** | **288** | Cobertura nacional (Residência, Revalida e R+) |
| **Intervalo Temporal Coberto** | **2010 — 2027** | 18 anos de processos seletivos oficiais |
| **Questões com Gabarito Oficial Homologado** | **92.365** | 🟢 **+9.781 novas questões gabaritadas** |
| **Questões Anuladas Oficialmente** | **3.637** | Anuladas pela banca (consideradas resolvidas) |
| **Questões Discursivas (2ª Fase / Isoladas)** | **1.793** | Questões dissertativas sem gabarito de múltipla escolha |
| **Total de Questões Auditadas / Resolvidas** | **97.795** | 🚀 **73,55%** de cobertura global do banco (+7,36% absoluto) |
| **Total de Questões Pendentes de Gabarito** | **35.170** | 📉 **Redução líquida de -9.781 pendências** |
| **Provas com $\ge 20$ Questões Faltantes** | **570 provas** | 🏆 **-170 provas críticas eliminadas** (de 740 para 570) |
| **Questões Concentradas em Provas $\ge 20$** | **32.436** | 📉 **Redução de -10.383 pendências concentradas** |
| **Novas Questões Preservadas em Staging** | **36.538** | 📦 Armazenadas com enunciado, alternativas, filtros e comentários |

---

## 📅 2. Distribuição e Evolução Temporal por Ano

| Ano | Provas | Questões Únicas | Gabaritos Válidos | Anuladas | Discursivas | Faltantes | % Cobertura | Status Dominante |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2027** | 2 | 200 | 101 | 0 | 0 | 99 | **50,5%** | 🟡 Em captação inicial |
| **2026** | 94 | 8.203 | 3.090 | 192 | 100 | 4.821 | **41,2%** | 🟡 +1.990 gabaritos homologados |
| **2025** | 103 | 8.553 | 4.355 | 217 | 135 | 3.846 | **55,0%** | 🟢 +1.502 gabaritos homologados |
| **2024** | 104 | 8.693 | 4.891 | 263 | 160 | 3.379 | **61,1%** | 🟢 +996 gabaritos homologados |
| **2023** | 119 | 9.757 | 4.958 | 293 | 115 | 4.391 | **55,0%** | 🟢 +1.330 gabaritos homologados |
| **2022** | 122 | 9.738 | 4.770 | 267 | 114 | 4.587 | **52,9%** | 🟢 +1.531 gabaritos homologados |
| **2021** | 133 | 10.114 | 4.703 | 300 | 65 | 5.046 | **50,1%** | 🟢 +1.438 gabaritos homologados |
| **2020** | 162 | 13.139 | 7.886 | 311 | 127 | 4.815 | **63,4%** | 🟢 Boa cobertura (+436) |
| **2019** | 164 | 13.733 | 12.774 | 341 | 231 | 387 | **97,2%** | ✅ Praticamente blindado |
| **2018** | 162 | 13.153 | 12.188 | 394 | 98 | 473 | **96,4%** | ✅ Praticamente blindado |
| **2017** | 160 | 12.894 | 11.924 | 359 | 173 | 438 | **96,6%** | ✅ Praticamente blindado |
| **2016** | 139 | 11.345 | 9.813 | 341 | 212 | 979 | **91,4%** | 🟢 Alta densidade |
| **2015** | 133 | 10.992 | 8.739 | 309 | 243 | 1.701 | **84,5%** | 🟢 Boa densidade |
| **2014** | 13 | 1.245 | 1.078 | 21 | 5 | 141 | **88,7%** | 🟢 Histórico estável |
| **2013** | 6 | 575 | 528 | 19 | 5 | 23 | **96,0%** | 🟢 Histórico estável |
| **2012** | 3 | 275 | 254 | 1 | 5 | 15 | **94,5%** | 🟢 Histórico blindado |
| **2011** | 3 | 275 | 240 | 8 | 5 | 22 | **92,0%** | 🟢 Histórico blindado |
| **2010** | 2 | 81 | 73 | 1 | 0 | 7 | **91,4%** | ✅ Histórico blindado |
| **Total** | **1.624** | **132.965** | **92.365** | **3.637** | **1.793** | **35.170** | **73,55%** | — |

---


## 🏆 3. Balanço da Execução da Etapa 1 (`provaderesidencia.com.br`)

A **Etapa 1** foi concluída com êxito integral:
1. **Download de Provas Alvo:** As 8 provas pendentes liberadas no site (`#627`, `#102`, `#841`, `#827`, `#658`, `#88`, `#144`, `#28`) foram baixadas na íntegra via crawler HTTP (770 questões coletadas com gabarito oficial).
2. **Casamento e Homologação:** O cruzamento das 85.842 questões do acervo Prova de Residência com a base canônica resultou na homologação de **1.689 questões** distribuídas nas 6 especialidades:
   * **Clínica Médica:** 424 questões homologadas
   * **Medicina Preventiva:** 379 questões homologadas
   * **Pediatria:** 276 questões homologadas
   * **Cirurgia Geral:** 250 questões homologadas
   * **Obstetrícia:** 180 questões homologadas
   * **Ginecologia:** 180 questões homologadas
3. **Implantação no Banco Supabase:**
   * Sincronização executada via API REST com chave administrativa (`SERVICE_ROLE_KEY`).
   * **86.792 registros atualizados no Supabase** com tempo total de 209,8s e **0 erros**.
   * Auditoria de conferência direta comprovou a presença dos campos `correct_answer` e `commentary` na tabela remota `questions`.
4. **Impacto em Provas Blindadas:**
   * O número de provas com **100% de gabarito resolvido saltou de 217 para 266 provas (+49 provas completas)**.
   * 17 provas deixaram o grupo crítico de $\ge 20$ faltantes.

---

## 🚀 4. Próximos Passos: Etapas 2 e 3

Com a Etapa 1 finalizada, o foco estratégico avança para o funil restante:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FUNIL RESTANTE DE PROVAS COM >= 20 FALTANTES: 740 PROVAS (42.819 QUESTÕES)            │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
     ┌───────────────────────────────────┴───────────────────────────────────┐
     ▼                                                                       ▼
┌─────────────────────────────────────────┐             ┌─────────────────────────────────────────┐
│ ETAPA 2: BANCAS OFICIAIS NA WEB         │             │ ETAPA 3: SITES AVULSOS / HOSPITAIS      │
│ Provas com portal oficial aberto        │             │ Processos locais e faculdades isoladas  │
├─────────────────────────────────────────┤             ├─────────────────────────────────────────┤
│ 43 Provas Consolidadas                  │             │ 201 Provas Regionais                    │
│ (2.417 questões faltantes)              │             │ (13.210 questões faltantes)             │
│                                         │             │                                         │
│ Portais: FGV Conhecimento (ENARE),      │             │ Varrer repositórios institucionais,     │
│ FUVEST (USP), VUNESP (UNESP/Einstein),  │             │ sites de fundações hospitalares e       │
│ Comvest (UNICAMP), AREMG (PSU-MG),      │             │ agregadores (PCI, Estratégia, etc.)     │
│ SURCE, FAURGS (HCPA), UPENET (SES-PE)   │             │                                         │
└─────────────────────────────────────────┘             └─────────────────────────────────────────┘
```

---

## 🛠️ Arquivos Técnicos Atualizados

* Planilha de Provas Geral: [`data/relatorio_provas_instituicoes_ano.csv`](file:///d:/bancoresidencia/data/relatorio_provas_instituicoes_ano.csv)
* Planilha de Provas $\ge 20$ Faltantes (Atualizada Pós-Etapa 1): [`data/provas_faltantes_gt20_etapas.csv`](file:///d:/bancoresidencia/data/provas_faltantes_gt20_etapas.csv)
* Resumo Estruturado em JSON: [`data/relatorio_provas_resumo.json`](file:///d:/bancoresidencia/data/relatorio_provas_resumo.json)
* Manifesto dos Matches da Etapa 1: [`data/etapa1_matches_manifest.json`](file:///d:/bancoresidencia/data/etapa1_matches_manifest.json)
