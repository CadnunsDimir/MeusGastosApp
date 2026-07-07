import { api } from './api';
import type { BankAccountDTO, BillResponseDTO, NewBankAccountDTO, NewBillDTO } from '../types/finance';

export async function listAccounts() {
  const response = await api.get<BankAccountDTO[]>('/bank/account');
  return response.data;
}

export async function createAccount(payload: NewBankAccountDTO) {
  const response = await api.post<BankAccountDTO>('/bank/account', payload);
  return response.data;
}

export async function deleteAccount(accountId: string) {
  await api.delete(`/bank/account/${accountId}`);
}

export async function listBills(year: number, month: number) {
  const response = await api.get<BillResponseDTO[]>(`/bank/bills/${year}/${month}`);
  return response.data;
}

export async function createBill(year: number, month: number, payload: NewBillDTO) {
  const response = await api.post<BillResponseDTO>(`/bank/bills/${year}/${month}`, payload);
  return response.data;
}

export async function deleteBill(year: number, month: number, billId: string) {
  await api.delete(`/bank/bills/${year}/${month}/${billId}`);
}
