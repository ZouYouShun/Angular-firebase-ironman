import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[view-container]'
})
export class ViewContainerDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }
}
