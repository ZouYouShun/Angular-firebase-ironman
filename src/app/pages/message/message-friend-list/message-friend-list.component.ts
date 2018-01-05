import { Component, OnInit } from '@angular/core';
import { UserModel } from '@core/model/user.model';
import { MessageService } from 'app/pages/message/message.service';

@Component({
  selector: 'app-message-friend-list',
  templateUrl: './message-friend-list.component.html',
  styleUrls: ['./message-friend-list.component.scss']
})
export class MessageFriendListComponent implements OnInit {

  friends$;
  constructor(private _message: MessageService) {
    this.friends$ = this._message.friends$;
  }

  ngOnInit() {
  }

}
