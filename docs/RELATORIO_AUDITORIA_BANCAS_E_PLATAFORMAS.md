# Relatório de Auditoria de Origem: Bancas e Instituições (Oficiais vs. Plataformas e Concursos)

> **Data de Execução:** 08/11/2026 18:49:27  
> **Status:** Concluído com Sucesso e Gravado no Banco  
> **Base Auditada:** `data/bancos_organizados_staging/residencia_acesso_direto.db` (65,173 questões)  
> **Campos de Controle Adicionados:** `tipo_origem` e `motivo_classificacao` (indexados)

---

## 1. Resumo Executivo da Distribuição de Origem

| Categoria de Origem | Significado Pedagógico | Total Questões | Percentual | Ação Recomendada |
| :--- | :--- | :---: | :---: | :--- |
| **`OFICIAL_RESIDENCIA`** | Provas de programas de Residência Médica credenciados pela CNRM/MEC (Universidades, SUS/SES estaduais, Hospitais de Ensino). | **63,162** | **96.91%** | **Manter no acervo principal (Padrão-Ouro)** |
| **`BANCA_ORGANIZADORA_RESIDENCIA`** | Provas oficiais de residência médica organizadas por bancas de grande porte (FGV, AOCP), onde a instituição foi gravada com o nome da banca examinadora. | **1,369** | **2.10%** | **Manter no acervo de residência** |
| **`CONCURSO_PUBLICO_GERAL`** | Certames municipais, secretarias de administração e órgãos públicos de provimento de cargos estatutários/CLT (médicos de prefeitura, peritos, cargos municipais). | **548** | **0.84%** | **Segregar/Opcional (não é Residência MEC)** |
| **`ORIGEM_INDEFINIDA`** | Questões cujas referências de banca/instituição contêm URLs internas residuais do scraper (`source://...`). | **50** | **0.08%** | **Revisar / Higienizar** |
| **`AUTORAL_PLATAFORMA`** | Questões criadas por plataformas comerciais, inteligência artificial ou mentorias privadas para treinamento. | **44** | **0.07%** | **Segregar em banco de simulados** |
| **TOTAL** | — | **65,173** | **100,00%** | — |

---

## 2. Detalhamento por Categoria

### 2.1. `OFICIAL_RESIDENCIA` (63,162 questões — 96.91%)
Representa **96,93%** do banco remanescente. São provas genuínas aplicadas para acesso a vagas de R1 em programas credenciados:
- **Top 10 Instituições:**
  - **Faculdade de Medicina de São José do Rio Preto:** 2,332 questões
  - **Sistema Único de Saúde - Pernambuco:** 769 questões
  - **Pontifícia Universidade Católica do Paraná:** 709 questões
  - **Secretaria de Estado da Saúde de Santa Catarina:** 701 questões
  - **Hospital de Clínicas de Porto Alegre:** 669 questões
  - **Fundação João Goulart:** 661 questões
  - **Universidade Federal de Santa Catarina:** 646 questões
  - **Associação Médica do Paraná:** 615 questões
  - **Universidade Federal do Maranhão:** 608 questões
  - **Universidade de São Paulo - Ribeirão Preto:** 605 questões

### 2.2. `BANCA_ORGANIZADORA_RESIDENCIA` (1,369 questões — 2.10%)
Provas de residência médica cujos concursos foram elaborados por bancas examinadoras e cujos metadados registraram a banca no campo instituição:
  - **FGV - Fundação Getúlio Vargas:** 1,273 questões
  - **AOCP:** 94 questões
  - **Fgv:** 2 questões

### 2.3. `CONCURSO_PUBLICO_GERAL` (548 questões — 0.84%)
Questões extraídas de concursos para prefeituras municipais e cargos estatutários (incluindo questões de legislação do servidor e português de concurso municipal):
  - **PMG - Prefeitura Municipal de Guarulhos:** 92 questões
  - **IMAIS - Instituto Mais:** 76 questões
  - **Secretaria Municipal de Administração de Volta Redonda:** 50 questões
  - **Prefeitura Municipal de Foz do Iguaçu:** 44 questões
  - **SEMAD -Secretaria Municipal de Saúde de Anápolis:** 35 questões
  - **Prefeitura Municipal de Cascavel:** 32 questões
  - **SMA-VR:** 28 questões
  - **Prefeitura Municipal de Foz do Iguaçú:** 26 questões
  - **Faculdade de Medicina de São José do Rio Preto:** 22 questões
  - **SecretariaMunicipalDeAdministracaoDeMacae-SEMAD:** 15 questões
  - **Secretaria Municipal de Administração de Volta Redonda - SMA VR - Rio de Janeiro:** 14 questões
  - **Prefeitura Municipal de Cascaval - PMC - Paraná:** 13 questões
  - **Prefeitura Municipal de Franca:** 12 questões
  - **Secretaria Municipal de Administração de Macaé - SEMAD - Rio de Janeiro:** 11 questões
  - **Secretaria Municipal de Administração de Macaé:** 10 questões

### 2.4. `AUTORAL_PLATAFORMA` (44 questões — 0.07%)
Questões produzidas por plataformas preparatórias e mentorias privadas:
  - **Brave-ia:** 31 questões
  - **MentoriaProMax:** 12 questões
  - **BRAVE IA:** 1 questões

### 2.5. `ORIGEM_INDEFINIDA` (50 questões — 0.08%)
Fragmentos residuais do scraper com IDs de fonte interna:
  - **Sp:** 13 questões
  - **Go:** 7 questões
  - **Pa:** 6 questões
  - **Se:** 5 questões
  - **Pr:** 5 questões
  - **Rn:** 3 questões
  - **UEPA:** 3 questões
  - **Rj:** 2 questões
  - **Cmc:** 2 questões
  - **Al:** 1 questões

---

## 3. Amostra de Validação de Questões em Cada Categoria

### A. Exemplo de `AUTORAL_PLATAFORMA`
- **ID `153949`** (BRAVE IA | 2026): *Sr. Carlos, 82 anos, idoso frágil, é acompanhado na UBS de sua região por uma equipe multiprofissional devido a múltipla...*
- **ID `153950`** (Brave-ia | 2026): *Um menino de 8 anos é trazido à Unidade de Pronto Atendimento com queixa de dor no quadril direito e recusa de deambulaç...*

### B. Exemplo de `CONCURSO_PUBLICO_GERAL`
- **ID `15476`** (Prefeitura Municipal de Foz do Iguaçu | 2019): *Uma menina de 10 anos apresenta febre há 10 dias associada a artrite nos joelhos e nos tornozelos, nódulos subcutâneos n...*
- **ID `15477`** (Prefeitura Municipal de Franca | 2019): *Segundo as diretrizes brasileiras, o exame de citologia oncótica (Papanicolau) deve ser disponibilizado às mulheres:...*
- **ID `16232`** (Prefeitura Municipal de Foz do Iguaçú | 2020): *Sobre a pancreatite aguda, marque a alternativa INCORRETA:...*

### C. Exemplo de `BANCA_ORGANIZADORA_RESIDENCIA`
- **ID `52474`** (AOCP | 2019): *Paciente masculino, 54 anos, é hipertenso de longa data e tabagista há 30 anos. Fuma em média 20 cigarros por dia e acen...*
- **ID `52475`** (AOCP | 2019): *Sobre a vaginose bacteriana, assinale a alternativa INCORRETA....*

### D. Exemplo de `OFICIAL_RESIDENCIA`
- **ID `1`** (Associação Médica do Rio Grande do Sul | 2009): *Homem, 27 anos, vem à consulta médica, referindo alucinações auditivas há um ano e dificuldade em realizar suas atividad...*
- **ID `2`** (Associação Médica do Rio Grande do Sul | 2009): *Podem ser causas secundárias de hiperglicemia devido à insensibilidade tecidual à insulina - todas as abaixo, EXCETO:
...*

---

## 4. Conclusão e Próximos Passos
1. **O acervo remanescente é esmagadoramente genuíno de Residência Médica:** Somando `OFICIAL_RESIDENCIA` (63.162) e `BANCA_ORGANIZADORA_RESIDENCIA` (1.369), temos **64.531 questões legítimas de Residência Médica (99,01%)**.
2. **Identificação Cirúrgica dos Intrusos:** Conseguimos isolar com precisão os **642 registros** de concursos gerais de prefeituras (548), scraper URLs (50) e questões autorais de plataformas/mentorias (44).
3. **Decisão do Usuário:** Como as colunas `tipo_origem` e `motivo_classificacao` já estão fisicamente persistidas e indexadas em `residencia_acesso_direto.db`, você pode optar por:
   - **Opção 1:** Purgar esses 642 registros para deixar apenas as **64.531 questões puras de Residência Médica**.
   - **Opção 2:** Mover esses 642 registros para uma tabela dedicada (`staging_concursos_gerais_e_simulados`) para uso futuro em simulados ou bancos de concursos.
