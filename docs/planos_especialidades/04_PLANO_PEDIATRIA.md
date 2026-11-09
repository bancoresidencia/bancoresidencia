# Plano Operacional Especialista — Fase 4: Pediatria e Puericultura
## Volume Alvo: 24.132 Questões | Execução 100% Offline via SQLite Local (`questoes_132k.db`)

---

### 1. Perfil e Autoridade do Preceptor de Pediatria e Puericultura
* **Base Canônica de Autoridade:** Tratado e Guias Práticos da Sociedade Brasileira de Pediatria (SBP 2022-2026), Diretrizes de Reanimação Neonatal da SBP (2022/2024), Calendário Nacional de Vacinação do PNI/MS (2024/2026), Curvas de Crescimento da OMS (Z-score 2006/2007), Manual de Manejo da Desidratação e Diarreia Aguda (MS/Planos A, B e C), PALS (*Pediatric Advanced Life Support* - AHA/AAP), GINA Pediátrico; Livros: Nelson (*Textbook of Pediatrics* - 21ª/22ª Ed), Marcondes (*Pediatria Básica* - FMUSP).
* **Foco Curricular:** Puericultura (crescimento e DNPM), aleitamento materno, neonatologia, infectologia pediátrica (doenças exantemáticas), pneumologia pediátrica, gastroenterologia e desidratação, nefrologia e urgências pediátricas.

---

### 2. Matriz de Harmonização de Temas e Nomenclatura Formal

| Tema Antigo | Novo Tema Harmonizado (Formal & Distinto) | Justificativa Curricular |
| :--- | :--- | :--- |
| `Puericultura e Crescimento` | **Puericultura, Crescimento e Triagem Neonatal** | Curvas OMS, canais de crescimento, testes de triagem biológica e infecciosa. |
| `Adolescência` + `Maus Tratos...` | **Saúde do Adolescente e Situações de Vulnerabilidade** | Estadiamento de Tanner, direitos do menor e notificação de violência. |
| `Neonatologia` | **Neonatologia e Reanimação em Sala de Parto (SBP)** | VPP, Apgar, icterícia neonatal, sepse precoce e desconforto respiratório. |
| `Doenças Infecciosas Pediátricas` | **Infectologia Pediátrica e Doenças Exantemáticas** | Sarampo, varicela, roséola, eritema infeccioso, escarlatina e enteroviroses. |
| `Pneumologia Pediátrica` | **Pneumologia Pediátrica e Infecções Respiratórias** | Bronquiolite viral aguda, pneumonia comunitária e asma pediátrica. |
| `Gastroenterologia Pediátrica` | **Gastroenterologia Pediátrica e Terapia de Reidratação** | Diarreia aguda (Planos A, B, C da OMS), desidratação e intolerâncias alimentares. |
| `Nefrologia Pediátrica` | **Nefrologia Pediátrica: Glomerulopatias e ITU** | Síndrome nefrótica na infância, GNDA pós-estreptocócica e infecção urinária. |
| `Endocrinologia Pediátrica` | **Endocrinologia Pediátrica: DM1 e Crescimento** | Diabetes tipo 1, cetoacidose pediátrica e hipotireoidismo congênito. |
| `Reumatologia Pediátrica` | **Reumatologia Pediátrica: Artrite Idiopática e Vasculites** | AIJ, púrpura de Henoch-Schönlein e doença de Kawasaki. |
| `Cardiologia Pediátrica` | **Cardiologia Pediátrica e Cardiopatias Congênitas** | Cardiopatias acianóticas (CIV, CIA, PCA) e cianóticas (Tetralogia de Fallot). |

---

### 3. Regras de Resolução de Duplicatas (`subfoco == foco`)
1. **Comando/Gabarito em Puericultura e Crescimento:**
   - Ganho ponderal e Z-score $\rightarrow$ *Avaliação do Crescimento e Curvas da OMS (Z-Score)*.
   - Marcos motores e linguagem $\rightarrow$ *Desenvolvimento Neuropsicomotor (DNPM): Marcos e Alertas*.
   - Vacinas do PNI (BCG, Rotavírus, Meningo, Pneumo) $\rightarrow$ *Calendário Nacional de Vacinação do PNI e Eventos Adversos*.
   - Aleitamento materno exclusivo vs fórmulas $\rightarrow$ *Aleitamento Materno: Vantagens, Técnica e Dificuldades*.
2. **Comando/Gabarito em Neonatologia:**
   - Passos de reanimação (aquecer, secar, VPP) $\rightarrow$ *Reanimação Neonatal em Sala de Parto: Passos Iniciais e VPP*.
   - Icterícia fisiológica vs patológica / fototerapia $\rightarrow$ *Icterícia Neonatal: Zonas de Kramer e Fototerapia*.
   - Doença da membrana hialina vs taquipneia transitória $\rightarrow$ *Síndromes de Desconforto Respiratório no Recém-Nascido*.
3. **Comando/Gabarito em Gastroenterologia Pediátrica:**
   - SRO supervisionada (Plano B) $\rightarrow$ *Terapia de Reidratação Oral: Planos A e B da OMS*.
   - Hidratação venosa rápida (Plano C) $\rightarrow$ *Desidratação Grave: Plano C e Expansão Rápida com SF/Ringer*.
4. **Comando/Gabarito em Infectologia / Respiratório:**
   - Bronquiolite viral aguda (oxigênio e lavagem nasal) $\rightarrow$ *Bronquiolite Viral Aguda: Diagnóstico Clínico e Conduta*.
   - Doença exantemática febre alta que cede em crise $\rightarrow$ *Exantema Súbito e Doenças Exantemáticas Benignas*.
   - Vacinação pós-contato de sarampo em até 72h $\rightarrow$ *Sarampo: Diagnóstico Clínico e Bloqueio Vacinal*.

---

### 4. Geração de Multi-Tags Transversais (`multi_tags`)
Tags atribuídas dinamicamente:
* `#Pediatria`, `#Puericultura`, `#Neonatologia`, `#DNPM`, `#ImunizacaoPNI`, `#Exantematicas`, `#ReidratacaoOMS`
* População / Cenário: `#Neonato / RN`, `#Lactente`, `#Pre-Escolar`, `#Adolescente`, `#Pronto-Socorro / Emergencia`, `#Sala de Parto`
* Competência: `#Conduta Imediata`, `#Farmacoterapia Pediátrica`, `#Calculo de Doses / Hidratacao`, `#Curvas OMS`

---

### 5. Bateria de Testes de Rigor da Fase 4 (7 Pilares)
1. **Invariante Matemática:** Total de questões de Pediatria processadas deve ser exatamente **24.132**.
2. **Anti-Duplicação:** Zero ocorrências de `novo_subfoco == novo_foco`.
3. **Sanitização:** Ausência de nós nulos e categorias vazias.
4. **Massa Crítica:** Nenhum subfoco arbitrário com menos de 5 questões (salvo exceções canônicas de doenças raras).
5. **Multi-Tags:** 100% das 24.132 questões com JSON de tags válido.
6. **Rastreabilidade:** Justificativa médica preenchida em todas as alterações.
7. **Fronteira Clínica:** Isolamento absoluto de Neonatologia (sala de parto e RN) em relação a patologias da infância tardia.

