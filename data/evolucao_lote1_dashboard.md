# Painel de Evolução do Lote 1 — Coletor Nacional de Gabaritos Oficiais
*Data da última atualização: Outubro de 2026*

Este painel consolida o status em tempo real da extração, validação cruzada, homologação oficial e sincronização dos gabaritos das **Top 10 Instituições** do Banco de Residência Médica (Lote 1) diretamente na plataforma (Supabase).

---

## 📊 Progresso Geral do Lote 1

| Instituição | Banca | Total no Banco | Homologadas (100%) | Status na Plataforma |
| :--- | :--- | :---: | :---: | :---: |
| **SES-PE** | IAUPE / UPENET | 1.201 | **1.201 (100%)** | 🟢 **Concluído 100%** (2015 a 2026 sincronizados) |
| **SUS-SP** | Quadrix / Vunesp | 1.213 | **300 (100% de 2022 a 2024)** | 🟡 Em andamento |
| **IAMSPE / HSPE** | Quadrix / Vunesp | 1.105 | **150 (100% de 2022 e 2023)** | 🟢 2022 e 2023 Concluídos |
| **Santa Casa de São Paulo** | Quadrix / Vunesp | 1.205 | **751 (100% de 2020 a 2023)** | 🟢 **2020, 2021, 2022 e 2023 Concluídos e Sincronizados** |
| **USP / HCFMUSP** | FUVEST | 1.170 | **100% em 2023, 2024 e 2025** | 🟢 **2023, 2024 e 2025 Concluídos e Sincronizados** |
| **USP / HCRP Ribeirão** | FUVEST | 1.220 | **100% em 2023, 2024 e 2025** | 🟢 **2023, 2024 e 2025 Concluídos e Sincronizados** |
| **UNESP Botucatu** | VUNESP | 1.074 | **80 (100% de 2024)** | 🟡 Em andamento |
| **Centro Universitário FMABC** | VUNESP / GSA | 1.413 | **66 (100% de 2024)** | 🟢 2024 Homologado (12 anuladas) |
| **UNIFESP / EPM** | FAPUNIFESP | 1.221 | **100 (100% de 2024)** | 🟢 2024 Homologado Oficial |
| **AMRIGS** | AMRIGS / Fundatec | 1.203 | **~95% de 2023 a 2025** | 🟡 2022 baixado, em resolução |

---

## 🛡️ Total de Questões no Manifesto de Ouro e na Plataforma
* **Total Blindado no Manifesto de Ouro**: **31.226 questões** (rastreadas por ID, auditoria oficial e resposta imutável).
* **Total Sincronizado ao Vivo no Supabase (Lote 1)**: **8.705 questões** atualizadas com gabarito oficial e metadados de auditoria.
* **Última Etapa Concluída**: Homologação Oficial e Sincronização de **Santa Casa SP 2021** e **FUVEST USP 2023 (SP e Ribeirão)** (+692 questões homologadas).

---

## ⚙️ Processos e Rastreabilidade
* **Pipeline de Integração Direta**: Executado via `scripts/sync_lote1_to_supabase.mjs` (8.705 atualizadas em 38.7s).
* **Auditoria de Integridade**: Rastreabilidade por caderno e questão garantida em todas as 7 especialidades.
