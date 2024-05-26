import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { Customer, Jurisdiction } from '../app.model';
import { MergeService } from './merge.service';

export interface MergeVM {
  allJurisdictions: Jurisdiction[];
  filteredCustomers: Customer[];
  searchText: string;
  selectedJurisdiction: string;
}

@Component({
  selector: 'app-merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.scss']
})
export class MergeComponent implements OnInit {

  private mergeService = inject(MergeService);

  vm$: Observable<MergeVM> = combineLatest([
    this.mergeService.allJurisdictions$,
    this.mergeService.filteredCustomers$,
    this.mergeService.searchText$,
    this.mergeService.selectedJurisdiction$
  ]).pipe(
    map(([allJurisdictions, filteredCustomers, searchText, selectedJurisdiction]: [Jurisdiction[], Customer[], string, string]) => {
      return {
        allJurisdictions,
        filteredCustomers,
        searchText,
        selectedJurisdiction
      }
    })
  )


  ngOnInit(): void {
  }

  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.mergeService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.mergeService.changeJurisdiction(jurisdiction);
  }

  addCustomer() {
    this.mergeService.addNewCustonmer();
  }

  editCustomer(evt: Customer) {
    this.mergeService.updateCustomer(evt);
  }

  removeCustomer(evt: Customer) {
    this.mergeService.deleteCustomer(evt);
  }

}
