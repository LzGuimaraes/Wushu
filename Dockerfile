# ---- Estágio de build ----
FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# URL fictícia apenas para permitir o `prisma generate` durante o build.
# A URL real é injetada via variável de ambiente no `docker run`.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/wushu"
RUN npx prisma generate

RUN npm run build

# ---- Estágio de produção ----
FROM node:22-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# openssl é necessário para o Prisma (engines) e para o bcrypt
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Aplica as migrations pendentes e sobe a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
