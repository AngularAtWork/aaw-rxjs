import { Injectable, inject } from '@angular/core';

import { ApiService } from '../api.service';
import { Observable, map } from 'rxjs';
import { compareValues, getAge } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private apiService = inject(ApiService);

  displayCustomers1$: Observable<any[]> = this.apiService.allCustomers$.pipe(
    map(allCustomers => allCustomers.map(customer => {
      const {accountsTotal, ...rest} = customer;
      return rest;
    })),
    map(allCustomers => allCustomers.map(customer => {
      const {address, ...rest} = customer;
      return rest;
      })
    ),
    map(allCustomers => allCustomers.map(customer => {
      const {city, ...rest} = customer;
      return rest;
      })
    ),
    map(allCustomers => allCustomers.map(customer => {
      const {email, ...rest} = customer;
      return rest;
      })
    ),
    map(allCustomers => allCustomers.map(customer => {
      const {zip, ...rest} = customer;
      return rest;
      })
    ),
    map(allCustomers => allCustomers.map(customer => {
      return {...customer, first: `${customer.first.split('').slice(0,1)}.`};
      })
    ),
    map(allCustomers => allCustomers.map(customer => {
      return {...customer, last: customer.last.toLocaleUpperCase()};
      })
    ),
    map(allCustomers => allCustomers.map(customer => {
      return {...customer, id: customer.id.replace(/(\d{3})(\d{3})(\d{2})/, "$1-$2-$3")};
      })
    ),
    map(allCustomers => allCustomers.map(customer => {
      return {...customer, age: getAge(customer.birthday)};
      })
    ),
  );
    
    displayCustomers$: Observable<any[]> = this.displayCustomers1$.pipe(
      map(allCustomers => [...allCustomers].sort(compareValues('last'))),
    )
}
