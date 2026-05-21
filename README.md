# Dr. João Marcos — Landing Page + Sistema de Agendamento

Plataforma premium para clínica odontológica com landing page de alto padrão e sistema completo de agendamento online integrado.

## Stack

- **Frontend:** Next.js 14 (App Router), React, Framer Motion, CSS Modules
- **Backend:** Next.js API Routes
- **Banco:** PostgreSQL + Prisma ORM
- **Auth:** JWT (httpOnly cookies)

## Estrutura

```
app/
  agendar/          → Fluxo de agendamento público
  admin/            → Painel administrativo
  api/              → APIs REST
components/         → Componentes reutilizáveis
context/            → Toast, providers
lib/                → Prisma, auth, validações, slots
prisma/             → Schema, migrations, seed
services/           → Clientes API
styles/             → Estilos compartilhados (booking, admin)
middleware.js       → Proteção de rotas admin
```

## Instalação

### 1. Dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com sua conexão PostgreSQL e JWT_SECRET (mín. 32 caracteres).

### 3. Banco de dados

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Desenvolvimento

```bash
npm run dev
```

Acesse:
- Landing: http://localhost:3000
- Agendamento: http://localhost:3000/agendar
- Admin: http://localhost:3000/admin/login

## Credenciais padrão (seed)

| Campo | Valor |
|-------|-------|
| E-mail | admin@drjoaomarcos.com.br |
| Senha | Admin@2024! |

Altere via variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`.

## Funcionalidades

### Agendamento (público)
- Escolha de procedimento, data e horário
- Validação de horários duplicados e datas passadas
- Formulário com nome, WhatsApp, e-mail e observações
- Confirmação visual premium

### Painel Admin
- Login/logout com JWT
- Dashboard com estatísticas
- Lista, filtros e detalhes de agendamentos
- Confirmar, cancelar e finalizar consultas
- Perfil e configurações da clínica

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:migrate` | Executar migrations |
| `npm run db:seed` | Popular banco inicial |
| `npm run db:studio` | Prisma Studio |

## Produção

1. Configure `DATABASE_URL` e `JWT_SECRET` no ambiente
2. `npx prisma migrate deploy`
3. `npm run db:seed` (primeira vez)
4. `npm run build && npm start`

## Licença

Projeto privado — Dr. João Marcos.
