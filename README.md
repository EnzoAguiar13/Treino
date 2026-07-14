# EsportivaBet — Sistema de Gestão de Afiliados

CRM full-stack para gestão interna de afiliados da EsportivaBet: Creators, Cassino, Sportsbook, Tráfego, Financeiro e Relatórios em um único painel com interface 3D premium em Dark Mode.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | Next.js (App Router), React, TypeScript, TailwindCSS, Three.js, React Three Fiber, Framer Motion, React Hook Form, Zustand, TanStack Query, Recharts, Socket.IO Client |
| Backend | NestJS, TypeScript, Prisma, Socket.IO, JWT + Refresh Token, BCrypt, Throttler (rate limit), Helmet |
| Banco | PostgreSQL 16 |
| Upload | Supabase Storage |
| Deploy | Docker + Docker Compose |

## Identidade visual

- Preto `#0B0B0B` · Cinza escuro `#181818` · Laranja oficial `#E8540A` · Branco `#FFFFFF`
- Padrão minimalista inspirado em Stripe, Vercel, Linear, Notion e Framer.

## Subindo com Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Senha de acesso inicial: `Espo1306`

## Desenvolvimento local

```bash
# Banco
docker compose up postgres -d

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Funcionalidades

- **Login 3D**: fundo com partículas animadas (Three.js), senha única, animação de expansão no sucesso, shake/borda vermelha no erro, sessão JWT persistente com refresh token.
- **Dashboard**: cartões animados (Afiliados, Creators, Cassino, Sportsbook, Registros, Depósitos, FTD, Volume, Net P&L, Investimento, Comissão, Lucro, ROI, CAC, CPA, Despesas, Lucro Líquido) atualizados em tempo real via WebSocket.
- **Afiliados**: CRUD completo com múltiplas categorias, redes sociais viram links clicáveis, campos financeiros com recálculo automático (ROI, CAC, CPA, Lucro), acordo com formatação e observações — tudo com **auto save** (sem botão salvar).
- **Painéis**: Creators, Cassino, Sportsbook e Tráfego (Facebook/Google/TikTok/Meta/Kwai Ads).
- **Histórico imutável**: quem alterou, data/hora, campo, valor antigo/novo, IP e dispositivo.
- **Relatórios**: exportação Excel (xlsx), CSV e PDF.
- **Usuários e permissões**: Administrador, Financeiro, CS, Gestor, Marketing, Tráfego, Visualização.
- **Segurança**: JWT + refresh, BCrypt, validação (SQLi/XSS), CORS restrito, Helmet, rate limit, logs de auditoria.

## Estrutura

```
backend/    API NestJS + Prisma (PostgreSQL)
frontend/   Next.js App Router (dashboard 3D)
docker-compose.yml
```
