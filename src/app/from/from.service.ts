import { Injectable, inject } from '@angular/core';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Observable, from, map, of } from 'rxjs';
import { Customer } from '../app.model';
import { CUSTOMERS_SAMPLES } from '../app-data';

@Injectable({
  providedIn: 'root'
})
export class FromService {

  private apiService = inject(ApiService);

}
