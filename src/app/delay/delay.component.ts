import { Component, OnInit, inject } from '@angular/core';

import { Observable, delay, interval, take } from 'rxjs';

import { Customer } from '../app.model';

import { DelayService } from './delay.service';

@Component({
  selector: 'app-delay',
  templateUrl: './delay.component.html',
  styleUrls: ['./delay.component.scss']
})
export class DelayComponent implements OnInit {

  private delayService = inject(DelayService);

  number$: Observable<number> = interval(100).pipe(
    delay(3000),
    take(100)
  );

  ngOnInit(): void {
  }

}
