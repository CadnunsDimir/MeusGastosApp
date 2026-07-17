# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MeusGastosApp** is a personal finance app (bills, movements, accounts, dashboard). Monorepo with:
- `CadnunsDev.MeusGastos.Backend/` — ASP.NET Core Minimal APIs (net10.0)
- `CadnunsDev.MeusGastos.Frontend/` — React 18 + TypeScript + Vite

## Commands

### Full stack (Docker)
```bash
docker compose up --build       # starts PostgreSQL (5432), backend (5000), frontend (3001)
```

### Backend
```bash
dotnet restore
dotnet build
dotnet ef migrations add <Name>  # after changing EF entities
```
Migrations apply automatically on startup via `app.ApplyDBMigrationsAsync()`.

### Frontend
```bash
npm run dev      # Vite dev server on port 5173
npm run build    # tsc + vite build
```

## Architecture

### Backend
- **Minimal APIs** — routes registered in `Program.cs`, grouped by domain (`/auth`, `/bank/account`, `/bank/bills`, `/bank/movements`, `/bank/dashboard`)
- **Layers**: `Domain/Services` (business logic) → `Infrastructure` (EF Core repositories, `AppDbContext`) → `Models` (DTOs)
- **Hexagonal simplificado**: Domain services access data ONLY via repository interfaces (`IUserRepository`, `IBankAccountRepository`, etc.), never directly via `AppDbContext`.
  - **Services**: inject interfaces only (`IUserRepository`, `IBankAccountRepository`)
  - **Repositories**: handle all persistence (CRUD, `SaveChangesAsync()`)
  - **Endpoints**: never inject `AppDbContext`
- **Auth**: JWT Bearer. Private endpoints require `.RequireAuthorization()`. Get current user via `ClaimsPrincipal.GetUserName()` extension.
- **Rate limiting** on `POST /auth/login` (10 req/min).

### Frontend
- **Data fetching**: React Query v5 (`useQuery`/`useMutation`) + Axios. Wrap all API calls in custom hooks under `src/hooks/`.
- **Styling**: Tailwind CSS only — no ad-hoc CSS files.
- **Structure**: `src/pages/` for routes, `src/components/` for reusable UI, `src/services/` for Axios abstractions, `src/types/` for TS interfaces.

### Database
Entities: `Users`, `RefreshTokens`, `BankAccounts`, `BankAccountMovements`, `BillCategories`, `BillsToPay`. All monetary values use `decimal(18,2)`.

## Commit Convention

Conventional Commits — always include scope. **Do NOT add "Co-Authored-By" trailers.**

| Scope | When |
|---|---|
| `backend` | changes in `CadnunsDev.MeusGastos.Backend/` |
| `frontend` | changes in `CadnunsDev.MeusGastos.Frontend/` |
| `infra` | docker-compose, Dockerfile, CI/CD |
| `docs` | `.md` files |

When a change spans both backend and frontend, prefer two separate commits.

```
feat(backend): add recurrence field to bills
fix(frontend): prevent negative values in movement form
```
