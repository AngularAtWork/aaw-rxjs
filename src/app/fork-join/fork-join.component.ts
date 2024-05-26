import { Component, OnInit, inject } from '@angular/core';

import { BehaviorSubject, Observable, forkJoin, from, interval, of } from 'rxjs';

import { Customer, TapCallback, Transaction } from '../app.model';
import { ForkJoinService,  } from './fork-join.service';
import { ApiService, NEW_CUSTOMER } from '../api.service';
import { log } from '../utils';

@Component({
  selector: 'app-fork-join',
  templateUrl: './fork-join.component.html',
  styleUrls: ['./fork-join.component.scss']
})
export class ForkJoinComponent implements OnInit {

  private forkJoinService = inject(ForkJoinService);
  private apiService = inject(ApiService);

  customers$: Observable<Customer[]> = this.forkJoinService.customersWithAccounts$;

  ngOnInit(): void {

    // Completing Observables
    const httpGet$ = this.apiService.allCustomers$.pipe(log('httpGet$', TapCallback.Complete));
    const of$ = of('A', 4, null, {first: 'Anna', last: 'Jones'}).pipe(log('of$', TapCallback.Complete));
    const from$ = from([NEW_CUSTOMER, 8]).pipe(log('from$', TapCallback.Complete));

    // Infinite Observables
    const interval$ = interval(1000).pipe(log('interval$', TapCallback.Complete));
    const bSubject$ = new BehaviorSubject('hi').pipe(log('bSubject$', TapCallback.Complete));
    
    const forkJoinDemo$ = forkJoin([
      httpGet$,
      of$,
      interval$
    ]).pipe(
      log('forkJoinDemo$', TapCallback.All)
    )

    // forkJoinDemo$.subscribe();
  }
}
