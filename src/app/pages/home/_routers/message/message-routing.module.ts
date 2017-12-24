import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessageComponent } from './message.component';
import { MessageListComponent } from './message-list/message-list.component';

const routes: Routes = [
  {
    path: '',
    component: MessageComponent,
    children: [
      {
        path: '',
        component: MessageListComponent,
        data: {
          title: '最新消息'
        },
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
