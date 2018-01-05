import { Component, OnInit } from '@angular/core';
import { UserRoomModel, RoomModel } from '@core/model/room.model';
import { UserModel } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';
import { Observable } from 'rxjs/Observable';
import { RxViewer } from '@shared/ts/rx.viewer';
import { MessageService } from 'app/pages/message/message.service';

@Component({
  selector: 'app-message-room-list',
  templateUrl: './message-room-list.component.html',
  styleUrls: ['./message-room-list.component.scss']
})
export class MessageRoomListComponent implements OnInit {
  rooms$;

  constructor(
    private _http: BaseHttpService,
    private _auth: AuthService,
    public _message: MessageService) {

    this.rooms$ = this._auth.currentUser$.filter(u => !!u)
      .switchMap((user: UserModel) => {
        return this._http.document(`users/${user.id}`).collection<UserRoomModel[]>('rooms').get();
      })
      .do(d => console.dir(d));
  }

  ngOnInit() {
  }

}
