import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import { FocusableOption } from '@angular/cdk/a11y';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';

@Directive({
  selector: '[auto-focus]'
})
export class AutofocusDirective implements FocusableOption, AfterViewInit {

  constructor(private element: ElementRef) { }

  focus(): void {
    console.log('!focus');
    this.element.nativeElement.focus();
  }

  @runAfterTimeout()
  ngAfterViewInit(): void {
    this.element.nativeElement.focus();
  }
}
