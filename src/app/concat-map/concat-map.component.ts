import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction, JurisdictionCustomers } from '../app.model';
import { ConcatMapService } from './concat-map.service';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-concat-map',
  templateUrl: './concat-map.component.html',
  styleUrls: ['./concat-map.component.scss']
})
export class ConcatMapComponent implements OnInit {

  private concatMapService = inject(ConcatMapService);

  vm$: Observable<HOMVM> = combineLatest([
    this.concatMapService.allJurisdictions$,
    this.concatMapService.filteredCustomers$,
    this.concatMapService.searchText$,
    this.concatMapService.selectedJurisdiction$,
    this.concatMapService.selectedAges$,
    this.concatMapService.showMultiAccountCustomers$
  ]).pipe(
    map(([allJurisdictions, filteredCustomers, searchText, selectedJurisdiction, selectedAges, showMultiAccountCustomers]: [Jurisdiction[], Customer[], string, string, AgeFilter, boolean]) => {
      return {
        allJurisdictions,
        filteredCustomers,
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
    this.concatMapService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.concatMapService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.concatMapService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.concatMapService.changeMulti(showMulti);
  }

  reset() {
    this.concatMapService.resetAllFilters();
  }

  addCustomer() {
    this.concatMapService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.concatMapService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.concatMapService.deleteCustomer(evt);
  }

}
