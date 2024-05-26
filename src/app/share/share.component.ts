import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { Observable, Subscription, combineLatest, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction } from '../app.model';
import { ShareService } from './share.service';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit, OnDestroy {

  private shareService = inject(ShareService);

  vm$: Observable<HOMVM> = combineLatest([
    this.shareService.allJurisdictions$,
    this.shareService.filteredCustomers$,
    this.shareService.searchText$,
    this.shareService.selectedJurisdiction$,
    this.shareService.selectedAges$,
    this.shareService.showMultiAccountCustomers$
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

  lateSubs!: Subscription;

  ngOnInit(): void { 

    setTimeout(() => {
      console.log('late subscriber');
      this.lateSubs = this.shareService.crud$.subscribe({
        next: value => console.log('late subscriber gets: ', value)
      });
    }, 5000);

  }
  
  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.shareService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.shareService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.shareService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.shareService.changeMulti(showMulti);
  }

  reset() {
    this.shareService.resetAllFilters();
  }

  addCustomer() {
    this.shareService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.shareService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.shareService.deleteCustomer(evt);
  }

  refresh() {
    this.shareService.refreshCustomers();
  }

  ngOnDestroy(): void {

    if (!!this.lateSubs) {
      this.lateSubs.unsubscribe();
    }
  }

}
