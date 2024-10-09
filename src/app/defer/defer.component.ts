import { Component, OnInit, inject } from '@angular/core';

import { DeferService } from './defer.service';
import { Observable, combineLatest, map } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-defer',
  templateUrl: './defer.component.html',
  styleUrls: ['./defer.component.scss'],
  animations: [
    trigger('fadeAnimation', [ 
      transition('* => *', [
        style({ opacity: 0.5 }), 
        animate(200, style({opacity: 1}))
      ]) 
    ])
  ]
})
export class DeferComponent implements OnInit {

  private deferService = inject(DeferService);

  isCodeValid$: Observable<boolean> = this.deferService.codeValid$;
  hideMessage$: Observable<boolean> = this.deferService.submittedPasscode$;
  visiblePad$: Observable<number> = this.deferService.visiblePad$;

  newArray$: Observable<number[]> = this.deferService.newArray$;

  testLock$: Observable<boolean> = this.deferService.testLock$;

  blockEntry$: Observable<boolean> = this.deferService.blockEntry$;
  blockChange$: Observable<boolean> = this.deferService.blockChange$;

  showInvalidMessage$: Observable<boolean> = this.deferService.showInvalidMessage$;

  ngOnInit(): void {
  }

  enteringPasscode(evt: any) {
    const passcode = evt.target.value;

    this.deferService.enteringPasscode(passcode);
  }

  submitPasscode() {
    this.deferService.submitNewPasscode();
  }

  enteredDigits1(evt: number[]) {
    this.deferService.submitDigits1(evt);
  }

  enteredDigits2(evt: number[]) {
    this.deferService.submitDigits2(evt);
  }

  enteredDigits3(evt: number[]) {
    this.deferService.submitDigits3(evt);
  }

  enteredDigits4(evt: number[]) {
    this.deferService.submitDigits4(evt);
  }
  
}
