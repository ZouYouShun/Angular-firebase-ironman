import 'rxjs/add/operator/filter';

import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent,
} from '@angular/router';
import { environment } from '@env';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { RouteLoadingComponent } from '../component/route-loading/route-loading.component';
import { CdkService } from '@shared/service/cdk.service';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';

@Injectable()
export class RouteLoadingService {
  private portalHost: DomPortalHost;
  private insertPortal: ComponentPortal<RouteLoadingComponent>;

  pageChangeEvent = new BehaviorSubject<string>('');

  constructor(
    private _router: Router,
    private _cdk: CdkService,
    private _activatedRoute: ActivatedRoute,
    private _title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.portalHost = _cdk.createBodyPortalHost();
    this.insertPortal = new ComponentPortal(RouteLoadingComponent);
    // never cancel when app is alive
    this._router.events
      // becouse ssr so first time skip show router blockView
      // .skipWhile((event: RouterEvent) => event.id < 2)
      .filter((event: RouterEvent) => event.id !== undefined && event['state'] === undefined)
      .subscribe((event: RouterEvent) => {
        // console.log(event);
        this.navigationInterceptor(event);
      });
  }

  private navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.pageChangeEvent.next(event.url);
      this.block();
    }

    if (
      event instanceof NavigationEnd ||
      event instanceof NavigationCancel ||
      event instanceof NavigationError
    ) {
      this.unblock();
      this.changeTitle();
    }
  }

  @onlyOnBrowser('platformId')
  private block() {
    if (!this.portalHost.hasAttached()) this.portalHost.attach(this.insertPortal);
  }

  @onlyOnBrowser('platformId')
  @runAfterTimeout()
  private unblock() {
    if (this.portalHost.hasAttached()) this.portalHost.detach();
  }

  private changeTitle() {
    let route = this._activatedRoute;
    while (route.firstChild) route = route.firstChild;
    if (route.outlet === 'primary') {
      if (route.snapshot && route.snapshot.data['title'])
        this._title.setTitle(route.snapshot.data['title']);
      // this._title.setTitle(`${environment.websiteTitle.zhTw}-${route.snapshot.data['title']}`);
      else
        this._title.setTitle(environment.websiteTitle.zhTw);
    }
  }
}
