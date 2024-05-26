//#region 
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, concatAll, debounceTime, distinctUntilChanged, filter, first, from, map, merge, Observable, of, share, shareReplay, Subject, take, tap, throttleTime, toArray, withLatestFrom, zip } from 'rxjs';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Account, AgeFilter, Customer, Jurisdiction, TapCallback, Transaction } from '../app.model';
import { compareValues, getAge, log, sortObs } from '../utils';

export interface ZipFilters {
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
export class ZipService {

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

  reset$: Observable<ZipFilters> = zip(
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
      } as ZipFilters
    }),
    tap(() => this.isResettingSubject.next(false)),
  )

  currentSelections$: Observable<ZipFilters> = combineLatest([
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
      } as ZipFilters
    }),
    withLatestFrom(this.isResetting$),
    filter(([filters, isResetting]: [ZipFilters, boolean]) => !isResetting),
    map(([filters, isResetting]: [ZipFilters, boolean]) => filters),
  )

  filterOrReset$: Observable<ZipFilters> = merge(
    this.reset$,
    this.currentSelections$
  )

  filteredCustomers$: Observable<Customer[]> = combineLatest([
    this.crud$,
    this.filterOrReset$
  ]).pipe(
    withLatestFrom(this.currentCustomers$),
    map(([[customers, selections], currentCustomers]: [[Customer[], ZipFilters], Customer[]]) => {
      
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
  )

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

//#endregion


//#region ALTERNATIVE WITHOUT ZIP
// import { inject, Injectable } from '@angular/core';

// import { BehaviorSubject, combineLatest, concatAll, debounceTime, distinctUntilChanged, filter, first, from, map, merge, Observable, of, shareReplay, Subject, take, tap, throttleTime, toArray, withLatestFrom } from 'rxjs';

// import { ApiService, NEW_CUSTOMER } from '../api.service';
// import { Account, AgeFilter, Customer, Jurisdiction, TapCallback, Transaction } from '../app.model';
// import { compareValues, getAge, log, sortObs } from '../utils';

// export interface ZipFilters {
//   searchText: string;
//   selectedJurisdiction: string;
//   selectedAges: AgeFilter;
//   showMultiAccountCustomers: boolean;
// }

// const DEFAULT_SEARCH = '';
// const DEFAULT_JURISDICTION = '(All)';
// const DEFAULT_AGES = 'all';
// const DEFAULT_SHOWMULTI = false;

// export const DEFAULT_FILTERS: ZipFilters = {
//   searchText: DEFAULT_SEARCH,
//   selectedJurisdiction: DEFAULT_JURISDICTION,
//   selectedAges: DEFAULT_AGES,
//   showMultiAccountCustomers: DEFAULT_SHOWMULTI
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ZipService {

//   private currentCustomersSubject = new BehaviorSubject<Customer[]>([]);
//   public currentCustomers$: Observable<Customer[]> = this.currentCustomersSubject.asObservable().pipe(
//     map((customers: Customer[]) => this.addDataToCustomers$(customers)),
//     concatAll(),
//   )

//   private searchTextSubject = new BehaviorSubject<string>(DEFAULT_SEARCH);
//   public searchText$: Observable<string> = this.searchTextSubject.asObservable().pipe(
//     debounceTime(3000),
//     distinctUntilChanged(),
//   )

//   private selectedJurisdictionSubject = new BehaviorSubject<string>(DEFAULT_JURISDICTION);
//   public selectedJurisdiction$: Observable<string> = this.selectedJurisdictionSubject.asObservable().pipe(
//   )

//   private selectedAgesSubject = new BehaviorSubject<AgeFilter>(DEFAULT_AGES);
//   public selectedAges$: Observable<AgeFilter> = this.selectedAgesSubject.asObservable().pipe(
//   )

//   private showMultiAccountCustomersSubject = new BehaviorSubject<boolean>(DEFAULT_SHOWMULTI);
//   public showMultiAccountCustomers$: Observable<boolean> = this.showMultiAccountCustomersSubject.asObservable().pipe(
//   )

//   private addCustomerSubject = new Subject<Customer>();
//   public addCustomer$: Observable<Customer> = this.addCustomerSubject.asObservable().pipe(
//   )

//   private editCustomerSubject = new Subject<Customer>();
//   public editCustomer$: Observable<Customer> = this.editCustomerSubject.asObservable().pipe(
//   )

//   private removeCustomerSubject = new Subject<Customer>();
//   public removeCustomer$: Observable<Customer> = this.removeCustomerSubject.asObservable().pipe(
//   )

//   private isResettingSubject = new BehaviorSubject<Partial<ZipFilters> | null>(null);
//   public isResetting$: Observable<Partial<ZipFilters> | null> = this.isResettingSubject.asObservable();

//   private currentFiltersSubject = new BehaviorSubject<ZipFilters | null>(null);
//   public currentFilters$: Observable<ZipFilters | null> = this.currentFiltersSubject.asObservable();

//   private apiService = inject(ApiService);

//   readCustomers$: Observable<Customer[]> = this.apiService.allCustomers$.pipe(
//     tap((customers: Customer[]) => this.currentCustomersSubject.next(customers)),
//   )

//   createCustomer$: Observable<Customer[]> = this.addCustomer$.pipe(
//     map((newCustomer: Customer) => this.apiService.postCustomer$(newCustomer)),
//     concatAll(),
//     withLatestFrom(this.currentCustomers$),
//     map(([newCustomer, currentCustomers]: [Customer, Customer[]]) => ([...currentCustomers, newCustomer])),
//   )

//   updateCustomer$: Observable<Customer[]> = this.editCustomer$.pipe(
//     map((editedCustomer: Customer) => this.apiService.putCustomer$(editedCustomer).pipe(map(() => editedCustomer))),
//     concatAll(),
//     withLatestFrom(this.currentCustomers$),
//     map(([editedCustomer, currentCustomers]: [Customer, Customer[]]) => {
//       return [
//         ...currentCustomers.filter((customer: Customer) => customer.id !== editedCustomer.id),
//         editedCustomer
//       ];
//     }),
//   )

//   deleteCustomer$: Observable<Customer[]> = this.removeCustomer$.pipe(
//     map((deletedCustomer: Customer) => this.apiService.deleteCustomer$(deletedCustomer.id).pipe(map(() => deletedCustomer))),
//     concatAll(),
//     withLatestFrom(this.currentCustomers$),
//     map(([deletedCustomer, currentCustomers]: [Customer, Customer[]]) => {
//       return [
//         ...currentCustomers.filter((customer: Customer) => customer.id !== deletedCustomer.id),
//       ];
//     }),
//   )

//   crud$: Observable<Customer[]> = merge(
//     this.readCustomers$,
//     this.createCustomer$,
//     this.updateCustomer$,
//     this.deleteCustomer$
//   ).pipe(
//     tap((customers: Customer[]) => this.currentCustomersSubject.next(customers)),
//     shareReplay()
//   )


//   allJurisdictions$: Observable<Jurisdiction[]> = combineLatest([
//     this.crud$,
//     this.apiService.allJurisdictions$
//   ]).pipe(
//     map(([customers, allJurisdictions]: [Customer[], Jurisdiction[]]) => {
//       const customerJurisdictions: string[] = customers.map((customer: Customer) => customer.state.toLocaleUpperCase());
//       return allJurisdictions.filter((jurisdiction: Jurisdiction) => customerJurisdictions.includes(jurisdiction.code.toLocaleUpperCase()))
//     }),
//   )

//   currentSelections$: Observable<ZipFilters> = combineLatest([
//     this.searchText$,
//     this.selectedJurisdiction$,
//     this.selectedAges$,
//     this.showMultiAccountCustomers$
//   ]).pipe(
//     map(([searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers]: [string, string, AgeFilter, boolean]) => {
//       return {
//         searchText,
//         selectedJurisdiction,
//         selectedAges,
//         showMultiAccountCustomers
//       } as ZipFilters
//     }),
//     withLatestFrom(this.currentFilters$),
//     filter(([filters, currentFilters]: [ZipFilters, ZipFilters | null]) => {
//       if (!currentFilters) {
//         this.currentFiltersSubject.next(filters);
//         return true;
//       }
//       const isSame = JSON.stringify(filters) == JSON.stringify(currentFilters);
//       if (!isSame) {
//         this.currentFiltersSubject.next(filters);
//       }
//       return !isSame;
//     }),
//     map(([filters, currentFilters]: [any, any]) => filters),
//     withLatestFrom(this.isResetting$),
//     filter(([filters, isResetting]: [any, any]) => {
//       if (isResetting === null) return true;

//       const defaults: any = DEFAULT_FILTERS;
//       const keys = Object.keys(isResetting);
      
//       return keys.every((filter: string) => filters[filter] === defaults[filter]);
//     }),
//     map(([filters, isResetting]: [ZipFilters, Partial<ZipFilters>]) => filters),
//     tap(() => this.isResettingSubject.next(null)),
//   )

//   filteredCustomers$: Observable<Customer[]> = combineLatest([
//     this.crud$,
//     this.currentSelections$
//   ]).pipe(
//     withLatestFrom(this.currentCustomers$),
//     map(([[customers, selections], currentCustomers]: [[Customer[], ZipFilters], Customer[]]) => {
      
//       const filteredCustomers: Customer[] = currentCustomers.filter((customer: Customer) => {
//         let matchName = false;
//         let matchState = false;
//         let matchAge = false;
//         let matchMulti = false;

//         if (!selections.searchText.trim() || customer.last.toLocaleLowerCase().includes(selections.searchText.toLocaleLowerCase())) {
//           matchName = true;
//         }

//         if (selections.selectedJurisdiction === '(All)' || customer.state === selections.selectedJurisdiction) {
//           matchState = true;
//         }

//         if (selections.selectedAges === 'all' || 
//             (selections.selectedAges === 'under18' && !!customer.age && customer.age < 18) ||
//             (selections.selectedAges === 'over67' && !!customer.age && customer.age > 67)
//           ) {
//             matchAge = true;
//         }

//         if (!selections.showMultiAccountCustomers || selections.showMultiAccountCustomers && !!customer.accounts && customer.accounts?.length > 1) {
//           matchMulti = true;
//         }

//         return matchName && matchState && matchAge && matchMulti;
//       })

//       return filteredCustomers;
//     }),
//     sortObs('last'),
//   )

//   changeSearchText(searchText: string) {
//     this.searchTextSubject.next(searchText);
//   }

//   changeJurisdiction(jurisdiction: string) {
//     this.selectedJurisdictionSubject.next(jurisdiction);
//   }

//   changeAges(ages: AgeFilter) {
//     this.selectedAgesSubject.next(ages);
//   }

//   changeMulti(showMulti: boolean) {
//     this.showMultiAccountCustomersSubject.next(showMulti);
//   }

//   resetAllFilters() {
//     this.isResettingSubject.next(DEFAULT_FILTERS);
//     this.searchTextSubject.next(DEFAULT_SEARCH);
//     this.selectedJurisdictionSubject.next(DEFAULT_JURISDICTION);
//     this.selectedAgesSubject.next(DEFAULT_AGES);
//     this.showMultiAccountCustomersSubject.next(DEFAULT_SHOWMULTI);
//   }

//   addNewCustonmer() {
//     this.addCustomerSubject.next(NEW_CUSTOMER)
//   }

//   updateCustomer(customer: Customer) {
//     const editLabel = '(Edited)';
//     if (customer.first.indexOf(editLabel) === -1) {
//       const editedCustomer = {...customer, first: `${customer.first} ${editLabel}`};
//       this.editCustomerSubject.next(editedCustomer);
//     }
//   }

//   deleteCustomer(customer: Customer) {
//     this.removeCustomerSubject.next(customer);
//   }

//   addDataToCustomers$(arrayOfCustomers: Customer[]): Observable<Customer[]> {
//     return of(arrayOfCustomers).pipe(
//       map((customers: Customer[]) => from(customers)),
//       concatAll(),
//       map((customer: Customer) => ({...customer, age: getAge(customer.birthday)})),
//       map((customer: Customer) => this.apiService.getAccountsByCustomerId$(customer.id).pipe(
//                                         map((accounts: Account[]) => ({...customer, accounts}))
//       )),
//       concatAll(),
//       map((customer: Customer) => ({...customer, 
//                                     accountsTotal: customer.accounts?.reduce((total: number, curr: Account) => total + (+curr.balance), 0)})),
//       map((customer: Customer) => this.apiService.transactionsForId$(customer.id).pipe(
//                                         map((tranx: Transaction[]) => ({...customer, 
//                                                   lastTransactionDate: tranx.sort(compareValues('transactionDate', 'desc'))[0].transactionDate}))
//       )),
//       concatAll(),
//       toArray(),
//     )
//   }

// }

//#endregion