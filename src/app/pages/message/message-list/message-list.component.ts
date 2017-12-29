import { Component } from '@angular/core';
import { User } from '@core/model/user.model';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent {
  usersHandler: CollectionHandler<{}>;
  users$;
  constructor(private _http: BaseHttpService) {
    this.usersHandler = this._http.collection<User>('users');

    this.users$ = this.usersHandler.get();

  }
}
