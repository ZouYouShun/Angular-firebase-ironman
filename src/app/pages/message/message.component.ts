import 'rxjs/add/operator/takeUntil';

import { Component, OnInit } from '@angular/core';
import { MenuModel } from '@core/model/menu.model';
import { BaseHttpService } from '@core/service/base-http.service';
import { AutoDestroy } from '@shared/ts/auto.destroy';
import { MessageService } from 'app/pages/message/message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent extends AutoDestroy implements OnInit {
  menus: MenuModel[] = [
    {
      icon: 'message',
      url: 'r',
      title: 'message'
    },
    {
      icon: 'person',
      url: 'friend',
      title: 'friend'
    },
    // {
    //   icon: 'people',
    //   url: 'group',
    //   title: 'group'
    // },
    // {
    //   icon: 'person_add',
    //   url: 'add-friend',
    //   title: 'add friend'
    // }
  ];
  constructor(
    private _http: BaseHttpService, private _message: MessageService) {
    super();
    this._message.getNecessaryData()
      .takeUntil(this._destroy$)
      .subscribe();
  }

  ngOnInit(): void {
  }

  toggleList() {
    this._message.back$.next();
  }
}
