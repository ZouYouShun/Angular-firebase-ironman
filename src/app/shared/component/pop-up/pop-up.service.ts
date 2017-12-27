import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentFactory, Injectable, ReflectiveInjector, TemplateRef, Type, ComponentFactoryResolver, Injector } from '@angular/core';
import { CdkService } from '@shared/service/cdk.service';

import { PopUpComponent } from './pop-up.component';
import { PopUpCallback, PopUpConfig, PopUpRef } from './pop-up.model';

@Injectable()
export class PopUpService {

  constructor(private _cdk: CdkService) { }

  open(component: TemplateRef<any> |
    { childComponent: ComponentFactory<any>, refInjector: ReflectiveInjector }
    , config: PopUpConfig = {}) {

    const portalhost = this._cdk.createBodyPortalHost();
    const callBack = new PopUpCallback();

    // const insertPortal = new ComponentPortal(component);
    const componentRef = portalhost.attach(new ComponentPortal(PopUpComponent));
    componentRef.instance.portalhost = portalhost;
    componentRef.instance.component = component;
    componentRef.instance.callback = callBack;
    componentRef.instance.config = config;

    return callBack;
  }

  createComponent(component: Type<PopUpRef>, factory: ComponentFactoryResolver, injector: Injector) {
    const childComponent = factory.resolveComponentFactory(component);
    const refInjector = ReflectiveInjector.resolveAndCreate(
      [{ provide: component, useValue: component }], injector);
    return {
      childComponent: childComponent,
      refInjector: refInjector
    };
  }

}
