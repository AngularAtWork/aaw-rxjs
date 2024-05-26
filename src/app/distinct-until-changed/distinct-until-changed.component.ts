import { Component, OnInit, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { Customer, Jurisdiction } from '../app.model';
import { DistinctUntilChangedService } from './distinct-until-changed.service';

@Component({
  selector: 'app-distinct-until-changed',
  templateUrl: './distinct-until-changed.component.html',
  styleUrls: ['./distinct-until-changed.component.scss']
})
export class DistinctUntilChangedComponent implements OnInit {

  private distinctUntilChangedService = inject(DistinctUntilChangedService);

  jurisdictions$: Observable<Jurisdiction[]> = this.distinctUntilChangedService.allJurisdictions$;
  filteredCustomers$: Observable<Customer[]> = this.distinctUntilChangedService.filteredCustomers$

  ngOnInit(): void {
  }

  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.distinctUntilChangedService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.distinctUntilChangedService.changeJurisdiction(jurisdiction);
  }

  selectSortProperty(evt: any) {
    const sortProperty = evt.target.value;
    this.distinctUntilChangedService.changeSortProperty(sortProperty);
  }

  changeSortOrder(evt: any) {
    const sortOrder = evt.target.value;
    this.distinctUntilChangedService.changeSortOrder(sortOrder);
  }
}
