# Plano Operacional Especialista — Fase 2: Cirurgia Geral e Trauma
## Volume Alvo: 21.229 Questões (Cirurgia + Cirurgia Geral) | Execução 100% Offline via SQLite Local

---

### 1. Perfil e Autoridade do Preceptor de Cirurgia Geral e Trauma
* **Base Canônica de Autoridade:** ATLS 10ª Edição (*Advanced Trauma Life Support*), Consensos WSES (Apendicite, Diverticulite, Colecistite, Obstrução Intestinal), Diretrizes do Colégio Brasileiro de Cirurgiões (CBC), SBAIT, Diretrizes de Hérnias (SBH/EHS); Livros: Sabiston (*Textbook of Surgery* - 21ª Ed), Schwartz (*Principles of Surgery* - 11ª Ed), *Rotinas em Cirurgia Digestiva* (Goffi/USP), SAGES (Colecistectomia Segura).
* **Foco Curricular:** Trauma e emergência cirúrgica, abdome agudo, afecções da parede abdominal e hérnias, cirurgia digestiva e cuidados perioperatórios.

---

### 2. Matriz de Harmonização de Temas e Nomenclatura Formal

| Tema Antigo | Novo Tema Harmonizado (Formal & Distinto) | Justificativa Curricular |
| :--- | :--- | :--- |
| `Cirurgia Geral e Digestiva` | **Cirurgia Digestiva e do Aparelho Gastrointestinal** | Refinamento nosológico separando do trauma. |
| `Trauma e Emergência` | **Trauma e Atendimento Inicial (ATLS 10ª Edição)** | Padronização com a diretriz soberana do trauma. |
| `Hérnias da Parede Abdominal` | **Hérnias e Afecções da Parede Abdominal** | Abrange hérnias inguinofemorais, incisionais e umbilicais. |
| `Princípios Fundamentais...` + `Antibioticoprofilaxia...` | **Princípios Cirúrgicos e Cuidados Perioperatórios** | Foco em risco cirúrgico, cicatrização e prevenção de infecção de sítio. |
| `Oncologia Cirúrgica` | **Oncologia Cirúrgica e Tumores Digestivos** | Foco em estadiamento e ressecabilidade tumoral. |
| `Cirurgia Pediátrica` | **Cirurgia Pediátrica e Malformações Neonatais** | Isolamento de atresias, estenose hipertrófica e invaginação. |
| `Cirurgia Vascular` | **Cirurgia Vascular e Afecções Arteriais/Venosas** | Oclusão arterial aguda, aneurismas e trombose venosa profunda. |
| `Urologia Cirúrgica` | **Urologia Cirúrgica e Litíase Urinária** | Litíase, tumores urológicos, hiperplasia prostática e torção testicular. |
| `Cirurgia Torácica` | **Cirurgia Torácica e Afecções Pleurais** | Drenagem, derrames parapneumônicos, pneumotórax e tumores pleurais. |

---

### 3. Regras de Resolução de Duplicatas (`subfoco == foco`)
1. **Comando/Gabarito em Trauma:**
   - Vias aéreas, intubação difícil, cricotireoidostomia $\rightarrow$ *Via Aérea no Trauma e Acesso Cirúrgico*.
   - Choque hemorrágico, protocolo de transfusão maciça, FAST $\rightarrow$ *Avaliação da Circulação, FAST e Ressuscitação Hemostática*.
   - Trauma penetrante vs contuso em abdome $\rightarrow$ *Trauma Abdominal: Indicações de Laparotomia vs Tratamento Conservador*.
2. **Gabarito em Hérnias:**
   - Técnica de Lichtenstein vs Shouldice vs Videolaparoscopia $\rightarrow$ *Hérnias Inguinais: Técnicas de Reparo Cirúrgico*.
   - Hérnia femoral $\rightarrow$ *Hérnias Femorais: Diagnóstico e Alto Risco de Estrangulamento*.
   - Complicação aguda (encarcerada/estrangulada) $\rightarrow$ *Complicações Agudas: Hérnia Encarcerada e Estrangulada*.
3. **Gabarito em Abdome Agudo:**
   - Apendicite aguda $\rightarrow$ *Apendicite Aguda: Apresentação Clínica, Escores e Apendicectomia*.
   - Diverticulite / Hinchey $\rightarrow$ *Diverticulite Aguda: Classificação de Hinchey e Tratamento*.
   - Colecistite / Critérios de Tóquio $\rightarrow$ *Colecistite Aguda Litiásica: Critérios de Tóquio e Colecistectomia*.
   - Obstrução intestinal / Bridas $\rightarrow$ *Obstrução Intestinal: Causas, Nível Obstrutivo e Conduta*.
4. **Gabarito Perioperatório:**
   - Risco cirúrgico (Goldman, ASA, Lee) $\rightarrow$ *Avaliação de Risco Cirúrgico Cardiovascular e ASA*.
   - Infecção de ferida operatória $\rightarrow$ *Infecção de Sítio Cirúrgico: Prevenção, Bundles e Manejo*.

---

### 4. Geração de Multi-Tags Transversais (`multi_tags`)
Tags atribuídas dinamicamente:
* `#CirurgiaGeral`, `#Trauma`, `#ATLS`, `#AbdomeAgudo`, `#Hernias`, `#Perioperatorio`, `#CirurgiaDigestiva`
* População / Cenário: `#Gestante`, `#Idoso`, `#Pediatria`, `#Pronto-Socorro / Emergencia`, `#Centro Cirurgico`
* Competência: `#Conduta Imediata`, `#Indicacao Cirurgica`, `#Diagnostico Padrao-Ouro`

---

### 5. Bateria de Testes de Rigor da Fase 2 (7 Pilares)
1. **Invariante Matemática:** Total de questões de Cirurgia Geral processadas deve ser exatamente **21.229** (unificação canônica de Cirurgia + Cirurgia Geral).
2. **Anti-Duplicação:** Zero questões com `novo_subfoco == novo_foco`.
3. **Sanitização:** Ausência de nós nulos e temas vazios.
4. **Massa Crítica:** Nenhum subfoco arbitrário com menos de 5 questões.
5. **Multi-Tags:** Todas as 21.229 questões com array de tags JSON válido.
6. **Rastreabilidade:** 100% das alterações acompanhadas de justificativa médica.
7. **Fronteira Clínica:** Separação rígida entre Trauma e Eletiva; cirurgias de subespecialidades (vascular, urologia, pediatria) preservadas em seus eixos próprios.

