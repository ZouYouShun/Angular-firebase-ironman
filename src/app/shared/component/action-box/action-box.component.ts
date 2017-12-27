import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';

import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { animateFactory } from '../../animation';
import { onlyOnBrowser } from '../../decorator/only-on.browser';
import { AutoDestroy } from '../../ts/auto.destroy';
import { CUBIC_BEZIER, DURATIONS } from '../../animation/animate.constant';

@Component({
  selector: 'action-box',
  templateUrl: './action-box.component.html',
  styleUrls: ['./action-box.component.scss'],
  animations: [
    animateFactory(`${DURATIONS.short} ${CUBIC_BEZIER.Sharp}`)
  ]
})
export class ActionBoxComponent extends AutoDestroy implements OnInit {

  @Input('showObs') showObs$: Observable<boolean> = Observable.of(true);
  @Input('elm') targetElm: HTMLAnchorElement;
  isShow = false;

  constructor( @Inject(PLATFORM_ID) private platformId: Object) { super(); }

  @onlyOnBrowser('platformId')
  ngOnInit(): void {
    this.showObs$
      .takeUntil(this._destroy$)
      .subscribe((state) => {
        this.isShow = state;
      });
  }

  goTop() {
    this.targetElm.scroll({ top: 0, left: 0, behavior: 'smooth' });
  }

  goPrev() {
    history.back();
    this.isShow = false;
  }
}
