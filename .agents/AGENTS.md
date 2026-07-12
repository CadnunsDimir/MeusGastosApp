# Diretrizes do Projeto MeusGastosApp

Este arquivo contém as instruções, padrões arquiteturais e regras tecnológicas para orientar qualquer assistente de IA/Agente que trabalhar neste repositório.

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: ASP.NET Core (`net10.0`) Web API (Minimal APIs).
- **Banco de Dados**: PostgreSQL com Entity Framework Core (`Npgsql.EntityFrameworkCore.PostgreSQL`).
- **Autenticação**: JWT Bearer Authentication com autorização baseada em Claims.
- **Log**: Serilog com pia (sink) para console e Seq (em produção).
- **Limitação de Requisições**: Rate Limiting integrado do ASP.NET Core.

### Frontend
- **Framework**: React 18 com TypeScript e Vite.
- **Estilização**: Tailwind CSS.
- **Gerenciamento de Requisições/Estado**: React Query (`@tanstack/react-query` v5) e Axios.
- **Roteamento**: React Router DOM (v6).

---

## 🏗️ Padrões de Código e Arquitetura

### Backend (`CadnunsDev.MeusGastos.Backend`)
1. **Estrutura de Pastas**:
   - `Domain/Services`: Regras de negócio e serviços da aplicação.
   - `Infrastructure`: `AppDbContext`, repositórios concretos e `EfUnitOfWork`.
   - `Models`: DTOs de requisição e resposta (Ex: `NewUserRequestDTO`, `LoginRequestDTO`).
   - `Migrations`: Histórico de migrações do banco.
2. **Banco de Dados**:
   - Sempre utilize o EF Core e gere novas Migrations com `dotnet ef migrations add <Nome>` ao alterar entidades.
   - As migrações são aplicadas automaticamente na inicialização via `app.ApplyDBMigrationsAsync()`.
3. **Padrão de Repositórios & Unit of Work**:
   - Utilize a abstração `IUnitOfWork` para persistir alterações ao final de requisições de escrita.
   - Injete os repositórios correspondentes no construtor dos serviços (`Services`).
4. **Segurança**:
   - Endpoints privados devem requerer autorização via `.RequireAuthorization()`.
   - Obtenha informações do usuário autenticado a partir do `ClaimsPrincipal` injetado usando métodos de extensão como `GetUserName()`.

### Frontend (`CadnunsDev.MeusGastos.Frontend`)
1. **Estilização**:
   - Priorize o uso de classes utilitárias do Tailwind CSS. Não crie arquivos CSS ad-hoc, a menos que estritamente necessário.
2. **Consumo de API**:
   - Toda comunicação com a API Backend deve ser feita via Axios.
   - Prefira usar Hooks Customizados com `@tanstack/react-query` (`useQuery`, `useMutation`) para buscar ou enviar dados, garantindo cache e estados de loading/error consistentes.
3. **Organização de Componentes**:
   - Componentes reutilizáveis devem ficar na pasta `src/components`.
   - Páginas e telas de rotas devem ficar na pasta `src/pages` ou `src/views`.

---

## 🧪 Padrões de Testes

- **Backend**: Use xUnit e `WebApplicationFactory` para testes de integração de ponta a ponta na API.
- **Frontend**: Para testar componentes React, sempre envolva o componente renderizado em um harness/decorator que proveja o `QueryClientProvider` e o `MemoryRouter`.
