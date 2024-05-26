import { Component, OnInit, inject } from '@angular/core';

import { Observable, combineLatest, map } from 'rxjs';

import { Customer, Jurisdiction } from '../app.model';
import { WithLatestFromService } from './with-latest-from.service';

@Component({
  selector: 'app-with-latest-from',
  templateUrl: './with-latest-from.component.html',
  styleUrls: ['./with-latest-from.component.scss']
})
export class WithLatestFromComponent implements OnInit {

  private withLatestFromService = inject(WithLatestFromService);

  jurisdictions$: Observable<Jurisdiction[]> = this.withLatestFromService.allJurisdictions$;
  filteredCustomers$: Observable<Customer[]> = this.withLatestFromService.filteredCustomers$;

  ngOnInit(): void {
  }

  keyupSearchText(evt: any) {
    const searchText: string = (evt.target.value as string).trim();
    this.withLatestFromService.changeSearchText(searchText);
  }

  selectedJurisdiction(evt: any) {
    const jurisdiction = evt.target.value;
    this.withLatestFromService.changeJurisdiction(jurisdiction);
  }

  addCustomer() {
    this.withLatestFromService.addNewCustonmer();
  }

}
