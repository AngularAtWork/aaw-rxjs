import { Component, inject, OnInit } from '@angular/core';

import { AsyncSubject, BehaviorSubject, ReplaySubject, scan, Subject, Subscription } from 'rxjs';

import { SubjectsService } from './subjects.service';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss']
})
export class SubjectsComponent implements OnInit {

  private subjectsService = inject(SubjectsService);

  replayCount: number | undefined = 3;

  subject$ = new Subject<string>();
  async$ = new AsyncSubject<string>();
  behavior$ = new BehaviorSubject<string>('init');
  // replay$ = new ReplaySubject<string>();
  replay$ = new ReplaySubject<string>(this.replayCount);

  subjectEarly: string = '';
  asyncEarly: string = '';
  behaviorEarly: string = '';
  replayEarly: string = '';

  subjectLate: string = '';
  asyncLate: string = '';
  behaviorLate: string = '';
  replayLate: string | unknown = '';

  earlyState: string = '';
  lateState: string = '';

  subjectState: string = '';

  emittedValues: string ='';

  subjects = [
    this.subject$,
    this.async$,
    this.behavior$,
    this.replay$,
  ];

  earlys: Subscription[] = [];

  ngOnInit() {
    this.subjectsService.emitMethod('Emit this message');
    this.subjectsService.completeMethod();

    // This is a late subscriber
    this.subjectsService.obs$.subscribe(next => console.log('obs$', next));

  }

  subscribeEarlys() {
    this.earlyState = !this.earlyState ? 'subscribed' : this.earlyState;
    const earlySubject = this.subject$.subscribe(next => {
      this.subjectEarly = next
    });
    this.earlys.push(earlySubject);
    const earlyBehavior = this.behavior$.subscribe(next => {
      this.behaviorEarly = next
    });
    this.earlys.push(earlyBehavior);
    const earlyReplay = this.replay$.subscribe(next => {
      this.replayEarly = next
    });
    this.earlys.push(earlyReplay);
    const earlyAsync = this.async$.subscribe(next => {
      this.asyncEarly = next
    });
    this.earlys.push(earlyAsync);
  }

  emitValue(evt: any) {
    const emission: string = evt.target.value;

    if (emission) {
      this.subjects.forEach(subj => subj.next(emission));
      this.emittedValues = this.emittedValues ? this.emittedValues + ', ' + emission : emission;
    }
  }

  subscribeLates() {
    this.subject$.subscribe(next => {
      this.subjectLate = next
    });
    this.behavior$.subscribe(next => {
      this.behaviorLate = next
    });
    this.replay$.pipe(
      scan((acc, curr) => this.lateState !== 'subscribed' ? acc + curr : curr, ''),
      ).subscribe((next: string) => {
      this.replayLate = next.split('').join(', ')
    })
    this.async$.subscribe(next => {
      this.asyncLate = next
    });
    this.lateState = !this.lateState ? 'subscribed' : this.lateState;
  }

  completeAll() {
    this.subjectState = '(completed)';
    this.subjects.forEach(subj => subj.complete());
  }

  errorAll() {
    this.subjectState = '(errored)';
    this.subjects.forEach(subj => subj.error('Subject error'));
  }

  unsubscribeEarlys() {
    this.earlyState = 'unsubscribed';
    this.earlys.forEach(subj => subj.unsubscribe());
  }

  unsubscribeAll() {
    this.earlyState = 'unsubscribed';
    this.lateState = 'unsubscribed';
    this.subjects.forEach(subj => subj.unsubscribe());
  }

}
