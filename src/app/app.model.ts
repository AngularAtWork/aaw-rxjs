export type NullableNumber = number | null;
export type AgeFilter = 'all' | 'over67' | 'under18'

export interface Account {
  customerId: string;
  accountNumber: string;
  accountType: string;
  balance: string;
}

export interface Customer {
  accounts?: Account[];
  address: string;
  birthday: string;
  city: string;
  email: string;
  first: string;
  id: string;
  last: string;
  phone: string;
  state: string;
  zip: string;
  accountsTotal?: number;
  age?: number;
  lastTransactionDate?: string;
  lastTransactionAcctNum?: string;
  error?: string;
  disableEditing?: boolean;
  disableDeletion?: boolean;
}

export interface Transaction {
  id: number;
  customerId: string;
  transactionDate: string;
  accountNumber: string;
}

export interface Jurisdiction {
  code: string;
  name: string;
}

export interface JurisdictionCustomers {
  jurisdictionName: string;
  customers: Customer[];
}

export interface EntityDisabled<T> {
  entity: T;
  disabled: boolean
}

export enum TapCallback {
  All,
  Next,
  Complete,
  Error,
  Subscribe,
  Unsubscribe,
  Finalize,
  None
}
