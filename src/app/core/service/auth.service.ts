import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { onlyOnBrowser } from '@shared/decorator/only-on.browser';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { User } from '../model/user.model';
import { BaseHttpService, CollectionHandler } from './base-http.service';
import { environment } from '@env';

@Injectable()
export class AuthService {

  fireUser$: Observable<firebase.User>;

  currentUser$ = new BehaviorSubject<User>(null);
  userHandler: CollectionHandler<User>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _afAuth: AngularFireAuth,
    private _http: BaseHttpService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
    this.userHandler = this._http.collection<User>(`users`);

    // 用來保存當前angularfire的使用者狀態
    this.fireUser$ = this._afAuth.authState;
    // 由於這個Service會永遠存活，我們不需對他做unsubscribe
    this._afAuth.authState
      .switchMap(user => this.updateUser(user))
      .switchMap(key => this.userHandler.document<User>(key).get())
      .subscribe(user => {
        this.returnUrl(user);
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
    return this.signInBySocialMedia(new firebase.auth.GoogleAuthProvider(), 'google');
  }

  signInUpByFacebook() {
    return this.signInBySocialMedia(new firebase.auth.FacebookAuthProvider(), 'facebook');
  }

  signInByEmail(email: string, password: string) {
    this.storeUrl();
    return Observable.fromPromise(this._afAuth.auth.signInWithEmailAndPassword(email, password))
      .catch(err => this.ErrorHandler(err));
  }

  private signInBySocialMedia(provider, type) {
    this.storeUrl();

    return Observable.fromPromise(this._afAuth.auth.signInWithPopup(provider))
      .switchMap(result => {
        const user = result.user;
        return this.addUser(user, type);
      })
      .catch(err => this.ErrorHandler(err));
  }

  @onlyOnBrowser('platformId')
  private storeUrl() {
    const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || '/';
    localStorage.setItem('returnUrl', returnUrl);
  }

  @onlyOnBrowser('platformId')
  private returnUrl(user: User) {
    if (user) {
      const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || localStorage.getItem('returnUrl');
      if (returnUrl) {
        this._router.navigateByUrl(returnUrl);
        localStorage.removeItem('returnUrl');
      }
    }
  }
  // Sends email allowing user to reset password
  resetPassword(oldPassword: string, newPassword: string) {
    // 修改前要再次登入一次
    this.signInByEmail(this._afAuth.auth.currentUser.email, oldPassword)
      .switchMap(() => Observable.fromPromise(this._afAuth.auth.currentUser.updatePassword(newPassword)));
  }

  signOut() {
    return Observable.fromPromise(this._afAuth.auth.signOut())
      .do(() => this._router.navigate(environment.nonAuthenticationUrl));
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
