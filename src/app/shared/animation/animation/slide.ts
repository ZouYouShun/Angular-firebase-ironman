import { animateAsyncTransition } from '../animate.async.transition';
import {
  style,
  state,
  animate,
  AnimationStateMetadata,
  AnimationTransitionMetadata
} from '@angular/animations';

export function slide(timing: string): (AnimationStateMetadata | AnimationTransitionMetadata)[] {
  return [
    state('slideOutDown', style({
      display: 'none'
    })),
    state('slideOutLeft', style({
      display: 'none'
    })),
    state('slideOutRight', style({
      display: 'none'
    })),
    state('slideOutUp', style({
      display: 'none'
    })),
    animateAsyncTransition('* => slideInDown', [
      style({ transform: 'translate3d(0, -100%, 0)' }),
      animate(timing,
        style({ transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('slideInDown => void, * => slideOutDown', [
      style({ transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ transform: 'translate3d(0, 100%, 0)' })
      )
    ]),
    animateAsyncTransition('* => slideInLeft', [
      style({ transform: 'translate3d(-100%, 0, 0)' }),
      animate(timing,
        style({ transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('slideInLeft => void, * => slideOutRight, slideInRtoL => void', [
      style({ transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ transform: 'translate3d(100%, 0, 0)' })
      )
    ]),
    animateAsyncTransition('* => slideInRight, * => slideInRtoL', [
      style({ transform: 'translate3d(100%, 0, 0)' }),
      animate(timing,
        style({ transform: 'translate3d(0, 0, 0)' })
      )
    ]),
    animateAsyncTransition('slideInRight => void, * => slideOutLeft', [
      style({ transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ transform: 'translate3d(-100%, 0, 0)' })
      )
    ]),
    animateAsyncTransition('* => slideInUp', [
      style({ transform: 'translate3d(0, 25%, 0) scale(0.9)', opacity: 0 }),
      animate(timing,
        style({ transform: 'none', opacity: 1 })
      )
    ]),
    animateAsyncTransition('slideInUp => void, * => slideOutUp', [
      style({ transform: 'translate3d(0, 0, 0)' }),
      animate(timing,
        style({ transform: 'translate3d(0, -100%, 0)' })
      )
    ])
  ];
}
