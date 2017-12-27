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

export function expend(timing: string): (AnimationStateMetadata | AnimationTransitionMetadata)[] {
  return [
    state('collapsed', style({
      height: '0px',
      visibility: 'hidden',
      opacity: 0
    })),
    state('expanded', style({
      height: '*',
      visibility: 'visible',
      opacity: 1
    })),
    transition('expanded <=> collapsed', animate(timing)),
  ];
}
