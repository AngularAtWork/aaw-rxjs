import { Component, OnInit, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { Account, Customer } from '../app.model';
import { TapService } from './tap.service';
import { ApiService } from '../api.service';
import { getAge } from '../utils';

@Component({
  selector: 'app-tap',
  templateUrl: './tap.component.html',
  styleUrls: ['./tap.component.scss']
})
export class TapComponent implements OnInit {

  private tapService = inject(TapService);

  results$!: Observable<Customer[]>;
  vm$: Observable<Customer[]> = this.tapService.displayCustomers$;
  
  ngOnInit(): void {
  }

}
