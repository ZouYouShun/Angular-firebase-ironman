import { Component, ViewChild } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { MatDrawer } from '@angular/material';
import { AuthService } from '@core/service/auth.service';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { MessageService } from 'app/pages/message/message.service';
import { UserRoomModel } from '@core/model/room.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StringHandler } from '@shared/ts/data/string.handler';
import { UserModel } from '@core/model/user.model';
import { Observable } from 'rxjs/Observable';
import { tap, takeUntil } from 'rxjs/operators';
import { merge } from 'rxjs/observable/merge';

@Component({
  selector: 'app-message-room-list',
  templateUrl: './message-room-list.component.html',
  styleUrls: ['./message-room-list.component.scss']
})
export class MessageRoomListComponent extends AutoDestroy {
  @ViewChild('roomList') roomList: MatDrawer;

  searchInput = '';

  room$: BehaviorSubject<UserRoomModel[]>;
  rooms: any[];
  originRooms: any[];

  constructor(
    public _auth: AuthService,
    public _message: MessageService,
    private _media: ObservableMedia) {
    super();

    merge(
      this._message.rooms$.pipe(
        tap(rooms => {
          this.originRooms = this.rooms = rooms;
        })
      ),
      this._message.back$.pipe(
        tap(() => {
          this.roomList.open();
        }))
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  toggleList() {
    if (this._media.isActive('lt-sm')) {
      this.roomList.toggle();
    }
  }

  reset() {
    this.rooms = [...this.originRooms];
  }

  searchRoom(title: string) {
    this.rooms = [...this.originRooms];
    if (!new StringHandler(title).isEmpty()) {
      return this.rooms = this.rooms.filter(room => {
        const user: UserModel = this._message.friendsObj[room.id];
        if (user) {
          const name = `${user.displayName}`;
          return name.includes(title);
        }
        return false;
      });
    }
  }

}
