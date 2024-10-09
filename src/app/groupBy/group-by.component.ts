import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { GroupByOptionsWithElement, Observable, ReplaySubject, combineLatest, concatAll, first, from, groupBy, map, mergeAll, of, tap, toArray, zip } from 'rxjs';

import { Account, AgeFilter, Customer, Jurisdiction, JurisdictionCustomers } from '../app.model';
import { GroupByService } from './group-by.service';
import { compareValues, createGroupedObjectsFromObservable, log, sortObs } from '../utils';
import { CUSTOMERS_SAMPLES } from '../app-data';
import { ApiService } from '../api.service';

export interface GroupByVM {
  allJurisdictions: Jurisdiction[];
  customersGroupedByJurisdiction: JurisdictionCustomers[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-group-by',
  templateUrl: './group-by.component.html',
  styleUrls: ['./group-by.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupByComponent implements OnInit {

  private groupByService = inject(GroupByService);
  private apiService = inject(ApiService);

  vm$: Observable<GroupByVM> = combineLatest([
    this.groupByService.allJurisdictions$,
    this.groupByService.filteredCustomersByJurisdiction$,
    this.groupByService.searchText$,
    this.groupByService.selectedJurisdiction$,
    this.groupByService.selectedAges$,
    this.groupByService.showMultiAccountCustomers$
  ]).pipe(
    map(([allJurisdictions, customersGroupedByJurisdiction, searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers]: [Jurisdiction[], JurisdictionCustomers[], string, string, AgeFilter, boolean]) => {
      return {
        allJurisdictions,
        customersGroupedByJurisdiction,
        searchText,
        selectedJurisdiction,
        selectedAges,
        showMultiAccountCustomers
      }
    }),
  )

  ngOnInit(): void { 

    interface Auto {
      year: number;
      type: string;
      price: number;
    }

    const autos$: Observable<Auto> = of(
      {year: 2021, type: 'SUV', price: 15000},
      {year: 2023, type: 'Sedan', price: 13000},
      {year: 2022, type: 'Truck', price: 24000},
      {year: 2021, type: 'Sedan', price: 32000},
      {year: 2022, type: 'Coupe', price: 42000},
      {year: 2023, type: 'SUV', price: 38000},
    )

    const groupingFn = (auto: Auto) => {
          switch (true) {
            case auto.price < 20000:
              return 'Less Than $20,000'
            case (auto.price >= 20000) && (auto.price <= 40000):
              return 'Between $20,000 And $40,000'
            case auto.price > 40000:
              return 'Greater Than $40,000'
            default:
              return 'Unknown'
          }
    }
    const groupedAutos$: Observable<any> = createGroupedObjectsFromObservable(autos$, groupingFn);

    groupedAutos$.subscribe({
      next: result => console.log(result)
    })

  }
  
  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.groupByService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.groupByService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.groupByService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.groupByService.changeMulti(showMulti);
  }

  reset() {
    this.groupByService.resetAllFilters();
  }

  addCustomer() {
    this.groupByService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.groupByService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.groupByService.deleteCustomer(evt);
  }
}
