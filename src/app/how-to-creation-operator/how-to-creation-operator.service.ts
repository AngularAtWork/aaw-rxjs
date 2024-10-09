//#region 
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, concatAll, concatMap, debounceTime, delay, exhaustMap, filter, from, map, merge, mergeMap, Observable, of, scan, share, shareReplay, Subject, switchMap, tap, toArray, withLatestFrom, zip } from 'rxjs';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Account, AgeFilter, Customer, Jurisdiction, Transaction } from '../app.model';
import { compareValues, getAge, log, sortObs, timeObservable } from '../utils';

export interface HOMFilters {
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

export interface CrudOperation {
  create?: Customer;
  read?: Customer[];
  update?: Customer;
  delete?: string;
}

const DEFAULT_SEARCH = '';
const DEFAULT_JURISDICTION = '(All)';
const DEFAULT_AGES = 'all';
const DEFAULT_SHOWMULTI = false;

@Injectable({
  providedIn: 'root'
})
export class HowToCreationOperatorService {

  private searchTextSubject = new BehaviorSubject<string>(DEFAULT_SEARCH);
  public searchText$: Observable<string> = this.searchTextSubject.asObservable().pipe(
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

  private initializeCustomersSubject = new BehaviorSubject<boolean>(true);
  private intializeCustomers$: Observable<boolean> = this.initializeCustomersSubject.asObservable().pipe(
    // debounceTime(400)
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

  readCustomers$: Observable<CrudOperation> = this.intializeCustomers$.pipe(
    exhaustMap((proceed: boolean) => this.apiService.allCustomers$),
    map((customers: Customer[]) => ({ read: customers }))
  )

  createCustomer$: Observable<CrudOperation> = this.addCustomer$.pipe(
    concatMap((newCustomer: Customer) => this.apiService.postCustomer$(newCustomer)),
    map((newCustomer: Customer) => ({ create: newCustomer }))
  )

  updateCustomer$: Observable<CrudOperation> = this.editCustomer$.pipe(
    concatMap((editedCustomer: Customer) => this.apiService.putCustomer$(editedCustomer).pipe(map(() => editedCustomer))),
    map((updatedCustomer: Customer) => ({ update: updatedCustomer }))
  )

  deleteCustomer$: Observable<CrudOperation> = this.removeCustomer$.pipe(
    concatMap((deletedCustomer: Customer) => this.apiService.deleteCustomer$(deletedCustomer.id).pipe(map(() => deletedCustomer.id))),
    map((deletedId: string) => ({ delete: deletedId }))
  )

  crud$: Observable<Customer[]> = merge(
    this.readCustomers$,
    this.createCustomer$,
    this.updateCustomer$,
    this.deleteCustomer$
  ).pipe(
    scan((acc: CrudOperation, curr: CrudOperation) => {
      if (curr.read) {
        return {read: curr.read} as CrudOperation;
      }

      if (acc.read && curr.create) {
        const customers: Customer[] = [...acc.read, curr.create];
        return {read: customers} as CrudOperation;
      }

      if (acc.read && curr.update) {
        const customersWithUpdated: Customer[] = acc.read.filter((customer: Customer) => customer.id !== curr.update?.id);
        const customers: Customer[] = [...customersWithUpdated, curr.update];
        return {read: customers} as CrudOperation;
      }

      if (acc.read && curr.delete) {
        const customersWithoutDeleted: Customer[] = acc.read.filter((customer: Customer) => customer.id !== curr.delete);
        return {read: customersWithoutDeleted} as CrudOperation;
      }
      return {} as CrudOperation;
    }),
    map((crud: CrudOperation) => crud.read || []),
    concatMap((customers: Customer[]) => timeObservable(this.addDataToCustomers$(customers), 'addDataToCustomers$')),
    shareReplay({ refCount: true })
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

  reset$: Observable<HOMFilters> = zip(
    this.searchText$.pipe(filter(searchText => searchText === DEFAULT_SEARCH)),
    this.selectedJurisdiction$.pipe(filter(juris => juris === DEFAULT_JURISDICTION)),
    this.selectedAges$.pipe(filter(ages => ages === DEFAULT_AGES)),
    this.showMultiAccountCustomers$.pipe(filter(show => show === DEFAULT_SHOWMULTI))
  ).pipe(
    withLatestFrom(this.isResetting$),
    filter(([[searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers], isResetting]) => isResetting),
    map(([[searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers], isResetting]) => {
      return {
        searchText,
        selectedJurisdiction,
        selectedAges,
        showMultiAccountCustomers
      } as HOMFilters
    }),
    tap(() => this.isResettingSubject.next(false)),
  )

  currentSelections$: Observable<HOMFilters> = combineLatest([
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
      } as HOMFilters
    }),
    withLatestFrom(this.isResetting$),
    filter(([filters, isResetting]: [HOMFilters, boolean]) => !isResetting),
    map(([filters, isResetting]: [HOMFilters, boolean]) => filters),
  )

  filterOrReset$: Observable<HOMFilters> = merge(
    this.reset$,
    this.currentSelections$
  )

  filteredCustomers$: Observable<Customer[]> = combineLatest([
    this.crud$,
    this.filterOrReset$
  ]).pipe(
    switchMap(([crud, filterOrReset]: [Customer[], HOMFilters]) => this.getFilteredCustomersFromBackend$(crud, filterOrReset)),
  )

  getFilteredCustomersFromBackend$(customers: Customer[], selections: HOMFilters) {
    return of(null).pipe(
      map(() => {
        const filteredCustomers: Customer[] = customers.filter((customer: Customer) => {
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
    return from(arrayOfCustomers).pipe(
      concatMap((customer: Customer) => this.apiService.getAccountsByCustomerIdDelayed$(customer.id).pipe(
                                        map((accounts: Account[]) => ({...customer, accounts}))
      )),
      map((customer: Customer) => ({...customer, 
                                    accountsTotal: customer.accounts?.reduce((total: number, curr: Account) => total + (+curr.balance), 0)})),
      concatMap((customer: Customer) => this.apiService.transactionsForIdDelayed$(customer.id).pipe(
                                        map((tranx: Transaction[]) => ({...customer, 
                                                  lastTransactionDate: tranx.sort(compareValues('transactionDate', 'desc'))[0].transactionDate}))
      )),
      toArray(),
    )
  }
  

  refreshCustomers() {
    this.initializeCustomersSubject.next(true);
  }

}
