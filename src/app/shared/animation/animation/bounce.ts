import { animateAsyncTransition } from '../animate.async.transition';
import {
  style,
  state,
  animate,
  keyframes,
  AnimationStateMetadata,
  AnimationTransitionMetadata
} from '@angular/animations';

export function bounce(timing: string): (AnimationStateMetadata | AnimationTransitionMetadata)[] {
  return [
    state('bounceOut', style({
      display: 'none'
    })),
    state('bounceOutDown', style({
      display: 'none'
    })),
    state('bounceOutLeft', style({
      display: 'none'
    })),
    state('bounceOutRight', style({
      display: 'none'
    })),
    state('bounceOutUp', style({
      display: 'none'
    })),
    animateAsyncTransition('* => bounceIn', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'scale3d(.3, .3, .3)', offset: 0 }),
        style({ transform: 'scale3d(1.1, 1.1, 1.1)', offset: 0.2 }),
        style({ transform: 'scale3d(.9, .9, .9)', offset: 0.4 }),
        style({ transform: 'scale3d(1.03, 1.03, 1.03)', offset: 0.6 }),
        style({ transform: 'scale3d(.97, .97, .97)', offset: 0.8 }),
        style({ opacity: 1, transform: 'scale3d(1, 1, 1)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('bounceIn => void, * => bounceOut', [
      animate(timing, keyframes([
        style({ transform: 'scale3d(.9, .9, .9)', offset: 0.2 }),
        style({ opacity: 1, transform: 'scale3d(1.1, 1.1, 1.1)', offset: 0.5 }),
        style({ opacity: 0, transform: 'scale3d(.3, .3, .3)', offset: 1 }),
      ]))
    ]),
    animateAsyncTransition('* => bounceInDown', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'translate3d(0, -1000px, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'translate3d(0, 20px, 0)', offset: 0.6 }),
        style({ transform: 'translate3d(0, -10px, 0)', offset: 0.75 }),
        style({ transform: 'translate3d(0, 5px, 0)', offset: 0.9 }),
        style({ transform: 'translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('bounceInDown => void, * => bounceOutDown', [
      animate(timing, keyframes([
        style({ transform: 'translate3d(0, 10px, 0)', offset: 0.2 }),
        style({ opacity: 1, transform: 'translate3d(0, -20px, 0)', offset: 0.5 }),
        style({ opacity: 0, transform: 'translate3d(0, 1000px, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('* => bounceInLeft', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'translate3d(-1000px, 0, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'translate3d(20px, 0, 0)', offset: 0.6 }),
        style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.75 }),
        style({ transform: 'translate3d(5px, 0, 0)', offset: 0.9 }),
        style({ transform: 'translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('bounceInLeft => void, * => bounceOutRight', [
      animate(timing, keyframes([
        style({ opacity: 1, transform: 'translate3d(-20px, 0, 0)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translate3d(1000px, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('* => bounceInRight', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'translate3d(1000px, 0, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'translate3d(-20px, 0, 0)', offset: 0.6 }),
        style({ transform: 'translate3d(10px, 0, 0)', offset: 0.75 }),
        style({ transform: 'translate3d(-5px, 0, 0)', offset: 0.9 }),
        style({ transform: 'translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('bounceInRight => void, * => bounceOutLeft', [
      animate(timing, keyframes([
        style({ opacity: 1, transform: 'translate3d(20px, 0, 0)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translate3d(-1000px, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('* => bounceInUp', [
      animate(timing, keyframes([
        style({ opacity: 0, transform: 'translate3d(0, 1000px, 0)', offset: 0 }),
        style({ opacity: 1, transform: 'translate3d(0, -20px, 0)', offset: 0.6 }),
        style({ transform: 'translate3d(0, 10px, 0)', offset: 0.75 }),
        style({ transform: 'translate3d(0, -5px, 0)', offset: 0.9 }),
        style({ transform: 'translate3d(0, 0, 0)', offset: 1 })
      ]))
    ]),
    animateAsyncTransition('bounceInUp => void, * => bounceOutUp', [
      animate(timing, keyframes([
        style({ transform: 'translate3d(0, -10px, 0)', offset: 0.2 }),
        style({ opacity: 1, transform: 'translate3d(0, 20px, 0)', offset: 0.5 }),
        style({ opacity: 0, transform: 'translate3d(0, -1000px, 0)', offset: 1 })
      ]))
    ])
  ];
}
