import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction, JurisdictionCustomers } from '../app.model';
import { MergeMapService } from './merge-map.service';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  customersGroupedByJurisdiction: JurisdictionCustomers[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-merge-map',
  templateUrl: './merge-map.component.html',
  styleUrls: ['./merge-map.component.scss']
})
export class MergeMapComponent implements OnInit {

  private mergeMapService = inject(MergeMapService);

  vm$: Observable<HOMVM> = combineLatest([
    this.mergeMapService.allJurisdictions$,
    this.mergeMapService.filteredCustomersByJurisdiction$,
    this.mergeMapService.searchText$,
    this.mergeMapService.selectedJurisdiction$,
    this.mergeMapService.selectedAges$,
    this.mergeMapService.showMultiAccountCustomers$
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

  }
  
  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.mergeMapService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.mergeMapService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.mergeMapService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.mergeMapService.changeMulti(showMulti);
  }

  reset() {
    this.mergeMapService.resetAllFilters();
  }

  addCustomer() {
    this.mergeMapService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.mergeMapService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.mergeMapService.deleteCustomer(evt);
  }

}
