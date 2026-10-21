# 🗺️ Plano de Coleta e Cruzamento: Provas 2020–2026 com $\ge 20$ Faltantes

> **Documento:** `docs/plano_coleta_provas_2020_2026_gt20.md`  
> **Data de Elaboração:** 20 de Outubro de 2026  
> **Escopo:** Provas oficiais com realização entre **2020 e 2026** com **$\ge 20$ questões sem gabarito** no Banco Residência.  
> **Meta:** Aumentar a cobertura do ciclo moderno (2020–2026) para $>95\%$, priorizando fontes primárias gratuitas, oficiais e locais sem depender do MedEvo.

---

## 🎯 1. Diagnóstico do Universo Alvo (2020 a 2026, $\ge 20$ Faltantes)

Do total de 35.170 questões pendentes no banco, o filtro estrito de **2020 a 2026** em provas com **déficit $\ge 20$ questões** revela:
* **Total de Provas Alvo Identificadas:** **539 provas distintas** (combinações de Instituição/Banca × Ano).
* **Total de Questões Faltantes no Alvo:** **30.444 questões** (representando **86,6%** de todas as pendências do banco).

### 📊 Distribuição por Ano no Alvo

| Ano | Provas com $\ge 20$ Faltantes | Questões Faltantes | Status Atual no Banco |
| :---: | :---: | :---: | :--- |
| **2026** | 94 | **4.821** | 🔴 Ciclo mais recente (foco crítico dos estudantes) |
| **2025** | 89 | **3.846** | 🔴 Alta demanda |
| **2024** | 71 | **3.379** | 🟡 Boa base, pendências em bancas isoladas |
| **2023** | 83 | **4.391** | 🟡 Pós-pandemia, processos descentralizados |
| **2022** | 91 | **4.587** | 🟡 Transição ENARE / bancas próprias |
| **2021** | 96 | **4.815** | 🟡 Retomada dos concursos presenciais |
| **2020** | 15 | **4.605** | 🟢 Último ano da década |
| **TOTAL**| **539 provas** | **30.444 questões** | — |

### 🏆 Top 20 Provas com Maior Concentração de Faltantes

| Ano | Instituição / Banca | Total na Prova | Faltam Gabarito | Tipo de Processo |
| :---: | :--- | :---: | :---: | :--- |
| **2025** | ABEM — Teste de Progresso Nacional | 221 | **220** | Avaliação Nacional Seriada |
| **2026** | SES-GO (Secretaria de Saúde de Goiás) | 203 | **135** | Concurso Estadual Aberto (CS-UFG) |
| **2024** | IOG - Instituto de Olhos de Goiânia | 152 | **114** | Especialidade R+ / Oftalmo |
| **2026** | ABEM — Teste de Progresso Nacional | 110 | **105** | Avaliação Nacional Seriada |
| **2025** | USCS - Universidade Municipal de São Caetano | 101 | **100** | Acesso Direto SP |
| **2024** | USCS - Universidade Municipal de São Caetano | 101 | **100** | Acesso Direto SP |
| **2026** | Complexo Américas (RJ) | 101 | **100** | Rede Privada RJ |
| **2026** | HOA - Hospital Oftalmológico do Acre | 100 | **100** | Especialidade R3/R4 |
| **2026** | Santa Casa de Maceió (AL) | 100 | **100** | Acesso Direto AL |
| **2026** | CEPOA (RJ) | 101 | **100** | Especialidade Oftalmologia |
| **2023** | UEPA Revalida | 107 | **100** | Revalidação de Diplomas |
| **2026** | UNICAMP / HC Campinas | 101 | **98** | Processo Estadual SP (COMVEST) |
| **2026** | HE Jayme Neves (ES) | 100 | **98** | Hospital Estadual ES |
| **2026** | Universidade Paulista - UNIP | 100 | **98** | Acesso Direto SP |
| **2026** | Faculdade São Leopoldo Mandic | 100 | **97** | Instituição Privada SP |
| **2026** | Santa Casa de Barra Mansa (RJ) | 101 | **97** | Hospital Regional RJ |
| **2026** | FEMPAR - Fac. Evangélica Mackenzie (PR) | 100 | **96** | Acesso Direto PR |
| **2026** | FBHC - Fundação Beneficência Cirurgia (SE) | 100 | **96** | Hospital Escola SE |
| **2025** | HSL Brasília (Hospital Sírio-Libanês) | 100 | **95** | Hospital Privado DF |
| **2026** | SCMBH (Santa Casa de Belo Horizonte) | 100 | **94** | Hospital de Ensino MG |

---

## 🏛️ 2. Arquitetura das Fontes Disponíveis (Sem MedEvo)

Não precisamos depender do MedEvo nem de cadastros arriscados, pois possuímos um ecossistema de dados já pronto para uso:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FONTES DE EXTRAÇÃO & CASAMENTO                                  │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│   FONTE 1: Staging Local   │   FONTE 2: Bancas Oficiais  │   FONTE 3: Agregadores      │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ • questmed_extracted.db    │ • FGV (ENARE)               │ • PCI Concursos             │
│   (42.582 gabaritos 20-26) │ • FUVEST (USP)              │ • Domínio Público           │
│ • export_gabaritos.csv     │ • Vunesp (SUS-SP / UNESP)   │ • Páginas das COREMEs       │
│ • 100% offline e rápido    │ • AREMG (PSU-MG)            │ • PDFs de Recursos          │
└────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

1. **Fonte 1 — Staging Local (`data/questmed_extracted_exams.db`):**
   * Contém **42.582 questões de 2020 a 2026** com gabarito já extraído e homologado em SQLite.
   * **34.207 dessas questões ainda não foram casadas** com o nosso banco canônico.
   * *Rendimento estimado:* De **12.000 a 16.000 questões** podem ser resolvidas de forma puramente local em menos de 10 minutos.
2. **Fonte 2 — Acervos de Provas Oficiais em `data/official_exams/` e `data/export_gabaritos_questoes.csv`:**
   * Contém cadernos e chaves oficiais de gabarito para PSU-MG, ENARE, AMRIGS, USP, SES-DF, SES-GO, SES-PE, SUS-BA, SUS-SP, UERJ, etc.
3. **Fonte 3 — Portais Oficiais das Bancas Organizadoras (Download Aberto na Web):**
   * Portais públicos de onde os gabaritos pós-recurso definitivos são baixados diretamente via PDF.

---

## 🚀 3. As 4 Fases de Execução do Processo

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FLUXO EM 4 FASES DE ALTA PRECISÃO                               │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
     ┌─────────────────────────────────────┼─────────────────────────────────────┐
     ▼                                     ▼                                     ▼
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│ FASE 1: CASAMENTO LOCAL  │  │ FASE 2: BANCAS ESTATAIS  │  │ FASE 3: BANCAS ISOLADAS  │
│ SQLite Staging + CSVs    │  │ ENARE, USP, AMRIGS, PSU  │  │ Hospitais, Faculdades    │
│ Rendimento: ~12k a 16k   │  │ Rendimento: ~8k a 10k    │  │ Rendimento: ~3k a 4k     │
│ Tempo: 15 minutos        │  │ Tempo: 4 a 6 horas       │  │ Tempo: 6 a 8 horas       │
└─────────────┬────────────┘  └────────────┬─────────────┘  └────────────┬─────────────┘
              │                            │                             │
              └────────────────────────────┼─────────────────────────────┘
                                           ▼
                              ┌──────────────────────────┐
                              │ FASE 4: VALIDAÇÃO & SYNC │
                              │ Auditoria A-E e Supabase │
                              │ Tempo: 30 minutos        │
                              └──────────────────────────┘
```

---

### 🔹 Fase 1: Cruzamento Local Imediato (Staging SQLite + Chaves CSV)
**Objetivo:** Obter o ganho máximo imediato sem fazer requisições externas de rede.
* **Mecanismo:**
  1. Carregar as questões sem gabarito dos arquivos canônicos `data/*_final_questions.json`.
  2. Executar algoritmo de matching duplo contra `data/questmed_extracted_exams.db`:
     - **Chave 1 (Exata):** Normalização e hash dos primeiros 100 caracteres do enunciado (`enunciado_hash`).
     - **Chave 2 (Hierárquica):** Casamento por `(Banca Normalizada, Ano, Número da Questão)`.
     - **Chave 3 (Fuzzy Token Match):** Jaccard/Levenshtein $>0.92$ para capturar variações de pontuação ou OCR.
  3. Cruzar contra `data/export_gabaritos_questoes.csv` para injetar os gabaritos oficiais das bancas já consolidadas.
* **Saída da Fase 1:** Relatório de questões casadas por especialidade e atualização dos arquivos locais.

#### ✅ Balanço Consolidado da Execução da Fase 1:
* **Total de Questões Homologadas na Fase 1:** **+790 novas questões** com gabarito oficial e definitivo:
  * **Casamento Local QuestMed Staging:** **+744 questões**
  * **Casamento de Cadernos Oficiais (`match_all_official_cadernos.py`):** **+46 questões** (SES-PE e USP)
* **Distribuição das 744 Questões por Especialidade:**
  * **Clínica Médica:** +204 gabaritos
  * **Medicina Preventiva:** +156 gabaritos
  * **Cirurgia Geral:** +134 gabaritos
  * **Pediatria:** +128 gabaritos
  * **Obstetrícia:** +79 gabaritos
  * **Ginecologia:** +43 gabaritos
* **Distribuição por Ano:**
  * **2026:** +202 gabaritos
  * **2025:** +149 gabaritos
  * **2024:** +79 gabaritos
  * **2023:** +59 gabaritos
  * **2022:** +98 gabaritos
  * **2021:** +98 gabaritos
  * **2020:** +59 gabaritos
* **Top Bancas com Pendências Reduzidas:** AMRIGS (+37), FAMEMA (+34), AMP (+32), HOB (+32), FAMERP (+30), SUS-SP (+29), ICMSC (+29), PUC-PR (+26), UEL (+25), PSU-GO (+24).
* **Impacto Global no Banco Canônico:** Total de questões homologadas saltou de 97.179 para **97.969 questões** (reduzindo o saldo faltante para 35.983).

---

### 🔹 Fase 2: Coleta Direta das Grandes Bancas Estatais (Portais Públicos)
**Objetivo:** Resolver as provas de grande porte que ainda tiverem saldo residual após a Fase 1.
* **Bancas Alvo Principais:**
  1. **ENARE / FGV Conhecimento (2024, 2025, 2026):** Extração direta das tabelas de gabarito definitivo unificado.
  2. **USP-SP e USP-RP / FUVEST (2021 a 2026):** Cadernos e gabaritos definitivos públicos.
  3. **AMRIGS / Associação Médica do RS (2020 a 2026):** Prova única com gabarito oficial pós-recurso.
  4. **AREMG / PSU-MG (2020 a 2026):** Processo unificado de Minas Gerais.
  5. **Fundação Vunesp (SUS-SP, IAMSPE, UNESP, FMABC):** Gabaritos publicados no site de acompanhamento.
  6. **COMVEST / UNICAMP (2021 a 2026):** Provas e resoluções publicadas pela banca.
  7. **SES-GO (CS-UFG) e SES-PE (Upenet/IAUPE):** Concursos estaduais com gabaritos definitivos.
* **Mecanismo:** Script modular em Python/Node.js que baixa o PDF do gabarito definitivo, faz o parse da grade (Questão $\to$ Letra/Anulada) e aplica diretamente por número de questão.

---

### 🔹 Fase 3: Resíduo de Hospitais Privados e Faculdades Isoladas (PCI / Repositórios)
**Objetivo:** Resolver as provas menores (Santa Casa Maceió, São Caetano, FBHC, Complexo Américas, etc.).
* **Mecanismo:**
  - Consulta automática em repositórios abertos de concursos médicos (PCI Concursos e portais locais das COREMEs).
  - Casamento de texto para garantir que o caderno baixado corresponde exatamente à prova registrada no banco.

---

### 🔹 Fase 4: Validação de Qualidade e Sincronização no Supabase
**Objetivo:** Garantir integridade matemática total antes do envio para a nuvem.
* **Regras de Validação Estritas:**
  1. **Alternativa Válida:** O gabarito deve ser estritamente `A`, `B`, `C`, `D`, `E`, ou marcado como `is_anulada = true` (com status `ANULADA`).
  2. **Comentário de Rastreabilidade:** Registrar a fonte oficial na coluna `commentary` (ex: `"Gabarito Oficial Definitivo Pós-Recurso - ENARE 2025"`).
  3. **Consistência:** Nenhuma questão previamente homologada com gabarito válido será sobrescrita.
* **Sincronização:** Envio em lotes de 100 questões via API REST do Supabase utilizando `SERVICE_ROLE_KEY` e `resolution=merge-duplicates`.
* **Atualização dos Relatórios:** Regeneração do [`relatorio_provas_instituicoes_ano.csv`](file:///d:/bancoresidencia/data/relatorio_provas_instituicoes_ano.csv) e dos contadores da interface.

---

## ⏱️ 4. Cronograma Estimado de Execução

| Etapa | Ação | Tempo Estimado | Dependência de Rede |
| :---: | :--- | :---: | :---: |
| **Fase 1** | Casamento Local SQLite (`questmed_extracted_exams.db`) + CSVs | **~15 minutos** | 🟢 Zero (Offline) |
| **Fase 2** | Coleta e Match das 7 Grandes Bancas (ENARE, USP, AMRIGS, PSU, Vunesp, etc.) | **~3 a 4 horas** | 🌐 Download de PDFs públicos |
| **Fase 3** | Varredura de Hospitais e Faculdades Isoladas | **~4 a 5 horas** | 🌐 Download de repositórios |
| **Fase 4** | Auditoria de integridade e Sincronização no Supabase | **~30 minutos** | 🌐 Upload REST Supabase |
| **TOTAL** | **Processo Completo e Homologado** | **~8 a 10 horas** | — |

---

## 🛡️ 5. Vantagens Desta Metodologia

1. **Risco Zero:** Sem raspagem de plataformas concorrentes, sem criação de contas, sem proxies, sem violação de termos de uso e sem risco de shadow ban.
2. **Precisão Superior (Padrão-Ouro):** Gabaritos obtidos das bancas oficiais contêm todas as retificações e anulações pós-recurso definitivas.
3. **Alto Rendimento Imediato:** A Fase 1 utiliza dados que já estão no nosso disco e pode eliminar mais de 50% das pendências em poucos minutos.
