import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, concatAll, debounceTime, distinctUntilChanged, first, from, map, merge, Observable, of, shareReplay, Subject, take, tap, throttleTime, toArray, withLatestFrom } from 'rxjs';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Account, Customer, Jurisdiction, TapCallback, Transaction } from '../app.model';
import { compareValues, getAge, log, sortObs } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ShareReplayService {

  private currentCustomersSubject = new BehaviorSubject<Customer[]>([]);
  public currentCustomers$: Observable<Customer[]> = this.currentCustomersSubject.asObservable().pipe(
    map((customers: Customer[]) => this.addDataToCustomers$(customers)),
    concatAll(),
    log('currentCustomers$', TapCallback.Subscribe, '#9966CC')
  );

  private searchTextSubject = new BehaviorSubject<string>('');
  public searchText$: Observable<string> = this.searchTextSubject.asObservable().pipe(
    debounceTime(400),
    distinctUntilChanged(),
    log('searchText$', TapCallback.Subscribe, '#A4C639')
  );

  private selectedJurisdictionSubject = new BehaviorSubject<string>('(All)');
  public selectedJurisdiction$: Observable<string> = this.selectedJurisdictionSubject.asObservable().pipe(
    log('selectedJurisdiction$', TapCallback.Subscribe, '#FF7E00')
  );

  private addCustomerSubject = new Subject<Customer>();
  public addCustomer$: Observable<Customer> = this.addCustomerSubject.asObservable().pipe(
    log('addCustomer$', TapCallback.Subscribe, '#F19CBB')
  )

  private editCustomerSubject = new Subject<Customer>();
  public editCustomer$: Observable<Customer> = this.editCustomerSubject.asObservable().pipe(
    log('editCustomer$', TapCallback.Subscribe, '#FF033E')
  )

  private removeCustomerSubject = new Subject<Customer>();
  public removeCustomer$: Observable<Customer> = this.removeCustomerSubject.asObservable().pipe(
    log('removeCustomer$', TapCallback.Subscribe, '#3B7A57')
  )

  private apiService = inject(ApiService);

  readCustomers$: Observable<Customer[]> = this.apiService.allCustomers$.pipe(
    tap((customers: Customer[]) => this.currentCustomersSubject.next(customers)),
    log('readCustomers$', TapCallback.Subscribe, '#00FFFF')
  );

  createCustomer$: Observable<Customer[]> = this.addCustomer$.pipe(
    map((newCustomer: Customer) => this.apiService.postCustomer$(newCustomer)),
    concatAll(),
    withLatestFrom(this.currentCustomers$),
    map(([newCustomer, currentCustomers]: [Customer, Customer[]]) => ([...currentCustomers, newCustomer])),
    log('createCustomer$', TapCallback.Subscribe, '#D0FF14')
  )

  updateCustomer$: Observable<Customer[]> = this.editCustomer$.pipe(
    map((editedCustomer: Customer) => this.apiService.putCustomer$(editedCustomer).pipe(map(() => editedCustomer))),
    concatAll(),
    withLatestFrom(this.currentCustomers$),
    map(([editedCustomer, currentCustomers]: [Customer, Customer[]]) => {
      return [
        ...currentCustomers.filter((customer: Customer) => customer.id !== editedCustomer.id),
        editedCustomer
      ];
    }),
    log('updateCustomer$', TapCallback.Subscribe, '#FAF0BE')
  )

  deleteCustomer$: Observable<Customer[]> = this.removeCustomer$.pipe(
    map((deletedCustomer: Customer) => this.apiService.deleteCustomer$(deletedCustomer.id).pipe(map(() => deletedCustomer))),
    concatAll(),
    withLatestFrom(this.currentCustomers$),
    map(([deletedCustomer, currentCustomers]: [Customer, Customer[]]) => {
      return [
        ...currentCustomers.filter((customer: Customer) => customer.id !== deletedCustomer.id),
      ];
    }),
    log('deleteCustomer$', TapCallback.Subscribe, '#411900')
  )

  crud$: Observable<Customer[]> = merge(
    this.readCustomers$,
    this.createCustomer$,
    this.updateCustomer$,
    this.deleteCustomer$
  ).pipe(
    tap((customers: Customer[]) => this.currentCustomersSubject.next(customers)),
    log('crud$', TapCallback.Subscribe, '#0000FF'),
    shareReplay()
  )

  // allJurisdictions$: Observable<Jurisdiction[]> = this.apiService.allJurisdictions$.pipe(
  //   log('allJurisdictions$', TapCallback.Subscribe, '#964B00')
  // );

  allJurisdictions$: Observable<Jurisdiction[]> = combineLatest([
    this.crud$,
    this.apiService.allJurisdictions$
  ]).pipe(
    map(([customers, allJurisdictions]: [Customer[], Jurisdiction[]]) => {
      const customerJurisdictions: string[] = customers.map((customer: Customer) => customer.state.toLocaleUpperCase());
      return allJurisdictions.filter((jurisdiction: Jurisdiction) => customerJurisdictions.includes(jurisdiction.code.toLocaleUpperCase()))
    }),
    log('allJurisdictions$', TapCallback.Subscribe, '#964B00')
  )

  currentSelections$: Observable<[string, string]> = combineLatest([
    this.searchText$,
    this.selectedJurisdiction$,
  ]).pipe(
    log('currentSelections$', TapCallback.Subscribe, '#1B4D3E')
  )

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
    sortObs('last'),
    log('filteredCustomers$', TapCallback.Subscribe, '#00CC99')
  )

  changeSearchText(searchText: string) {
    this.searchTextSubject.next(searchText);
  }

  changeJurisdiction(jurisdiction: string) {
    this.selectedJurisdictionSubject.next(jurisdiction);
  }

  addNewCustonmer() {
    this.addCustomerSubject.next(NEW_CUSTOMER)
  }

  updateCustomer(customer: Customer) {
    const editLabel = '(Edited)';
    if (customer.first.indexOf(editLabel) === -1) {
      const editedCustomer = {...customer, first: `${customer.first} ${editLabel}`};
      this.editCustomerSubject.next(editedCustomer);
    }
  }

  deleteCustomer(customer: Customer) {
    this.removeCustomerSubject.next(customer);
  }

  addDataToCustomers$(arrayOfCustomers: Customer[]): Observable<Customer[]> {
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
