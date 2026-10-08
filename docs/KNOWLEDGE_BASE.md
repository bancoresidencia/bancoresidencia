# 📚 Base de Conhecimento Médico (Medical Knowledge Base)

Este documento orienta os desenvolvedores sobre a arquitetura, organização e comandos para consumir e sincronizar a base médica de **341 Livros Estratégicos** (~15.111 blocos de conhecimento) estruturada a partir do Google Drive e armazenada no Supabase.

---

## 🏗️ Arquitetura

1. **Storage Central (Supabase):**
   - Bucket: `medical-knowledge` (privado / backend-only)
   - 341 arquivos JSON contendo metadados e blocos textuais (`chunks`) de ~350 palavras por tema.
   - Nomes de arquivos sanitizados compatíveis com chaves S3/Storage.

2. **Catálogo Oficial no Projeto:**
   - Local: [`src/data/medicalKnowledgeCatalog.json`](file:///c:/bancoresidencia/bancoresidencia/src/data/medicalKnowledgeCatalog.json)
   - Contém o mapeamento hierárquico das 21 especialidades, quantidade de livros, quantidade de blocos e o caminho de cada arquivo dentro do Supabase Storage.

3. **Consumo em Código (TypeScript):**
   - [`src/services/medicalKnowledgeService.ts`](file:///c:/bancoresidencia/bancoresidencia/src/services/medicalKnowledgeService.ts):
     - `medicalKnowledgeService.getCatalog()`: Obtém a listagem completa.
     - `medicalKnowledgeService.getSpecialties()`: Lista as 21 especialidades.
     - `medicalKnowledgeService.getBooksBySpecialty(spec)`: Lista livros de uma área.
     - `medicalKnowledgeService.fetchBookContent(storagePath)`: Baixa o conteúdo integral e blocos de um livro diretamente do bucket.

---

## 🛠️ Comandos para Desenvolvedores

### 1. Baixar a base de conhecimento para desenvolvimento local (Offline)
Para baixar todos os 341 livros do Supabase Storage para sua máquina local (`data/knowledge/`):
```bash
npm run pull:knowledge
```

Para baixar apenas uma especialidade específica:
```bash
node scripts/sync_knowledge_from_supabase.mjs Cardiologia
```

### 2. Verificar o status da extração
```bash
npm run extract:status
```

### 3. Sincronizar atualizações locais de volta para o Supabase
```bash
npm run upload:knowledge
```

---

## 🩺 Cobertura das 21 Especialidades (341 Livros / 15.111 Blocos)

- **Cardiologia:** 20 livros
- **Cirurgia:** 24 livros
- **Dermatologia:** 10 livros
- **Endocrinologia:** 22 livros
- **Gastroenterologia:** 13 livros
- **Ginecologia:** 28 livros
- **Hematologia:** 11 livros
- **Hepatologia:** 8 livros
- **Infectologia:** 19 livros
- **Medicina Preventiva:** 20 livros
- **Nefrologia:** 11 livros
- **Neurologia:** 12 livros
- **Obstetrícia:** 24 livros
- **Oftalmologia:** 9 livros
- **Ortopedia:** 18 livros
- **Otorrinolaringologia:** 7 livros
- **Pediatria:** 43 livros
- **Pneumologia:** 8 livros
- **Psiquiatria:** 12 livros
- **Radiologia:** 10 livros
- **Reumatologia:** 12 livros
