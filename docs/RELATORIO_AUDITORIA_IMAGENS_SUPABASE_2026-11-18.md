# Auditoria das imagens do banco de questões

**18 de novembro de 2026**

Esta é a linha de base anterior às publicações. Na revisão de Acesso Direto, seis URLs no texto foram confirmadas como citações de fonte e retiradas da contagem de imagens. Os totais de questões e de falhas de entrega permaneceram iguais.

O Supabase tem **7.196 questões com pelo menos uma referência de imagem** no enunciado ou nas alternativas. Em **3.801**, todas as referências entregaram bytes com assinatura WebP. Em **16**, pelo menos uma imagem entregue era de outro formato. Nas **3.379** restantes, pelo menos uma referência falhou, o que impediu confirmar o formato de todas as imagens da questão.

O principal achado foi a ausência de **3.568 objetos distintos** referenciados pela implantação pública. O acervo local contém um WebP com o nome esperado para cada um dos 3.568 caminhos. Todos esses arquivos passaram na decodificação local.

## Acesso e cobertura

A chave `service_role` configurada para o projeto atual permitiu ler as quatro tabelas canônicas e as views correspondentes, consultar a view unificada e listar o bucket público `questoes`. A paginação percorreu **257.090 registros**. As contagens exatas antes e depois da leitura coincidiram com o total percorrido. A chave pública retornou **246.257 registros** na view unificada, uma diferença de **10.833**. O bucket atual continha **230 objetos** na listagem recursiva com a chave de serviço.

O acesso foi suficiente para cobrir todo o acervo canônico pela API do projeto atual e para inventariar o bucket de questões. A verificação de permissões se limitou a essas operações de leitura. Os links públicos de outros projetos e provedores foram consultados sem credenciais. Entre as **6.600 questões com imagem** retornadas pelas views com a chave pública, **3.135** tinham pelo menos uma falha de entrega, e **3.037** tiveram falha em todas as referências.

## WebP por modalidade

| Modalidade | Registros lidos | Questões com referência | Todas as referências terminam em `.webp` | Todas entregaram WebP | Pelo menos uma imagem de outro formato confirmada | Formato inconclusivo por falha de entrega |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Acesso Direto | 206.578 | 6.796 | 6.796 | 3.542 | 0 | 3.254 |
| R+ | 45.413 | 123 | 123 | 0 | 0 | 123 |
| Revalida | 4.411 | 277 | 261 | 259 | 16 | 2 |
| Título de Especialista | 688 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **257.090** | **7.196** | **7.180** | **3.801** | **16** | **3.379** |

O sufixo sugere WebP em todas as imagens de **7.180 questões**. As outras **16** tiveram pelo menos um arquivo de outro formato confirmado pelos bytes. Foram verificadas **7.310 URLs de imagem distintas**, usadas em **7.891 pares únicos de questão e URL**. As respostas com assinatura de imagem corresponderam a **3.724 WebP, 11 JPEG e 7 PNG**.

## Entrega, exibição e curadoria

| Achado | Resultado |
| --- | --- |
| Objetos ausentes no Storage | **3.568 URLs** em `/storage/questoes/…` retornaram HTTP 400 com `NoSuchKey` e código interno 404 na implantação pública. O rewrite aponta para o bucket do projeto atual. Todas as **3.379 questões com falha de entrega** têm pelo menos um desses caminhos. Em **3.264**, nenhuma referência entregou imagem. |
| Arquivos locais correspondentes | **3.568 WebP decodificados com sucesso**. São 1.143 caminhos na raiz, 2.205 em `imagens_higienizadas_medq`, 219 em `imagens_banco_geral` e 1 em `imagens_resgatadas_gate6`. Há um candidato local para cada imagem que falhou nas **3.379 questões**. |
| Citações externas no texto | Cinco URLs da Wikimedia abrem páginas de atribuição. A URL de Harvard retornava HTTP 404 por erro no caminho da fonte. As oito questões que continham essas citações já tinham falhas independentes nas imagens do Storage. |
| Cabeçalho de tipo incorreto | **3.027 URLs** entregaram bytes WebP com `Content-Type: text/plain`. Elas aparecem em **3.231 questões**. A entrega de bytes foi confirmada. A exibição nessas condições requer teste no fluxo do estudante. |
| Alternativas visuais | **91 questões** têm referências de imagem nas alternativas, e **64** dependem exclusivamente delas para o conteúdo visual. Em **88 questões**, **360 alternativas** usam o prefixo relativo `/storage/questoes/`, que o componente de questões não reconhece como imagem. Publicar os arquivos nesses caminhos resolveria a entrega, mas ainda seria preciso validar a forma como as alternativas são exibidas. |
| Indícios de imagem ausente | **180 questões sem nenhuma referência** foram sinalizadas, com **18** por marcadores explícitos e **162** por expressões no enunciado, como “observe a figura”. Em outras **30 questões com referências**, uma etiqueta numerada excedeu a quantidade de referências do enunciado ou uma alternativa continha um marcador sem imagem própria. São sinais para conferência com a prova original. |
| Origem e marcas d’água | **3.471 questões** usam pelo menos uma URL de outro projeto Supabase. **97** usam imagens servidas pelo MedEvo. O histórico local associa **2.194 questões** a caminhos de arquivos tratados. Origem, nome do arquivo, histórico local e assinatura binária são dados de triagem. Marcas d’água, legibilidade e correspondência com a questão exigem revisão visual. |

## Escopo da verificação

O censo contou cada questão uma vez. A leitura abrangeu a coluna `images`, referências no texto do enunciado e imagens registradas no texto ou nos campos de imagem das alternativas. Entraram as quatro tabelas canônicas usadas pela plataforma. Tabelas legadas, mídia de comentários e resoluções ficaram fora do censo. O domínio `bancoresidencia.com.br` não resolveu no ambiente da auditoria. Os caminhos relativos foram testados na implantação pública `bancoresidencia-kappa.vercel.app`, configurada como origem de fallback no código.

A checagem remota usou requisições públicas de leitura e comparou status HTTP, tipo de conteúdo e assinatura nos primeiros bytes. Os arquivos locais correspondentes aos objetos ausentes foram decodificados com Sharp. Ficam pendentes a decodificação integral dos arquivos remotos, os testes de renderização com uma sessão de estudante e a conferência visual e clínica com os cadernos originais, incluindo a ordem e o gabarito das alternativas visuais.

## Pontos de partida para o futuro plano

1. Validar procedência e vínculo por questão, figura e alternativa nos 3.568 arquivos locais. A partir daí, planejar a publicação no bucket atual e confirmar cada referência pela mesma rota usada na plataforma.
2. Validar a renderização das alternativas, corrigir o tipo de conteúdo servido e conferir a citação indisponível. Conferir também os casos em que o enunciado ou a alternativa promete uma figura que não está vinculada.
3. Abrir cada imagem em tamanho legível e compará-la com o caderno oficial. Registrar a procedência, a ausência de marcas d’água de terceiros e a correspondência da figura com o enunciado ou com a letra da alternativa. Para as alternativas visuais, conferir o gabarito oficial antes da homologação.
4. Considerar a frente concluída quando todas as referências ativas entregarem um WebP decodificável com o tipo de conteúdo correto, as imagens aparecerem na posição esperada para o estudante e cada vínculo tiver aprovação visual registrada.

Nenhum registro, arquivo do Storage, enunciado, alternativa ou gabarito foi alterado durante a auditoria.
