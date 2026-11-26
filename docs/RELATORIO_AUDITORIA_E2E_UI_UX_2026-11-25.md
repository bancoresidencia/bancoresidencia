# Relatório Técnico de Auditoria Integral — Banco Residência / Hippocampus

**Data da Auditoria:** 25/11/2026  
**Ambiente inspecionado:** `https://hippocampusresidencia.com.br` (sessão autenticada de estudante plano `FREE` + rotas públicas e checkout via Chrome DevTools & Playwright)  
**Cobertura:** Etapas 0 a 15 (Dashboard, Cronograma, Agenda, Banco de Questões, Caderno de Erros, Flashcards, Resumos Clínicos, Listas & Pastas, Provas na Íntegra, Simulados Oficiais, Meu Desempenho, Ranking Oficial, Perfil & Ajustes, Guarda Admin, Checkout & Páginas Públicas).  
**Observação de Escopo (Admin):** Como a sessão utilizada pertencia a uma conta estudante (`FREE`), foi validado o bloqueio RBAC de `/admin` (redirecionamento para `/?error=unauthorized_admin`), sem acesso às telas internas de curadoria administrativa.

---

## 1. Sumário Executivo por Severidade

| Severidade | Quantidade | Principais Focos |
| :--- | :---: | :--- |
| **P0 — Crítico** | 6 | Erro `500` em `/api/student/ink`; Erro `403` RLS em `user_flashcard_decks`; Erro `404` de tabela inexistente `public.user_study_schedules`; Caneta Médica bloqueando cliques em alternativas; Mapeamento errado de instituições/bancas famosas; Paywall redirecionando abruptamente da sessão de estudo |
| **P1 — Alto** | 9 | Loop excessivo de `POST /api/student/timer-state` e duplicação de requests; Abas `"Em Breve"` renderizando/buscando dados completos ocultos; Incoerência clínica em `"Dica do Dia"`; Botão `"Gráfico de Evolução"` inoperante no Ranking; Conflito de modais em `/listas`; Contagens divergentes em `/flashcards`; Textos de dev/teste (`botões de simulação`) e erros de plural (`indicaçãoões`) em produção |
| **P2 — Médio** | 10 | Desvios de True Neutral Dark (`slate-*` azulado em `/login`, `/checkout`, `/configuracoes`, `/listas`, `/simulados`, `/resumos`); Cores `blue-*` hardcoded ignorando temas (Rosa/Neutro/Esmeralda); Modais fora do primitivo `Dialog` e `window.confirm()` nativo; Eixo Y decimal (`0.25`) em gráficos de questões; Números de questões desatualizados (`133k+` vs `+200 Mil`) |
| **P3 — Baixo / Ergonomia & A11y** | 6 | Botões abaixo da altura ergonômica (`16x16px` a `32px`); Campo de busca colapsado no header mobile (`390px`); Inputs sem `id`/`name`/`label` gerando alertas no console; Ausência de `tabular-nums` em KPIs; `sm:rounded-3xl` e `p-8` fora do padrão; Títulos `<title>` inconsistentes entre rotas |

---

## 2. Achados Críticos (P0)

### `[P0-01]` API da Caneta Médica retornando HTTP 500 em toda questão
* **Aba / Rota:** `/questoes` (Modo Resolução)
* **Evidência:** Console exibe `Failed to load resource: the server responded with a status of 500 ()` (4x). Requisições `GET` e `POST /api/student/ink` enviam `document_id` serializado como array JSON (`document_id=["<userId>","question:<uuid>"]`).
* **Impacto:** O recurso de anotações/desenhos na questão falha silenciosamente no carregamento e no salvamento, gerando erro 500 contínuo no servidor a cada questão aberta ou interação.
* **Como Resolver:** Corrigir o cliente da Caneta Médica para enviar apenas a string `question:<uuid>` em `document_id` (em vez de passar uma tupla/array para o query param) e validar o tipo no handler de `/api/student/ink` retornando `400` amigável se inválido.

### `[P0-02]` Erro 403 RLS no Supabase ao carregar Flashcards (ID de baralho compartilhado)
* **Aba / Rota:** `/flashcards` e `/resumos`
* **Evidência:** `POST .../rest/v1/user_flashcard_decks?on_conflict=id` retorna **HTTP 403** (`code: "42501"`, `"new row violates row-level security policy (USING expression) for table \"user_flashcard_decks\""`). O payload envia `"id": "deck-padrao"` fixo com `prefer: resolution=merge-duplicates`.
* **Impacto:** Como `"deck-padrao"` é chave primária fixa compartilhada entre contas, qualquer usuário após o primeiro que tentar criar/sincronizar o baralho padrão tenta sobrescrever a linha de outro usuário, disparando `403` em toda abertura de `/flashcards`.
* **Como Resolver:** Gerar o ID do baralho padrão com escopo por usuário (`deck-padrao-${userId}` ou UUID único vinculado ao `user_id`) ou alterar a chave primária/conflito para `(user_id, slug)` / `id` único por usuário.

### `[P0-03]` Tabela `public.user_study_schedules` ausente em produção (HTTP 404 + Falso Positivo "Sincronizado")
* **Aba / Rota:** `/cronograma`
* **Evidência:** `GET .../rest/v1/user_study_schedules?...` retorna **HTTP 404** e warning `[studyScheduleService] Erro ao buscar cronograma: Could not find the table 'public.user_study_schedules' in the schema cache`. Ainda assim, o cabeçalho exibe o badge verde **`Sincronizado`**.
* **Impacto:** O aluno acredita que seu cronograma está salvo na nuvem (`Sincronizado`), mas a tabela não existe no Supabase de produção — causando perda de dados ao trocar de dispositivo ou limpar o cache.
* **Como Resolver:** Aplicar a migração de criação da tabela `public.user_study_schedules` (com políticas RLS adequadas) no Supabase de produção e vincular o badge `"Sincronizado"` ao estado real de sucesso da última operação remota (exibindo `"Erro de sincronização"` / `"Modo offline"` em caso de falha).

### `[P0-04]` Caneta Médica ativa por padrão no modo "Caneta" bloqueia seleção de alternativas
* **Aba / Rota:** `/questoes` (Modo Resolução)
* **Evidência:** Ao clicar `"Iniciar (50)"`, a barra flutuante da Caneta Médica inicia com a ferramenta **`Caneta`** selecionada (sobrepondo a borda direita do card: `penBarOverlapsCard: true`). Clicar na alternativa **E** desenhou um traço no canvas (`Desfazer traço` foi habilitado) e o botão **`Resolver`** permaneceu desabilitado até o clique manual em **`Navegar`**.
* **Impacto:** Usuário no desktop com mouse ou notebook tenta marcar a alternativa e não consegue responder à questão — apenas rabisca a tela sem entender o motivo.
* **Como Resolver:** Inicializar a Caneta Médica sempre no modo **`Navegar`** por padrão (ativando o canvas de desenho apenas quando o aluno selecionar explicitamente Caneta/Marca-texto ou usar stylus/S-Pen via `pointerType === 'pen'`) e dar margem lateral ao container da questão para que a barra flutuante nunca sobreponha o card.

### `[P0-05]` Mapeamento corrompido de Instituições, Bancas e UFs
* **Aba / Rota:** `/cronograma` (`Gerador Inteligente de Cronograma`) e `/questoes` (`Catálogo de Instituições e Bancas por Estado (UF)`)
* **Evidência:**
  * `ENARE` exibido como `ENARE — AFAMCI`
  * `UNICAMP` exibido como `Hospital Angelina Caron`
  * `UFPR` exibido como `Fundação Escola de Saúde de Teresópolis`
  * `PSU-MG` exibido como `Hospital Universitário Sul Fluminense`
  * `UERJ` exibido como `Fundação João Goulart`
  * `UNIFESP` exibido como `Centro Médico de Campinas`
  * `IPSEMG` exibido como `Hospital Santa Isabel`
  * Na filtragem por UF: `UEL` (`Londrina/PR`) e `FJG` (`Rio de Janeiro/RJ`) aparecem sob `SP`; `CERMAM` (`AM`) aparece sob `Nacional`.
* **Impacto:** Destrói a confiança acadêmica na plataforma ao tentar montar cronograma por prova-alvo ou filtrar questões por estado/instituição.
* **Como Resolver:** Auditar e corrigir o dicionário canônico / tabela de instituições (`sigla -> nome_oficial, uf`) e verificar a query de agregação que associa siglas às descrições no banco (provável `JOIN` ou agrupamento pegando o primeiro nome arbitrário encontrado nas questões).

### `[P0-06]` Redirecionamento abrupto para `/checkout` durante sessão de estudo ativa
* **Aba / Rota:** `/questoes` (Modo Resolução — conta `FREE`)
* **Evidência:** Ao clicar no botão **`Ver Justificativa`** em uma alternativa após resolver a questão, a página redireciona imediatamente para `/checkout` sem aviso, modal ou confirmação.
* **Impacto:** O estudante perde imediatamente sua bateria de 50 questões e o estado de resolução em andamento por um clique exploratório em um botão visível como habilitado.
* **Como Resolver:** Substituir o redirecionamento direto por um modal de *paywall* elegante (`Dialog`) ou expandir um preview truncado inline com CTA `"Desbloquear Justificativas PRO"` abrindo `/checkout` em nova aba ou com preservação de sessão.

---

## 3. Achados de Alta Severidade (P1) — Funcionalidade, Rede, Dados & Copy

### `[P1-01]` Loop excessivo de `POST /api/student/timer-state` e requisições duplicadas
* **Aba / Rota:** Global (todas as rotas autenticadas de `(platform)`)
* **Evidência:** `POST /api/student/timer-state` dispara repetidamente em cada navegação/interação mesmo com o cronômetro parado em `00:00:00`. Também ocorrem chamadas duplicadas idênticas para `GET /api/tab-availability`, `GET /profiles`, `GET /user_study_sessions` e `POST /api/questions` (3x ao carregar `/questoes`, 2x ao clicar `"Iniciar"`).
* **Impacto:** Sobrecarga desnecessária de Serverless Functions (Vercel), consumo de cota do Supabase e latência percebida.
* **Como Resolver:** Condicionar o sync de `timer-state` apenas a transições reais de estado (Start/Pause/Reset ou `status === 'running'`), deduplicar fetches com SWR/React Query ou cache de contexto no layout, e usar `AbortController`/guard contra disparo duplo de `useEffect` em `/questoes`.

### `[P1-02]` Abas bloqueadas como `"Em Breve"` renderizam e consultam dados em background
* **Aba / Rota:** `/resumos`, `/provas`, `/simulados`
* **Evidência:** Embora o overlay `"Em Breve"` bloqueie a tela, o componente completo por trás monta no DOM e dispara requests pesados: `/resumos` busca `study_materials` e `user_flashcard_decks` (disparando 2x erro `403`!) além de renderizar 95 temas ocultos; `/provas` carrega 27+ imagens `.webp` de instituições (gerando 27 avisos de lazy-loading no console); `/simulados` renderiza cards com contadores (`4.120`, `2.850`, etc.).
* **Impacto:** Desperdício de banda, erros 403 fantasmas em abas inativas e exposição do conteúdo não finalizado no DOM/leitor de tela.
* **Como Resolver:** Checar `isTabActive(tabKey)` no nível de Server Component ou antes de montar o componente filho (early return renderizando exclusivamente o componente `<ComingSoon />`).

### `[P1-03]` Inconsistência entre Sidebar (`"Em breve"`) e CTAs ativos no Dashboard
* **Aba / Rota:** `/dashboard` e Sidebar
* **Evidência:** A Sidebar exibe badge `"Em breve"` em *Resumos Clínicos*, *Provas na Íntegra* e *Simulados Oficiais*, mas o Dashboard promove os botões **`Materiais de Apoio`**, **`Iniciar Prova` (`ENARE 2025`)** e **`Iniciar Simulado` (`Simulado Nacional ENARE 2025`)**.
* **Impacto:** Frustração de expectativa: o estudante clica no botão em destaque no Dashboard e cai em uma tela `"Em Breve"`.
* **Como Resolver:** Conectar a visibilidade/estado desses blocos no Dashboard ao mesmo `TabAvailabilityContext` usado na Sidebar (ocultando ou desabilitando os CTAs com o selo `"Em breve"` quando a aba estiver inativa).

### `[P1-04]` Incoerência clínica e template genérico na `"Dica do Dia"`
* **Aba / Rota:** `/dashboard`
* **Evidência:** No primeiro acesso, o card `"HIV na Gestação e Profilaxia da Transmissão Vertical"` exibiu no rodapé `"⚠️ Pegadinha"` sobre **monitorização de sulfato de magnésio e gluconato de cálcio** (tópico de pré-eclâmpsia/eclâmpsia). Na segunda visita, o card `"Controle de Sintomas Não-Dor"` exibiu uma frase genérica de fallback (`"preste atenção ao diagnóstico diferencial entre Controle de Sintomas Não-Dor e condições correlatas..."`).
* **Impacto:** Risco pedagógico direto: estudante pode associar conduta de eclâmpsia a HIV na gestação; texto genérico passa impressão de conteúdo automatizado sem curadoria.
* **Como Resolver:** Garantir chaveamento estrito por `topicId` entre os pontos A–D e a `pegadinha` correspondente e filtrar temas que só possuem texto fallback genérico para não serem sorteados na `"Dica do Dia"`.

### `[P1-05]` Rótulo duplicado e omissão de grande área no Cronograma
* **Aba / Rota:** `/cronograma` (Card `Conteúdos Foco Estudados`)
* **Evidência:** A lista de progresso por área exibe: `Clínica: 0 | Cirurgia: 0 | Cirurgia: 0 | Pediatria: 0` (`"Cirurgia"` repetido duas vezes; Ginecologia, Obstetrícia e Preventiva ausentes).
* **Impacto:** Impossibilidade de acompanhar corretamente o progresso das grandes áreas no painel superior.
* **Como Resolver:** Corrigir o array/mapa de áreas exibidas no resumo superior do Cronograma para iterar sobre as chaves canônicas únicas (`Clínica`, `Cirurgia`, `Ginecologia`, `Obstetrícia`, `Pediatria`, `Preventiva`).

### `[P1-06]` Botão `"Gráfico de Evolução"` inoperante e nome genérico no Ranking
* **Aba / Rota:** `/ranking`
* **Evidência:** O clique em `"Gráfico de Evolução"` não abre modal, gráfico ou feedback visual. O card do usuário logado (`j0a`) exibe `"DR — Dr(a). Candidato(a)"` em vez do nome real, e existem dois botões `"Atualizar"` duplicados na mesma dobra.
* **Impacto:** Botão morto passa sensação de funcionalidade quebrada; nome genérico reduz senso de pertencimento.
* **Como Resolver:** Implementar o drawer/modal do gráfico de evolução (ou exibir estado desabilitado com tooltip `"Disponível após 10 questões"` caso não haja histórico), usar `profile.name` no card do usuário e remover o botão `"Atualizar"` redundante.

### `[P1-07]` Conflito de formulários simultâneos e modal recursivo em `/listas`
* **Aba / Rota:** `/listas`
* **Evidência:** Clicar `"Nova Pasta"` abre o formulário inline de pasta; clicar `"Criar Nova Lista"` em seguida abre o formulário de lista **simultaneamente** abaixo sem fechar o anterior. Além disso, o modal `"Criar Lista de Questões com Filtros Clínicos"` embute o componente inteiro de filtros incluindo o próprio botão `"Minhas Listas"`, com contagens travadas em `"…"`. No `/questoes`, o botão `"Minhas Listas"` também abre o modal `"Criar Lista de Questões Personalizada"` em vez de listar cadernos existentes.
* **Impacto:** Confusão visual com dois formulários abertos, ação incorreta no botão `"Minhas Listas"` e contagens não carregadas (`"…"`).
* **Como Resolver:** Controlar o estado de criação em `/listas` via estado exclusivo (`activePanel: 'folder' | 'list' | null`), passar prop `embeddedMode` ao componente de filtros para ocultar botões de navegação (`Minhas Listas`, `Filtro IA`, `Raio-X`) e corrigir o handler do botão `"Minhas Listas"` em `/questoes` para abrir a gaveta/modal de seleção de listas salvas.

### `[P1-08]` Contagens divergentes e redundantes em `/flashcards`
* **Aba / Rota:** `/flashcards`
* **Evidência:** O cabeçalho mostra `191 cards | Novo: 191 | Aprender: 0 | Revisar: 191` (embora todas as linhas na tabela mostrem `0` na coluna `REVISAR`, e a soma das linhas da tabela seja `5+5+4+123+91+3 = 231` vs `191` no topo). Além disso, a Caneta Médica dentro da sessão de flashcards usa tooltip `"Limpar todos os desenhos desta questão"`.
* **Impacto:** Inconsistência matemática imediata para o aluno ao planejar revisões diárias.
* **Como Resolver:** Unificar o cálculo de `due/review` no topo com a soma real da coluna `REVISAR`, deduplicar cards contados simultaneamente em Ginecologia e Obstetrícia no totalizador e parametrizar o rótulo da Caneta Médica (`"deste flashcard"` vs `"desta questão"`).

### `[P1-09]` Texto de desenvolvimento vazado e erro de plural em produção (`Embaixador`)
* **Aba / Rota:** `/configuracoes` (Aba `Embaixador 15% PIX`)
* **Evidência:**
  * Texto visível em produção: *"...ou utilize os botões de simulação acima para testar as regras de 7 dias e o desbloqueio do saque ao atingir 3!"* (botões de simulação inexistentes).
  * Concatenação quebrada de plural: `"3 indicaçãoões"`, `"10 indicaçãoões"`, `"0 indicaçãoões"`.
* **Impacto:** Perda grave de credibilidade comercial em uma aba financeira (comissão PIX), transmitindo aparência de produto inacabado.
* **Como Resolver:** Remover a menção aos botões de simulação do texto de instrução e corrigir a função de pluralização para `count === 1 ? 'indicação' : 'indicações'`.

---

## 4. Achados de Design & Padronização (P2)

### `[P2-01]` Quebra do Modo Escuro Neutro (`True Neutral Dark` — vazamento de `slate-*` azulado)
* **Abas / Rotas:** `/login`, `/checkout`, `/configuracoes`, `/listas`, `/provas`, `/simulados`, `/resumos` (card Em Breve), `/desempenho`
* **Evidência:** Uso de `bg-slate-900`, `dark:bg-slate-800`, `border-slate-800` e gradientes azulados em fundos e inputs (especialmente visível em `/configuracoes`, onde `Faculdade`, `Ano` e `Telefone` ficam azulados ao lado de `Nome` e `E-mail` neutros, e em `/login` e `/checkout`).
* **Impacto:** Viola a diretriz `med-student-ux` (zero tom azulado no dark mode), gera contraste irregular entre campos do mesmo formulário e aumenta fadiga visual.
* **Como Resolver:** Substituir globalmente `slate-*`/`gray-*` por tokens neutros Zinc/CSS vars (`bg-[var(--card,#121215)]`, `bg-[var(--muted,#18181b)]`, `border-[var(--card-border,#27272a)]`).

### `[P2-02]` Cores `blue-*` hardcoded ignorando a personalização de tema do estudante
* **Abas / Rotas:** `/agenda`, `/cronograma`, `/flashcards`, `/questoes` (comentário e badges), `/desempenho`, `/checkout`, `/login`, `/resumos`
* **Evidência:** Botões e destaques como `"Todos (0)"`, `"Dia"`, `"Mentor IA"`, ícones `+` do calendário, barra `bg-blue-500 w-[78%]` em `/desempenho`, card de comentário do professor e `"Ver Justificativa"` em `/questoes`, `"nitratos e diuréticos"` em `/flashcards`, e `"Plano Anual"` no `/checkout` permanecem azuis mesmo quando o aluno seleciona Rosa, Verde ou Monocromático.
* **Impacto:** Experiência visual quebrada ao personalizar o tema; componentes não consomem `Button` (`variant="primary" | "subtle"`) nem `var(--primary-color)`.
* **Como Resolver:** Migrar CTAs e destaques para os primitivos de `src/components/ui/` (`Button`, `Badge`, `ProgressBar`) e substituir classes `blue-*` de destaque de marca por `var(--primary-color)` / `var(--accent-subtle)`.

### `[P2-03]` Redundância de CTAs idênticos na mesma tela
* **Abas / Rotas:** `/agenda` e `/ranking`
* **Evidência:** Em `/agenda`, três botões azuis realizam exatamente a mesma ação (`+` no cabeçalho, `+` na barra de filtros, `+ Adicionar Bloco ou Tarefa` no centro). Em `/ranking`, dois botões `"Atualizar"` aparecem simultaneamente no topo direito e no card de perfil.
* **Impacto:** Poluição visual e violação da Lei de Hick-Hyman (múltiplos CTAs concorrendo pela atenção).
* **Como Resolver:** Manter apenas um botão `+ Novo Bloco` no cabeçalho superior da Agenda (e o botão central apenas no *empty state*) e unificar o botão `"Atualizar"` no cabeçalho do Ranking.

### `[P2-04]` Modais implementados fora do primitivo `Dialog` e uso de `window.confirm()` nativo
* **Abas / Rotas:** `/agenda`, `/cronograma`, `/questoes`
* **Evidência:** Os modais `"Atrasei no Plantão"`, `"Criar Tarefa"`, `"Mentor IA"`, `"Gerador Inteligente de Cronograma"`, `"Filtro IA"` e `"Raio-X da Banca"` usam `<div>` manuais sem `role="dialog"`/`aria-modal` e com botões `X` sem `aria-label`. O botão `"Limpar todos os desenhos desta questão"` dispara `window.confirm()` nativo do navegador.
* **Impacto:** Inconsistência visual (especialmente no dark mode), ausência de *focus trap* / fechamento padronizado por `ESC` e quebra de imersão com alerta nativo do OS.
* **Como Resolver:** Migrar todos os modais e confirmações para o componente canônico `Dialog` (`src/components/ui/Dialog.tsx`).

### `[P2-05]` Microcopy, números e domínios inconsistentes entre telas
* **Abas / Rotas:** `/checkout`, `/configuracoes`, `/agenda`, `/desempenho`, `/ranking`, `/questoes`
* **Evidência:**
  * `/checkout` e `/configuracoes` anunciam **`+133.000` / `133k+` questões**, enquanto título e Hero anunciam **`+200 Mil`** e o Acesso Direto já soma **`189.102`**.
  * `/desempenho` (aba *Tempo de Estudo*) cita **`"5 especialidades"`** enquanto *Especialidades* e *Banco de Questões* trabalham com **`6`**.
  * `/agenda` instrui `"clique em + Novo Bloco"`, mas nenhum botão tem esse rótulo.
  * `/ranking` usa `<title>` antigo (`"Banco Residência — Questões & Residência Médica"`) diferente das demais abas (`"Hippocampus | ..."`).
  * `/configuracoes` e `/dashboard` iniciam contas novas com data alvo padrão no passado (`01/11/2026`), exibindo **`0 dias p/ ENARE / ENAMED`** no Hero.
  * `/questoes` exibe `"HSL/Sírio • 2027"`, expõe `"GEMINI 3.5"` no título do Filtro IA, categoriza questão de esteatose/FIB-4 sob `"Consenso Baveno VII e Betabloqueio"`, e exibe `"Filtros (0):"` mesmo com o switch `"Comentadas"` ligado.
  * `/caderno-de-erros` exibe `0% SUPERADOS` ao lado de `Acerto geral: 100%` quando não há histórico.
* **Como Resolver:** Centralizar contadores de marketing e nomes de marca em constantes compartilhadas, revisar textos de orientação e atualizar a data-alvo default de novos cadastros para o ciclo futuro (2027) ou exibir `"Definir data"` quando vazia/passada.

### `[P2-06]` Gráficos e Cards com anomalias visuais
* **Abas / Rotas:** `/desempenho`, `/dashboard`, `/listas`
* **Evidência:**
  * Gráfico `"Evolução"` em `/desempenho` exibe eixo Y fracionário (`0`, `0.25`, `0.5`, `0.75`, `1`) para número inteiro de questões; card `"VOLUME PROJETADO"` exibe barra hardcoded `w-[78%]`; card `"APROVEITAMENTO"` mostra `100.0%` com pill `↘ 0.0%`.
  * `/dashboard`: blur decorativo no Hero `<section>` gera `scrollWidth` interno maior que `clientWidth` (`1278 > 1214`); no mobile `Total: 0 Q` tem baseline desalinhado; botão `"Materiais de Apoio"` some no mobile (`390px`).
  * `/listas`: com `0 listas`, exibe apenas texto solto `"0 listas encontradas"` no vazio, sem card de *empty state*.
* **Impacto:** Gráficos e indicadores passam leitura confusa ou aparência de mockup estático.
* **Como Resolver:** Configurar `allowDecimals={false}` no `YAxis` do Recharts, calcular dinamicamente ou remover a barra fixa `w-[78%]`, corrigir o delta de tendência para `—` quando sem período comparativo anterior, e criar um *empty state* guiado em `/listas`.

### `[P2-07]` Cards com `sm:rounded-3xl` e `p-8` fora da geometria canônica
* **Abas / Rotas:** `/questoes`, `/dashboard`, `/agenda`, `/caderno-de-erros`, `/flashcards`, `/configuracoes`
* **Evidência:** Containers principais usam `lg:p-8`, empty states usam `p-8` e os cards do `/questoes` usam `sm:rounded-3xl`, contrariando o padrão `p-4`/`p-5` e `rounded-2xl` definido em `med-student-ux`.
* **Como Resolver:** Padronizar containers para `p-4 sm:p-5 lg:p-6` e cards para `rounded-2xl`.

---

## 5. Achados de Ergonomia, Mobile, Tipografia & Acessibilidade (P3)

### `[P3-01]` Botões abaixo do alvo mínimo ergonômico (`16x16px` a `32px`)
* **Abas / Rotas:** Todas as abas autenticadas (especialmente `/questoes`, `/flashcards`, `/cronograma`, `/dashboard`, `/agenda`)
* **Evidência:** Controles frequentes medem muito abaixo de `38px` (desktop) / `44px` (mobile): `"Pausar contagem"` e `"Ocultar relógio"` no player de questão (`16x16px`), botões `+` do calendário (`22x22px`), `"Editar flashcard"` (`22x22px`), `"Revelar todas as respostas"` (`30x22px`), menu hambúrguer mobile em `390px` (`28x28px`), além de dezenas de pills e abas entre `24px` e `32px`.
* **Impacto:** Dificuldade de clique preciso (especialmente em tablets/celulares durante horas de estudo).
* **Como Resolver:** Adotar o primitivo `Button` (`size="sm"` = `32px` mínimo apenas em toolbars densas com área clicável expandida via pseudo-elemento/padding; `size="md"` = `38px` padrão; e `min-h-[44px] min-w-[44px]` no mobile).

### `[P3-02]` Header mobile (`390x844`) com campo de busca esmagado e truncamentos
* **Abas / Rotas:** Header Global (`/dashboard` e layout `(platform)`)
* **Evidência:** Em `390px`, o input `"Buscar questões, temas ou bancas"` é espremido para ~24px visíveis (mostrando apenas o ícone da lupa dentro de uma pílula minúscula) e o texto `"p/ ENARE / ENAMED"` corta para `"p/ ENARE / ENA..."`. Na barra de bancas em `/questoes` (desktop), `+ UNIFESP` é cortado pela metade (`+ UNI`).
* **Impacto:** Campo de busca inutilizável no celular e sensação de corte abrupto na barra de bancas.
* **Como Resolver:** No mobile (`< sm`), substituir o input espremido por um botão de ícone de busca (`40x40px`) que expande uma barra/modal de pesquisa, e adicionar `fade` lateral + `overflow-x-auto` explícito (ou wrap) na lista de pills de bancas.

### `[P3-03]` Campos de formulário sem `id`/`name`/`label` e botões sem `aria-label`
* **Abas / Rotas:** `/dashboard`, `/cronograma`, `/agenda`, `/questoes`, `/caderno-de-erros`, `/flashcards`, `/desempenho`, `/ranking`, `/configuracoes`, `/checkout`, `/login`
* **Evidência:** Console do Chrome DevTools registra continuamente `[issue] A form field element should have an id or name attribute` e `No label associated with a form field` em quase todas as rotas; switches (`Ocultar anuladas`, `Ocultar revisadas`), checkboxes da árvore em `/questoes` (12 botões vazios) e botões `X` de modais não possuem `aria-label`.
* **Impacto:** Prejudica leitores de tela, autocompletar do navegador e navegação por teclado.
* **Como Resolver:** Associar `id`, `name` e `<label htmlFor>` (ou `aria-label` nos inputs de busca e switches) em todos os formulários e adicionar `aria-label="Fechar"` nos botões `X`.

### `[P3-04]` Falta de `tabular-nums` em contadores e marca d'água quebrando palavras no leitor
* **Abas / Rotas:** `/dashboard`, `/cronograma`, `/desempenho`, `/questoes`
* **Evidência:** Números grandes de KPI (`0.0`, `100`, `0%`, `100%`) usam `font-variant-numeric: normal`. No comentário oficial em `/questoes`, a inserção de caracteres invisíveis (zero-width) no meio da palavra (`"Pa...ciente"`) fragmenta a tokenização para leitores de tela/TTS.
* **Como Resolver:** Aplicar `tabular-nums` em todos os contadores, cronômetros e percentuais; caso mantenha proteção anti-scraping no texto, aplicá-la preferencialmente entre palavras ou via camada CSS/container sem quebrar palavras individuais no meio para acessibilidade.

---

## 6. Próximos Passos Recomendados (Ordem de Ataque)

1. **Hotfix Imediato (P0 — Banco & Produção):**
   * Corrigir payload `document_id` em `/api/student/ink` (elimina erros `500`).
   * Corrigir ID do baralho padrão em `user_flashcard_decks` para incluir `userId` (elimina erros `403` RLS).
   * Subir a migração de `public.user_study_schedules` no Supabase (elimina `404` no Cronograma).
   * Iniciar Caneta Médica no modo **`Navegar`** por padrão.
2. **Saneamento de Dados & UX Crítica (P0/P1):**
   * Corrigir dicionário de Instituições/UFs e rótulo duplicado `Cirurgia` no Cronograma.
   * Trocar redirect abrupto de `Ver Justificativa` para modal de paywall preservando a sessão.
   * Cortar o loop de `POST /api/student/timer-state` e bloquear execução oculta nas abas `"Em Breve"`.
   * Limpar texto de dev na aba Embaixador (`indicaçãoões` e menção a botões de simulação).
3. **Alinhamento ao Design System (P2/P3):**
   * Erradicar `slate-*` no dark mode e `blue-*` hardcoded, consolidando tudo sobre `src/components/ui/` + variáveis do `ThemeContext`, `Dialog` canônico e metas ergonômicas de altura/mobile.
