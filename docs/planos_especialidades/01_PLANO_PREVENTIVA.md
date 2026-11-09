# Plano Operacional Especialista — Fase 1: Medicina Preventiva e Social
## Volume Alvo: 22.039 Questões | Execução 100% Offline via SQLite Local (`questoes_132k.db`)

---

### 1. Perfil e Autoridade do Preceptor de Medicina Preventiva e Social
* **Base Canônica de Autoridade:** Portaria GM/MS nº 217 (Notificação Compulsória 2024/2026), Portaria de Consolidação nº 2 (PNAB/ESF), Leis 8.080/90 e 8.142/90, PCDT HIV/AIDS, PEP, PrEP e ISTs (MS 2024), Cadernos de Atenção Básica (CAB 1 a 40), Declaração de Óbito e Sistemas de Informação (SIM, SINASC, SINAN); Livros de Referência: Rouquayrol & Gurgel (*Epidemiologia & Saúde*), Duncan (*Medicina Ambulatorial*), Fletcher (*Epidemiologia Clínica*).
* **Foco Curricular:** Estudos epidemiológicos, medidas de associação, testes diagnósticos/rastreamento, bioestatística, organização do SUS e vigilância em saúde.

---

### 2. Matriz de Harmonização de Temas e Nomenclatura Formal

| Tema Antigo | Novo Tema Harmonizado (Formal & Distinto) | Justificativa Curricular |
| :--- | :--- | :--- |
| `Epidemiologia` + `Estudos Epidemiológicos...` | **Epidemiologia e Estudos Epidemiológicos** | Unificação canônica exigida nos editais ENARE/USP. |
| `Políticas Públicas de Saúde` + `Sistema Único de Saúde` | **Sistema Único de Saúde (SUS) e Legislação** | Consolida evolução histórica, diretrizes e financiamento. |
| `Testes Diagnósticos...` + `Bioestatística` | **Bioestatística e Avaliação de Testes Diagnósticos** | Agrupa sensibilidade, especificidade, VPP, VPN e bioestatística analítica. |
| `Atenção Primária à Saúde` | **Atenção Primária à Saúde e Medicina de Família** | Formalização nosológica conforme a PNAB. |
| `Vigilância em Saúde` | **Vigilância em Saúde e Notificação Compulsória** | Integração das vigilâncias epidemiológica, sanitária e ambiental. |
| `Saúde do Trabalhador` | **Saúde do Trabalhador e Patologias Ocupacionais** | Foco em LER/DORT, pneumoconioses e acidentes biológicos. |
| `Ética Médica e Bioética` + `Medicina Legal...` | **Ética Médica, Bioética e Medicina Legal** | Unificação deontológica e pericial. |

---

### 3. Regras de Resolução de Duplicatas (`subfoco == foco`)
Quando uma questão de Preventiva possuir subfoco que apenas repete o foco:
1. **Comando/Gabarito com Cálculos de Associação (RR, OR, RA):** Alocar em *Medidas de Frequência e Associação*.
2. **Gabarito envolvendo Temporalidade (Passado vs Futuro):**
   - Coorte (exposição $\rightarrow$ desfecho): *Estudos de Coorte: Desenho e Viés*.
   - Caso-Controle (desfecho $\rightarrow$ exposição): *Estudos de Caso-Controle e Odds Ratio*.
   - Ensaio Clínico (randomização/cegamento): *Ensaios Clínicos Randomizados (Fases I a IV)*.
3. **Gabarito com Validação de Teste:**
   - Triagem/Rastreamento populacional $\rightarrow$ *Sensibilidade e Especificidade*.
   - Probabilidade pós-teste $\rightarrow$ *Valores Preditivos e Razão de Verossimilhança*.
4. **Gabarito envolvendo Equipe de Saúde ou Território:**
   - Atribuições de ACS/Enfermeiro/Médico $\rightarrow$ *Composição e Atribuições da Equipe de Saúde da Família*.
   - Abordagem familiar $\rightarrow$ *Ferramentas de Abordagem Familiar: Genograma e Ecomapa*.
5. **Gabarito com Notificação de Agravos:**
   - Imediata (até 24h) vs Semanal $\rightarrow$ *Doenças de Notificação Compulsória e Vigilância Epidemiológica*.

---

### 4. Geração de Multi-Tags Transversais (`multi_tags`)
Tags atribuídas dinamicamente por vocabulário clínico:
* `#SUS`, `#Epidemiologia`, `#Bioestatistica`, `#VigilanciaEmSaude`, `#AtencaoPrimaria`, `#SaudeDoTrabalhador`, `#EticaMedica`
* Cross-specialty / Populações: `#Gestante`, `#Idoso`, `#Pediatria`, `#Imunodeprimido`, `#Trabalhador`
* Competência: `#Calculo / Escore`, `#Notificacao Compulsoria`, `#Legislacao`, `#Conduta Imediata`

---

### 5. Bateria de Testes de Rigor da Fase 1 (7 Pilares)
1. **Invariante Matemática:** Total de questões de Preventiva processadas deve ser exatamente **22.039**.
2. **Anti-Duplicação:** Zero questões com `novo_subfoco == novo_foco`.
3. **Sanitização:** Zero campos nulos, indefinidos ou temas genéricos (*"Geral"*).
4. **Massa Crítica:** Nenhum subfoco com menos de 5 questões (salvo exceções raras de edital).
5. **Multi-Tags:** Todas as 22.039 questões devem possuir JSON válido em `multi_tags` com pelo menos 1 tag.
6. **Rastreabilidade:** 100% das questões alteradas com `motivo_regra` preenchido.
7. **Fronteira Clínica:** Nenhuma questão de estudos analíticos em tema de SUS; 100% das notificações compulsórias em Vigilância.

