import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, delay, Subject, of, throwError, timer, from, defer } from 'rxjs';
import { catchError, concatAll, concatMap, filter, finalize, first, map, mergeMap, shareReplay, take, tap, toArray, withLatestFrom } from 'rxjs/operators';

import { Account, Customer, Jurisdiction, Transaction } from './app.model';
import { compareValues, getAge, log, randomNumberMinMax, sortObs } from './utils';

export const NEW_CUSTOMER: Customer = {
  id: '88888888',
  first: 'Billie',
  last: 'Aardern',
  email: 'Billya18@gmail.com',
  birthday: '2001-08-10T16:41:51.396Z',
  address: '247 Always Street',
  city: 'Ponce',
  state: 'PR',
  zip: '14727',
  phone: '383.510.8641',
  accountsTotal: 0
};

const crudOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' })};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http$: HttpClient = inject(HttpClient);

  private customersUrl = 'api/customers';
  private transactionsUrl = 'api/transactions';
  private jurisdictionsUrl = 'api/jurisdictions';
  private accountsUrl = 'api/accounts';

  allCustomers$: Observable<Customer[]> = this.http$.get<Customer[]>(this.customersUrl).pipe(
    // delay(1000)
  );

  //#region 
  allCustomersWithAllData$: Observable<Customer[]> = this.http$.get<Customer[]>(this.customersUrl).pipe(
    concatMap((customers: Customer[]) => from(customers)),
    mergeMap((customer: Customer) => this.getAccountsByCustomerId$(customer.id).pipe(map((accts: Account[]) => ({...customer, accounts: accts.sort(compareValues('balance', 'desc'))})))),
    mergeMap((customer: Customer) => this.transactionsForId$(customer.id).pipe(map((trx: Transaction[]) => ({customer, trx})))),
    map(({customer, trx}) => {
      const sortedTransactions: Transaction[] = trx.sort(compareValues('transactionDate', 'desc'));
      return {
        ...customer,
        lastTransactionDate: sortedTransactions[0].transactionDate,
        lastTransactionAcctNum: sortedTransactions[0].accountNumber
      } as Customer
    }),
    toArray(),
    map((customers: Customer[]) => {
      return customers.map((customer: Customer) => this.setAgeForCustomer(customer));
    }),
    map((customersWithAge: Customer[]) => {
      return customersWithAge.map((customer: Customer) => this.setAccountTotalForCustomer(customer));
    }),
    sortObs('last'),
  );
  //#endregion
  
  allTransactions$: Observable<Transaction[]> = this.http$.get<Transaction[]>(this.transactionsUrl);

  allJurisdictions$: Observable<Jurisdiction[]> = this.http$.get<Jurisdiction[]>(this.jurisdictionsUrl).pipe(
    // delay(3000)
  );

  //#region 
  allCustomersError$: Observable<Customer[]> = this.http$.get<Customer[]>('blah').pipe(
    catchError(err => throwError(() => new Error('An error occurred retrieving customer data.'))),
    // finalize(() => console.log('allCustomersError$ finalize')),
  );
  //#endregion

  allAccounts$: Observable<Account[]> = this.http$.get<Account[]>(this.accountsUrl);

  cleanDb$ = this.http$.post('commands/resetDb', { clear: true });

  transactionsForId$(id: string): Observable<Transaction[]> {
    return this.http$.get<Transaction[]>(`${this.transactionsUrl}`).pipe(
      map((trxs: Transaction[]) => trxs.filter(trs => trs.customerId === id)),
    )
  }

  transactionsForIdDelayed$(id: string): Observable<Transaction[]> {
    const random = randomNumberMinMax(0, 1.5);
    return this.http$.get<Transaction[]>(`${this.transactionsUrl}`).pipe(
      map((trxs: Transaction[]) => trxs.filter(trs => trs.customerId === id)),
      delay(random * 1000),
    )
  }

  getAccountsByCustomerId$(customerId: string): Observable<Account[]> {
    return this.http$.get<Account[]>(`${this.accountsUrl}/?customerId=${customerId}`).pipe(
    )
  }

  getAccountsByCustomerIdDelayed$(customerId: string): Observable<Account[]> {
    const random = randomNumberMinMax(0, 1.5);
    return this.http$.get<Account[]>(`${this.accountsUrl}/?customerId=${customerId}`).pipe(
      delay(random * 1000),
    )
  }

  getJurisdictionByCode$(code: string): Observable<Jurisdiction> {
    // const random = randomNumberMinMax(1000, 3000);
    return this.http$.get<Jurisdiction[]>(`${this.jurisdictionsUrl}/?code=${code}`).pipe(
      map((jurisdictions: Jurisdiction[]) => jurisdictions[0]),
      // delay(random),
    )
  }

  getJurisdictionByName$(name: string): Observable<Jurisdiction> {
    // const random = randomNumberMinMax(1000, 5000);
    return this.http$.get<Jurisdiction[]>(`${this.jurisdictionsUrl}`).pipe(
      concatAll(),
      filter((juris: Jurisdiction) => juris.name.toLocaleLowerCase() === name.toLocaleLowerCase()),
      // delay(random),
    )
  }

  getCustomerById$(id: string): Observable<Customer> {
    return this.http$.get<Customer>(`${this.customersUrl}/${id}`).pipe(
    )
  }

  getAccountTypeOfTransaction$(tranx: Transaction): Observable<string> {
    return this.http$.get<Account>(`${this.accountsUrl}/?accountNumber=${tranx.accountNumber}`).pipe(
      map((acct: Account) => acct.accountType)
    )
  }

  getCustomersWithRandomDelay$(value: number): Observable<{value: number, customers: Customer[]}> {
    const random = randomNumberMinMax(1000, 5000);
    return this.http$.get<Customer[]>(this.customersUrl).pipe(
      map((customers: Customer[]) => ({value, customers})),
      delay(2000),
      finalize(() => console.log('getCustomersWithRandomDelay$ finalize')),
    )
  }

  getCustomersByJurisdiction(state: string): Observable<Customer[]> {
    return this.allCustomers$.pipe(
      concatAll(),
      filter((customer: Customer) => state === '(All)' ? true : customer.state === state),
      mergeMap((customer: Customer) => this.transactionsForId$(customer.id).pipe(map((transactions: Transaction[]) => ({ transactions, customer})),
      map(({transactions, customer}) => {
        const sortedTransactionDates: Transaction[] = transactions.sort(compareValues('transactionDate', 'desc'));
        return {
          ...customer,
          lastTransactionDate: sortedTransactionDates[0].transactionDate
        } as Customer 
      }))),
      toArray(),
      sortObs('last')
    )
  }

  //#region 
  postCustomer$(customer: Customer): Observable<Customer> {
    return this.http$.post<Customer>(this.customersUrl, customer, crudOptions).pipe(
      delay(1000),
    );
  }

  //#region 
  postCustomerError$(customer: Customer): Observable<Customer> {
    return this.http$.post<Customer>('blah', customer, crudOptions).pipe(
    catchError(() => throwError(() => new Error('Error in postCustomerError$.')))
    );
  }
  //#endregion

  putCustomer$(customerUpdates: Customer): Observable<any> {
    return this.http$.put<Customer>(this.customersUrl, customerUpdates, crudOptions).pipe(
      delay(1000),
    )
  }

  putCustomerAlternate$(customerUpdates: Customer): Observable<any> {
    return this.http$.put<Customer>(this.customersUrl, customerUpdates, crudOptions).pipe(
      delay(1000),
    )
  }

  deleteCustomer$(customerId: string): Observable<null> {
    return this.http$.delete<null>(`${this.customersUrl}/${customerId}`, crudOptions).pipe(
      delay(1000),
    );
  }

  searchCustomersLastName$(term: string): Observable<Customer[]> {
    if (!term.trim()) {
      return of([]);
    }
 
    return this.http$.get<Customer[]>(`${this.customersUrl}/?last=${term}`).pipe(delay(2000));
  }

  setTransactionDateForCustomers(customers: Observable<Customer[]>): Observable<Customer[]> {
    return customers.pipe(
      concatAll(),
      mergeMap((customer: Customer) => this.transactionsForId$(customer.id).pipe(map((transactions: Transaction[]) => ({ transactions, customer})),
      map(({transactions, customer}) => {
        const sortedTransactionDates: Transaction[] = transactions.sort(compareValues('transactionDate', 'desc'));
        return {
          ...customer,
          lastTransactionDate: sortedTransactionDates[0].transactionDate
        } as Customer 
      }))),
      toArray(),
    )
  } 

  setTransactionDateForCustomersError(customers: Observable<Customer[]>): Observable<Customer[]> {
    return customers.pipe(
      concatAll(),
      mergeMap((customer: Customer) => this.http$.get<Transaction[]>(`blah`).pipe(map((transactions: Transaction[]) => ({ transactions, customer})),
      map(({transactions, customer}) => {
        const sortedTransactionDates: Transaction[] = transactions.sort(compareValues('transactionDate', 'desc'));
        return {
          ...customer,
          lastTransactionDate: sortedTransactionDates[0].transactionDate
        } as Customer 
      }))),
      toArray(),
    )
  } 

  setAgeForCustomer(customer: Customer): Customer {
    return {...customer, age: getAge(customer.birthday)};
  }
  setAccountTotalForCustomer(customer: Customer): Customer {
    return {
      ...customer,
      accountsTotal: customer.accounts?.reduce((total: number, curr: Account) => (+curr.balance) + total, 0) || 0
    };
  }

 //#endregion

}
