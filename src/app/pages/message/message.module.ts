import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessageRoutingModule } from './message-routing.module';
import { MessageComponent } from './message.component';
import { MessageListComponent } from './message-list/message-list.component';
import { SharedModule } from '@shared/shared.module';
import { MessageDetialComponent } from './message-detial/message-detial.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MessageRoutingModule
  ],
  declarations: [
    MessageComponent,
    MessageListComponent,
    MessageDetialComponent
]
})
export class MessageModule { }
