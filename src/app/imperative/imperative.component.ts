import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Account, Customer, Transaction } from '../app.model';
import { compareValues } from '../utils';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-imperative',
  templateUrl: './imperative.component.html',
  styleUrls: ['./imperative.component.scss'],
})
export class ImperativeComponent implements OnInit {

  private apiService = inject(ApiService);
  private loadingService = inject(LoadingService);
  private ref = inject(ChangeDetectorRef);
  
  customers: Customer[] = [];
  
  ngOnInit(): void {
    this.loadCustomers();
  }
  
  addCustomer() { 
    this.apiService.postCustomer$(NEW_CUSTOMER).subscribe();
    this.loadCustomers();
  }

  loadCustomers() {
    this.apiService.allCustomers$.subscribe({
      next: (allCustomers: Customer[]) => {
        allCustomers.sort(compareValues('last', 'asc'));
        let customerCount = 0;
        allCustomers.forEach((customer: Customer) => {
          this.apiService.getAccountsByCustomerId$(customer.id).subscribe({
            next: (customerAccounts: Account[]) => {
              customerCount++;
              customer.accounts = customerAccounts;
              if (customerCount === allCustomers.length) {
                this.customers = allCustomers;
              }
            }
          })
        })
      }
    });
  }
  
}
