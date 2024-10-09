import { Component, Input, OnInit } from '@angular/core';

import { Customer } from '../../app.model';

@Component({
  selector: 'app-customer-card',
  templateUrl: './customer-card.component.html',
  styleUrls: ['./customer-card.component.scss']
})
export class CustomerCardComponent implements OnInit {
  @Input()
  customer!: Customer;

  accountMapping: {[k: string]: string} = {'=1': '1 account', 'other': '# accounts'};

  ngOnInit() {
  }

}
