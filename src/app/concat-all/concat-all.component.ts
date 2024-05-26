import { Component, OnInit, inject } from '@angular/core';

import { Observable, concatAll, filter, from, interval, map, of, take } from 'rxjs';

import { Customer } from '../app.model';
import { ConcatAllService } from './concat-all.service';
import { log } from '../utils';

@Component({
  selector: 'app-concat-all',
  templateUrl: './concat-all.component.html',
  styleUrls: ['./concat-all.component.scss']
})
export class ConcatAllComponent implements OnInit {
  
  private concatAllService = inject(ConcatAllService);

  customers$: Observable<Customer[]> = this.concatAllService.filteredCustomers$;

  ngOnInit(): void {

    this.concatAllService.filteredCustomers$
    .pipe(
      map((customers: Customer[]) => from(customers)),
      concatAll(),
      filter((customer: Customer) => customer.state === 'OH'),
      log('concatAll subscribed to from', undefined, undefined, false)
    ).subscribe();

    // const concatAllDemo$ = of('Source A', 'Source B', 'Source C').pipe(
    //   map(source => interval(1000).pipe(map(num => `${source} with Inner ${num}`), take(3))),
    //   concatAll()
    // )
    //  concatAllDemo$.subscribe({
    //   next: value => console.log(value),
    //   complete: () => console.log('concatAllDemo$ COMPLETED')
    //  })
  }

}
