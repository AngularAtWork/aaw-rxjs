import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  regex = '^[0-9]+$';

  constructor(
    private el: ElementRef
  ) { }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: any) {
    return new RegExp(this.regex).test(event.key)
  }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

}
