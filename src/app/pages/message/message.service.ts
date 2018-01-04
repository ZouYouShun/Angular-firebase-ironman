import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { MessageModel } from '@core/model/message';
import { RoomModel } from '@core/model/room.model';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';

@Injectable()
export class MessageService {

  private roomsHandler: CollectionHandler<RoomModel>;
  private messageHandler: CollectionHandler<MessageModel>;
  constructor(
    private _http: BaseHttpService, ) {
    this.roomsHandler = this._http.collection('rooms');
  }

  getRoomMessages(params) {

  }

}
