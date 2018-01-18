import { Injectable } from '@angular/core';
import { UserRoomModel, RoomUsersModel } from '@core/model/room.model';
import { UserModel } from '@core/model/user.model';
import { AuthService } from '@core/service/auth.service';
import { BaseHttpService, DocumentHandler } from '@core/service/base-http.service';
import { arrayToObjectByKey } from '@shared/ts/data/arrayToObjectByKey';
import { QueryFn } from 'angularfire2/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { combineLatest, switchMap, tap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of } from 'rxjs/observable/of';

@Injectable()
export class MessageService {

  back$ = new Subject();
  // 存使用者
  friends$ = new BehaviorSubject<UserModel[]>(null);
  rooms$ = new BehaviorSubject<UserRoomModel[]>(null);
  friendsObj = {}; // Firend To Obj way

  todayZero = new Date().setHours(0, 0, 0, 0);

  myReadStatusHandler: DocumentHandler<RoomUsersModel>;

  private query = new BehaviorSubject<QueryFn>(ref => ref.orderBy('updatedAt', 'desc'));
  constructor(
    private _http: BaseHttpService,
    public _auth: AuthService) {

  }

  getNecessaryData() {
    return merge(
      this._http.collection<UserModel>('users').get().pipe(
        tap(users => {
          // console.log(users);
          this.friendsObj = arrayToObjectByKey(users, 'id');
          this.friends$.next(users);
        })
      ),
      this.query.pipe(
        combineLatest(this._auth.currentUser$.pipe(filter(u => !!u))),
        switchMap(([queryFn, user]) => {
          return this._http.document(`users/${user.id}`).collection<UserRoomModel>('rooms').get({
            queryFn,
            isKey: true
          });
        }),
        tap(rooms => {
          // console.log(rooms);
          this.rooms$.next(rooms);
        })
      )
    );
  }

  goList() {
    this.back$.next();
  }

  setReading() {
    console.log('reading');
    if (this.myReadStatusHandler)
      return this.myReadStatusHandler.update({ isReading: true });
    return of(null);
  }

  setLeave() {
    console.log('leave');
    if (this.myReadStatusHandler)
      return this.myReadStatusHandler.update({ isReading: false });
    return of(null);
  }
}
