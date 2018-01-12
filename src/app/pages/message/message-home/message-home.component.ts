import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-message-home',
  templateUrl: './message-home.component.html',
  styleUrls: ['./message-home.component.scss']
})
export class MessageHomeComponent implements OnInit {

  constructor(public _message: MessageService) {
    this._message.back$.next();
  }

  ngOnInit() {
  }

}
