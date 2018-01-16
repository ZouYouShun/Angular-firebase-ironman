import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';
import { Observable } from 'rxjs/Observable';

import { RouteLoadingService } from './route-loading.service';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { tap } from 'rxjs/operators';

@Injectable()
export class BaseService {
  pageChangeScroll$: Observable<any>;
  mainScrollTopEvent: Observable<number>;

  private _mainViewElm: HTMLAnchorElement;
  private page: { url: string, scroll: number }[] = [];

  private set mainViewElm(elm) {
    this.mainScrollTopEvent = fromEvent(elm, 'scroll', (e: any) => e.target.scrollTop);
    // if the elm is exist unsubscribe prev, and do the next elm observable
    this._mainViewElm = elm;
    this.doRememberPage();
  }
  private get mainViewElm() {
    return this._mainViewElm;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _pageChange: RouteLoadingService,
    private _title: Title
  ) { }

  setMainView(elm: HTMLAnchorElement) {
    this.mainViewElm = elm;
    return this.mainScrollTopEvent;
  }

  setTitle(title: string, notAdd: boolean = false) {
    this._title.setTitle(notAdd ?
      title :
      this._title.getTitle() + `-${title}`);
  }

  @onlyOnBrowser('platformId')
  private doRememberPage() {
    this.pageChangeScroll$ = this._pageChange.pageChangeEvent.pipe(
      tap(url => {
        const top = this.mainViewElm.scrollTop;
        if (this.page[0] && url === this.page[0].url) {
          this.goScroll();
        } else {
          this.mainViewElm.scroll({ top: 0 });
        }
        this.pushPage(url, top);
      })
    );
  }

  private pushPage(url: string, top: number) {
    if (this.page.length >= 2) this.page.splice(0, 1);
    this.page.push({ url: url, scroll: top });
  }

  @runAfterTimeout(150)
  private goScroll() {
    const to = this.page[0].scroll;
    if (to > this.mainViewElm.scrollHeight) {
      this.mainViewElm.scroll({ top: 0 });
    }
    this.mainViewElm.scroll({ top: this.page[0].scroll });
  }

}
