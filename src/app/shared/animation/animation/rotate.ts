import {
  style,
  state,
  animate,
  AnimationStateMetadata,
  AnimationTransitionMetadata
} from '@angular/animations';
import { animateAsyncTransition } from '../animate.async.transition';

export function rotate(timing: string): (AnimationStateMetadata | AnimationTransitionMetadata)[] {
  return [
    state('rotateOut', style({
      display: 'none'
    })),
    state('rotateOutDownLeft', style({
      display: 'none'
    })),
    state('rotateOutDownRight', style({
      display: 'none'
    })),
    state('rotateOutUpLeft', style({
      display: 'none'
    })),
    state('rotateOutUpRight', style({
      display: 'none'
    })),
    animateAsyncTransition('* => rotateIn', [
      style({ opacity: 0, transformOrigin: 'center', transform: 'rotate3d(0, 0, 1, -200deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 1, transformOrigin: 'center', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('rotateIn => void, * => rotateOut', [
      style({ opacity: 1, transformOrigin: 'center', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 0, transformOrigin: 'center', transform: 'rotate3d(0, 0, 1, 200deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('* => rotateInDownLeft', [
      style({ opacity: 0, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, -45deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 1, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('rotateInDownLeft => void, * => rotateOutDownLeft', [
      style({ opacity: 1, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 0, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, 45deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('* => rotateInDownRight', [
      style({ opacity: 0, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, 45deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 1, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('rotateInDownRight => void, * => rotateOutDownRight', [
      style({ opacity: 1, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 0, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, -45deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('* => rotateInUpLeft', [
      style({ opacity: 0, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, 45deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 1, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('rotateInUpLeft => void, * => rotateOutUpLeft', [
      style({ opacity: 1, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 0, transformOrigin: 'left bottom', transform: 'rotate3d(0, 0, 1, -45deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('* => rotateInUpRight', [
      style({ opacity: 0, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, -45deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 1, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 1 })
      )
    ]),
    animateAsyncTransition('rotateInUpRight => void, * => rotateOutUpRight', [
      style({ opacity: 1, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, 0deg)', offset: 0 }),
      animate(timing,
        style({ opacity: 0, transformOrigin: 'right bottom', transform: 'rotate3d(0, 0, 1, 45deg)', offset: 1 })
      )
    ])
  ];
}
