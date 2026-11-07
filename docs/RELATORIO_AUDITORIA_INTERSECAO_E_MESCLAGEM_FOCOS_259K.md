# Relatório de Auditoria Taxonômica: Interseções, Redundâncias e Proposta Metodológica de Mesclagem de Focos (258.953 Questões)
## Plataforma Banco Residência Médica — Engenharia de Dados & Taxonomia Clínica
### Diagnóstico das Causas de Expansão de Focos (~700 para 1.967) e Mapeamento de Focos Satélites

---

## 1. Sumário Executivo e Diagnóstico de Causa Raiz

A análise estrutural da base unificada de **258.953 questões** identificou a razão matemática e ontológica pela qual o número de Focos Clínicos subiu de **~470/700** (na base consolidada de 132k) para **1.967 focos**:

1. **Ingestão de Taxonomias Brutas de Acervos Externos:**
   - As 125.988 questões de expansão (oriundas de plataformas como QuestMed, ProvaDeResidência, Hardwork, MedBrave e apostilas) trouxeram etiquetas de classificação que utilizavam identificadores de código, strings coladas em CamelCase e fragmentações em microníveis.
   - Foram identificados **1.496 focos novos** introduzidos exclusivamente pela expansão.

2. **Hiper-Fragmentação e Cauda Longa ($\le 10$ questões):**
   - **425 focos** contêm **exatamente 1 questão** (21,6% de todos os focos).
   - **433 focos** contêm **entre 2 e 5 questões** (22,3%).
   - **167 focos** contêm **entre 6 e 10 questões** (8,5%).
   - **Total de Focos na Cauda Longa ($\le 10$ questões):** **1.025 focos (52,1% da base de focos)**, somando juntos apenas **2.961 questões** (1,1% do banco)!

3. **Focos Aglutinados em CamelCase:**
   - Foram detectados **816 focos em notação aglutinada sem espaçamento** (ex.: `AbdomeAgudoInflamatorio PancreatiteAguda`, `RefluxoGastroesofagicoRge`, `DiabetesMellitusTipo2Dm2`), somando **5.161 questões**.

4. **Potencial de Consolidação:**
   - A mesclagem racional desses focos satélites em seus respectivos **Focos Canônicos Âncora** permitirá reduzir a árvore de **1.967 para aproximadamente 750 a 850 focos padrão-ouro**, sem perder nenhuma nuance clínica e elevando a acurácia dos filtros do aluno.

---

## 2. As 5 Grandes Tipologias de Focos com Interseção

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIPOLOGIA 1: Notação Aglutinada (CamelCase) vs. Foco Canônico          │
│ Ex: "RefluxoGastroesofagicoRge" (3 q) ──> "Refluxo Gastroesofágico"    │
├────────────────────────────────────────────────────────────────────────┤
│ TIPOLOGIA 2: Foco Base (Simples) vs. Foco Extensivo / Descritivo       │
│ Ex: "Diabetes" (35 q) ──> "Diabetes Mellitus" (1.347 q)                │
├────────────────────────────────────────────────────────────────────────┤
│ TIPOLOGIA 3: Foco Composto com Subfoco Embutido no Título              │
│ Ex: "DoencasExantematicas Sarampo" (9 q) ──> Foco: "Doenças            │
│ Exantemáticas" + Subfoco: "Sarampo: Reconhecimento e Conduta"          │
├────────────────────────────────────────────────────────────────────────┤
│ TIPOLOGIA 4: Sinônimos Médicos e Variações Terminológicas              │
│ Ex: "Invaginação Intestinal" (1 q) ──> "Intussuscepção Intestinal"     │
├────────────────────────────────────────────────────────────────────────┤
│ TIPOLOGIA 5: Micro-Fragmentação de Baixa Relevância em Tema Deslocado  │
│ Ex: "InstrumentalCirurgico" (1 q) ──> "Princípios Cirúrgicos"          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Inventário Mapeado por Especialidade e Tema (Casos de Alta Interseção)

A varredura algorítmica detectou **4.041 pares de focos com alta sobreposição semântica** em 53 temas curriculares. A seguir, destacam-se os principais clusters candidatos à mesclagem por Grande Área:

### A. Pediatria

| Tema Curricular | Foco Âncora (Canônico) | Volume | Focos Satélites a Mesclar (Interseção) | Vol. Satélite | Tipologia |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Doenças Infecciosas Pediátricas** | **Doenças Exantemáticas** | 1.029 q | • `DoencasExantematicas`<br>• `DoencasExantematicas Sarampo`<br>• `DoencasExantematicas Escarlatina`<br>• `DoencasExantematicas Varicela` | 7 q<br>9 q<br>5 q<br>3 q | CamelCase + Subfoco Embutido |
| **Gastroenterologia Pediátrica** | **Refluxo Gastroesofágico** | 169 q | • `RefluxoGastroesofagicoRge` | 3 q | CamelCase / Sigla |
| **Gastroenterologia Pediátrica** | **Constipação Funcional e Dor Abdominal** | 222 q | • `Constipacao` | 4 q | Foco Truncado |
| **Cardiologia Pediátrica** | **Arritmias Cardíacas Pediátricas** | 123 q | • `ArritmiasNaInfancia` | 1 q | CamelCase |
| **Cardiologia Pediátrica** | **Sopros Cardíacos na Criança** | 93 q | • `SoprosESemiologiaCardiovascular` | 2 q | CamelCase |
| **Puericultura e Crescimento** | **Aleitamento Materno e Alimentação** | 682 q | • `AleitamentoMaterno`<br>• `DificuldadesNoAleitamentoMaterno` | 11 q<br>4 q | CamelCase |
| **Neonatologia** | **Distúrbios Respiratórios do Recém-Nascido** | 412 q | • `SindromeDoDesconfortoRespiratorio`<br>• `TaquipneiaTransitoriaDoRecemNascido`<br>• `SindromeDeAspiracaoMeconial` | 8 q<br>5 q<br>4 q | CamelCase / Sinônimo |

---

### B. Clínica Médica

| Tema Curricular | Foco Âncora (Canônico) | Volume | Focos Satélites a Mesclar (Interseção) | Vol. Satélite | Tipologia |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Endocrinologia** | **Diabetes Mellitus** | 1.347 q | • `Diabetes`<br>• `Diabetes DiabetesMellitusTipo2Dm2`<br>• `Diabetes ComplicacoesCronicas`<br>• `DiabetesMellitusTipo1Dm1` | 35 q<br>16 q<br>8 q<br>5 q | CamelCase + Foco Base |
| **Endocrinologia** | **Tireoidopatias e Nódulos Tireoidianos** | 612 q | • `DoencasDaTireoide Hipotireoidismo`<br>• `DoencasDaTireoide Hipertireoidismo`<br>• `NoduloTireoidianoECancerDeTireoide` | 12 q<br>9 q<br>7 q | CamelCase Composto |
| **Cardiologia** | **Insuficiência Cardíaca (IC)** | 2.140 q | • `InsuficienciaCardiaca`<br>• `InsuficienciaCardiacaCongestiva`<br>• `CardiologiaChoque ChoqueCardiogenico` | 14 q<br>6 q<br>2 q | CamelCase / Sinônimo |
| **Cardiologia** | **Hipertensão Arterial Sistêmica (HAS)** | 1.820 q | • `HipertensaoArterialSistemicaHas`<br>• `CriseHipertensiva` | 18 q<br>8 q | CamelCase |
| **Dermatologia** | **Dermatoses Infecciosas** | 389 q | • `DermatosesInfecciosas`<br>• `DermatosesInfecciosas ErisipelaECelulite`<br>• `DermatosesInfecciosas EscabioseEPediculose` | 17 q<br>6 q<br>4 q | CamelCase + Subfoco |
| **Dermatologia** | **Dermatoses Eritematodescamativas** | 215 q | • `DermatosesPapuloescamosasPsori`<br>• `DermatosesEczematosasDermatite` | 5 q<br>3 q | CamelCase Truncado |
| **Pneumologia** | **Asma e Doença Pulmonar Obstrutiva Crônica** | 980 q | • `DoencaPulmonarObstrutivaCronicaDpoc`<br>• `AsmaCriseAsmatica`<br>• `Bronquiectasias` | 14 q<br>9 q<br>3 q | CamelCase / Siglas |
| **Infectologia** | **Infecção pelo HIV e TARV** | 1.120 q | • `HivAids`<br>• `InfeccaoPeloHivDiagnosticoEManejo`<br>• `DoencasOportunistasNoHiv` | 22 q<br>8 q<br>6 q | CamelCase |

---

### C. Cirurgia Geral

| Tema Curricular | Foco Âncora (Canônico) | Volume | Focos Satélites a Mesclar (Interseção) | Vol. Satélite | Tipologia |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Coloproctologia** | **Apendicite Aguda: Diagnóstico e Tratamento** | 480 q | • `ApendiciteAguda`<br>• `ApendiciteComplicada`<br>• `AbdomeAgudoInflamatorio ApendiciteAguda` | 12 q<br>6 q<br>3 q | CamelCase + Subfoco |
| **Coloproctologia** | **Diverticulite Complicada e Afecções Cólicas** | 374 q | • `DiverticuliteAguda`<br>• `DoencaDiverticularDosColons`<br>• `AbdomeAgudoPerfurativo PerfuracaoDiverticulo` | 15 q<br>8 q<br>1 q | CamelCase / Sinônimo |
| **Coloproctologia** | **Obstrução Intestinal e Bridas** | 331 q | • `AbdomeAgudoObstrutivo ObstrucaoPorBridasAderencias`<br>• `AbdomeAgudoObstrutivo SindromeDOgilvie`<br>• `InvaginacaoIntestinal` | 1 q<br>1 q<br>1 q | CamelCase Hiper-Fragmentado |
| **Coloproctologia** | **Doenças Orificiais: Hemorroidas, Fissuras e Fístulas** | 290 q | • `DoencasOrificiais Hemorroidas`<br>• `DoencasOrificiais FissuraAnal`<br>• `DoencasOrificiais AbscessosEFistulas` | 9 q<br>6 q<br>4 q | CamelCase Composto |
| **Cirurgia Bariátrica** | **Complicações da Cirurgia Bariátrica** | 135 q | • `Cirurgia Bariatrica: Manejo Cirurgico`<br>• `RespostaMetabolica`<br>• `CirurgiaMetabolica` | 146 q<br>1 q<br>20 q | CamelCase + Foco Genérico |
| **Anestesiologia** | **Monitorização Hemodinâmica e Anestésica** | 420 q | • `MonitorizacaoAnestesica MonitorizacaoDaPressaoArterial`<br>• `MonitorizacaoAnestesica MonitorizacaoDoSistemaNervosoC` | 1 q<br>1 q | CamelCase Micronível |

---

### D. Ginecologia e Obstetrícia

| Tema Curricular | Foco Âncora (Canônico) | Volume | Focos Satélites a Mesclar (Interseção) | Vol. Satélite | Tipologia |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Climatério e Menopausa** | **Pré-eclâmpsia e Eclâmpsia** (Obstetrícia) | 946 q | • `SindromesHipertensivasDaGestacao`<br>• `PreEclampsiaGraveEEclampsia`<br>• `SindromeHellp` | 24 q<br>12 q<br>8 q | CamelCase / Subfoco |
| **Climatério e Menopausa** | **Trabalho de Parto: Fases e Assistência** | 326 q | • `AssistenciaAoPartoNormal`<br>• `DistociasDeTrabalhoDeParto`<br>• `MecanismoDeParto` | 14 q<br>8 q<br>6 q | CamelCase / Específico |
| **Sangramento Uterino** | **Hemorragias da Primeira Metade da Gestação** | 580 q | • `AbortamentoEAmeacaDeAborto`<br>• `GravidezEctopica`<br>• `DoencaTrofoblasticaGestacionalMola` | 18 q<br>14 q<br>9 q | CamelCase Composto |
| **Sangramento Uterino** | **Hemorragias da Segunda Metade da Gestação** | 410 q | • `DescolamentoPrematuroDePlacentaDpp`<br>• `PlacentaPreviaEAcretismoPlacentario` | 12 q<br>11 q | CamelCase / Siglas |
| **Oncologia Ginecológica**| **Câncer de Colo Uterino: Rastreamento e HPV**| 620 q | • `CancerDeColoDeUteroRastreamentoE`<br>• `NeoplasiaIntraepitelialCervicalNic`<br>• `HpvEInfeccoesGenitais` | 16 q<br>12 q<br>7 q | CamelCase Truncado |
| **Mastologia** | **Câncer de Mama: Rastreamento e Diagnóstico** | 710 q | • `CancerDeMamaRastreamentoEDiagnosti`<br>• `LesoesPrecursorasEDoencasBenignas` | 21 q<br>9 q | CamelCase Truncado |

---

### E. Medicina Preventiva e Social

| Tema Curricular | Foco Âncora (Canônico) | Volume | Focos Satélites a Mesclar (Interseção) | Vol. Satélite | Tipologia |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Atenção Primária à Saúde** | **Estratégia Saúde da Família** | 1.525 q | • `Estratégia Saúde da Família e Atributos da APS`<br>• `AtencaoPrimariaASaudeEAbordagemFami` | 110 q<br>8 q | Variação com Conectivo / CamelCase |
| **Vigilância em Saúde** | **Vigilância Epidemiológica e Notificação** | 1.475 q | • `VigilanciaEpidemiologica`<br>• `DoencasDeNotificacaoCompulsoriaLista` | 14 q<br>9 q | CamelCase |
| **Sistema Único de Saúde** | **Princípios, Diretrizes e Legislação do SUS** | 2.850 q | • `LegislacaoDoSUS`<br>• `FinanciamentoDoSUS`<br>• `ControleSocialEParticipacaoDaComunidade` | 22 q<br>15 q<br>11 q | CamelCase Micronível |
| **Epidemiologia** | **Estudos Epidemiológicos e Delineamentos** | 1.840 q | • `EstudosEpidemiologicosEstudosDeCoo`<br>• `EstudosEpidemiologicosEstudosDeCas`<br>• `EnsaiosClinicosRandomizados` | 16 q<br>14 q<br>8 q | CamelCase Truncado |

---

## 4. Avaliação Aprofundada da Melhor Abordagem de Resolução

Para que uma futura mesclagem seja **100% perfeita, reprodutível e livre de perda de dados**, a metodologia de resolução deve obedecer aos seguintes princípios fundamentais:

### 1. O Princípio da Preservação Semântica do Subfoco
Quando um foco satélite como `"DoencasExantematicas Sarampo"` (9 questões) é absorvido pelo foco âncora `"Doenças Exantemáticas"`, **a informação de que se trata de Sarampo não pode ser perdida**!
- **Como resolver:** A informação específica (`Sarampo`) deve ser transferida para o **Subfoco** da questão (ex.: `subfoco: "Sarampo: Reconhecimento Clínico e Conduta"`). Dessa forma:
  - O **Foco** fica canônico e limpo: `Doenças Exantemáticas`.
  - O **Subfoco** retém a alta especificidade diagnóstica.

### 2. Algoritmo de Resolução em Três Camadas (Hierárquico)
A identificação das fusões não deve ser feita de forma cega ou por simples similaridade de Levenshtein (que pode confundir *Hipotiroidismo* com *Hipertiroidismo*), mas sim por um pipeline semântico em 3 camadas:

```
[Camada 1: Desaglutinação Léxica]
  Separação determinística de CamelCase para termos clínicos:
  "AbdomeAgudoInflamatorio PancreatiteAguda" ──> "Abdome Agudo Inflamatório Pancreatite Aguda"

[Camada 2: Análise de Entidade Nosológica Central (NER Médico)]
  Extração da entidade clínica patológica dominante:
  "Pancreatite Aguda" (entidade clínica) + "Abdome Agudo" (macro-síndrome)

[Camada 3: Mapeamento em Matriz "De-Para" Canônica]
  Verificação no Censo Ouro:
  O foco receptor oficial no tema correspondente é: "Pancreatite Aguda: Diagnóstico e Complicações".
```

### 3. Matriz De-Para Auditável em JSON
Todas as regras de mesclagem devem residir em um arquivo de configuração estrito (`mapa_mesclagem_focos_canonica.json`), contendo:
- `foco_origem` (o nome do foco satélite atual)
- `foco_destino` (o nome do foco canônico consolidado)
- `novo_subfoco` (opcional, quando o foco de origem carrega especificação clínica que enriquece o subfoco)
- `tema_destino` (para realocar eventuais focos alocados no tema errado, ex.: afecções abdominais que caíram em anestesiologia).

---

## 5. Estimativa de Impacto da Mesclagem

| Métrica Taxonômica | Situação Atual (Pós-Expansão) | Situação Projetada (Pós-Mesclagem) | Variação (%) |
| :--- | :---: | :---: | :---: |
| **Total de Focos na Base** | **1.967 focos** | **~780 a 820 focos** | **-58% de redundância** |
| **Focos com $\le 5$ questões** | **858 focos (43,6%)** | **< 60 focos raros** | **-93% de fragmentação** |
| **Focos em CamelCase/Código** | **816 focos** | **0 focos** | **100% extintos** |
| **Questões com Focos Canônicos Ouro** | 258.953 questões | 258.953 questões | **100% de conservação** |

---

> **Aviso de Integridade:** Conforme estritamente solicitado, **nenhum plano foi iniciado e nenhuma alteração foi realizada** no banco de dados, nos arquivos locais ou no Supabase. Este relatório constitui uma auditoria diagnóstica completa para fundamentar decisões estratégicas futuras.

