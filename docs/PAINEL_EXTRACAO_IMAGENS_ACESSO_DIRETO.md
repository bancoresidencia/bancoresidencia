# Painel de Extração e Vinculação de Imagens (Acesso Direto)

**Data de atualização:** 19 de novembro de 2026 (Pausa Operacional / Checkpoint Consolidado)

---

## 1. Resumo Executivo das Rodadas de Extração Oficial

- **Scripts utilizados:** `scripts/extract_official_question_images.py` preservado 100% íntegro, sem qualquer alteração no código fonte.
- **Lote Teste 100:** 100 imagens extraídas e 100/100 vinculadas ao Supabase.
- **Lote 135:** 135 imagens extraídas e 135/135 vinculadas ao Supabase.
- **Lote 14:** 14 imagens extraídas e 14/14 vinculadas ao Supabase.
- **Lote 14-B:** 14 imagens extraídas e 14/14 vinculadas ao Supabase.
- **Total extraído e vinculado nesta sessão:** **263 questões com imagens oficiais de alta fidelidade**.
- **Total acumulado no projeto:** **319 questões de Acesso Direto com imagens 100% oficiais**.
- **Acervo de 3.568 imagens higienizadas:** **Retidas conforme instrução (zero uploads efetuados)**.
- **Próximo lote engatilhado para retomada:** **Lote 41** (41 questões validadas com sucesso em cadernos oficiais de ENARE, UERJ, SUS-BA, SES-DF, SES-PE, AMRIGS, UNESP, USP e Santa Casa, com plano `plano-lote-41.json` pronto).

---

## 2. Indicadores e Evidências das Rodadas Concluídas

| Lote | Questões | Status no Supabase Storage | Status no Banco (`questions`) | Artefatos e Galerias |
| :---: | :---: | :---: | :---: | :--- |
| **Lote 100** | 100 | 100% Enviado (`acesso-direto/...`) | 100% Vinculado na coluna `images` | • [Manifesto](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-teste-100/manifesto.json)<br>• [Publicação Supabase](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-teste-100/publicacao-supabase.json)<br>• [Galeria HTML](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-teste-100/galeria_revisao.html) |
| **Lote 135** | 135 | 100% Enviado (`acesso-direto/...`) | 100% Vinculado na coluna `images` | • [Manifesto](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-135/manifesto.json)<br>• [Publicação Supabase](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-135/publicacao-supabase.json)<br>• [Galeria HTML](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-135/galeria_revisao.html) |
| **Lote 14** | 14 | 100% Enviado (`acesso-direto/...`) | 100% Vinculado na coluna `images` | • [Manifesto](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14/manifesto.json)<br>• [Publicação Supabase](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14/publicacao-supabase.json)<br>• [Galeria HTML](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14/galeria_revisao.html) |
| **Lote 14-B** | 14 | 100% Enviado (`acesso-direto/...`) | 100% Vinculado na coluna `images` | • [Manifesto](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14-b/manifesto.json)<br>• [Publicação Supabase](../data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14-b/publicacao-supabase.json)<br>• [Galeria HTML](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14-b/galeria_revisao.html) |
| **Lotes Anteriores (01 a 06)** | 56 | 100% Enviado | 100% Vinculado | Lotes históricos homologados. |
| **Lote 41 (Engatilhado)** | 41 | Validação matemática 100% aprovada | Plano gerado em `plano-lote-41.json` | Pronto para extração e sincronização na retomada. |

---

## 3. Estado Atual do Acervo

1. **Questões com Imagens Oficiais Publicadas no Supabase:** **319 questões** (358 arquivos WebP únicos de alta fidelidade).
2. **Questões Mapeadas e Verificadas para Próxima Extração:** **41 questões** do Lote 41.
3. **Acervo Higienizado Local:** **3.568 imagens** mantidas sob quarentena e retenção estrita em disco local, sem qualquer submissão de rede.
4. **Cadernos Oficiais Locais Disponíveis:** 236 cadernos de provas em `data/official_exams/` indexados para expansão contínua.

---

## 4. Como Acompanhar

- **Hub Visual Local Ativo:** [http://localhost:3336](http://localhost:3336) (Dashboard de imagens rodando na porta 3336).
- **Galeria Visual Lote 14-B:** [galeria_revisao.html (Lote 14-B)](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14-b/galeria_revisao.html)
- **Galeria Visual Lote 14:** [galeria_revisao.html (Lote 14)](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-14/galeria_revisao.html)
- **Galeria Visual Lote 135:** [galeria_revisao.html (Lote 135)](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-135/galeria_revisao.html)
- **Galeria Visual Lote 100:** [galeria_revisao.html (Lote 100)](file:///d:/bancoresidencia/data/supabase_tables/auditoria_imagens_acesso_direto/extracao_online/lote-teste-100/galeria_revisao.html)
