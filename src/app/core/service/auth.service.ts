import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

import { User } from '../model/user.model';
import { AngularFirestore } from 'angularfire2/firestore';
import { BaseHttpService, CollectionHandler } from './base-http.service';

@Injectable()
export class AuthService {
  user$: Observable<User>;
  userHandler: CollectionHandler<User>;

  constructor(
    private _afAuth: AngularFireAuth,
    private _http: BaseHttpService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
    this.userHandler = this._http.collection<User>(`users`);

    this.user$ = this._afAuth.authState
      .switchMap(user => {
        if (user) {
          return this.userHandler.getById(user.uid);
        }
        return Observable.of(null);
      });
  }

  signUpEmail(email: string, psd: string) {
    return this._afAuth.auth.createUserWithEmailAndPassword(email, psd)
      .then(user => {
        return this.addUser(user);
      })
      .catch(err => this.ErrorHandler(err));
  }

  editUser(user: User, data: any) {
    return this.userHandler.update(user.uid, data);
  }

  private ErrorHandler(err) {
    console.log(err);
  }

  private addUser(user) {
    const data: User = {
      uid: user.uid,
      email: user.email
    };
    return this.userHandler.set(user.uid, data);
  }

}
