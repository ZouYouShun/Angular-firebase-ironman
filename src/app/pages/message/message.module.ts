import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessageRoutingModule } from './message-routing.module';
import { MessageComponent } from './message.component';
import { SharedModule } from '@shared/shared.module';
import { MessageDetialComponent } from './message-detial/message-detial.component';
import { MessageHomeComponent } from './message-home/message-home.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MessageRoutingModule
  ],
  declarations: [
    MessageComponent,
    MessageDetialComponent,
    MessageHomeComponent
]
})
export class MessageModule { }
