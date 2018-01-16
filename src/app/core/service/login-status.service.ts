import { Injectable } from '@angular/core';
import { BaseHttpService } from '@core/service/base-http.service';
import { map, tap, filter, combineLatest, skipWhile } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AuthService } from './auth.service';
import { isOnlineForDatabase, isOfflineForDatabase } from '../model/login.model';
import { dbTimeObject } from '@core/service/base-http.service/model/realtime-database/db.time.function';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class LoginStatusService {

  private _disconnection: firebase.database.OnDisconnect;

  constructor(private _http: BaseHttpService, private _auth: AuthService) {

    // this state never stop
    this._auth.currentUser$.pipe(
      skipWhile(u => !!u),
      combineLatest(this._http.object('.info/connected').get()),
      tap(([user, connected]) => {
        // console.log('get user', user);
        if (user && !this._disconnection) {
          // console.log('登入!');
          const userStatusDatabaseRef = firebase.database().ref('/status/' + user.uid);
          userStatusDatabaseRef.set(dbTimeObject({ state: true }, false))
            .then(() => {
              // console.log('update login');
              this._disconnection = userStatusDatabaseRef.onDisconnect();
              return this._disconnection.set(dbTimeObject({ state: false }, false));
            })
            .catch(e => console.log(e));

        } else if (!user && this._disconnection) {
          // console.log('取消');
          this._disconnection.cancel();
          this._disconnection = undefined;
        }
      })
    ).subscribe();
  }
}
