import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessageComponent } from './message.component';
import { MessageDetialComponent } from './message-detial/message-detial.component';

const routes: Routes = [
  {
    path: '',
    component: MessageComponent,
    children: [
      {
        path: '',
        component: MessageDetialComponent
      },
      {
        path: ':id',
        component: MessageDetialComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
