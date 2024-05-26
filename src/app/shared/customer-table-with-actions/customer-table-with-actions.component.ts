import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Customer } from 'src/app/app.model';

@Component({
  selector: 'app-customer-table-with-actions',
  templateUrl: './customer-table-with-actions.component.html',
  styleUrls: ['./customer-table-with-actions.component.scss']
})
export class CustomerTableWithActionsComponent implements OnInit {
  @Input()
  customers!: Customer[] | null;

  @Output() removeCustomer = new EventEmitter<Customer>();
  @Output() editCustomer = new EventEmitter<Customer>();

  ngOnInit(): void {
  }

  update(customer: Customer) {
    this.editCustomer.emit(customer);
  }

  delete(customer: Customer) {
    this.removeCustomer.emit(customer);
  }

}
