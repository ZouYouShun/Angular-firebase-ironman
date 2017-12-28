import { DIALOG_TYPE } from './alert-confirm.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { PopUpConfig, PopUpRef } from '../pop-up/pop-up.model';

@Component({
  selector: 'app-alert-confirm',
  templateUrl: './alert-confirm.component.html',
  styleUrls: ['./alert-confirm.component.scss']
})
export class AlertConfirmComponent implements OnInit, PopUpRef {
  @Input() popupInputData: { data: any, type: DIALOG_TYPE };
  public popupOutputSender = new Subject();

  public classList = {
    success: {
      icon: 'check circle' // cycle ˇ
    },
    warning: {
      icon: 'warning' // triangle !
    },
    info: {
      icon: 'info'  // cycle !
    },
    error: {
      icon: 'highlight_off'  // cycle x
    }
  };
  constructor() { }

  ngOnInit() {
    if (!this.popupInputData.data.type) {
      this.popupInputData.data.type = 'info';
    }
  }

  ok() {
    this.popupOutputSender.next(true);
  }

  cancel() {
    this.popupOutputSender.next(false);
  }
}
