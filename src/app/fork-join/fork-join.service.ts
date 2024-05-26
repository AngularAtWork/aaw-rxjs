import { Injectable, inject } from '@angular/core';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Account, Customer, Jurisdiction, Transaction } from '../app.model';
import { Observable, forkJoin, map } from 'rxjs';
import { sortObs } from '../utils';

export interface ForkJoinUI {
  customers: Customer[];
  transactions: Transaction[];
  states: Jurisdiction[];
}

@Injectable({
  providedIn: 'root'
})
export class ForkJoinService {

  private apiService = inject(ApiService);

  customersWithAccounts$: Observable<Customer[]> = forkJoin([
    this.apiService.allCustomers$,
    this.apiService.allAccounts$
  ]).pipe(
    map(([allCustomers, allAccounts]: [Customer[], Account[]]) => {
      return allCustomers.map((customer: Customer) => ({...customer,
                                                      accounts: allAccounts.filter((acct: Account) => acct.customerId === customer.id)
      }))
    }),
    sortObs('last')
  );
  
}
