import { Injectable, inject } from '@angular/core';
import { ApiService, NEW_CUSTOMER } from '../api.service';
import { BehaviorSubject, Observable, Subject, combineLatest, concatMap, debounceTime, filter, map, merge, tap, withLatestFrom, zip } from 'rxjs';
import { Customer, Jurisdiction } from '../app.model';
import { sortObs } from '../utils';

export interface Filters {
  searchText: string;
  selectedState: string;
}

const DEFAULT_STATE = '(All)';
const DEFAULT_SEARCH = '';

@Injectable({
  providedIn: 'root'
})
export class SubjectsContinuedService {

  private apiService: ApiService = inject(ApiService);

  private selectedStateSubject = new BehaviorSubject<string>(DEFAULT_STATE);
  
  private searchTextSubject = new BehaviorSubject<string>(DEFAULT_SEARCH);
  
  private startCreateSubject = new Subject<Customer>();
  
  private startEditSubject = new Subject<Customer>();
  
  private startDeleteSubject = new Subject<string>();
  
  private isResettingSubject = new BehaviorSubject<boolean>(false);
  
  //#region 
  public selectedState$: Observable<string> = this.selectedStateSubject.asObservable();
  public searchText$: Observable<string> = this.searchTextSubject.asObservable().pipe(
    debounceTime(500)
  );
  public startCreate$:Observable<Customer> = this.startCreateSubject.asObservable();
  public startEdit$: Observable<Customer> = this.startEditSubject.asObservable();
  public startDelete$: Observable<string> = this.startDeleteSubject.asObservable();
  initialCustomers$: Observable<Customer[]> = this.apiService.allCustomersWithAllData$;

  disableReset$: Observable<boolean> = combineLatest([
    this.selectedState$,
    this.searchText$
  ]).pipe(
    map(([selectedState, searchText]: [string, string]) => selectedState === DEFAULT_STATE && searchText === DEFAULT_SEARCH),
  )

  createCustomer$: Observable<Customer> = this.startCreate$.pipe(
    concatMap((newCustomer: Customer) => this.apiService.postCustomer$(newCustomer)),
  )

  editCustomer$: Observable<Customer> = this.startEdit$.pipe(
    concatMap((customerWithUpdates: Customer) => {
      return this.apiService.putCustomer$(customerWithUpdates).pipe(
        map(() => customerWithUpdates)
      );
    })
  )

  deleteCustomer$: Observable<null> = this.startDelete$.pipe(
    concatMap((customerId: string) => this.apiService.deleteCustomer$(customerId)),
  )

  unfilteredCustomers$: Observable<Customer[]> = merge(
    this.initialCustomers$,
    this.createCustomer$,
    this.editCustomer$,
    this.deleteCustomer$
  ).pipe(
    concatMap(() => this.apiService.allCustomersWithAllData$),
    sortObs('last'),
  )
  
  statesWithCustomers$: Observable<Jurisdiction[]> = combineLatest([
    this.unfilteredCustomers$,
    this.apiService.allJurisdictions$
  ]).pipe(
    map(([customers, allStates]: [Customer[], Jurisdiction[]]) => {
      const statesWithCustomers = customers.map(customer => customer.state);
      const uniqueStates = [...new Set(statesWithCustomers)];
      return allStates.filter((state: Jurisdiction) => uniqueStates.includes(state.code));
    })
  )

  reset$: Observable<Filters> = zip([
    this.searchText$.pipe(filter(searchText => searchText === DEFAULT_SEARCH)),
    this.selectedState$.pipe(filter(selectedState => selectedState === DEFAULT_STATE))
  ]).pipe(
    map(([searchText, selectedState]) => {
      return {
        searchText,
        selectedState
      }
    }),
    tap(() => this.isResettingSubject.next(false))
  )

  filter$: Observable<Filters> = combineLatest([
    this.selectedState$,
    this.searchText$
  ]).pipe(
    withLatestFrom(this.isResettingSubject),
    filter(([[selectedState, searchText], isResetting]: [[string, string], boolean]) => !isResetting),
    map(([[selectedState, searchText], isResetting]: [[string, string], boolean]) => {
      return {
        searchText,
        selectedState
      }
    })
  )

  filterOrReset$: Observable<Filters> = merge(
    this.reset$,
    this.filter$
  )

  filteredCustomers$: Observable<Customer[]> = combineLatest([
    this.unfilteredCustomers$,
    this.filterOrReset$
  ]).pipe(
    map(([customers, filters]: [Customer[], Filters]) => {
      let filteredCustomers = customers;
      if (filters.selectedState !== DEFAULT_STATE) {
        filteredCustomers = filteredCustomers.filter(customer => customer.state === filters.selectedState);
      }

      if (filters.searchText.trim() !== DEFAULT_SEARCH) {
        filteredCustomers = filteredCustomers.filter(customer => customer.last.toLocaleLowerCase().indexOf(filters.searchText.toLocaleLowerCase()) > -1);
      }

      return filteredCustomers;
    }),
  )

  createNewCustomer() {
    this.startCreateSubject.next(NEW_CUSTOMER);
  }

  editCustomerName(customer: Customer) {
    const edited: Customer = {...customer, first: `${customer.first} (Edited)`};
    this.startEditSubject.next(edited);
  }

  deleteCustomer(customer: Customer) {
    this.startDeleteSubject.next(customer.id);
  }

  changeState(selectedState: string) {
    this.selectedStateSubject.next(selectedState);
  }

  changeSearchText(searchText: string) {
    this.searchTextSubject.next(searchText);
  }

  resetFilters() {
    this.isResettingSubject.next(true);
    this.searchTextSubject.next(DEFAULT_SEARCH);
    this.selectedStateSubject.next(DEFAULT_STATE);
  }
  //#endregion
}
