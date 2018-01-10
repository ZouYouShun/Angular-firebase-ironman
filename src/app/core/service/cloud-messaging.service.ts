import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseHttpService } from '@core/service/base-http.service';
import { AuthService } from '@core/service/auth.service';

@Injectable()
export class CloudMessagingService {
  messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);
  constructor(private _auth: AuthService, private _http: BaseHttpService) { }

  getPermission() {
    this.messaging.requestPermission()
      .then(() => {
        console.log('允許授權推波!');
        return this.messaging.getToken();
      })
      .then(token => {
        console.log(token);
        this.updateToken(token);
      })
      .catch((err) => {
        console.log('不給推波', err);
      });
  }

  updateToken(token) {
    this._auth.fireUser$.take(1).subscribe(user => {
      if (!user) return;
      this._auth.userHandler.document(user.uid)
        .collection('fcmTokens').set(token, { token: token });
    });
  }

  receiveMessage() {
    this.messaging.onMessage((payload) => {
      console.log('Message received. ', payload);
      this.currentMessage.next(payload);
    });
  }
}
