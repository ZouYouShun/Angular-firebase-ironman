import { Component, OnInit } from '@angular/core';
import { UserModel } from '@core/model/user.model';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';

@Component({
  selector: 'app-message-room-list',
  templateUrl: './message-room-list.component.html',
  styleUrls: ['./message-room-list.component.scss']
})
export class MessageRoomListComponent implements OnInit {

  usersHandler: CollectionHandler<{}>;
  users$;
  constructor(private _http: BaseHttpService) {
    this.usersHandler = this._http.collection<UserModel>('users');

    this.users$ = this.usersHandler.get(); }

  ngOnInit() {
  }

}
