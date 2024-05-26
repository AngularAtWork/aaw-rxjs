import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, interval, map, of, take, zip } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction, TapCallback } from '../app.model';
import { ZipService } from './zip.service';
import { log } from '../utils';

export interface ZipVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-zip',
  templateUrl: './zip.component.html',
  styleUrls: ['./zip.component.scss']
})
export class ZipComponent implements OnInit {

  private zipService = inject(ZipService);

  vm$: Observable<ZipVM> = combineLatest([
    this.zipService.allJurisdictions$,
    this.zipService.filteredCustomers$,
    this.zipService.searchText$,
    this.zipService.selectedJurisdiction$,
    this.zipService.selectedAges$,
    this.zipService.showMultiAccountCustomers$
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

    // TEST OF ZIP OPERATOR
    //#region 
    // const obs1 = interval(1000).pipe(map(() => 'A'), log('obs1', TapCallback.All, 'orange', false));
    // const obs2 = interval(500).pipe(take(3), map(() => 'B'), log('obs2', TapCallback.All, 'gray', false));
    // const obs3 = interval(2000).pipe(map(() => 'C'), log('obs3', TapCallback.All, 'green', false));
    // const obs4 = interval(3000).pipe(take(2), map(() => 'D'), log('obs2', TapCallback.All, 'gray', false));

    // const zipObs = zip(obs1, obs2, obs3, obs4).pipe(log('zipObs', TapCallback.All, 'navy', false));

    // zipObs.subscribe();
    //#endregion
  }

  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.zipService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.zipService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.zipService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.zipService.changeMulti(showMulti);
  }

  reset() {
    this.zipService.resetAllFilters();
  }

  addCustomer() {
    this.zipService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.zipService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.zipService.deleteCustomer(evt);
  }
}
