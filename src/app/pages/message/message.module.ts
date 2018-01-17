import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { MessageDetialComponent } from './message-detial/message-detial.component';
import { MessageFriendListComponent } from './message-friend-list/message-friend-list.component';
import { MessageHomeComponent } from './message-home/message-home.component';
import { MessageRoomListComponent } from './message-room-list/message-room-list.component';
import { MessageRoutingModule } from './message-routing.module';
import { MessageComponent } from './message.component';
import { MessageService } from './message.service';
import { MessageItemFileComponent } from './message-detial/message-item-file/message-item-file.component';
import { ShowDateComponent } from './show-date/show-date.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MessageRoutingModule
  ],
  declarations: [
    MessageComponent,
    MessageDetialComponent,
    MessageHomeComponent,
    MessageFriendListComponent,
    MessageRoomListComponent,
    MessageItemFileComponent,
    ShowDateComponent
],
  providers: [
    MessageService
  ]
})
export class MessageModule { }
