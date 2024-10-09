import { Component, Input, OnInit } from '@angular/core';
import { Customer } from 'src/app/app.model';

@Component({
  selector: 'app-customer-table',
  templateUrl: './customer-table.component.html',
  styleUrls: ['./customer-table.component.scss']
})
export class CustomerTableComponent implements OnInit {
  @Input()
  customers!: Customer[] | null;

  ngOnInit(): void {
  }

}
