# Saneamento de imagens de Acesso Direto

**18 de novembro de 2026**

O primeiro lote recuperou **10 objetos WebP em 9 questões de Acesso Direto**. A rota pública da plataforma respondeu HTTP 200 com `Content-Type: image/webp` para cada objeto e entregou o mesmo SHA-256 registrado na publicação. Os arquivos foram publicados nos caminhos existentes do bucket `questoes`, sem sobrescrever objetos.

| Indicador | Antes do piloto | Após o piloto |
| --- | ---: | ---: |
| Questões de Acesso Direto com referência de imagem | 6.796 | 6.796 |
| URLs de imagem distintas, excluídas as citações | 6.914 | 6.914 |
| Objetos ausentes | 3.459 | 3.449 |
| Questões com pelo menos um objeto ausente | 3.254 | 3.245 |

A leitura integral das **3.465 imagens disponíveis** após o piloto confirmou a decodificação de todas em WebP. **2.848** delas ainda são servidas com `Content-Type: text/plain`. A análise limita esses números a Acesso Direto.

## Conferência e publicação

- O cruzamento local identificou arquivos para os **3.459 caminhos originalmente ausentes**. O inventário registra o caminho esperado, SHA-256, questão, figura ou letra, linhagem local e página candidata do caderno. A listagem de referências canônicas de Acesso Direto foi atualizada antes desse cruzamento.
- A busca textual em **335 PDFs locais** encontrou **473 questões com páginas candidatas**. O caderno AD1 da USP de 2026 acrescentou **43**, totalizando **516 candidatas**. Esses cruzamentos orientam a revisão visual. Na amostra, houve cópias locais com traçados encobertos, partes de outras questões e marca de terceiros. Essas cópias foram retidas. [Caderno AD1 da USP de 2026](https://www.fuvest.br/wp-content/uploads/rm2026-prova-AD1-areasbasicas-acessodireto.pdf)
- Foram publicados oito objetos de enunciado e dois de alternativas, todos arquivos locais conferidos com as páginas dos cadernos. Na questão `USPHCFMUSP-2025-PED-4180`, as alternativas C e D foram conferidas com o caderno A1 na página 38. O gabarito oficial da questão 104 coincide com o registrado no Supabase. A alteração nessa questão se limitou aos dois caminhos de imagem, agora absolutos, para que o componente em produção reconheça as figuras. A view pública retornou os dois vínculos atualizados. [Caderno A1 da USP de 2025](https://www.fuvest.br/wp-content/uploads/2024-12-01_rm2025_prova-areasbasicasedeacessodireto_grupo-a1.pdf) · [Gabarito oficial](https://www.fuvest.br/wp-content/uploads/2024-12-01_rm2025_gabarito-areasbasicasedeacessodireto.pdf)
- As cinco páginas da Wikimedia e o endereço do ECG Wave-Maven estavam no texto como citações de fonte. A URL do Wave-Maven tinha um erro de caminho. Corrigi apenas a URL na questão correspondente e confirmei que o GIF de origem responde. O inventário de mídia exclui as seis citações. [ECG Wave-Maven](https://ecg.bidmc.harvard.edu/maven/) · [Figura citada](https://ecg.bidmc.harvard.edu/mavendata/images/case9/1350x900.gif)

## Exibição e validação técnica

O componente local reconhece os caminhos `/storage/questoes/` nas alternativas e permite ampliá-las sem selecionar nem enviar a resposta. O teste com Playwright em desktop e celular cobriu carregamento da imagem, zoom, fechamento com Escape e preservação da resposta selecionada. A alteração do componente está na cópia local. O Chromium também decodificou as 12 URLs do piloto em produção, incluindo as duas URLs canônicas usadas nas alternativas. O teste de sessão autenticada de estudante em produção continua pendente.

`npm run lint` terminou com avisos e zero erros. `npm run build`, `npm test` e `npm run test:security` passaram.

## Evidências e pendências

Os arquivos de trabalho ficam no diretório local de auditoria. O inventário atualizado registra o resultado técnico de cada vínculo e mantém as pendências de curadoria. O registro de publicação contém a página, o número da questão, a posição da imagem e o SHA-256. O arquivo de reversão registra os dois caminhos antes e depois da atualização na questão com alternativas.

- [Inventário atualizado de Acesso Direto](../data/supabase_tables/auditoria_imagens_acesso_direto/inventario-piloto-atualizado.csv)
- [Registro de publicação](../data/supabase_tables/auditoria_imagens_acesso_direto/piloto-publicacao.json)
- [Decodificação remota e tipos de conteúdo](../data/supabase_tables/auditoria_imagens_acesso_direto/decodificacao-remota.json)
- [Verificação pública em Chromium](../data/supabase_tables/auditoria_imagens_acesso_direto/verificacao-piloto.json)

A conclusão de Acesso Direto ainda depende de recuperar e aprovar as imagens vinculadas aos **3.449 objetos ausentes**, corrigir os **2.848 tipos de conteúdo incorretos**, concluir a inspeção de marcas d’água e de correspondência com os cadernos, resolver as lacunas de figuras sinalizadas e validar a experiência em sessão de estudante. A operação ficou limitada a Acesso Direto.
