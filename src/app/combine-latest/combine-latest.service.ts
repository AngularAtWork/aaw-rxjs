import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, concatAll, from, map, Observable, Subject, toArray } from 'rxjs';

import { ApiService } from '../api.service';
import { Account, Customer, Jurisdiction, TapCallback, Transaction } from '../app.model';
import { compareValues, getAge, log, sortObs } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class CombineLatestService {

  private searchTextSubject = new BehaviorSubject<string>('');
  public searchText$: Observable<string> = this.searchTextSubject.asObservable().pipe(
    log('searchText$', undefined, '#14591D', false)
  );

  private selectedJurisdictionSubject = new BehaviorSubject<string>('(All)');
  public selectedJurisdiction$: Observable<string> = this.selectedJurisdictionSubject.asObservable().pipe(
    log('selectedJurisdiction$', undefined, '#14591D', false)
  );

  private selectedSortPropertySubject = new BehaviorSubject<string>('last');
  public selectedSortProperty$: Observable<string> = this.selectedSortPropertySubject.asObservable().pipe(
    log('selectedSortProperty$', undefined, '#14591D', false)
  );

  private selectedSortOrderSubject = new BehaviorSubject<string>('asc');
  public selectedSortOrder$: Observable<string> = this.selectedSortOrderSubject.asObservable().pipe(
    log('selectedSortOrder$', undefined, '#14591D', false)
  );

  private apiService = inject(ApiService);

  allJurisdictions$: Observable<Jurisdiction[]> = this.apiService.allJurisdictions$

  currentSelections$: Observable<[string, string, string, string]> = combineLatest([
    this.searchText$,
    this.selectedJurisdiction$,
    this.selectedSortProperty$,
    this.selectedSortOrder$
  ]).pipe(
    log('currentSelections$', TapCallback.All, 'orange', false)
  )

  //#region 

  customersWithAcctsAndTranx$: Observable<Customer[]> = this.apiService.allCustomers$.pipe(
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
  )

  filteredCustomers$: Observable<Customer[]> = combineLatest([
    this.customersWithAcctsAndTranx$,
    this.currentSelections$
  ]).pipe(
    map(([customers, selections]: [Customer[], [string, string, string, string]]) => {
      
      const filteredCustomers: Customer[] = customers.filter((customer: Customer) => {
        let matchName = false;
        let matchState = false;

        if (!selections[0].trim() || customer.last.toLocaleLowerCase().includes(selections[0].toLocaleLowerCase())) {
          matchName = true;
        }
        if (selections[1] === '(All)' || customer.state === selections[1]) {
          matchState = true;
        } 

        return matchName && matchState;
      })

      return filteredCustomers.sort(compareValues(selections[2], selections[3] === 'asc' ? 'asc' : 'desc'))
    }),
  )

  //#endregion

  changeSearchText(searchText: string) {
    this.searchTextSubject.next(searchText);
  }

  changeJurisdiction(jurisdiction: string) {
    this.selectedJurisdictionSubject.next(jurisdiction);
  }

  changeSortProperty(sortProperty: string) {
    this.selectedSortPropertySubject.next(sortProperty);
  }

  changeSortOrder(sortOrder: string) {
    this.selectedSortOrderSubject.next(sortOrder);
  }
}
