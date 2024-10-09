import { Component, inject, OnInit } from '@angular/core';

import { combineLatest, map, Observable } from 'rxjs';

import { CombineLatestService } from './combine-latest.service';
import { Customer, Jurisdiction } from '../app.model';

@Component({
  selector: 'app-combine-latest',
  templateUrl: './combine-latest.component.html',
  styleUrls: ['./combine-latest.component.scss']
})
export class CombineLatestComponent implements OnInit {
  
  private combineLatestService = inject(CombineLatestService);

  jurisdictions$: Observable<Jurisdiction[]> = this.combineLatestService.allJurisdictions$;
  selections$: Observable<[string, string, string, string]> = this.combineLatestService.currentSelections$;
  filteredCustomers$: Observable<Customer[]> = this.combineLatestService.filteredCustomers$

  ngOnInit(): void {
  }

  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.combineLatestService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.combineLatestService.changeJurisdiction(jurisdiction);
  }

  selectSortProperty(evt: any) {
    const sortProperty = evt.target.value;
    this.combineLatestService.changeSortProperty(sortProperty);
  }

  changeSortOrder(evt: any) {
    const sortOrder = evt.target.value;
    this.combineLatestService.changeSortOrder(sortOrder);
  }
}
