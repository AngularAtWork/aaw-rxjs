import { Component, OnInit, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { Customer, Jurisdiction } from '../app.model';
import { CustomSortService } from './custom-sort.service';
import { NEW_CUSTOMER } from '../api.service';
import { sortObs } from '../utils';

@Component({
  selector: 'app-custom-sort',
  templateUrl: './custom-sort.component.html',
  styleUrls: ['./custom-sort.component.scss']
})
export class CustomSortComponent implements OnInit {

  private customSortService = inject(CustomSortService);

  customers$: Observable<Customer[]> = this.customSortService.displayCustomers$;

  ngOnInit(): void {
    of([{code: 'NY', name: 'New York'}, {code: 'NJ', name: 'New Jersey'}]).pipe(
      sortObs<Jurisdiction>('name')
    )
  }

}
