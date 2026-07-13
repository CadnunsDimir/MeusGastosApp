# Tipificar os movimentos

Precisamos categorizar os movimentos como:
- Receitas
- Despesa
- Transferências entre contas (saídas e entradas entre contas)
- Investimentos

Adicione um enum para representar os tipos de movimentos e faça a migration para atualizar a tabela de movimentos.

## Artefatos
- Criar `Domain/Enums/MovementType.cs`
- Alterar o `Domain/Entities/BankAccountMovement.cs` para incluir o tipo de movimento e a relação `RelatedMovementId` (para vincular transferências)
- Criar migration `Data/Migrations/*MovementType.cs`
- Alterar DTOs `NewAccountMovementDTO.cs` e `AccountMovementDTO.cs`
- Atualizar endpoints no backend (`Program.cs`)
- Atualizar tipos e componentes no frontend (`finance.ts`, `MovementFormModal.tsx`, etc.)

## Detalhando os Movimentos

### Receita
Salários e entradas na conta.

### Despesas
Contas a pagar e saídas da conta. Podem ou não estar relacionados com contas a pagar.

### Transferências entre contas
Saídas e entradas entre contas. Serão informadas a conta de origem e conta de destino e o valor transferido. 
Serão geradas duas movimentações, uma de saída de uma conta e outra de entrada em outra conta.
* As duas movimentações devem ser vinculadas usando o campo `RelatedMovementId` (de tipo `Guid?`).
* Ao excluir ou editar uma das pontas de uma transferência, a outra movimentação vinculada também deve ser excluída/atualizada e ambos os saldos devem ser corrigidos.

### Investimentos
Seria um subtipo de despesa mas que será contabilizado futuramente para saber quanto estamos investindo mensalmente. ex: resgate de investimentos.

## Migração de Dados
Para os registros existentes no banco de dados, o campo `MovementType` deve ser preenchido de forma automática com base no sinal do campo `Value`:
* Se `Value >= 0` -> `MovementType.Revenue` (Receita)
* Se `Value < 0` -> `MovementType.Expense` (Despesa)

## API
Criar um endpoint `POST /bank/movements/v2/{year}/{month}` que receba os seguintes parâmetros:
- tipo de movimento (`MovementType`)
- conta de origem (`AccountId` ou conta de origem na transferência)
- conta de destino (`DestinationAccountId` - opcional/usado apenas em transferências)
- valor (`Value` - valor positivo enviado pelo cliente; o backend aplicará o sinal dependendo do tipo)
- descricao
- dia do movimento

### Retorno da API:
* Deve retornar uma lista com as movimentações criadas (`List<AccountMovementDTO>`). Em caso de transferência, retornará as duas movimentações geradas.

### Ajuste nos endpoints existentes:
* O DTO `AccountMovementDTO` deve passar a expor a propriedade `MovementType`.
* Os endpoints de listagem de movimentações devem passar a retornar a propriedade de tipo.

## Frontend
- Atualizar os tipos em `src/types/finance.ts`.
- Adaptar o formulário `MovementFormModal.tsx`:
  - Adicionar a seleção do tipo de movimento.
  - Se selecionado "Transferência", exibir campos de seleção para "Conta de Origem" e "Conta de Destino". Caso contrário, exibir apenas o campo tradicional de "Conta".