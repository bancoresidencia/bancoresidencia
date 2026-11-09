# Plano Operacional Especialista — Fase 5: Clínica Médica e Emergências
## Volume Alvo: 38.227 Questões | Execução 100% Offline via SQLite Local (`questoes_132k.db`)

---

### 1. Perfil e Autoridade do Preceptor de Clínica Médica e Emergências
* **Base Canônica de Autoridade:** Diretrizes Brasileiras de Hipertensão Arterial (SBC/SBH/SBN 2020/2024), Diretrizes de Insuficiência Cardíaca da SBC (2023/2024), Diretrizes da Sociedade Brasileira de Diabetes (SBD 2024/2026), Diretrizes Brasileiras de Pneumonia e Ventilação Mecânica (SBPT/AMIB), Diretrizes de Doença Renal Crônica (SBN/KDIGO), Consensos Brasileiros de Artrite Reumatoide e Lúpus (SBR), ACLS (AHA 2020-2025), GOLD (DPOC 2024/2026), GINA (Asma 2024/2026), KDIGO (Injúria Renal Aguda), Surviving Sepsis Campaign (2021-2026); Livros: Harrison (*Principles of Internal Medicine* - 21ª Ed), Goldman-Cecil (*Medicine* - 26ª Ed), Martins (*Clínica Médica USP* - Coleção 7 Volumes).
* **Foco Curricular:** As 13 grandes subespecialidades clínicas da residência: Cardiologia, Pneumologia, Nefrologia, Gastroenterologia/Hepatologia, Infectologia, Endocrinologia, Reumatologia, Hematologia, Neurologia, Dermatologia, Medicina de Emergência/UTI, Geriatria/Cuidados Paliativos, e Nutrologia/Toxicologia.

---

### 2. Matriz de Harmonização de Temas e Nomenclatura Formal

| Tema Antigo | Novo Tema Harmonizado (Formal & Distinto) | Justificativa Curricular |
| :--- | :--- | :--- |
| `Cardiologia` | **Cardiologia Clínica e Emergências Cardiovasculares** | HAS, IC, arritmias, DAC, choque cardiogênico e parada cardíaca (ACLS). |
| `Pneumologia` | **Pneumologia Clínica e Afecções Respiratórias** | Asma (GINA), DPOC (GOLD), pneumonias (CURB-65), TEP e insuficiência respiratória. |
| `Nefrologia` | **Nefrologia Clínica e Distúrbios Hidroeletrolíticos** | Injúria renal aguda (KDIGO), DRC, distúrbios do sódio/potássio e glomerulopatias. |
| `Gastroenterologia` | **Gastroenterologia Clínica e Hepatologia** | Doença péptica, hemorragia digestiva, cirrose hepática, ascite e DII. |
| `Infectologia` | **Infectologia Clínica e Terapia Antimicrobiana** | Sepse (Surviving Sepsis), infecções bacterianas, fúngicas, virais e uso de antibióticos. |
| `Endocrinologia` | **Endocrinologia e Doenças Metabólicas** | Diabetes mellitus (SBD), tireoidopatias, dislipidemias e crises hiperglicêmicas. |
| `Reumatologia` | **Reumatologia e Doenças Autoimunes Sistêmicas** | Artrite reumatoide, LES, gota, espondiloartrites e vasculites sistêmicas. |
| `Hematologia` | **Hematologia Clínica e Hemoterapia** | Anemias (carenciais e hemolíticas), leucemias, linfomas, hemostasia e transfusão. |
| `Neurologia` | **Neurologia Clínica e Emergências Neurológicas** | AVC/AVE isquêmico e hemorrágico, cefaleias, epilepsia, demências e coma. |
| `Dermatologia` | **Dermatologia Clínica e Lesões Elementares** | Farmacodermias graves (Stevens-Johnson), dermatoses comuns e neoplasias cutâneas. |
| `Toxicologia Clínica` | **Toxicologia Clínica e Intoxicações Exógenas** | Intoxicação por opioides, benzodiazepínicos, paracetamol, organofosforados e animais peçonhentos. |
| `Oncologia Clínica` | **Oncologia Clínica e Emergências Oncológicas** | Síndrome de lise tumoral, compressão medular e princípios de quimioterapia. |
| `Saúde do Idoso` | **Geriatria, Síndromes Geriátricas e Cuidados Paliativos** | Quedas, fragilidade, polifarmácia, demência e manejo de dor em fim de vida. |

---

### 3. Regras de Resolução de Duplicatas (`subfoco == foco`)
1. **Comando/Gabarito em Cardiologia:**
   - ICFEr e quádrupla terapia $\rightarrow$ *Insuficiência Cardíaca: Tratamento Otimizado e Redução de Mortalidade*.
   - IAM com supra e angioplastia primária $\rightarrow$ *Síndromes Coronarianas Agudas: Reperfusão e Farmacoterapia*.
   - Taquiarritmias (instável com cardioversão) $\rightarrow$ *Taquiarritmias e Bradiarritmias: Diagnóstico Eletrocardiográfico e Conduta (ACLS)*.
2. **Comando/Gabarito em Pneumologia:**
   - Asma aguda grave / corticoide + broncodilatador $\rightarrow$ *Asma Brônquica: Crise Aguda e Manejo Crônico (GINA)*.
   - DPOC exacerbação / antibiótico + broncodilatador $\rightarrow$ *Doença Pulmonar Obstrutiva Crônica: Exacerbações e Classificação (GOLD)*.
   - TEP / Escore de Wells $\rightarrow$ *Tromboembolismo Pulmonar: Estratificação de Risco e Anticoagulação*.
3. **Comando/Gabarito em Nefrologia:**
   - Hipercalemia com alteração de ECG (gluconato de cálcio) $\rightarrow$ *Distúrbios do Potássio: Hipercalemia Grave e Proteção Miocárdica*.
   - Síndrome Nefrótica vs Nefrítica $\rightarrow$ *Glomerulopatias no Adulto: Síndrome Nefrítica vs Nefrótica*.
   - IRA KDIGO 3 / indicação de hemodiálise de urgência $\rightarrow$ *Injúria Renal Aguda: Critérios KDIGO e Hemodiálise de Urgência*.
4. **Comando/Gabarito em Endocrinologia:**
   - Cetoacidose diabética (volume + insulina) $\rightarrow$ *Cetoacidose Diabética e Estado Hiperosmolar: Diagnóstico e Manejo*.
   - Hipotireoidismo / TSH elevado $\rightarrow$ *Hipotireoidismo e Tireoidites: Diagnóstico e Reposição com Levotiroxina*.
5. **Comando/Gabarito em Neurologia:**
   - AVE isquêmico / trombólise em até 4,5h $\rightarrow$ *Acidente Vascular Encefálico Isquêmico: Trombólise e Trombectomia Mecânica*.

---

### 4. Geração de Multi-Tags Transversais (`multi_tags`)
Tags atribuídas dinamicamente:
* `#ClinicaMedica`, `#Cardiologia`, `#Pneumologia`, `#Nefrologia`, `#Infectologia`, `#Endocrinologia`, `#Neurologia`, `#Reumatologia`, `#Hematologia`
* População / Cenário: `#Idoso / Geriatria`, `#Gestante`, `#Imunodeprimido`, `#Pronto-Socorro / Emergencia`, `#UTI / Terapia Intensiva`, `#Ambulatorio`
* Competência: `#Conduta Imediata`, `#Farmacoterapia`, `#Diagnostico Padrao-Ouro`, `#Criterios / Escores`, `#Eletrocardiograma`

---

### 5. Bateria de Testes de Rigor da Fase 5 (7 Pilares)
1. **Invariante Matemática:** Total de questões de Clínica Médica processadas deve ser exatamente **38.227**.
2. **Anti-Duplicação:** Zero ocorrências de `novo_subfoco == novo_foco`.
3. **Sanitização:** Ausência de nós nulos e temas vazios.
4. **Massa Crítica:** Nenhum subfoco arbitrário com menos de 5 questões (salvo exceções canônicas de doenças raras).
5. **Multi-Tags:** 100% das 38.227 questões com JSON de tags válido.
6. **Rastreabilidade:** Justificativa médica preenchida em todas as alterações.
7. **Fronteira Clínica:** Separação límpida entre as 13 grandes subespecialidades clínicas sem invasão indevida de território.

