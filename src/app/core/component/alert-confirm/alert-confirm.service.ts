import { Injectable, Injector, ComponentFactoryResolver } from '@angular/core';

import { PopUpService } from '../pop-up/pop-up.service';
import { AlertConfirmComponent } from './alert-confirm.component';
import { AlertCallback, AlertConfirmModel, ConfirmCallback } from './alert-confirm.model';

export enum DIALOG_TYPE {
  ALERT = 'alert',
  CONFIRM = 'confirm'
}

@Injectable()
export class AlertConfirmService {

  private alertCallback: AlertCallback;
  private confirmCallback: ConfirmCallback;
  constructor(
    private _pop: PopUpService,
    private _factory: ComponentFactoryResolver,
    private _injector: Injector) { }

  confirm(obj: AlertConfirmModel | string): ConfirmCallback {
    this.openDialog(obj, DIALOG_TYPE.CONFIRM);
    this.confirmCallback = new ConfirmCallback();
    return this.confirmCallback;
  }

  alert(obj: AlertConfirmModel | string): AlertCallback {
    this.openDialog(obj, DIALOG_TYPE.ALERT);
    this.alertCallback = new AlertCallback();
    return this.alertCallback;
  }

  private openDialog(obj: AlertConfirmModel | string, type: DIALOG_TYPE): void {

    if (typeof (obj) === 'string') {
      obj = new AlertConfirmModel(null, obj);
    }
    let animate;
    switch (obj.type) {
      case 'success':
      case 'info':
        animate = 'zoomIn';
        break;
      case 'warning':
      case 'error':
        animate = 'bounceInDown';
        break;
    }

    const component = this._pop.createComponent(AlertConfirmComponent, this._factory, this._injector);

    this._pop
      .open(component, {
        data: {
          data: obj,
          type: type
        },
        disableClose: obj.disableClose,
        disableTitle: true,
        disableCloseButton: true,
        backdropClass: 'backdrop center',
        panelStyle: {
          // height: '50%',
          width: '50%',
        },
        windowAnimate: animate
      }).then((result: boolean) => {
        // console.log(result);
        if (type === DIALOG_TYPE.CONFIRM) {
          if (!result) {
            return this.confirmCallback._cancel();
          }
          return this.confirmCallback._ok();
        }
        return this.alertCallback._ok();
      });
  }
}
