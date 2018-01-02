import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessageRoomListComponent } from './message-room-list/message-room-list.component';

import { MessageDetialComponent } from './message-detial/message-detial.component';
import { MessageFriendListComponent } from './message-friend-list/message-friend-list.component';
import { MessageHomeComponent } from './message-home/message-home.component';
import { MessageComponent } from './message.component';

const routes: Routes = [
  {
    path: '',
    component: MessageComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'r'
      },
      {
        path: 'r',
        component: MessageRoomListComponent,
        children: [
          {
            path: '',
            component: MessageHomeComponent
          },
          {
            path: ':id',
            component: MessageDetialComponent
          }
        ]
      },
      {
        path: 'u',
        component: MessageFriendListComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
