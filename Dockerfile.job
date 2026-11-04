FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Instalação limpa de dependências
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Código dos scripts do motor e catálogo de referência médica
COPY scripts/ ./scripts/
COPY src/data/medicalKnowledgeCatalog.json ./src/data/medicalKnowledgeCatalog.json

# Variáveis padrão de execução
ENV NODE_ENV=production
ENV TARGET_SPECIALTY=cirurgia
ENV CONCURRENCY=6

CMD ["node", "scripts/cloud_batch_solve.mjs"]
