import { Component, OnInit, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { Customer, Jurisdiction } from '../app.model';
import { DebounceTimeService } from './debounce-time.service';

@Component({
  selector: 'app-debounce-time',
  templateUrl: './debounce-time.component.html',
  styleUrls: ['./debounce-time.component.scss']
})
export class DebounceTimeComponent implements OnInit {

  private debounceTimeService = inject(DebounceTimeService);

  jurisdictions$: Observable<Jurisdiction[]> = this.debounceTimeService.allJurisdictions$;
  filteredCustomers$: Observable<Customer[]> = this.debounceTimeService.filteredCustomers$

  ngOnInit(): void {
  }

  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.debounceTimeService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.debounceTimeService.changeJurisdiction(jurisdiction);
  }

  selectSortProperty(evt: any) {
    const sortProperty = evt.target.value;
    this.debounceTimeService.changeSortProperty(sortProperty);
  }

  changeSortOrder(evt: any) {
    const sortOrder = evt.target.value;
    this.debounceTimeService.changeSortOrder(sortOrder);
  }
}
