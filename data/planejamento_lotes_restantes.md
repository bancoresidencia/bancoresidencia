# Estrutura e Planejamento dos Lotes Restantes — Expansão Nacional

Este documento define a estratificação de todas as instituições do Banco de Residência Médica em lotes sistemáticos de ingestão, homologação de gabaritos e sincronização direta na plataforma (Supabase).

---

## 🏆 Resumo da Arquitetura dos Lotes

| Lote | Perfil Institucional | Quantidade de Bancas | Total de Questões | Estratégia de Coleta / Bancas |
| :---: | :--- | :---: | :---: | :--- |
| **Lote 1** | **Top 10 Grandes Instituições** | 10 | ~12.200 | IAUPE, Quadrix, Vunesp, FUVEST, Fundatec. *(Em conclusão ativa)* |
| **Lote 2** | **Grandes Processos Estaduais e Federais (Top 11 a 25)** | 15 | ~18.800 | Strix, Vunesp, CEPUERJ, UFRJ, PSU-MG (AREMG), ARES (Ceará), HCPA, Einstein. |
| **Lote 3** | **Polos Regionais e Hospitais de Grande Porte (Top 26 a 50)** | 25 | ~24.500 | IADES, Fundatec, PUCs (PR, SP), Sírio-Libanês, CERMAM, FAMERP, SES-DF, SUS-BA. |
| **Lote 4** | **Centros Universitários e Hospitais Especializados (Top 51 a 100)** | 50 | ~32.000 | Secretarias Municipais (SP, RJ, Curitiba), Polos Estaduais (MA, PI, SC, ES, MT). |
| **Lote 5** | **Demais Instituições e Serviços Credenciados (Top 101 a 289)** | 189 | ~46.400 | Provas locais, editais específicos, residências municipais e hospitais filantrópicos. |

---

## 📋 Detalhamento do Lote 2 (Top 11 a 25) — Prioridade Imediata

| Rank | Instituição / Banca | Total no Banco | Banca Principal | Formato & Fontes Oficiais |
| :---: | :--- | :---: | :--- | :--- |
| **11** | **UNICAMP / HC Campinas (SP)** | 2.005 | FCM / Unicamp | Cadernos e Gabaritos publicados no portal da FCM Unicamp. |
| **12** | **SES-GO (Goiás)** | 1.316 | Instituto Verbena / UFG | Provas objetivas e gabaritos definitivos CS/UFG. |
| **13** | **AMP (Associação Médica do Paraná)** | 1.182 | AMP / UFPR | Concurso unificado do Paraná com gabaritos definitivos. |
| **14** | **UFRJ / HUCFF (Rio de Janeiro)** | 1.312 | UFRJ Pró-Reitoria | Cadernos de provas e gabaritos oficiais UFRJ. |
| **15** | **UERJ / HUPE (Rio de Janeiro)** | 1.257 | CEPUERJ | Portal CEPUERJ / DSEA (2015 a 2025). |
| **16** | **PSU-MG (Minas Gerais)** | 1.174 | AREMG | Processo Seletivo Unificado MG (Portal AREMG). |
| **17** | **SURCE (Ceará)** | 1.048 | ARES Ceará | Seleção unificada do Ceará (ARES Apoio Residências). |
| **18** | **HOS / BOS (Sorocaba)** | 881 | VUNESP / Própria | Provas de acesso direto e especialidades. |
| **19** | **UFRGS / HCPA (Porto Alegre)** | 1.216 | FAURGS / HCPA | Hospital de Clínicas de Porto Alegre (FAURGS). |
| **20** | **HIAE (Albert Einstein SP)** | 911 | Einstein / Vunesp | Provas de 1ª fase (múltipla escolha). |
| **21** | **UEL (Londrina PR)** | 1.363 | COPS / UEL | Provas e gabaritos históricos da COPS UEL. |
| **22** | **SES-RJ (Rio de Janeiro)** | 886 | CEPERJ / SES-RJ | Processo seletivo estadual RJ. |
| **23** | **CERMAM (Amazonas)** | 1.459 | CERMAM / UFAM | Comissão Estadual de Residência Médica AM. |
| **24** | **FAMERP / HB (São José do Rio Preto)** | 807 | FUVEST / FAMERP | Hospital de Base de Rio Preto. |
| **25** | **HU-FMJ (Faculdade de Medicina de Jundiaí)** | 1.313 | VUNESP | Provas aplicadas pela Fundação Vunesp. |

---

## 🎯 Roteiro de Execução para os Demais Lotes

1. **Ingestão em Batch por Banca/Portal**:
   - Automatizar crawlers dedicados para cada grande banca unificada (ex: AREMG para PSU-MG, CEPUERJ para UERJ, FCM para UNICAMP).
2. **Matching Multiespecialidades**:
   - Manter a regra pétrea de varrer simultaneamente as 7 especialidades (`clinica_medica`, `cirurgia`, `pediatria`, `ginecologia`, `medicina_preventiva`, `obstetricia`, `urologia`).
3. **Sincronização Contínua com Supabase**:
   - Cada lote homologado é registrado no Manifesto de Ouro (`data/all_homologated_questions_gold.json`) e disparado diretamente para a tabela `questions` da plataforma em segundos.
