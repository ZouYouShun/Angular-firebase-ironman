import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { UserModel } from '@core/model/user.model';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { BaseHttpService, DocumentHandler, CollectionHandler } from './base-http.service';
import { RxViewer } from '@shared/ts/rx.viewer';
import { map, take, tap, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';

const tokenName = 'fcmToken';
@Injectable()
export class CloudMessagingService {
  private fcmTockenHandler: DocumentHandler<{}>;
  private token: string;
  messaging = firebase.messaging();
  currentMessage$ = new BehaviorSubject(null);

  constructor(
    private _http: BaseHttpService,
    @Inject(PLATFORM_ID) private platformId: Object) { }

  @onlyOnBrowser('platformId')
  getPermission(user: DocumentHandler<UserModel>) {
    return fromPromise(
      this.messaging.requestPermission().then(() => {
        // console.log('允許授權推波!');
        return this.messaging.getToken();
      })).pipe(
      switchMap(token => {
        // console.log(token);
        this.token = token;
        return this.saveTokenLocal(token, user.collection('fcmTokens'));
      }),
      switchMap(() => {
        // console.log('set');
        this.fcmTockenHandler = user.collection('fcmTokens').document(this.token);
        return this.fcmTockenHandler.set({
          token: this.token,
          userAgent: navigator.userAgent
        });
      }),
      catchError((err) => {
        // console.log('不給推波', err);
        return Observable.throw(new Error('不給推波'));
      }));
  }

  saveTokenLocal(token, tokensRef: CollectionHandler<{}>) {
    const localToken = localStorage.getItem(tokenName);
    const userAgent = navigator.userAgent;

    localStorage.setItem(tokenName, token);
    // if is empty, it maybe first or delete
    if (!localToken) {
      // 取得這個人所有的token，把所有userAgent相同的刪除
      // console.log('!');
      return tokensRef.get({ isKey: true, queryFn: ref => ref.where('userAgent', '==', userAgent) }).pipe(
        take(1),
        map((tokens: any[]) => tokens.filter(obj => obj.id !== token)
          .map((i: any) => tokensRef.delete(i.id))
        )
      );

    } else if (localToken !== token) {
      // if the old is not same of now token, delete the old token
      return tokensRef.delete(localToken);
    }
    return Observable.of(null);
  }

  receiveMessage() {
    this.messaging.onMessage((payload) => {
      // console.log('Message received. ', payload);
      this.currentMessage$.next(payload);
    });
  }

  @onlyOnBrowser('platformId')
  deleteToken() {
    return this.fcmTockenHandler.delete().pipe(
      tap(() => localStorage.removeItem(tokenName)),
      mergeMap(() => fromPromise(this.messaging.deleteToken(this.token)))
    );
  }
}
