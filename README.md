# AgendaPro — SaaS de Gestão de Agendamentos

Sistema administrativo interno para gestão de agendamentos, clientes, serviços e horários.

## Stack

- Next.js 14 (App Router) · React · JavaScript
- PostgreSQL · Prisma ORM
- JWT (cookies httpOnly) · Framer Motion

## Instalação

```bash
npm install
cp .env.example .env
# Configure DATABASE_URL e JWT_SECRET

npx prisma migrate dev
npm run db:seed
npm run dev
```

## Acesso

- URL: http://localhost:3000
- Login: `admin@clinica.com.br` / `Admin@2024!`

## Módulos

| Rota | Função |
|------|--------|
| `/dashboard` | Estatísticas, gráficos, consultas do dia |
| `/agenda` | Visualização dia/semana/mês |
| `/agendamentos` | CRUD completo |
| `/clientes` | CRUD clientes |
| `/servicos` | CRUD serviços |
| `/horarios` | Dias, intervalos, feriados, limite diário |
| `/configuracoes` | Dados da empresa |
| `/perfil` | Perfil e senha |
| `/recuperar-senha` | Reset de senha |

## Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run db:migrate   # Migrations
npm run db:seed      # Dados iniciais
npm run db:studio    # Prisma Studio
```

## Migração do projeto anterior

A migration `saas_restructure` recria o schema. Em banco existente:

```bash
npx prisma migrate reset
npm run db:seed
```
