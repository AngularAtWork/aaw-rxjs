import { Injectable, inject } from '@angular/core';

import { ApiService } from '../api.service';
import { Observable, concatAll, filter, from, map, toArray } from 'rxjs';
import { Customer } from '../app.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private apiService = inject(ApiService);

  filteredCustomers$: Observable<Customer[]> = this.apiService.allCustomers$
  // .pipe(
  //   map((customers: Customer[]) => from(customers))
  // );
}
