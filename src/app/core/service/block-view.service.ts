import { DomPortalHost } from '@angular/cdk/portal';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CdkService } from '@shared/service/cdk.service';

import { BlockViewComponent } from '../component/block-view/block-view.component';
import { runAfterTimeout } from '@shared/decorator/timeout.decorator';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';

@Injectable()
export class BlockViewService {
  private portalHost: DomPortalHost;
  private insertPortal: ComponentPortal<BlockViewComponent>;
  private componentRef: ComponentRef<BlockViewComponent>;

  private loadingObj = [];

  constructor(
    private _cdk: CdkService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.portalHost = _cdk.createBodyPortalHost();
    this.insertPortal = new ComponentPortal(BlockViewComponent);
  }

  @onlyOnBrowser('platformId')
  @runAfterTimeout()
  block(title: string = 'loading') {
    if (this.portalHost.hasAttached()) {
      // console.log('push');
      this.loadingObj.push(title);
    } else {
      // console.log('create');
      this.componentRef = this.portalHost.attach(this.insertPortal);
      this.componentRef.instance.title = title;
    }
  }

  @onlyOnBrowser('platformId')
  @runAfterTimeout()
  unblock(cb?: Function) {
    if (cb) cb();

    if (this.loadingObj.length !== 0) {
      this.componentRef.instance.title = this.loadingObj[0];
      this.loadingObj.splice(0, 1);
      // console.log('splice');
    } else {
      this.portalHost.detach();
      // console.log('detach');
    }
  }
}
