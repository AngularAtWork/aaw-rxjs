import { Component, OnInit, inject } from '@angular/core';

import { Observable, of, tap, timer, combineLatest } from 'rxjs';

import { Customer } from '../app.model';
import { HowToPipeableOperatorService } from './how-to-pipeable-operator.service';
import { NEW_CUSTOMER } from '../api.service';
import { addFullNameProperty, timeObservable } from '../utils';

@Component({
  selector: 'app-how-to-pipeable-operator',
  templateUrl: './how-to-pipeable-operator.component.html',
  styleUrls: ['./how-to-pipeable-operator.component.scss']
})
export class HowToPipeableOperatorComponent implements OnInit {

  private howToPipeableOperatorService = inject(HowToPipeableOperatorService);

  customers$!: Observable<Customer[]>;

  ngOnInit(): void {

    of(NEW_CUSTOMER, {first: 'Any', last: 'Body'}, { last: 'Smith', first: 'Jane'}).pipe(
      addFullNameProperty(true)
    ).subscribe({
      next: value => console.log(value)
    })
    
  }

}
