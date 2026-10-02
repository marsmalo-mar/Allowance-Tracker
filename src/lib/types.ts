export type TransactionType = "income" | "expense" | "transfer";
export type AccountType = "cash" | "e-wallet" | "bank" | "investment" | "other";

// All monetary values crossing the UI boundary are integer centavos.
export interface Account {
  id: number;
  name: string;
  type: AccountType;
  startingBalance: number;
  balance: number;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  accountId: number;
  toAccountId: number | null;
  categoryId: number | null;
  accountName: string;
  toAccountName: string | null;
  categoryName: string | null;
}

export interface Snapshot {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  monthlyAllowance: number;
}

export interface ActionState {
  error?: string;
  success?: string;
}
