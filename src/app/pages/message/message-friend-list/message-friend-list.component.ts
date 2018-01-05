import { Component } from '@angular/core';
import { MessageService } from 'app/pages/message/message.service';

@Component({
  selector: 'app-message-friend-list',
  templateUrl: './message-friend-list.component.html',
  styleUrls: ['./message-friend-list.component.scss']
})
export class MessageFriendListComponent  {

  constructor(public _message: MessageService) {
  }

}
