import { Component, OnInit, inject } from '@angular/core';

import { Observable, take, map, filter, BehaviorSubject, interval } from 'rxjs';

import { Customer } from '../app.model';
import { TakeService } from './take.service';

@Component({
  selector: 'app-take',
  templateUrl: './take.component.html',
  styleUrls: ['./take.component.scss']
})
export class TakeComponent implements OnInit {

  private takeService = inject(TakeService);

  number$: Observable<number> = interval(1000).pipe(
    take(10)
  );

  ngOnInit(): void {
    const subj = new BehaviorSubject(1);

    const takeFive$ = subj.pipe(
      take(5)
    );

    takeFive$.subscribe({
      next: v => console.log(v),
      complete: () => console.log('COMPLETED')
    })

    setTimeout(() => {
      subj.next(2);
      subj.next(3);
      subj.next(4);
      subj.next(5);
    }, 2000);
  }

}
