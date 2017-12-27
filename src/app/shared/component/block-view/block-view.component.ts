import { Component, OnInit, HostBinding, HostListener } from '@angular/core';
import { animateFactory } from '@shared/animation';
import { CUBIC_BEZIER, DURATIONS } from '../../animation/animate.constant';

@Component({
  selector: 'block-view',
  templateUrl: './block-view.component.html',
  styleUrls: ['./block-view.component.scss'],
  animations: [
    animateFactory(`${DURATIONS.short} ${CUBIC_BEZIER.Sharp}`)
  ]
})
export class BlockViewComponent {
  title = 'Loading';
  @HostBinding('@animate') private _state = 'fadeIn';
  constructor() { }
}
