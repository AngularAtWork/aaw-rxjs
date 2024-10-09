import { Component, OnInit, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { Customer } from '../app.model';
import { CustomLogService } from './custom-log.service';

@Component({
  selector: 'app-custom-log',
  templateUrl: './custom-log.component.html',
  styleUrls: ['./custom-log.component.scss']
})
export class CustomLogComponent implements OnInit {

  private customLogService = inject(CustomLogService);

  customers$: Observable<Customer[]> = this.customLogService.displayCustomers$;

  ngOnInit(): void {
  }

}
