import { DomPortalHost } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';

@Injectable()
export class CdkService {

  constructor(
    @Inject(DOCUMENT) private document,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector) {
  }

  createBodyPortalHost() {
    return new DomPortalHost(
      this.document.body,
      this.componentFactoryResolver,
      this.appRef,
      this.injector
    );
  }

}
