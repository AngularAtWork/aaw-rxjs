import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { AgeFilter, Customer, Jurisdiction } from '../app.model';
import { ScanService } from './scan.service';

export interface HOMVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
  selectedAges: AgeFilter;
  showMultiAccountCustomers: boolean;
}

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScanComponent implements OnInit {

  private scanService = inject(ScanService);

  vm$: Observable<HOMVM> = combineLatest([
    this.scanService.allJurisdictions$,
    this.scanService.filteredCustomers$,
    this.scanService.searchText$,
    this.scanService.selectedJurisdiction$,
    this.scanService.selectedAges$,
    this.scanService.showMultiAccountCustomers$
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
    this.scanService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.scanService.changeJurisdiction(jurisdiction);
  }

  selectedAges(evt: any) {
    const ages = (evt.target.value as AgeFilter);
    this.scanService.changeAges(ages);
  }

  selectedShowMulti(evt: any) {
    const showMulti = evt.target.checked;
    this.scanService.changeMulti(showMulti);
  }

  reset() {
    this.scanService.resetAllFilters();
  }

  addCustomer() {
    this.scanService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.scanService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.scanService.deleteCustomer(evt);
  }

  refresh() {
    this.scanService.refreshCustomers();
  }

}
