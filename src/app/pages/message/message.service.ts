import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { UserModel } from '@core/model/user.model';
import { BaseHttpService, CollectionHandler } from '@core/service/base-http.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class MessageService {

  private usersHandler: CollectionHandler<UserModel[]>;

  // 存使用者
  friends$ = new BehaviorSubject<UserModel[]>(null);
  friendsObj;
  constructor(private _http: BaseHttpService) {
    this.usersHandler = this._http.collection<UserModel[]>('users');
  }

  getFriend() {
    return this.usersHandler.get()
      .do(users => {
        // console.log(users);
        this.friendsObj = this.usersToObject(users);
        // console.log(this.friend);
        this.friends$.next(users);
      });
  }

  private usersToObject(array: any[]) {
    const rv = {};
    array.forEach(item => {
      rv[item.id] = item;
    });
    return rv;
  }

}
