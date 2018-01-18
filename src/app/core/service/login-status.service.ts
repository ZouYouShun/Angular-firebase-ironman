import { Injectable } from '@angular/core';
import { BaseHttpService } from '@core/service/base-http.service';
import { map, tap, filter, combineLatest, skipWhile, switchMap } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AuthService } from './auth.service';
import { dbTimeObject } from '@core/service/base-http.service/model/realtime-database/db.time.function';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { RxViewer } from '@shared/ts/rx.viewer';
import { catchError } from 'rxjs/operators/catchError';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';


@Injectable()
export class LoginStatusService {

  private _disconnection: firebase.database.OnDisconnect;

  userFocusStatus$ = new BehaviorSubject<boolean>(false);

  constructor(private _http: BaseHttpService, private _auth: AuthService) {

    // this state never stop
    this._auth.currentUser$.pipe(
      skipWhile(u => !!u),
      // tap(u => console.log(u)),
      switchMap(u => this._http.object('.info/connected').get(false), (user, connected) => {
        // console.log('connected', connected);
        if (connected && user && !this._disconnection) {

          const userStatusDatabaseRef = firebase.database().ref('/status/' + user.uid);
          this._disconnection = userStatusDatabaseRef.onDisconnect();

          this._disconnection.set(dbTimeObject({ state: false }, false))
            .then(() => {
              // console.log('寫入狀態');
              // console.log('update login');
              return userStatusDatabaseRef.set(dbTimeObject({ state: true }, false));
            })
            .catch(e => console.log(e));
        } else if ((!connected || !user) && this._disconnection) {
          // console.log('取消寫入');
          this._disconnection.cancel();
          this._disconnection = undefined;
        }
      })
    ).subscribe();
  }

  changeFocus(status: boolean) {
    this.userFocusStatus$.next(status);
  }
}
