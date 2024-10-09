import { Component, OnInit, inject } from '@angular/core';

import { Observable, interval, take, toArray } from 'rxjs';

import { Customer, TapCallback } from '../app.model';
import { ToArrayService } from './to-array.service';
import { log } from '../utils';

@Component({
  selector: 'app-to-array',
  templateUrl: './to-array.component.html',
  styleUrls: ['./to-array.component.scss']
})
export class ToArrayComponent implements OnInit {

  private toArrayService = inject(ToArrayService);

  customers$: Observable<Customer[]> = this.toArrayService.filteredCustomers$;

  ngOnInit(): void {

    // const toArrayDemo$ = interval(1000).pipe(
    //   take(3),
    //   log('interval', TapCallback.All),
    //   toArray(),
    //   log('toArray', TapCallback.Next)
    // )

    // toArrayDemo$.subscribe()

  }

}
