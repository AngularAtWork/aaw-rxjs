import { Injectable, inject } from '@angular/core';

import { ApiService } from '../api.service';
import { Observable, interval, map, take, tap } from 'rxjs';
import { Customer } from '../app.model';
import { getAge, compareValues } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class TapService {
  
  private apiService = inject(ApiService);

  // tapDemos$: Observable<any> = interval(1500)
  // .pipe(
  //   take(5),
  //   tap({
  //  // Inherited from Observer interface
  //     next: value => console.log('emitted:', value),
  //     complete: () => console.log('COMPLETED'),
  //     error: err => console.log('ERRORED', err.message),

  //  // TapObserver only
  //     subscribe: () => console.log('SUBSCRIBED'),
  //     unsubscribe: () => console.log('UNSUBSCRIBED'),
  //     finalize: () => console.log('FINALIZED'),
  //   }),
  // );

  displayCustomers$: Observable<Customer[]> = this.apiService.allCustomers$.pipe(
    tap(allCustomers => console.log('original', allCustomers)),
    map(allCustomers => allCustomers.map(customer => {
      return {...customer, age: getAge(customer.birthday)};
      })
    ),
    tap(allCustomers => console.log('after getAge', allCustomers)),
    map(allCustomers => [...allCustomers].sort(compareValues('last'))),
    tap(allCustomers => console.log('after sort', allCustomers)),
  );
}
