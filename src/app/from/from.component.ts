import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { Observable, from } from 'rxjs';

import { Customer } from '../app.model';
import { FromService } from './from.service';
import { CUSTOMERS_SAMPLES } from '../app-data';

@Component({
  selector: 'app-from',
  templateUrl: './from.component.html',
  styleUrls: ['./from.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FromComponent implements OnInit {

  private fromService = inject(FromService);

  // Emits individual elements of an Array
  anArray = ['A', null, 4];

  // Coverts a Promise to an Observable
  aPromise = new Promise(resolve => resolve('hello'));

  // A String
  aString = 'world';

  // API return array of Customers
  customers = CUSTOMERS_SAMPLES;

  item$: Observable<any> = from(this.customers);

  ngOnInit(): void {
    this.item$.subscribe({
      next: value => console.log(value),
      complete: () => console.log('COMPLETED')
    })
  }
}
