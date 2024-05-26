import { Component, OnInit, inject } from '@angular/core';

import { BehaviorSubject, Observable, concatAll, filter, from, map } from 'rxjs';

import { Customer } from '../app.model';
import { FilterService } from './filter.service';
import { log } from '../utils';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  private filterService = inject(FilterService);

  customers$: Observable<Customer[]> = this.filterService.filteredCustomers$;

  ngOnInit(): void {
  }

}
