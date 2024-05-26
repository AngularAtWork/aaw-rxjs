import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, concatAll, debounceTime, distinctUntilChanged, from, map, Observable, of, share, Subject, take, tap, throttleTime, toArray, withLatestFrom } from 'rxjs';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Account, Customer, Jurisdiction, TapCallback, Transaction } from '../app.model';
import { compareValues, getAge, log, sortObs } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class WithLatestFromService {

  private currentCustomersSubject = new BehaviorSubject<Customer[]>([]);
  public currentCustomers$: Observable<Customer[]> = this.currentCustomersSubject.asObservable().pipe(
    map((customers: Customer[]) => this.addDataToCustomers(customers)),
    concatAll()
  );

  private searchTextSubject = new BehaviorSubject<string>('');
  public searchText$: Observable<string> = this.searchTextSubject.asObservable().pipe(
    debounceTime(400),
    distinctUntilChanged(),
  );

  private selectedJurisdictionSubject = new BehaviorSubject<string>('(All)');
  public selectedJurisdiction$: Observable<string> = this.selectedJurisdictionSubject.asObservable().pipe(
  );

  private addCustomerSubject = new Subject<Customer>();
  public addCustomer$: Observable<Customer> = this.addCustomerSubject.asObservable().pipe(
    log('addCustomer$', TapCallback.All, 'orange', false)
  )

  private apiService = inject(ApiService);

  readCustomers$: Observable<Customer[]> = this.apiService.allCustomers$.pipe(
    tap((customers: Customer[]) => this.currentCustomersSubject.next(customers)),
    log('readCustomers$', TapCallback.Next, 'beige')
  );

  createCustomer$: Observable<Customer[]> = this.addCustomer$.pipe(
    map((newCustomer: Customer) => this.apiService.postCustomer$(newCustomer)),
    concatAll(),
    withLatestFrom(this.currentCustomers$),
    map(([newCustomer, currentCustomers]: [Customer, Customer[]]) => ([...currentCustomers, newCustomer])),
    log('createCustomer$', TapCallback.Next, 'pink')
  )

  crud$: Observable<Customer[]> = combineLatest([
    this.readCustomers$,
    this.createCustomer$
  ]).pipe(
    map(([read, create]: [Customer[], Customer[]]) => create || read),
    tap((customers: Customer[]) => this.currentCustomersSubject.next(customers))
  )

  allJurisdictions$: Observable<Jurisdiction[]> = this.apiService.allJurisdictions$

  currentSelections$: Observable<[string, string]> = combineLatest([
    this.searchText$,
    this.selectedJurisdiction$,
  ]).pipe(
  )

  //#region 

  // customersWithAcctsAndTranx$: Observable<Customer[]> = this.crud$.pipe(
  //   map((customers: Customer[]) => from(customers)),
  //   concatAll(),
  //   map((customer: Customer) => ({...customer, age: getAge(customer.birthday)})),
  //   map((customer: Customer) => this.apiService.getAccountsByCustomerId$(customer.id).pipe(
  //                                     map((accounts: Account[]) => ({...customer, accounts}))
  //   )),
  //   concatAll(),
  //   map((customer: Customer) => ({...customer, 
  //                                 accountsTotal: customer.accounts?.reduce((total: number, curr: Account) => total + (+curr.balance), 0)})),
  //   map((customer: Customer) => this.apiService.transactionsForId$(customer.id).pipe(
  //                                     map((tranx: Transaction[]) => ({...customer, 
  //                                               lastTransactionDate: tranx.sort(compareValues('transactionDate', 'desc'))[0].transactionDate}))
  //   )),
  //   concatAll(),
  //   toArray(),
  // )

  filteredCustomers$: Observable<Customer[]> = combineLatest([
    this.crud$,
    this.currentSelections$
  ]).pipe(
    withLatestFrom(this.currentCustomers$),
    map(([[customers, selections], currentCustomers]: [[Customer[], [string, string]], Customer[]]) => {
      
      const filteredCustomers: Customer[] = currentCustomers.filter((customer: Customer) => {
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

      return filteredCustomers;
    }),
    sortObs('last')
  )

  //#endregion

  changeSearchText(searchText: string) {
    this.searchTextSubject.next(searchText);
  }

  changeJurisdiction(jurisdiction: string) {
    this.selectedJurisdictionSubject.next(jurisdiction);
  }

  addNewCustonmer() {
    this.addCustomerSubject.next(NEW_CUSTOMER)
  }

  addDataToCustomers(arrayOfCustomers: Customer[]): Observable<Customer[]> {
    return of(arrayOfCustomers).pipe(
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
  }

}
