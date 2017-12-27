import { animateAsyncTransition } from '../animate.async.transition';
import {
  style,
  state,
  animate,
  AnimationStateMetadata,
  AnimationTransitionMetadata,
  query,
  group,
  animateChild,
  transition
} from '@angular/animations';

export function fade(timing: string): (AnimationStateMetadata | AnimationTransitionMetadata)[] {
  return [
    state('fadeOut', style({
      display: 'none'
    })),
    state('fadeOutDown', style({
      display: 'none'
    })),
    state('fadeOutLeft', style({
      display: 'none'
    })),
    state('fadeOutRight', style({
      display: 'none'
    })),
    state('fadeOutUp', style({
      display: 'none'
    })),
    animateAsyncTransition('* => fadeIn', [
      style({ opacity: 0 }),
      animate(timing,
        style({ opacity: 1 })
      )
    ]),
    animateAsyncTransition('fadeIn => void, * => fadeOut', [
      style({ opacity: 1 }),
      animate(timing,
        style({ opacity: 0 })
      )
    ]),
    animateAsyncTransition('* => fadeInDown', [
      style({ opacity: 0, transform: 'translate3d(0, -100%, 0)' }),
      animate(timing,
        style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('fadeInDown => void, * => fadeOutDown', [
      style({ opacity: 1, transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ opacity: 0, transform: 'translate3d(0, 100%, 0)' })
      )
    ]),
    animateAsyncTransition('* => fadeInLeft', [
      style({ opacity: 0, transform: 'translate3d(-100%, 0, 0)' }),
      animate(timing,
        style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('fadeInLeft => void, * => fadeOutRight', [
      style({ opacity: 1, transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ opacity: 0, transform: 'translate3d(100%, 0, 0)' })
      )
    ]),
    animateAsyncTransition('* => fadeInRight', [
      style({ opacity: 0, transform: 'translate3d(100%, 0, 0)' }),
      animate(timing,
        style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('fadeInRight => void, * => fadeOutLeft', [
      style({ opacity: 1, transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ opacity: 0, transform: 'translate3d(-100%, 0, 0)' })
      )
    ]),
    animateAsyncTransition('* => fadeInUp', [
      style({ opacity: 0, transform: 'translate3d(0, 100%, 0)' }),
      animate(timing,
        style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('fadeInUp => void, * => fadeOutUp', [
      style({ opacity: 1, transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ opacity: 0, transform: 'translate3d(0, 100%, 0)' })
      )
    ]),
    animateAsyncTransition('* => fadeInUpLeaveDown', [
      style({ opacity: 0, transform: 'translate3d(0, 100%, 0)' }),
      animate(timing,
        style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('fadeInUpLeaveDown => void', [
      style({ opacity: 1, transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ opacity: 0, transform: 'translate3d(0, 100%, 0)' })
      )
    ])
  ];
}
