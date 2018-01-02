import { Component } from '@angular/core';
import { MenuModel } from '@core/model/menu.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  menus: MenuModel[] = [
    {
      icon: 'message',
      url: 't',
      title: 'message'
    },
    {
      icon: 'person',
      url: [{ outlets: { right: ['add-friend'] } }],
      title: 'friend'
    },
    {
      icon: 'people',
      url: 'group',
      title: 'group'
    },
    {
      icon: 'person_add',
      url: 'add-friend',
      title: 'add friend'
    }
  ];
  constructor() {

  }

}
