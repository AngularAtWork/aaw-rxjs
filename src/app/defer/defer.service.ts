import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subject, combineLatest, defer, map, of, tap, withLatestFrom } from 'rxjs';
import { log } from '../utils';
import { TapCallback } from '../app.model';


@Injectable({
  providedIn: 'root'
})
export class DeferService {
  
  private codeSubject = new BehaviorSubject<string>('');
  public code$: Observable<string> = this.codeSubject.asObservable().pipe(
    tap(() => this.submittedPasscodeSubject.next(false)),
  );

  private submittedPasscodeSubject = new BehaviorSubject<boolean>(false);
  public submittedPasscode$: Observable<boolean> = this.submittedPasscodeSubject.asObservable();

  private blockEntrySubject = new BehaviorSubject<boolean>(true);
  public blockEntry$: Observable<boolean> = this.blockEntrySubject.asObservable().pipe(
  );

  private blockChangeSubject = new BehaviorSubject<boolean>(false);
  public blockChange$: Observable<boolean> = this.blockChangeSubject.asObservable().pipe(
  );

  private digits1Subject = new Subject<number[]>();
  public digits1$: Observable<number[]> = this.digits1Subject.asObservable().pipe(
  )

  private digits2Subject = new Subject<number[]>();
  public digits2$: Observable<number[]> = this.digits2Subject.asObservable().pipe(
  )

  private digits3Subject = new Subject<number[]>();
  public digits3$: Observable<number[]> = this.digits3Subject.asObservable().pipe(
  )

  private digits4Subject = new Subject<number[]>();
  public digits4$: Observable<number[]> = this.digits4Subject.asObservable().pipe(
  )

  private visiblePadSubject = new BehaviorSubject<number>(1);
  public visiblePad$: Observable<number> = this.visiblePadSubject.asObservable();

  private showInvalidMessageSubject = new BehaviorSubject<boolean>(false);
  public showInvalidMessage$: Observable<boolean> = this.showInvalidMessageSubject.asObservable();

  codeValid$: Observable<boolean> = this.code$.pipe(
    map((code: string) => code.length === 4)
  )

  randomArray$ = defer(() => of(this.randomIntArrayInRange(16)));
  
  newArray$: Observable<number[]> = of(1).pipe(
    withLatestFrom(this.randomArray$),
    map(([_, arr]) => arr),
  )

  testLock$: Observable<boolean> = combineLatest([
    this.digits1$,
    this.digits2$,
    this.digits3$,
    this.digits4$
  ]).pipe(
    withLatestFrom(this.code$),
    map(([[digits1, digits2, digits3, digits4], code]: [[number[], number[], number[], number[]], string]) => {
      const passcodeDigit1: number = +code.split('')[0];
      const passcodeDigit2: number = +code.split('')[1];
      const passcodeDigit3: number = +code.split('')[2];
      const passcodeDigit4: number = +code.split('')[3];

      return digits1.includes(passcodeDigit1)
              && digits2.includes(passcodeDigit2)
              && digits3.includes(passcodeDigit3)
              && digits4.includes(passcodeDigit4)
    }),
    tap(test => this.showInvalidMessageSubject.next(!test)),
    tap(() => this.blockEntrySubject.next(true))
  )

  randomIntArrayInRange(n = 1) {
    let hasAll = false;
    let arr: number[];

    do {
      arr =  Array.from(
        { length: n },
        () => Math.floor(Math.random() * (9 - 0 + 1)) + 0
      )

      if ([0,1,2,3,4,5,6,7,8,9].every(digit => arr.includes(digit))) {
        hasAll = true;
      }

    } while (!hasAll)
    
    return arr;
  }

  enteringPasscode(passcode: string) {
    this.codeSubject.next(passcode);
  }

  submitNewPasscode() {
    this.submittedPasscodeSubject.next(true);
    this.blockEntrySubject.next(false);
  }

  submitDigits1(digit: number[]) {
    this.digits1Subject.next(digit);
    this.visiblePadSubject.next(2);
    this.blockChangeSubject.next(true);
  }

  submitDigits2(digit: number[]) {
    this.digits2Subject.next(digit);
    this.visiblePadSubject.next(3);
  }

  submitDigits3(digit: number[]) {
    this.digits3Subject.next(digit);
    this.visiblePadSubject.next(4);
  }

  submitDigits4(digit: number[]) {
    this.digits4Subject.next(digit);
  }
}
