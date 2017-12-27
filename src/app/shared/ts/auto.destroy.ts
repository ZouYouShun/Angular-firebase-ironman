import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export abstract class AutoDestroy implements OnDestroy {
  protected _destroy$ = new Subject<any>();

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.unsubscribe();
  }
}
