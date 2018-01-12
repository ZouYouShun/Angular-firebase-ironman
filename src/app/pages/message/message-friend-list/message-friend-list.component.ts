import { Component, ViewChild } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { MatDrawer } from '@angular/material';
import { AutoDestroy } from '@shared/ts/auto.destroy';

import { MessageService } from '../message.service';

@Component({
  selector: 'app-message-friend-list',
  templateUrl: './message-friend-list.component.html',
  styleUrls: ['./message-friend-list.component.scss']
})
export class MessageFriendListComponent extends AutoDestroy {
  @ViewChild('roomList') roomList: MatDrawer;

  constructor(public _message: MessageService,
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
