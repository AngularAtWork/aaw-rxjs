import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction, JurisdictionCustomers } from '../app.model';
import { SwitchMapService } from './switch-map.service';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-switch-map',
  templateUrl: './switch-map.component.html',
  styleUrls: ['./switch-map.component.scss']
})
export class SwitchMapComponent implements OnInit {

  private switchMapService = inject(SwitchMapService);

  vm$: Observable<HOMVM> = combineLatest([
    this.switchMapService.allJurisdictions$,
    this.switchMapService.filteredCustomers$,
    this.switchMapService.searchText$,
    this.switchMapService.selectedJurisdiction$,
    this.switchMapService.selectedAges$,
    this.switchMapService.showMultiAccountCustomers$
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
    this.switchMapService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.switchMapService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.switchMapService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.switchMapService.changeMulti(showMulti);
  }

  reset() {
    this.switchMapService.resetAllFilters();
  }

  addCustomer() {
    this.switchMapService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.switchMapService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.switchMapService.deleteCustomer(evt);
  }

}
