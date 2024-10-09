import { Component, Input, OnInit } from '@angular/core';
import { Customer } from 'src/app/app.model';

@Component({
  selector: 'app-customer-table-simple',
  templateUrl: './customer-table-simple.component.html',
  styleUrls: ['./customer-table-simple.component.scss']
})
export class CustomerTableSimpleComponent implements OnInit {
  @Input()
  customers!: Customer[] | null;

  ngOnInit(): void {
  }

}
