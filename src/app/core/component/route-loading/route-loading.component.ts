import { Component, HostBinding } from '@angular/core';
import { animateFactory } from '@shared/animation';
import { DURATIONS, CUBIC_BEZIER } from '@shared/animation/animate.constant';


// Alan:the reference:
// http://stackoverflow.com/questions/37069609/show-loading-screen-when-navigating-between-routes-in-angular-2
@Component({
  selector: 'route-loading',
  templateUrl: './route-loading.component.html',
  styleUrls: ['./route-loading.component.scss'],
  animations: [
    animateFactory(`${DURATIONS.short} ${CUBIC_BEZIER.Sharp}`)
  ]
})
export class RouteLoadingComponent {
  @HostBinding('@animate') private _state = 'fadeIn';
  constructor() { }
}
