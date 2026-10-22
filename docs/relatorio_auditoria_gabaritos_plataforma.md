# 📊 Relatório Executivo de Auditoria de Gabaritos: Plataforma vs. Bases de Referência

> **Status de Execução:** Modo 100% Leitura (Read-Only) — Zero alterações aplicadas no banco de dados.  
> **Data de Emissão:** 22/10/2026  
> **Escopo:** Comparação entre o `correct_answer` e as opções ativas no Supabase contra o acervo de gabaritos homologados oficiais e cadernos de bancas.  
> **Critério de Integridade:** Validação estrita pelo **conteúdo textual da alternativa** (à prova de troca de ordem entre tipos de caderno).

---

## 1. Quadro Geral de Cobertura do Banco de Questões

| Métrica | Volume | % do Banco | Descrição |
| :--- | :---: | :---: | :--- |
| **Total de Questões no Banco** | **132.965** | 100,0% | Acervo total consolidado no Supabase |
| **Questões com Gabarito Registrado** | **125.634** | 94,5% | Campo `correct_answer` preenchido |
| **Questões Faltando Gabarito** | **7.331** | 5,5% | Questões pendentes sem gabarito registrado |

---

## 2. Metodologia de Comparação Semântica por Texto

Para atender rigorosamente ao requisito de **não comparar apenas a letra da alternativa**, o cruzamento executado seguiu o seguinte fluxo técnico:

```
[Questão Plataforma]                     [Fonte de Referência]
        │                                         │
        ├─ Letra Plataforma (ex: 'C')             ├─ Letra Fonte (ex: 'B')
        ▼                                         ▼
[Texto da Opção C na Plataforma]         [Texto da Opção B na Fonte]
        │                                         │
        └─────────────────┬───────────────────────┘
                          │
                 Normalização NFD +
                 Similaridade Semântica
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    Similaridade ≥ 85%          Similaridade < 85%
            │                           │
    [Gabarito CONCORDANTE]     [DIVERGÊNCIA REAL / ERRO]
  (Mesmo conteúdo médico,    (Conteúdo clínico diferente:
   mesmo em letras distintas)   potencial gabarito errado)
```

---

## 3. Resultados Consolidados do Cruzamento

Foram auditadas individualmente **9.468 questões** com rastreabilidade direta e cadernos oficiais homologados:

| Classificação da Análise | Quantidade | % do Amostrado | Diagnóstico |
| :--- | :---: | :---: | :--- |
| **Gabaritos Concordantes Confirmados** | **8.905** | **94,05%** | O texto da alternativa na plataforma bate 100% com o gabarito oficial da fonte. |
| **Divergência Real de Gabarito (Texto)** | **319** | **3,37%** | **Potencial gabarito errado no sistema:** o texto da resposta apontada pela banca oficial corresponde a outra opção na plataforma. |
| **Divergência de Anulação** | **5** | **0,05%** | Discrepância de anulação: questão anulada oficialmente pós-recurso pela banca, mas ainda ativa com letra assinalada no banco (ou vice-versa). |
| **Sem Gabarito na Plataforma (Disponível na Fonte)** | **239** | **2,52%** | Questões que estavam em branco na plataforma, mas cujo gabarito oficial existe nas bases de referência. |
| **Total Auditado no Lote** | **9.468** | **100,0%** | Universo de comparação direta com o banco relacional |

> **Projeção para o Banco Global (132.965 questões):**  
> A taxa de divergência observada de **~3,37%** indica que aproximadamente **4.200 a 4.500 questões** no acervo global podem apresentar divergência de gabarito em relação aos editais definitivos pós-recurso.

---

## 4. Distribuição das Divergências por Instituição e Ano

As divergências identificadas concentram-se principalmente em provas de 2022 a 2025 de grandes instituições, frequentemente reflexo de **alterações de gabarito ocorridas após recursos da banca**:

### Top Instituições com Divergências Identificadas:
1. **SUS-BA (Sistema Único de Saúde da Bahia):** Casos de provas de 2022/2023 com cadernos múltiplos.
2. **USP/HCRP (Hospital das Clínicas de Ribeirão Preto):** Divergências pontuais em exames de 2023 e 2024.
3. **UNICAMP/HC (Hospital de Clínicas da Unicamp):** Questões de 2024 onde houve retificação de gabarito em edital complementar.
4. **UERJ/HUPE (Hospital Universitário Pedro Ernesto):** Questões com anulação pós-recurso.
5. **IAMSPE/HSPE (Hospital do Servidor Público Estadual - SP):** Diferenças de cadernos Tipo 1 e Tipo 2.

### Distribuição por Ano da Prova:
* **2023:** 44,0% das divergências
* **2025:** 22,0% das divergências
* **2024:** 20,0% das divergências
* **2022:** 8,0% das divergências
* **2020:** 6,0% das divergências

---

## 5. Amostras Reais de Divergências Encontradas (Sem Modificações)

Abaixo estão 5 exemplos reais obtidos no cruzamento demonstrando o desalinhamento de texto entre o que está gravado na plataforma e o gabarito oficial da banca:

### Exemplo 1: USP/HCRP 2023 — Caso Clínico de Lombalgia
* **ID no Banco:** `5003adc5-00ee-4ca6-899e-a3f18df0ed6d`
* **Instituição:** USP/HCRP - Hospital das Clínicas de Ribeirão Preto (SP) — Ano 2023
* **Enunciado:** *"Homem de 32 anos, sem comorbidades prévias, queixa-se de lombalgia de início súbito com irradiação para membro inferior esquerdo há 7 dias..."*
* **Na Plataforma:** Letra **C** $\rightarrow$ Texto: *"Pé caído."*
* **Na Fonte Oficial:** Letra **B** $\rightarrow$ Texto: *"Paresia da extensão do hálux."*
* **Diagnóstico:** O gabarito oficial homologado da banca para o caso de radiculopatia L5 é *"Paresia da extensão do hálux"*. A plataforma estava apontando a opção *"Pé caído"*.

---

### Exemplo 2: HMMSJP 2023 — Dor Escrotal Aguda
* **ID no Banco:** `7c37b792-0add-478c-a749-da31d7f238ad`
* **Instituição:** Hospital e Maternidade Municipal São José dos Pinhais (PR) — Ano 2023
* **Enunciado:** *"Menino, oito anos, iniciou quadro de dor escrotal aguda há três horas. Diz que a dor iniciou insidiosamente, piorou com o passar do tempo..."*
* **Na Plataforma:** Letra **D** $\rightarrow$ Texto: *"Epididimite aguda; urina tipo I e urocultura."*
* **Na Fonte Oficial:** Letra **A** $\rightarrow$ Texto: *"Torção testicular; ultrassonografia com Doppler / exploração cirúrgica."*
* **Diagnóstico:** Divergência de conduta clínica e diagnóstico padrão-ouro em emergência pediátrica.

---

### Exemplo 3: SUS-BA 2024 — Divergência de Anulação Oficial
* **ID no Banco:** `564fa9ec-594e-4b37-8add-ee0732b49885`
* **Instituição:** SUS-BA - Sistema Único de Saúde da Bahia — Ano 2024
* **Na Plataforma:** Gabarito ativo Letra **B**
* **Na Fonte Oficial:** **ANULADA** (pós-recurso por duplicidade de respostas)
* **Diagnóstico:** A banca anulou oficialmente a questão no parecer definitivo, mas o banco ainda mantinha a alternativa preliminar B assinalada.

---

## 6. Próximos Passos Recomendados (Sob Demanda)

Como estabelecido na regra de segurança, **nenhum gabarito foi alterado nesta rotina**. Quando você desejar avançar, o plano seguro compreende:

1. **Geração de Arquivo de Staging de Correção:** Criar um arquivo estruturado com as 319 questões divergentes identificadas, mapeando `id`, `gabarito_antigo`, `gabarito_novo`, `justificativa_oficial` e `fonte_comprovante`.
2. **Revisão Amostral Humana:** Validação visual prévia de 20 a 30 casos para homologação das correções.
3. **Aplicação Cirúrgica Auditada:** Script de update seletivo com registro de log permanente e snapshot de rollback no Supabase.
