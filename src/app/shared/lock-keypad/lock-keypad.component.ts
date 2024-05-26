import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-lock-keypad',
  templateUrl: './lock-keypad.component.html',
  styleUrls: ['./lock-keypad.component.scss']
})
export class LockKeypadComponent implements OnInit {

  @Input()
  arrayOfNumbers!: number[];

  @Input()
  blockEntry: boolean | null = true;

  @Output()
  entered = new EventEmitter<number[]>();

  ngOnInit(): void {
  }

  enterQuadrantNumbers(quandrant: number) {
    const sliceOfArray = this.arrayOfNumbers.slice((quandrant -1) * 4, (quandrant * 4));
    this.entered.emit(sliceOfArray);
  }

}
