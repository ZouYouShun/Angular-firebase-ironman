import { Component, OnInit } from '@angular/core';
import { UserModel } from '@core/model/user.model';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';

@Component({
  selector: 'app-message-friend-list',
  templateUrl: './message-friend-list.component.html',
  styleUrls: ['./message-friend-list.component.scss']
})
export class MessageFriendListComponent implements OnInit {

  usersHandler: CollectionHandler<{}>;
  users$;
  constructor(private _http: BaseHttpService) {
    this.usersHandler = this._http.collection<UserModel[]>('users');

    this.users$ = this.usersHandler.get();
  }

  ngOnInit() {
  }

}
