import { Component, OnInit, inject } from '@angular/core';

import { Observable, of, tap, timer, combineLatest, interval, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction } from '../app.model';
import { HowToCreationOperatorService } from './how-to-creation-operator.service';
import { timeObservable } from '../utils';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-how-to-creation-operator',
  templateUrl: './how-to-creation-operator.component.html',
  styleUrls: ['./how-to-creation-operator.component.scss']
})
export class HowToCreationOperatorComponent implements OnInit {

  private howToCreationOperatorService = inject(HowToCreationOperatorService);

  vm$: Observable<HOMVM> = combineLatest([
    this.howToCreationOperatorService.allJurisdictions$,
    this.howToCreationOperatorService.filteredCustomers$,
    this.howToCreationOperatorService.searchText$,
    this.howToCreationOperatorService.selectedJurisdiction$,
    this.howToCreationOperatorService.selectedAges$,
    this.howToCreationOperatorService.showMultiAccountCustomers$
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
    this.howToCreationOperatorService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.howToCreationOperatorService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.howToCreationOperatorService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.howToCreationOperatorService.changeMulti(showMulti);
  }

  reset() {
    this.howToCreationOperatorService.resetAllFilters();
  }

  addCustomer() {
    this.howToCreationOperatorService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.howToCreationOperatorService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.howToCreationOperatorService.deleteCustomer(evt);
  }

  refresh() {
    this.howToCreationOperatorService.refreshCustomers();
  }


}
