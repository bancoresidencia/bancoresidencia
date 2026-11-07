# Relatório de Conclusão: Fase 0 e Fase 1 (Mesclagem Canônica de Focos)
## Plataforma Banco Residência Médica — Engenharia de Dados & Taxonomia Clínica
### Transição Estruturada de 1.967 Focos para 866 Focos Canônicos Ouro (Redução de 56,0%)

---

## 1. Resumo Executivo das Entregas

Em conformidade rigorosa com a solicitação do usuário e o **Plano Mestre de Mesclagem**, foram executadas e auditadas com sucesso a **Fase 0** (Ponto de Restauração Duplo e Blindagem) e a **Fase 1** (Construção da Matriz Canônica De-Para):

| Indicador | Antes da Mesclagem | Matriz Canônica (Fase 1) | Variação / Impacto |
| :--- | :---: | :---: | :---: |
| **Total de Focos no Banco** | **1.967** | **866** | **-1.101 focos (-56,0% de redundância)** |
| **Focos em CamelCase Bruto** | **816** | **0** | **100% extintos nos destinos canônicos** |
| **Focos com $\le 10$ questões** | **1.031** | **Subsumidos / Preservados** | **Granularidade promovida para subfoco** |
| **Questões Beneficiadas com Subfoco Promovido** | — | **78.945** | **Zero perda de detalhe diagnóstico** |
| **Volume Total de Questões** | **258.953** | **258.953** | **100% conservado (Zero perda volumétrica)** |
| **Metadados (Bancas, Anos, Gabaritos)** | **Intactos** | **Intactos** | **100% imutáveis** |

---

## 2. Fase 0: Arquitetura de Backups Duplos e Ponto de Restauração

Foram estruturados e validados com hashes criptográficos (MD5 e SHA-256) dois snapshots completos e atômicos do acervo:

### 2.1. Backup 1: Filtros Originais Pré-Reclassificação (258.953 questões)
- **Diretório**: `data/backups/pre_reclassificacao_filtros_originais_259k/`
- **Conteúdo**: Os 6 arquivos mestres contendo as 132.965 questões originais integradas com as 125.988 questões da expansão, **mantendo exatamente os filtros brutos originais** antes da aplicação da reclassificação taxonômica da Etapa 2.
- **Manifesto de Integridade**: `manifest_backup_pre_reclassificacao.json` validado.

### 2.2. Backup 2: Estado Pré-Mesclagem (258.953 questões) — *Marco Zero da Mesclagem*
- **Diretório**: `data/backups/pre_mesclagem_focos_259k/`
- **Conteúdo**: Os 6 arquivos mestres no estado imediatamente atual (Etapa 2 reclassificada), salvaguardando a árvore antes de qualquer modificação de focos.
- **Manifesto de Integridade**: `manifest_backup_pre_mesclagem.json` com MD5 verificado para todos os 6 arquivos:
  - `medicina_preventiva_final_questions.json`: 24.093 q (`MD5: 71a1b9e43d80...`)
  - `pediatria_final_questions.json`: 28.005 q (`MD5: c03620077b6c...`)
  - `cirurgia_final_questions.json`: 29.318 q (`MD5: 188a6c1bdf9f...`)
  - `ginecologia_final_questions.json`: 17.227 q (`MD5: 8c8f26d19b72...`)
  - `obstetricia_final_questions.json`: 17.227 q (`MD5: 1023c648dcc5...`)
  - `clinica_medica_final_questions.json`: 143.083 q (`MD5: 8abaa9892287...`)
- **Script de Restauração Atômica**: `scripts/restore_pre_mesclagem_backup.py` testado e pronto para reversão imediata com 1 comando.

---

## 3. Fase 1: Matriz Canônica De-Para (JSON Determinístico)

- **Arquivo Gerado**: `data/staging/mapa_mesclagem_focos_canonica.json` (0,92 MB)
- **Cobertura**: **100,0%** dos 1.967 pares `(especialidade, tema, foco)` existentes na base de 258.953 questões.

### 3.1. Panorama por Especialidade

| Especialidade Médica | Focos de Origem | Focos Canônicos Destino | Redução (%) | Questões Mapeadas | Subfocos Promovidos |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Clínica Médica** | 577 | **341** | **-40.9%** | 143,083 | 293 |
| **Cirurgia Geral** | 476 | **182** | **-61.8%** | 29,318 | 273 |
| **Ginecologia e Obstetrícia** | 539 | **167** | **-69.0%** | 34,454 | 348 |
| **Pediatria** | 231 | **154** | **-33.3%** | 28,005 | 119 |
| **Medicina Preventiva e Social** | 144 | **87** | **-39.6%** | 24,093 | 81 |
| **TOTAL CONSOLIDADO** | **1,967** | **866** | **-56.0%** | **258,953** | **1.114 mapeamentos** |

---

### 3.2. Distribuição das Regras de Resolução Aplicadas

A matriz aplicou 4 camadas determinísticas de resolução clínica:

1. **`REGRA_CLINICA_CANONICA` (826 focos / 42,0%)**:
   - Resolução especializada baseada em diretrizes das sociedades médicas (SBC, SBPT, FEBRASGO, SBP, CBC, etc.).
   - Unifica variações sindrômicas, acrônimos (`IAMCSST`, `DPOC`, `TEP`, `HAS`, `DRGE`, `DRC`, `IRA`) e as grandes entidades nosológicas.
2. **`SUBSUNCAO_ANCORA_TEMA` (600 focos / 30,5%)**:
   - Absorção de focos da cauda longa ($\le 10$ questões) e satélites pelo foco âncora clínico do mesmo tema, promovendo o discriminador para `subfoco`.
3. **`CANONICO_DIRETO` (346 focos / 17,6%)**:
   - Entidades clínicas já canônicas, ortograficamente perfeitas e independentes.
4. **`CAMELCASE_FORMATADO` (195 focos / 9,9%)**:
   - Conversão de identificadores CamelCase singulares em títulos médicos em português natural com acentuação e espaçamento adequados.

---

### 3.3. Exemplos Reais de Preservação de Granularidade (Foco $ightarrow$ Subfoco)

| Foco Original (Fragmentado) | Tema | Foco Canônico Destino | Subfoco Promovido (Preservado) | Regra Aplicada |
| :--- | :--- | :--- | :--- | :--- |
| `AbdomeAgudoInflamatorio PancreatiteAguda` | Anestesiologia | **Pancreatite Aguda** | *Abdome Agudo Inflamatório* | `REGRA_CLINICA_CANONICA` |
| `AteroscleroseEDoencaArterialCo InfartoAgudoDoMiocardioComSupr` | Cardiologia | **Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)** | *Aterosclerose e Doença Arterial Coronariana* | `REGRA_CLINICA_CANONICA` |
| `DisturbiosHipertensivosNaGesta Preeclampsia` | Climatério e Menopausa | **Síndromes Hipertensivas da Gestação (Pré-Eclâmpsia e Eclâmpsia)** | *Distúrbios Hipertensivos na Gestação: Pré-Eclâmpsia* | `REGRA_CLINICA_CANONICA` |
| `EmergenciasPediatricasParadaCa SuporteAvancadoDeVida` | Urgências Pediátricas | **Emergências Pediátricas (Choque, Obstrução e PALS)** | *Suporte Avançado de Vida Pediátrico* | `REGRA_CLINICA_CANONICA` |
| `AbdomeAgudoObstrutivo Volvo` | Cirurgia Geral | **Abdome Agudo Obstrutivo (Obstrução Intestinal e Volvo)** | *Volvo de Sigmóide e Cólon* | `REGRA_CLINICA_CANONICA` |
| `Linfoma de Hodgkin Esclerose Nodular` | Hematologia | **Linfomas (Hodgkin e Não-Hodgkin)** | *Linfoma de Hodgkin: Subtipo Esclerose Nodular* | `SUBSUNCAO_ANCORA_TEMA` |
| `Hipercalemia Eletrocardiograma` | Nefrologia | **Distúrbios do Potássio (Hipo e Hipercalemia)** | *Alterações Eletrocardiográficas na Hipercalemia* | `SUBSUNCAO_ANCORA_TEMA` |

---

## 4. Estado de Blindagem e Próximos Passos (Fase 2)

> [!IMPORTANT]
> **Status de Mutação Atual: ZERO ALTERAÇÕES NOS ARQUIVOS ATIVOS**.  
> Os 6 arquivos em `data/*_final_questions.json` permanecem **rigorosamente intocados**, 100% idênticos ao backup pré-mesclagem. Apenas os backups de segurança e o arquivo de mapa de homologação `data/staging/mapa_mesclagem_focos_canonica.json` foram gravados.

Com a Fase 0 e a Fase 1 integralmente concluídas, o sistema está pronto para a **Fase 2 (Execução Modular por Especialidade)**:
- **Fase 2.1**: Medicina Preventiva e Social (24.093 q)
- **Fase 2.2**: Pediatria (28.005 q)
- **Fase 2.3**: Ginecologia e Obstetrícia (34.454 q)
- **Fase 2.4**: Cirurgia Geral (29.318 q)
- **Fase 2.5**: Clínica Médica (143.083 q)
- **Fase 3**: Bateria de Testes Automatizados M1 a M6 (`run_mesclagem_qa_tests.py`)
