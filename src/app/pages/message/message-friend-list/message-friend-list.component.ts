import { Component, ViewChild } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { MatDrawer } from '@angular/material';
import { AutoDestroy } from '@shared/ts/auto.destroy';

import { MessageService } from '../message.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { StringHandler } from '@shared/ts/data/string.handler';
import { UserModel } from '@core/model/user.model';

@Component({
  selector: 'app-message-friend-list',
  templateUrl: './message-friend-list.component.html',
  styleUrls: ['./message-friend-list.component.scss']
})
export class MessageFriendListComponent extends AutoDestroy {
  @ViewChild('roomList') roomList: MatDrawer;

  searchInput = '';

  friends: UserModel[];
  private originFriends: UserModel[];

  constructor(
    private _message: MessageService,
    private _media: ObservableMedia) {
    super();

    Observable
      .merge(
      this._message.friends$
        .do(friends => {
          this.originFriends = this.friends = friends;
        }),
      this._message.back$.do(() => {
        this.roomList.open();
      }))
      .takeUntil(this._destroy$)
      .subscribe();
  }

  toggleList() {
    if (this._media.isActive('lt-sm')) {
      this.roomList.toggle();
    }
  }

  reset() {
    this.friends = [...this.originFriends];
  }

  searchRoom(title: string) {
    this.friends = [...this.originFriends];
    if (!new StringHandler(title).isEmpty()) {
      return this.friends = this.friends.filter(user => {
        const name = `${user.displayName}`;
        return name.includes(title);
      });
    }
  }
}
