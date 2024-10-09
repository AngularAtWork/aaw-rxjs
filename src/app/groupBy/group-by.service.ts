//#region 
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, concatAll, debounceTime, distinctUntilChanged, filter, first, from, groupBy, map, merge, mergeAll, mergeMap, Observable, of, reduce, share, shareReplay, Subject, take, tap, throttleTime, toArray, withLatestFrom, zip } from 'rxjs';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Account, AgeFilter, Customer, Jurisdiction, JurisdictionCustomers, TapCallback, Transaction } from '../app.model';
import { compareValues, getAge, log, sortObs } from '../utils';

export interface GroupByFilters {
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

const DEFAULT_SEARCH = '';
const DEFAULT_JURISDICTION = '(All)';
const DEFAULT_AGES = 'all';
const DEFAULT_SHOWMULTI = false;

@Injectable({
  providedIn: 'root'
})
export class GroupByService {

  private currentCustomersSubject = new BehaviorSubject<Customer[]>([]);
  public currentCustomers$: Observable<Customer[]> = this.currentCustomersSubject.asObservable().pipe(
    map((customers: Customer[]) => this.addDataToCustomers$(customers)),
    concatAll(),
  )

  private searchTextSubject = new BehaviorSubject<string>(DEFAULT_SEARCH);
  public searchText$: Observable<string> = this.searchTextSubject.asObservable().pipe(
    debounceTime(3000),
  )

  private selectedJurisdictionSubject = new BehaviorSubject<string>(DEFAULT_JURISDICTION);
  public selectedJurisdiction$: Observable<string> = this.selectedJurisdictionSubject.asObservable().pipe(
  )

  private selectedAgesSubject = new BehaviorSubject<AgeFilter>(DEFAULT_AGES);
  public selectedAges$: Observable<AgeFilter> = this.selectedAgesSubject.asObservable().pipe(
  )

  private showMultiAccountCustomersSubject = new BehaviorSubject<boolean>(DEFAULT_SHOWMULTI);
  public showMultiAccountCustomers$: Observable<boolean> = this.showMultiAccountCustomersSubject.asObservable().pipe(
  )

  private addCustomerSubject = new Subject<Customer>();
  public addCustomer$: Observable<Customer> = this.addCustomerSubject.asObservable().pipe(
  )

  private editCustomerSubject = new Subject<Customer>();
  public editCustomer$: Observable<Customer> = this.editCustomerSubject.asObservable().pipe(
  )

  private removeCustomerSubject = new Subject<Customer>();
  public removeCustomer$: Observable<Customer> = this.removeCustomerSubject.asObservable().pipe(
  )

  private isResettingSubject = new BehaviorSubject<boolean>(false);
  public isResetting$: Observable<boolean> = this.isResettingSubject.asObservable();

  private apiService = inject(ApiService);

  readCustomers$: Observable<Customer[]> = this.apiService.allCustomers$.pipe(
    tap((customers: Customer[]) => this.currentCustomersSubject.next(customers)),
  )

  createCustomer$: Observable<Customer[]> = this.addCustomer$.pipe(
    map((newCustomer: Customer) => this.apiService.postCustomer$(newCustomer)),
    concatAll(),
    withLatestFrom(this.currentCustomers$),
    map(([newCustomer, currentCustomers]: [Customer, Customer[]]) => ([...currentCustomers, newCustomer])),
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
  )

  crud$: Observable<Customer[]> = merge(
    this.readCustomers$,
    this.createCustomer$,
    this.updateCustomer$,
    this.deleteCustomer$
  ).pipe(
    tap((customers: Customer[]) => this.currentCustomersSubject.next(customers)),
    shareReplay()
  )


  allJurisdictions$: Observable<Jurisdiction[]> = combineLatest([
    this.crud$,
    this.apiService.allJurisdictions$
  ]).pipe(
    map(([customers, allJurisdictions]: [Customer[], Jurisdiction[]]) => {
      const customerJurisdictions: string[] = customers.map((customer: Customer) => customer.state.toLocaleUpperCase());
      return allJurisdictions.filter((jurisdiction: Jurisdiction) => customerJurisdictions.includes(jurisdiction.code.toLocaleUpperCase()))
    }),
  )

  reset$: Observable<GroupByFilters> = zip(
    this.searchText$.pipe(filter(searchText => searchText === DEFAULT_SEARCH)),
    this.selectedJurisdiction$.pipe(filter(juris => juris === DEFAULT_JURISDICTION)),
    this.selectedAges$.pipe(filter(ages => ages === DEFAULT_AGES)),
    this.showMultiAccountCustomers$.pipe(filter(show => show === DEFAULT_SHOWMULTI))
  ).pipe(
    map(([searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers]) => {
      return {
        searchText,
        selectedJurisdiction,
        selectedAges,
        showMultiAccountCustomers
      } as GroupByFilters
    }),
    tap(() => this.isResettingSubject.next(false)),
  )

  currentSelections$: Observable<GroupByFilters> = combineLatest([
    this.searchText$,
    this.selectedJurisdiction$,
    this.selectedAges$,
    this.showMultiAccountCustomers$
  ]).pipe(
    map(([searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers]: [string, string, AgeFilter, boolean]) => {
      return {
        searchText,
        selectedJurisdiction,
        selectedAges,
        showMultiAccountCustomers
      } as GroupByFilters
    }),
    withLatestFrom(this.isResetting$),
    filter(([filters, isResetting]: [GroupByFilters, boolean]) => !isResetting),
    map(([filters, isResetting]: [GroupByFilters, boolean]) => filters),
  )

  filterOrReset$: Observable<GroupByFilters> = merge(
    this.reset$,
    this.currentSelections$
  )

  filteredCustomersByJurisdiction$: Observable<JurisdictionCustomers[]> = combineLatest([
    this.crud$,
    this.filterOrReset$
  ]).pipe(
    withLatestFrom(this.currentCustomers$),
    map(([[customers, selections], currentCustomers]: [[Customer[], GroupByFilters], Customer[]]) => {
      
      const filteredCustomers: Customer[] = currentCustomers.filter((customer: Customer) => {
        let matchName = false;
        let matchState = false;
        let matchAge = false;
        let matchMulti = false;

        if (!selections.searchText.trim() || customer.last.toLocaleLowerCase().includes(selections.searchText.toLocaleLowerCase())) {
          matchName = true;
        }

        if (selections.selectedJurisdiction === '(All)' || customer.state === selections.selectedJurisdiction) {
          matchState = true;
        }

        if (selections.selectedAges === 'all' || 
            (selections.selectedAges === 'under18' && !!customer.age && customer.age < 18) ||
            (selections.selectedAges === 'over67' && !!customer.age && customer.age > 67)
          ) {
            matchAge = true;
        }

        if (!selections.showMultiAccountCustomers || selections.showMultiAccountCustomers && !!customer.accounts && customer.accounts?.length > 1) {
          matchMulti = true;
        }

        return matchName && matchState && matchAge && matchMulti;
      })

      return filteredCustomers;
    }),
    sortObs('last'),
    map((customers: Customer[]) => this.groupCustomersByJurisdiction$(customers)),
    concatAll(),
    sortObs('jurisdictionName'),
  )

  groupCustomersByJurisdiction$(customers: Customer[]): Observable<JurisdictionCustomers[]> {
     return of(customers).pipe(
        map((customers: Customer[]) => from(customers)),
        concatAll(),
        groupBy((customer: Customer) => customer.state),
        map(group$ => zip(of(group$.key), group$.pipe(toArray()))),
        mergeAll(),
        map(([jurisdictionCode, customers]) => this.apiService.getJurisdictionByCode$(jurisdictionCode)
                                        .pipe(map((juris: Jurisdiction) => ({jurisdictionName: juris.name, customers} as JurisdictionCustomers)))),
        concatAll(),
        toArray()
      )
  }

  changeSearchText(searchText: string) {
    this.searchTextSubject.next(searchText);
  }

  changeJurisdiction(jurisdiction: string) {
    this.selectedJurisdictionSubject.next(jurisdiction);
  }

  changeAges(ages: AgeFilter) {
    this.selectedAgesSubject.next(ages);
  }

  changeMulti(showMulti: boolean) {
    this.showMultiAccountCustomersSubject.next(showMulti);
  }

  resetAllFilters() {
    this.isResettingSubject.next(true);
    this.searchTextSubject.next(DEFAULT_SEARCH);
    this.selectedJurisdictionSubject.next(DEFAULT_JURISDICTION);
    this.selectedAgesSubject.next(DEFAULT_AGES);
    this.showMultiAccountCustomersSubject.next(DEFAULT_SHOWMULTI);
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
