# Kung Fu Manager API

API REST do **Kung Fu Manager** — sistema de gestão de uma escola de Kung Fu (Wushu): alunos, matrículas, turmas, frequência, mensalidades, notificações e aprovação de cadastros.

## Stack

- **NestJS 11** (TypeScript)
- **Prisma 6** + **PostgreSQL**
- **JWT** (access token + refresh token) com `passport-jwt`
- **bcrypt**, **nodemailer** (e-mails transacionais) e **pdfkit** (relatórios em PDF)

## Requisitos

- Node.js 22+
- PostgreSQL (banco `wushu`)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o `.env` a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

3. Aplique as migrações e gere o Prisma Client:

   ```bash
   npx prisma migrate dev
   ```

4. Inicie o servidor em modo de desenvolvimento:

   ```bash
   npm run start:dev
   ```

A API sobe em `http://localhost:3000` por padrão.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não | Porta do servidor (padrão `3000`) |
| `DATABASE_URL` | Sim | URL de conexão do PostgreSQL |
| `JWT_SECRET` | Sim | Segredo do access token |
| `JWT_REFRESH_SECRET` | Não | Segredo do refresh token (fallback: `JWT_SECRET`) |
| `DOMAIN_WEB` | Sim (prod) | URL pública do frontend (usada nos links de e-mail) |
| `FRONTEND_URL` | Não | Alternativa a `DOMAIN_WEB` |
| `APP_URL` | Não | URL da própria API (fallback dos links de e-mail) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Não | Credenciais SMTP (sem `SMTP_HOST`, os links são logados no console) |
| `MAIL_FROM` | Não | Remetente dos e-mails |
| `DEFAULT_MONTHLY_FEE` | Não | Valor padrão das mensalidades |
| `PAYMENT_DUE_DAY` | Não | Dia de vencimento padrão das mensalidades (padrão `10`) |

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run build` | Compila o projeto (`dist/`) |
| `npm run start:dev` | Inicia em modo watch |
| `npm run start:prod` | Inicia a versão compilada |
| `npm run test` | Roda os testes unitários |
| `npm run test:e2e` | Roda os testes e2e |
| `npm run lint` | Roda o ESLint |

> Em produção, após `npm run build`, o entrypoint é `node dist/src/main.js` (o `prisma.config.ts` na raiz desloca o `rootDir`).

## Banco de dados (Prisma)

```bash
npx prisma migrate dev --name <nome>   # cria/aplica migração e regenera o client
npx prisma studio                       # abre o Prisma Studio
npx prisma format && npx prisma validate
```

## Estrutura

```
src/
├── auth/          # login, cadastro, refresh token, confirmação de e-mail, reset de senha
├── users/         # usuários e aprovação de cadastros
├── students/      # perfis de aluno, responsáveis, histórico de faixas, registros médicos
├── enrollments/   # matrículas
├── classes/       # turmas e alunos por turma
├── attendance/    # frequência
├── payments/      # mensalidades e scheduler de cobrança
├── notifications/ # notificações internas
├── admin/         # dashboard e relatórios (CSV/PDF)
├── public/        # endpoints públicos (landing)
├── mail/          # envio de e-mails transacionais
├── common/        # guards, enums, filters, decorators, utils
└── config/        # origens permitidas (CORS / guarda de origem)
```

## Autenticação

- **Access token** (15 min) + **refresh token** (7 dias) com rotação via `POST /auth/refresh`.
- Endpoints públicos: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/reset-password/validate`, `GET /auth/confirm-email`, `POST /auth/resend-confirmation`.
- O cadastro (`POST /auth/register`) é restrito ao frontend oficial via `Origin`/`Referer` (`FrontendOriginGuard`).

## Licença

Projeto privado (UNLICENSED).

