import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';

import { DomPortalOutlet } from '@angular/cdk/portal';
import {
    AfterContentInit,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    EventEmitter,
    HostBinding,
    HostListener,
    ReflectiveInjector,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { animateFactory } from '@shared/animation';
import { CUBIC_BEZIER, DURATIONS } from '@shared/animation/animate.constant';
import { AutoDestroy } from '@shared/ts/auto.destroy';

import { PopUpCallback, PopUpConfig, PopUpRef } from './pop-up.model';
import { ViewContainerDirective } from './view-container.directive';

@Component({
  selector: 'pop-up-container',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss'],
  animations: [
    animateFactory(`${DURATIONS.short} ${CUBIC_BEZIER.Sharp}`)
  ]
})
export class PopUpComponent extends AutoDestroy implements AfterContentInit {
  @HostBinding('@animate') private animate = 'fadeIn';
  @HostBinding('class') private backdropClass = 'backdrop';
  @ViewChild(ViewContainerDirective) view: ViewContainerDirective;

  portalhost: DomPortalOutlet;
  component: { childComponent: ComponentFactory<any>, refInjector: ReflectiveInjector } | TemplateRef<any>;
  callback: PopUpCallback;
  config: PopUpConfig;

  title: SafeHtml;
  isTemplate = true;
  // private keyExit$: Subscription;
  private sendData: any;
  completeEmitter: EventEmitter<string>;

  constructor(
    private _cfr: ComponentFactoryResolver,
    private _sanitizer: DomSanitizer) {
    super();
  }

  @HostListener('@animate.done', ['$event']) private animateDone(event) {
    // console.log(event);
    if (event.toState === 'void') {
      this.callback._then(this.sendData);
    }
  }

  ngAfterContentInit() {
    this.handelConfig(this.config);
    if (this.component.hasOwnProperty('childComponent')) {
      this.isTemplate = false;
      this.loadComponent(<any>this.component);
    } else {
      this.completeEmitter = new EventEmitter<string>();

      this.completeEmitter
        .takeUntil(this._destroy$)
        .subscribe(data => {
          this.sendData = data;
          this.close();
        });
    }
    this.handelConfig(this.config);
  }

  // handel the pop-up style and class
  private handelConfig(config: PopUpConfig) {
    if (config) {
      if (config.disableBackdrop) this.backdropClass = '';
      if (config.backdropClass) this.backdropClass = config.backdropClass;
      if (config.title) this.title = this._sanitizer.bypassSecurityTrustHtml(config.title);
    }
  }

  // load Dynamin component
  private loadComponent(component: { childComponent: ComponentFactory<any>, refInjector: ReflectiveInjector }) {
    const viewContainerRef = this.view.viewContainerRef;
    // viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent<PopUpRef>
      (component.childComponent, 0, component.refInjector);

    if (this.config) {
      componentRef.instance.popupInputData = this.config.data;
      this.config.title = componentRef.instance.popupTitle;
    }

    // when data send back, close this dialog
    if (componentRef.instance.popupOutputSender) {
      componentRef.instance.popupOutputSender
        .takeUntil(this._destroy$)
        .subscribe((data: any) => {
          this.sendData = data;
          this.close();
        });
    }
  }

  close() {
    this.portalhost.detach();
  }
}
