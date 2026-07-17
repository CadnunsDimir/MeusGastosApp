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
3. **Padrão de Repositórios (Hexagonal Simplificado)**:
   - **Regra crítica**: Serviços (`Domain/Services`) acessam dados **APENAS** através de interfaces de repositório (`IUserRepository`, `IBankAccountRepository`, etc.). Nunca injete `AppDbContext` em serviços.
   - **Responsabilidades**:
     - **Services**: lógica de negócio, chama métodos dos repositórios
     - **Repository interfaces** (`Domain/Repositories/I*.cs`): definem operações (Get, Create, Update, Delete, etc.)
     - **Repository implementations** (`Infrastructure/*.cs`): implementam persistência, incluindo `SaveChangesAsync()` dentro de cada operação
   - **Exemplo correto**:
     ```csharp
     // ✅ CORRETO
     public class UserProfileService
     {
         private readonly IUserRepository userRepository;
         public UserProfileService(IUserRepository userRepository) { ... }
         public async Task UpdateAsync(User user) => await userRepository.UpdateAsync(user);
     }
     ```
   - **Exemplo errado**:
     ```csharp
     // ❌ ERRADO - não faça isso
     public class UserProfileService
     {
         private readonly AppDbContext dbContext; // NUNCA!
         public UserProfileService(AppDbContext dbContext) { ... }
     }
     ```
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

---

## 📝 Padrão de Commits

Utilize o padrão **Conventional Commits** (<https://www.conventionalcommits.org>) em **todos** os commits deste repositório.

### Formato

```
<tipo>(<escopo>): <descrição curta em minúsculas>

[corpo opcional com detalhes adicionais]
```

### Tipos aceitos

| Tipo       | Quando usar                                              |
|------------|----------------------------------------------------------|
| `feat`     | Nova funcionalidade                                      |
| `fix`      | Correção de bug                                          |
| `refactor` | Refatoração sem adição de feature ou correção de bug     |
| `chore`    | Tarefas de manutenção (CI, dependências, configurações)  |
| `docs`     | Alterações somente em documentação                       |
| `test`     | Adição ou ajuste de testes                               |
| `perf`     | Melhoria de performance                                  |
| `style`    | Formatação, espaços, ponto e vírgula — sem mudança lógica|

### Escopos obrigatórios

- **`backend`** — alterações em `CadnunsDev.MeusGastos.Backend/`
- **`frontend`** — alterações em `CadnunsDev.MeusGastos.Frontend/`
- **`infra`** — `docker-compose.yml`, `Dockerfile`, CI/CD
- **`docs`** — arquivos em `docs/` ou arquivos `.md` na raiz

> Quando um commit envolver exclusivamente backend **ou** frontend, use o escopo correspondente.
> Quando abranger ambos, **prefira dois commits separados** (um por escopo).

### Exemplos

```
feat(backend): add MovementType enum and v2 creation endpoint
fix(frontend): prevent negative values in movement form
refactor(backend): extract transfer logic to a dedicated method
docs(docs): add movement type categorization spec
chore(infra): bump postgres image to 16
```

