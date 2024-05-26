import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction } from '../app.model';
import { CatchErrorService } from './catch-error.service';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-catch-error',
  templateUrl: './catch-error.component.html',
  styleUrls: ['./catch-error.component.scss']
})
export class CatchErrorComponent implements OnInit {
  
  private catchErrorService = inject(CatchErrorService);

  vm$: Observable<HOMVM> = combineLatest([
    this.catchErrorService.allJurisdictions$,
    this.catchErrorService.filteredCustomers$,
    this.catchErrorService.searchText$,
    this.catchErrorService.selectedJurisdiction$,
    this.catchErrorService.selectedAges$,
    this.catchErrorService.showMultiAccountCustomers$
  ]).pipe(
    map(([allJurisdictions, filteredCustomers, searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers]: [Jurisdiction[], Customer[], string, string, AgeFilter, boolean]) => {
      return {
        allJurisdictions,
        filteredCustomers,
        searchText,
        selectedJurisdiction,
        selectedAges,
        showMultiAccountCustomers
      } as HOMVM
    })
  )

  ngOnInit(): void { 
  }
  
  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.catchErrorService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.catchErrorService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.catchErrorService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.catchErrorService.changeMulti(showMulti);
  }

  reset() {
    this.catchErrorService.resetAllFilters();
  }

  addCustomer() {
    this.catchErrorService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.catchErrorService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.catchErrorService.deleteCustomer(evt);
  }

  refresh() {
    this.catchErrorService.refreshCustomers();
  }
}
