import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/concatMap';

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
          return this.updateUser(user);
        }
        return Observable.of(null);
      })
      .switchMap(key => {
        if (key) {
          return this._http.document<User>(`users/${key}`).get();
        }
        return Observable.of(null);
      });
  }

  // 注意！當註冊後也會更改當前authState，也會接到user，視同於登入
  signUpByEmail(email: string, password: string) {
    return this._afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(user => {
        return this.addUser(user, 'email');
      })
      .catch(err => this.ErrorHandler(err));
  }

  signInUpByGoogle() {
    this._afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(user => {
        return this.addUser(user.user, 'google');
      })
      .catch(err => this.ErrorHandler(err));
  }

  signInByEmail(email: string, password: string) {
    this._afAuth.auth.signInWithEmailAndPassword(email, password)
      .catch(err => this.ErrorHandler(err));
  }

  // Sends email allowing user to reset password
  resetPassword(password: string) {
    // 修改前要再次登入一次
    return this._afAuth.auth.currentUser.updatePassword(password);
  }

  signOut() {
    this._afAuth.auth.signOut();
  }

  private updateUser(user: firebase.User) {
    const data: User = {
      email: user.email,
      photoURL: user.photoURL,
      lastSignInTime: user.metadata.lastSignInTime
    };
    return this.userHandler.update(user.uid, data);
  }

  private addUser(user: firebase.User, types: 'google' | 'email') {
    const data: User = {
      uid: user.uid,
      email: user.email,
      photoURL: user.photoURL,
      lastSignInTime: user.metadata.lastSignInTime,
      type: types
    };
    return this.userHandler.set(data.uid, data);
  }

  private ErrorHandler(err) {
    console.log(err);
  }
}
