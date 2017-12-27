import {
  AnimationAnimateMetadata,
  transition,
  group,
  query,
  stagger,
  animateChild,
  AnimationTransitionMetadata,
  AnimationStyleMetadata
} from '@angular/animations';

export function animateAsyncTransition(state: string
  , ani: (AnimationStyleMetadata | AnimationAnimateMetadata)[]): AnimationTransitionMetadata {
  return transition(state, [
    group([
      ...ani,
      // query('@*', stagger(200, animateChild()), { optional: true })
      query('@*', animateChild(), { optional: true })
    ])
  ]);
}
