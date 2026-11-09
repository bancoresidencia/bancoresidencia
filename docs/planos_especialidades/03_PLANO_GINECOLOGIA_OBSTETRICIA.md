# Plano Operacional Especialista — Fase 3: Ginecologia e Obstetrícia
## Volume Alvo: 27.320 Questões (Ginecologia + Obstetrícia) | Execução 100% Offline via SQLite Local

---

### 1. Perfil e Autoridade do Preceptor de Ginecologia e Obstetrícia
* **Base Canônica de Autoridade:** Tratado e Protocolos Oficiais da FEBRASGO (2022-2026), Manuais de Gestação de Alto Risco do Ministério da Saúde (2022/2024), Diretrizes Nacionais de Assistência ao Parto Normal (MS/Conitec), Diretrizes de Rastreamento do Câncer de Colo e Mama (INCA/MS), ACOG Practice Bulletins, Classificação FIGO para Sangramento Uterino Anormal (PALM-COEIN), Consenso de Rotterdam (SOP), Critérios Médicos de Elegibilidade Contraceptiva da OMS; Livros: Rezende (*Obstetrícia*), Zugaib (*Obstetrícia* - FMUSP), Berek & Novak (*Gynecology*), Speroff.
* **Foco Curricular:** Separação canônica entre Obstetrícia e Ginecologia, pré-natal, hemorragias gestacionais, DHEG, partograma, puerpério, SUA, climatério, oncoginecologia, mastologia e infecções ginecológicas.

---

### 2. Matriz de Harmonização de Temas e Nomenclatura Formal

| Tema Antigo | Novo Tema Harmonizado (Formal & Distinto) | Justificativa Curricular |
| :--- | :--- | :--- |
| `Fundamentos de Ginecologia` + `Ginecologia Geral` | **Sangramento Uterino Anormal e Afecções Benignas do Útero** | Extinção de nó lixeira; alocação em SUA (PALM-COEIN) e miomatose. |
| `Síndrome dos Ovários Policísticos` + `Ciclo Menstrual` | **Ginecologia Endócrina e Distúrbios Menstruais** | Unificação da fisiologia menstrual, amenorreias e SOP. |
| `Climatério e Menopausa` | **Climatério, Menopausa e Terapia Hormonal** | Foco em fogachos, osteoporose e indicações/contraindicações de TH. |
| `Oncologia Ginecológica` | **Oncologia Ginecológica: Colo, Endométrio e Ovário** | Foco em estadiamento, citopatologia (Bethesda) e rastreamento. |
| `Mastologia` | **Mastologia e Doenças Benignas e Malignas da Mama** | Nódulo mamário, Bi-RADS, derrame papilar e rastreamento. |
| `Infecções Ginecológicas` | **Infecções Ginecológicas, Vulvovaginites e DIP** | Vaginose bacteriana, candidíase, tricomoníase e DIP (Monif). |
| `Planejamento Familiar` | **Planejamento Familiar e Métodos Contraceptivos** | Critérios de elegibilidade da OMS, DIU, implantes e emergência. |
| `Assistência Pré-natal` | **Assistência Pré-Natal e Modificações do Organismo Materno** | Rotina de exames, vacinação, suplementação e datação gestacional. |
| `Doenças Hipertensivas na Gestação` | **Síndromes Hipertensivas na Gestação e Pré-Eclâmpsia** | Pré-eclâmpsia, eclâmpsia, síndrome HELLP e sulfato de magnésio. |
| `Hemorragias Obstétricas` | **Hemorragias da Primeira e Segunda Metade da Gestação** | Abortamento, gravidez ectópica, mola, DPP e placenta prévia. |
| `Trabalho de Parto e Parto` | **Trabalho de Parto, Partograma e Distócias** | Estática fetal, fases clínicas, partograma e tocotraumatismos. |
| `Puerpério e Aleitamento` | **Puerpério Normal, Patológico e Aleitamento Materno** | Atonia uterina, infecção puerperal, mastite e retorno da fertilidade. |
| `Medicina Fetal` | **Medicina Fetal e Avaliação da Vitalidade Fetal** | Cardiotocografia, perfil biofísico fetal, dopplervelocimetria e gemelaridade. |

---

### 3. Regras de Resolução de Duplicatas (`subfoco == foco`)
1. **Comando/Gabarito em Obstetrícia:**
   - DHEG / Pré-eclâmpsia grave $\rightarrow$ *Sulfato de Magnésio: Esquemas (Pritchard/Zuspan) e Manejo*.
   - DPP vs Placenta Prévia $\rightarrow$ *Hemorragias da Segunda Metade: Diagnóstico Diferencial e Conduta*.
   - Partograma / Linha de alerta $\rightarrow$ *Interpretação do Partograma e Correção de Distócias*.
   - Atonia uterina pós-parto $\rightarrow$ *Hemorragia Pós-Parto: Atonia Uterina e Manobras Hemostáticas*.
   - Vitalidade fetal / Doppler de ducto venoso $\rightarrow$ *Dopplervelocimetria Fetal e Avaliação da Hipóxia Crônica*.
2. **Comando/Gabarito em Ginecologia:**
   - Miomas / Sangramento volumoso $\rightarrow$ *Leiomiomatose Uterina: Diagnóstico, FIGO e Miomectomia*.
   - Citologia oncótica / LIE-AG $\rightarrow$ *Rastreamento de Câncer de Colo: Colposcopia e Conização*.
   - Nódulo mamário / Bi-RADS 4 $\rightarrow$ *Investigação do Nódulo de Mama: Biópsia e Classificação Bi-RADS*.
   - Critérios de Rotterdam em SOP $\rightarrow$ *Síndrome dos Ovários Policísticos: Critérios e Tratamento*.
   - Corrimento com teste de aminas positivo $\rightarrow$ *Vulvovaginites: Diagnóstico Diferencial e Tratamento*.

---

### 4. Geração de Multi-Tags Transversais (`multi_tags`)
Tags atribuídas dinamicamente:
* `#Obstetricia`, `#Ginecologia`, `#PreNatal`, `#DHEG`, `#Parto`, `#Puerperio`, `#VitalidadeFetal`, `#SUA`, `#Oncoginecologia`, `#Mastologia`
* População / Cenário: `#Gestante`, `#Puerpera`, `#Climaterio / Menopausa`, `#Adolescente`, `#Pronto-Socorro`, `#Centro Cirurgico`
* Competência: `#Conduta Imediata`, `#Farmacoterapia`, `#Rastreamento`, `#Criterios / Escores`

---

### 5. Bateria de Testes de Rigor da Fase 3 (7 Pilares)
1. **Invariante Matemática:** Total de questões processadas em GO deve ser exatamente **27.320** (14.092 Obstetrícia + 13.228 Ginecologia).
2. **Anti-Duplicação:** Zero ocorrências de `novo_subfoco == novo_foco`.
3. **Sanitização:** Eliminação total do nó genérico "Ginecologia Geral".
4. **Massa Crítica:** Nenhum subfoco arbitrário com menos de 5 questões.
5. **Multi-Tags:** 100% das 27.320 questões com array JSON válido.
6. **Rastreabilidade:** Justificativa médica preenchida em todas as alterações.
7. **Fronteira Clínica:** Separação cirúrgica de cadernos: temas obstétricos estritamente em Obstetrícia e ginecológicos em Ginecologia.

