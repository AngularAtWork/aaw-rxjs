import { inject, Injectable } from '@angular/core';

import { concatAll, filter, from, map, Observable, toArray } from 'rxjs';

import { ApiService } from '../api.service';
import { Account, Customer, Transaction } from '../app.model';
import { compareValues, getAge, sortObs } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ToArrayService {

  private apiService = inject(ApiService);

  filteredCustomers1$: Observable<Customer[]> = this.apiService.allCustomers$
  .pipe(
    map((customers: Customer[]) => from(customers)),
    concatAll(),
    map((customer: Customer) => ({...customer, age: getAge(customer.birthday)})),
    map((customer: Customer) => this.apiService.getAccountsByCustomerId$(customer.id).pipe(
                                      map((accounts: Account[]) => ({...customer, accounts}))
    )),
    concatAll(),
    map((customer: Customer) => ({...customer, 
                                  accountsTotal: customer.accounts?.reduce((total: number, curr: Account) => total + (+curr.balance), 0)})),
    map((customer: Customer) => this.apiService.transactionsForId$(customer.id).pipe(
                                      map((tranx: Transaction[]) => ({...customer, 
                                                lastTransactionDate: tranx.sort(compareValues('transactionDate', 'desc'))[0].transactionDate}))
    )),
    concatAll(),
    toArray(),
  );

  filteredCustomers$: Observable<Customer[]> = this.filteredCustomers1$
  .pipe(
    sortObs('last')
  )
}
