# Banco Residência 🩺

Plataforma moderna, responsiva e de alta performance de **Banco de Questões para Residência Médica**, com métricas em tempo real, painel de estatísticas com gráficos e filtros clínicos avançados.

---

## 🚀 Tecnologias

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualização de Dados & Gráficos**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)

---

## ✨ Funcionalidades Principais

- **Filtros Avançados**:
  - Filtro por **Grande Área / Especialidade** (Clínica Médica, Cirurgia Geral, Pediatria, Ginecologia e Obstetrícia, Preventiva e Social).
  - Filtro por **Banca / Instituição** (ENARE, USP-SP, UNIFESP, UNICAMP, UERJ, etc.).
  - Filtro por **Ano da Prova** e **Nível de Dificuldade**.
  - **Busca textual em tempo real** por tema, sintomas, diagnósticos e enunciados.
- **Resolução Interativa**:
  - Feedback imediato de acerto/erro.
  - Gabarito comentado pelo professor com explicação fisiopatológica e de conduta.
- **Painel de Desempenho & Gráficos**:
  - Cartões de KPI: taxa de acerto global, questões resolvidas, dias de sequência de estudo e tempo acumulado.
  - **Gráfico de Barras**: evolução do volume de questões e taxa de acerto por dia.
  - **Gráfico de Rosca/Pizza**: distribuição proporcional do estudo pelas grandes áreas médicas.
- **Design Totalmente Responsivo & Leve**:
  - Interface escura de alta legibilidade para longas sessões de estudo.
  - Otimizado para mobile, tablets e desktops.

---

## 🛠️ Como Executar Localmente

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

3. **Compilar para produção**:
   ```bash
   npm run build
   npm run start
   ```
