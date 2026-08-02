# Sistema de Gestão para Academia de Kung Fu

## Objetivo

Desenvolver um sistema web para gerenciamento de uma academia de Kung Fu, permitindo controlar alunos, matrículas, turmas, pagamentos e frequência, além de disponibilizar um portal para o aluno acompanhar suas informações.

---

# Tecnologias

## Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Docker
- Docker Compose

## Frontend

- React
- TypeScript

---

# Perfis de Usuário

## Administrador

O administrador poderá:

- Gerenciar alunos
- Aprovar matrículas
- Ativar ou bloquear acesso de alunos
- Criar turmas
- Editar turmas
- Excluir turmas
- Adicionar alunos às turmas
- Registrar presença
- Gerenciar mensalidades
- Confirmar pagamentos
- Visualizar dashboard financeiro
- Alterar graduação (faixa)
- Enviar e-mails aos alunos

---

## Aluno

O aluno poderá:

- Criar conta
- Completar cadastro
- Acompanhar situação da matrícula
- Visualizar suas turmas
- Consultar pagamentos
- Consultar histórico financeiro
- Visualizar presença
- Atualizar alguns dados pessoais
- Alterar senha

---

# Fluxo do Cadastro

## 1. Cadastro

O aluno cria uma conta informando:

- Nome
- E-mail
- Senha

O sistema cria um usuário com:

Status:

- Pending

Permissão:

- Student

---

## 2. Completar Cadastro

Após o primeiro login, o aluno deverá preencher:

- CPF
- Telefone
- Data de nascimento
- Endereço
- Contato de emergência
- Observações médicas

---

## 3. Matrícula

O administrador aprova a matrícula após confirmação do pagamento.

Quando aprovada:

- Conta é ativada
- Matrícula passa para ativa
- Aluno pode utilizar todas as funcionalidades

---

# Banco de Dados

## Users

Responsável por autenticação.

Campos:

- Nome
- Email
- Senha
- Perfil
- Status

---

## Student Profiles

Informações específicas do aluno.

Campos:

- CPF
- Telefone
- Endereço
- Data de nascimento
- Contato de emergência
- Restrições médicas
- Faixa

---

## Enrollments

Representa a matrícula.

Responsável por:

- Número da matrícula
- Status
- Data de início
- Data de encerramento

---

## Classes

Representa uma turma.

Campos:

- Nome
- Descrição
- Horário
- Professor responsável

---

## Student Classes

Tabela de relacionamento.

Permite que um aluno participe de diversas turmas.

---

## Attendance

Controle de frequência.

Campos:

- Aluno
- Turma
- Data
- Presença

Não permitir duplicidade para o mesmo aluno na mesma turma e mesma data.

---

## Payments

Controle financeiro.

Campos:

- Valor
- Competência
- Vencimento
- Data do pagamento
- Método
- Situação
- Observações

---

# Autenticação

Utilizar:

- JWT
- Password Hash (bcrypt)

Permissões:

Administrador

Aluno

---

# Dashboard

## Administrador

Indicadores:

- Total de alunos
- Alunos ativos
- Alunos pendentes
- Turmas
- Receita do mês
- Receita anual
- Mensalidades vencidas
- Mensalidades pendentes
- Próximos vencimentos
- Frequência dos alunos

---

## Aluno

Indicadores:

- Próximo pagamento
- Situação da matrícula
- Turmas matriculadas
- Frequência
- Faixa atual

---

# Pagamentos

Status possíveis:

- Pending
- Paid
- Overdue
- Cancelled

Métodos:

- PIX
- Dinheiro
- Cartão de Crédito
- Cartão de Débito

---

# Frequência

O administrador poderá:

- Marcar presença
- Marcar falta
- Consultar histórico

O aluno poderá:

- Visualizar frequência

---

# Turmas

O administrador poderá:

- Criar
- Editar
- Excluir
- Adicionar alunos
- Remover alunos

---

# Estrutura Backend

Cada módulo deverá possuir:

```text
module
│
├── controllers
├── services
├── repositories
├── dto
├── entities
└── module.ts
```

---

# Estrutura Geral

```text
src
│
├── auth
├── users
├── students
├── enrollments
├── classes
├── attendance
├── payments
│
├── common
│   ├── decorators
│   ├── guards
│   ├── pipes
│   ├── filters
│   ├── interceptors
│   ├── enums
│   └── utils
│
├── config
│
├── database
│   └── prisma
│
├── app.module.ts
└── main.ts
```

---

# Arquitetura

Utilizar arquitetura em camadas.

```
Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

---

# Padrões

- SOLID
- Clean Code
- Repository Pattern
- Dependency Injection
- DTO Pattern
- Validation Pipe Global
- Exception Filters
- Guards
- Prisma ORM

---

# Validação

Utilizar:

- class-validator
- class-transformer

Nunca validar dados diretamente no Controller.

---

# Variáveis de Ambiente

Utilizar:

- DATABASE_URL
- JWT_SECRET
- PORT

---

# Docker

O projeto deverá possuir:

- Dockerfile Backend
- Docker Compose
- PostgreSQL
- Ambiente de desenvolvimento

---

# Funcionalidades Futuras

## Histórico de Faixas

Registrar:

- Data
- Faixa anterior
- Nova faixa
- Observações

---

## Exames

Cadastro de exames de graduação.

---

## Documentos

Permitir armazenar:

- Contrato
- Atestado Médico
- Outros documentos

---

## Auditoria

Registrar alterações importantes realizadas pelos administradores.

---

# E-mails

Inicialmente será utilizado um EmailService.

Não haverá tabela de notificações neste momento.

Eventos que deverão enviar e-mail:

- Cadastro realizado
- Matrícula aprovada
- Matrícula recusada
- Recuperação de senha
- Pagamento confirmado
- Lembrete de vencimento

A implementação deverá ser desacoplada para permitir futuramente a criação de um sistema de filas e histórico de notificações sem necessidade de alterar as regras de negócio.

---

# Objetivo Final

Construir um sistema completo de gestão para academias de artes marciais utilizando boas práticas de arquitetura, código limpo e escalabilidade, servindo como projeto de portfólio e podendo evoluir futuramente para um sistema comercial.