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

export interface NewBillDTO {
  description: string;
  category: string;
  paymentDay: number;
  repeatValueNextMonth: boolean;
  value: number;
}
