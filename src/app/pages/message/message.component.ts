import { Component } from '@angular/core';
import { MenuModel } from '@core/model/menu.model';
import { CollectionHandler } from '@core/service/base-http.service';
import { MessageService } from 'app/pages/message/message.service';
import { AutoDestroy } from '@shared/ts/auto.destroy';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent extends AutoDestroy {
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
  users$;
  constructor(private _message: MessageService) {
    super();
    this.users$ = this._message.getNecessaryData()
      .takeUntil(this._destroy$)
      .subscribe();
  }


}
