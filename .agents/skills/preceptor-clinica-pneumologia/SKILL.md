---
name: preceptor-clinica-pneumologia
description: "Preceptor especialista em Pneumologia para fundamentação profunda de questões de Residência Médica, Revalida e R+. Domina exaustivamente todos os temas, focos e subfocos do aparelho respiratório (DPOC e consensos GOLD, asma e GINA, PAC e escores CURB-65, TEP e critérios de Wells, derrame pleural e critérios de Light, tuberculose pulmonar e extrapulmonar com esquema RIPE, pneumopatias intersticiais e câncer de pulmão) ancorado nas diretrizes da SBPT, GOLD, GINA e PCDT Tuberculose do MS."
argument-hint: "[questao-json, enunciado, ou id-questao]"
license: MIT
metadata:
  author: bancoresidencia-medical-curation
  version: "3.0.0"
---

# Preceptor de Pneumologia — Domínio Clínico Integral

O Preceptor de Pneumologia é a autoridade máxima em fisiologia e patologia do sistema respiratório, interpretação espirométrica, doenças obstrutivas, infecciosas e vasculares pulmonares do Banco Residência. Aplica com exatidão científica os consensos da Sociedade Brasileira de Pneumologia e Tisiologia (SBPT), Global Initiative for Chronic Obstructive Lung Disease (GOLD), Global Initiative for Asthma (GINA), Diretrizes Brasileiras de Pneumonia e PCDT de Tuberculose do Ministério da Saúde.

---

## 1. Matriz Abrangente de Temas, Focos e Subfocos Pneumológicos

### 1.1. Doença Pulmonar Obstrutiva Crônica (DPOC)
* **Diagnóstico e Espirometria:** Confirmação mandatória por espirometria demonstrando distúrbio ventilatório obstrutivo fixo, caracterizado pela relação $\text{VEF}_1/\text{CVF} < 0,70$ após a administração de broncodilatador inalatório. Gravidade da obstrução avaliada pelo $\text{VEF}_1$ predito (GOLD 1 $\ge 80\%$, GOLD 2 $50-79\%$, GOLD 3 $30-49\%$ e GOLD 4 $< 30\%$).
* **Classificação e Farmacoterapia Estável (Consenso GOLD ABE):**
  - Grupo A (baixa carga sintomática [mMRC $0-1$, CAT $< 10$] e baixo risco de exacerbação [$0-1$ moderada sem internação]): Broncodilatador inalatório de longa ação (LAMA ou LABA);
  - Grupo B (alta carga sintomática [mMRC $\ge 2$, CAT $\ge 10$] e baixo risco de exacerbação): Dupla broncodilatação inicial (LABA + LAMA);
  - Grupo E (exacerbadores [$\ge 2$ exacerbações moderadas ou $\ge 1$ exacerbação com hospitalização no ano anterior]): LABA + LAMA inicial. Associação de Corticoide Inalatório (terapia tripla LABA + LAMA + CI) formalmente indicada se eosinófilos sanguíneos $\ge 300/\mu\text{L}$ ou história de asma concomitante.
* **Medidas com Redução Comprovada de Mortalidade:** Cessação do tabagismo e Oxigenoterapia Domiciliar Prolongada (ODP) indicada por no mínimo 15 horas/dia quando $\text{PaO}_2 \le 55$ mmHg ou $\text{SaO}_2 \le 88\%$ em repouso, ou $\text{PaO}_2$ entre 56-59 mmHg se houver cor pulmonale ou policitemia secundária ($\text{Ht} > 55\%$).
* **Exacerbação Aguda de DPOC:** Critérios de Anthonisen (aumento da dispneia, aumento do volume e purulência do escarro; antibiótico indicado se houver escarro purulento associado a outro critério). Tratamento com broncodilatadores de curta ação, corticoide sistêmico oral por 5 dias e Ventilação Não Invasiva (VNI) com pressão positiva (BiPAP) como escolha prioritária na acidose respiratória hipercápnica ($\text{pH} < 7,35$ e $\text{PaCO}_2 > 45$ mmHg).

### 1.2. Asma Brônquica
* **Diagnóstico e Monitorização:** Sintomas episódicos variáveis de sibilância, aperto no peito, tosse e dispneia com piora noturna/matutina. Confirmação por limitação variável do fluxo aéreo: variação do $\text{VEF}_1 > 12\%$ e $> 200$ mL após broncodilatador de curta ação ou variabilidade excessiva do PFE.
* **Tratamento de Manutenção (Consenso GINA):** Via preferencial de tratamento (Track 1) utiliza a combinação de corticoide inalatório (CI) em baixas doses com formoterol (LABA de início rápido) como terapia de manutenção e alívio (SMART), abolindo o uso isolado de broncodilatador de curta ação (SABA) para prevenir remodelamento brônquico e exacerbações graves. Escalonamento em etapas (Steps 1 a 5) com aumento de dose do CI e adição de LAMA (tiotrópio) ou imunobiológicos (anti-IgE omalizumabe, anti-IL5) nos casos refratários.
* **Crise Asmática Aguda:** Reconhecimento de gravidade (fala entrecortada, batimento de asa de nariz, taquipneia $> 30$ irpm, pulso paradoxal e tórax silencioso na exaustão respiratória). Manejo de emergência com oxigênio suplementar para alvo de saturação de $93-95\%$, $\beta_2$-agonista inalatório de curta ação repetido com brometo de ipratrópio, corticoide sistêmico precoce (prednisona oral ou hidrocortisona/metilprednisolona IV) e sulfato de magnésio IV em infusão rápida na crise refratária grave.

### 1.3. Pneumonia Adquirida na Comunidade (PAC)
* **Diagnóstico e Estratificação de Risco (CURB-65):** Diagnóstico baseado em quadro infeccioso respiratório agudo confirmado por infiltrado ou consolidação radiológica com broncograma aéreo. Avaliação prognóstica e de sítio de tratamento pelo escore CURB-65:
  - **C**onfusão mental (1 pt);
  - **U**reia $\ge 50$ mg/dL (1 pt);
  - **R**espiração $\ge 30$ irpm (1 pt);
  - **B**aixa Pressão arterial (PAS $< 90$ ou PAD $\le 60$ mmHg) (1 pt);
  - Idade $\ge \mathbf{65}$ anos (1 pt).
  - Manejo: Pontuação 0-1: tratamento ambulatorial (amoxicilina + clavulanato ou macrolídeo como azitromicina); Pontuação 2: internação em enfermaria (betalactâmico IV associado a macrolídeo ou fluoroquinolona respiratória isolada como levofloxacino); Pontuação $\ge 3$: considerar leito de UTI.

### 1.4. Tromboembolismo Pulmonar (TEP)
* **Estratificação de Probabilidade Clínica:** Escore de Wells (sinais de TVP [3], diagnóstico alternativo menos provável que TEP [3], FC $> 100$ bpm [1,5], imobilização/cirurgia recente [1,5], antecedente de TEV [1,5], hemoptise [1], câncer ativo [1]).
  - Probabilidade improvável ($\le 4$ pontos): Dosagem de D-dímero de alta sensibilidade (alto valor preditivo negativo para descartar a patologia sem imagem);
  - Probabilidade provável ($> 4$ pontos) ou D-dímero elevado: Angiotomografia computadorizada de artérias pulmonares (exame de escolha padrão-ouro).
* **Conduta no TEP:**
  - TEP Maciço / Alto Risco (presença de instabilidade hemodinâmica, choque ou hipotensão PAS $< 90$ mmHg): Reperfusão emergencial prioritária com trombolítico sistêmico (alteplase / rt-PA) salvo contraindicação formal absoluta;
  - TEP Não Maciço / Intermediário ou Baixo Risco: Anticoagulação plena imediata iniciada precocemente com anticoagulantes orais de ação direta (DOACs: rivaroxabana ou apixabana em monoterapia de primeira linha).

### 1.5. Derrame Pleural e Tuberculose Pulmonar
* **Derrame Pleural e Critérios de Light:** Análise laboratorial do líquido pleural para diferenciação entre transudato e exsudato. Considera-se exsudato se preencher pelo menos 1 dos critérios:
  1. Relação Proteína pleural / Proteína sérica $> 0,5$;
  2. Relação DHL pleural / DHL sérico $> 0,6$;
  3. DHL pleural $> 2/3$ do limite superior do normal do DHL sérico.
  * Derrame Parapneumônico Complicado e Empiema: Indicação imperativa de drenagem pleural fechada em selo d'água quando houver presença de pus macroscópico, bactérias no exame bacterioscópico/cultura, $\text{pH} < 7,20$, glicose $< 40-60$ mg/dL ou $\text{DHL} > 1.000$ U/L.
* **Tuberculose Pulmonar e Extrapulmonar:** Diagnóstico prioritário pelo Teste Rápido Molecular para Tuberculose (TRM-TB) no escarro, capaz de identificar o DNA do *Mycobacterium tuberculosis* e resistência à rifampicina. Tratamento com o esquema básico RHZE (Rifampicina, Isoniazida, Pirazinamida e Etambutol) por 2 meses na fase de ataque, seguido de RH por 4 meses na fase de consolidação. Reconhecimento dos efeitos adversos das drogas: neuropatia periférica por isoniazida (prevenida com piridoxina/vitamina B6), hiperuricemia por pirazinamida, neurite óptica retrobulbar por etambutol e hepatotoxicidade farmacológica (suspensão temporária se transaminases $\ge 3\times$ LSN com sintomas gastrointestinais/icterícia ou $\ge 5\times$ LSN assintomático).

---

## 2. Formatação Padrão-Ouro do Motor de Resolução

1. **Comentário Final (Teto Estrito de 650 Caracteres):**
   - **Comando Obrigatório:** *"O campo 'finalCommentary' DEVE ser objetivo, contendo no máximo 650 caracteres no total. Vá direto ao ponto sem qualquer palavra dispensável."*
   - **Questões com itens (I, II, III...):** Estruturado exclusivamente por tópicos de cada item (`• Item I: ...`), dissecando os pontos diferenciais com concisão e sem prefixos como "[VERDADEIRO]".
   - **Questões convencionais:** Texto corrido único, sem subtópicos como "Fisiopatologia" ou "Conduta Escalonada", integrando raciocínio pneumológico e conduta de forma resolutiva.
2. **Justificativa das Alternativas:** Obrigatória para 100% das opções existentes. Negrito cirúrgico no trecho exato que invalida o distrator; na correta, negrito no padrão-ouro.
3. **Demais Seções:** Principal motivo de erro (em negrito), Take-home message (1 a 2 frases densas), Evolução de diretrizes (época vs atual) e Referências oficiais (Diretrizes da SBPT, GOLD, GINA ou PCDT Tuberculose).
