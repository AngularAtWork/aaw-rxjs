import { Injectable, inject } from '@angular/core';

import { ApiService } from '../api.service';
import { Observable, map, tap } from 'rxjs';
import { Customer, TapCallback } from '../app.model';
import { getAge, compareValues, log, sortObs } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class CustomLogService {

  private apiService = inject(ApiService);

  displayCustomers$: Observable<Customer[]> = this.apiService.allCustomers$.pipe(
    log('original', TapCallback.None, 'tan'),
    // tap(allCustomers => console.log('original', allCustomers)),
    map(allCustomers => allCustomers.map(customer => {
      return {...customer, age: getAge(customer.birthday)};
      })
    ),
    log('after getAge', TapCallback.Next),
    // tap(allCustomers => console.log('after getAge', allCustomers)),
    // map(allCustomers => [...allCustomers].sort(compareValues<Customer>('last'))),
    log('after sort', TapCallback.None, '#008000', false),
  );
}
