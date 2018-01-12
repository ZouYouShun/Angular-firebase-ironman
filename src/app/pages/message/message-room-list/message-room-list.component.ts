import 'rxjs/add/operator/takeUntil';

import { Component, ViewChild } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { MatDrawer } from '@angular/material';
import { AuthService } from '@core/service/auth.service';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { MessageService } from 'app/pages/message/message.service';

@Component({
  selector: 'app-message-room-list',
  templateUrl: './message-room-list.component.html',
  styleUrls: ['./message-room-list.component.scss']
})
export class MessageRoomListComponent extends AutoDestroy {
  @ViewChild('roomList') roomList: MatDrawer;

  constructor(
    public _auth: AuthService,
    public _message: MessageService,
    private _media: ObservableMedia) {
    super();
    this._message.back$
      .takeUntil(this._destroy$)
      .subscribe(() => {
        this.roomList.open();
      });
  }

  toggleList() {
    if (this._media.isActive('lt-sm')) {
      this.roomList.toggle();
    }
  }

}
