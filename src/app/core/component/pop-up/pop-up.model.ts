import { Type } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export class PopUpModel {
  component: Type<PopUpRef>;
  config?: PopUpConfig;
  sendData?: any;
}

export interface PopUpRef {
  popupTitle?: string;
  popupInputData: PopUpConfig;
  popupOutputSender: Subject<any>;
}

export class PopUpCallback {

  _then: Function = function () { };

  then(afterClosed: Function): void {
    this._then = afterClosed;
  }
}

export class PopUpConfig {
  title?: string;
  /** Data being injected into the child component. */
  data?: any;
  /** Custom class for the overlay pane. */
  panelClass?: string;
  /** Custom class for the backdrop, */
  backdropClass?: string;
  /** style of the dialog. */
  panelStyle?: any;
  /** Layout direction for the dialog's content. */
  disableTitle?: boolean;
  /** Whether the user can use escape or clicking outside to close a modal. */
  disableClose?: boolean;
  disableCloseButton?: boolean;
  disableBackdrop?: boolean;
  /* main window animate */
  windowAnimate?: string;
}
