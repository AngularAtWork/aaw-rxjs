import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction, JurisdictionCustomers } from '../app.model';
import { ExhaustMapService } from './exhaust-map.service';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-exhaust-map',
  templateUrl: './exhaust-map.component.html',
  styleUrls: ['./exhaust-map.component.scss']
})
export class ExhaustMapComponent implements OnInit {

  private exhaustMapService = inject(ExhaustMapService);

  vm$: Observable<HOMVM> = combineLatest([
    this.exhaustMapService.allJurisdictions$,
    this.exhaustMapService.filteredCustomers$,
    this.exhaustMapService.searchText$,
    this.exhaustMapService.selectedJurisdiction$,
    this.exhaustMapService.selectedAges$,
    this.exhaustMapService.showMultiAccountCustomers$
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
    this.exhaustMapService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.exhaustMapService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.exhaustMapService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.exhaustMapService.changeMulti(showMulti);
  }

  reset() {
    this.exhaustMapService.resetAllFilters();
  }

  addCustomer() {
    this.exhaustMapService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.exhaustMapService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.exhaustMapService.deleteCustomer(evt);
  }

  refresh() {
    this.exhaustMapService.refreshCustomers();
  }

}
