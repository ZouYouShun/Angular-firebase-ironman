import { animateAsyncTransition } from '../animate.async.transition';
import {
  style,
  state,
  animate,
  keyframes,
  AnimationStateMetadata,
  AnimationTransitionMetadata
} from '@angular/animations';

export function zoom(timing: string): (AnimationStateMetadata | AnimationTransitionMetadata)[] {
  return [
    state('zoomOut', style({
      display: 'none'
    })),
    state('zoomOutDown', style({
      display: 'none'
    })),
    state('zoomOutLeft', style({
      display: 'none'
    })),
    state('zoomOutRight', style({
      display: 'none'
    })),
    state('zoomOutUp', style({
      display: 'none'
    })),
    animateAsyncTransition('* => zoomIn', [
      style({ opacity: 0, transform: 'scale3d(.1, .1, .1)'}),
      animate(timing,
        style({ opacity: 1, transform: 'scale3d(1, 1, 1)'})
      )
    ]),
    animateAsyncTransition('zoomIn => void, * => zoomOut', [
      animate(timing, keyframes([
        style({ opacity: 1, transform: 'scale3d(1, 1, 1)', offset: 0 }),
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('* => zoomInDown', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(0, -1000px, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'scale3d(.475, .475, .475) translate3d(0, 60px, 0)', offset: 0.6 }),
        style({ transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('zoomInDown => void, * => zoomOutDown', [
      animate(timing, keyframes([
        style({ opacity: 1, transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 0 }),
        style({ transform: 'scale3d(.475, .475, .475) translate3d(0, 60px, 0)', offset: 0.4 }),
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(0, 1000px, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('* => zoomInLeft', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(-1000px, 0, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'scale3d(.475, .475, .475) translate3d(10px, 0, 0)', offset: 0.6 }),
        style({ transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('zoomInLeft => void, * => zoomOutRight', [
      animate(timing, keyframes([
        style({ opacity: 1, transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 0 }),
        style({ transform: 'scale3d(.475, .475, .475) translate3d(-10px, 0, 0)', offset: 0.6 }),
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(1000px, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('* => zoomInRight', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(1000px, 0, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'scale3d(.475, .475, .475) translate3d(-10px, 0, 0)', offset: 0.6 }),
        style({ transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('zoomInRight => void, * => zoomOutLeft', [
      animate(timing, keyframes([
        style({ opacity: 1, transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 0 }),
        style({ transform: 'scale3d(.475, .475, .475) translate3d(10px, 0, 0)', offset: 0.6 }),
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(-1000px, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('* => zoomInUp', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(0, 1000px, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'scale3d(.475, .475, .475) translate3d(0, -60px, 0)', offset: 0.6 }),
        style({ transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('zoomInUp => void, * => zoomOutUp', [
      animate(timing, keyframes([
        style({ opacity: 1, transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', offset: 0 }),
        style({ transform: 'scale3d(.475, .475, .475) translate3d(0, -60px, 0)', offset: 0.4 }),
        style({ opacity: 0, transform: 'scale3d(.1, .1, .1) translate3d(0, -1000px, 0)', offset: 1 })
      ]))
    ])
  ];
}
