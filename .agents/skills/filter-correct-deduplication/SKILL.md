---
name: filter-correct-deduplication
description: Skill especialista da Frente 1 para cruzar todas as 263.197 questões das tabelas canônicas do Supabase e da base de expansão local (provaderesidencia_coleta_parte2.db), identificar questões idênticas/duplicadas com alta sensibilidade e especificidade, classificar em 'Indiscutivelmente iguais', 'Em dúvida/inconclusivo' e 'Distintas', executar fusão inteligente com preservação dos melhores filtros e governar a quarentena para verificação manual no localhost.
---

# Frente 1: Deduplicação Canônica e Cruzamento de Bancos de Questões

Esta skill governa o diagnóstico, detecção, classificação e saneamento de questões duplicadas em todo o acervo do **Banco Residência** — compreendendo **263.197 questões consolidadas**:
- **224.032 questões** das 5 tabelas extraídas do Supabase (`questions`, `questions_expansion_direto`, `questions_expansion_r_plus`, `questions_expansion_revalida`, `questions_expansion_titulo_especialista`).
- **39.165 questões** da base de expansão e coleta local `provaderesidencia_coleta_parte2.db` (tabelas `provaderesidencia_questoes`, `provaderesidencia_provas` e `provaderesidencia_imagens_arquivo`).

---

## 🎯 1. Propósito e Diretriz Fundamental

O objetivo final desta frente é atingir **zero duplicatas** no acervo consolidado, garantindo que:
1. **Definição Canônica de Questão Igual:** Duas questões são consideradas iguais quando possuem o **mesmo enunciado clínico** (ou variações meramente cosméticas/ortográficas de OCR) e o **mesmo conjunto de alternativas** (independentemente da ordem das letras A, B, C, D, E).
2. **Cruzamento Global de Todas as Fontes:**
   - *Intra-Supabase:* Tabela canônica `questions` vs. tabelas `questions_expansion_*`.
   - *Supabase vs. Coleta Local:* Todas as tabelas do Supabase cruzadas contra as 39.165 questões de `provaderesidencia_coleta_parte2.db`.
   - *Intra-Coleta:* Identificação de redundâncias internas entre cadernos de prova de `provaderesidencia_coleta_parte2.db`.
3. **Alta Sensibilidade:** Nenhuma duplicata real deve passar despercebida entre tabelas cruzadas.
4. **Alta Especificidade (Sensibilidade Clínica):** Questões com vinhetas clínicas parecidas, mas que alteram valores laboratoriais, parâmetros vitais ou cujo desfecho/conduta mude a resposta correta, **jamais devem ser mescladas automaticamente**.
5. **Governança de Fusão Não Destrutiva:** Ao mesclar, herdam-se os metadados mais ricos de cada cópia (comentários padrão-ouro, gabaritos homologados, instituição oficial, imagens originais e numeração oficial da prova), mantendo rastreabilidade total via `merged_from_ids`.

---

## 🔄 2. Mapeamento e Adaptação Canônica de Schema

Para permitir a comparação uniforme de todas as 263.197 questões, a tabela `provaderesidencia_questoes` é projetada na visão canônica unificada (`canonical_question_view`) via junção com `provaderesidencia_provas`:

| Campo Canônico | Origem Supabase (`questions` / expansões) | Origem Coleta (`provaderesidencia_coleta_parte2.db`) |
| :--- | :--- | :--- |
| **`id`** | `id` (UUID string) | `pdr_` + `q.id` (ex: `"pdr_51"`) |
| **`statement`** | `statement` | `q.enunciado` |
| **`options`** | `options` (JSON array: `[{"text", "letter"}]`) | `q.opcoes_json` (JSON array: `[{"text", "letter"}]`) |
| **`correct_answer`**| `correct_answer` | `q.gabarito_oficial` |
| **`is_anulada`** | `is_anulada` (boolean) | `CASE WHEN q.is_anulada = 1 THEN true ELSE false END` |
| **`institution`** | `institution` | `COALESCE(p.instituicao_banco, p.instituicao_raw)` |
| **`banca`** | `banca` | `COALESCE(p.instituicao_banco, p.instituicao_raw)` |
| **`year`** | `year` | `p.ano` |
| **`modalidade`** | `modalidade` | `p.modalidade` |
| **`numero_questao`**| Extraído do `code` ou nulo | `q.numero` |
| **`titulo_prova`** | `tipo_prova` | `p.titulo` |
| **`images`** | `images` (URLs/nomes de arquivo) | `q.imagens_locais_json` / `q.imagens_json` |
| **`commentary`** | `commentary` | `q.texto_gabarito` (quando disponível) |

---

## 🔬 3. Arquitetura Algorítmica de Alta Sensibilidade e Especificidade

A comparação par a par de 263.197 questões geraria $\approx 34,6$ bilhões de combinações ($\mathcal{O}(N^2)$), computacionalmente proibitivo. A skill adota um **Pipeline Hierárquico em 4 Etapas**:

```
┌────────────────────────────────────────────────────────────────────────┐
│  ETAPA 1: Normalização Canônica e Limpeza de Ruído Médico              │
│           • Aplicação uniforme em Supabase e provaderesidencia         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  ETAPA 2: Blocagem de Alta Performance (Hash Exato + Inverted Shingles)│
│           • Reduz de 34,6 bilhões para < 250 mil pares candidatos      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  ETAPA 3: Matriz de Similaridade Fina & Pareamento de Assertivas       │
│           • Enunciado (40%) + Alternativas Bipartidas (40%)            │
│           • Concordância de Gabarito (12%) + Similaridade Banca (8%)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  ETAPA 4: Classificação Tripartida e Roteamento                        │
│   ├─ [Score ≥ 0.94 & Gabarito OK] ──► 1. Indiscutivelmente Iguais      │
│   ├─ [0.75 ≤ Score < 0.94 ou Flag] ─► 2. Em Dúvida / Inconclusivo      │
│   └─ [Score < 0.75] ────────────────► 3. Distintas                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧼 4. Etapa 1: Protocolo de Normalização Canônica

Antes de qualquer cálculo de hash ou distância, o texto do enunciado e das alternativas passa pelo pipeline determinístico:

1. **Remoção de Boilerplate de Banca:** Elimina prefixos e sufixos genéricos de prova que inflacionam ou mascaram semelhanças:
   - *"Assinale a alternativa correta a respeito do caso..."*
   - *"Com base no quadro clínico acima exposto, assinale..."*
   - *"De acordo com as diretrizes do Ministério da Saúde..."*
   - Numerações residuais de questão (*"Questão 42:", "1 - ", "(ENARE 2024)"*).
2. **Sanitização Estrutural:**
   - Remoção de tags HTML (`<p>`, `<span>`, `<br>`, `<b>`) e normalização de formatação Markdown.
   - Conversão para minúsculas (`lowercase`).
   - Normalização Unicode (NFC/NFKD) e remoção de acentos/diacríticos para evitar falsos negativos causados por codificações divergentes (ex: `Ã£o` vs `ão`).
   - Colapso de múltiplos espaços, quebras de linha e tabulações em um único espaço em branco.
3. **Padronização de Símbolos e Unidades Médicas:**
   - Conversão de frações e grandezas: `mg/dl` $\rightarrow$ `mg/dL`, `mmhg` $\rightarrow$ `mmHg`, `pct` $\rightarrow$ `%`.
   - Normalização de pontuação decimal (ex: `1,5` $\leftrightarrow$ `1.5`).

---

## ⚡ 5. Etapa 2: Blocagem em Larga Escala (Scale Blocking)

Para viabilizar a comparação de todo o acervo unificado em minutos:

### 5.1. Fast-Path: Hash SHA-256 de Identidade Estrita
- **Hash do Enunciado:** `hash_enunciado = SHA256(normalize(statement))`
- **Hash do Conjunto de Alternativas (Invariante a Ordem):**
  - Cada alternativa $i$ é normalizada: $t_i = \text{normalize}(\text{option}_i.\text{text})$.
  - O conjunto de alternativas é ordenado lexicograficamente: $T = \text{sort}([t_1, t_2, \dots, t_k])$.
  - `hash_alternativas = SHA256(join("||", T))`
- **Chave Composta:** `fingerprint = SHA256(hash_enunciado + "::" + hash_alternativas)`
- **Resultado:** Qualquer colisão de `fingerprint` aponta instantaneamente questões com enunciado e alternativas perfeitamente idênticas, processadas em $\mathcal{O}(N)$ direto no SQLite com índice.

### 5.2. Near-Duplicate Path: MinHash & Token Shingling
Para questões com pequenas diferenças de OCR, pontuação ou substituições sinonímicas:
- Extração de 3-gramas de palavras e 4-gramas de caracteres do enunciado.
- Indexação invertida baseada em tokens raros e tamanho de texto (janela de $\pm 15\%$ de comprimento).
- Redução do espaço amostral para apenas pares com sobreposição preliminar $\ge 70\%$.

---

## 📐 6. Etapa 3: Matriz de Similaridade Fina e Pesos

Para cada par candidato $(Q_A, Q_B)$, calcula-se o **Índice Composto de Identidade ($Score_{total}$)**:

$$\mathbf{Score_{total} = (0.40 \times S_{enun}) + (0.40 \times S_{alt}) + (0.12 \times C_{gab}) + (0.08 \times S_{inst})}$$

### 6.1. Similaridade do Enunciado ($S_{enun}$) — Peso 40%
Combina duas métricas complementares:
1. **Token Sort Ratio (Jaccard ponderado de tokens):** Insensível à inversão de frases.
2. **Levenshtein Normalizado / Damerau-Levenshtein:** Sensível à ordem estrita e detecção de typos pontuais.
$$S_{enun} = 0.6 \times \text{TokenSortRatio}(E_A, E_B) + 0.4 \times \text{LevenshteinSim}(E_A, E_B)$$

### 6.2. Similaridade de Alternativas com Invariância de Permutação ($S_{alt}$) — Peso 40%
As bancas frequentemente embaralham as alternativas (a resposta certa que era a letra A na prova original passa a ser a C em outro caderno).
- **Algoritmo de Casamento Bipartido Ótimo (Greedy / Hungarian Match):**
  - Para cada alternativa $a \in Q_A$, calcula-se a similaridade textual contra todas as alternativas $b \in Q_B$.
  - Encontra-se a bijeção que maximiza a soma de similaridades:
    $$S_{alt} = \frac{1}{K} \sum_{i=1}^{K} \max_{j} \text{Sim}(a_i, b_{\pi(j)})$$
  - Se ambas têm 4 ou 5 alternativas e todas casam com similaridade $> 0.95$, $S_{alt} \approx 1.0$.
  - Se houver alternativas com conteúdos substancialmente diferentes, $S_{alt}$ cai bruscamente.

### 6.3. Concordância do Gabarito ($C_{gab}$) — Peso 12%
- Compara o **texto da alternativa correta** apontada em $Q_A$ com o **texto da alternativa correta** apontada em $Q_B$:
  - Se o texto das respostas corretas corresponder ($\text{Sim}(Text_{gabA}, Text_{gabB}) \ge 0.92$), $C_{gab} = 1.0$.
  - Se uma das questões for `ANULADA` em uma banca e com gabarito na outra: $C_{gab} = 0.70$ (indica histórico de recurso/anulação).
  - Se os textos das alternativas corretas forem **antagônicos ou divergentes** (ex: uma aponta "Apendicectomia laparoscópica" e a outra "Tratamento clínico com antibioticoterapia"), $C_{gab} = 0.0$ e **ativa-se o Trigger de Quarentena Obrigatória**.

### 6.4. Similaridade de Instituição, Banca e Ano ($S_{inst}$) — Peso 8%
- **Compatibilidade Institucional:** Utiliza tabela de aliases canônicos (ex: `"USP"` $\approx$ `"Universidade de São Paulo"`, `"HELGJ"` $\approx$ `"Hospital Estadual Alberto Torres"`, `"ENARE"` $\approx$ `"Exame Nacional de Residência"`).
- Se a instituição ou banca for compatível: $S_{inst} = 1.0$.
- Se forem instituições diferentes, mas mesmo ano ou prova compartilhada (processos seletivos unificados como PSU-MG, SUS-SP, AMRIGS): $S_{inst} = 0.8$.
- Se forem bancos independentes que replicaram a mesma questão de concurso: $S_{inst} = 0.5$.

---

## 🚦 7. Etapa 4: Critérios Estritos de Classificação

Todo par analisado é classificado em uma de três categorias mútuo-exclusivas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MATRIZ DE DECISÃO TRIPARTIDA                      │
├────────────────────────┬───────────────────────────────────────────────┤
│ CLASSIFICAÇÃO          │ CRITÉRIOS DE CORTE (CONDICIONANTES)           │
├────────────────────────┼───────────────────────────────────────────────┤
│ 1. INDISCUTIVELMENTE   │ • Score_total ≥ 0.94                          │
│    IGUAIS              │ • S_enun ≥ 0.92 E S_alt ≥ 0.90                │
│                        │ • C_gab = 1.0 (ou uma nula com opções iguais) │
│                        │ • Zero divergências numéricas em exames       │
├────────────────────────┼───────────────────────────────────────────────┤
│ 2. EM DÚVIDA /         │ • 0.75 ≤ Score_total < 0.94                   │
│    INCONCLUSIVO        │ • OU S_enun ≥ 0.90 com C_gab < 0.80           │
│    (QUARENTENA)        │ • OU Divergência de gabarito entre gabaritos  │
│                        │ • OU Valores de exames com variações leves    │
│                        │ • OU Quantidade diferente de alternativas     │
├────────────────────────┼───────────────────────────────────────────────┤
│ 3. DISTINTAS           │ • Score_total < 0.75                          │
│                        │ • Questões de condutas clínicas opostas       │
│                        │ • Casos clínicos diferentes sobre mesmo tema  │
└────────────────────────┴───────────────────────────────────────────────┘
```

---

## 🧬 8. Política Canônica de Fusão (Merge Policy)

Quando duas ou mais questões forem classificadas como **Indiscutivelmente Iguais**, uma única questão canônica é consolidada combinando o melhor de cada fonte:

| Campo | Regra de Prevalência e Resolução de Conflito |
| :--- | :--- |
| **`id` Canônico** | Prevalece o ID da tabela principal `questions` do Supabase (se existir). Caso a fusão seja entre `provaderesidencia` e expansão, prevalece o ID da expansão. Se for intra-`provaderesidencia`, prevalece o menor ID. |
| **`institution`** | Prevalece a grafia oficial, completa e mais esclarecedora (ex: *"Universidade de São Paulo (USP-SP)"* vence *"USP"* ou siglas brutas). |
| **`banca`** | Prevalece a banca examinadora oficial canônica em detrimento de plataformas agregadoras. |
| **`numero_questao` & `titulo_prova`** | Se a versão do `provaderesidencia` contiver o número real da questão no caderno oficial (`q.numero`) e o título da prova (`p.titulo`), esses dados oficiais são incorporados aos metadados da questão canônica. |
| **`commentary`** | **Regra do Comentário Ouro:** Preserva-se o comentário com maior riqueza pedagógica (maior tamanho, presença de justificativas estruturadas por alternativa, Take-Home Message e referências). Se uma for do Supabase com comentário ouro e a de `provaderesidencia` só tiver gabarito cru, o comentário ouro é preservado. |
| **`difficulty`** | Prevalece a dificuldade calibrada (derivada de TRI/IRT ou validação docente) em vez de valores genéricos ou ausentes. |
| **`correct_answer`** | Preserva-se o gabarito oficial definitivo homologado da banca. Se uma das questões apontar anulação confirmada (`is_anulada = true`), preserva-se o status de anulada e o motivo no comentário. |
| **Taxonomia (`tema`, `foco`, `subfoco`)** | Prevalece a taxonomia mais profunda e específica (onde `foco` e `subfoco` estejam devidamente preenchidos e válidos na árvore taxonômica). |
| **`images`** | Unificação determinística: se `provaderesidencia` trouxer o arquivo de imagem bruto (`imagens_arquivo`) e o Supabase não possuir ou tiver link quebrado, a imagem é resgatada e convertida para WebP (Frente 2). |
| **Rastreabilidade (`audit_trail`)** | O registro consolidado armazena em metadados: `merged_from_ids: ["uuid-1", "pdr_51"]` e `source_tables: ["questions", "provaderesidencia_questoes"]`. |

---

## 🖥️ 9. Especificação da Interface Localhost de Verificação Manual (Quarentena)

Para os casos classificados como **Em Dúvida ou Inconclusivo**, a skill especifica a arquitetura da página de auditoria humana no localhost:

### 9.1. Estrutura da Página (`localhost:3000/admin/auditoria/deduplicacao`)
- **Visualizador Side-by-Side (Diff Comparativo):**
  - **Coluna Esquerda (Questão A):** Metadados, enunciado completo com marcação visual dos trechos idênticos (fundo neutro) e divergentes (fundo amarelo/vermelho), alternativas com a letra correta destacada, comentários e imagens.
  - **Coluna Direita (Questão B):** Mesma estrutura com espelhamento dos campos para comparação visual instantânea, indicando claramente a fonte (ex: *Badge "Supabase: questions"* vs. *Badge "Expansão: provaderesidencia_coleta_parte2"*).
- **Painel de Diagnóstico Algorítmico:**
  - Exibição dos índices parciais: $S_{enun}$, $S_{alt}$, $C_{gab}$, $S_{inst}$ e $Score_{total}$.
  - Alerta explícito da causa de dúvida (ex: *"Atenção: Enunciados 96% idênticos, mas Questão A tem Gabarito B ('Apendicite') e Questão B tem Gabarito C ('Diverticulite')"*).
- **Controles de Ação Rápida (1-Clique com Atalhos de Teclado):**
  1. `[M] Mesclar Canonicamente`: Abre seletor de qual questão deve ser a base principal de metadados.
  2. `[D] Manter como Distintas`: Marca o par como falso-positivo de duplicata, liberando ambas para o acervo final.
  3. `[E] Editar Gabarito / Metadados`: Permite ajuste fino imediato antes da homologação.
  4. `[P] Pular / Próximo`: Mantém na fila para revisão por outro especialista.

---

## 📋 10. Contrato de Execução e Modos de Operação

A skill opera em três fases sequenciais e bem delineadas:

1. **Modo Auditoria & Diagnóstico:**
   - Varredura de integridade em `data/supabase_tables/supabase_tables.db` englobando as tabelas do Supabase e as tabelas `provaderesidencia_*`.
   - Extração da volumetria exata de duplicatas indiscutíveis e casos de quarentena.
   - Geração de tabela temporária `audit_deduplication_pairs` com hashes, proveniências e escores.
2. **Modo Homologação em Quarentena:**
   - Disponibilização dos casos dúbios para a interface visual local.
   - Registro das decisões humanas em `data/supabase_tables/deduplication_decisions.json`.
3. **Modo Consolidação & Staging:**
   - Aplicação das fusões aprovadas em tabela de staging `questions_deduplicated`.
   - Garantia de imutabilidade dos dados brutos originais até a aprovação final do Chat Mestre.

---

## 🛡️ 11. Regras Inegociáveis de Segurança

- **Nenhuma exclusão direta no banco original:** O banco local `data/supabase_tables/supabase_tables.db` e os arquivos `.json` e `.db` originais nunca sofrem `DELETE` destrutivo sem backup prévio e staging.
- **Transparência Criptográfica:** Toda operação de fusão gera um log estruturado contendo os IDs de origem, o ID resultante e o hash do payload final.
- **Alinhamento com o Chat Mestre:** Os relatórios de consolidação desta skill são submetidos ao chat mestre `filter_correct` antes de qualquer sincronização definitiva com o Supabase.
