import { Component, OnInit, inject } from '@angular/core';

import { Observable, interval } from 'rxjs';

import { Customer } from '../app.model';
import { IntervalService } from './interval.service';

@Component({
  selector: 'app-interval',
  templateUrl: './interval.component.html',
  styleUrls: ['./interval.component.scss']
})
export class IntervalComponent implements OnInit {

  private intervalService = inject(IntervalService);

  number$!: Observable<number>;
  // number$: Observable<number> = interval(2000);

  ngOnInit(): void {
  }

}
