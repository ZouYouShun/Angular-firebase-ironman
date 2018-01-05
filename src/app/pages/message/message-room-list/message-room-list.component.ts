import { Component } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { MessageService } from 'app/pages/message/message.service';

@Component({
  selector: 'app-message-room-list',
  templateUrl: './message-room-list.component.html',
  styleUrls: ['./message-room-list.component.scss']
})
export class MessageRoomListComponent  {

  constructor(
    public _auth: AuthService,
    public _message: MessageService) {
  }


}
