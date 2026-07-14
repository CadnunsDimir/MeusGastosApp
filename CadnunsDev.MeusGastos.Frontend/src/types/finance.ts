export interface BankAccountDTO {
  accountId: string;
  name: string;
  balance: number;
}

export interface NewBankAccountDTO {
  accountName: string;
  initialBalance: number;
}

export interface BillResponseDTO {
  billId: string;
  billDescription: string;
  value: number;
  paymentDay: number;
  isPaid: boolean;
  category: string;
}

export enum MovementType {
  Revenue = 1,
  Expense = 2,
  Transfer = 3,
  Investment = 4
}

export interface MovementDTO {
  movementId?: string;
  accountId: string;
  description: string;
  value: number;
  date: string;
  type?: MovementType;
  relatedMovementId?: string;
}

export interface NewAccountMovementV2DTO {
  type: MovementType;
  accountId: string;
  destinationAccountId?: string;
  value: number;
  description: string;
  day: number;
}

export interface NewBillDTO {
  description: string;
  category: string;
  paymentDay: number;
  repeatValueNextMonth: boolean;
  value: number;
}

export interface PayBillDTO {
  billId: string;
  date: string;
  accountId: string;
}

export interface CategorySuggestionDTO {
  categoryId: string;
  description: string;
}

export interface DashboardItemDTO {
  category: string,
	totalSum: number
}