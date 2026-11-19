# Extração online de imagens de Acesso Direto

**18 de novembro de 2026**

O primeiro lote extraiu **39 arquivos WebP para 26 questões de Acesso Direto**, sendo **23 imagens do enunciado** e **16 de alternativas**. Cada recorte foi conferido com a figura na página do caderno. A verificação final reabriu os 39 arquivos com Sharp e confirmou, em leitura do Supabase, o ID, a referência existente e a posição de cada imagem. Os gabaritos oficiais das quatro questões com alternativas visuais coincidiram com os gabaritos cadastrados.

## Fontes e cobertura

Foram baixados dez cadernos de provas em páginas oficiais. O lote aproveitou cinco cadernos de três organizadoras. Os bancos online ajudaram a confirmar o enunciado e a edição, especialmente quando a mesma questão apareceu em outro caderno com numeração diferente. [FundMed](https://fundmed.org.br/residencias/) · [IAUPE](https://www.upenet.com.br/concursos/2026/26_RED_MED/provas-e-gab/PROVAS/GR%2001%20ACESSO.pdf) · [FUVEST](https://www.fuvest.br/residencia-medica-provas-e-gabarito/) · [MedEsper](https://www.medesper.com.br/questoes/residencia/hcpa-2021-questao-33) · [Qconcursos](https://www.qconcursos.com/questoes-de-concursos/questoes/09d5521c-97) · [Medway](https://site-medway.s3.sa-east-1.amazonaws.com/wp-content/uploads/sites/5/2026/01/11184225/SES-PE-R1-PE-2026-Objetiva.pdf)

| Caderno oficial | Questões com arquivos no lote | Arquivos WebP |
| --- | ---: | ---: |
| HCPA 2021 | 3 | 7 |
| HCPA 2022 | 2 | 2 |
| HCPA 2025 | 1 | 1 |
| SES-PE 2026 | 4 | 4 |
| USP 2026 AD1 | 16 | 25 |
| **Total** | **26** | **39** |

O cruzamento inicial encontrou 34 questões com figuras candidatas. Oito ficaram pendentes. Dois gabaritos divergiram da base em questões com alternativas visuais. Em outro caso, o caderno público informa expressamente que uma das figuras foi retirada. Os demais casos exigem confirmar limites que atravessam colunas ou páginas, ou recuperar a sequência completa de figuras. [Gabarito definitivo HCPA 2021](https://fundmed.org.br/website/wp-content/uploads/2024/04/2021-HCPA-Residencia-Medica-Acesso-Direto-GABARITO.pdf) · [Gabarito retificado USP 2026](https://www.fuvest.br/wp-content/uploads/rm2026-gabarito-AD-areasbasicas-acessodireto-retificado.pdf)

O caderno A1 da USP 2024 apresentava texto ilegível na extração direta. O OCR em português localizou página e coluna candidatas para **31 das 33 questões com caminhos de imagem pendentes** nessa edição. Essas localizações ainda precisam da conferência visual da figura e ficaram fora dos 39 arquivos extraídos. [Caderno A1 da USP 2024](https://www.fuvest.br/wp-content/uploads/rm_2024_a1.pdf)

## Validação do extrator

O extrator trabalha com um plano revisado. Ele verifica o SHA-256 do caderno, confere o número impresso e um trecho do enunciado na região selecionada, verifica os limites do recorte e exige evidência da letra e do gabarito oficial para alternativas visuais. Em seguida decodifica o WebP e compara os pixels com a renderização do recorte. A repetição do mesmo plano preserva arquivos com o mesmo conteúdo.

Sete testes automatizados passaram. O piloto com três recortes reais cobriu enunciados e uma alternativa. Na sequência, a mesma rotina executou o lote de 39, que inclui os três arquivos do piloto.

```powershell
python -m unittest discover -s tests -p test_extract_official_question_images.py -v
python scripts/extract_official_question_images.py data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/plano-lote-01.json data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-01
```

## Evidências

- [Plano de recortes revisado](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/plano-lote-01.json)
- [Manifesto de imagens, posições e SHA-256](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-01/manifesto.json)
- [Resultado da verificação](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-01/verificacao.json)
- [Questões pendentes no lote](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/pendencias-lote-01.json)
- [Páginas e colunas candidatas da USP 2024 via OCR](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/usp-2024-candidatos-ocr.json)

Os arquivos extraídos estão no acervo local. A operação usou leitura do Supabase e ficou limitada a Acesso Direto.

## Segundo lote e cobertura do acervo

O segundo lote extraiu **23 novos WebP de 23 questões**, com recortes revistos em 12 cadernos locais. Todos passaram na decodificação integral e na verificação do vínculo atual no Supabase. Os arquivos do segundo lote estão no acervo local. Dois candidatos desta rodada ficaram pendentes por atribuição da figura e por numeração ambígua em um caso compartilhado.

Das **6.796 questões com imagem** no inventário de Acesso Direto, **35** já tinham imagens publicadas nos lotes anteriores e **23** foram extraídas nesta rodada. Ainda restam **6.738** para extração ou aprovação, das quais **493** têm página candidata e **6.245** ainda precisam de uma fonte compatível localizada.

- [Manifesto do segundo lote](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-02/manifesto.json)
- [Verificação do segundo lote](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-02/verificacao.json)
- [Fila de Acesso Direto por questão](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-02-revisao/fila-acesso-direto.json)

## Terceiro lote e conferência dos gabaritos

O terceiro lote extraiu **7 figuras de 7 questões da USP 2024**. O extrator aceita evidência de OCR vinculada pelo SHA-256 à região renderizada do PDF. Os sete WebP foram decodificados e os sete gabaritos cadastrados coincidiram com o gabarito retificado da prova A1. Nenhum gabarito foi alterado. As oito verificações automatizadas passaram, incluindo a rejeição de evidência OCR de outra região. [Caderno A1 oficial](https://www.fuvest.br/wp-content/uploads/rm_2024_a1.pdf) · [Gabarito retificado](https://www.fuvest.br/wp-content/uploads/rm2024_gabarito_areas_basicas_acesso-direto_2023-12-18.pdf)

Após o terceiro lote, a fila tinha **6.731 questões pendentes de extração**, com **486** páginas candidatas e **6.245** ainda sem página localizada. Os lotes 02 e 03 estão no acervo local.

- [Manifesto do terceiro lote com gabaritos](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-03/manifesto.json)
- [Pendências do terceiro lote](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/pendencias-lote-03.json)

## Rodada das 486 questões com página candidata

A triagem percorreu as 486 questões. Das 240 com recortes candidatos, 23 avançaram até a publicação depois da conferência visual e da comparação com os gabaritos oficiais. As 246 restantes da triagem inicial incluem 112 páginas sem figura raster detectável, 110 sem recorte determinístico e 24 que precisam de OCR.

A cobertura acumulada chegou a **81 questões publicadas**. Entre as **6.708 pendentes de extração**, 463 têm página candidata já triada e 6.245 ainda precisam de página localizada. Sete extrações de rodadas anteriores seguem em análise antes da publicação.

Os 23 novos WebP foram decodificados e verificados por SHA-256 no bucket e na rota pública da plataforma. A renderização em sessão autenticada do estudante segue pendente. Dois candidatos da USP apresentaram divergência com o gabarito cadastrado e dois registros da SES-PE apontaram para um vínculo possivelmente duplicado. Esses casos permanecem na fila.

- [Lotes 04 e 05 da USP](IMAGENS_ACESSO_DIRETO_LOTES_04_05_SUPABASE.md)
- [Lote 06 da SES-PE](IMAGENS_ACESSO_DIRETO_LOTE_06_SUPABASE.md)
- [Triagem por questão](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/triagem-486/resultado.json)
- [Cobertura acumulada](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-02-revisao/cobertura-geral.json)
