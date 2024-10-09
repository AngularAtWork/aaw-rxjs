import { Injectable, inject } from '@angular/core';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Customer, Jurisdiction, Transaction } from '../app.model';

export interface ForkJoinUI {
  customers: Customer[];
  transactions: Transaction[];
  states: Jurisdiction[];
}

@Injectable({
  providedIn: 'root'
})
export class FinalizeService {

  private apiService = inject(ApiService);


}
