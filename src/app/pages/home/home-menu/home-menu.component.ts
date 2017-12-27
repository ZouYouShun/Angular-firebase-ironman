import { AfterViewInit, Component, Inject, Input, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { MatSidenav } from '@angular/material';
import { BaseService } from '@core/service/base.service';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-home-menu',
  templateUrl: './home-menu.component.html',
  styleUrls: ['./home-menu.component.scss']
})
export class HomeMenuComponent extends AutoDestroy implements AfterViewInit, OnDestroy {
  @Input('menu') menu: MatSidenav;
  @Input('menus-data') menus: MatSidenav;
  @Input() isScrollShrink = false;
  @ViewChild('openOverlay') openOverlay;
  isSmall = false;

  private watcher: Subscription;
  private scrollWatcher: Subscription;
  private scrollObs$: Observable<boolean>;
  private hammer: HammerManager;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _media: ObservableMedia,
    private _base: BaseService
  ) {
    super();
  }

  ngAfterViewInit() {
    if (this.isScrollShrink) this.setScroll();
    this.hammer = this.bindHammer();
  }

  @onlyOnBrowser('platformId')
  private setScroll() {
    this.scrollObs$ = this._base.mainScrollTopEvent
      .takeUntil(this._destroy$)
      .map(top => top > 50)
      .do(result => {
        if (this.isSmall !== result)
          this.isSmall = result;
      });
    if (!this._media.isActive('lt-md')) {
      this.scrollWatcher = this.scrollObs$.subscribe();
    }
    this.watcher = this._media
      .subscribe((change: MediaChange) => {
        // console.dir(change);
        if ((this.scrollWatcher && !this.scrollWatcher.closed)) {
          if (this._media.isActive('lt-md')) {
            // console.dir('unsub');
            this.scrollWatcher.unsubscribe();
          }
        } else {
          if (!this._media.isActive('lt-md')) {
            // console.dir('sub');
            this.scrollWatcher = this.scrollObs$.subscribe();
          }
        }
      });
  }

  @onlyOnBrowser('platformId')
  private bindHammer() {
    const hm = new Hammer(this.openOverlay.nativeElement);
    hm.get('pan').set({ direction: Hammer.DIRECTION_RIGHT });
    hm.on('panright', (e: HammerInput) => {
      this.menu.toggle();
      hm.stop(true);
    });
    return hm;
  }

  @onlyOnBrowser('platformId')
  ngOnDestroy() {
    if (this.hammer)this.hammer.destroy();
    if (this.watcher) this.watcher.unsubscribe();
  }

}
