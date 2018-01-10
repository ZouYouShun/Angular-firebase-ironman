import 'rxjs/add/operator/do';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { UserRoomModel } from '@core/model/room.model';
import { UserModel } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService } from '@core/service/base-http.service';
import { arrayToObjectByKey } from '@shared/ts/data/arrayToObjectByKey';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MessageService {

  private userRooms$: Observable<UserRoomModel[]>;
  private userFriend$: Observable<UserModel[]>;
  // 存使用者
  friends$ = new BehaviorSubject<UserModel[]>(null);
  rooms$ = new BehaviorSubject<UserRoomModel[]>(null);
  friendsObj = {}; // Firend To Obj way
  constructor(
    private _http: BaseHttpService,
    public _auth: AuthService) {

    this.userRooms$ = this._auth.currentUser$.filter(u => !!u)
      .switchMap((user: UserModel) => {
        return this._http.document(`users/${user.id}`).collection<UserRoomModel[]>('rooms').get({
          queryFn: ref => ref.orderBy('updatedAt', 'desc'),
          isKey: true
        });
      })
      .do(rooms => {
        // console.log(rooms);
        this.rooms$.next(rooms);
      });

    this.userFriend$ = this._http.collection<UserModel[]>('users').get()
      .do(users => {
        // console.log(users);
        this.friendsObj = arrayToObjectByKey(users, 'id');
        this.friends$.next(users);
      });
  }

  getNecessaryData() {
    return Observable.merge(
      this.userFriend$,
      this.userRooms$
    );
  }

}
