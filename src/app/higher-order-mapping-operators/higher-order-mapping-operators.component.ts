import { Component, inject, OnInit } from '@angular/core';

import { concatMap, map, Observable, of } from 'rxjs';

import { ApiService, NEW_CUSTOMER } from '../api.service';
import { Customer } from '../app.model';
import { DemoEnum, HigherOrderMappingOperatorsService } from './higher-order-mapping-operators.service';

@Component({
  selector: 'app-higher-order-mapping-operators',
  templateUrl: './higher-order-mapping-operators.component.html',
  styleUrls: ['./higher-order-mapping-operators.component.scss']
})
export class HigherOrderMappingOperatorsComponent implements OnInit {

  private higherOrderMappingOperatorsService = inject(HigherOrderMappingOperatorsService);
  private apiService = inject(ApiService);

  ngOnInit(): void {

    // const trx: Transaction = { id: 5, customerId: '53307660', transactionDate: '02/14/2022', accountNumber: '5448-6847-3816-1328' };
    // this.apiService.getAccountTypeOfTransaction(trx).subscribe({
    //   next: acctType => console.log(`Transaction: ${trx.accountNumber} | Account Type: ${acctType}`)
    // });
    

    //#region - Mapping examples
    const numberObs = of(1).pipe(
      map(value => value)
    )
    // numberObs.subscribe({
    //   next: val => console.log('numberObs', val)
    // })

    const dateObs = of(new Date()).pipe(
      map(value => value)
    )
    // dateObs.subscribe({
    //   next: val => console.log('dateObs', val)
    // })

    const customerObs = of(NEW_CUSTOMER).pipe(
      map(value => value)
    )
    // customerObs.subscribe({
    //   next: val => console.log('customerObs', val)
    // })

    const customerToDateObs = of(NEW_CUSTOMER).pipe(
      map(value => new Date())
    )
    // customerToDateObs.subscribe({
    //   next: val => console.log('customerToDateObs', val)
    // })

    const customerToNumberObs = of(NEW_CUSTOMER).pipe(
      map(value => 1)
    )
    // customerToNumberObs.subscribe({
    //   next: val => console.log('customerToNumberObs', val)
    // })

    const customerToObservableObs = of('hello').pipe(
      concatMap(value => this.higherOrderMappingOperatorsService.allCustomers$),
    )

    // const customerToObservableObs = of(NEW_CUSTOMER).pipe(
    //   concatMap(value => this.higherOrderMappingOperatorsService.allCustomers$)
    // )
    // const customerToObservableObs = of(NEW_CUSTOMER).pipe(
    //   concatMap(value => this.higherOrderMappingOperatorsService.allCustomers$.pipe(map((customers: Customer[]) => customers.map((customer: Customer) => {
    //     const {id, accounts} = customer;
    //     return {id, accounts};
    //   }))))
    // )
    // const customerToObservableObs = of(NEW_CUSTOMER).pipe(
    //   concatMap(value => this.higherOrderMappingOperatorsService.allCustomers$.pipe(map((oldCustomers: Customer[]) => ({ newCustomer: value, oldCustomers})))),
    //   map(({newCustomer, oldCustomers}) => ([newCustomer, ...oldCustomers]))
    // )
    customerToObservableObs.subscribe({
      next: val => console.log('customerToObservableObs', val)
    })

    //#endregion

    //#region - Template
    const outerObservable$: Observable<number> = of(1,2,3);
    const innerObservable$: Observable<Customer[]> = this.apiService.allCustomers$;

    const resultObservable$: Observable<Customer[]> = outerObservable$.pipe(
      concatMap(value => innerObservable$)
    )

    resultObservable$.subscribe();
    //#endregion
  }


  //#region - Higher-Order Mapping Operators examples
  demos = DemoEnum;

  demoType$ = this.higherOrderMappingOperatorsService.demoType$;
  wordsConcatMap$ = this.higherOrderMappingOperatorsService.wordsStartingWithCharacterConcatMap$;
  wordsMergeMap$ = this.higherOrderMappingOperatorsService.wordsStartingWithCharacterMergeMap$;
  wordsSwitchMap$ = this.higherOrderMappingOperatorsService.wordsStartingWithCharacterSwitchMap$;
  wordsExhaustMap$ = this.higherOrderMappingOperatorsService.wordsStartingWithCharacterExhaustMap$;

  inputCharacter(evt: any) {
    const input: string = evt.target.value;

    const lastCharacter = input ? input.split('')[input.length -1] : '';

    if (lastCharacter) {
      console.log('lastCharacter', lastCharacter);
      this.higherOrderMappingOperatorsService.changeCharacter(lastCharacter);
    }
  }

  setDemoType(demoType: DemoEnum) {
    this.higherOrderMappingOperatorsService.changeDemoType(demoType);
  }

  clear() {
    console.log('clear called');
    this.higherOrderMappingOperatorsService.clear();
  }

  //#endregion
}
