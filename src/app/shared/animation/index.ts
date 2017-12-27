import {
  trigger,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

import { fade } from './animation/fade';
import { bounce } from './animation/bounce';
import { rotate } from './animation/rotate';
import { slide } from './animation/slide';
import { zoom } from './animation/zoom';
import { expend } from './animation/expend';

// inspired by https://github.com/yuyang041060120/ng2-animate  https://yuyang041060120.github.io/ng2-animate/
export function animateFactory
  (timing: string = `150ms 0ms linear`): AnimationTriggerMetadata {
  return trigger('animate', [
    ...fade(timing),
    // ...bounce(timing),
    // ...rotate(timing),
    ...slide(timing),
    // ...zoom(timing),
    ...expend(timing)
  ]);
}
