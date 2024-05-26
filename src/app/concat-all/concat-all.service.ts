import { Injectable, inject } from '@angular/core';

import { Observable, concatAll, from, map, tap } from 'rxjs';

import { ApiService } from '../api.service';
import { Customer, Jurisdiction } from '../app.model';

@Injectable({
  providedIn: 'root'
})
export class ConcatAllService {

  private apiService = inject(ApiService);

  filteredCustomers$: Observable<Customer[]> = this.apiService.allCustomers$
  // .pipe(
  //   map((customers: Customer[]) => from(customers)),
  //   concatAll()
  // );

}
