import { Component, OnInit, inject } from '@angular/core';

import { Observable, catchError, combineLatest, map, of, withLatestFrom } from 'rxjs';

import { CustomLoadingService } from './custom-loading.service';
import { AgeFilter, Customer, Jurisdiction } from '../app.model';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-custom-loading',
  templateUrl: './custom-loading.component.html',
  styleUrls: ['./custom-loading.component.scss']
})
export class CustomLoadingComponent implements OnInit {

  private customLoadingService = inject(CustomLoadingService);

  vm$: Observable<HOMVM> = combineLatest([
    this.customLoadingService.allJurisdictions$,
    this.customLoadingService.filteredCustomers$,
    this.customLoadingService.searchText$,
    this.customLoadingService.selectedJurisdiction$,
    this.customLoadingService.selectedAges$,
    this.customLoadingService.showMultiAccountCustomers$
  ]).pipe(
    withLatestFrom(this.customLoadingService.loader$),
    map(([[allJurisdictions, filteredCustomers, searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers], _]: [[Jurisdiction[], Customer[], string, string, AgeFilter, boolean], any]) => {
      return  {
        allJurisdictions,
        filteredCustomers,
        searchText,
        selectedJurisdiction,
        selectedAges,
        showMultiAccountCustomers
      } as HOMVM;
    })
  )

  ngOnInit(): void { 
  }
  
  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.customLoadingService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.customLoadingService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.customLoadingService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.customLoadingService.changeMulti(showMulti);
  }

  reset() {
    this.customLoadingService.resetAllFilters();
  }

  addCustomer() {
    this.customLoadingService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.customLoadingService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.customLoadingService.deleteCustomer(evt);
  }

  refresh() {
    this.customLoadingService.refreshCustomers();
  }
}
