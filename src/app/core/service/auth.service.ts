import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { User } from '../model/user.model';
import { BaseHttpService, CollectionHandler } from './base-http.service';

@Injectable()
export class AuthService {
  currentUser$ = new BehaviorSubject<User>(null);
  userHandler: CollectionHandler<User>;

  constructor(
    private _afAuth: AngularFireAuth,
    private _http: BaseHttpService,
    private _router: Router,
  ) {
    this.userHandler = this._http.collection<User>(`users`);

    // 由於這個Service會永遠存活，我們不需對她做unsubscribe
    this._afAuth.authState
      .switchMap(user => this.updateUser(user))
      .switchMap(key => this.userHandler.getById(key))
      .subscribe(user => {
        if (user) {
          this._router.navigateByUrl('/');
        }
        this.currentUser$.next(user);
      });
  }

  // 注意！當註冊後也會更改當前authState，也會接到user，視同於登入
  signUpByEmail(email: string, password: string, name: string) {
    return Observable.fromPromise(this._afAuth.auth.createUserWithEmailAndPassword(email, password))
      .switchMap(result => {
        const user = Object.assign({}, result, { displayName: name });
        return this.addUser(user, 'email');
      })
      .do(() => {
        this.signOut();
        this._router.navigateByUrl('/auth/signin');
      })
      .catch(err => this.ErrorHandler(err));
  }

  signInUpByGoogle() {
    return Observable.fromPromise(this._afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()))
      .switchMap(result => {
        const user = result.user;
        return this.addUser(user, 'google');
      })
      .catch(err => this.ErrorHandler(err));
  }

  signInUpByFacebook() {
    return Observable.fromPromise(this._afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()))
      .switchMap(result => {
        const user = result.user;
        return this.addUser(user, 'facebook');
      })
      .catch(err => this.ErrorHandler(err));
  }

  signInByEmail(email: string, password: string) {
    return Observable.fromPromise(this._afAuth.auth.signInWithEmailAndPassword(email, password))
      .catch(err => this.ErrorHandler(err));
  }

  // Sends email allowing user to reset password
  resetPassword(oldPassword: string, newPassword: string) {
    // 修改前要再次登入一次
    this.signInByEmail(this._afAuth.auth.currentUser.email, oldPassword)
      .switchMap(() => Observable.fromPromise(this._afAuth.auth.currentUser.updatePassword(newPassword)));
  }

  signOut() {
    return Observable.fromPromise(this._afAuth.auth.signOut());
  }

  private updateUser(user: firebase.User) {
    if (user) {
      const data: User = {
        email: user.email,
        photoURL: user.photoURL,
        lastSignInTime: user.metadata.lastSignInTime
      };
      return this.userHandler.update(user.uid, data);
    }
    return Observable.of(null);
  }

  private addUser(user: firebase.User, types: 'google' | 'email' | 'facebook') {
    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSignInTime: user.metadata.lastSignInTime,
      type: types
    };
    return this.userHandler.set(data.uid, data);
  }

  private ErrorHandler(err) {
    console.log(err);
    return Observable.of(`Error: ${err}`);
  }
}
