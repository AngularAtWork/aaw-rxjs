import { Injectable, inject } from '@angular/core';

import { ApiService } from '../api.service';
import { Observable, from, interval, map, of, take } from 'rxjs';
import { Customer, Jurisdiction } from '../app.model';
import { CUSTOMERS_SAMPLES } from '../app-data';

@Injectable({
  providedIn: 'root'
})
export class OfService {

  private apiService = inject(ApiService);

}
