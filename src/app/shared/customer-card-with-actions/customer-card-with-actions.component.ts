import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Customer } from '../../app.model';

@Component({
  selector: 'app-customer-card-with-actions',
  templateUrl: './customer-card-with-actions.component.html',
  styleUrls: ['./customer-card-with-actions.component.scss']
})
export class CustomerCardWithActionsComponent implements OnInit {
  @Input()
  customer!: Customer;

  @Output() removeCustomer = new EventEmitter<Customer>();
  @Output() editCustomer = new EventEmitter<Customer>();

  accountMapping: {[k: string]: string} = {'=1': '1 account', 'other': '# accounts'};

  ngOnInit() {
  }

  update(customer: Customer) {
    this.editCustomer.emit(customer);
  }

  delete(customer: Customer) {
    this.removeCustomer.emit(customer);
  }

}
